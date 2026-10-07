# 01: 测试设施搭建与冒烟验证

Status: resolved

## 验收要点

（锚定 `../spec.md`）

1. Given 任意环境，When 跑 `npm run test`，Then `tests/unit/utils/device.spec.ts` 中 resolveDevice 三优先级（URL 参数 > cookie > UA）、无效 cookie 视为缺省、空 UA 按桌面判定的用例全部绿
2. Given 本地已装 Playwright 浏览器内核，When 跑 `npm run test:e2e`，Then webServer 自起服务、`e2e/smoke.spec.ts` 断言首页标题含 "Violet" 通过
3. Given 仅新增测试相关文件，When 跑四连门禁（typecheck → eslint → test → build），Then 与改动前一致全绿
4. Then `test-results/`、`playwright-report/` 已被 `.gitignore` 忽略

Reviewed: 待人工补审（审过后在本行补日期与署名）

## Comments

- 2026-10-07 验收 1-4 全过：Vitest 冒烟 `tests/unit/utils/device.spec.ts` 7/7 绿；Playwright 冒烟 `e2e/smoke.spec.ts` 绿；typecheck / eslint 绿（build 见票外全量验证）；`.gitignore` 已加 `test-results/`、`playwright-report/`
- 踩坑记录：① npm 源瞬时 `EIDLETIMEOUT`，重试即过（低版本 Node 还会报 `node:util styleText`，已写进 quality.md）；② Playwright 最新版要 chromium-1243 而缓存只有 1234，把 `@playwright/test` 钉到 1.62（匹配 chromium-1234）零下载解决；③ `| tail` 管道会吞退出码，验证命令要加 `set -o pipefail`
