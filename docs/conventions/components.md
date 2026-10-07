# 组件规范

术语（业务无感层、域格子）见 [GLOSSARY.md](../../GLOSSARY.md)。组件分三层放置，依赖方向低层不许依赖高层。

## 军规

1. 新组件放哪，四连问按顺序判（见下表）；判不准就往下放（更通用的位置）`[Review]`
2. `components/ui/` 与 `components/basic/` 是业务无感层：文案、状态、数据全从 props 传入，禁止依赖 composables / api / services / constants / stores，禁止 import business 组件 `[ESLint]`
3. 组件名 = 路径前缀自动拼接：文件名保留完整词，路径最后一段目录表示域（`business/pc/product/Gallery.vue` → `BusinessPcProductGallery`）`[Review]`
4. shadcn 组件经 `Ui` 前缀使用（如 `<UiButton>`），拷贝制代码在 `components/ui/` 当场可改 `[Review]`
5. SFC 一律 `<script setup lang="ts">` 作为首块 `[Review]`
6. props 用 type-only `defineProps<{...}>()`；默认值用 `withDefaults`；全部必填的 props 不给默认值 `[Review]`
7. ui / basic 层的 cva 变体默认值由 `defaultVariants` 承担，不写 props 默认值（`vue/require-default-prop` 已对这两层关闭）`[ESLint]`

## 放置四连问

| 顺序 | 问题 | 去处 | 例子 |
|---|---|---|---|
| ① | 是 shadcn 拷贝？ | `components/ui/` | `ui/button/` |
| ② | 通用无感的原子件（不含业务）？ | `components/basic/common/` | `LottiePlayer`、`VideoPlayer` |
| ③ | 跨端复用的业务组件？ | `components/business/common/` | `DeviceView` |
| ④ | 单端业务组件？ | `components/business/<pc\|m>/<域>/` | `business/pc/product/Gallery.vue` |

- basic 与 business 的单端子目录（`basic/pc/` 等）留位待用，有单端原子件再放
- 无感层的判定标准是「换一个业务项目也能原样搬走」：只要组件里出现了业务文案、业务状态、埋点语义，它就不属于 ui / basic

## 三层职责与依赖方向

| 层 | 定位 | 可以依赖 |
|---|---|---|
| `ui/` | shadcn 拷贝制组件，`Ui` 前缀注册 | reka-ui、cva、`cn()`、props |
| `basic/` | 通用原子件（播放器这类） | 原生能力、props |
| `business/` | 业务组件 | 上面两层 + composables 门面（common/ 下的跨端件如 DeviceView 保持无业务状态） |

低层依赖高层（ui/basic import business）保存即报错 `[ESLint]`；business 组件消费数据也走域门面，不越过门面摸 api / stores。

## SFC 风格（canonical）

范式参照 `app/components/business/common/DeviceView.vue`（必填 props 的最简形态）与 `app/components/basic/common/LottiePlayer.vue`（withDefaults + 自清理生命周期）：

```vue
<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string
  loop?: boolean
}>(), {
  loop: true
})
</script>
```

- Vue / Nuxt API（`ref`、`computed`、`onMounted`、`navigateTo`…）依赖 auto-import，不写 import 语句
- 跨域的值导入才写 import（如 `import PcXxxPage from '~/views/pc/XxxPage.vue'`）
- auto-import 会绕过 eslint 的 import 检查：ui / basic 层里直接调 `useAuth` 这类门面 lint 拦不住，靠 review 兜底 `[Review]`

## 类名与变体

- 类名合并统一走 `cn()`（`app/utils/cn.ts` = `twMerge(clsx(...))`），不手拼字符串
- ui 组件变体用 `cva` 声明在 `ui/<comp>/index.ts`；组件内 `cn(xxxVariants({ variant, size }), props.class)` 保证调用方 class 最后覆盖
- 样式写法（scoped CSS 与 token）见 [styling-and-assets.md](styling-and-assets.md)
