import { API_ERROR_BANNER_I18N, toOutcome } from '~/api/error'
import { AUTH_ERROR_I18N } from '~/api/auth'
import type { AuthErrorCode } from '~/api/auth'

/**
 * auth 域门面：视图只面对本层。状态与业务结果在域 store（app/stores/auth.ts，编排分层见其头注），
 * 本层管展示与产品流程决策——跳转、埋点、文案。
 *
 * 身份以哪份数据为准（真相源约定，完整版见 store 头注）：
 * - 登录与否的真相源是 cookie（isAuthenticated 直接问 $authService，不走 store getter）
 * - 页面级会话数据（比如 /me）以 useMe 的 AsyncOutcome 为准，视图不持有第二份会话快照
 *
 * 错误文案收口在本域，双端视图零重复：
 * - 字段级：业务码命中 AUTH_ERROR_I18N 登记表就有文案（漏译直接编译不过）
 * - 横幅级：错误形状查全站 API_ERROR_BANNER_I18N（business 未登记字段码时也由表内兜底文案接）
 */
export function useAuth() {
  const { $authService } = useNuxtApp()
  const { track, identify } = useTrack()
  const { t } = useLocale()
  const store = useAuthStore()
  const { pending, error, rememberedUsername } = storeToRefs(store)
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
   * 横幅级错误文案：按错误形状查全站表（business 兜底文案也在表内）；字段级已有文案就不重复
   */
  const bannerError = computed(() => {
    const e = error.value
    if (!e) return null
    if (e.kind === 'business' && fieldError.value) return null
    return t(API_ERROR_BANNER_I18N[e.kind])
  })

  /**
   * 登录：状态与业务结果在 store；成功就埋点并回跳——优先用守卫带来的 redirect（只认站内路径，防开放重定向），默认去 /me；失败上报埋点（错误快照已落在 store）
   * @param payload 登录表单（用户名/密码）
   */
  async function login(payload: LoginPayload) {
    const result = await store.login(payload)
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

  return {
    pending,
    rememberedUsername,
    setRememberedUsername,
    fieldError,
    bannerError,
    login,
    logout,
    // 包一层箭头函数而不是透传方法引用：不依赖 service 内部是不是 this-free 的箭头属性，怎么重构都断不了
    isAuthenticated: () => $authService.isAuthenticated()
  }
}

/**
 * 会话错误横幅的 i18n key：auth → me.expired（域文案，配重新登录链接），其余 kind 查全站横幅表；
 * 成功或无结果返回 null。给 useMe 消费页（pc/m MePage）的模板派生文案用，规则单点在此。
 */
export function sessionErrorI18nKey(outcome: AsyncOutcome<AuthUser> | null | undefined): string | null {
  if (!outcome || outcome.ok) return null
  return outcome.error.kind === 'auth' ? 'me.expired' : API_ERROR_BANNER_I18N[outcome.error.kind]
}

/**
 * 页面级会话数据口（/me 用）：useAsyncData 包私有加载器，key 走纯「域:实体」。
 * watch route.query.scene：mock 场景开关经 URL query 进来（传输层按它注入），
 * /me ↔ /me?scene=expired 互切时重取，替代原先 key 拼 scene 的缓存区分。
 */
export function useMe() {
  const route = useRoute()
  return useAsyncData('auth:me', () => loadMeInternal(), { watch: [() => route.query.scene] })
}

/**
 * 会话加载器（文件内私有）：直调 service（toOutcome 转数据）；auth 失败上报会话过期。
 * 独立于 useAuth() 之外——每次 useAuth() 都触发 useAsyncData 就重复了。
 */
async function loadMeInternal(): Promise<AsyncOutcome<AuthUser>> {
  const { track } = useTrack()
  const result = await toOutcome(() => useNuxtApp().$authService.fetchMe())
  if (!result.ok && result.error.kind === 'auth') track(TRACK_EVENTS.sessionExpired)
  return result
}
