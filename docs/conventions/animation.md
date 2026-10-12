# 动画栈

术语（门面、组合根、效果门面）见 [GLOSSARY.md](../../GLOSSARY.md)。动画三件（gsap / lenis / lottie-web）被隔离在组合根与门面两处，视图层永远不 import 动画库。

## 军规

1. GSAP 插件只在 `app/plugins/animation.client.ts` 集中注册；加新插件就在那加一行 `[Review]`
2. Lenis 全站唯一实例在组合根创建（`autoRaf: false`，交 gsap ticker 驱动）；不使用 lenis/nuxt 模块，不在组件里建实例 `[Review]`
3. `useAnimation()` 是唯一直接访问 `{ gsap, lenis, reduced }` 的底层口 `[Review]`
4. 视图 / 页面层禁止 import `gsap` / `lenis` / `lottie-web` `[ESLint]`
5. 新效果门面用 `createEffect`（`app/composables/animation/createEffect.ts`）收生命周期，自己只写动画配方（照 `useReveal.ts` 抄）`[Review]`
6. 效果经显式 `data-*` 标记制作用于元素：没标记就不动，防误伤 `[Review]`
7. 动画全部收纳进 `gsap.context`，卸载 `revert()` 由 `createEffect` 统一做；SplitText 这类 context 外实例在配方里返回清理函数（`createEffect` 在 revert 之后执行）。播放器（basic 层）经 `utils/motion.ts` 的 `prefersReducedMotion()` 判降级（查询串单点），播停骨架共用 `basic/common/observePlayPause.ts``[Review]`
8. `useAnimation()` 必须在 `onMounted` 里取（`$animation` 是 `.client` 插件，SSR 期不存在）——这步已收进 `createEffect`，门面配方里不要再取 `[Review]`
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

## 效果门面范式（createEffect 收骨架）

照 `useReveal.ts` 抄——生命周期骨架（挂载取门面 → 降级跳过 → context → revert）只在 `createEffect.ts` 出现一次：

```ts
export function useXxx(target: Ref<HTMLElement | null>, options = {}) {
  createEffect(target, (root, gsap) => {
    root.querySelectorAll('[data-xxx]').forEach((el) => { /* gsap 调用 */ })
  })
}
```

- SplitText 这类 context 管不到的实例：配方返回清理函数，`createEffect` 在 `ctx.revert()` 之后执行
- `target` 显式传模板 ref（好过自动去查组件根）
- 视图用法三行：`const root = ref(null)` → `useReveal(root)` → 模板里 `ref="root"` + 元素打标记
- 完整示范页：`app/views/pc/AnimationDemoPage.vue`（每一节配一个效果门面）

## Lottie 播放器（canonical：`app/components/basic/common/LottiePlayer.vue`）

- 业务无感层组件：动画数据 / 路径全从 props 传
- 动态 import `lottie_web/build/player/lottie_light`（体积约半，首屏不背）
- 传入内联 `animationData` 时内部 `structuredClone` 深拷贝（lottie 会就地改写常量）
- 进视口播、出视口停（共用 `basic/common/observePlayPause.ts` 骨架）；卸载时 stopObserve + destroy
- prefers-reduced-motion 命中时降级：不挂播停观察器，动画停在首帧静态可见（VideoPlayer 同套路，靠 `preload="metadata"` + poster 停首帧）

## 路由滚动

`app/router.options.ts` 接管 `scrollBehavior`：只要 Lenis 在，切页滚动全走 `lenis.scrollTo`（vue-router 自带的 `window.scrollTo` 会和 Lenis 抢位置）；滚前先 `lenis.resize()` 同步 limit（防还原位被旧缓存钳掉）；`lenis` 为 null 时回落原生位置语义。改路由行为先看这个文件。
