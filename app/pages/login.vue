<script setup lang="ts">
import PcLoginPage from '~/views/pc/LoginPage.vue'
import MLoginPage from '~/views/m/LoginPage.vue'

const { t } = useLocale()
usePageMeta({ title: t('login.title'), description: t('login.desc') })
</script>

<template>
  <BusinessCommonDeviceView :pc="PcLoginPage" :m="MLoginPage" />
</template>
