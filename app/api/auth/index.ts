/**
 * auth 域门面（对外唯一入口）——外面只许 import '~/api/auth'（本文件），别伸进域内文件。
 *
 * 域格子规矩（项目变大也照这个来）：
 * - 新业务域一律开目录：api/<domain>/{index,contracts,errors,endpoints}.ts
 * - 域内文件随便组织，但对外出口只从本门面 re-export
 * - 类型放哪遵守三级归属（写在 shared/types/api.ts 头部）：
 *   域私有 → contracts.ts；app 分层抽象 → services/types.ts；跨端或 ≥3 个域用 → shared/types/
 *
 * ⚠️ demo 债务：MockScene 是登录演示用的异常模拟开关，已经渗进了 service 签名。
 * 接真实后端时要整体拔掉（连同 service/composable/视图的透传，以及 mock 接口里的 scene 分支）。
 */
export * from './contracts'
export * from './errors'
export * from './endpoints'
