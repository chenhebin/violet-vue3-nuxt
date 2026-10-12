# 01: fix 2 — 偏好 cookie 收 utils 纯函数 seam

Status: resolved

## 验收要点

（锚定 `../spec.md` 意图 1）

1. Given 任一偏好 cookie 读写点（useDevice/useTheme/useUserTheme 写 ×4，device.server/theme.server 读 ×3），When 查源码，Then 解析/拼串只出现在 `app/utils/cookies.ts` 一处
2. Given theme/device/userTheme 既有 e2e 与手验流程，When 跑，Then 行为不变（记忆保持、SSR 直出、非法剥离）

Reviewed: 2026-10-12（经 arch-fixes 计划审计，用户批准即生效）

## Comments

- 2026-10-12 验收 1-2 全过：
  - 1：`grep -rn "max-age" app` 只剩 `app/utils/cookies.ts`；7 个调用点（useDevice/useTheme/useUserTheme 写 ×4、device.server/theme.server 读 ×3）全部改走 `parseCookie`/`buildCookie` 裸名（utils auto-import），白名单与值编解码留在调用侧/各域 codec
  - 2：`tests/unit/utils/cookies.spec.ts` 5 例绿（单键/多键前中尾位/无键与 nullish/写串全断言/清除串）；e2e theme+device 6/6 绿；浏览器手验：切深色→刷新保持（v_theme=dark）、/me 保存个性化（v_utheme=primary=%23ff0000&radius=8px）与重置（cookie 清除、颜色还原）、切手机版整页刷新进 m 模板（v_device=m）
  - 门禁：typecheck 0 错；`npm run test` 40/40 绿
