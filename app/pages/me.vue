<script setup lang="ts">
import PcMePage from '~/views/pc/MePage.vue'
import MMePage from '~/views/m/MePage.vue'

definePageMeta({ middleware: 'auth', key: route => route.fullPath })

const { t } = useLocale()
usePageMeta({ title: t('me.title'), description: t('me.title') })
</script>

<template>
  <BusinessCommonDeviceView :pc="PcMePage" :m="MMePage" />
</template>
