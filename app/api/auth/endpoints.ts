import type { ApiClient } from '~/services/types'
import type { AuthUser, LoginPayload, LoginResult, MockScene } from './contracts'

/**
 * auth 域接口：只声明契约（URL/方法/载荷/类型），没有任何逻辑；client 由组合根造好传进来
 */

/**
 * 登录/会话
 * @param client 网关客户端
 * @param payload 登录/会话的入参
 * @param scene 模拟场景
 * @returns 登录/会话的返回形态
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
 * @param client 网关客户端
 * @param scene 模拟场景
 * @returns 当前登录用户信息的形态
 */
export function getMe(client: ApiClient, scene: MockScene = '') {
  return client<AuthUser>('/auth/me', scene ? { query: { scene } } : undefined)
}

/**
 * 退出登录/会话
 * @param client 网关客户端
 * @returns 退出登录/会话的返回形态
 */
export function postLogout(client: ApiClient) {
  return client<null>('/auth/logout', { method: 'POST' })
}
