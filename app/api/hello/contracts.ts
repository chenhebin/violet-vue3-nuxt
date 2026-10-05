/**
 * hello 域契约：示例问候接口的返回形态
 */

// 问候语 + 设备回显（回显的是请求头 x-v-device）
export interface HelloResult {
  message: string
  device: string
}
