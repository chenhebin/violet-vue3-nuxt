# 03: C4 — 门禁单点 + 票号追溯机械兜底

Status: resolved

## 验收要点

（锚定 `../spec.md` C4 条）

1. Given 任一文档/CI 声明门禁，When 查看三处（AGENTS.md / quality.md / ci.yml），Then 均只引用 `npm run gate`
2. Given 任一 `tests/**/*.spec.ts` 缺 `// Ticket:` 头，When `node scripts/check-ticket-trace.mjs`，Then 非零退出并列出文件

Reviewed: 2026-10-11（经 fix-c2-c5-plan 计划审计，用户批准即生效）

## Comments

- 2026-10-11 验收 1-2 全过：
  - 1：三处单点化——AGENTS.md（第四步 / bug 流程第 5 条 / 硬约束速查第 10 条均改为 `npm run gate`（五连））、quality.md 军规 1 句首「唯一执行入口 `npm run gate`（命令实现在 package.json）」、ci.yml 门禁步骤替换为 `npm run check:tickets` + `npm run gate` 两步；全库 grep 无残留旧声明（test-infra 历史票内的「四连」为既成记录，不改历史）
  - 2：`npm run check:tickets` 输出 `ticket-trace: OK (9 specs)` 退出 0；删 `tests/unit/utils/device.spec.ts` 头再跑 → 非零退出并列出该文件；还原后复绿
  - 附带：AGENTS.md 人工关卡条补 skill 确认豁免说明、Agent skills 节补流程 skills 位置（`~/.agents/skills/` 不随仓库分发）；testing.md 军规 3 补机械校验、军规 6 改写 MockScene 注入方式、L28 命令注释对齐 gate 第四步；theme 追认票 `.scratch/theme-personalization/` 补录，三个无头测试文件（userTheme.spec / theme.spec / user-theme.spec）补挂 `// Ticket:` 头
