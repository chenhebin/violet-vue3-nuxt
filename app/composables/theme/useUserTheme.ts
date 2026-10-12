import type { UserThemeOverrides } from '#shared/types/theme'

/**
 * 用户自定义门面：白名单旋钮（登记册 app/constants/theme.ts）。
 * 机制：覆盖值经 app.vue 的 useHead 渲染成 <html style="--primary:…"> 内联变量——内联特异度高于
 * 一切选择器，天然覆盖 :root 与 [data-theme=dark]，全程不需要 !important，tokens.css 零改动。
 * 优先级语义：用户显式选择 > 主题预设 > 默认值。
 * 持久化：v_utheme cookie（一年）；账号级同步等真实后端接入时，commit 换成接口调用，形状不变。
 */
export function useUserTheme() {
  const { track } = useTrack()
  const store = useThemeStore()
  const { overrides } = storeToRefs(store)

  /** 即时预览：sanitize 后整包替换（写 store 即生效，未落 cookie） */
  function preview(o: UserThemeOverrides) {
    store.setOverrides(sanitizeUserOverrides(o))
  }

  /** 保存：固化当前覆盖到 cookie + 埋点（属性 keys 为实际生效的键，逗号串） */
  function commit() {
    track(TRACK_EVENTS.userThemeCommit, { keys: Object.keys(store.overrides).join(',') })
    document.cookie = buildCookie(COOKIE_KEYS.userTheme, serializeUserThemeCookie(store.overrides), { maxAge: 31536000 })
  }

  /** 重置：清 store + 过期 cookie */
  function reset() {
    store.setOverrides({})
    document.cookie = buildCookie(COOKIE_KEYS.userTheme, '', { maxAge: 0 })
  }
  return { overrides, preview, commit, reset }
}
