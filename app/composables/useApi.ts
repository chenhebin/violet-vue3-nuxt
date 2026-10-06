import type { Ref } from 'vue'
import { ApiError } from '~/api/error'

/**
 * 传输层组合式：造一个网关客户端，也负责往外发这个客户端。
 * 只管"传输"这一件事——每个请求动态塞头、收到响应拆信封、报错统一成一种错误格式
 * （错误体系运行时在 ~/api/error.ts）。
 * 跟业务无关；token / locale 由调用方（组合根）用 Ref 传进来，本层不管它们从哪来，
 * 也不依赖任何需要组件 setup 上下文的 composable（所以在插件里调用也是安全的）。
 * @param options 调用方注入的 token/locale Ref（组合根传入，不传则不塞对应请求头）
 */

export function useApi(options?: { token?: Ref<string | null>; locale?: Ref<string> }) {
  const config = useRuntimeConfig()
  const { device } = useDevice()
  const token = options?.token
  const locale = options?.locale

  return $fetch.create({
    baseURL: config.public.apiBase,
    timeout: 10_000,
    onRequest({ options: fetchOptions }) {
      const headers = new Headers(fetchOptions.headers)
      headers.set('x-v-device', device.value)
      if (locale?.value) headers.set('accept-language', locale.value)
      if (token?.value) headers.set('authorization', `Bearer ${token.value}`)
      fetchOptions.headers = headers
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
  })
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
