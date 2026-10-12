<script setup lang="ts">
import type { AnimationItem } from 'lottie-web'
import { observePlayPause } from './observePlayPause'

/**
 * Lottie 播放器（basic 层，业务无感）：文案和数据全走 props，不依赖任何业务代码或 composable。
 * - 播放器是动态 import 进来的 light 构建（体积小一半，不含表达式求值——设计侧导出时别用表达式就行；
 *   以后要完整版，把 import 换成全量 'lottie-web' 一行搞定）。滚出视口就暂停，看不见就不浪费帧
 * - prefers-reduced-motion 命中时不挂播停观察器：动画停在首帧、静态可见（降级判定经
 *   utils/motion 的 prefersReducedMotion()，查询串单点）
 * - src 二选一：传 URL（path）或传 animationData 对象，内联打包还是网络加载由调用方自己定；
 *   传对象时会先深拷贝一份——lottie-web 会就地改写传进去的对象（比如打上 __complete 这类规整标志），
 *   不克隆的话这些改动会漏回调用方的模块级常量里
 * - 契约：src/loop/speed 只在挂载那一刻生效，运行期想换值，调用方得用 :key 让它重新挂载
 */
const props = withDefaults(defineProps<{ src: string | object; loop?: boolean; speed?: number }>(), {
  loop: true,
  speed: 1
})

const container = ref<HTMLElement | null>(null)
let player: AnimationItem | null = null
let stopObserve: (() => void) | undefined
let disposed = false

onMounted(async () => {
  const el = container.value
  if (!el) return

  // lottie_light 是老式 CommonJS 打包，import 出来的东西挂在 default 上，所以这里解构 default
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

  // prefers-reduced-motion 降级：不挂观察器（autoplay 本便是 false），动画停在首帧静态可见
  if (prefersReducedMotion()) return

  stopObserve = observePlayPause(el, () => item.play(), () => item.pause())
})

onBeforeUnmount(() => {
  disposed = true
  stopObserve?.()
  player?.destroy()
  player = null
})
</script>

<template>
  <div ref="container" />
</template>
