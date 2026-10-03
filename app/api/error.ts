/**
 * 错误体系运行时模块（传输协议层公共件，非业务域，不套域格子目录）。
 *
 * 职责边界（三级归属）：
 * - 本文件：错误体系的「运行时产物」——类、转换器、形状级文案映射
 * - shared/types/api.ts：错误体系的「编译时契约」——Kind/Snapshot/Outcome 纯类型
 * - composables/useApi.ts：唯一生产者（拦截器内构造 ApiError，与信封解包同族）
 *
 * 变化预期：将来错误上报（Sentry 位）、traceId 富化在本模块内生长，不搅动传输层。
 * 注：api/ 不在 auto-import 目录——消费方显式 import '~/api/error'（对齐 AUTH_ERROR_I18N 的既有模式）。
 */

// 全站唯一错误形态：协议层归一化产物，上层只面对它，不接触 FetchError
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

// 错误形状 → 全站通用横幅文案 i18n key（穷尽映射：新增 kind 必须补译）
export const API_ERROR_BANNER_I18N = {
  network: 'error.network',
  http: 'error.http',
  business: 'error.fallback',
  auth: 'error.fallback'
} satisfies Record<ApiErrorKind, string>

/**
 * 把「可能抛 ApiError 的异步调用」转换为 AsyncOutcome 数据。
 * 各域 composable 在 useAsyncData 回调里一律经由本函数返回，
 * 禁止各自手写 try/catch 快照（防止形态漂移、漏字段）。
 * @param task 异步调用
 * @returns AsyncOutcome 数据
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
