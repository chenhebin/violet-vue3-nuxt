import type { gsap } from 'gsap'
import type { Ref } from 'vue'

/**
 * 钉住叙事门面：把 target 钉在视口上，内部带 [data-step] 标记的子元素随滚动一个个切换
 * （Apple 产品页式 storytelling 的最小骨架）。
 * - pin + scrub 时间线：钉住期间靠滚动进度驱动"上一步淡出、本步淡入"
 * - 步数决定钉多久（end = (N-1)×100%），每步叠放定位是调用方 CSS 的活
 * - 第一步天然可见（不设初始隐藏），其余步骤用 gsap.set 预置 autoAlpha:0，防 scrub 开始前闪现
 * - 降级/context/revert 范式同 useReveal（解钉也由 ctx.revert 一起干掉）
 */
export function usePinnedSection(
  target: Ref<HTMLElement | null>,
  options: { start?: string } = {}
): void {
  const { start = 'top top' } = options

  let ctx: gsap.Context | null = null

  onMounted(() => {
    const root = target.value
    const { gsap, reduced } = useAnimation()
    if (reduced || !root) return
    ctx = gsap.context(() => {
      const steps = [...root.querySelectorAll<HTMLElement>('[data-step]')]
      if (steps.length < 2) return
      steps.slice(1).forEach((el) => {
        gsap.set(el, { autoAlpha: 0 })
      })
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start, end: `+=${(steps.length - 1) * 100}%`, pin: true, scrub: 0.6 }
      })
      steps.forEach((el, i) => {
        if (i === 0) return
        const prev = steps[i - 1]
        if (!prev) return
        tl.to(prev, { autoAlpha: 0 }, i - 1)
        tl.to(el, { autoAlpha: 1 }, i - 1)
      })
    })
  })

  onBeforeUnmount(() => ctx?.revert())
}
