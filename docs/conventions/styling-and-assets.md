# 样式与静态资源

术语（登记册）见 [GLOSSARY.md](../../GLOSSARY.md)。Tailwind 4 CSS-first：没有 tailwind.config，token 直接在 CSS 里登记。

## 军规

1. `app/assets/css/main.css` 是唯一 CSS 入口（nuxt.config 的 `css` 数组只指向它）；新全局样式文件必须经它 import，不许另开入口 `[Review]`
2. 装配顺序固定：`tailwindcss` → `tw-animate-css` → `lenis/dist/lenis.css` → `tokens.css` → `themes/dark.css` → `base.css`（themes 必须在 tokens 之后：`:root` 与 `[data-theme]` 同特异度，后写者赢） `[Review]`
3. `tokens.css` 是全站唯一样式出处：新 token 先登记再使用；只登记有人用的，设计没定下来的不预先登记 `[Review]`
4. token 登记两步走：`:root` 放 CSS 变量，`@theme inline` 映射成 Tailwind 工具类（`--primary` → `text-primary` 这类）`[Review]`
5. 全局只留 token 与基线；业务样式一律写在组件 / 布局 SFC 的 `<style scoped>` 里，谁也不许往全局塞业务样式 `[Review]`
6. 页面切换过渡（pageTransition）的 CSS 写在 `base.css`（作用在页面组件包裹层，scoped 够不着）`[Review]`
7. 类名合并用 `cn()`（`app/utils/cn.ts` = `twMerge(clsx())`），组件内保证调用方 class 最后覆盖 `[Review]`
8. 静态资源二分：要进打包的（首屏关键、需要 hash 管理）→ `app/assets/` 走 import；用 URL 引用的（video src、lottie path）→ `public/<域>/`（规则同时登记在 eslint 配置头注，无机器门禁）`[Review]`
9. 全站系统字体栈：`@nuxt/fonts` 所有网络 provider 禁用是刻意的（构建期不外网探测、也消除 webfont 引起的 SplitText 回流），不要开启 `[Review]`

## CSS 文件的分工

| 文件 | 职责 |
|---|---|
| `main.css` | 唯一入口，只做装配 import |
| `tokens.css` | token 登记册：`:root` 变量 + `@theme inline` 映射 + `@custom-variant dark` |
| `themes/dark.css` | 暗色主题包：`[data-theme="dark"]` 只覆盖已登记的语义 token，不造新名、不写样式规则 |
| `base.css` | 全局基线：元素默认值（`@apply`）+ 系统字体栈 + 页面过渡 `.page-enter/leave` |

## 主题切换

- 机制链路：`v_theme` cookie → `plugins/theme.server.ts`（SSR 从 cookie 恢复写 theme store）→ `app.vue` 的 `useHead` 直出 `<html data-theme>`（服务端渲染时结论已定，零闪屏）→ 切换走 `useTheme().switchTheme`（写 cookie + 写 store，`useHead` 响应式更新）
- 主题包（`themes/*.css`）只准覆盖 `tokens.css` 已登记的语义 token；新主题 = 新主题包文件 + `main.css` 按序 import，不动 tokens.css
- 切主题不刷新页面：只改 CSS 变量，重算一次 paint 即可（与切端整页刷新的策略差异是刻意的）
- 埋点：`theme_switch`（登记在 `app/constants/track.ts`），cookie 键 `v_theme`（登记在 `app/constants/keys.ts`）

## 用户覆盖层

- 白名单登记：用户能拧的旋钮全集在 `app/constants/theme.ts` 的 `USER_TOKEN_OVERRIDES`（键与 `shared/types/theme.ts` 的 `UserOverrideKey` 编译期对齐）；不在白名单的 token 用户不可覆盖
- 校验：`app/utils/userTheme.ts` 纯函数层——cookie 原文先 `parseUserThemeCookie` 剥白名单外键，再 `sanitizeUserOverrides`（主色须 `#rrggbb`、圆角 0–24px；只做格式与白名单这条安全边界，防 cookie 注入任意 CSS——设计性限制如对比度门槛已按产品决策移除，用户随意预览），不合格静默丢弃（cookie 不可信，SSR 直出前必过）
- 注入机制：覆盖值经 `app.vue` 的 `useHead` 渲染成 `<html style="--primary:…">` 内联变量——内联特异度高于一切选择器，天然覆盖 `:root` 与 `[data-theme]`，全程禁 `!important`，tokens.css 零改动
- 优先级语义：用户显式选择 > 主题预设 > 默认值
- 持久化：`v_utheme` cookie（一年，键登记在 `keys.ts`）；门面 `useUserTheme`（preview 即时预览不落盘 / commit 固化 / reset 清空），账号级同步接真实后端时只换 commit 的实现，形状不变
- 埋点：`user_theme_commit`（属性 keys 为实际生效键的逗号串，登记在 `track.ts`）

## 视图侧写法

- 业务样式写各自 SFC 的 `<style scoped>`，引用 token 变量（`var(--primary)`、`var(--radius)`、`var(--container-page)`），范式参照 `app/views/pc/LoginPage.vue`、`app/layouts/pc.vue`
- Tailwind 工具类的用法参照 `ui/` 的 cva 变体串与 `base.css` 的 `@apply`
- 页面级容器宽度用 `--container-page` token，不自造 magic number

## 新 token 登记流程

1. 设计定了值 → 在 `tokens.css` 的 `:root` 加变量
2. 需要工具类 → 在 `@theme inline` 加映射
3. 只登记当前有人用的；Dialog / Popover / 暗色模式这类整块 token 等真正引入时再补登记

## 静态资源放置

| 类型 | 去处 | 引用方式 |
|---|---|---|
| 首屏关键、要 hash 管理 | `app/assets/` | 构建 import |
| video `src`、lottie `path` 等 URL 引用 | `public/<域>/` | 绝对路径 URL |

lottie 动画数据若内联传对象，播放器内部会 `structuredClone` 深拷贝（lottie 会就地改写传入常量），组件侧不用预防——见 [animation.md](animation.md) 的 LottiePlayer 说明。
