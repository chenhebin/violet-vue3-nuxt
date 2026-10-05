<script setup lang="ts">
const { t } = useLocale()

// m 端只示范轻量子集（触摸端不开 Lenis 平滑是定好的策略，但门面照常能用在 m 端）
const hero = ref<HTMLElement | null>(null)
const split = ref<HTMLElement | null>(null)

useHeroTimeline(hero)
useSplitText(split, { by: 'words' })
</script>

<template>
  <div class="demo-m">
    <section ref="hero">
      <h1 data-hero>{{ t('animation.heroTitle') }}</h1>
      <p data-hero>{{ t('animation.heroDesc') }}</p>
    </section>
    <section ref="split">
      <h2>{{ t('animation.splitTitle') }}</h2>
      <p data-split>{{ t('animation.splitText') }}</p>
    </section>
    <section>
      <h2>{{ t('animation.videoTitle') }}</h2>
      <BasicCommonVideoPlayer src="/demo/violet-gradient.mp4" />
    </section>
  </div>
</template>

<style scoped>
.demo-m { display: flex; flex-direction: column; gap: 16px; padding: 16px 0; }
section { border: 1px solid #eee; border-radius: 8px; padding: 24px; }
</style>
