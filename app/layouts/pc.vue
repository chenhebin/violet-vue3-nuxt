<script setup lang="ts">
const { t, locale, toggleLocale } = useLocale()
const { switchDevice } = useDevice()

const localeLabel = computed(() => (locale.value === 'zh' ? 'English' : '中文'))
</script>

<template>
  <div data-device="pc" class="layout layout-pc">
    <header class="layout-nav">
      <NuxtLink to="/">{{ t('nav.home') }}</NuxtLink>
      <NuxtLink to="/about">{{ t('nav.about') }}</NuxtLink>
      <button type="button" class="nav-action" @click="toggleLocale">{{ localeLabel }}</button>
      <a href="#" class="nav-action" @click.prevent="switchDevice('m')">手机版</a>
    </header>
    <main class="layout-main">
      <slot />
    </main>
  </div>
</template>
