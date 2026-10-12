# Spec: 主题切换与个性化（theme / user-theme）

> 追认票：功能已上线，经 fix-c2-c5-plan 计划审计补录（2026-10-11 发现三个测试文件无票号头，违反 testing.md 军规 3 的追溯要求，补票对齐流程）。

## 背景

theme/个性化功能此前整单绕过了「先票后码」流程（无 spec 无票无 Reviewed 直接上线）。功能本身已被 e2e 固化覆盖且验收通过，本票不回溯改码，只补齐追溯链路，让 `npm run check:tickets` 的机械兜底不破当下。

## 功能概述

- **主题切换（theme）**：导航「深色 / 浅色」瞬时切换（无刷新无闪屏）；SSR 直出 `data-theme="dark"`（cookie `v_theme` 驱动）；切换写 cookie 一年记忆，刷新后保持
- **个性化（user-theme）**：`/me` 面板选色（`#rrggbb`）/ 拖圆角，「预览」只写 store 即时生效（不落 cookie），「保存」固化进 `v_utheme` cookie（键序 + encodeURIComponent 序列化），「重置」清空；SSR 直出 `<html style>` 内联变量（零闪屏）
- **非法输入防线**：`v_utheme` cookie 白名单键校验 + 值格式校验（`#rrggbb` / `Npx`），非法键值静默剥离（sanitize 在 `app/utils/userTheme.ts`，白名单登记 `app/constants/theme.ts`，契约 `shared/types/theme.ts`）

## 边界

- 本票不改任何代码与测试断言——纯补录
- e2e 已覆盖项见 `tests/e2e/theme/theme.spec.ts`（SSR 直出、点击切换）与 `tests/e2e/theme/user-theme.spec.ts`（SSR 直出、保存流程、非法 cookie 剥离）
