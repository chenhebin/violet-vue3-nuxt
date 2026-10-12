/**
 * hello 载荷契约（app 和 server 共用）。
 * 登记使用者（提升记账，规则见 shared/types/api.ts 头部）：
 * - app/api/hello（endpoints 的返回类型）
 * - server/api/hello.get.ts（apiOk<HelloResult> 泛型标注，防两端漂移）
 * 提升自域私有 contracts：server mock handler 要造同形态载荷，双端各写一份没有编译期校验会漂移，
 * 收到这里让 typecheck 兜底。类型经 Nuxt shared 机制两端免 import。
 */

// 问候语 + 设备回显（回显的是请求头 x-v-device）
export interface HelloResult {
  message: string
  device: string
}
