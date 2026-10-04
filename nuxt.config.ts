import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },
  telemetry: false,
  // @nuxt/scripts 必须保持在 modules 末位：其类型声明（priority 2）需后注册才能压过
  // Nuxt 核心 script-stubs（实测前置会让 useScriptUmamiAnalytics 类型解析为 stubs 的 never）
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    'shadcn-nuxt',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/scripts'
  ],
  // 常量登记册目录（键名/事件名）：加入 auto-import，调用点零 import 引用；
  // composables 域文件夹（animation/ 等）经各自 index.ts 再导出收拢，新域建夹即生效
  imports: { dirs: ['constants', 'composables/*/index.ts'] },
  css: ['~/assets/css/main.css'],
  // shadcn-vue 组件注册：Ui 前缀（门牌号式，与 BusinessCommonDeviceView 命名同族），代码拷贝进 app/components/ui
  shadcn: {
    prefix: 'Ui',
    componentDir: '@/components/ui'
  },
  vite: { plugins: [tailwindcss()] },
  // 字体模块纯待命：全站走系统字体栈，禁用所有网络 provider（防构建期外网探测与告警）
  fonts: {
    providers: {
      adobe: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
      google: false,
      googleicons: false
    }
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  runtimeConfig: {
    public: {
      // API 基础路径
      apiBase: '/api',
      // 埋点配置
      umami: { hostUrl: '', websiteId: '' }
    }
  },
  nitro: {
    routeRules: {
      '/**': { headers: { 'Vary': 'User-Agent' } }
    }
  },
  i18n: {
    defaultLocale: 'zh',
    strategy: 'no_prefix',
    locales: [
      { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'v_locale',
      fallbackLocale: 'zh',
      redirectOn: 'root'
    }
  }
})