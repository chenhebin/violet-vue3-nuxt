# AGENTS.md

Violet 的 Nuxt 4 + Vue 3 前端项目（"violet-web"）：C 端站点，pc/m 双模板 SSR、中英双语、动画栈齐备；`server/` 为 Nitro mock 后端。

**编码规范以 [docs/conventions/](docs/conventions/) 为准（canonical）**；README.md 面向人类讲 why 与快速开始。术语见 [GLOSSARY.md](GLOSSARY.md)。

## Agent skills

### 问题跟踪器

议题以本地 Markdown 文件的形式存放在 `.scratch/<feature-slug>/` 下。参见 `docs/agents/issue-tracker.md`。

### 分诊标签

使用默认的五角色词汇表：`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`。参见 `docs/agents/triage-labels.md`。

### 领域文档

单上下文（single-context）：根目录一个 `GLOSSARY.md` + `docs/adr/`。参见 `docs/agents/domain.md`。

## 业务接入流程（AI 编码必读）

### 第一步：动手前先读

1. [GLOSSARY.md](GLOSSARY.md) — 对齐术语（组合根 / 门面 / 登记册 / 域格子 / 双模板 / 信封…）
2. [docs/conventions/architecture.md](docs/conventions/architecture.md) — 分层与依赖方向，任何改动前必读
3. 按下方路由表读当前任务对应的篇目

### 第二步：流程纪律（测试先行）

1. `/to-spec` 落 `.scratch/<feature>/spec.md`（需求意图、边界）
2. `/to-tickets` 拆票，每张票必含「## 验收要点」节（Given-When-Then 式，锚定 spec 原文）
3. ★ 人工关卡：用户审验收要点，审过在票上补 `Reviewed: <日期>`——全流程唯一必做人工环节，未审不动码
4. 逻辑票走 `/tdd`（失败测试先行 → 实现到绿 → 重构）；页面票走 `/implement-spec` 按下方实现路径写码

### 第三步：新功能标准实现路径

以"新增一个业务页面"为完整走线（每步的详细规则在对应篇目）：

1. **薄壳**：`app/pages/<route>.vue` 只做 DeviceView 双模板分发 + `usePageMeta` SEO（[pages-and-views.md](docs/conventions/pages-and-views.md)）
2. **双端视图**：`app/views/pc/XxxPage.vue` 与 `app/views/m/XxxPage.vue` 成对实现，业务逻辑写在这
3. **组件**：按放置四连问判位置（ui → basic/common → business/common → business/<pc|m>/<域>）（[components.md](docs/conventions/components.md)）
4. **数据**：新接口建 `app/api/<domain>/` 域格子四件套；有跨接口业务规则才建 `services/<domain>/`；视图经域门面消费，`useAsyncData` key 走 `域:实体`（[data-and-errors.md](docs/conventions/data-and-errors.md)）
5. **登记**：Cookie 键 / Pinia id / 埋点事件 / 样式 token，先在登记册登记再使用，业务代码不写字面量（[architecture.md](docs/conventions/architecture.md)）
6. **文案**：进 `i18n/locales/zh.json` 与 `en.json` 两份，key 用页面命名空间；组件经 `useLocale()` 取（[i18n.md](docs/conventions/i18n.md)）
7. **动效**：元素打 `data-*` 标记 + 效果门面（`useReveal` 等）；新效果门面照 `app/composables/animation/useReveal.ts` 抄（[animation.md](docs/conventions/animation.md)）
8. **测试**：按票的验收要点落测试，放置与写法见 [testing.md](docs/conventions/testing.md)；关键旅程固化 `e2e/` spec

### 第四步：完成前验证

四连门禁 0 错误 + `npm run test:e2e`（关键旅程回归）+ 按需即席验证（任何具备浏览器能力的执行者照 [quality.md](docs/conventions/quality.md) 手动清单执行，截图与结论追加到票）+ conventional commits 提交。

## bug 修复流程

1. bug 报告立票 `.scratch/bugfix-<slug>/`：`spec.md` 记复现步骤 + 期望/实际；`issues/01-fix.md` 含「## 验收要点」
2. `/diagnosing-bugs` 诊断定位（引用该 skill，不修改）
3. 对应层写失败复现测试：逻辑 bug → `tests/unit/`；页面行为 bug → `e2e/` 或组件层——红
4. 最小修复（按 conventions），测试转绿
5. 四连门禁 + `/code-review`；测试留存为回归资产（票关闭即防再犯）

## 票内验收要点模板

feature 票（`issues/NN-*.md` 内）：

```markdown
## 验收要点

1. Given <前置条件>，When <动作>，Then <可观察结果>
2. ……（锚定 spec 原文，逐条可验证）

Reviewed: <审过后补日期>
```

bug 票（`issues/01-fix.md` 内）：

```markdown
## 验收要点（复现条件）

- 复现步骤：<步骤>
- 期望：<正确行为> / 实际：<错误行为>

1. Given 复现条件，When 修复后重放，Then 期望成立（复现测试转绿）
```

## 硬约束速查（最易违反十一条）

> 摘引自各篇军规，如有出入以 `docs/conventions/` 各篇为准。

1. 依赖只能向下：视图 → 门面 → store → 领域 → 组合根 → 供应商；视图层只调门面 `[ESLint]`
2. 视图层禁直连 `$fetch`、禁值导入 api/services/stores、禁 `useState`、禁 import 动画库 `[ESLint]`
3. 键名 / 事件名 / 样式 token 先登记再使用，别处不写字面量
4. 页面必须是薄壳，pc / m 视图成对出现
5. 组件放置走四连问；ui / basic 是业务无感层，只许 props 进 `[ESLint]`
6. 错误只许四种 `ApiErrorKind`（network / http / business / auth）；过 SSR 必须 `toOutcome()` 转数据
7. 信封拆装各只有一处：server 造在 `server/utils/envelope.ts`，app 拆在 `useApi`
8. 一域一 store：id 走 `PINIA_STORE_IDS`，持久化显式声明 storage 且只 pick 必要字段；页面级数据归 `useAsyncData`
9. 动画走 `data-*` 标记 + 效果门面 + `gsap.context` 清理；`prefers-reduced-motion` 降级优先
10. 提交前四连门禁 0 错误 + conventional commits
11. 功能未审验收要点不动码；bug 必先有失败复现测试 `[Review]`

## 任务 → 文档路由表

| 任务 | 必读篇目 |
|---|---|
| 任何代码改动前 | architecture.md |
| 新页面 / 改页面 / 路由 / 布局 / 设备判定 | pages-and-views.md |
| 新组件 / 改组件 / SFC 风格 | components.md |
| 新接口 / 数据流 / 错误处理 / store / 埋点 | data-and-errors.md |
| 新增组合根（plugin）/ 路由中间件 / 登记册（键名 / 事件 / store id） | architecture.md |
| 样式 / 新 token / 静态资源放置 | styling-and-assets.md |
| 动效 / 滚动行为 / Lottie | animation.md |
| 文案 / 多语言 / 错误文案 | i18n.md |
| 写测试 / 测试放哪 / MockScene / flaky | testing.md |
| 提交前验证 / 提交信息 / eslint 门禁 | quality.md |

## 文档维护纪律

- 改约定必须同步改 `docs/conventions/` 对应篇目——文档是 /code-review Standards 轴的基准
- 术语落定进 GLOSSARY.md（经 /domain-modeling 流程）；架构决策的"为什么"写 `docs/adr/`（ADR），规范篇目只写"是什么"
- 代码与文档不一致时二选一处理：改代码（违规）或改文档（过时），不许放着不管
