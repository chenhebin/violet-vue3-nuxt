/**
 * hello 域门面（对外唯一入口）——外面只许 import '~/api/hello'（本文件），别伸进域内文件。
 * 域格子规矩和类型三级归属：见 api/auth/index.ts（那里是范式首例）。
 * hello 只是示例接口、没有业务错误码，所以没有 errors.ts；接真后端出码了再补。
 */
export * from './contracts'
export * from './endpoints'
