/**
 * 传输客户端抽象：领域层只依赖此契约，不依赖 useApi 实现（依赖倒置锚点）。
 * 锚定为全局 $fetch 实例形态（Nuxt 对 ofetch 的类型实例化），
 * 测试时可用任意满足调用签名的桩替换。
 */
export type ApiClient = typeof $fetch

/** 凭据存取抽象：具体实现（cookie / 测试桩）由组合根注入 */
export interface TokenStorage {
  read(): string | null
  write(token: string): void
  clear(): void
}
