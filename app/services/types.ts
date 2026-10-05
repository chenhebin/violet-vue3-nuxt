/**
 * 跨域共享的端口（services 层公共抽象）：所有域的 service 都要用的注入契约放这里。
 * 域私有契约（只有一个域用，比如 auth 的 TokenStorage）放各域格子 services/<domain>/contracts.ts。
 * 放哪的判定遵守三级归属规则（写在 shared/types/api.ts 头部）。
 */

/**
 * 传输客户端抽象：领域层只依赖这个契约，不依赖 useApi 的实现（这就是依赖倒置的锚点）。
 * 形态锚定为全局 $fetch 实例（Nuxt 对 ofetch 做的类型实例化），
 * 测试时随便塞一个满足调用签名的桩就能换掉。
 */
export type ApiClient = typeof $fetch
