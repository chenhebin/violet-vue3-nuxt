import type { $Fetch } from 'ofetch'

/**
 * 跨域共享的端口（services 层公共抽象）：所有域的 service 都要用的注入契约放这里。
 * 域私有契约（只有一个域用，比如 auth 的 TokenStorage）放各域格子 services/<domain>/contracts.ts。
 * 放哪的判定遵守三级归属规则（写在 shared/types/api.ts 头部）。
 */

/**
 * 传输客户端抽象：领域层只依赖这个契约，不依赖 useApi 的实现（这就是依赖倒置的锚点）。
 * 形态锚定为 ofetch 的 $Fetch（useApi 的 createGatewayClient 工厂产出的就是这个形状；
 * Nuxt 全局 $fetch 也满足它——原锚点 typeof $fetch 与工厂返回的路由泛型化全局类型不兼容），测试时随便塞一个满足调用签名的桩就能换掉。
 * 顶部是 type-only import（无运行时耦合），不违反 architecture.md 军规 8 的供应商隔离意图：
 * 换传输供应商只动 useApi 工厂与这一行类型锚点，域 service 零感知。
 */
export type ApiClient = $Fetch
