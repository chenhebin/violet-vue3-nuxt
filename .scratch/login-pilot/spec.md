# Spec: 登录流试点（测试先行流程首跑）

## 背景

测试基础设施已就位（`.scratch/test-infra/`）。本试点是测试先行流程的第一次完整运行：spec → 票带验收要点 → 人审 → 红/绿 → review 闭环，同时产出第一批回归资产。

## 范围

- Vitest：auth 领域服务业务规则（`tests/unit/services/auth/`），`tests/helpers/` 在本票诞生（fake TokenStorage / fake ApiClient）
- Playwright：登录关键旅程 + 双模板分发断言（`e2e/login.spec.ts`）

## 边界

- 不改业务代码——本票只加测试；若测试暴露产品缺陷，另立 bugfix 票走 bug 流程
- useApi 归一形状的 unit 级验证依赖 Nuxt 环境（auto-import / 上下文），归组件层启用时补（e2e 已行为级覆盖 network/http/business/auth 中的三条，timeout 分支按 testing.md 军规 6 留待组件层验形状）
