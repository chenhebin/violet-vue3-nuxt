/**
 * 埋点事件名登记册（业务事件唯一出处）——查「某个动作在报表里叫什么」只看这里。
 *
 * 规则：
 * 1. 值即 Umami 报表中的事件名，动词_名词 snake_case，不含中文/敏感信息
 * 2. 视图/服务层上报一律传 TRACK_EVENTS 常量（如 TRACK_EVENTS.loginSuccess），
 *    禁止在调用点写事件名字面量；useTrack 入参已收敛为登记册值的联合，漏登记编译不过
 * 3. 事件属性（device/locale 自动注入除外）登记在各挂点处，不在此处建模板
 */

/** 业务事件登记（auth 域挂点：app/composables/useAuth.ts；设备域挂点：app/composables/useDevice.ts） */
export const TRACK_EVENTS = {
  /** 登录成功；登录后另有 identify 关联会话 */
  loginSuccess: 'login_success',
  /** 登录失败；属性：kind、code */
  loginFail: 'login_fail',
  /** 登出（无论后端结果） */
  logout: 'logout',
  /** 会话过期（loadMe 收到 auth 类失败） */
  sessionExpired: 'session_expired',
  /** 手动切端；属性：to ('pc'|'m') */
  deviceSwitch: 'device_switch'
} as const

export type TrackEventName = (typeof TRACK_EVENTS)[keyof typeof TRACK_EVENTS]
