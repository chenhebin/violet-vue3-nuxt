# 动画栈

术语（门面、组合根、效果门面）见 [GLOSSARY.md](../../GLOSSARY.md)。动画三件（gsap / lenis / lottie-web）被隔离在组合根与门面两处，视图层永远不 import 动画库。

## 军规

1. GSAP 插件只在 `app/plugins/animation.client.ts` 集中注册；加新插件就在那加一行 `[Review]`
2. Lenis 全站唯一实例在组合根创建（`autoRaf: false`，交 gsap ticker 驱动）；不使用 lenis/nuxt 模块，不在组件里建实例 `[Review]`
3. `useAnimation()` 是唯一直接访问 `{ gsap, lenis, reduced }` 的底层口 `[Review]`
4. 视图 / 页面层禁止 import `gsap` / `lenis` / `lottie-web` `[ESLint]`
5. 新效果门面照 `app/composables/animation/useReveal.ts` 范式写（四步骨架见下）`[Review]`
6. 效果经显式 `data-*` 标记制作用于元素：没标记就不动，防误伤 `[Review]`
7. 动画全部收纳进 `gsap.context`，`onBeforeUnmount` 里 `revert()`；SplitText 实例单独收集、单独 revert（不受 context 管）`[Review]`
8. 门面必须在 `onMounted` 里取 `useAnimation()`（`$animation` 是 `.client` 插件，SSR 期不存在），`reduced` 命中直接 return `[Review]`
9. `prefers-reduced-motion` 降级是第一公民：降级时 `lenis` 为 null、元素天然可见、零内联样式；效果门面里不写降级分支以外的降级逻辑 `[Review]`
10. Lottie 一律走 `BasicCommonLottiePlayer`，不直连 lottie-web `[ESLint]`（视图层）/ `[Review]`（其余）

## 组合根接线（canonical：`app/plugins/animation.client.ts`）

只在浏览器跑。固定接法（Lenis 官方 GSAP 配方，别改）：

- `gsap.registerPlugin(ScrollTrigger, SplitText)` — 插件集中注册
- `lenis.on('scroll', ScrollTrigger.update)` — 滚一帧立刻重算触发位置
- `gsap.ticker.add(time => lenis.raf(time * 1000))` — gsap 给秒、lenis 要毫秒；整页只有一个 rAF 循环，动画和滚动永远同拍
- `gsap.ticker.lagSmoothing(0)` — 关掉掉帧补偿，滚动必须实时
- `page:finish` 时 `ScrollTrigger.refresh()` — 换页后迟到的图片 / 字体把页面撑高，重新量一遍
- `provide` 的键不带 `$` 前缀（Nuxt 注入时统一加，写 `$animation` 会变 `$$animation`）

## 效果门面清单（`app/composables/animation/`，经 `index.ts` 再导出）

| 门面 | 标记 | 用途 |
|---|---|---|
| `useAnimation` | — | 底层访问口，直返组合根发下来的 `{ gsap, lenis, reduced }` |
| `useReveal` | `data-reveal` | 滚动显现：标记元素进视口时从下往上淡入（默认参数见门面文件） |
| `useHeroTimeline` | `data-hero` | 首屏进场：挂载就播，按 DOM 顺序 stagger 浮现 |
| `useSplitText` | `data-split` | 逐字 / 逐词入场（SplitText 拆字） |
| `useParallax` | `data-parallax="120"` | 视差：标记值是振幅，scrub 模式滚多少动多少 |
| `usePinnedSection` | `data-step` | 钉住叙事：整节钉在视口，滚动驱动步骤切换 |

新效果门面加进域文件夹后，在 `index.ts` 再导出（auto-import 经 `composables/*/index.ts` 生效）。

## 效果门面范式（四步骨架）

照 `useReveal.ts` 抄：

```ts
export function useXxx(target: Ref<HTMLElement | null>, options = {}) {
  let ctx: gsap.Context | null = null
  onMounted(() => {
    const root = target.value
    const { gsap, reduced } = useAnimation()   // 必须在 onMounted 里取（SSR 期不存在）
    if (reduced || !root) return               // 降级直接跳过：元素天然可见
    ctx = gsap.context(() => {
      root.querySelectorAll('[data-xxx]').forEach((el) => { /* gsap 调用 */ })
    })
  })
  onBeforeUnmount(() => ctx?.revert())          // 干掉触发器和内联样式，防换页泄漏
}
```

- `target` 显式传模板 ref（好过自动去查组件根）
- 视图用法三行：`const root = ref(null)` → `useReveal(root)` → 模板里 `ref="root"` + 元素打标记
- 完整示范页：`app/views/pc/AnimationDemoPage.vue`（每一节配一个效果门面）

## Lottie 播放器（canonical：`app/components/basic/common/LottiePlayer.vue`）

- 业务无感层组件：动画数据 / 路径全从 props 传
- 动态 import `lottie_web/build/player/lottie_light`（体积约半，首屏不背）
- 传入内联 `animationData` 时内部 `structuredClone` 深拷贝（lottie 会就地改写常量）
- 进视口播（IntersectionObserver）、出视口停；卸载时 destroy + disconnect

## 路由滚动

`app/router.options.ts` 接管 `scrollBehavior`：只要 Lenis 在，切页滚动全走 `lenis.scrollTo`（vue-router 自带的 `window.scrollTo` 会和 Lenis 抢位置）；滚前先 `lenis.resize()` 同步 limit（防还原位被旧缓存钳掉）；`lenis` 为 null 时回落原生位置语义。改路由行为先看这个文件。
