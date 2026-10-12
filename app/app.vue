<script setup lang="ts">
const { device } = useDevice()
const { theme } = useTheme()
const { overrides } = useUserTheme()
const userStyle = computed(() => toStyleAttr(overrides.value))
const { locale } = useLocale()

useHead({
  titleTemplate: (title?: string) => (title ? `${title} · Violet` : 'Violet'),
  htmlAttrs: { lang: locale, 'data-theme': theme, style: userStyle }
})
</script>

<template>
  <NuxtLayout :name="device">
    <NuxtPage />
  </NuxtLayout>
</template>
