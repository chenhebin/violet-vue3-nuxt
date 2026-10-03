/**
 * 跨域共享端口（services 层公共抽象）：所有域的 service 都消费的注入契约住这里。
 * 域私有契约（仅一个域消费，如 auth 的 TokenStorage）住各域格子 services/<domain>/contracts.ts，
 * 落位判定遵守三级归属规则（见 shared/types/api.ts 头部）。
 */

/**
 * 传输客户端抽象：领域层只依赖此契约，不依赖 useApi 实现（依赖倒置锚点）。
 * 锚定为全局 $fetch 实例形态（Nuxt 对 ofetch 的类型实例化），
 * 测试时可用任意满足调用签名的桩替换。
 */
export type ApiClient = typeof $fetch
