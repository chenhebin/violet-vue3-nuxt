# 质量门禁、提交与验证

改动提交前的验收标准。eslint 五块分层门禁是架构约束的机械强制，改门禁等于改架构。

## 军规

1. 提交前四连，0 error 才算过：`npm run typecheck` → `npx eslint .` → `npm run test` → `npm run build`（package.json 没配 lint script，eslint 直接 npx）。环境必须 Node 22（`.nvmrc` 钉版本，先 `nvm use`）——低版本 Node 会报 `node:util does not provide an export named 'styleText'` 这类怪错。E2E 单列：`npm run test:e2e`（需先 `npx playwright install chromium`，规范见 [testing.md](testing.md)）`[Review]`
2. 提交信息走 conventional commits：`feat:` / `fix:` / `docs:` / `refactor:` / `chore:` / `perf:` 前缀，一句话说清改动（参照 git log 现有风格，中文描述可）`[Review]`
3. eslint 门禁块是硬约束；要放宽 / 新增门禁必须在提交说明里给理由 `[Review]`
4. auto-import 绕过 import 检查是已知盲区（ui / basic 直调 useAuth、视图直调 gsap 这类），靠 code review 兜底 `[Review]`
5. 动画、登录流、双端、降级四项手动验证过一遍才算完（清单见下）`[Review]`
6. 接真实后端的切换路径：`runtimeConfig.public.apiBase` 指向真网关 + 拔掉 server mock 与 `MockScene` 演示开关 `[Review]`

## eslint 分层门禁速查

`eslint.config.mjs` 五个配置块（一块全站公共 + 四块门禁）。各块拦什么：

| 门禁块 | 管谁 | 拦什么 |
|---|---|---|
| 视图层 | `app/views/` `app/pages/` | 直连 `$fetch`；值导入 `~/api/*` `~/services/*` `~/stores/*`（type 导入放行）；直写 `useState`；import gsap / lenis / lottie-web |
| 公共类型层 | `shared/types/` | 导出任何运行时东西（const / function / class），只准纯类型 |
| 常量层 | `app/constants/` | 导出函数或类——函数归 utils，有状态逻辑归 composables |
| 无感组件层 | `components/ui/` `components/basic/` | 依赖 composables / api / services / constants / stores；import business 组件 |

注意事项（写新门禁时容易踩）：

- 同一规则的多个禁令必须写在同一个 `no-restricted-imports` 条目里——flat config 下同规则 ID 后面的块会整体盖掉前面的块
- 违规的代价要提前到保存文件那一刻：新架构约束优先考虑加门禁，加不了的才靠 review

## 手动验证清单

即席验证由「任何具备浏览器能力的执行者」（人或 agent）照此执行，截图与结论追加到票。已被 e2e 固化覆盖的项标注如下：

- **登录流**：错误密码看字段文案；正确密码跳 `/me`，Umami 落 `login_success`；登录页 `scene` 下拉模拟服务端 500 / 请求超时；`/me?scene=expired` 模拟会话过期（`e2e/auth/login.spec.ts` 覆盖：错密码字段文案、正确密码跳转、http500 横幅、未登录踢回；Umami 落数与 timeout 场景仍需人验）
- **动效**：`/about` 看滚动显现和 Lottie；`/animation` 看全部效果门面（仍需人验/即席验证）
- **双端**：导航栏切「手机版 / 电脑版」看双模板分发（`e2e/device/dual-template.spec.ts` 覆盖 m 端模板渲染断言；切换交互仍需人验）
- **降级**：DevTools 开「Emulate CSS prefers-reduced-motion」刷新，确认全站降级为原生滚动零动画（仍需人验）

## 提交信息风格

```
feat: 新增产品域页面与接口格子
fix: 修复切端后滚动位置还原被旧缓存钳掉
docs: 注释优化
```

## auto-import 盲区（review 重点）

Nuxt auto-import 不走 import 语句，eslint 的 import 检查摸不到。review 时重点盯：

- `ui/` `basic/` 层里直接调 `useAuth` 这类门面（该层只许 props 进）
- 视图层直接调用 gsap / lenis 全局（该走效果门面）
- 别人域的 `useState` 键名直读（该走那个域的门面）

## 与文档的联动

- 本目录（`docs/conventions/`）是 /code-review Standards 轴的基准：改约定必须同步改对应篇目
- 发现代码与文档不一致：要么代码违规（改代码），要么约定过时（改文档并在提交说明里记录）——不许放着不一致不管
