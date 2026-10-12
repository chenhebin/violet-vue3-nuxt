import { createFetch } from 'ofetch'
import type { Ref } from 'vue'
import { ApiError } from '~/api/error'

/**
 * 传输层组合式：造一个网关客户端，也负责往外发这个客户端。
 * 只管"传输"这一件事——每个请求动态塞头、收到响应拆信封、报错统一成一种错误格式
 * （错误体系运行时在 ~/api/error.ts）。跟业务无关。
 * 拆成两层：
 * - createGatewayClient：纯工厂（useApi 即传输门面，显式 import ofetch 供应商合规），
 *   不依赖任何需要组件 setup 上下文的 composable，单测用注入的 fetch 桩直接造
 *   （tests/unit/composables/useApi.spec.ts）
 * - useApi：门面薄壳，从 Nuxt 上下文取 runtimeConfig 与设备后调工厂
 */

/** 网关客户端工厂的注入项（组合根装配 / 单测注桩都从这里进） */
export interface GatewayClientOptions {
  /** 网关基地址（runtimeConfig.public.apiBase） */
  baseURL: string
  /** 请求超时毫秒数，默认 10 秒 */
  timeout?: number
  /** 设备标识 Ref → x-v-device 头 */
  device: Ref<string>
  /** 语言 Ref → accept-language 头（不传则不塞） */
  locale?: Ref<string>
  /** 凭据 Ref → authorization: Bearer 头（不传则不塞） */
  token?: Ref<string | null>
  /** mock 演示场景 Ref → ?scene= query（唯一注入位在组合根 plugins/api.ts，接真后端时整体拔掉） */
  scene?: Ref<string>
  /** fetch 实现（单测注桩用；缺省用全局 fetch） */
  fetch?: typeof globalThis.fetch
}

/**
 * 造网关客户端（纯工厂，可脱离 Nuxt 上下文运行）。
 * onRequest 塞头 + scene 注入；onResponse 拆信封（code≠0 抛 business）；
 * onRequestError / onResponseError 把传输失败归一成 ApiError 的四种 kind。
 */
export function createGatewayClient(options: GatewayClientOptions) {
  const { baseURL, timeout = 10_000, device, locale, token, scene, fetch: fetchImpl } = options

  return createFetch({
    fetch: fetchImpl,
    defaults: {
      baseURL,
      timeout,
      onRequest({ options: fetchOptions }) {
        const headers = new Headers(fetchOptions.headers)
        headers.set('x-v-device', device.value)
        if (locale?.value) headers.set('accept-language', locale.value)
        if (token?.value) headers.set('authorization', `Bearer ${token.value}`)
        fetchOptions.headers = headers
        // mock 演示开关：组合根从 URL query 读 scene 传进来，传输层统一注入（业务签名零 scene）
        if (scene?.value) fetchOptions.query = { ...fetchOptions.query, scene: scene.value }
      },
      onResponse({ response }) {
        if (!response.ok) return
        const body: unknown = response._data
        if (!isEnvelope(body)) return
        if (body.code !== 0) {
          throw new ApiError('business', body.code, body.message ?? 'business error', { traceId: body.traceId })
        }
        response._data = body.data
      },
      onRequestError({ error }) {
        throw new ApiError('network', 0, error?.message ?? 'network error', { cause: error })
      },
      onResponseError({ response }) {
        const body: unknown = response?._data
        const message = isEnvelope(body) ? body.message ?? '' : `HTTP ${response?.status ?? 0}`
        if (response?.status === 401) {
          throw new ApiError('auth', 401, message || 'unauthorized')
        }
        throw new ApiError('http', response?.status ?? 0, message || 'http error', { traceId: isEnvelope(body) ? body.traceId : undefined })
      }
    }
  })
}

/**
 * 传输门面：从 Nuxt 上下文补齐基地址与设备后造客户端；token / locale / scene 仍由组合根注入。
 * SSR 期相对 baseURL（'/api'）undici 解析不了（Nuxt 全局 $fetch 的进程内解析在纯 ofetch 工厂里没有）——
 * 拼上请求 origin 走回环；客户端保持相对（同源请求）
 * @param options 调用方注入的 token/locale/scene Ref（组合根传入，不传则不塞对应请求头）
 */
export function useApi(options?: { token?: Ref<string | null>; locale?: Ref<string>; scene?: Ref<string> }) {
  const config = useRuntimeConfig()
  const { device } = useDevice()
  const baseURL = import.meta.server
    ? `${useRequestURL().origin}${config.public.apiBase}`
    : config.public.apiBase
  return createGatewayClient({ baseURL, device, ...options })
}

/**
 * 取组合根注入好的网关客户端（业务代码一律用它，别在视图层直接 $fetch——有 lint 门禁拦着）
 */
export function useApiClient() {
  return useNuxtApp().$apiClient
}

/**
 * 判断响应体是不是信封格式（传输内部细节，不出本模块）
 * @param body 响应体
 */
function isEnvelope(body: unknown): body is ApiEnvelope {
  return !!body && typeof body === 'object' && 'code' in body && 'data' in body
}
