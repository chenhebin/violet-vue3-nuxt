import type { gsap } from 'gsap'
import type Lenis from 'lenis'

/**
 * 动画域门面：视图/组件只面对本层，gsap/lenis 供应商被关在本文件与 plugins/animation.client.ts 里，
 * 换引擎只动这两处。reduced 为 true 时 lenis 是 null（降级成原生滚动，视图层不用写分支判断）。
 */
export function useAnimation(): { gsap: typeof gsap; lenis: Lenis | null; reduced: boolean } {
  return useNuxtApp().$animation
}
