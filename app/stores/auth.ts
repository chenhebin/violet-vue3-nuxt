import { toOutcome } from '~/api/error'
import type { AuthUser, LoginPayload, MockScene } from '~/api/auth'

// auth 域 store（复杂域 store 示范模板，新域 store 照此写）
//
// 状态规则：只存客户端原生状态（登录操作瞬态、记住的用户名）；页面级会话数据归 useAsyncData 缓存，
// 不进 store，避免双写——页面数据以 useAsyncData 的 AsyncOutcome 为准。
//
// 持久化纪律：只 pick rememberedUsername 进 localStorage（键由 nuxt.config 的 `violet:%id` 模板生成）。
// user 只是登录快照、error/pending 是瞬态，都不持久化——SSR 服务端没有 localStorage，
// 客户端预填 user 会造成水合错位；会话恢复走 cookie(v_token) + fetchMe 刷新。
//
// 编排分层：门面（useAuth）管跳转/埋点/文案；本 store 管状态与业务结果（异常统一 toOutcome 转数据）；
// $authService 管业务规则，经 useNuxtApp 拿组合根注入的实例，不 import services 文件，保持单向依赖。
//
// 真相源约定：登录与否以 cookie 为唯一真相源，所以不定义 isAuthenticated；user 只是给全局 UI 读的登录快照，
// 由 login/fetchMe 成功后更新。
export const useAuthStore = defineStore(PINIA_STORE_IDS.auth, () => {
  // 登录那一刻的用户快照（真相源约定见头注）
  const user = ref<AuthUser | null>(null)
  // 登录动作的错误快照（只有 login 写它；查询类失败走 AsyncOutcome 由页面消费，不落这个位——防跨页幽灵文案）
  const error = ref<ApiErrorSnapshot | null>(null)
  // 登录动作进行中（按钮禁用/加载态用）
  const pending = ref(false)
  // 「记住用户名」的落点：唯一持久化字段（pick 纪律见头注）
  const rememberedUsername = ref('')

  /**
   * 登录：状态与业务结果归 store；跳转/埋点归门面
   * @param payload 登录表单（用户名+密码）
   * @param scene mock 场景开关（联调时模拟指定失败分支）
   */
  async function login(payload: LoginPayload, scene: MockScene = ''): Promise<AsyncOutcome<AuthUser>> {
    pending.value = true
    error.value = null
    const result = await toOutcome(() => useNuxtApp().$authService.login(payload, scene))
    if (result.ok) user.value = result.data
    else error.value = result.error
    pending.value = false
    return result
  }

  /**
   * 登出：不管后端成不成，本地会话一律清空——service 的 try/finally 保证清 token，toOutcome 吞掉登出异常，保证 store 清空、不拦截跳转
   */
  async function logout(): Promise<void> {
    await toOutcome(() => useNuxtApp().$authService.logout())
    user.value = null
    error.value = null
  }

  /**
   * 会话加载器：给门面 loadMe / useAsyncData 用；错误以 AsyncOutcome 返回（页面级消费），不落 store.error；auth 失败（cookie 过期）时清用户快照
   * @param scene mock 场景开关（联调时模拟指定失败分支）
   */
  async function fetchMe(scene: MockScene = ''): Promise<AsyncOutcome<AuthUser>> {
    const result = await toOutcome(() => useNuxtApp().$authService.fetchMe(scene))
    if (result.ok) user.value = result.data
    else if (result.error.kind === 'auth') user.value = null
    return result
  }

  /**
   * 记住用户名：意图即记录，不依赖登录成败（清空传 ''）
   * @param name 要记住的用户名，清空传空串
   */
  function setRememberedUsername(name: string): void {
    rememberedUsername.value = name
  }

  return { user, error, pending, rememberedUsername, login, logout, fetchMe, setRememberedUsername }
}, {
  // 持久化 pick 纪律见头注：只挑 rememberedUsername（防水合错位），storage 显式 localStorage
  persist: {
    pick: ['rememberedUsername'],
    storage: piniaPluginPersistedstate.localStorage()
  }
})
