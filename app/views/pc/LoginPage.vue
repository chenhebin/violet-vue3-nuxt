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
      <button type="submit" :disabled="pending">{{ pending ? t('login.pending') : t('login.submit') }}</button>
      <p v-if="bannerError" class="banner-error">{{ bannerError }}</p>
    </form>
  </section>
</template>

<style scoped>
.login-page { max-width: 360px; }
.hint { color: var(--v-muted); font-size: 13px; }
.form { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
.field { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
.field input, .field select { padding: 8px 10px; border: 1px solid #ddd; border-radius: var(--v-radius); font: inherit; }
.field-error { color: #d63031; font-size: 12px; }
.banner-error { color: #d63031; font-size: 13px; background: #ffecec; border-radius: var(--v-radius); padding: 8px 12px; }
.form button { padding: 10px; border: none; border-radius: var(--v-radius); background: var(--v-primary); color: #fff; font: inherit; cursor: pointer; }
.form button:disabled { opacity: 0.6; cursor: default; }
</style>
