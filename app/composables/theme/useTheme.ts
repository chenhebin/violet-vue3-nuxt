import type { Theme } from '#shared/types/theme'

/**
 * 主题域门面（切换的唯一出口）：状态从域 store（app/stores/theme.ts），cookie 键从登记册（keys.ts）。
 * 与 useDevice.switchDevice 的差异：切主题只改 CSS 变量，不整页刷新——device 刷新是因为双模板要整体
 * 重渲染，主题变量重算一次 paint 就够，刷新反而伤体验。
 */
export function useTheme() {
  const { track } = useTrack()
  const store = useThemeStore()
  const { theme } = storeToRefs(store)

  /**
   * 切主题：埋点 + 写 cookie（一年）+ 写 store；app.vue 的 useHead 响应式更新 <html data-theme>
   * @param t 目标主题
   */
  function switchTheme(t: Theme) {
    track(TRACK_EVENTS.themeSwitch, { to: t })
    document.cookie = buildCookie(COOKIE_KEYS.theme, t, { maxAge: 31536000 })
    store.setTheme(t)
  }
  /** 在两态之间翻转 */
  function toggleTheme() {
    switchTheme(theme.value === 'light' ? 'dark' : 'light')
  }
  return { theme, switchTheme, toggleTheme }
}
