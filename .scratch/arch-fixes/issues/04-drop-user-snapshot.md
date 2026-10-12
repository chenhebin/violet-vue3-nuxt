# 04: fix 5 — 删 user 快照（auth store 收窄 + fetchMe 上提）

Status: resolved

## 验收要点

（锚定 `../spec.md` 意图 4）

1. Given 全库 grep user 快照引用，When 检查，Then auth store/useAuth 内零残留、无调用方破坏
2. Given 登录/会话既有 e2e，When 跑，Then 全绿

Reviewed: 2026-10-12（经 arch-fixes 计划审计，用户批准即生效）

## Comments

- 2026-10-12 验收 1-2 全过：
  - 1：`grep -n "\buser\b" app/stores/auth.ts app/composables/useAuth.ts` 零命中——store 删 `user` ref 与 login/logout 写点、`fetchMe` action 整体删除（余纯转发），useAuth 解构/return 去 user、`loadMeInternal` 直调 `$authService.fetchMe()`（toOutcome + auth 失败埋点不变）；typecheck 0 错（外部零消费，破坏面为空）；keys.ts 注释与 data-and-errors.md 表行/真相源 bullet 同步
  - 2：e2e auth 4/4 绿（有效凭据跳 /me、错密码字段文案、http500 横幅）；`npm run test` 40/40 绿
