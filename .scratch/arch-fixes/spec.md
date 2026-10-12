# arch-fixes：架构走查 2/3/4/5/6/7/8 七项修复

来源：架构走查（2026-10-12，三路只读子代理 + HTML 报告）9 张候选卡中用户指定修 2、3、4、5、6、7、8。

## 意图（七项各一段）

1. **fix 2（票 01）偏好 cookie 收 seam**：7 处手搓 cookie 解析/拼串（写 ×4、读 ×3）收进 `app/utils/cookies.ts` 纯函数（parseCookie/buildCookie），键名仍走 COOKIE_KEYS 登记册，行为逐字不变（记忆保持、SSR 直出、非法剥离）。
2. **fix 3（票 02）eslint store 直调机械兜底**：视图/页面层 no-restricted-syntax 追加 `CallExpression[callee.name=/^use[A-Za-z]*Store$/]` 选择器，堵 auto-import 裸调 `useXxxStore()` 的 import 盲区。
3. **fix 4（票 03）i18n 完整性单测**：`tests/unit/i18n/locales.spec.ts` 双向断言 zh/en key 对等 + 错误表 key 全部可解析到叶子，防未来漏译回归。
4. **fix 5（票 04）删 user 快照**：auth store 的 `user` ref 及 login/logout/fetchMe 全部写点删除，`fetchMe` action 整体删除（余纯转发），useAuth 直调 `$authService.fetchMe()`；页面级会话数据唯一走 useMe 的 AsyncOutcome。
5. **fix 6（票 05）播放器 seam**：`prefers-reduced-motion` 查询串收进 `app/utils/motion.ts` 单点；LottiePlayer/VideoPlayer 的 IntersectionObserver 播停骨架收进 `app/components/basic/common/observePlayPause.ts` 单点。
6. **fix 7（票 06）MockScene 迁登记册**：`MOCK_SCENES`/`MockScene` 从 api/auth/contracts.ts 迁 `app/constants/mock.ts`（横切开关属登记册不属域私有契约），消费点改 auto-import 裸名。
7. **fix 8（票 07）错误文案收口**：`bannerError` 删 `t('error.fallback')` 字面量改纯查表；新增门面导出 `sessionErrorI18nKey`，MePage 双端错误分支文案经它派生——`error.fallback`/`error.http` 字面量只存在于 `app/api/error.ts` 表内。

## 边界

- 不做（用户圈外）：双模板 script 下沉（卡 1）、plugins/auth 并回、登记册空转清理、组合根清单补 theme.server、business/*/test.txt 删除。
- 不改用户可见文案，唯一例外：/me network 类横幅从 `error.http` 文案换 `error.network` 文案（「网络异常，请稍后重试」）——属纠错；auth（过期）与 http 文案逐字不变。
- 不碰其他业务流；严格遵守 docs/conventions 与编码规范。
- theme 三文件（useTheme/useUserTheme/theme.server）属用户未提交改动，只动 cookie 行不动其余逻辑。

Reviewed: 2026-10-12（经 arch-fixes 计划审计，用户批准即生效）
