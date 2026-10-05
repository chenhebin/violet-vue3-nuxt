import type { TokenStorage } from '~/services/auth'

/**
 * 传输层的组合根（装配点）：这个文件负责造出「带登录凭据的请求客户端」。
 * - 凭据的机制（cookie、往请求头塞 Authorization）归这层管：发请求时现读
 * - 凭据的策略（什么时候写、什么时候清）归 auth 域管：通过 $tokenStorage 这套接口操作，传输层不知道细节
 * - 服务端每个请求都跑一遍 setup → 凭据天然按请求隔离；不许用模块级单例存这个文件产出的任何状态
 */
export default defineNuxtPlugin({
  dependsOn: ['i18n:plugin'],
  name: 'api',
  setup() {
    const nuxtApp = useNuxtApp()
    // secure 跟着实际协议走：只有 https 才开（dev 是 http，设了 secure 浏览器会悄悄把 cookie 丢掉）
    const secure = useRequestURL().protocol === 'https:'
    const tokenCookie = useCookie<string | null>(COOKIE_KEYS.token, {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure
    })
    // 当前语言
    const locale = computed(() => String(nuxtApp.$i18n.locale))
    // 请求客户端
    const apiClient = useApi({ token: tokenCookie, locale })
    return {
      provide: {
        // 请求客户端
        apiClient,
        // 凭据的存取口
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
