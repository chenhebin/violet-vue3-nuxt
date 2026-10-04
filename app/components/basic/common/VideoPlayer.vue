<script setup lang="ts">
/**
 * 视频播放器（basic 业务无感层）：原生 video 元素 + 视口播停，与 LottiePlayer 同范式
 * （业务无感、动态资产、看不见不渲染帧）——basic 层"每类资产一个播放器"的第二个实例。
 * - muted 默认开：浏览器自动播放策略只放行静音视频，非静音需用户手势（UI 层加开关另立项）
 * - play() 的 catch 为预期路径：自动播放策略拒绝时静默（视频停在首帧，不算错误）
 * - 契约：src/loop/muted/poster 仅挂载期生效，运行期变更需调用方以 :key 重挂载
 */
const props = withDefaults(
  defineProps<{ src: string; loop?: boolean; muted?: boolean; poster?: string }>(),
  { loop: true, muted: true }
)

const video = ref<HTMLVideoElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const el = video.value
  if (!el) return

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      if (entry.isIntersecting) el.play().catch(() => {})
      else el.pause()
    },
    { threshold: 0.4 }
  )
  observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  video.value?.pause()
})
</script>

<template>
  <video ref="video" class="basic-video" :src="props.src" :loop="props.loop" :muted="props.muted" :poster="props.poster" playsinline preload="metadata" />
</template>

<style scoped>
.basic-video { display: block; width: 100%; height: auto; }
</style>
