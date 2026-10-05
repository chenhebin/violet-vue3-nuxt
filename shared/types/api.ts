/**
 * 跨端协议契约（app 和 server 共用）——纯类型层，禁止导出任何运行时东西（有 lint 门禁盯着）。
 *
 * 类型放哪的三级归属规则（新类型按这个判）：
 * 1. 域内私有：只有一个业务域用 → 放域自己的 contracts（如 api/auth/contracts.ts）
 * 2. app 内分层抽象：跨域共享端口 → services/types.ts（如 ApiClient）；单域私有契约 → 该域格子的 services/<domain>/contracts.ts
 * 3. 跨端公共：app 和 server 都要用，或者 ≥3 个域用 → 放本目录（shared/types/）
 *
 * 提升要记账（防这里变类型垃圾场）：
 * - 域类型用到了第 3 个消费域，或跨域 type import 成环 → 提到本目录
 * - 提升时必须在文件头登记谁在用，没主的类型一律不给合
 */

/** 后端网关统一响应信封（本实例只对接信封协议的后端；server/api 造信封，app 协议层拆信封） */
export interface ApiEnvelope<T = unknown> {
  code: number
  message?: string
  traceId?: string
  data: T
}

/** 错误类别：网络层 / HTTP 状态 / 业务码 / 会话失效。全站唯一的错误形状，哪个域都不许发明第五种 */
export type ApiErrorKind = 'network' | 'http' | 'business' | 'auth'

/** ApiError 的跨边界快照：只留可序列化字段（放进 useState/useAsyncData 才安全） */
export interface ApiErrorSnapshot {
  kind: ApiErrorKind
  code: number
  traceId?: string
}

/**
 * 异步结果的判别联合（全站通用形态）。
 * 错误必须以数据形态过 SSR 边界：useAsyncData 会把抛出的异常包成 H3Error，
 * 自定义类的字段会丢（nuxt 源码 asyncData.js 里 createError 的包装行为）。
 */
export type AsyncOutcome<T>
  = | { ok: true; data: T }
    | { ok: false; error: ApiErrorSnapshot }
