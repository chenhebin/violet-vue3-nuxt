# 01: C2 — MockScene 收进传输层（scene 只在传输层一处注入）

Status: resolved

## 验收要点

（锚定 `../spec.md` C2 条）

1. Given 登录页选 `http500` 场景提交，When 请求发出，Then URL 带 `?scene=http500` 且横幅文案不变（传输层注入，视图不再传参）
2. Given `/me?scene=expired`，When SSR 渲染，Then 展示会话过期分支（与改前一致）
3. Given 全库 grep `\bscene\b`（server/ 除外），When 检查，Then app 侧只剩 contracts 的 `MOCK_SCENES` 定义、plugins/api.ts 注入点、LoginPage 下拉与 MePage 模板链接

Reviewed: 2026-10-11（经 fix-c2-c5-plan 计划审计，用户批准即生效）

## Comments

- 2026-10-11 验收 1-3 全过：
  - 1：浏览器实机（/login 选 http500 提交）地址栏为 `login?scene=http500`、横幅「服务开小差了，请稍后重试」；e2e `tests/e2e/auth/login.spec.ts` http500 用例绿
  - 2：`curl /me?scene=expired`（带 v_token）SSR 直出「登录已过期，请重新登录」分支；`/me` 正常路径出「昵称：紫罗兰」；SSR payload key 为纯 `auth:me`（原为 `auth:me:expired`）
  - 3：grep 审计 app 侧仅剩：contracts 的 MOCK_SCENES、plugins/api.ts 注入、双端 LoginPage 下拉、双端 MePage 模板链接、useMe 的 watch、useApi 的注入参数、useTrack 头注（防 scene 进报表的既有注释）；README 数据流第 1 步同步改写
  - 门禁：`npm run typecheck` 0 错；`npm run test` 28/28 绿；`npm run test:e2e -- tests/e2e/auth tests/e2e/theme` 9/9 绿
