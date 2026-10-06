// device 域 store：设备结论（pc/m）的全局状态位。
//
// - 唯一写入方是 plugins/device.server.ts（SSR 判定后 setDevice 写入）；
//   SSR 侧 pinia 状态由 @pinia/nuxt 自动进 payload 传客户端
// - 切端不走 setDevice：经 useDevice 门面写 v_device cookie 后整页刷新重判（自适应架构不做实时换模板）
// - 不持久化（无 persist 配置）：它的持久化就是 v_device cookie，store 不落 localStorage
export const useDeviceStore = defineStore(PINIA_STORE_IDS.device, () => {
  // 当前设备形态：'pc' | 'm'（类型沿用 shared/types/device.ts，app 与 server 共用语义）
  const device = ref<Device>('pc')
  // 是否手机端（布局选 m 还是 pc 全看这个）
  const isMobile = computed(() => device.value === 'm')

  /**
   * SSR 判定结论的唯一入口（只有 device.server 插件调；切端走 cookie + 整页刷新，见头注）
   * @param d 设备类型
   */
  function setDevice(d: Device) {
    device.value = d
  }

  return { device, isMobile, setDevice }
})
