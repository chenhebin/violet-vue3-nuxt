<script setup lang="ts">
/**
 * 视频播放器（basic 层，业务无感）：原生 video 元素加视口播停，跟 LottiePlayer 一个套路
 * （业务无感、资产动态来、看不见就不渲染帧）——basic 层"一种资产一个播放器"的第二个实例。
 * - muted 默认开：浏览器自动播放策略只放行静音视频，想出声得用户先点一下（要不要 UI 开关另开话题）
 * - play() 的 catch 是预期路径：自动播放被策略拒掉时直接忽略（视频停在首帧，这不算错）
 * - 契约：src/loop/muted/poster 只在挂载那一刻生效，运行期想换值，调用方得用 :key 让它重新挂载
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
