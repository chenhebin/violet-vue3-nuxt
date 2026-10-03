/**
 * 全局键名登记册（门牌号制度）——全项目唯一出处。
 *
 * 规则：
 * 1. useState 键必须形如 `<domain>:<name>`，域名即归属；跨域读取一律经由
 *    该域导出的 composable 门面，禁止直接 useState() 他人键名（防止状态静默共享/分裂）
 * 2. Cookie 键以 `v_` 前缀命名；登记后任何地方不得再写字面量
 * 3. nuxt.config（i18n.cookieKey）因构建期加载无法引用本文件，
 *    修改 COOKIE_KEYS.locale 必须同步修改 nuxt.config（配置处已留对应注释）
 */

/** auth 域的状态键 */
export const AUTH_STATE_KEYS = {
  /** 登录瞬间的用户快照；页面级会话数据以 AsyncOutcome 为准（见 useAuth 注释） */
  user: 'auth:user',
  /** 登录动作的错误快照（ApiErrorSnapshot 形态） */
  error: 'auth:error'
} as const

/** 设备域的状态键（全局横切关注点，服务端 device 插件是唯一写入方） */
export const DEVICE_STATE_KEYS = {
  /** 当前设备形态：'pc' | 'm' */
  device: 'device:current'
} as const

/** Cookie 键登记 */
export const COOKIE_KEYS = {
  /** 登录凭据：机制归传输组合根（注头读取），策略归 auth 域（经 TokenStorage 读写） */
  token: 'v_token',
  /** 用户手动切端的选择，优先级高于 UA 判定 */
  device: 'v_device',
  /** 语言偏好；与 nuxt.config 的 i18n.detectBrowserLanguage.cookieKey 保持一致 */
  locale: 'v_locale'
} as const
