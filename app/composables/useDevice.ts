/** 设备域门面（设备判定的唯一出口）：状态键和切端 cookie 的键名都从键名登记册拿（app/constants/keys.ts）；Device 类型见 shared/types/device.ts */
export function useDevice() {
  const { track } = useTrack()
  const device = useState<Device>(DEVICE_STATE_KEYS.device, () => 'pc')
  const isMobile = computed(() => device.value === 'm')

  /** 手动切端：先写 cookie 再整页刷新（自适应架构不做实时换模板，刷新最省事） */
  function switchDevice(d: Device) {
    track(TRACK_EVENTS.deviceSwitch, { to: d })
    document.cookie = `${COOKIE_KEYS.device}=${d}; path=/; max-age=31536000`
    window.location.reload()
  }
  return { device, isMobile, switchDevice }
}
