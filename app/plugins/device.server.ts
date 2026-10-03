const MOBILE_RE = /(android|iphone|ipod|ipad|windows phone|mobile|webos|blackberry|opera mini)/i

/** 设备判定的唯一入口：状态键与 cookie 键均来自登记册，两处永不漂移 */
export default defineNuxtPlugin(() => {
  const headers = useRequestHeaders(['user-agent', 'cookie'])
  const url = useRequestURL()
  const device = useState<Device>(DEVICE_STATE_KEYS.device)

  const query = url.searchParams.get('device')
  const cookie = headers.cookie?.match(new RegExp(`(?:^|;\\s*)${COOKIE_KEYS.device}=(pc|m)`))?.[1]
  const byUA = MOBILE_RE.test(headers['user-agent'] ?? '') ? 'm' : 'pc'

  device.value = (
    query === 'pc' || query === 'm' ? query
      : cookie ?? byUA
  ) as Device
})
