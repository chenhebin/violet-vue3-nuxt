<script setup lang="ts">
import PcAboutPage from '~/views/pc/AboutPage.vue'
import MAboutPage from '~/views/m/AboutPage.vue'

const { t } = useLocale()
usePageMeta({ title: t('about.title'), description: t('about.desc') })
</script>

<template>
  <BusinessCommonDeviceView :pc="PcAboutPage" :m="MAboutPage" />
</template>
