export default {
  plugins: ['stylelint-declaration-strict-value'],
  extends: ['stylelint-config-standard'],
  overrides: [{ files: ['**/*.vue'], customSyntax: 'postcss-html' }],
  ignoreFiles: ['.nuxt/**', '.output/**', 'node_modules/**'],
  rules: {
    // Tailwind 4 CSS-first 的指令别当未知 at-rule 报错
    'at-rule-no-unknown': [true, {
      ignoreAtRules: ['tailwind', 'theme', 'source', 'utility', 'variant', 'custom-variant', 'apply', 'reference', 'plugin', 'config']
    }],
    // 颜色/圆角必须走 token：P1 清零与主题机制的机器防线（这条是门禁本体，永不放宽）。
    // 规则名必须带插件命名空间（stylelint 不做短名别名，见插件 README）
    'scale-unlimited/declaration-strict-value': [[
      'color', 'background-color', 'border-color', 'outline-color', 'fill', 'stroke', 'border-radius'
    ], {
      ignoreValues: ['transparent', 'currentColor', 'inherit', '0', '/^var\\(--/'],
      expandShorthand: true
    }],
    // 全仓 scoped 样式是单行块写法（styling-and-assets.md 的范式示例即单行）
    'declaration-block-single-line-max-declarations': null,
    // shadcn 色板写法：oklch 不带 %/deg、hex 不缩写（#ffffff 不写 #fff）
    'lightness-notation': null,
    'hue-degree-notation': null,
    'color-hex-length': null,
    // @import 用字符串形式（Tailwind 官方文档风格）
    'import-notation': null,
    // @apply 的 Tailwind 工具类不是合法 CSS prelude，postcss 解析不了
    'at-rule-prelude-no-invalid': null,
    // 单行块内部不需要空行分隔
    'rule-empty-line-before': null,
    'declaration-empty-line-before': null,
    'custom-property-empty-line-before': null
  }
}
