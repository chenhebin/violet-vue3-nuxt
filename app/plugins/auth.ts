import { createAuthService } from '~/services/auth'

/**
 * auth 域的组合根（装配点）：会话业务在这里组装。
 * 只用传输组合根发下来的 $apiClient / $tokenStorage（依赖方向：业务域 → 传输的抽象接口，只能这一方向），
 * 不自己造基础设施；其他业务域照这个模式各建 plugins/<domain>.ts。
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
