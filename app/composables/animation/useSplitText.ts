import { SplitText } from 'gsap/SplitText'
import type { gsap } from 'gsap'
import type { Ref } from 'vue'

/**
 * 逐字/逐词入场门面：target 内带 [data-split] 标记的元素被 SplitText 拆开后
 * 按 stagger 一个个浮现（大牌官网标题式入场）。
 * - 拆分粒度 by: 'chars'（逐字）| 'words'（逐词，中文长句推荐，不然字太多太碎）
 * - 全站走系统字体栈（字体模块所有 provider 都禁了），没有 webfont 迟到导致的拆分回流问题
 * - SplitText 实例不归 gsap.context 管：单独收集，卸载时逐个 revert() 把原始文本节点还原
 * - 降级/context/revert 范式同 useReveal
 */
export function useSplitText(
  target: Ref<HTMLElement | null>,
  options: { by?: 'chars' | 'words'; y?: number; stagger?: number; duration?: number; start?: string } = {}
): void {
  const { by = 'chars', y = 24, stagger = 0.02, duration = 0.6, start = 'top 85%' } = options

  let ctx: gsap.Context | null = null
  const splits: SplitText[] = []

  onMounted(() => {
    const root = target.value
    const { gsap, reduced } = useAnimation()
    if (reduced || !root) return
    ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
        const split = new SplitText(el, { type: by })
        splits.push(split)
        gsap.from(split[by], { opacity: 0, y, stagger, duration, scrollTrigger: { trigger: el, start } })
      })
    })
  })

  onBeforeUnmount(() => {
    ctx?.revert()
    splits.forEach((split) => {
      split.revert()
    })
    splits.length = 0
  })
}
