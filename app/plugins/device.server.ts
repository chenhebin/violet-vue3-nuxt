/** 设备判定的组合根（唯一往全局状态写结论的入口；怎么判在 utils/device.ts 的 resolveDevice，这个文件只负责收集输入） */
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
