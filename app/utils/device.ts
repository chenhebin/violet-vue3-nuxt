/**
 * 设备判定只写这一份：先看 URL 里的 device 参数，再看 cookie，最后看 UA（是不是手机浏览器）。
 * 有两个地方会用到：plugins/device.server.ts（正常页面，判定完写进全局状态）和 app/error.vue
 * （错误页，它拿到的 URL 比较特殊，见它自己的头注）。这两个调用方只负责把原料凑齐传进来，
 * 判定规则永远从这拿，谁也不许再抄一份。
 */

/** 手机浏览器的 UA 特征。跟判定逻辑一起改一起删，不单独导出 */
const MOBILE_RE = /(android|iphone|ipod|ipad|windows phone|mobile|webos|blackberry|opera mini)/i

/**
 * 按三优先级判定设备。cookie 传原始字符串就行，值不是 pc/m 就当没有 cookie
 * @param input.queryDevice URL 里 device 参数的原始值（'pc' | 'm' | null）
 * @param input.cookieDevice cookie 里的设备原始值
 * @param input.userAgent 请求的 UA，空串按桌面处理
 */
export function resolveDevice(input: { queryDevice: string | null; cookieDevice: string | null | undefined; userAgent: string }): Device {
  if (input.queryDevice === 'pc' || input.queryDevice === 'm') return input.queryDevice
  if (input.cookieDevice === 'pc' || input.cookieDevice === 'm') return input.cookieDevice
  return MOBILE_RE.test(input.userAgent) ? 'm' : 'pc'
}
