<script setup lang="ts">
const { t, locale, toggleLocale } = useLocale()
const { switchDevice } = useDevice()

const localeLabel = computed(() => (locale.value === 'zh' ? 'English' : '中文'))
</script>

<template>
  <div data-device="m" class="layout layout-m">
    <header class="layout-nav">
      <NuxtLink to="/">{{ t('nav.home') }}</NuxtLink>
      <NuxtLink to="/about">{{ t('nav.about') }}</NuxtLink>
      <button type="button" class="nav-action" @click="toggleLocale">{{ localeLabel }}</button>
      <a href="#" class="nav-action" @click.prevent="switchDevice('pc')">电脑版</a>
    </header>
    <main class="layout-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout { min-height: 100dvh; display: flex; flex-direction: column; }
.layout-m .layout-main { width: 100%; padding: 16px; flex: 1; }
.layout-m { padding-bottom: env(safe-area-inset-bottom); }
.layout-nav { display: flex; gap: 16px; align-items: center; padding: 12px 24px; border-bottom: 1px solid #eee; }
.nav-action { background: none; border: none; padding: 0; font: inherit; color: var(--primary); cursor: pointer; }
</style>
