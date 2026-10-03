export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },
  telemetry: false,
  modules: ['@nuxt/eslint', '@nuxtjs/i18n', '@nuxt/scripts'],
  // 常量登记册目录（键名/事件名）：加入 auto-import，调用点零 import 引用
  imports: { dirs: ['constants'] },
  css: ['~/assets/css/main.css'],
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
