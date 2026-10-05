import { API_ERROR_BANNER_I18N, toOutcome } from '~/api/error'
import { AUTH_ERROR_I18N } from '~/api/auth'
import type { AuthErrorCode, AuthUser, LoginPayload, MockScene } from '~/api/auth'

/**
 * auth 域状态桥：把领域服务包成响应式状态和动作，视图只面对本层。
 *
 * 身份以哪份数据为准（真相源约定）：
 * - user 只是"登录那一刻的快照"，给导航栏这类全局位置读
 * - 页面级会话数据（比如 /me）以 useAsyncData 的 AsyncOutcome 为准，不回写 user
 * - 以后要全局身份跟着刷新，只需在 loadMe 成功分支回写 user 这一个地方改
 *
 * 错误文案收口在本域，双端视图零重复：
 * - 字段级：业务码命中 AUTH_ERROR_I18N 登记表就有文案（漏译直接编译不过）
 * - 横幅级：错误形状查全站 API_ERROR_BANNER_I18N；业务码没登记过就兜底 error.fallback
 */
export function useAuth() {
  const { $authService } = useNuxtApp()
  const { track, identify } = useTrack()
  const { t } = useLocale()
  const user = useState<AuthUser | null>(AUTH_STATE_KEYS.user, () => null)
  const pending = ref(false)
  const error = useState<ApiErrorSnapshot | null>(AUTH_STATE_KEYS.error, () => null)

  /** 字段级错误文案：只有业务码且登记进域错误表了才显示（比如 1001 密码错误） */
  const fieldError = computed(() => {
    const e = error.value
    if (!e || e.kind !== 'business') return null
    const i18nKey = AUTH_ERROR_I18N[e.code as AuthErrorCode]
    return i18nKey ? t(i18nKey) : null
  })

  /** 横幅级错误文案：按错误形状查全站表；业务码在字段级没登记到就兜底 */
  const bannerError = computed(() => {
    const e = error.value
    if (!e) return null
    if (e.kind === 'business') return fieldError.value ? null : t('error.fallback')
    return t(API_ERROR_BANNER_I18N[e.kind])
  })

  /** 登录：成功就写用户快照并回跳——优先用守卫带来的 redirect（只认站内路径，防开放重定向），默认去 /me；失败就落错误快照（数据形态，SSR 载荷安全） */
  async function login(payload: LoginPayload, scene: MockScene = '') {
    pending.value = true
    error.value = null
    const result = await toOutcome(() => $authService.login(payload, scene))
    if (result.ok) {
      user.value = result.data
      // 用户身份标记（setBaseData）
      identify(String(result.data.id))
      track(TRACK_EVENTS.loginSuccess)
      const redirect = useRoute().query.redirect
      await navigateTo(typeof redirect === 'string' && /^\/(?!\/)/.test(redirect) ? redirect : '/me')
    } else {
      error.value = result.error
      track(TRACK_EVENTS.loginFail, { kind: result.error.kind, code: result.error.code })
    }
    pending.value = false
  }

  /** 登出：不管后端成不成，本地会话一律清空（service 层有 try/finally 兜底） */
  async function logout() {
    track(TRACK_EVENTS.logout)
    await $authService.logout()
    user.value = null
    error.value = null
    await navigateTo('/login')
  }

  /** 给 useAsyncData 用的会话加载器：异常一律经 toOutcome 转成数据；auth 失败上报会话过期 */
  async function loadMe(scene: MockScene = ''): Promise<AsyncOutcome<AuthUser>> {
    const result = await toOutcome(() => $authService.fetchMe(scene))
    if (!result.ok && result.error.kind === 'auth') track(TRACK_EVENTS.sessionExpired)
    return result
  }
  return {
    user,
    pending,
    error,
    fieldError,
    bannerError,
    login,
    logout,
    loadMe,
    isAuthenticated: $authService.isAuthenticated
  }
}
