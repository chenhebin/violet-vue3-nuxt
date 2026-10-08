# 01: auth 领域服务单测（helpers 诞生）

Status: resolved

## 验收要点

（锚定 `../spec.md`；被测对象 `app/services/auth/auth.service.ts`，桩注入）

1. Given 登录接口成功返回 token 与 user，When `login`，Then token 写入存储且返回 user
2. Given 登录接口抛 ApiError，When `login`，Then 不写 token 且异常原样上抛
3. Given 登出接口抛错，When `logout`，Then 本地凭据仍被清（try/finally 兜底）
4. Given 登出接口成功，When `logout`，Then 清一次凭据
5. Given 存储有 token / 无 token，When `isAuthenticated`，Then 分别返回 true / false
6. Given `fetchMe` 抛 `ApiError('auth')`，When `fetchMe`，Then 先清凭据再原样上抛
7. Given `fetchMe` 抛非 auth 类 ApiError（http），When `fetchMe`，Then 不清凭据且上抛

Reviewed: 2026-10-07（用户确认无误）

## Comments

- 2026-10-07 验收 1-7 全过：`tests/unit/services/auth/auth.service.spec.ts` 7/7 绿；`tests/helpers/` 诞生 `fakeTokenStorage` / `fakeApiClient`（fake 桩对齐真实契约）
- 修正记录：验收 3 首版断言漏了「异常上抛」——`authService.logout` 的契约是 try/finally 清凭据后照常上抛（吞异常归上层 toOutcome，见 auth.service.ts 头注），是测试错不是产品错，已改为同时断言 reject 与凭据被清；fake 桩同步改为返回 rejected promise（贴近真实 $fetch 语义）
