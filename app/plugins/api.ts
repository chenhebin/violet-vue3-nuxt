import type { TokenStorage } from '~/services/auth'

/**
 * 传输组合根：拥有「带凭据的网关客户端」。
 * - 凭据机制（cookie ref、Authorization 注头）归本层：transport 在请求时读取
 * - 凭据策略（何时写、何时清）归 auth 域：经 $tokenStorage 抽象操作，transport 不感知
 * - 服务端每请求执行一次 → 凭据天然请求隔离；禁止模块级单例持有本文件产出的任何状态
 */
export default defineNuxtPlugin({
  dependsOn: ['i18n:plugin'],
  name: 'api',
  setup() {
    const nuxtApp = useNuxtApp()
    const tokenCookie = useCookie<string | null>(COOKIE_KEYS.token, {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax'
    })
    // 语言环境
    const locale = computed(() => String(nuxtApp.$i18n.locale))
    // 网关客户端
    const apiClient = useApi({ token: tokenCookie, locale })
    return {
      provide: {
        // 网关客户端
        apiClient,
        // 凭据存储
        tokenStorage: {
          read: () => tokenCookie.value ?? null,
          write: (token: string) => {
            tokenCookie.value = token
          },
          clear: () => {
            tokenCookie.value = null
          }
        } satisfies TokenStorage
      }
    }
  }
})
