// Ticket: .scratch/test-infra/issues/01-infra.md
import { describe, expect, it } from 'vitest'
import { resolveDevice } from '~/utils/device'

const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const DESKTOP_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

describe('resolveDevice 三优先级判定', () => {
  it('Given URL 参数 device=m，When 判定，Then 返回 m（无视 cookie 与 UA）', () => {
    expect(resolveDevice({ queryDevice: 'm', cookieDevice: 'pc', userAgent: DESKTOP_UA })).toBe('m')
  })

  it('Given URL 参数 device=pc，When 判定，Then 返回 pc（无视手机 UA）', () => {
    expect(resolveDevice({ queryDevice: 'pc', cookieDevice: null, userAgent: MOBILE_UA })).toBe('pc')
  })

  it('Given 无 URL 参数且 cookie=m，When 判定，Then 返回 m', () => {
    expect(resolveDevice({ queryDevice: null, cookieDevice: 'm', userAgent: DESKTOP_UA })).toBe('m')
  })

  it('Given 无 URL 参数且 cookie 值无效（tablet），When 判定，Then 视为无 cookie 落到 UA 判定', () => {
    expect(resolveDevice({ queryDevice: null, cookieDevice: 'tablet', userAgent: MOBILE_UA })).toBe('m')
    expect(resolveDevice({ queryDevice: null, cookieDevice: 'tablet', userAgent: DESKTOP_UA })).toBe('pc')
  })

  it('Given 无 URL 参数无 cookie 且 UA 是手机浏览器，When 判定，Then 返回 m', () => {
    expect(resolveDevice({ queryDevice: null, cookieDevice: null, userAgent: MOBILE_UA })).toBe('m')
  })

  it('Given 无 URL 参数无 cookie 且 UA 是桌面浏览器，When 判定，Then 返回 pc', () => {
    expect(resolveDevice({ queryDevice: null, cookieDevice: undefined, userAgent: DESKTOP_UA })).toBe('pc')
  })

  it('Given 无 URL 参数无 cookie 且 UA 为空串，When 判定，Then 按桌面 pc 处理', () => {
    expect(resolveDevice({ queryDevice: null, cookieDevice: null, userAgent: '' })).toBe('pc')
  })
})
