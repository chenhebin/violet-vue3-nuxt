# Spec: 架构审查摩擦点修复（C2/C3/C4/C5）

## 背景

架构审查（2026-10-11，4 只读 scout + 人工复核）确认四个摩擦点，本 spec 收敛它们的修复意图。完整计划经用户审计批准（`local://fix-c2-c5-plan.md`，计划批准 = 各票 Reviewed 生效）。

## 意图（四条）

- **C2 MockScene 收口**：mock 演示开关 `scene` 从视图一路穿透到后端共 12 个文件（视图→门面→store→api endpoints→service→server handler 都带 scene 参数/分支）；终态为 scene 只存在于传输层一处注入点——URL query 驱动、`plugins/api.ts` 组合根装配，视图只写下拉、签名全拔。
- **C3 契约单点 + 传输层单测**：同一份载荷类型在 server mock handler 与 `app/api/*/contracts.ts` 各声明一次、无编译期校验；最深的传输模块 `useApi`（信封拆装 + 四种错误 kind）零单测。终态为 server 与 app 共享 `shared/types/` 同一份载荷契约（server handler `apiOk<T>` 泛型标注，漂移变编译错误），`createGatewayClient` 工厂补 7 用例单测。
- **C4 门禁单点 + 追溯机械兜底**：「提交前门禁」三处声明漂移（AGENTS.md 四连、quality.md 五连、CI 四项缺 lint:style）；人工关卡纯靠自觉，theme/个性化功能整单绕过（3 个测试文件无 `// Ticket:` 头）；流程 skills 自带交互确认与「唯一必做人工环节」声明冲突。终态为唯一执行入口 `npm run gate` + CI `check:tickets` 机械校验票号追溯 + 文档单点化 + theme 追认票补录。
- **C5 动效生命周期内聚**：效果门面四步生命周期骨架（onMounted 取门面 → reduced 跳过 → gsap.context → revert）在 5 个门面逐字复制；`LottiePlayer.vue` / `VideoPlayer.vue` 完全绕过 prefers-reduced-motion 降级。终态为骨架收进 `createEffect.ts` 一处、门面只剩动画配方，播放器补降级（停首帧）。

## 边界

- 不动 C1（pc/m 页面逻辑下沉）与 C6（登记册小项）——不在本计划范围
- 不改任何用户可见文案、不改 e2e 断言
- gate 不并入 e2e（五连定义维持 quality.md 现文，e2e 单列）
- scene 演示交互保持 URL query 形态（登录下拉提交瞬间 `router.replace` 写 query），不改 cookie 方案
- 流程 skills 不搬进仓库，只在 AGENTS.md 记录位置与前提
