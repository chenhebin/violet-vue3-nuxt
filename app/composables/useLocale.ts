/**
 * locale 域门面：语言读取与切换的唯一出口，i18n 实例细节不出本层。
 * 项目仅中英双语，切换即互切，不做语言列表参数化。
 */
export function useLocale() {
  const { t, locale, setLocale } = useI18n()

  /** 中英互切（i18n cookie 持久化由 @nuxtjs/i18n 接管） */
  function toggleLocale() {
    setLocale(locale.value === 'zh' ? 'en' : 'zh')
  }

  return { t, locale, toggleLocale }
}
