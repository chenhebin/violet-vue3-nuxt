/**
 * hello 域门面（对外唯一入口）——外面只许 import '~/api/hello'（本文件），别伸进域内文件。
 * 域格子规矩和类型三级归属：见 api/auth/index.ts（那里是范式首例）。
 * 载荷契约已提升 shared/types/hello.ts（server 共用，两端免 import），无域私有契约故无 contracts.ts；
 * hello 只是示例接口、没有业务错误码，所以也没有 errors.ts——接真后端出码了再补。
 */
export * from './endpoints'
