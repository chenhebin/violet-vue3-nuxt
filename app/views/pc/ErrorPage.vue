<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useLocale()
const is404 = computed(() => props.error.statusCode === 404)
usePageMeta({ title: is404.value ? t('error.notFound') : t('error.http'), description: t('error.desc') })

/**
 * 回首页，顺手清掉错误状态（错误页不留进历史栈）
 */
function backHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <section class="error-page" data-device="pc">
    <p class="error-code">{{ error.statusCode }}</p>
    <h1>{{ is404 ? t('error.notFound') : t('error.http') }}</h1>
    <button type="button" @click="backHome">{{ t('error.back') }}</button>
  </section>
</template>

<style scoped>
.error-page { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 24px; }
.error-code { margin: 0; font-size: 56px; font-weight: 700; color: var(--primary); }
.error-page h1 { margin: 0; }
.error-page button { margin-top: 12px; padding: 8px 20px; border: 1px solid var(--primary); border-radius: var(--radius-md); background: none; font: inherit; color: var(--primary); cursor: pointer; }
.error-page button:hover { background: var(--primary); color: #fff; }
</style>
