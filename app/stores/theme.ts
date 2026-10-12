import type { Theme, UserThemeOverrides } from '#shared/types/theme'

// theme 域 store：当前主题 + 用户覆盖的全局状态位。
// - 写入方只有 plugins/theme.server.ts（SSR 从 cookie 恢复）与两个门面：useTheme（switchTheme）、
//   useUserTheme（preview/reset）；SSR 侧 pinia 状态由 @pinia/nuxt 自动进 payload 传客户端
// - 不持久化：它的持久化就是 v_theme / v_utheme 两个 cookie
export const useThemeStore = defineStore(PINIA_STORE_IDS.theme, () => {
  const theme = ref<Theme>('light')
  function setTheme(t: Theme) {
    theme.value = t
  }

  // 用户覆盖（白名单键，sanitize 后才允许进来）；app.vue 经 toStyleAttr 直出 <html style>
  const overrides = ref<UserThemeOverrides>({})
  function setOverrides(o: UserThemeOverrides) {
    overrides.value = o
  }

  return { theme, setTheme, overrides, setOverrides }
})
