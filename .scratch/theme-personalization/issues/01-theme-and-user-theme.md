# 01: 主题切换 + /me 个性化（追认票）

Status: resolved

## 验收要点

（锚定 `../spec.md`；已被 e2e/手工验证覆盖的三条 + 主题瞬时切换）

1. Given cookie `v_theme=dark`，When 服务端渲染任意页，Then HTML 直出 `data-theme="dark"`（零闪屏）；浅色会话点导航「深色」，Then 不刷新瞬时切暗且 cookie 记忆（`tests/e2e/theme/theme.spec.ts` 覆盖）
2. Given 已登录，When /me 面板选色改圆角点「保存」，Then `v_utheme` cookie 固化覆盖值、刷新重开保持、重置清空（`tests/e2e/theme/user-theme.spec.ts` 覆盖保存流程）
3. Given cookie `v_utheme` 非法（白名单外键 + 非法色值），When 服务端渲染，Then 覆盖被 sanitize 静默剥离（`tests/e2e/theme/user-theme.spec.ts` 覆盖）
4. Given 合法 `v_utheme` 覆盖，When 服务端渲染，Then `<html style>` 内联变量直出（SSR 直出个性化，零闪屏）

Reviewed: 2026-10-11（追认票：功能已上线，经 fix-c2-c5-plan 计划审计补录）

## Comments

- 2026-10-11 补录完成：三个测试文件补挂 `// Ticket:` 头；`npm run check:tickets` 全过（机械兜底不破当下）。代码与断言零改动
