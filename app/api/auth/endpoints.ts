import type { ApiClient } from '~/services/types'

/**
 * auth 域接口：只声明契约（URL/方法/载荷/类型），没有任何逻辑；client 由组合根造好传进来。
 * 载荷契约（LoginPayload / AuthUser / LoginResult）在 shared/types/auth.ts，两端免 import；
 * mock scene 不在签名里——由传输层按 URL query 统一注入（见 plugins/api.ts）。
 */

/**
 * 登录
 * @param client 组合根造好的请求客户端
 * @param payload 登录表单载荷
 */
export function postLogin(client: ApiClient, payload: LoginPayload) {
  return client<LoginResult>('/auth/login', {
    method: 'POST',
    body: payload
  })
}

/**
 * 拉当前登录用户信息
 * @param client 组合根造好的请求客户端
 */
export function getMe(client: ApiClient) {
  return client<AuthUser>('/auth/me')
}

/**
 * 退出登录
 * @param client 组合根造好的请求客户端
 */
export function postLogout(client: ApiClient) {
  return client<null>('/auth/logout', { method: 'POST' })
}
