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
     */
    files: ['app/views/**/*.vue', 'app/pages/**/*.vue'],
    rules: {
      'no-restricted-globals': ['error', {
        name: '$fetch',
        message: '视图/页面层禁止直接发请求：请使用 useApiClient()（组合根注入）或对应域的 composable。'
      }],
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['~/api/*', '~/services/*'],
          allowTypeImports: true,
          message: '视图/页面层只允许依赖 composables（域门面）；api/ 与 services/ 仅放行 type 导入。'
        }]
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
)
