import { API_ERROR_BANNER_I18N, toOutcome } from '~/api/error'
import { AUTH_ERROR_I18N } from '~/api/auth'
import type { AuthErrorCode, AuthUser, LoginPayload, MockScene } from '~/api/auth'

/**
 * auth 域状态桥：把领域服务包成响应式状态与动作，视图只面对本层。
 *
 * 身份真相源约定：
 * - user 是「登录瞬间的快照」，供导航栏等全局位置读取
 * - 页面级会话数据（如 /me）以 useAsyncData 的 AsyncOutcome 为准，不回写 user
 * - 将来需要全局身份跟随刷新时，在 loadMe 成功分支回写 user 即可（唯一改动点）
 *
 * 错误文案归置（域内收口，双端视图零重复）：
 * - 字段级：业务码命中 AUTH_ERROR_I18N 登记表（漏译编译不过）
 * - 横幅级：形状走全站 API_ERROR_BANNER_I18N，未登记业务码兜底 error.fallback
 */
export function useAuth() {
  const { $authService } = useNuxtApp()
  const { track, identify } = useTrack()
  const { t } = useLocale()
  const user = useState<AuthUser | null>(AUTH_STATE_KEYS.user, () => null)
  const pending = ref(false)
  const error = useState<ApiErrorSnapshot | null>(AUTH_STATE_KEYS.error, () => null)

  /** 字段级错误文案：仅业务码且已登记到域错误表时呈现（如 1001 密码错误） */
  const fieldError = computed(() => {
    const e = error.value
    if (!e || e.kind !== 'business') return null
    const i18nKey = AUTH_ERROR_I18N[e.code as AuthErrorCode]
    return i18nKey ? t(i18nKey) : null
  })

  /** 横幅级错误文案：形状级查全站表；业务码未登记字段级时兜底 */
  const bannerError = computed(() => {
    const e = error.value
    if (!e) return null
    if (e.kind === 'business') return fieldError.value ? null : t('error.fallback')
    return t(API_ERROR_BANNER_I18N[e.kind])
  })

  /** 登录：成功写用户快照并跳转；失败落错误快照（数据形态，SSR 载荷安全） */
  async function login(payload: LoginPayload, scene: MockScene = '') {
    pending.value = true
    error.value = null
    const result = await toOutcome(() => $authService.login(payload, scene))
    if (result.ok) {
      user.value = result.data
      // 用户身份标记（setBaseData)
      identify(String(result.data.id))
      track(TRACK_EVENTS.loginSuccess)
      await navigateTo('/me')
    } else {
      error.value = result.error
      track(TRACK_EVENTS.loginFail, { kind: result.error.kind, code: result.error.code })
    }
    pending.value = false
  }

  /** 登出：无论后端结果如何都清空本地会话（service 层 try/finally 兜底） */
  async function logout() {
    track(TRACK_EVENTS.logout)
    await $authService.logout()
    user.value = null
    error.value = null
    await navigateTo('/login')
  }

  /** 供 useAsyncData 消费的会话加载器：异常一律经 toOutcome 转数据；auth 失败上报会话过期 */
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
