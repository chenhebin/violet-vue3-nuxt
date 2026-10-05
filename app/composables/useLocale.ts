/**
 * locale 域门面（读语言、切语言的唯一出口）：i18n 实例的细节不出本层。
 * 项目只有中英双语，切换就是互切，不做语言列表参数化。
 */
export function useLocale() {
  const { t, locale, setLocale } = useI18n()

  /** 中英互切（i18n cookie 持久化由 @nuxtjs/i18n 接管，我们不用管） */
  function toggleLocale() {
    setLocale(locale.value === 'zh' ? 'en' : 'zh')
  }

  return { t, locale, toggleLocale }
}
