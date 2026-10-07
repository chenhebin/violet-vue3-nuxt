# 数据流与错误处理

术语（信封、域格子、域 store、门面、水合）见 [GLOSSARY.md](../../GLOSSARY.md)。核心纪律：错误以数据形态过 SSR，错误码到文案两级收口。

## 军规

1. 视图层禁止直接 `$fetch` 发请求；一律 `useApiClient()`（组合根注入）或对应域的 composable 门面 `[ESLint]`
2. 后端响应必须是信封 `{ code, message, traceId, data }`；server 侧造信封只在 `server/utils/envelope.ts`（`apiOk` / `apiFail`），字段增删只改这里 `[Review]`
3. app 侧拆信封只在 `useApi` 的 `onResponse` 一处；调用方拿到的直接是业务数据 `[Review]`
4. 错误归一只许四种 `ApiErrorKind`：`network` / `http` / `business` / `auth`，哪个域都不许发明第五种 `[Review]`
5. `ApiError` 只在 `useApi` 拦截器里生产（类定义在 `app/api/error.ts`）；以后接 Sentry 等上报在这个文件里长 `[Review]`
6. 错误过 SSR 必须转数据：统一 `toOutcome()` 转成 `AsyncOutcome`；store action 不抛错 `[Review]`
7. 业务错误码 → i18n key 的映射表在域格子 `errors.ts`，用 `satisfies` 做穷尽检查（contracts 扩码、errors 漏译，编译就报错）`[Review]`
8. 错误文案两级收口：字段级查域错误表，横幅级查全站表 `API_ERROR_BANNER_I18N`（`app/api/error.ts`）；未登记的业务码兜底 `error.fallback` `[Review]`
9. 一域一 store：setup 式、id 走 `PINIA_STORE_IDS` 登记册；持久化必须显式 `storage: piniaPluginPersistedstate.localStorage()` 并只 pick 必要字段 `[Review]`
10. 页面级会话数据归 `useAsyncData`（key 走 `域:实体` 前缀），不进 store——防双写；store 只存客户端原生状态 `[Review]`
11. store / 门面经 `useNuxtApp()` 拿组合根注入的服务实例（如 `$authService`），不 import services 文件 `[ESLint]`（视图层值导入被拦）/ `[Review]`（其余调用方）

## 数据流链路（以登录为例）

一层一环，各环职责（人类向的完整叙述在 README「数据流设计」）：

| 环节 | 位置 | 职责 |
|---|---|---|
| 视图 | `app/views/pc/LoginPage.vue` | 只调 `useAuth().login(payload, scene)`；表单与 MockScene 演示开关留在视图 |
| 门面 | `app/composables/useAuth.ts` | 跳转 / 埋点 / 文案编排；调域 store |
| store | `app/stores/auth.ts` | 状态（pending / error / user 快照）与业务结果 |
| 领域服务 | `app/services/auth/auth.service.ts` | 业务规则（token 何时清）；client 从组合根注入 |
| 接口声明 | `app/api/auth/endpoints.ts` | 只声明 URL / 方法 / 载荷 / 类型，client 是参数 |
| 客户端 | `app/composables/useApi.ts` | 塞头（设备 / 语言 / 凭据）、拆信封、错误归一 |
| server | `server/api/auth/login.post.ts` | 造信封（apiOk / apiFail） |
| 结果回传 | `app/api/error.ts` 的 `toOutcome` | 异常转 `AsyncOutcome` 数据；门面算两级文案，视图只渲染 |

## useApi 客户端（canonical：`app/composables/useApi.ts`）

管三件事，别的不管：

1. **塞头**：设备（`x-v-device`）、语言（`accept-language`）、凭据（`authorization: Bearer`）；token / locale 由组合根用 Ref 传进来，本层不管它们从哪来
2. **拆信封**：见军规 3
3. **归一化**：网络层失败 → `network`；HTTP 5xx → `http`；200 + 业务码 → `business`；401 → `auth`

不依赖任何需要组件 setup 上下文的 composable，所以在插件里调用也安全。

## 域 service 工厂模式（canonical：`app/services/auth/`）

- `auth.service.ts` 导出工厂 `createAuthService(client, tokens)` 返回 `AuthService` 接口：依赖全从参数注入，不 import Nuxt API，单测可拿桩直接 new
- 跨接口契约（如 `TokenStorage` 端口）在该域 `contracts.ts`；跨域端口（如 `ApiClient`）在 `app/services/types.ts`
- 业务规则（token 什么时候清、登出本地必清）写在 service，不散落到 store / 门面

## 域 store 模板（canonical：`app/stores/auth.ts`，新域 store 照此抄）

- 状态边界：只存客户端原生状态（动作瞬态、用户偏好）；页面数据以 useAsyncData 的 AsyncOutcome 为准
- 动作错误与查询错误分开：`error` 只由动作（login）写，查询类失败走 AsyncOutcome 由页面消费——防跨页幽灵文案
- 异常统一 `toOutcome` 转数据；登出这类「不管后端成不成本地都清理」的语义用 service 的 try/finally + toOutcome 吞异常保证
- 持久化只 pick 必要字段（防水合错位；SSR 服务端没有 localStorage）；会话恢复走 cookie + fetchMe 刷新
- 真相源约定示例：登录与否以 cookie 为唯一真相源，store 里的 user 只是给全局 UI 读的登录快照

## server 侧（Nitro mock）

- 路由文件 `server/api/<domain>/<action>.<method>.ts`；造信封只有 `server/utils/envelope.ts` 的 `apiOk` / `apiFail`
- 成功 = HTTP 200 + `code: 0`；业务失败 = HTTP 200 + `code ≠ 0`（用户文案由客户端域错误表解析）；传输失败 = `createError({ statusCode })`
- mock 场景开关（`scene` 查询参数）用于演示异常分支：`timeout` 吊 30 秒（让客户端 10 秒超时先到）、`http500` 抛 5xx、错误凭据返回业务码
- 接真实后端：`runtimeConfig.public.apiBase` 指向真网关，拔掉 mock 与 MockScene 开关（见 [quality.md](quality.md)）

## 埋点（旁路）

- 一律走 `useTrack()` 门面：`track(event, data)` / `identify(id)`，自动附带设备 / 语言维度；`websiteId` 未配置时整栈静默 no-op，业务调用处零防御
- 事件名先在 `app/constants/track.ts` 的 `TRACK_EVENTS` 登记，报表口径只查这一份
- 埋点不进主链路：成功 / 失败旁路直发，失败不影响业务结果
