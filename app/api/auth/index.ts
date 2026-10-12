/**
 * auth 域门面（对外唯一入口）——外面只许 import '~/api/auth'（本文件），别伸进域内文件。
 *
 * 域格子规矩（项目变大也照这个来）：
 * - 新业务域一律开目录：api/<domain>/{index,contracts,errors,endpoints}.ts
 * - 域内文件随便组织，但对外出口只从本门面 re-export
 * - 类型放哪遵守三级归属（写在 shared/types/api.ts 头部）：
 *   域私有 → contracts.ts；app 分层抽象 → services/types.ts；跨端或 ≥3 个域用 → shared/types/
 *
 * ⚠️ demo 债务：MockScene 是登录/会话演示用的异常模拟开关，已收口在传输层——URL query（?scene=）驱动，
 * 组合根 plugins/api.ts 统一注入，业务签名不带 scene；白名单登记处在 `app/constants/mock.ts`。
 * 接真实后端时整体拔掉，共 5 处：constants/mock.ts 登记处、plugins/api.ts 注入点、server 的 scene 分支
 * （login.post.ts / me.get.ts）、LoginPage 下拉、MePage 过期链接。
 */
export * from './contracts'
export * from './errors'
export * from './endpoints'
