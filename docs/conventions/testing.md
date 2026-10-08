# 测试规范

流程（何时写测试、人审关卡、bug 复现先行）见 `AGENTS.md` 业务接入流程；本篇只管测试的技术约定。术语（信封、域格子）见 [GLOSSARY.md](../../GLOSSARY.md)。

## 军规

1. 分层照金字塔：纯逻辑 Vitest（`tests/unit/`）→ 组件 @vue/test-utils + @nuxt/test-utils（**按需启用**，见下）→ E2E Playwright（`e2e/<域>/<旅程>.spec.ts`，域与 app 域格子对齐——auth / device / hello…；跨域冒烟进 `e2e/smoke/`）；E2E 只固化关键旅程 `[Review]`
2. 关键旅程判定：坏了就是事故的流（登录、受保护路由、双模板分发）；新旅程入册需在票里说明理由 `[Review]`
3. 追溯：spec 文件头注释 `// Ticket: .scratch/<...>/issues/NN.md` 挂票号；**用例名必须自解释**（Given-When-Then 式），票号只是溯源加分项——票被清理链条不断，用例名本身就是持久文档 `[Review]`
4. bug 修复必先有失败复现测试（对应层），红 → 修 → 绿，测试留存为回归资产 `[Review]`
5. services 测试用 `tests/helpers/` 的桩（fake client / fake TokenStorage），不引 Nuxt API；store / composables 测试依赖 Nuxt 环境，归组件层（见下）`[Review]`
6. MockScene 是错误路径注入器：`timeout` 分支只在 unit 验形状（服务端吊 30 秒太慢），e2e 用 `http500` 与业务码分支 `[Review]`
7. e2e 显式钉环境：设 `v_locale` cookie 定语言、设 `v_device` cookie 定设备，不依赖环境默认 `[Review]`
8. flaky 治理：失败先辨「产品坏了还是测试脆了」（trace on first retry 已配），禁止用 skip 掩盖 `[Review]`。已知竞态：SSR 页面交互前先 `page.waitForLoadState('networkidle')` 等水合完成——水合前点击表单会触发原生 GET 提交（登录试点首跑踩过，失败现场 URL 带 username/password query 即此指纹）
9. specs 显式 `import { describe, it, expect } from 'vitest'`（不开 globals、不吃 auto-import）；共享桩与工厂只放 `tests/helpers/`，不进 spec 复制粘贴 `[Review]`

## 分层与工具

| 层 | 工具 | 位置 | 验什么 |
|---|---|---|---|
| 纯逻辑（services / utils） | Vitest | `tests/unit/`（镜像 app 结构） | 业务规则、错误归一形状、AsyncOutcome——DI 设计（`createAuthService(client, tokens)` 桩替即测）在这里兑现 |
| 组件 / composables / store | @vue/test-utils + @nuxt/test-utils | `tests/component/`（按需启用） | 组件渲染、门面与 store 交互（依赖 Nuxt 环境的都归这层） |
| 浏览器 E2E | Playwright | `e2e/<域>/<旅程>.spec.ts`（域对齐 app 域格子，跨域冒烟进 `e2e/smoke/`） | 关键旅程：登录流、受保护路由、双模板分发 |

## 命令速查

```bash
npm run test         # Vitest 全量（四连门禁第三步）
npm run test:watch   # watch 模式（红→绿循环用）
npm run test:e2e     # Playwright（需先 npx playwright install chromium）
```

- Playwright 本地复用已起的 dev 服务、没起则自动拉起；CI 用 `preview`（生产构建保真，前置 `npm run build`）
- 环境必须 Node 22（同 [quality.md](quality.md) 军规 1）

## 组件层启用（首个组件测试出现时）

1. `npm install -D @vue/test-utils`（happy-dom 由 @nuxt/test-utils 的 nuxt 环境自带）
2. `vitest.config.ts` 换 `defineVitestConfig`（`@nuxt/test-utils/config`），保留 `tests/**/*.spec.ts` include
3. 建 `tests/component/`，spec 文件头加 `// @vitest-environment nuxt`
4. store / composables 的测试也放这层（它们依赖 auto-import 与 Nuxt 上下文，纯 node 环境拿不到）

启用后在本节登记日期与触发它的票号。

## helpers 约定

- 桩的形状以真实契约为准：`fake TokenStorage` 对齐 `app/services/auth/contracts.ts`，`fake ApiClient` 满足 `typeof $fetch` 调用签名（`app/services/types.ts`）
- 工厂返回可编程行为（如「下一次调用抛什么」），不造静态单例
- 新 helper 只在第二个 spec 需要它时才从测试里提升出来（不预建）
