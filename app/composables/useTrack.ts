/**
 * 埋点域门面：业务事件统一出口，视图/服务层只面对本层。
 * - 每个事件自动带上 device / locale 维度（双端和语言分布不用手动传）
 * - device/locale 走横切层的豁免通道：device 经键名登记册直读 useState
 *   （不走 useDevice 门面，不然 useDevice↔useTrack 会循环依赖）；locale 走 $i18n
 *   （useLocale 里的 useI18n 要求组件 setup 上下文，而 useTrack 会被插件链调用）
 * - 供应商（Umami）被隔离在本文件与 plugins/track.client.ts，换家只动这两处
 * - 没配 websiteId 时就是 no-op，业务调用处零防御
 */

/**
 * Umami 脚本每次发事件前的处理：把 URL 里的 query 剥掉（防 scene/token 这类参数进报表）。挂成脚本属性后所有发送都会过这里
 * @param _type 事件类型（未使用）
 * @param payload 事件数据（包含 URL）
 * @returns 处理后的事件数据（URL 的 query 已被剥掉）
 * */
function stripQueryBeforeSend(_type: string, payload: Record<string, unknown>) {
  const url = payload.url
  if (typeof url === 'string' && url) {
    return { ...payload, url: url.split('?')[0] }
  }
  return payload
}

/**
 * Umami 脚本唯一注册处：插件（负责加载脚本）和门面（负责事件上报）必须共用这个工厂——各注册一遍会用各自的选项重建 script 标签，
 * 后到的把先到的属性覆盖掉（实测 beforeSend 会被冲没）。没配 websiteId 时返回 null，整栈静默
 * @returns Umami 脚本实例（null 表示未配置）
 */
export function useUmamiScript() {
  const config = useRuntimeConfig()
  const websiteId = config.public.umami.websiteId
  return websiteId
    ? useScriptUmamiAnalytics({
        websiteId,
        hostUrl: config.public.umami.hostUrl || undefined,
        beforeSend: stripQueryBeforeSend
      })
    : null
}

/**
 * 埋点域门面：业务事件统一出口，视图/服务层只面对本层。
 * @returns 业务动作上报函数（track）与会话关联函数（identify）
 * */
export function useTrack() {
  const script = useUmamiScript()
  const device = useState<Device>(DEVICE_STATE_KEYS.device)
  const { $i18n } = useNuxtApp()

  /**
   * 业务动作上报：事件名必须传 TRACK_EVENTS 登记册里的常量（漏登记编译不过）；属性里别塞中文/敏感信息
   * @param event 事件名（从 TRACK_EVENTS 登记册常量中取）
   * @param data 事件数据（包含事件属性）
   */
  function track(event: TrackEventName, data: Record<string, unknown> = {}) {
    script?.proxy.track(event, { ...data, device: device.value, locale: $i18n.locale.value })
  }

  /**
   * 会话关联（登录成功后调；只传 id，不带 PII）
   * @param id 会话 ID（一般是用户 ID）
   */
  function identify(id: string) {
    script?.proxy.identify({ id })
  }

  return { track, identify }
}
