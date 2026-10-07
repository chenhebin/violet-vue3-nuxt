// Ticket: .scratch/login-pilot/issues/01-unit-auth-service.md
import type { ApiClient } from '~/services/types'

/**
 * 可编程 ApiClient 桩：按 URL 片段匹配脚本，返回预设值或抛预设异常。
 * ApiClient 锚定 typeof $fetch（app/services/types.ts：形态锚定全局 $fetch 实例，
 * 测试时塞一个满足调用签名的桩即可换掉）——所以这里用签名断言收窄，不做完整 $fetch 仿真。
 */
export interface ApiScriptEntry {
  /** URL 匹配片段，如 '/auth/login' */
  match: string
  resolve?: unknown
  reject?: Error
}

export function fakeApiClient(script: ApiScriptEntry[]): ApiClient {
  const fn = ((url: string) => {
    const hit = script.find(entry => url.includes(entry.match))
    if (!hit) {
      throw new Error(`fakeApiClient: 未预设的请求 ${url}（脚本：${script.map(e => e.match).join(', ')}）`)
    }
    if (hit.reject) return Promise.reject(hit.reject)
    return Promise.resolve(hit.resolve)
  }) as unknown as ApiClient
  return fn
}
