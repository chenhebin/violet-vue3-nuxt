import { createAuthService } from '~/services/auth'

/**
 * auth 域组合根：会话业务的装配点。
 * 只消费传输组合根发放的 $apiClient / $tokenStorage（依赖方向：领域 → 传输抽象，单向），
 * 不创建任何基础设施；其他业务域照此模式建各自的 plugins/<domain>.ts。
 */
export default defineNuxtPlugin({
  dependsOn: ['api'],
  name: 'auth',
  setup() {
    const { $apiClient, $tokenStorage } = useNuxtApp()
    const authService = createAuthService($apiClient, $tokenStorage)
    return {
      provide: {
        // 会话业务服务
        authService
      }
    }
  }
})
