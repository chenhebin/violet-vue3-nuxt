import { toOutcome } from '~/api/error'

// auth 域 store（复杂域 store 示范模板，新域 store 照此写）
//
// 状态规则：只存客户端原生状态——登录动作瞬态（pending/error）与记住的用户名；页面级会话数据
// （比如 /me）走 useMe 的 AsyncOutcome，不进 store，避免双写；会话失败清理归 service 的 token 清写。
//
// 持久化纪律：只 pick rememberedUsername 进 localStorage（键由 nuxt.config 的 `violet:%id` 模板生成）。
// error/pending 是瞬态，都不持久化——SSR 服务端没有 localStorage；会话恢复走 cookie(v_token) + fetchMe 刷新。
//
// 编排分层：门面（useAuth）管跳转/埋点/文案；本 store 管状态与业务结果（异常统一 toOutcome 转数据）；
// $authService 管业务规则，经 useNuxtApp 拿组合根注入的实例，不 import services 文件，保持单向依赖。
//
// 真相源约定：登录与否以 cookie 为唯一真相源，所以不定义 isAuthenticated。
export const useAuthStore = defineStore(PINIA_STORE_IDS.auth, () => {
  // 登录动作的错误快照（只有 login 写它；查询类失败走 AsyncOutcome 由页面消费，不落这个位——防跨页幽灵文案）
  const error = ref<ApiErrorSnapshot | null>(null)
  // 登录动作进行中（按钮禁用/加载态用）
  const pending = ref(false)
  // 「记住用户名」的落点：唯一持久化字段（pick 纪律见头注）
  const rememberedUsername = ref('')

  /**
   * 登录：状态与业务结果归 store；跳转/埋点归门面
   * @param payload 登录表单（用户名+密码）
   */
  async function login(payload: LoginPayload): Promise<AsyncOutcome<AuthUser>> {
    pending.value = true
    error.value = null
    const result = await toOutcome(() => useNuxtApp().$authService.login(payload))
    if (!result.ok) error.value = result.error
    pending.value = false
    return result
  }

  /**
   * 登出：不管后端成不成，本地会话一律清空——service 的 try/finally 保证清 token，toOutcome 吞掉登出异常，保证 store 清空、不拦截跳转
   */
  async function logout(): Promise<void> {
    await toOutcome(() => useNuxtApp().$authService.logout())
    error.value = null
  }

  /**
   * 记住用户名：意图即记录，不依赖登录成败（清空传 ''）
   * @param name 要记住的用户名，清空传空串
   */
  function setRememberedUsername(name: string): void {
    rememberedUsername.value = name
  }

  return { error, pending, rememberedUsername, login, logout, setRememberedUsername }
}, {
  // 持久化 pick 纪律见头注：只挑 rememberedUsername（防水合错位），storage 显式 localStorage
  persist: {
    pick: ['rememberedUsername'],
    storage: piniaPluginPersistedstate.localStorage()
  }
})
