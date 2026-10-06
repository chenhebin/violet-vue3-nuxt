import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },
  telemetry: false,
  // @nuxt/scripts 必须放 modules 最后一个：它的类型声明（priority 2）要后注册才能盖过
  // Nuxt 核心的 script-stubs（实测放前面会让 useScriptUmamiAnalytics 的类型解析成 stubs 里的 never）
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    'shadcn-nuxt',
    '@nuxt/image',
    '@nuxt/fonts',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/scripts'
  ],
  // 常量登记册（统一放键名/事件名的地方）：加进 auto-import，调用处不用写 import；
  // composables 的域文件夹（animation/ 等）经各自的 index.ts 再导出收拢，新建一个域文件夹就自动生效；
  // stores 是 Pinia 域 store（app/stores/<域>.ts），经项目原生 auto-import 暴露（不依赖 @pinia/nuxt 的 storesDirs 默认值）
  imports: { dirs: ['constants', 'composables/*/index.ts', 'stores'] },
  // Pinia 持久化全局键模板：localStorage 键形如 violet:auth（%id 即 store id，登记在 PINIA_STORE_IDS）。
  // 不设全局 storage：默认是 cookies，本项目的规矩是每个要持久化的 store 显式声明 storage: piniaPluginPersistedstate.localStorage()
  piniaPluginPersistedstate: { key: 'violet:%id' },
  css: ['~/assets/css/main.css'],
  // shadcn-vue 组件注册：Ui 前缀（像门牌号，和 BusinessCommonDeviceView 命名一路的），代码拷贝进 app/components/ui
  shadcn: {
    prefix: 'Ui',
    componentDir: '@/components/ui'
  },
  vite: { plugins: [tailwindcss()] },
  // 字体模块只待命不动事：全站用系统字体栈，禁掉所有网络 provider（防构建期去外网探测然后报一堆告警）
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
      // API 的基础路径
      apiBase: '/api',
      // 埋点的配置
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