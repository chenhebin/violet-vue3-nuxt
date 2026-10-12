# 03: fix 4 — i18n 完整性单测

Status: resolved

## 验收要点

（锚定 `../spec.md` 意图 3）

1. Given 两 locale key 不对等或错误表 key 漏译，When 跑 `tests/unit/i18n/locales.spec.ts`，Then 红
2. Given 现状，When 跑同 spec，Then 绿

Reviewed: 2026-10-12（经 arch-fixes 计划审计，用户批准即生效）

## Comments

- 2026-10-12 验收 1-2 全过：
  - 1：红测——临时删 en.json 的 `error.http` key，spec 2 例红（key 对等差集报缺 + 横幅表 en 解析失败报具体 key）；还原后复绿
  - 2：`tests/unit/i18n/locales.spec.ts` 3/3 绿（现状 zh/en 递归 key 各 53 完全对等；API_ERROR_BANNER_I18N 四值 + AUTH_ERROR_I18N 的 error.1001 在两份 locale 全部下钻到 string 叶子）
