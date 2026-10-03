/** 设备域门面：状态键与切端 cookie 一律取自键名登记册（app/constants/keys.ts）；Device 类型见 shared/types/device.ts */
export function useDevice() {
  const { track } = useTrack()
  const device = useState<Device>(DEVICE_STATE_KEYS.device, () => 'pc')
  const isMobile = computed(() => device.value === 'm')

  /** 手动切端：写 cookie 后整页刷新（自适应架构不做实时换模板） */
  function switchDevice(d: Device) {
    track(TRACK_EVENTS.deviceSwitch, { to: d })
    document.cookie = `${COOKIE_KEYS.device}=${d}; path=/; max-age=31536000`
    window.location.reload()
  }
  return { device, isMobile, switchDevice }
}
