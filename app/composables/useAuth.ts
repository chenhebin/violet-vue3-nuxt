import { API_ERROR_BANNER_I18N } from '~/api/error'
import { AUTH_ERROR_I18N } from '~/api/auth'
import type { AuthErrorCode, AuthUser, LoginPayload, MockScene } from '~/api/auth'

/**
 * auth 域门面：视图只面对本层。状态与业务结果在域 store（app/stores/auth.ts，编排分层见其头注），
 * 本层管展示与产品流程决策——跳转、埋点、文案。
 *
 * 身份以哪份数据为准（真相源约定，完整版见 store 头注）：
 * - 登录与否的真相源是 cookie（isAuthenticated 直接问 $authService，不走 store getter）
 * - user 只是"登录那一刻的快照"，给导航栏这类全局位置读
 * - 页面级会话数据（比如 /me）以 useAsyncData 的 AsyncOutcome 为准；全局快照由 store 的 login/fetchMe 成功分支双写
 *
 * 错误文案收口在本域，双端视图零重复：
 * - 字段级：业务码命中 AUTH_ERROR_I18N 登记表就有文案（漏译直接编译不过）
 * - 横幅级：错误形状查全站 API_ERROR_BANNER_I18N；业务码没登记过就兜底 error.fallback
 */
export function useAuth() {
  const { $authService } = useNuxtApp()
  const { track, identify } = useTrack()
  const { t } = useLocale()
  const store = useAuthStore()
  const { user, pending, error, rememberedUsername } = storeToRefs(store)
  // 动作不经 storeToRefs（它只拆 ref），从 store 直取（pinia 的 action 已绑好 this，可安全解构）
  const setRememberedUsername = store.setRememberedUsername

  /**
   * 字段级错误文案：只有业务码且登记进域错误表了才显示（比如 1001 密码错误）
   */
  const fieldError = computed(() => {
    const e = error.value
    if (!e || e.kind !== 'business') return null
    const i18nKey = AUTH_ERROR_I18N[e.code as AuthErrorCode]
    return i18nKey ? t(i18nKey) : null
  })

  /**
   * 横幅级错误文案：按错误形状查全站表；业务码在字段级没登记到就兜底
   */
  const bannerError = computed(() => {
    const e = error.value
    if (!e) return null
    if (e.kind === 'business') return fieldError.value ? null : t('error.fallback')
    return t(API_ERROR_BANNER_I18N[e.kind])
  })

  /**
   * 登录：状态与业务结果在 store；成功就埋点并回跳——优先用守卫带来的 redirect（只认站内路径，防开放重定向），默认去 /me；失败上报埋点（错误快照已落在 store）
   * @param payload 登录表单（用户名/密码）
   * @param scene mock 场景开关值
   */
  async function login(payload: LoginPayload, scene: MockScene = '') {
    const result = await store.login(payload, scene)
    if (result.ok) {
      // 用户身份标记（setBaseData）
      identify(String(result.data.id))
      track(TRACK_EVENTS.loginSuccess)
      const redirect = useRoute().query.redirect
      await navigateTo(typeof redirect === 'string' && /^\/(?!\/)/.test(redirect) ? redirect : '/me')
    } else {
      track(TRACK_EVENTS.loginFail, { kind: result.error.kind, code: result.error.code })
    }
  }

  /**
   * 登出：埋点 → 清会话（service 兜底清 token，store 吞异常清状态，后端成败不拦截跳转）→ 回登录页
   */
  async function logout() {
    track(TRACK_EVENTS.logout)
    await store.logout()
    await navigateTo('/login')
  }

  /**
   * 给 useAsyncData 用的会话加载器：store 里已 toOutcome 转成数据；auth 失败上报会话过期
   * @param scene mock 场景开关值
   */
  async function loadMe(scene: MockScene = ''): Promise<AsyncOutcome<AuthUser>> {
    const result = await store.fetchMe(scene)
    if (!result.ok && result.error.kind === 'auth') track(TRACK_EVENTS.sessionExpired)
    return result
  }
  return {
    user,
    pending,
    rememberedUsername,
    setRememberedUsername,
    fieldError,
    bannerError,
    login,
    logout,
    loadMe,
    // 包一层箭头函数而不是透传方法引用：不依赖 service 内部是不是 this-free 的箭头属性，怎么重构都断不了
    isAuthenticated: () => $authService.isAuthenticated()
  }
}
