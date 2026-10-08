# 02: 登录关键旅程 E2E + 双模板断言

Status: resolved

## 验收要点

（锚定 `../spec.md`；全部显式钉 `v_locale=zh`，见 testing.md 军规 7）

1. Given 演示账号有效，When 在 /login 提交正确凭据，Then 跳转 /me 且展示「昵称：紫罗兰」
2. Given 密码错误，When 提交，Then 密码框下方字段级文案为「用户名或密码错误」（业务码 1001 字段级收敛）
3. Given mock 场景 http500，When 提交，Then 横幅级文案为「服务开小差了，请稍后重试」（http 类横幅收敛）
4. Given 无登录凭据，When 直接访问 /me，Then 被中间件踢回 /login 且 URL 带 redirect 参数
5. Given cookie `v_device=m`，When 打开 /login，Then 渲染 m 端模板（`[data-device="m"]` 可见，双模板分发）

Reviewed: 2026-10-07（用户确认无误）

## Comments

- 2026-10-07 验收 1-5 全过：`e2e/login.spec.ts` 5/5 绿（连同 smoke 共 6/6，3.6s）
- 踩坑记录（flaky 治理实例）：首跑 3 条交互用例败于 SSR 水合竞态——点击发生在 Vue 接管前，表单走了原生 GET 提交（失败 URL 带 username/password query 即指纹）。修复：交互前 `waitForLoadState('networkidle')`；经验已回写 testing.md 军规 8
- 2026-10-07 目录重构（用户评审后）：e2e 按域分层，`e2e/login.spec.ts` → `e2e/auth/login.spec.ts`（登录流 4 例），双模板用例拆出 → `e2e/device/dual-template.spec.ts`，冒烟 → `e2e/smoke/home.spec.ts`；分层规则已固化进 testing.md 军规 1
