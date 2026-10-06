import type { gsap } from 'gsap'
import type { Ref } from 'vue'

/**
 * 视差效果门面：target 内带 [data-parallax] 标记的元素随滚动全程慢慢位移。
 * - scrub 模式：滚动进度就是动画进度（滚多少动多少，不是"到点播一遍"，这是跟 useReveal 的本质差异）
 * - ease 必须是 none：scrub 下任何缓动都会让"滚动和位移对不上"，手感一下就断了
 * - 振幅：标记的值就是该层的振幅（data-parallax="120" → 上下各移 120px），没带值就用默认 amplitude；
 *   分层视差 = 同一个舞台里背景层给大振幅、前景层给小振幅
 * - 默认行程：元素顶进视口底（top bottom）开始 → 元素底出视口顶（bottom top）结束
 * - 降级/context/revert 范式同 useReveal（见那个文件的头注）
 * @param target 动效舞台的模板 ref（在其内部查找 [data-parallax] 标记元素）
 * @param options 视差参数（默认振幅/行程起止点）
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
