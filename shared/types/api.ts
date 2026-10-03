/**
 * 跨端协议契约（app + server 共享）——纯类型层，禁止任何运行时导出（有 lint 门禁）。
 *
 * 类型三级归属规则（新类型落位判定）：
 * 1. 域内私有：仅一个业务域消费 → 域自己的 contracts（如 api/auth/contracts.ts）
 * 2. app 内分层抽象：仅 app 侧组合根/服务层消费 → services/types.ts（ApiClient、TokenStorage）
 * 3. 跨端公共：app 与 server 都要消费，或 ≥3 个域消费 → 本目录（shared/types/）
 *
 * 提升触发条件（记账制，防类型垃圾场）：
 * - 域类型出现第 3 个消费域，或跨域 type import 成环 → 提升到本目录
 * - 提升时必须在文件头登记消费方，无主类型一律拒绝合入
 */

/** 后端网关统一响应信封（本实例只对接信封协议的后端；server/api 产出、app 协议层解包） */
export interface ApiEnvelope<T = unknown> {
  code: number
  message?: string
  traceId?: string
  data: T
}

/** 错误类别：网络层 / HTTP 状态 / 业务码 / 会话失效。全站唯一错误形状，域不许发明第五种 */
export type ApiErrorKind = 'network' | 'http' | 'business' | 'auth'

/** ApiError 的跨边界快照：只保留可序列化字段（useState/useAsyncData 载荷安全） */
export interface ApiErrorSnapshot {
  kind: ApiErrorKind
  code: number
  traceId?: string
}

/**
 * 异步结果的判别联合（全站通用形态）。
 * 错误必须以数据形态过 SSR 边界：useAsyncData 会把抛出的异常包装成 H3Error，
 * 自定义类字段会丢失（nuxt 源码 asyncData.js 的 createError 包装行为）。
 */
export type AsyncOutcome<T>
  = | { ok: true; data: T }
    | { ok: false; error: ApiErrorSnapshot }
