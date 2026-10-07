# Spec: 测试基础设施引入

## 背景

项目进入测试先行工作流（见 `AGENTS.md` 业务接入流程与 `docs/conventions/testing.md`），需要最小测试设施：Vitest（纯逻辑层）+ Playwright（E2E 关键旅程）。本 spec 对应「第 0 张票」：只搭设施与冒烟验证，业务测试（登录流试点）是下一张票。

## 范围

- 依赖（devDependencies）：`vitest`、`@nuxt/test-utils`、`@playwright/test`；**不含** `@vue/test-utils`（组件层按需启用）
- 目录：`tests/unit/`（镜像 app 结构，node 环境）、`tests/helpers/`（共享桩与工厂，随试点诞生）、`e2e/`
- 配置：`vitest.config.ts`（include 只扫 `tests/**/*.spec.ts`，specs 显式 import 不开 globals）、`playwright.config.ts`（webServer 本地复用/自起 dev、CI 用 preview，`trace: 'on-first-retry'`）
- 脚本：`test` / `test:watch` / `test:e2e`
- 冒烟样例：`resolveDevice` 三优先级 Vitest 用例 + 首页标题 Playwright 断言

## 引导循环说明

新流程要求「先红后绿」，但跑测试的设施正是本票交付物——本票只 dogfood 文档层（spec → 票 → 验收要点 → 人审 `Reviewed:`），测试先行为其后的票生效。

## 边界

不改 matt skills 与 `docs/agents/*`；不预建组件测试设施；不加覆盖率门槛。
