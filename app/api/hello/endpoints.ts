import type { ApiClient } from '~/services/types'
import type { HelloResult } from './contracts'

/**
 * hello 域接口：只声明契约（URL/方法/类型），没有任何逻辑；client 由组合根造好传进来
 */

/**
 * 示例问候（回显请求头 x-v-device）
 * @param client 网关客户端
 * @returns 问候语和设备回显
 */
export function getHello(client: ApiClient) {
  return client<HelloResult>('/hello')
}
