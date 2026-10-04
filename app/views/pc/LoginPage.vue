<script setup lang="ts">
import type { MockScene } from '~/api/auth'
const { t } = useLocale()
const { login, pending, fieldError, bannerError } = useAuth()

const username = ref('violet')
const password = ref('123456')
const scene = ref<MockScene>('')

const sceneOptions: { value: MockScene; label: string }[] = [
  { value: '', label: t('login.sceneNone') },
  { value: 'http500', label: t('login.scene500') },
  { value: 'timeout', label: t('login.sceneTimeout') }
]

async function submit() {
  await login({ username: username.value, password: password.value }, scene.value)
}
</script>

<template>
  <section class="login-page">
    <h1>{{ t('login.title') }}</h1>
    <p class="hint">{{ t('login.hint') }}</p>
    <form class="form" @submit.prevent="submit">
      <label class="field">
        <span>{{ t('login.username') }}</span>
        <input v-model="username" name="username" autocomplete="username">
      </label>
      <label class="field">
        <span>{{ t('login.password') }}</span>
        <input v-model="password" name="password" type="password" autocomplete="current-password">
        <span v-if="fieldError" class="field-error">{{ fieldError }}</span>
      </label>
      <label class="field">
        <span>{{ t('login.scene') }}</span>
        <select v-model="scene">
          <option v-for="option in sceneOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
      <!-- rounded-lg = var(--radius) = 8px：shadcn 按钮 geom 是 rounded-md(--radius-2px)，试点要求与旧版圆角等值 -->
      <UiButton type="submit" class="rounded-lg" :disabled="pending">{{ pending ? t('login.pending') : t('login.submit') }}</UiButton>
      <p v-if="bannerError" class="banner-error">{{ bannerError }}</p>
    </form>
  </section>
</template>

<style scoped>
.login-page { max-width: 360px; }
.hint { color: var(--muted-foreground); font-size: 13px; }
.form { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
.field { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
.field input, .field select { padding: 8px 10px; border: 1px solid #ddd; border-radius: var(--radius); font: inherit; }
.field-error { color: #d63031; font-size: 12px; }
.banner-error { color: #d63031; font-size: 13px; background: #ffecec; border-radius: var(--radius); padding: 8px 12px; }
</style>
