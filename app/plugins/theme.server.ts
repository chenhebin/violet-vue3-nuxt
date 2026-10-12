import type { Theme } from '#shared/types/theme'

// 主题的组合根（SSR 直出 <html data-theme> 与 <html style="--primary:…">，零闪屏的唯一保证：服务端渲染时结论已定）。
// dependsOn pinia：要拿 $pinia 实例写 store，不赌"模块插件先于 app 插件"的插入序。
export default defineNuxtPlugin({
  name: 'theme',
  dependsOn: ['pinia'],
  setup(nuxtApp) {
    const headers = useRequestHeaders(['cookie'])

    // 无 cookie / 非法值一律亮色（显式白名单：只认 dark，其余全兜底 light）
    const themeRaw = parseCookie(headers.cookie, COOKIE_KEYS.theme)
    const theme: Theme = themeRaw === 'dark' ? 'dark' : 'light'
    // 用户覆盖：cookie 不可信，必须过白名单校验（utils/userTheme.ts 的静默丢弃策略）
    const userRaw = parseCookie(headers.cookie, COOKIE_KEYS.userTheme)

    const store = useThemeStore(nuxtApp.$pinia)
    store.setTheme(theme)
    store.setOverrides(sanitizeUserOverrides(parseUserThemeCookie(userRaw)))
  }
})
