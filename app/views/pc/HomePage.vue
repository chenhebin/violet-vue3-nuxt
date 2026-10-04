<script setup lang="ts">
const { t } = useLocale()
const { data } = await useHello()
</script>

<template>
  <section>
    <h1>{{ t('home.title') }}</h1>
    <p>api: {{ data?.message }}</p>
    <p>device echo: {{ data?.device }}</p>
    <NuxtLink to="/about">{{ t('nav.about') }}</NuxtLink>
  </section>
</template>
