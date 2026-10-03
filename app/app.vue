<script setup lang="ts">
const { device } = useDevice()
const { locale } = useLocale()

useHead({
  titleTemplate: (title?: string) => (title ? `${title} · Violet` : 'Violet'),
  htmlAttrs: { lang: locale }
})
</script>

<template>
  <NuxtLayout :name="device">
    <NuxtPage />
  </NuxtLayout>
</template>
