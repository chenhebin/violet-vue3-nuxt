// Ticket: .scratch/arch-fixes/issues/03-i18n-integrity.md
import { describe, expect, it } from 'vitest'
import { API_ERROR_BANNER_I18N } from '~/api/error'
import { AUTH_ERROR_I18N } from '~/api/auth'
import en from '../../../i18n/locales/en.json'
import zh from '../../../i18n/locales/zh.json'

/** 递归展平嵌套对象的 key 集（叶节点 = 非 object 值） */
function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k
    return v !== null && typeof v === 'object' && !Array.isArray(v) ? flattenKeys(v as Record<string, unknown>, key) : [key]
  })
}

/** 沿 `.` 逐段下钻取叶子；缺任一段或叶非 string 返回 null */
function resolve(locale: Record<string, unknown>, key: string): string | null {
  let node: unknown = locale
  for (const seg of key.split('.')) {
    if (node === null || typeof node !== 'object') return null
    node = (node as Record<string, unknown>)[seg] ?? null
  }
  return typeof node === 'string' ? node : null
}

describe('i18n locale 完整性', () => {
  it('Given zh 与 en 两份 locale，When 展平比对 key 集，Then 完全对等（缺失侧报具体 key）', () => {
    const zhKeys = new Set(flattenKeys(zh))
    const enKeys = new Set(flattenKeys(en))
    const onlyZh = [...zhKeys].filter(k => !enKeys.has(k))
    const onlyEn = [...enKeys].filter(k => !zhKeys.has(k))
    expect(onlyZh, 'en 缺的 key').toEqual([])
    expect(onlyEn, 'zh 缺的 key').toEqual([])
  })

  it('Given 错误横幅表 API_ERROR_BANNER_I18N 的全部 key，When 在 zh/en 下钻解析，Then 每个都能落到 string 叶子', () => {
    for (const key of Object.values(API_ERROR_BANNER_I18N)) {
      expect(resolve(zh, key), `zh 解析失败: ${key}`).not.toBeNull()
      expect(resolve(en, key), `en 解析失败: ${key}`).not.toBeNull()
    }
  })

  it('Given auth 域错误表 AUTH_ERROR_I18N 的全部 key，When 在 zh/en 下钻解析，Then 每个都能落到 string 叶子', () => {
    for (const key of Object.values(AUTH_ERROR_I18N)) {
      expect(resolve(zh, key), `zh 解析失败: ${key}`).not.toBeNull()
      expect(resolve(en, key), `en 解析失败: ${key}`).not.toBeNull()
    }
  })
})
