// Ticket: .scratch/arch-fixes/issues/01-cookie-seam.md
import { describe, expect, it } from 'vitest'
import { parseCookie, buildCookie } from '~/utils/cookies'

describe('cookie 语法层纯函数', () => {
  it('Given 单键原文，When parseCookie，Then 取到原始值（编码原样保留，不解码）', () => {
    expect(parseCookie('v_theme=dark', 'v_theme')).toBe('dark')
    expect(parseCookie('v_utheme=primary%23abc', 'v_utheme')).toBe('primary%23abc')
  })

  it('Given 多键原文（目标在前/中/尾位），When parseCookie，Then 各取各值', () => {
    expect(parseCookie('v_device=pc; v_theme=dark; v_utheme=x', 'v_device')).toBe('pc')
    expect(parseCookie('v_device=pc; v_theme=dark; v_utheme=x', 'v_theme')).toBe('dark')
    expect(parseCookie('v_device=pc; v_theme=dark; v_utheme=x', 'v_utheme')).toBe('x')
  })

  it('Given 无该键或原文为 undefined/null/空串，When parseCookie，Then 返回 null', () => {
    expect(parseCookie('v_theme=dark', 'v_device')).toBeNull()
    expect(parseCookie(undefined, 'v_theme')).toBeNull()
    expect(parseCookie(null, 'v_theme')).toBeNull()
    expect(parseCookie('', 'v_theme')).toBeNull()
  })

  it('Given 键与值与一年有效期，When buildCookie，Then 输出完整客户端写串', () => {
    expect(buildCookie('v_theme', 'dark', { maxAge: 31536000 })).toBe('v_theme=dark; path=/; max-age=31536000')
  })

  it('Given 空值与 maxAge 0，When buildCookie，Then 输出清除串', () => {
    expect(buildCookie('v_utheme', '', { maxAge: 0 })).toBe('v_utheme=; path=/; max-age=0')
  })
})
