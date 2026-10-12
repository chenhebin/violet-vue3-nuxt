/**
 * mock 演示场景登记（demo 债务）：登录/会话演示用的异常模拟开关白名单。
 * scene 经 URL query（?scene=）由传输层（plugins/api.ts）统一注入，业务签名不带它；
 * 接真实后端时本文件连同注入点/下拉/演示链接整体拔除（清单见 docs/conventions/data-and-errors.md）。
 */
export const MOCK_SCENES = ['http500', 'timeout', 'expired'] as const

// mock 演示开关：'' 或 MOCK_SCENES 之一
export type MockScene = '' | (typeof MOCK_SCENES)[number]
