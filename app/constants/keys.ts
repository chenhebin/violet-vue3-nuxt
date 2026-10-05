/**
 * 全局键名登记册（每个键都在这挂号，全项目只有这一份）。
 *
 * 规矩：
 * 1. useState 的键必须写成 `<domain>:<name>`，域名就是归属。别的域要读，
 *    只能走那个域导出的 composable 门面，不许直接 useState() 别人的键名（防状态被静默共享/写分裂）
 * 2. Cookie 键统一 `v_` 前缀；在这登记后，任何地方不许再写字面量
 * 3. nuxt.config（i18n.cookieKey）在构建期加载，引用不了本文件，
 *    所以改 COOKIE_KEYS.locale 必须同步改 nuxt.config（配置那处留了对应注释）
 */

// auth 域的状态键
export const AUTH_STATE_KEYS = {
  /** 登录那一刻的用户快照；页面级会话数据以 AsyncOutcome 为准（见 useAuth 注释） */
  user: 'auth:user',
  /** 登录动作的错误快照（ApiErrorSnapshot 形态） */
  error: 'auth:error'
} as const

// 设备域的状态键（全局横切的东西，服务端 device 插件是唯一写入方）
export const DEVICE_STATE_KEYS = {
  // 当前设备形态：'pc' | 'm'
  device: 'device:current'
} as const

// Cookie 键登记
export const COOKIE_KEYS = {
  // 登录凭据：机制归传输组合根管（注头读取），策略归 auth 域管（经 TokenStorage 读写）
  token: 'v_token',
  // 用户手动切端的选择，优先级高于 UA 判定
  device: 'v_device',
  // 语言偏好；要和 nuxt.config 的 i18n.detectBrowserLanguage.cookieKey 保持一致
  locale: 'v_locale'
} as const
