<script setup lang="ts">
import PcErrorPage from '~/views/pc/ErrorPage.vue'
import MErrorPage from '~/views/m/ErrorPage.vue'
import type { NuxtError } from '#app'

/**
 * 全局错误页的薄壳（404/500 等）：用和 pages/ 一样的双模板分发姿势（按设备挑 pc/m 模板）。
 * 错误页仍走完整的 app 和插件链，但设备判定必须在这里重算一遍：
 * - nitro 层的错误（404 等）是经内部 /__nuxt_error 这个虚拟地址渲染的——useRequestURL()
 *   拿到的是虚拟地址，用户真正访问的地址藏在它的 ?url= 参数里（NuxtError.url 同源）；
 *   device.server 插件读不到 device 查询覆盖，useState 里退化为 cookie/UA 的结论
 * - app 内部的 SSR 错误（渲染时抛的错）时请求地址本来就是原始 URL，但为了让两条路统一，
 *   这里基于同一个 URL 来源重算——SSR/客户端两侧取同一个地址，避免 pc/m 整棵树水合
 *   （hydration）时对不上
 * 判定算法和 device.server 是同一份（utils/device.ts 的 resolveDevice），这层只多管输入收集。
 */
const props = defineProps<{ error: NuxtError }>()

const reqUrl = useRequestURL()
const rawUrl = import.meta.server
  ? reqUrl.pathname.startsWith('/__nuxt_error')
    ? reqUrl.searchParams.get('url') ?? props.error.url ?? ''
    : props.error.url ?? reqUrl.href
  : window.location.href
const query = rawUrl ? new URL(rawUrl, 'http://n').searchParams.get('device') : null
const device = resolveDevice({
  queryDevice: query,
  cookieDevice: useCookie<Device | undefined>(COOKIE_KEYS.device).value,
  userAgent: import.meta.server ? useRequestHeaders(['user-agent'])['user-agent'] ?? '' : navigator.userAgent
})
</script>

<template>
  <component :is="device === 'm' ? MErrorPage : PcErrorPage" :error="props.error" />
</template>
