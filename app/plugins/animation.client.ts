import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

/**
 * 动画总开关间（只在浏览器跑，服务端什么都不执行）：
 * 把 GSAP/ScrollTrigger/Lenis 接好线，再统一发给全站用。
 * - 为什么不用 lenis/nuxt 模块：那玩意只给你一个 <VueLenis> 组件，得在组件里拿实例；
 *   我们要的是全站唯一一个 Lenis，在插件里建好，页面随便用，也没有时序问题
 * - Lenis 自己的动画循环关掉（autoRaf: false），交给 gsap 的时钟带着走——
 *   整个页面只有一个 requestAnimationFrame 循环，动画和滚动永远同拍，
 *   下面三行接法是 Lenis 官方 README 的 GSAP 章节原样抄的
 * - 用户系统开了"减弱动态效果"（prefers-reduced-motion）时，lenis 就是 null：
 *   原生滚动、零动画，后面所有地方只需要看一眼 reduced 标志
 * - gsap/lenis 只有本文件和 composables 门面能碰，视图层直接 import 会被 eslint 拦下
 */
export default defineNuxtPlugin((nuxtApp) => {
  // 效果门面要用到的官方插件都统一在这注册（3.13 之后全免费）；加新插件就在这加一行
  gsap.registerPlugin(ScrollTrigger, SplitText)

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let lenis: Lenis | null = null
  if (!reduced) {
    lenis = new Lenis({ autoRaf: false })
    // Lenis 每滚一帧都叫一声 ScrollTrigger.update，让它立刻重算位置（不然动画会慢半拍）
    lenis.on('scroll', ScrollTrigger.update)
    // 用 gsap 的时钟驱动 Lenis 的插值循环（gsap 给秒，lenis 要毫秒，所以乘 1000）
    gsap.ticker.add(time => lenis!.raf(time * 1000))
    // gsap 默认有个"掉帧补偿"（停一会再回来时假装只过了 33ms），对动画合理，
    // 但滚动必须实时——滚了半天页面不动谁也受不了，所以关掉
    gsap.ticker.lagSmoothing(0)
  }

  // 单页应用换页后，图片/字体可能姗姗来迟把页面撑高，滚动触发的位置就量歪了，这里重新量一遍
  nuxtApp.hook('page:finish', () => ScrollTrigger.refresh())

  return {
    provide: {
      // provide 的键不要自己带 $，Nuxt 注入时会统一加，写成 $animation 会变成 $$animation（实测踩过）
      animation: { gsap, lenis, reduced }
    }
  }
})
