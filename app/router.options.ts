import type { RouterOptions } from 'vue-router'

/**
 * 路由滚动接管：Lenis 活着时路由滚动一律走 lenis.scrollTo——vue-router 的原生
 * window.scrollTo 会与 Lenis 内部插值互相改写（实测滚到位后回弹）。
 * - 时序镜像 Nuxt 默认实现（pages/runtime/router.options.js）：等 page:loading:end
 *   + 过渡 Promise + rAF 再滚——out-in 过渡期新页未入 DOM，立即滚会被短页钳制（实测后退还原被钳到 0）
 * - 三种语义：前进后退还原历史位置（瞬时）、锚点平滑滑动、新页面回顶（瞬时）
 * - 注意 nuxtApp.hookOnce 类型有、运行时无——hookOnce 只在 nuxtApp.hooks 上（Nuxt 类型错位，实测踩坑）
 * - 降级（reduced → lenis 为 null）回落 vue-router 原生位置语义
 */
export default <RouterOptions>{
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp()
    const lenis = nuxtApp.$animation?.lenis

    // 同路径（hash/查询变更）不整页滚动：带 hash 则平滑滑过去
    if (to.path.replace(/\/$/, '') === from.path.replace(/\/$/, '')) {
      if (lenis && to.hash) {
        lenis.scrollTo(to.hash)
        return false
      }
      return savedPosition ?? { top: 0 }
    }

    if (!lenis) {
      if (savedPosition) return savedPosition
      if (to.hash) return { el: to.hash }
      return { top: 0 }
    }

    return new Promise<false>((resolve) => {
      const doScroll = () => {
        // 有界布局等待：还原位超出当前可滚高度说明布局未稳（pin-spacer/图片迟到），
        // 等下一帧再试（上限 10 帧）；锚点/回顶无高度前置，直接执行
        let tries = 0
        const attempt = () => {
          requestAnimationFrame(() => {
            // 等待期间用户又跳去了别处：本次滚动作废
            if (nuxtApp.$router.currentRoute.value.fullPath !== to.fullPath) {
              resolve(false)
              return
            }
            const top = savedPosition?.top ?? 0
            const max = document.documentElement.scrollHeight - window.innerHeight
            if (savedPosition && top > max && tries++ < 10) {
              attempt()
              return
            }
            // 先同步重算 limit：Lenis 内部 limit 走 ResizeObserver 异步更新，换页后布局刚变时
            // 仍是旧页缓存值，会内部钳位掉还原位（实测 DOM 已 1933 仍被钳到 0）
            lenis.resize()
            if (savedPosition) lenis.scrollTo(top, { immediate: true })
            else if (to.hash) lenis.scrollTo(to.hash)
            else lenis.scrollTo(0, { immediate: true })
          })
        }
        attempt()
      }
      nuxtApp.hooks.hookOnce('page:loading:end', () => {
        const pending: unknown = nuxtApp && '~transitionPromise' in nuxtApp ? nuxtApp['~transitionPromise'] : undefined
        if (pending instanceof Promise) pending.then(doScroll)
        else doScroll()
      })
    })
  }
}
