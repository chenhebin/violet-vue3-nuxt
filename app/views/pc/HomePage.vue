<script setup lang="ts">
const { t } = useLocale()
const api = useApiClient()
const { data } = await useAsyncData('hello', () => api<{ message: string; device: string }>('/hello'))
</script>

<template>
  <section>
    <h1>{{ t('home.title') }}</h1>
    <p>api: {{ data?.message }}</p>
    <p>device echo: {{ data?.device }}</p>
    <NuxtLink to="/about">{{ t('nav.about') }}</NuxtLink>
  </section>
</template>
