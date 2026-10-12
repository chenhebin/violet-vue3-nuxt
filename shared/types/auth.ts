/**
 * auth 载荷契约（app 和 server 共用）。
 * 登记使用者（提升记账，规则见 shared/types/api.ts 头部）：
 * - app/api/auth（endpoints 的入参/返回类型）
 * - server/api/auth/login.post.ts（apiOk<LoginResult> 泛型标注，防两端漂移）
 * - server/api/auth/me.get.ts（apiOk<AuthUser> 泛型标注）
 * 从域私有 contracts 提升而来：server mock handler 要造同形态载荷，双端各写一份没有编译期校验会漂移，
 * 收到这里让 typecheck 兜底。类型经 Nuxt shared 机制两端免 import。
 */

// 登录/会话的入参
export interface LoginPayload {
  username: string
  password: string
}

// 登录/会话的用户形态
export interface AuthUser {
  id: number
  username: string
  nickname: string
}

// 登录/会话的返回形态
export interface LoginResult {
  token: string
  user: AuthUser
}
