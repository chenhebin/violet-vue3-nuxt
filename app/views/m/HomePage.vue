<script setup lang="ts">
const { t } = useLocale()
const api = useApiClient()
const { data } = await useAsyncData('hello', () => api<{ message: string; device: string }>('/hello'))
</script>

<template>
  <section class="m-home">
    <h1>{{ t('home.title') }}</h1>
    <p>api: {{ data?.message }}</p>
    <p>device echo: {{ data?.device }}</p>
    <NuxtLink to="/about">{{ t('nav.about') }}</NuxtLink>
  </section>
</template>

<style scoped>
.m-home { display: flex; flex-direction: column; gap: 8px; }
.m-home h1 { font-size: 20px; margin: 0; }
.m-home p { margin: 0; font-size: 14px; color: var(--v-muted); }
</style>
