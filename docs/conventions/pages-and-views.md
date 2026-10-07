# 页面、视图与双模板

术语（双模板、门面）见 [GLOSSARY.md](../../GLOSSARY.md)。设备自适应是本项目的骨架特性：一个 URL，服务端按设备渲染 pc 或 m 整棵树，不做两套站点。

## 军规

1. 每个路由一个 `app/pages/<route>.vue` 薄壳文件：只做双模板分发和 SEO 元信息，业务逻辑一行不写 `[Review]`
2. 页面真实实现成对放 `app/views/pc/` 与 `app/views/m/`，文件名以 `Page` 结尾（如 `HomePage.vue`）；新页面必须两端同时提供 `[Review]`
3. 设备判定只走 `app/utils/device.ts` 的 `resolveDevice` 一份算法，任何地方不许另写判定 `[Review]`
4. 手动切端 = 写 `v_device` cookie + 整页刷新回 SSR 重判；不做实时换模板 `[Review]`
5. 受保护路由经 `definePageMeta({ middleware: 'auth' })` 声明，不在页面内手写守卫 `[Review]`
6. `useAsyncData` 的 key 走域前缀制 `域:实体`（如 `auth:me`、`hello:message`），pc / m 双端共用同一份数据源 `[Review]`
7. 路由滚动已被 `app/router.options.ts` 接管（Lenis 优先，降级回落原生）；页面里不要出现 `window.scrollTo` `[Review]`
8. 全局错误页 `app/error.vue` 是薄壳：设备判定在此重算一遍（nitro 错误走 `/__nuxt_error` 虚拟地址，插件读不到原 URL 的 device 参数）`[Review]`

## 薄壳模式（canonical）

每个 pages 文件长这样（范式参照 `app/pages/me.vue`，含 middleware 与路由 key 的最全形态）：

```vue
<script setup lang="ts">
import PcXxxPage from '~/views/pc/XxxPage.vue'
import MXxxPage from '~/views/m/XxxPage.vue'
const { t } = useLocale()
usePageMeta({ title: t('xxx.title'), description: t('xxx.desc') })
</script>

<template>
  <BusinessCommonDeviceView :pc="PcXxxPage" :m="MXxxPage" />
</template>
```

- SEO 元信息一律走 `usePageMeta` 门面（内部 useSeoMeta 含 og 字段），不直接 useSeoMeta
- 标题模板 `${title} · Violet` 在 `app/app.vue` 统一设置，页面只传业务标题
- 需要随路由参数重取数据的页面，`definePageMeta` 里配 `key: route => route.fullPath`

## DeviceView 与设备判定流

- 分发器：`app/components/business/common/DeviceView.vue`，接收 `pc` / `m` 两个组件按 `isMobile` 现场挑一套
- 判定原料三优先级（`resolveDevice`）：① URL 参数 `?device=pc|m` ② cookie `v_device` ③ UA 正则匹配手机浏览器
- 服务端在 `app/plugins/device.server.ts` 收原料判定，结论写进 device store（唯一写入方）；`app.vue` 的 `<NuxtLayout :name="device">` 挑 `layouts/pc.vue` 或 `m.vue`
- 用户点切端：`useDevice().switchDevice()` 写 cookie（一年）后整页刷新——最省事也最不容易出两端状态不一致

## 布局与全局壳

- `app/app.vue`：按设备挑布局 + 标题模板 + `htmlAttrs.lang` 跟随 locale
- `app/layouts/pc.vue` / `m.vue`：导航、切语言（`useLocale().toggleLocale`）、切端；布局样式写各自 SFC 的 `<style scoped>`
- 页面切换过渡 `pageTransition: { name: 'page', mode: 'out-in' }`（nuxt.config），过渡 CSS 在全局 `app/assets/css/base.css`（作用在页面组件包裹层，所以必须全局）

## 中间件与守卫

- `app/middleware/auth.ts`：未登录踢去 `/login` 并带 `redirect` 参数；页面按需经 `definePageMeta` 声明
- 登录成功后的跳转优先用守卫带来的 `redirect`，且只认站内路径（正则拦开放重定向）——该逻辑在 `useAuth` 门面，不在视图

## 视图层禁止事项（有 lint 门禁）

以下在 `app/views/**` 与 `app/pages/**` 保存文件那一刻就会被 eslint 拦下（详见 [quality.md](quality.md) 的门禁表）：

- 直接用全局 `$fetch` 发请求 `[ESLint]`
- 值导入 `~/api/*`、`~/services/*`、`~/stores/*`（type 导入放行）`[ESLint]`
- 直写 `useState` `[ESLint]`
- import `gsap` / `lenis` / `lottie-web` `[ESLint]`

数据的正确消费方式见 [data-and-errors.md](data-and-errors.md)；动效见 [animation.md](animation.md)。
