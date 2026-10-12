<script setup lang="ts">
const { t } = useLocale()
const { logout } = useAuth()

const { overrides, preview, commit, reset } = useUserTheme()
const draftPrimary = ref(overrides.value.primary ?? '#6c5ce7')
const draftRadius = ref(Number((overrides.value.radius ?? '8px').replace('px', '')))
/** 预览只写 store（即时生效不落 cookie）；保存才固化；重置连草稿一起还原 */
function applyTheme() { preview({ primary: draftPrimary.value, radius: `${draftRadius.value}px` }) }
function saveTheme() { applyTheme(); commit() }
function resetTheme() { reset(); draftPrimary.value = '#6c5ce7'; draftRadius.value = 8 }
const { data: session, pending } = await useMe()
const sessionExpired = computed(() => {
  const s = session.value
  return s !== null && s !== undefined && s.ok === false && s.error.kind === 'auth'
})
const sessionErrorText = computed(() => {
  const key = sessionErrorI18nKey(session.value)
  return key ? t(key) : null
})
</script>

<template>
  <section class="m-me">
    <h1>{{ t('me.title') }}</h1>
    <p v-if="pending">{{ t('login.pending') }}</p>
    <template v-else-if="session?.ok">
      <p>{{ t('login.username') }}：{{ session.data.username }}</p>
      <p>{{ t('me.nickname') }}：{{ session.data.nickname }}</p>
      <button type="button" @click="logout">{{ t('me.logout') }}</button>
      <fieldset class="theme-panel">
        <legend>{{ t('me.theme.title') }}</legend>
        <label>{{ t('me.theme.primary') }}<input v-model="draftPrimary" type="color"></label>
        <label>{{ t('me.theme.radius') }}<input v-model.number="draftRadius" type="range" min="0" max="24" step="1">{{ draftRadius }}px</label>
        <button type="button" class="secondary" @click="applyTheme">{{ t('me.theme.preview') }}</button>
        <button type="button" @click="saveTheme">{{ t('me.theme.save') }}</button>
        <button type="button" class="secondary" @click="resetTheme">{{ t('me.theme.reset') }}</button>
      </fieldset>
    </template>
    <template v-else-if="sessionExpired">
      <p class="banner-error">{{ sessionErrorText }}</p>
      <NuxtLink to="/login">{{ t('me.relogin') }}</NuxtLink>
    </template>
    <p v-else-if="session" class="banner-error">{{ sessionErrorText }}</p>
    <p><NuxtLink to="/me?scene=expired">{{ t('me.simulateExpired') }}</NuxtLink></p>
  </section>
</template>

<style scoped>
.m-me { display: flex; flex-direction: column; gap: 8px; }
.m-me h1 { font-size: 20px; margin: 0; }
.m-me p { margin: 0; font-size: 14px; }
.m-me button { padding: 8px 16px; border: none; border-radius: var(--radius); background: var(--primary); color: var(--primary-foreground); font: inherit; align-self: flex-start; }
.banner-error { color: var(--destructive); background: var(--destructive-soft); border-radius: var(--radius); padding: 6px 10px; }
.theme-panel { border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.theme-panel label { display: flex; align-items: center; gap: 8px; }
.theme-panel button.secondary { background: var(--secondary); color: var(--secondary-foreground); }
</style>
