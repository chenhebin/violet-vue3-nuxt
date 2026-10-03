import type { AuthErrorCode } from './contracts'

/**
 * auth 域业务码 → i18n key 登记表（域内自持，别域不感知）。
 *
 * 规则：contracts.ts 扩展 AuthErrorCode 联合后必须在此补映射，
 * satisfies 穷尽检查保证漏译编译不过——而不是上线后页面显示裸码。
 * 仅收录「字段级」呈现的码；横幅级业务码走 error.fallback 兜底。
 */
export const AUTH_ERROR_I18N = {
  1001: 'error.1001'
} satisfies Record<AuthErrorCode, string>
