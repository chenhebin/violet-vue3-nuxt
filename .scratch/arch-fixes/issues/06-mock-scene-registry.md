# 06: fix 7 — MockScene 迁登记册格子

Status: resolved

## 验收要点

（锚定 `../spec.md` 意图 6）

1. Given 全库 grep `MOCK_SCENES =`，When 检查，Then 唯一定义在 `app/constants/mock.ts`，api/auth 格子零 scene 值导出
2. Given /login 选 http500 提交、`/me?scene=expired`，When 演示，Then http500 横幅与 expired 过期分支行为不变

Reviewed: 2026-10-12（经 arch-fixes 计划审计，用户批准即生效）

## Comments

- 2026-10-12 验收 1-2 全过：
  - 1：`grep -rn "MOCK_SCENES =" app server` 唯一 `app/constants/mock.ts`；api/auth 格子（contracts/index/errors/endpoints）零 scene 值导出，contracts 头注注明迁址；plugins/api.ts 与双端 LoginPage 改 auto-import 裸名
  - 2：e2e auth 4/4 绿（http500 横幅「服务开小差了，请稍后重试」逐字不变）；curl `/me?scene=expired`（v_token）SSR 直出「登录已过期，请重新登录」+ 重新登录链接不变；文档同步：data-and-errors.md 拔除清单 4→5 处、api/auth/index.ts 头注、architecture.md 目录职责行 + 登记册制度（五本→六本）
