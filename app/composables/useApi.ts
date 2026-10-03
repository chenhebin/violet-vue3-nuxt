import type { Ref } from 'vue'

/**
 * 传输层组合式：网关客户端工厂与取用器。
 * 只做「传输」——动态头注入 + 信封解包 + 错误归一化（错误体系运行时见 utils/api-error.ts）。
 * 业务无关；token / locale 由调用方（组合根）以 Ref 注入，本层不关心其来源，
 * 也不依赖任何需要组件 setup 上下文的 composable（插件中可安全调用）。
 * @param options 选项
 * @returns 网关客户端
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

/** 取组合根注入的网关客户端（业务代码一律用它，禁止在视图层直接 $fetch——有 lint 门禁） */
export function useApiClient() {
  return useNuxtApp().$apiClient
}

/** 信封形状判别（传输内部细节，不出模块） */
function isEnvelope(body: unknown): body is ApiEnvelope {
  return !!body && typeof body === 'object' && 'code' in body && 'data' in body
}
