# 05: fix 6 — 播放器 seam（查询串单点 + 播停骨架单点）

Status: resolved

## 验收要点

（锚定 `../spec.md` 意图 5）

1. Given 全库 grep `prefers-reduced-motion` 与 IntersectionObserver 播停逻辑，When 检查，Then 查询串与播停骨架各只剩一处定义
2. Given reduced-motion 用户，When 打开 /about 与 /animation，Then 播放器停首帧行为不变（Lottie svg 零变化、video currentTime=0）

Reviewed: 2026-10-12（经 arch-fixes 计划审计，用户批准即生效）

## Comments

- 2026-10-12 验收 1-2 全过：
  - 1：`grep -rn "prefers-reduced-motion" app` 的 matchMedia 调用只剩 `app/utils/motion.ts`（其余为概念性注释）；IntersectionObserver 播停骨架只剩 `app/components/basic/common/observePlayPause.ts`（LottiePlayer/VideoPlayer 经 `stopObserve` 消费，disposed 竞态防护保留）
  - 2：一次性 Playwright 探针（emulateMedia reducedMotion:'reduce'）：/about Lottie svg 1.2s 零变化（LOTTIE_SVG_STABLE: true）；/animation video paused 且 currentTime=0；正常模式对照滚入视口后 paused:false、t≈1.5s（滚入即播不受影响）；e2e smoke 绿；animation.md 军规 7 与「Lottie 播放器」节同步
