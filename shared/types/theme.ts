/**
 * 主题契约（app 和 server 共用）：
 * 当前只有 light/dark 两态；「跟随系统」是后续增强位，届时在此扩枚举。
 */
export type Theme = 'light' | 'dark'


/** 用户可覆盖 token 的键（白名单单一真相，与 app/constants/theme.ts 的登记对象同键） */
export type UserOverrideKey = 'primary' | 'radius'
/** 用户覆盖值：合法 CSS 值字符串（primary='#rrggbb'，radius='Npx'），sanitize 后才会进这里 */
export type UserThemeOverrides = Partial<Record<UserOverrideKey, string>>