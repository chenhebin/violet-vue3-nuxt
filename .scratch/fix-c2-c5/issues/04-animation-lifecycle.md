# 04: C5 — 动效生命周期内聚 + 播放器降级

Status: resolved

## 验收要点

（锚定 `../spec.md` C5 条）

1. Given 5 个效果门面，When 查看源码，Then 生命周期骨架只在 `createEffect.ts` 出现一次，门面只剩动画配方
2. Given 用户开启 prefers-reduced-motion，When 打开 /about，Then Lottie/视频停在首帧不播放

Reviewed: 2026-10-11（经 fix-c2-c5-plan 计划审计，用户批准即生效）

## Comments

- 2026-10-11 验收 1-2 全过：
  - 1：五个门面（useReveal / useParallax / useHeroTimeline / usePinnedSection / useSplitText）全部改写为 `createEffect(target, (root, gsap) => {...})`，骨架（onMounted 取门面 → reduced/root 守卫 → gsap.context → revert + 额外清理）只在 `createEffect.ts` 一处；useSplitText 的 SplitText 实例经配方返回的清理函数在 `ctx.revert()` 之后逐个还原（顺序与改前一致）；对外签名与 options 全部不变（`createEffect` 域内私有，不进 index.ts 再导出）
  - 2：Playwright `emulateMedia({ reducedMotion: 'reduce' })` 实测（一次性脚本，跑完已删）：/about 的 Lottie 容器不进 observe 名单（播停观察器未挂）、svg 1.2s 内零变化（停在首帧）；/animation 的 video paused 且 currentTime=0、不进 observe 名单；`[data-*]` 标记元素零内联样式（createEffect 降级路径生效）
  - 正常路径回归：/animation 五效果标记齐全（hero×2 / split / parallax×2 / step×3）、gsap 内联样式在位、视频滚入视口即播（paused=false、currentTime 前进）
  - 门禁：`npm run typecheck` 0 错（修掉一处 TS2502：配方参数改名 engine 避免 `typeof gsap` 自引用）；`npm run test` 35/35 绿；`npm run test:e2e -- tests/e2e/smoke` 绿
