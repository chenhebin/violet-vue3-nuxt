/**
 * 信封 helper：server/api 统一响应形态只在这造（协议契约见 shared/types/api.ts，
 * 类型靠 Nuxt 4 shared 机制免 import）。四个接口都不手搓字面量，字段要增删只改这里。
 */

/**
 * 成功信封
 * @param data 业务数据
 */
export function apiOk<T>(data: T): ApiEnvelope<T> {
  return { code: 0, message: 'ok', data }
}

/**
 * 业务失败信封（HTTP 200 + code ≠ 0）：字段级文案由前端域错误表接手
 * @param code 业务错误码（登记在前端对应域 contracts 的联合类型里）
 * @param message 给日志看的英文描述（不直接给用户看）
 */
export function apiFail(code: number, message: string): ApiEnvelope<null> {
  return { code, message, traceId: `trace-${Date.now()}`, data: null }
}
