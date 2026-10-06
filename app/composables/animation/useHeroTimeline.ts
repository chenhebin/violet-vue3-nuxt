import type { gsap } from 'gsap'
import type { Ref } from 'vue'

/**
 * 进场时间线门面（页面挂载就播，不等滚动）：target 内带 [data-hero] 标记的子元素
 * 按 DOM 顺序 stagger 一个个浮现——首屏 hero 区的标准入场。
 * - 跟 useReveal 的区别：入场时机是"挂载"而不是"滚动到"，适合首屏第一眼
 * - 要精细编排（重叠/错拍/多阶段）就扩展 timeline 位置参数，范式不变：
 *   ctx = gsap.context(() => { const tl = gsap.timeline(); tl.from(...).to(..., '<0.2') })
 * - 降级/context/revert 范式同 useReveal
 * @param target 动效舞台的模板 ref（在其内部查找 [data-hero] 标记元素）
 * @param options 时间线参数（位移/错拍/时长/整体延迟）
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
