import type { gsap } from 'gsap'
import type Lenis from 'lenis'

/**
 * 动画域门面：视图/组件只面对本层，gsap/lenis 供应商被隔离在本文件与 plugins/animation.client.ts，
 * 更换引擎只动这两处。reduced 为 true 时 lenis 为 null（原生滚动降级，视图层零分支判断）。
 */
export function useAnimation(): { gsap: typeof gsap; lenis: Lenis | null; reduced: boolean } {
  return useNuxtApp().$animation
}
