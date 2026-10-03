<script setup lang="ts">
import PcHomePage from '~/views/pc/HomePage.vue'
import MHomePage from '~/views/m/HomePage.vue'

const { t } = useLocale()
usePageMeta({ title: t('home.title'), description: t('home.desc') })
</script>

<template>
  <BusinessCommonDeviceView :pc="PcHomePage" :m="MHomePage" />
</template>
