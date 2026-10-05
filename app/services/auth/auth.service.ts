import { ApiError } from '~/api/error'
import { getMe, postLogin, postLogout, type AuthUser, type LoginPayload, type MockScene } from '~/api/auth'
import type { ApiClient } from '../types'
import type { TokenStorage } from './contracts'

// 领域服务的对外契约：用的人（组合根/测试）依赖这个接口，不依赖工厂实现
export interface AuthService {
  isAuthenticated(): boolean
  login(payload: LoginPayload, scene?: MockScene): Promise<AuthUser>
  logout(): Promise<void>
  fetchMe(scene?: MockScene): Promise<AuthUser>
}

/**
 * 领域层：会话的业务规则（token 怎么存、什么时候清），完全不知道 HTTP 细节。
 * 依赖全部从参数注入（client + tokens），本文件禁止 import useApi / useCookie——
 * 这样它能在任何环境（单测/Node 脚本）里拿桩依赖直接 new 出来用。
 * @param client 传输客户端
 * @param tokens 凭据存取抽象
 * @returns 会话业务规则服务
 */
export function createAuthService(client: ApiClient, tokens: TokenStorage): AuthService {
  return {
    isAuthenticated: () => tokens.read() !== null,

    async login(payload, scene = '') {
      const { token, user } = await postLogin(client, payload, scene)
      tokens.write(token)
      return user
    },

    async logout() {
      try {
        await postLogout(client)
      } finally {
        tokens.clear()
      }
    },

    /**
     * 会话失效（协议层抛 ApiError['auth']）时先清凭据再原样上抛；
     * 怎么展示、要不要跳转归视图/组合层管，领域层不做 UI 决策。
     * @param scene 模拟场景（测试用）
     * @returns 当前用户信息
     */
    async fetchMe(scene = '') {
      try {
        return await getMe(client, scene)
      } catch (e) {
        if (e instanceof ApiError && e.kind === 'auth') tokens.clear()
        throw e
      }
    }
  }
}
