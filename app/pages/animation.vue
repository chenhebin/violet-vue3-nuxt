<script setup lang="ts">
import PcAnimationDemoPage from '~/views/pc/AnimationDemoPage.vue'
import MAnimationDemoPage from '~/views/m/AnimationDemoPage.vue'

const { t } = useLocale()
usePageMeta({ title: t('animation.title'), description: t('animation.desc') })
</script>

<template>
  <BusinessCommonDeviceView :pc="PcAnimationDemoPage" :m="MAnimationDemoPage" />
</template>
