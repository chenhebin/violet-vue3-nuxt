export function useLocale() {
  const { t, locale, setLocale } = useI18n()

  function toggleLocale() {
    setLocale(locale.value === 'zh' ? 'en' : 'zh')
  }

  return { t, locale, toggleLocale }
}
