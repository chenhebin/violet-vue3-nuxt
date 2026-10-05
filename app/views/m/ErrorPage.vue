<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useLocale()
const is404 = computed(() => props.error.statusCode === 404)
usePageMeta({ title: is404.value ? t('error.notFound') : t('error.http'), description: t('error.desc') })

/** 回首页，顺手清掉错误状态（错误页不留进历史栈） */
function backHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <section class="error-page-m" data-device="m">
    <p class="error-code">{{ error.statusCode }}</p>
    <h1>{{ is404 ? t('error.notFound') : t('error.http') }}</h1>
    <button type="button" @click="backHome">{{ t('error.back') }}</button>
  </section>
</template>

<style scoped>
.error-page-m { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 16px; }
.error-code { margin: 0; font-size: 40px; font-weight: 700; color: var(--primary); }
.error-page-m h1 { margin: 0; font-size: 18px; }
.error-page-m button { margin-top: 8px; padding: 6px 16px; border: 1px solid var(--primary); border-radius: var(--radius-md); background: none; font: inherit; color: var(--primary); cursor: pointer; }
</style>
