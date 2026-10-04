<script setup lang="ts">
const { t } = useLocale()
const root = ref<HTMLElement | null>(null)
useReveal(root)

// 试点夹具：60fps、90 帧 120x120 纯色方块阶跃呼吸（solid layer；手写插值 keyframes 缺缓动元数据
// 时 lottie light 不落值，h:1 hold 制实测可用）；正式素材由设计稿替换，仅证链路
const pulse = { v: '5.7.4', fr: 60, ip: 0, op: 90, w: 120, h: 120, nm: 'pulse', ddd: 0, assets: [], layers: [{ ddd: 0, ind: 1, ty: 1, nm: 'square', sr: 1, sc: '#6c5ce7', sw: 120, sh: 120, ks: { o: { a: 1, k: [{ t: 0, s: [100], h: 1 }, { t: 45, s: [30], h: 1 }, { t: 89, s: [100] }] }, r: { a: 0, k: 0 }, p: { a: 0, k: [60, 60, 0] }, a: { a: 0, k: [60, 60, 0] }, s: { a: 0, k: [100, 100, 100] } }, ao: 0, ip: 0, op: 90, st: 0 }] }
</script>

<template>
  <section ref="root">
    <h1 data-reveal>{{ t('about.title') }}</h1>
    <p data-reveal>{{ t('about.desc') }}</p>
    <NuxtLink to="/">{{ t('nav.home') }}</NuxtLink>
    <!-- 试点滚动夹具：制造 fold 下内容，验证显现触发与 Lottie 视口播停（正式页由设计稿重排） -->
    <div class="about-scroll-spacer" aria-hidden="true" />
    <p data-reveal>{{ t('about.desc') }}</p>
    <BasicCommonLottiePlayer :src="pulse" class="about-lottie" />
  </section>
</template>

<style scoped>
.about-scroll-spacer { height: 80vh; }
.about-lottie { width: 120px; height: 120px; }
</style>
