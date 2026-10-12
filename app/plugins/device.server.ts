// 设备判定的组合根（唯一往全局状态写结论的入口；怎么判在 utils/device.ts 的 resolveDevice，这里只负责收集输入）。
// dependsOn pinia：要拿 $pinia 实例写 store，不赌"模块插件先于 app 插件"的插入序。
export default defineNuxtPlugin({
  name: 'device',
  dependsOn: ['pinia'],
  setup(nuxtApp) {
    const headers = useRequestHeaders(['user-agent', 'cookie'])
    const url = useRequestURL()

    const cookieRaw = parseCookie(headers.cookie, COOKIE_KEYS.device)
    // 白名单在调用侧：cookie 不可信，只认 pc/m
    const cookieDevice = cookieRaw === 'pc' || cookieRaw === 'm' ? cookieRaw : undefined
    // 结论写进 device store（显式传 nuxtApp.$pinia，不赌当前激活实例）；SSR 侧 pinia 状态由 @pinia/nuxt 自动进 payload 传给客户端
    useDeviceStore(nuxtApp.$pinia).setDevice(resolveDevice({
      queryDevice: url.searchParams.get('device'),
      cookieDevice,
      userAgent: headers['user-agent'] ?? ''
    }))
  }
})
