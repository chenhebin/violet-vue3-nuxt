/**
 * auth 域私有契约：业务错误码。
 * 载荷契约（LoginPayload / AuthUser / LoginResult）已提升 shared/types/auth.ts（server 共用），此处不再重复。
 * mock 演示开关白名单已迁登记册 `app/constants/mock.ts`（横切开关不属域私有契约）。
 */

// auth 域业务错误码联合。mock 加新分支就在这扩展，同时去 errors.ts 补文案
export type AuthErrorCode = 1001
