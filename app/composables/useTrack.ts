/**
 * 埋点域门面：业务事件统一出口，视图/服务层只面对本层。
 * - 每个事件自动注入 device / locale 维度（双端与语言分布免手动携带）
 * - device/locale 读取走横切层豁免通道：device 经键名登记册直读 useState
 *   （不走 useDevice 门面，防 useDevice↔useTrack 循环）；locale 走 $i18n
 *   （useLocale 的 useI18n 要求组件 setup 上下文，而 useTrack 会被插件链调用）
 * - 供应商（Umami）被隔离在本文件与 plugins/track.client.ts，更换只动这两处
 * - 未配置 websiteId 时为 no-op，业务调用零防御
 */

/**
 * Umami 脚本事件发送前处理：剥离 URL query（防 scene/token 类参数进报表）。挂为脚本属性后所有发送都会过这里
 * @param _type 事件类型（未使用）
 * @param payload 事件数据（包含 URL）
 * @returns 处理后的事件数据（URL 中 query 被剥离）
 * */
function stripQueryBeforeSend(_type: string, payload: Record<string, unknown>) {
  const url = payload.url
  if (typeof url === 'string' && url) {
    return { ...payload, url: url.split('?')[0] }
  }
  return payload
}

/**
 * Umami 脚本唯一注册处：插件（脚本加载）与门面（事件上报）必须共用本工厂——重复注册会用各自的选项重建 script 标签，
 * 后到者覆盖先到者的属性（实测 beforeSend 会被冲掉）。未配置 websiteId 时返回 null，整栈静默
 * @returns Umami 脚本实例（null 为未配置）
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
   * 业务动作上报：事件名传 TRACK_EVENTS 登记册常量（漏登记编译不过）；属性不塞中文/敏感信息
   * @param event 事件名（从 TRACK_EVENTS 登记册常量中取）
   * @param data 事件数据（包含事件属性）
   */
  function track(event: TrackEventName, data: Record<string, unknown> = {}) {
    script?.proxy.track(event, { ...data, device: device.value, locale: $i18n.locale.value })
  }

  /**
   * 会话关联（登录成功后调；只传 id，不带 PII）
   * @param id 会话 ID（一般为用户 ID）
   */
  function identify(id: string) {
    script?.proxy.identify({ id })
  }

  return { track, identify }
}
