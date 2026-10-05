<script setup lang="ts">
const { t } = useLocale()

// 每一节配一个效果门面：ref 指向该节的舞台根元素，要动效的元素打标记进舞台（视图永远不直接 import 动画库）
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
    <!-- ① 进场时间线：页面挂载就播，不用等滚动 -->
    <section ref="hero" class="demo-hero">
      <h1 data-hero>{{ t('animation.heroTitle') }}</h1>
      <p data-hero>{{ t('animation.heroDesc') }}</p>
    </section>

    <!-- ② 逐字入场：滚动到位后文字一个字一个字浮现 -->
    <section ref="split" class="demo-split">
      <h2>{{ t('animation.splitTitle') }}</h2>
      <p class="split-line" data-split>{{ t('animation.splitText') }}</p>
    </section>

    <!-- ③ 分层视差：背景动得多，前景动得少 -->
    <section ref="parallax" class="demo-parallax">
      <h2>{{ t('animation.parallaxTitle') }}</h2>
      <div class="parallax-stage">
        <div class="parallax-bg" data-parallax="120" aria-hidden="true" />
        <p class="parallax-fg" data-parallax="36">{{ t('animation.parallaxDesc') }}</p>
      </div>
    </section>

    <!-- ④ 钉住叙事：这一节钉在视口不动，滚动时三步依次切换 -->
    <section ref="pinned" class="demo-pin">
      <h2>{{ t('animation.pinTitle') }}</h2>
      <div class="pin-stage">
        <p class="pin-step" data-step>{{ t('animation.pinStep1') }}</p>
        <p class="pin-step" data-step>{{ t('animation.pinStep2') }}</p>
        <p class="pin-step" data-step>{{ t('animation.pinStep3') }}</p>
      </div>
    </section>

    <!-- ⑤ basic 层的第二个播放器：进视口播、出视口停 -->
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

/* ③ 视差舞台：overflow hidden 把移出边界的层裁掉 */
.parallax-stage { position: relative; height: 60vh; overflow: hidden; border-radius: 8px; }
.parallax-bg { position: absolute; inset: -25% 0; background: radial-gradient(circle at 50% 60%, var(--primary) 0%, transparent 65%); opacity: 0.35; }
.parallax-fg { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 600; }

/* ④ 钉住舞台：三步怎么叠着放是 CSS 的事，什么时机切换哪个由门面管 */
.pin-stage { position: relative; height: 40vh; }
.pin-step { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 600; }

.demo-video-player { max-width: 480px; border-radius: 8px; }
</style>
