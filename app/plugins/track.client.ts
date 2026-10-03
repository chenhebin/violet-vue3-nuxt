/**
 * 埋点组合根（仅客户端）：加载 Umami 脚本；PV 全交由脚本原生采集。
 * - v3 tracker 自带首屏 + SPA（pushState/popstate 挂钩，300ms 去抖）PV，
 *   手动 afterEach 无参 track() 只会拿到脚本加载时的旧 URL——实测后弃用
 * - 脚本选项（websiteId/hostUrl/beforeSend 剥 query）统一在 useUmamiScript 工厂
 * - 未配置 websiteId 时整栈静默（脚本不加载）；dev 指向本地栈属预期数据环境
 */
export default defineNuxtPlugin(() => {
  useUmamiScript()
})
