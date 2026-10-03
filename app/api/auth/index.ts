/**
 * auth 域门面 —— 外部只允许 import '~/api/auth'（本文件），域内文件免进。
 *
 * 域格子约定（规模化时遵守）：
 * - 新业务域一律目录形态进场：api/<domain>/{index,contracts,errors,endpoints}.ts
 * - 域内多文件自由组织，但对外出口只经本门面 re-export
 * - 类型落位遵守三级归属（见 shared/types/api.ts 头部）：
 *   域私有 → contracts.ts；app 分层抽象 → services/types.ts；跨端/≥3 域 → shared/types/
 *
 * ⚠️ demo 债务：MockScene 是登录演示的异常模拟开关，已渗入 service 签名。
 * 接真实后端时必须整体移除（含 service/composable/视图透传与 mock 接口的 scene 分支）。
 */
export * from './contracts'
export * from './errors'
export * from './endpoints'
