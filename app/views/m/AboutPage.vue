<script setup lang="ts">
const { t } = useLocale()
</script>

<template>
  <section class="m-about">
    <h1>{{ t('about.title') }}</h1>
    <p>{{ t('about.desc') }}</p>
    <NuxtLink to="/">{{ t('nav.home') }}</NuxtLink>
  </section>
</template>

<style scoped>
.m-about { display: flex; flex-direction: column; gap: 8px; }
.m-about h1 { font-size: 20px; margin: 0; }
.m-about p { margin: 0; font-size: 14px; color: var(--v-muted); }
</style>
