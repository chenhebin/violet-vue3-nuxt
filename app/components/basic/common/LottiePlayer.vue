<script setup lang="ts">
import type { AnimationItem } from 'lottie-web'

/**
 * Lottie 播放器（basic 业务无感层）：文案与数据全经 props，无任何业务/composable 依赖。
 * - 播放器动态 import light 构建（体积约半、无表达式求值——设计侧导出时禁用表达式即可；
 *   需要时换全量 'lottie-web' 一行切换），滚出视口即暂停，C 端看不见不渲染帧
 * - src 为 URL（path）或 animationData 对象二选一，由调用方决定打包内联还是网络加载；
 *   对象 src 会先深拷贝——lottie-web 会就地改写传入对象（__complete 等规整标志），
 *   不克隆会把副作用泄漏回调用方的模块级常量
 * - 契约：src/loop/speed 仅挂载期生效，运行期变更需调用方以 :key 重挂载
 */
const props = withDefaults(defineProps<{ src: string | object; loop?: boolean; speed?: number }>(), {
  loop: true,
  speed: 1
})

const container = ref<HTMLElement | null>(null)
let player: AnimationItem | null = null
let observer: IntersectionObserver | null = null
let disposed = false

onMounted(async () => {
  const el = container.value
  if (!el) return

  // lottie_light 为 CJS 构建，具名经 Vite 互操作走 default
  const { default: lottie } = await import('lottie-web/build/player/lottie_light')
  if (disposed) return

  const item = lottie.loadAnimation({
    container: el,
    renderer: 'svg',
    loop: props.loop,
    autoplay: false,
    animationData: typeof props.src === 'object' ? structuredClone(props.src) : undefined,
    path: typeof props.src === 'string' ? props.src : undefined
  })
  player = item
  item.setSpeed(props.speed)

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      if (entry.isIntersecting) item.play()
      else item.pause()
    },
    { threshold: 0.4 }
  )
  observer.observe(el)
})

onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  player?.destroy()
  player = null
})
</script>

<template>
  <div ref="container" />
</template>
