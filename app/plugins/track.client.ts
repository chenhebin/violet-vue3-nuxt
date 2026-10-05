/**
 * 埋点的组合根（只在客户端跑）：负责加载 Umami 脚本；PV（页面浏览）全靠脚本自己采集。
 * - v3 的 tracker 自带首屏 + SPA 的 PV 采集（挂钩 pushState/popstate，300ms 去抖），
 *   手动在 afterEach 里无参调 track() 只会拿到脚本加载那一刻的旧 URL——实测过，所以不用
 * - 脚本选项（websiteId/hostUrl/beforeSend 剥掉 query）统一放 useUmamiScript 工厂里
 * - 没配 websiteId 时整个埋点栈保持静默（脚本不加载）；dev 指向本地栈是有意的，数据环境就如此
 */
export default defineNuxtPlugin(() => {
  useUmamiScript()
})
