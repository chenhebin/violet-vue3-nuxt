import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      // 全站公共规则放这里（目前没有要加的）
    }
  },
  {
    /**
     * 分层门禁（大厂底线：违规的代价提前到保存文件那一刻就得付）
     * 管的是视图/页面层：
     * - 禁止直接用全局 $fetch 发请求 → 必须走 useApiClient() 或对应域的 composable
     * - 禁止从 api/ 与 services/ 导入值 → 视图只依赖 composables（各域的门面）；type 导入放行
     * - 禁止用 useState 直接读写全局状态 → 必须走对应域的 composable 门面（像去柜台办事，不进仓库）
     * - 禁止直连动画供应商（gsap/lenis/lottie-web）→ 滚动显现走 useReveal、动效资产走
     *   LottiePlayer、底层访问走 useAnimation（供应商被隔离在门面和 plugins/animation.client.ts 里）
     * 已知局限：auto-import 不走 import 语句，gsap 直调只能靠 review 兜底；composables/basic 层
     * 不受这条门禁管（门面和播放器自己就是要用供应商的合法方）。动画禁令和 api/services 禁令必须放在
     * 本块同一个 no-restricted-imports 里——flat config 下同规则 ID 后面的块会整体盖掉前面的块，拆开写会冲掉先写的禁令
     */
    files: ['app/views/**/*.vue', 'app/pages/**/*.vue'],
    rules: {
      'no-restricted-globals': ['error', {
        name: '$fetch',
        message: '视图/页面层禁止直接发请求：请使用 useApiClient()（组合根注入）或对应域的 composable。'
      }],
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['~/api/*', '~/services/*'],
            allowTypeImports: true,
            message: '视图/页面层只允许依赖 composables（域门面）；api/ 与 services/ 仅放行 type 导入。'
          },
          {
            group: ['~/stores/*'],
            allowTypeImports: true,
            message: '视图/页面层不直连 Pinia store：状态消费走 composables 域门面（useAuth/useDevice…），store 编排也发生在门面/服务层。'
          },
          {
            group: ['gsap', 'gsap/**', 'lenis', 'lenis/**', 'lottie-web', 'lottie-web/**'],
            message: '动画供应商禁止直连视图层：滚动显现走 useReveal，动效资产走 LottiePlayer，底层访问走 useAnimation——供应商被隔离在门面与 plugins/animation.client.ts，换引擎只动两处。'
          }
        ]
      }],
      'no-restricted-syntax': ['error', {
        selector: "CallExpression[callee.name='useState']",
        message: '视图/页面层禁止直接读写全局状态（useState）：请使用对应域的 composable 门面（如 useAuth()）。'
      }]
    }
  },
  {
    /**
     * 公共类型层门禁：shared/types/ 只准导出纯类型（interface/type），
     * 禁止任何运行时的东西（const/function/class）——防公共层变成杂物间。
     */
    files: ['shared/types/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error',
        {
          selector: "ExportNamedDeclaration[declaration.type='VariableDeclaration']",
          message: 'shared/types 只允许纯类型导出：运行时值请放域内或 composables（见 shared/types/api.ts 头部三级归属规则）。'
        },
        {
          selector: "ExportNamedDeclaration[declaration.type='FunctionDeclaration']",
          message: 'shared/types 只允许纯类型导出：运行时值请放域内或 composables（见 shared/types/api.ts 头部三级归属规则）。'
        },
        {
          selector: "ExportNamedDeclaration[declaration.type='ClassDeclaration']",
          message: 'shared/types 只允许纯类型导出：运行时值请放域内或 composables（见 shared/types/api.ts 头部三级归属规则）。'
        }
      ]
    }
  },
  {
    /**
     * 常量层门禁：app/constants/ 只准导出常量和纯类型（登记册制度：常量统一登记在这），
     * 禁止函数/类——函数归 app/utils/，有状态逻辑归 composables/。
     */
    files: ['app/constants/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error',
        {
          selector: "ExportNamedDeclaration[declaration.type='FunctionDeclaration']",
          message: 'app/constants 只允许常量/纯类型导出：函数请放 app/utils/，有状态逻辑放 composables/。'
        },
        {
          selector: "ExportNamedDeclaration[declaration.type='ClassDeclaration']",
          message: 'app/constants 只允许常量/纯类型导出：类请放 app/utils/ 或域内模块。'
        }
      ]
    }
  }
  ,
  {
    /**
     * ui 层门禁：components/ui 是业务无感层（shadcn 拷贝制组件），
     * 禁止依赖 composables/api/services/constants——文案/状态都从 props 传进来，业务逻辑归 business 组件或 composables。
     * basic 层和 ui 层一个待遇：业务无感（LottiePlayer 这类通用原子组件，文案/数据全从 props 传）。
     * 分层的依赖方向：低层不许依赖高层——ui/basic 禁 import business（跨端复用的业务件 → 放 business/common/）。
     * 新组件放哪的四连问（按顺序）：① shadcn 拷贝？→ ui/ ② 通用无感的原子件（播放器/不含业务）？→ basic/common/
     * ③ 跨端复用的业务组件？→ business/common/ ④ 单端业务组件？→ business/<pc|m>/<域>/；
     * 路径最后一段目录表示域，文件名保留完整词（business/pc/product/Gallery.vue → BusinessPcProductGallery）。
     * 静态资源二分：要进打包的（首屏关键，需要 hash 管理）→ app/assets/ 走 import；用 URL 引用的（video src、lottie path）→ public/<域>/。
     * 已知局限：Nuxt auto-import 绕过 import 检查，ui/basic 层直接调 useAuth 这类只能靠 code review 兜底。
     */
    files: [
      'app/components/ui/**/*.vue', 'app/components/ui/**/*.ts',
      'app/components/basic/**/*.vue', 'app/components/basic/**/*.ts'
    ],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: [
            '~/composables/*', '~/api/*', '~/services/*', '~/constants/*', '~/stores/*',
            '**/composables/**', '**/api/**', '**/services/**', '**/constants/**', '**/stores/**',
            '~/components/business/*', '**/components/business/**'
          ],
          message: 'components/ui 与 components/basic 是业务无感层：文案/状态经 props 传入；业务逻辑归 business 组件或 composables，无感层不得依赖业务层。'
        }]
      }],
      // cva 的变体默认值由 buttonVariants 的 defaultVariants 承担，不是 props 默认值（shadcn 生成代码的惯例）
      'vue/require-default-prop': 'off'
    }
  }
)
