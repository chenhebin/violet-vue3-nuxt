<script setup lang="ts">
const { t } = useLocale()
const root = ref<HTMLElement | null>(null)
useReveal(root)

// 试点用的假素材：60fps、90 帧、120x120 的纯色方块做呼吸。用 solid layer 手写的插值 keyframes
// 一旦缺缓动元数据，lottie light 就不给落值；实测 h:1 的 hold（阶跃）写法能用。正式素材等设计稿出，这里只为跑通链路
const pulse = { v: '5.7.4', fr: 60, ip: 0, op: 90, w: 120, h: 120, nm: 'pulse', ddd: 0, assets: [], layers: [{ ddd: 0, ind: 1, ty: 1, nm: 'square', sr: 1, sc: '#6c5ce7', sw: 120, sh: 120, ks: { o: { a: 1, k: [{ t: 0, s: [100], h: 1 }, { t: 45, s: [30], h: 1 }, { t: 89, s: [100] }] }, r: { a: 0, k: 0 }, p: { a: 0, k: [60, 60, 0] }, a: { a: 0, k: [60, 60, 0] }, s: { a: 0, k: [100, 100, 100] } }, ao: 0, ip: 0, op: 90, st: 0 }] }
</script>

<template>
  <section ref="root">
    <h1 data-reveal>{{ t('about.title') }}</h1>
    <p data-reveal>{{ t('about.desc') }}</p>
    <NuxtLink to="/">{{ t('nav.home') }}</NuxtLink>
    <!-- 试点滚动夹具：撑出一屏内容，好验证滚动显现触发和 Lottie 进出视口的播放暂停（正式页布局等设计稿） -->
    <div class="about-scroll-spacer" aria-hidden="true" />
    <p data-reveal>{{ t('about.desc') }}</p>
    <BasicCommonLottiePlayer :src="pulse" class="about-lottie" />
  </section>
</template>

<style scoped>
.about-scroll-spacer { height: 80vh; }
.about-lottie { width: 120px; height: 120px; }
</style>
