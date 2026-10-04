<script setup lang="ts">
const { t } = useLocale()
const { data } = await useHello()
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
.m-home p { margin: 0; font-size: 14px; color: var(--muted-foreground); }
</style>
