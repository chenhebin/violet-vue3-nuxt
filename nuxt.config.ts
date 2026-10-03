export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },
  telemetry: false,
  modules: ['@nuxt/eslint', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  runtimeConfig: {
    public: { apiBase: '/api' }
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
