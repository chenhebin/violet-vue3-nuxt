import type { gsap } from 'gsap'
import type { Ref } from 'vue'

/**
 * 视差效果门面：target 内带 [data-parallax] 标记的元素随滚动全程慢速位移。
 * - scrub 模式：滚动进度 = 动画进度（滚多少动多少，非"到点播一遍"，与 useReveal 的本质差异）
 * - ease 必须为 none：scrub 下任何缓动都会造成"滚动与位移脱节"的手感断裂
 * - 振幅：标记值即该层振幅（data-parallax="120" → ±120px 位移），未带值用默认 amplitude；
 *   分层视差 = 同一舞台里给背景层大振幅、前景层小振幅
 * - 默认行程：元素顶进入视口底（top bottom）→ 元素底离开视口顶（bottom top）
 * - 降级/context/revert 范式同 useReveal（见该文件头注）
 */
export function useParallax(
  target: Ref<HTMLElement | null>,
  options: { amplitude?: number; start?: string; end?: string } = {}
): void {
  const { amplitude = 48, start = 'top bottom', end = 'bottom top' } = options

  let ctx: gsap.Context | null = null

  onMounted(() => {
    const root = target.value
    const { gsap, reduced } = useAnimation()
    if (reduced || !root) return
    ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        const amp = Number(el.dataset.parallax) || amplitude
        gsap.fromTo(el, { y: -amp }, { y: amp, ease: 'none', scrollTrigger: { trigger: el, start, end, scrub: true } })
      })
    })
  })

  onBeforeUnmount(() => ctx?.revert())
}
