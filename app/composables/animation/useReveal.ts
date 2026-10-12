import type { Ref } from 'vue'
import { createEffect } from './createEffect'

/**
 * 滚动显现效果门面（动效范式原语，后续动效照这个范式长）：
 * target 内带 [data-reveal] 标记的元素进入视口时从下往上淡入——显式标记制，没标记就不动，防误伤。
 * 生命周期骨架（挂载/降级跳过/context/revert）收在 createEffect，本文件只写动画配方。
 * - prefers-reduced-motion 命中：createEffect 直接跳过，元素天然可见、零内联样式
 * - target 传模板 ref（显式传，好过自动去查组件根）
 * @param target 动效舞台的模板 ref（在其内部查找 [data-reveal] 标记元素）
 * @param options 动画参数（位移/时长/触发起点）
 */
export function useReveal(
  target: Ref<HTMLElement | null>,
  options: { y?: number; duration?: number; start?: string } = {}
): void {
  const { y = 24, duration = 0.6, start = 'top 85%' } = options

  createEffect(target, (root, gsap) => {
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.from(el, { opacity: 0, y, duration, scrollTrigger: { trigger: el, start } })
    })
  })
}
