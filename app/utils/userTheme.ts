import type { UserOverrideKey, UserThemeOverrides } from '#shared/types/theme'
import { USER_TOKEN_OVERRIDES } from '~/constants/theme'

/**
 * 用户自定义覆盖的纯函数层：cookie 编解码 + 白名单校验（规则登记在 app/constants/theme.ts）。
 *
 * 校验策略是「静默丢弃」不是报错：color picker / range 输出恒合法格式，非法值只可能来自手改 cookie——
 * 预览不生效即自然反馈。sanitize 之后的结果才是可信的（SSR 直出与 store 都只存它）。
 *
 * 校验只做安全边界：格式（#rrggbb / Npx）+ 白名单键——防手改 cookie 往 SSR HTML 的 style 属性注入任意 CSS。
 * 设计性限制（主色对比度 ≥3:1）曾存在，已按产品决策移除：用户可随意预览任何合法颜色；
 * 浅色主色上前景字不可读的责任交还设计侧（要恢复就恢复 contrast 校验分支）。
 */

const HEX6 = /^#[0-9a-f]{6}$/i
const LENGTH_PX = /^(\d{1,2})(\.\d+)?px$/

/** 白名单键的固定顺序（serialize/toStyleAttr 的输出顺序都取它，保证往返稳定） */
function whitelistKeys(): UserOverrideKey[] {
  return Object.keys(USER_TOKEN_OVERRIDES) as UserOverrideKey[]
}

/**
 * 解析 v_utheme cookie 原文（`primary=%236c5ce7&radius=12px`）：只保留白名单键，其余丢弃。
 * 返回值未经校验，进 store 前必须再过 sanitizeUserOverrides。
 */
export function parseUserThemeCookie(raw: string | null | undefined): Partial<Record<UserOverrideKey, string>> {
  const out: Partial<Record<UserOverrideKey, string>> = {}
  if (!raw) return out
  for (const pair of raw.split('&')) {
    const eq = pair.indexOf('=')
    if (eq < 1) continue
    const key = pair.slice(0, eq)
    if (!(key in USER_TOKEN_OVERRIDES)) continue
    try {
      out[key as UserOverrideKey] = decodeURIComponent(pair.slice(eq + 1))
    } catch {
      // 恶意/残缺的百分号转义：丢弃该键（静默策略，见文件头注）
    }
  }
  return out
}

/**
 * 白名单 + 格式校验：primary 须 #rrggbb（归一化小写）；radius 须 0–24 的 px 值。
 * 只做安全边界（防 cookie 注入任意 CSS），不做设计性限制——对比度门槛已按产品决策移除（随意预览）。
 */
export function sanitizeUserOverrides(raw: Partial<Record<UserOverrideKey, string>>): UserThemeOverrides {
  const out: UserThemeOverrides = {}
  for (const key of whitelistKeys()) {
    const value = raw[key]
    if (value === undefined) continue
    const rule = USER_TOKEN_OVERRIDES[key]
    if (rule.kind === 'color') {
      if (HEX6.test(value)) {
        out[key] = value.toLowerCase()
      }
    } else if (rule.kind === 'length') {
      const m = LENGTH_PX.exec(value)
      const px = m ? Number(m[1] + (m[2] ?? '')) : NaN
      if (px >= 0 && px <= rule.max!) out[key] = value
    }
  }
  return out
}

/** 序列化回 v_utheme cookie 值：白名单键序 + encodeURIComponent */
export function serializeUserThemeCookie(o: UserThemeOverrides): string {
  return whitelistKeys()
    .filter(key => o[key] !== undefined)
    .map(key => `${key}=${encodeURIComponent(o[key]!)}`)
    .join('&')
}

/** 拼成 <html style> 属性值：`--primary:#6c5ce7;--radius:12px`；空对象返回 '' */
export function toStyleAttr(o: UserThemeOverrides): string {
  return whitelistKeys()
    .filter(key => o[key] !== undefined)
    .map(key => `${USER_TOKEN_OVERRIDES[key].token}:${o[key]}`)
    .join(';')
}
