import type { RouterOptions } from 'vue-router'

/**
 * 路由滚动的接管逻辑：只要 Lenis 在，切页面时的滚动全走 lenis.scrollTo——vue-router
 * 自带的 window.scrollTo 会和 Lenis 内部的插值互相抢着改位置（实测滚到位后又弹回去）。
 * - 时序照抄 Nuxt 默认实现（pages/runtime/router.options.js）：等 page:loading:end
 *   + 过渡的 Promise + rAF 再滚——out-in 过渡期间新页面还没进 DOM，立刻滚会被短页钳住
 *   （实测后退时想还原的位置被钳到 0）
 * - 三种情况：前进后退还原历史位置（瞬时）、锚点平滑滑过去、新页面回顶部（瞬时）
 * - 注意 nuxtApp.hookOnce 类型里有、运行时没有——hookOnce 只存在于 nuxtApp.hooks 上
 *   （Nuxt 的类型和运行时对不上，实测踩过的坑）
 * - 降级（用户开了减少动画 → lenis 为 null）时回落 vue-router 原生的位置语义
 */
export default <RouterOptions>{
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp()
    const lenis = nuxtApp.$animation?.lenis

    // 同一路径（只是 hash/查询变了）不做整页滚动：带 hash 就平滑滑过去
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
        // 有上限地等布局稳定：要还原的位置超出当前能滚的高度，说明布局还没稳
        // （pin-spacer/图片迟到），等下一帧再试（最多 10 帧）；锚点/回顶不用等高度，直接执行
        let tries = 0
        const attempt = () => {
          requestAnimationFrame(() => {
            // 等的这功夫用户又跳去别的页面了：这次滚动作废
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
            // 滚之前先同步重算一次 limit：Lenis 内部的 limit 走 ResizeObserver 异步更新，
            // 换页后布局刚变时还是旧页的缓存值，内部会把还原位钳掉（实测 DOM 已 1933 仍被钳到 0）
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
