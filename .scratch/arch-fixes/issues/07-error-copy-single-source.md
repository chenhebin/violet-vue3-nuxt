# 07: fix 8 — 错误文案收口（横幅查表单点 + sessionErrorI18nKey 门面导出）

Status: resolved

## 验收要点

（锚定 `../spec.md` 意图 7 与边界「唯一文案变化」条）

1. Given 全库 grep `error.fallback`/`error.http` 字面量，When 检查，Then 只存在于 `app/api/error.ts` 表内
2. Given 登录页错密码提交、http500 提交、`/me?scene=expired`，When 观察，Then 错密码字段文案、http500 横幅、/me 过期文案逐字不变（network 类横幅按边界条款换 error.network 文案，属纠错）

Reviewed: 2026-10-12（经 arch-fixes 计划审计，用户批准即生效）

## Comments

- 2026-10-12 验收 1-2 全过：
  - 1：`grep -rn "error\.fallback\|error\.http" app --include='*.ts' --include='*.vue'` 只剩 `app/api/error.ts` 表内三值；bannerError 删字面量改纯查表（business 兜底=表内 error.fallback），MePage 双端经门面导出 `sessionErrorI18nKey` 派生文案；唯一例外：`views/{pc,m}/ErrorPage.vue` 的 `t('error.http')` 是路由级错误页标题（非 API 横幅流，且视图层禁值导入 `~/api/*` 无法查表），按计划范围保持不动
  - 2：e2e auth 4/4 绿——错密码字段文案「用户名或密码错误」、http500 横幅「服务开小差了，请稍后重试」逐字不变；curl `/me?scene=expired` 过期文案逐字不变；/me network 类横幅按边界条款从 error.http 换 error.network 文案（纠错项，auth/http 不变）
