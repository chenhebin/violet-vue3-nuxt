import type { gsap } from 'gsap'
import type { Ref } from 'vue'

/**
 * 效果生命周期骨架（域内私有 seam，不进 index.ts 再导出——外部 interface 不变，
 * 效果门面仍是视图的唯一入口）：onMounted 取门面 → reduced/root 守卫 → gsap.context 包配方 → 卸载 revert + 额外清理。
 * 效果门面只写动画配方；SplitText 这类 context 外实例在配方里返回清理函数（revert 之后执行）。
 * @param target 动效舞台的模板 ref
 * @param recipe 动画配方：拿 (root, gsap) 建动画；返回清理函数可带走 context 管不到的实例（不返回即无额外清理）
 */
export function createEffect(
  target: Ref<HTMLElement | null>,
  recipe: (root: HTMLElement, engine: typeof gsap) => unknown
): void {
  let ctx: gsap.Context | null = null
  let extraCleanup: (() => void) | undefined

  onMounted(() => {
    const root = target.value
    // 组合根是 .client 插件，SSR 期 $animation 还不存在——必须在 onMounted（只在客户端跑）里取
    const { gsap, reduced } = useAnimation()
    // 降级直接跳过：元素天然可见、零内联样式
    if (reduced || !root) return
    ctx = gsap.context(() => {
      // 配方返回「清理函数或无」（unknown + typeof 收窄：eslint 禁 void 进联合类型）
      const extra = recipe(root, gsap)
      extraCleanup = isCleanup(extra) ? extra : undefined
    })
  })

  onBeforeUnmount(() => {
    // 先 revert（干掉触发器和内联样式，防换页泄漏），再跑配方自带的额外清理
    ctx?.revert()
    extraCleanup?.()
  })
}

/** 配方返回值的收窄守卫：「清理函数或无」（eslint 禁 void 进联合类型，故签名用 unknown） */
function isCleanup(value: unknown): value is () => void {
  return typeof value === 'function'
}
