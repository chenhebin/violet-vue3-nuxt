import type { UserOverrideKey } from '#shared/types/theme'

/**
 * 主题域登记册：主题枚举 + 用户覆盖白名单（第五本登记册）。
 * 白名单 = 用户能拧的旋钮全集；键必须与 shared/types/theme.ts 的 UserOverrideKey 一致（编译期约束）。
 */
export const THEMES = ['light', 'dark'] as const

/** 用户覆盖白名单：token 名 + 校验参数（kind 决定 utils/userTheme.ts 的校验分支） */
export const USER_TOKEN_OVERRIDES: Record<UserOverrideKey, { token: string; kind: 'color' | 'length'; max?: number }> = {
  primary: { token: '--primary', kind: 'color' },
  radius: { token: '--radius', kind: 'length', max: 24 }
}
