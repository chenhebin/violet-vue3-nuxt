import type { gsap } from 'gsap'
import type { Ref } from 'vue'

/**
 * 进场时间线门面（页面挂载即播，不等滚动）：target 内带 [data-hero] 标记的子元素
 * 按 DOM 顺序 stagger 依次浮现——首屏 hero 区标准入场。
 * - 与 useReveal 的差异：入场时机是"挂载"而非"滚动到"，适合首屏第一眼
 * - 需要精细编排（重叠/错拍/多阶段）时扩展 timeline 位置参数，范式不变：
 *   ctx = gsap.context(() => { const tl = gsap.timeline(); tl.from(...).to(..., '<0.2') })
 * - 降级/context/revert 范式同 useReveal
 */
export function useHeroTimeline(
  target: Ref<HTMLElement | null>,
  options: { y?: number; stagger?: number; duration?: number; delay?: number } = {}
): void {
  const { y = 32, stagger = 0.12, duration = 0.7, delay = 0.1 } = options

  let ctx: gsap.Context | null = null

  onMounted(() => {
    const root = target.value
    const { gsap, reduced } = useAnimation()
    if (reduced || !root) return
    ctx = gsap.context(() => {
      gsap
        .timeline({ delay })
        .from(root.querySelectorAll('[data-hero]'), { opacity: 0, y, stagger, duration })
    })
  })

  onBeforeUnmount(() => ctx?.revert())
}
