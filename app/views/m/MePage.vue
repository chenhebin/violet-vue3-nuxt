<script setup lang="ts">
import type { MockScene } from '~/api/auth'

const { t } = useLocale()
const { loadMe, logout } = useAuth()

const scene = (useRoute().query.scene === 'expired' ? 'expired' : '') as MockScene
const { data: session, pending } = await useAsyncData(`auth:me:${scene}`, () => loadMe(scene))
</script>

<template>
  <section class="m-me">
    <h1>{{ t('me.title') }}</h1>
    <p v-if="pending">{{ t('login.pending') }}</p>
    <template v-else-if="session?.ok">
      <p>{{ t('login.username') }}：{{ session.data.username }}</p>
      <p>{{ t('me.nickname') }}：{{ session.data.nickname }}</p>
      <button type="button" @click="logout">{{ t('me.logout') }}</button>
    </template>
    <template v-else-if="session && !session.ok && session.error.kind === 'auth'">
      <p class="banner-error">{{ t('me.expired') }}</p>
      <NuxtLink to="/login">{{ t('me.relogin') }}</NuxtLink>
    </template>
    <p v-else-if="session" class="banner-error">{{ t('error.http') }}</p>
    <p><NuxtLink to="/me?scene=expired">{{ t('me.simulateExpired') }}</NuxtLink></p>
  </section>
</template>

<style scoped>
.m-me { display: flex; flex-direction: column; gap: 8px; }
.m-me h1 { font-size: 20px; margin: 0; }
.m-me p { margin: 0; font-size: 14px; }
.m-me button { padding: 8px 16px; border: none; border-radius: var(--v-radius); background: var(--v-primary); color: #fff; font: inherit; align-self: flex-start; }
.banner-error { color: #d63031; background: #ffecec; border-radius: var(--v-radius); padding: 6px 10px; }
</style>
