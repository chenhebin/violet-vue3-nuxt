<script setup lang="ts">
import PcErrorPage from '~/views/pc/ErrorPage.vue'
import MErrorPage from '~/views/m/ErrorPage.vue'
import type { NuxtError } from '#app'

/**
 * 全局错误页薄壳（404/500 等）：双模板分发的同款姿势（对照 pages/）。
 * 错误渲染仍走完整 app 与插件链，但设备判定必须在此重算：
 * - nitro 级错误（404 等）经内部 /__nuxt_error 虚拟地址渲染——useRequestURL() 拿到的是
 *   虚拟地址，原始地址嵌在其 ?url= 参数（NuxtError.url 同源）；device.server 插件
 *   读不到 device 查询覆盖，useState 退化为 cookie/UA 结论
 * - app 内部 SSR 错误（渲染期抛错）时请求地址就是原始 URL，但为两分支统一，
 *   在此基于同一 URL 源重算——SSR/客户端两侧取同一地址，避免 pc/m 整树 hydration mismatch
 * 判定算法与 device.server 同源（utils/device.ts 的 resolveDevice），本层只多管输入采集。
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
