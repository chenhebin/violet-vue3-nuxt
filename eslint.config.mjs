import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      // 全站公共规则位（当前无追加）
    }
  },
  {
    /**
     * 分层门禁（大厂底线：违规成本前置到保存文件那一刻）
     * 作用于视图/页面层：
     * - 禁止直接使用全局 $fetch 发请求 → 必须走 useApiClient() 或域 composable
     * - 禁止值导入 api/ 与 services/ → 视图只依赖 composables（域门面）；type 导入放行
     * - 禁止 useState 直接读写全局状态 → 必须走对应域的 composable 门面（柜台制度）
     * - 禁止直连动画供应商（gsap/lenis/lottie-web）→ 滚动显现走 useReveal、动效资产走
     *   LottiePlayer、底层访问走 useAnimation（供应商隔离在门面与 plugins/animation.client.ts）
     * 已知局限：auto-import 不经 import 语句，gsap 直调需 review 兜底；composables/basic 层
     * 不受此门禁（门面与播放器本身合法消费供应商）。动画禁令与 api/services 禁令必须同住
     * 本块同一 no-restricted-imports——flat config 同规则 ID 后块整体覆盖前块，拆块会冲掉先到的禁令
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
     * 公共类型层门禁：shared/types/ 只允许纯类型导出（interface/type），
     * 禁止任何运行时产物（const/function/class）——防止公共层沦为杂物间。
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
     * 常量层门禁：app/constants/ 只允许常量与纯类型导出（登记册制度），
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
     * 禁止依赖 composables/api/services/constants——文案/状态经 props 传入，业务逻辑归 business 组件或 composables。
     * basic 层同 ui 层：业务无感（LottiePlayer 等通用原子组件，文案/数据全经 props）。
     * 分层依赖方向：低层不得依赖高层——ui/basic 禁 import business（跨端复用业务件 → business/common/）。
     * 组件收纳判定（新组件四问，按序）：① shadcn 拷贝？→ ui/ ② 通用无感原子（播放器/无业务）？→ basic/common/
     * ③ 跨端复用的业务组件？→ business/common/ ④ 单端业务组件？→ business/<pc|m>/<域>/；
     * 路径末段目录承担域语义，文件名保持完整词（business/pc/product/Gallery.vue → BusinessPcProductGallery）。
     * 静态资源二分：进打包（首屏关键，要 hash 治理）→ app/assets/ 经 import；URL 引用（video src、lottie path）→ public/<域>/。
     * 已知局限：Nuxt auto-import 绕过 import 检查，ui/basic 层直接调用 useAuth 等需 code review 兜底。
     */
    files: [
      'app/components/ui/**/*.vue', 'app/components/ui/**/*.ts',
      'app/components/basic/**/*.vue', 'app/components/basic/**/*.ts'
    ],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: [
            '~/composables/*', '~/api/*', '~/services/*', '~/constants/*',
            '**/composables/**', '**/api/**', '**/services/**', '**/constants/**',
            '~/components/business/*', '**/components/business/**'
          ],
          message: 'components/ui 与 components/basic 是业务无感层：文案/状态经 props 传入；业务逻辑归 business 组件或 composables，无感层不得依赖业务层。'
        }]
      }],
      // cva 变体默认值由 buttonVariants 的 defaultVariants 承担，非 props 默认值（shadcn 生成代码惯例）
      'vue/require-default-prop': 'off'
    }
  }
)
