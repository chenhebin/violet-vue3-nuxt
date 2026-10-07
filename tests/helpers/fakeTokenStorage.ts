// Ticket: .scratch/login-pilot/issues/01-unit-auth-service.md
import type { TokenStorage } from '~/services/auth/contracts'

/**
 * 可编程 TokenStorage 桩：记录调用序列、可预设当前值。
 * 形状对齐 app/services/auth/contracts.ts 的 TokenStorage 契约（read/write/clear）。
 */
export function fakeTokenStorage(initial: string | null = null) {
  let value = initial
  const calls: Array<'read' | 'write' | 'clear'> = []
  return {
    read: () => {
      calls.push('read')
      return value
    },
    write: (token: string) => {
      calls.push('write')
      value = token
    },
    clear: () => {
      calls.push('clear')
      value = null
    },
    calls,
    /** 当前存储值（断言用，非契约部分） */
    value: () => value
  } satisfies TokenStorage & { calls: string[]; value: () => string | null }
}
