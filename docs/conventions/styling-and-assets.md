# 样式与静态资源

术语（登记册）见 [GLOSSARY.md](../../GLOSSARY.md)。Tailwind 4 CSS-first：没有 tailwind.config，token 直接在 CSS 里登记。

## 军规

1. `app/assets/css/main.css` 是唯一 CSS 入口（nuxt.config 的 `css` 数组只指向它）；新全局样式文件必须经它 import，不许另开入口 `[Review]`
2. 装配顺序固定：`tailwindcss` → `tw-animate-css` → `lenis/dist/lenis.css` → `tokens.css` → `base.css` `[Review]`
3. `tokens.css` 是全站唯一样式出处：新 token 先登记再使用；只登记有人用的，设计没定下来的不预先登记 `[Review]`
4. token 登记两步走：`:root` 放 CSS 变量，`@theme inline` 映射成 Tailwind 工具类（`--primary` → `text-primary` 这类）`[Review]`
5. 全局只留 token 与基线；业务样式一律写在组件 / 布局 SFC 的 `<style scoped>` 里，谁也不许往全局塞业务样式 `[Review]`
6. 页面切换过渡（pageTransition）的 CSS 写在 `base.css`（作用在页面组件包裹层，scoped 够不着）`[Review]`
7. 类名合并用 `cn()`（`app/utils/cn.ts` = `twMerge(clsx())`），组件内保证调用方 class 最后覆盖 `[Review]`
8. 静态资源二分：要进打包的（首屏关键、需要 hash 管理）→ `app/assets/` 走 import；用 URL 引用的（video src、lottie path）→ `public/<域>/`（规则同时登记在 eslint 配置头注，无机器门禁）`[Review]`
9. 全站系统字体栈：`@nuxt/fonts` 所有网络 provider 禁用是刻意的（构建期不外网探测、也消除 webfont 引起的 SplitText 回流），不要开启 `[Review]`

## 三个 CSS 文件的分工

| 文件 | 职责 |
|---|---|
| `main.css` | 唯一入口，只做装配 import |
| `tokens.css` | token 登记册：`:root` 变量 + `@theme inline` 映射 + `@custom-variant dark`（暗色按需补登记） |
| `base.css` | 全局基线：元素默认值（`@apply`）+ 系统字体栈 + 页面过渡 `.page-enter/leave` |

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
