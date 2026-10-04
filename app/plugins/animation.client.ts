import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

/**
 * 动画组合根（仅客户端）：ScrollTrigger 注册 + Lenis 平滑滚动接线，SSR 零输出。
 * - 不走 lenis/nuxt 模块：该模块只提供 <VueLenis> 组件与组件上下文 useLenis，
 *   本项目用 app 级单例 + 组合根注入（插件先于组件挂载，无注入时序依赖）
 * - Lenis raf 交由 gsap.ticker 驱动（全局单一 rAF 循环），接线为官方 README
 *   「GSAP integration」配方逐字落地；autoRaf 必须关（防双循环）
 * - prefers-reduced-motion 命中时 lenis 为 null：原生滚动 + 零动画降级
 * - 动画供应商被隔离在本文件与 composables 门面，视图层禁直连（eslint 门禁）
 */
export default defineNuxtPlugin((nuxtApp) => {
  // 效果门面用到的官方插件统一在此注册（3.13+ 全免费）；新插件加一行
  gsap.registerPlugin(ScrollTrigger, SplitText)

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let lenis: Lenis | null = null
  if (!reduced) {
    lenis = new Lenis({ autoRaf: false })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(time => lenis!.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
  }

  // SPA 换页后图片/字体迟到导致的布局位移校正
  nuxtApp.hook('page:finish', () => ScrollTrigger.refresh())

  return {
    provide: {
      animation: { gsap, lenis, reduced }
    }
  }
})
