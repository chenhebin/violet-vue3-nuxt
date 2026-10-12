<script setup lang="ts">
import { observePlayPause } from './observePlayPause'
/**
 * 视频播放器（basic 层，业务无感）：原生 video 元素加视口播停，跟 LottiePlayer 一个套路
 * （业务无感、资产动态来、看不见就不渲染帧）——basic 层"一种资产一个播放器"的第二个实例。
 * - muted 默认开：浏览器自动播放策略只放行静音视频，想出声得用户先点一下（要不要 UI 开关另开话题）
 * - play() 的 catch 是预期路径：自动播放被策略拒掉时直接忽略（视频停在首帧，这不算错）
 * - prefers-reduced-motion 命中时不建播停观察器：靠 preload="metadata"（+ poster）停在首帧
 *   （降级判定经 utils/motion 的 prefersReducedMotion()，查询串单点）
 * - 契约：src/loop/muted/poster 只在挂载那一刻生效，运行期想换值，调用方得用 :key 让它重新挂载
 */
const props = withDefaults(
  defineProps<{ src: string; loop?: boolean; muted?: boolean; poster?: string }>(),
  { loop: true, muted: true }
)

const video = ref<HTMLVideoElement | null>(null)
let stopObserve: (() => void) | undefined

onMounted(() => {
  const el = video.value
  if (!el) return

  // prefers-reduced-motion 降级：不建播停观察器，视频靠 preload="metadata"（+ poster）停在首帧
  if (prefersReducedMotion()) return
  stopObserve = observePlayPause(el, () => el.play().catch(() => {}), () => el.pause())
})

onBeforeUnmount(() => {
  stopObserve?.()
  video.value?.pause()
})
</script>

<template>
  <video ref="video" class="basic-video" :src="props.src" :loop="props.loop" :muted="props.muted" :poster="props.poster" playsinline preload="metadata" />
</template>

<style scoped>
.basic-video { display: block; width: 100%; height: auto; }
</style>
