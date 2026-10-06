<script setup lang="ts">
import type { MockScene } from '~/api/auth'
const { t } = useLocale()
const { login, pending, fieldError, bannerError, rememberedUsername, setRememberedUsername } = useAuth()

const username = ref('violet')
const password = ref('123456')
const scene = ref<MockScene>('')
const remember = ref(false)
// 挂载后才回填：SSR 服务端没有 localStorage，服务端渲染空的、客户端水合后再填，规避水合错位（持久化 demo 的防错位示范点）
onMounted(() => {
  if (rememberedUsername.value) {
    remember.value = true
    username.value = rememberedUsername.value
  }
})

const sceneOptions: { value: MockScene; label: string }[] = [
  { value: '', label: t('login.sceneNone') },
  { value: 'http500', label: t('login.scene500') },
  { value: 'timeout', label: t('login.sceneTimeout') }
]

async function submit() {
  // 意图即记录（不依赖登录成败）：勾了就记当前用户名，没勾就清空
  setRememberedUsername(remember.value ? username.value : '')
  await login({ username: username.value, password: password.value }, scene.value)
}
</script>

<template>
  <section class="m-login">
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
      <label class="field remember">
        <input v-model="remember" type="checkbox">
        <span>{{ t('login.remember') }}</span>
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
.m-login h1 { font-size: 20px; margin: 0 0 8px; }
.hint { color: var(--muted-foreground); font-size: 12px; margin: 0; }
.form { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.field { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
.field input, .field select { padding: 8px; border: 1px solid #ddd; border-radius: var(--radius); font: inherit; }
.field-error { color: #d63031; font-size: 12px; }
.banner-error { color: #d63031; font-size: 12px; background: #ffecec; border-radius: var(--radius); padding: 6px 10px; }
.field.remember { flex-direction: row; align-items: center; gap: 6px; }
.form button { padding: 10px; border: none; border-radius: var(--radius); background: var(--primary); color: #fff; font: inherit; }
.form button:disabled { opacity: 0.6; }
</style>
