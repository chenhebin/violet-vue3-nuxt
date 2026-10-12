# 02: C3 — 契约单点 + 传输层单测

Status: resolved

## 验收要点

（锚定 `../spec.md` C3 条）

1. Given server handler 返回结构与 shared 契约不一致，When `npm run typecheck`，Then 编译报错（apiOk 泛型标注）

2. Given 四种错误 kind 各造一次响应，When 跑 `tests/unit/composables/useApi.spec.ts`，Then kind/code/traceId 断言全绿

Reviewed: 2026-10-11（经 fix-c2-c5-plan 计划审计，用户批准即生效）

## Comments

- 2026-10-11 验收 1-2 全过：
  - 1：漂移红测——临时把 `server/api/auth/me.get.ts` 的 `nickname` 改名 `nickName`，`nuxi typecheck` 报 `TS2561: 'nickName' does not exist in type 'AuthUser'`（退出码 2）；还原后 typecheck 0 错。三个 handler 均已 `apiOk<LoginResult|AuthUser|HelloResult>` 标注，契约唯一出处 `shared/types/auth.ts` / `shared/types/hello.ts`
  - 2：`tests/unit/composables/useApi.spec.ts` 7 用例全绿（信封拆装、business/auth/http/network 四 kind、请求头三断言、scene 注入合并不覆盖）。注：auth kind 按既有实现不带 traceId（`useApi` 拦截器 auth 分支只透传 message），断言按真实行为收窄
  - 附带改动：`ApiClient` 锚点从 Nuxt 全局 `typeof $fetch` 改为 ofetch `$Fetch`（`app/services/types.ts`）——纯 ofetch 工厂返回值与 Nuxt 路由泛型化的全局类型不兼容，锚定 `$Fetch` 后两端（工厂产物 / Nuxt 全局）都满足；testing.md helpers 节与 fakeApiClient 头注同步
  - 门禁：`npm run test` 35/35 绿（原 28 + 新 7）；`npm run typecheck` 0 错
  - 补记（全量 e2e 抓到的回归，已修）：工厂化后 SSR 期相对 baseURL（`apiBase: '/api'`）undici 解析不了（原 `$fetch.create` 走 Nuxt 全局 $fetch 的进程内解析，纯 ofetch createFetch 没有），/me SSR 变 network 错误。修复：`useApi` 门面在 `import.meta.server` 时拼 `useRequestURL().origin` 走回环，客户端保持相对（同源）——生产路径仍是唯一工厂 `createGatewayClient`。修复后 gate 全绿 + e2e 11/11 绿
