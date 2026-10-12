# 02: fix 3 — eslint 视图层 store 直调机械兜底

Status: resolved

## 验收要点

（锚定 `../spec.md` 意图 2）

1. Given 视图层写 `useAuthStore()`（无 import，auto-import 直调），When `npx eslint`，Then 报 no-restricted-syntax 错
2. Given 现状代码，When 全量 eslint，Then 0 error

Reviewed: 2026-10-12（经 arch-fixes 计划审计，用户批准即生效）

## Comments

- 2026-10-12 验收 1-2 全过：
  - 1：红测——`app/views/pc/LoginPage.vue` 临时注入 `const _s = useAuthStore()`，`npx eslint app/views/pc/LoginPage.vue` 报 no-restricted-syntax「视图/页面层禁止直连 Pinia store（含 auto-import 直调）」；还原后该文件 0 error
  - 2：`npx eslint .` 全量 0 error（步骤落地时与终验 gate 各跑一次）
  - 文档同步：quality.md 门禁速查视图层行补「直调 `*Store()`（auto-import 盲区已堵）」；「auto-import 盲区」节改写（store 条移除、gsap 条保留）；eslint.config.mjs 头注「已知局限」段同步
