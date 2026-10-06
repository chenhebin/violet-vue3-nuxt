// 错误体系的运行时部分（传输层公共件，不属于任何业务域，所以不放域格子目录）。
// 三级归属：本文件放能跑的代码（ApiError 类、转换器、形状级文案表）；
// shared/types/api.ts 放纯类型（Kind/Snapshot/Outcome，只有编译时用）；
// composables/useApi.ts 是唯一生产 ApiError 的地方（拦截器里造，和信封解包在一处）。
// 以后做错误上报（Sentry 那类）、给 traceId 加料，都在本文件里长，别去动传输层。
// 注意：api/ 目录不在 auto-import 里——用的人要显式 import '~/api/error'（跟 AUTH_ERROR_I18N 的既有模式一致）。

// 全站唯一的错误类：协议层归一化后的产物。上层只见它，永远不接触 FetchError
export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly code: number
  readonly traceId?: string
  constructor(kind: ApiErrorKind, code: number, message: string, options?: { cause?: unknown; traceId?: string }) {
    super(`[${kind}:${code}] ${message}`, options)
    this.name = 'ApiError'
    this.kind = kind
    this.code = code
    this.traceId = options?.traceId
  }
}

// 错误形状 → 通用横幅文案的 i18n key。satisfies 保证穷尽：新增 kind 不补译，编译就过不去
export const API_ERROR_BANNER_I18N = {
  network: 'error.network',
  http: 'error.http',
  business: 'error.fallback',
  auth: 'error.fallback'
} satisfies Record<ApiErrorKind, string>

/**
 * 把「可能抛 ApiError 的异步调用」包成 AsyncOutcome 数据。
 * 各域 composable 在 useAsyncData 回调里统一走这里，
 * 不许自己手写 try/catch 拼快照（防止形态走样、漏字段）。
 * @param task 可能抛 ApiError 的异步调用
 */
export async function toOutcome<T>(task: () => Promise<T>): Promise<AsyncOutcome<T>> {
  try {
    return { ok: true, data: await task() }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof ApiError
        ? { kind: e.kind, code: e.code, traceId: e.traceId }
        : { kind: 'network', code: 0 }
    }
  }
}
