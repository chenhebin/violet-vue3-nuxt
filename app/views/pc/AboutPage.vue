<script setup lang="ts">
const { t } = useLocale()
</script>

<template>
  <section>
    <h1>{{ t('about.title') }}</h1>
    <p>{{ t('about.desc') }}</p>
    <NuxtLink to="/">{{ t('nav.home') }}</NuxtLink>
  </section>
</template>
