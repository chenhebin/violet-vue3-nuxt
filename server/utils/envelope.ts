/**
 * 信封 helper：server/api 统一响应形态的唯一构造处（协议契约见 shared/types/api.ts，
 * 类型经 Nuxt 4 shared 机制免 import）。四处接口不再手搓字面量，字段增删只动这里。
 */

/**
 * 成功信封
 * @param data 业务数据
 */
export function apiOk<T>(data: T): ApiEnvelope<T> {
  return { code: 0, message: 'ok', data }
}

/**
 * 业务失败信封（HTTP 200 + code ≠ 0）：字段级文案由前端域错误表承接
 * @param code 业务错误码（登记在对应前端域 contracts 的联合类型）
 * @param message 面向日志的英文描述（不直接展示给用户）
 */
export function apiFail(code: number, message: string): ApiEnvelope<null> {
  return { code, message, traceId: `trace-${Date.now()}`, data: null }
}
