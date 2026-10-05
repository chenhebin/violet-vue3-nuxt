import type { AuthErrorCode } from './contracts'

/**
 * auth 域业务码 → i18n key 的登记表（放在域内自己管，别的域不用知道）。
 *
 * 规矩：contracts.ts 里扩展了 AuthErrorCode 联合，就必须来这里补映射。
 * satisfies 穷尽检查保证漏译时编译不过——而不是等上线后用户看到一串裸码。
 * 只收「字段级」展示的码；横幅级业务码走 error.fallback 兜底。
 */
export const AUTH_ERROR_I18N = {
  1001: 'error.1001'
} satisfies Record<AuthErrorCode, string>
