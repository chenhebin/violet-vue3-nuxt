# 术语表（GLOSSARY）

本项目的核心术语统一定义于此。`docs/conventions/` 各规范篇目引用术语时不重复定义；新术语在讨论中真正落定时，经 `/domain-modeling` 流程登记到本文件。

## 组合根（composition root）

装配点：把零件造好、接好线再往下发的那个地方。本项目的 `app/plugins/`——每个插件是一个组合根（传输、业务、动画、埋点、设备各一个），依赖注入的唯一发生地。换供应商（gsap、ofetch、Umami）只动组合根和对应门面两处。

代表：`app/plugins/api.ts`、`app/plugins/auth.ts`、`app/plugins/animation.client.ts`。规范：[architecture.md](docs/conventions/architecture.md)。

## 门面（facade）

正式门口：外面只找门口办事，不进屋翻抽屉。`app/composables/` 里一个个 `useXxx`。视图层与跨域调用方只允许经门面消费一个域；域内实现随便改不影响外面。动画域另有"效果门面"（`useReveal` 这类带标记契约的门面）。

代表：`app/composables/useAuth.ts`、`app/composables/useApi.ts`。规范：[architecture.md](docs/conventions/architecture.md)、[data-and-errors.md](docs/conventions/data-and-errors.md)。

## 登记册（registry）

全项目只有一份的花名册。键名、事件名、样式 token 先登记再使用，别处不许写字面量。四本登记册：`app/constants/keys.ts`（Pinia id、Cookie 键）、`app/constants/track.ts`（埋点事件名）、`app/assets/css/tokens.css`（样式 token）、以及 useState 的键名前缀制。

规范：[architecture.md](docs/conventions/architecture.md)、[styling-and-assets.md](docs/conventions/styling-and-assets.md)。

## 域格子（domain cell）

一个业务域一个文件夹格子：东西收在格子里，对外只开 `index.ts` 一个口。api 层的格子是四件套 `{index, contracts, endpoints, errors}.ts`；services 层的格子按需建（有跨接口的状态规则才建）。

代表：`app/api/auth/`、`app/services/auth/`。规范：[architecture.md](docs/conventions/architecture.md)、[data-and-errors.md](docs/conventions/data-and-errors.md)。

## 域 store

一个业务域一份客户端状态（`app/stores/<域>.ts`），Pinia 管理、setup 式、id 走 `PINIA_STORE_IDS` 登记册。服务端数据（useAsyncData 缓存）不进 store；持久化按 store 配置显式 pick 字段。

代表：`app/stores/auth.ts`（复杂域 store 示范模板）。规范：[data-and-errors.md](docs/conventions/data-and-errors.md)。

## 双模板（dual template）

同一路由备 pc 和 m 两套模板，按设备现场挑一套渲染——一个 URL，服务端渲染 pc 或 m 整棵树，不做两套站点。分发器是 `app/components/business/common/DeviceView.vue`，判定算法唯一在 `app/utils/device.ts` 的 `resolveDevice`。

规范：[pages-and-views.md](docs/conventions/pages-and-views.md)。

## 水合（hydration）

服务端先吐 HTML，浏览器里 Vue 再把状态对上号、接管交互。本项目两条水合纪律：持久化只 pick 必要字段（客户端预填会造成水合错位）；错误必须以可序列化数据（AsyncOutcome 快照）过 SSR 边界。

规范：[data-and-errors.md](docs/conventions/data-and-errors.md)。

## 信封（envelope）

后端统一响应外壳 `{ code, message, traceId, data }`，业务数据装在 `data` 里。`code: 0` 即成功。server 侧造信封只有 `server/utils/envelope.ts` 一处（apiOk / apiFail），app 侧拆信封只有 `useApi` 的 onResponse 一处。契约类型在 `shared/types/api.ts`。

规范：[data-and-errors.md](docs/conventions/data-and-errors.md)。
