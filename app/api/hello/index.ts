/**
 * hello 域门面 —— 外部只允许 import '~/api/hello'（本文件），域内文件免进。
 * 域格子约定与类型落位三级归属：见 api/auth/index.ts（范式首例）。
 * hello 为纯示例接口、无业务错误码，故无 errors.ts；接真后端出码再补。
 */
export * from './contracts'
export * from './endpoints'
