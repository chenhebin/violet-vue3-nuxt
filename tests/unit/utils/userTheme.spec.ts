// Ticket: .scratch/theme-personalization/issues/01-theme-and-user-theme.md
import { describe, expect, it } from 'vitest'
import {
  parseUserThemeCookie,
  sanitizeUserOverrides,
  serializeUserThemeCookie,
  toStyleAttr
} from '~/utils/userTheme'

describe('parseUserThemeCookie 白名单解析', () => {
  it('Given 合法串，When 解析，Then 白名单键全保留且值已解码', () => {
    expect(parseUserThemeCookie('primary=%236c5ce7&radius=12px')).toEqual({ primary: '#6c5ce7', radius: '12px' })
  })

  it('Given 混入白名单外键，When 解析，Then 只留白名单键', () => {
    expect(parseUserThemeCookie('background=%23000000&primary=%236c5ce7')).toEqual({ primary: '#6c5ce7' })
  })

  it('Given 空/残缺输入，When 解析，Then 返回空对象不抛错', () => {
    expect(parseUserThemeCookie(null)).toEqual({})
    expect(parseUserThemeCookie(undefined)).toEqual({})
    expect(parseUserThemeCookie('')).toEqual({})
    expect(parseUserThemeCookie('nonsense')).toEqual({})
  })
})

describe('sanitizeUserOverrides 白名单校验', () => {
  it('Given 合法主色+圆角，When 校验，Then 全保留且主色归一化小写', () => {
    expect(sanitizeUserOverrides({ primary: '#6C5CE7', radius: '12px' })).toEqual({ primary: '#6c5ce7', radius: '12px' })
  })

  it('Given 非法色值（#xyz / red），When 校验，Then 主色被丢弃', () => {
    expect(sanitizeUserOverrides({ primary: '#xyz' })).toEqual({})
    expect(sanitizeUserOverrides({ primary: 'red' })).toEqual({})
  })

  it('Given 曾因对比度被拒的浅色（#9d96ff / #ff8c00），When 校验，Then 现在通过（设计性限制已移除，随意预览）', () => {
    expect(sanitizeUserOverrides({ primary: '#9d96ff' })).toEqual({ primary: '#9d96ff' })
    expect(sanitizeUserOverrides({ primary: '#ff8c00' })).toEqual({ primary: '#ff8c00' })
  })

  it('Given 圆角越界或非法单位，When 校验，Then 被拒', () => {
    expect(sanitizeUserOverrides({ radius: '25px' })).toEqual({})
    expect(sanitizeUserOverrides({ radius: '1rem' })).toEqual({})
    expect(sanitizeUserOverrides({ radius: '-2px' })).toEqual({})
  })

  it('Given 边界圆角 24px / 0px，When 校验，Then 通过', () => {
    expect(sanitizeUserOverrides({ radius: '24px' })).toEqual({ radius: '24px' })
    expect(sanitizeUserOverrides({ radius: '0px' })).toEqual({ radius: '0px' })
  })

  it('Given 白名单外键，When 校验，Then 被剥离', () => {
    expect(sanitizeUserOverrides({ background: '#000000' } as never)).toEqual({})
  })

  it('Given 空输入，When 校验，Then 返回空对象', () => {
    expect(sanitizeUserOverrides({})).toEqual({})
  })
})

describe('serialize / toStyleAttr', () => {
  it('Given 覆盖对象，When 序列化，Then 按白名单键序输出且值已转义', () => {
    expect(serializeUserThemeCookie({ radius: '12px', primary: '#6c5ce7' })).toBe('primary=%236c5ce7&radius=12px')
  })

  it('Given 覆盖对象，When 拼 style 属性，Then 输出 token:value 串', () => {
    expect(toStyleAttr({ primary: '#6c5ce7', radius: '12px' })).toBe('--primary:#6c5ce7;--radius:12px')
  })

  it('Given 空对象，When 拼 style 属性，Then 返回空串', () => {
    expect(toStyleAttr({})).toBe('')
    expect(serializeUserThemeCookie({})).toBe('')
  })

  it('Given sanitize 后的值，When serialize→parse→sanitize 往返，Then 结果一致', () => {
    const original = sanitizeUserOverrides({ primary: '#6c5ce7', radius: '12px' })
    const round = sanitizeUserOverrides(parseUserThemeCookie(serializeUserThemeCookie(original)))
    expect(round).toEqual(original)
  })
})
