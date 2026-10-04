/** 设备判定组合根：唯一入口写 useState（判定实现见 utils/device.ts 的 resolveDevice，输入采集归本层） */
export default defineNuxtPlugin(() => {
  const headers = useRequestHeaders(['user-agent', 'cookie'])
  const url = useRequestURL()
  const device = useState<Device>(DEVICE_STATE_KEYS.device)

  const cookie = headers.cookie?.match(new RegExp(`(?:^|;\\s*)${COOKIE_KEYS.device}=(pc|m)`))?.[1]
  device.value = resolveDevice({
    queryDevice: url.searchParams.get('device'),
    cookieDevice: cookie,
    userAgent: headers['user-agent'] ?? ''
  })
})
