import type { gsap } from 'gsap'
import type { Ref } from 'vue'

/**
 * 滚动显现效果门面（动效范式原语，后续动效照这个范式长）：
 * target 内带 [data-reveal] 标记的元素进入视口时从下往上淡入——显式标记制，没标记就不动，防误伤。
 * - prefers-reduced-motion 命中就直接跳过：元素天然可见、零内联样式（降级判定在组合根，视图层零分支）
 * - gsap.context 收纳全部动画（含 ScrollTrigger），onBeforeUnmount revert() 干掉触发器和内联样式，防 SPA 换页泄漏
 * - target 传模板 ref（显式传，好过自动去查组件根）
 * @param target 动效舞台的模板 ref（在其内部查找 [data-reveal] 标记元素）
 * @param options 动画参数（位移/时长/触发起点）
 */
export function useReveal(
  target: Ref<HTMLElement | null>,
  options: { y?: number; duration?: number; start?: string } = {}
): void {
  const { y = 24, duration = 0.6, start = 'top 85%' } = options

  let ctx: gsap.Context | null = null

  onMounted(() => {
    const root = target.value
    // 组合根是 .client 插件，SSR 期 $animation 还不存在——门面必须在 onMounted（只在客户端跑）里取
    const { gsap, reduced } = useAnimation()
    if (reduced || !root) return
    ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, { opacity: 0, y, duration, scrollTrigger: { trigger: el, start } })
      })
    })
  })

  onBeforeUnmount(() => ctx?.revert())
}
