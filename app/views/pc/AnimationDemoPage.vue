<script setup lang="ts">
const { t } = useLocale()

// 每节一个效果门面：ref 指舞台根，标记元素进舞台（视图永不直连动画供应商）
const hero = ref<HTMLElement | null>(null)
const split = ref<HTMLElement | null>(null)
const parallax = ref<HTMLElement | null>(null)
const pinned = ref<HTMLElement | null>(null)

useHeroTimeline(hero)
useSplitText(split)
useParallax(parallax)
usePinnedSection(pinned)
</script>

<template>
  <div class="demo">
    <!-- ① 进场时间线：挂载即播，不等滚动 -->
    <section ref="hero" class="demo-hero">
      <h1 data-hero>{{ t('animation.heroTitle') }}</h1>
      <p data-hero>{{ t('animation.heroDesc') }}</p>
    </section>

    <!-- ② 逐字入场：滚动到位后逐字浮现 -->
    <section ref="split" class="demo-split">
      <h2>{{ t('animation.splitTitle') }}</h2>
      <p class="split-line" data-split>{{ t('animation.splitText') }}</p>
    </section>

    <!-- ③ 分层视差：背景大振幅、前景小振幅 -->
    <section ref="parallax" class="demo-parallax">
      <h2>{{ t('animation.parallaxTitle') }}</h2>
      <div class="parallax-stage">
        <div class="parallax-bg" data-parallax="120" aria-hidden="true" />
        <p class="parallax-fg" data-parallax="36">{{ t('animation.parallaxDesc') }}</p>
      </div>
    </section>

    <!-- ④ 钉住叙事：本节钉在视口，三步随滚动切换 -->
    <section ref="pinned" class="demo-pin">
      <h2>{{ t('animation.pinTitle') }}</h2>
      <div class="pin-stage">
        <p class="pin-step" data-step>{{ t('animation.pinStep1') }}</p>
        <p class="pin-step" data-step>{{ t('animation.pinStep2') }}</p>
        <p class="pin-step" data-step>{{ t('animation.pinStep3') }}</p>
      </div>
    </section>

    <!-- ⑤ basic 层第二播放器：视口播停 -->
    <section class="demo-video">
      <h2>{{ t('animation.videoTitle') }}</h2>
      <p>{{ t('animation.videoDesc') }}</p>
      <BasicCommonVideoPlayer class="demo-video-player" src="/demo/violet-gradient.mp4" />
    </section>
  </div>
</template>

<style scoped>
.demo { display: flex; flex-direction: column; gap: 24px; padding: 24px 0; }
section { border: 1px solid #eee; border-radius: 8px; padding: 32px; }

/* ③ 视差舞台：overflow hidden 裁掉位移出界的层 */
.parallax-stage { position: relative; height: 60vh; overflow: hidden; border-radius: 8px; }
.parallax-bg { position: absolute; inset: -25% 0; background: radial-gradient(circle at 50% 60%, var(--primary) 0%, transparent 65%); opacity: 0.35; }
.parallax-fg { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 600; }

/* ④ 钉住舞台：步骤叠放是 CSS 职责，切换时序归门面 */
.pin-stage { position: relative; height: 40vh; }
.pin-step { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 600; }

.demo-video-player { max-width: 480px; border-radius: 8px; }
</style>
