import type { Ref } from 'vue'
import { createEffect } from './createEffect'

/**
 * 进场时间线门面（页面挂载就播，不等滚动）：target 内带 [data-hero] 标记的子元素
 * 按 DOM 顺序 stagger 一个个浮现——首屏 hero 区的标准入场。
 * - 跟 useReveal 的区别：入场时机是"挂载"而不是"滚动到"，适合首屏第一眼
 * - 要精细编排（重叠/错拍/多阶段）就在配方里扩 timeline 位置参数，范式不变：
 *   createEffect(target, (root, gsap) => { const tl = gsap.timeline(); tl.from(...).to(..., '<0.2') })
 * - 生命周期骨架在 createEffect（降级/context/revert 见 useReveal 头注）
 * @param target 动效舞台的模板 ref（在其内部查找 [data-hero] 标记元素）
 * @param options 时间线参数（位移/错拍/时长/整体延迟）
 */
export function useHeroTimeline(
  target: Ref<HTMLElement | null>,
  options: { y?: number; stagger?: number; duration?: number; delay?: number } = {}
): void {
  const { y = 32, stagger = 0.12, duration = 0.7, delay = 0.1 } = options

  createEffect(target, (root, gsap) => {
    gsap
      .timeline({ delay })
      .from(root.querySelectorAll('[data-hero]'), { opacity: 0, y, stagger, duration })
  })
}
