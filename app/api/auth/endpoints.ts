import type { ApiClient } from '~/services/types'
import type { AuthUser, LoginPayload, LoginResult, MockScene } from './contracts'

/**
 * auth 域接口：只声明契约（URL/方法/载荷/类型），没有任何逻辑；client 由组合根造好传进来
 */

/**
 * 登录；scene 非空时作为 query 传给 mock 接口模拟异常
 * @param client 组合根造好的请求客户端
 * @param payload 登录表单载荷
 * @param scene mock 异常场景（空串则不传）
 */
export function postLogin(client: ApiClient, payload: LoginPayload, scene: MockScene = '') {
  return client<LoginResult>('/auth/login', {
    method: 'POST',
    body: payload,
    query: scene ? { scene } : undefined
  })
}

/**
 * 拉当前登录用户信息
 * @param client 组合根造好的请求客户端
 * @param scene mock 异常场景（空串则不传）
 */
export function getMe(client: ApiClient, scene: MockScene = '') {
  return client<AuthUser>('/auth/me', scene ? { query: { scene } } : undefined)
}

/**
 * 退出登录
 * @param client 组合根造好的请求客户端
 */
export function postLogout(client: ApiClient) {
  return client<null>('/auth/logout', { method: 'POST' })
}
