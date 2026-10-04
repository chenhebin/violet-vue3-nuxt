/**
 * 设备判定唯一实现：三优先（query > cookie > UA）。
 * 调用方两处——plugins/device.server.ts（组合根，写 useState）与 app/error.vue
 * （错误渲染路径，输入源特殊见其头注）——只共用本判定，各自负责输入采集。
 * 输入源不同是两处调用方存在的唯一理由，判定算法永不双写。
 */

// 移动端 UA 特征（与判定同源同寿命，不单独导出） 
const MOBILE_RE = /(android|iphone|ipod|ipad|windows phone|mobile|webos|blackberry|opera mini)/i

/**
 * 三优先设备判定（cookie 输入收原始串，非法值按无 cookie 处理）
 * @param input.queryDevice URL 查询参数 device 的原始值（'pc'|'m'|null）
 * @param input.cookieDevice cookie 中的设备原始值
 * @param input.userAgent 请求 UA（空串按桌面处理）
 */
export function resolveDevice(input: { queryDevice: string | null; cookieDevice: string | null | undefined; userAgent: string }): Device {
  if (input.queryDevice === 'pc' || input.queryDevice === 'm') return input.queryDevice
  if (input.cookieDevice === 'pc' || input.cookieDevice === 'm') return input.cookieDevice
  return MOBILE_RE.test(input.userAgent) ? 'm' : 'pc'
}
