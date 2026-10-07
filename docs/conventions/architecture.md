# 分层架构与目录职责

术语定义见根目录 [GLOSSARY.md](../../GLOSSARY.md)。标注说明：`[ESLint]` = 有 lint 门禁强制（以 `eslint.config.mjs` 为准）；`[Review]` = 无门禁，靠 code review 把关（/code-review 的 Standards 轴以本目录为基准）。

## 军规

1. 依赖只能向下：视图层 → 门面层 → store 层 → 领域层（services + api）→ 组合根 → 供应商；禁止反向与跨层直连 `[ESLint]`（视图层门禁）/ `[Review]`（其余层）
2. 视图层不发请求、不碰全局状态（useState）、不 import 动画库 `[ESLint]`
3. 键名、事件名、样式 token 先登记再使用；业务代码里不许出现这些字面量 `[Review]`
4. 域格子对外只开 `index.ts` 一个口，域内文件不许被域外直接 import `[ESLint]`（视图层值导入被拦）/ `[Review]`（其余调用方走 index）
5. 新类型按三级归属判位置（见下），提升到 `shared/types/` 必须在文件头记档 `[ESLint]`（纯类型门禁）/ `[Review]`（归属判断）
6. `shared/types/` 只准导出纯类型（interface / type）`[ESLint]`
7. `app/constants/` 只准导出常量与纯类型；函数归 `app/utils/`，有状态逻辑归 composables `[ESLint]`
8. 供应商（gsap、lenis、lottie-web、Umami、ofetch）只许组合根和对应门面碰 `[ESLint]`（动画供应商在视图层被拦）/ `[Review]`（其余位置）
9. 域 service 的依赖全部从参数注入（组合根装配），不 import Nuxt API，保证可单测桩替 `[Review]`
10. 不为「将来可能有」预建空目录、空域文件夹 `[Review]`

## 分层总览

从上往下依赖，一层只认识紧邻的下一层：

| 层 | 位置 | 职责 |
|---|---|---|
| 视图层 | `app/pages/` + `app/views/` + `app/layouts/` | 路由薄壳 + 双模板实现 + 布局；不请求、不碰全局状态、不 import 动画库 |
| 门面层 | `app/composables/` | 每个业务域一个门口；跳转 / 埋点 / 文案编排在这里，状态不在这里 |
| store 层 | `app/stores/` | 域的客户端状态与业务结果编排；调组合根注入的服务 |
| 领域层 | `app/services/` + `app/api/` | 业务规则（token 什么时候清）与契约（URL、载荷、错误码） |
| 组合根 | `app/plugins/` | 装配点：造客户端、组装服务、接供应商，统一发下去 |
| 供应商 | gsap / lenis / lottie-web / Umami / ofetch | 被隔离在最底层，只在组合根与对应门面出现 |

分层图与完整链路示例见 README「分层架构」「数据流设计」章节（面向人类的 why 叙述）。

## 目录职责

| 目录 | 职责 |
|---|---|
| `app/pages/` | 路由薄壳，一路由一文件，只做双模板分发与 SEO 元信息 |
| `app/views/pc/` `app/views/m/` | 真正的页面模板，双端各自演进 |
| `app/layouts/` | 双端布局壳（导航 / 切语言 / 切端） |
| `app/composables/` | 门面层；跨域横切门面永远顶层，域文件夹经 `index.ts` 再导出 |
| `app/stores/` | Pinia 域 store |
| `app/api/<domain>/` | 域格子：契约 + 接口声明 + 错误码映射 |
| `app/services/<domain>/` | 域格子：业务规则，依赖全注入；无跨接口状态规则的域不建 |
| `app/constants/` | 登记册：键名 `keys.ts`、埋点事件名 `track.ts` |
| `app/utils/` | 纯函数（`cn`、`device` 判定算法） |
| `app/plugins/` | 组合根，每个插件一个装配职责 |
| `app/middleware/` | 路由守卫，页面经 `definePageMeta` 按需声明 |
| `server/api/` | Nitro mock 后端（登录、会话、示例接口） |
| `server/utils/` | server 侧工具（信封工厂） |
| `shared/types/` | 跨端纯类型 |
| `i18n/locales/` | 语言包 |
| `public/<域>/` | URL 引用型静态资源 |

## 域格子四件套（api 层）

`app/api/<domain>/` 内固定四文件，职责不混：

| 文件 | 职责 |
|---|---|
| `contracts.ts` | 契约：入参、返回、业务错误码联合 |
| `endpoints.ts` | 接口：只声明 URL / 方法 / 类型，零逻辑，client 是参数 |
| `errors.ts` | 业务码 → i18n key 的登记表（无业务码的域可缺省） |
| `index.ts` | 域门面：对外唯一出口 |

无业务规则的域（如 hello）不建 `services/<domain>/` 格子——service 层不是每域必备。范式参照：`app/api/auth/`（全套）、`app/api/hello/`（最简）。

## 类型三级归属

新类型按顺序判（登记在 `shared/types/api.ts` 头部）：

1. 域私有 → 域自己的 `contracts.ts`
2. app 内分层抽象 → `app/services/types.ts`（跨域端口，如 `ApiClient`）或该域 `services/<domain>/contracts.ts`
3. 跨端公共（app 和 server 都用，或 ≥3 个域用）→ `shared/types/`；提升时必须在文件头登记谁在用，没主的类型不给合

`shared/types/` 两端经 Nuxt 共享机制裸用，无需 import 语句。

## 登记册制度

四本登记册，先登记后使用：

- `app/constants/keys.ts` — `PINIA_STORE_IDS`（一域一 store，id 即域名）、`COOKIE_KEYS`（统一 `v_` 前缀）
- `app/constants/track.ts` — `TRACK_EVENTS` 埋点事件名与 `TrackEventName` 联合
- `app/assets/css/tokens.css` — 样式 token（见 [styling-and-assets.md](styling-and-assets.md)）
- useState 键名前缀制：键写成 `<domain>:<name>`；别的域要读只能走那个域的门面，不许直接 `useState()` 别人的键名

注意：`nuxt.config.ts`（如 i18n 的 cookieKey）在构建期加载，引用不了登记册文件——改 `COOKIE_KEYS` 必须同步改 nuxt.config 对应处。

## composables 域化触发线

登记在 `app/composables/animation/index.ts` 头部：

- 单目录超过 15 个文件，或某域门面攒到 3 个以上 → 建域文件夹 + `index.ts` 再导出（auto-import 经 `imports.dirs` 的 `composables/*/index.ts` 生效）
- 单文件域（如 `useAuth`）留在顶层
- 跨域横切门面（`useApi` / `useTrack` / `useDevice` / `useLocale` / `usePageMeta`）永远顶层
- 不预建空域文件夹

## 组合根清单

`app/plugins/` 一个插件一个装配职责，注意 `dependsOn` 顺序：

- `api.ts` — 传输组合根：造带凭据的网关客户端 `$apiClient` 与 `$tokenStorage`（依赖 pinia、i18n 插件就绪）
- `auth.ts` — 业务组合根：`createAuthService($apiClient, $tokenStorage)` 组装会话服务（依赖 api）
- `device.server.ts` — 服务端设备判定，唯一写入 device store 的地方
- `track.client.ts` — 客户端埋点脚本加载
- `animation.client.ts` — 动画总开关（详见 [animation.md](animation.md)）

新组合根照此模式：一个文件、一个职责、依赖显式声明。
