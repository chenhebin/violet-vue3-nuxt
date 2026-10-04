/**
 * hello 域契约：示例问候接口的返回形态
 */

// 问候与设备回显（echo 请求头 x-v-device）
export interface HelloResult {
  message: string
  device: string
}
