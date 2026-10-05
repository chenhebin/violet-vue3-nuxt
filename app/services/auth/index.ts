/**
 * auth 域（services 侧）门面（对外唯一入口）——外面只许 import '~/services/auth'（本文件），别伸进域内文件。
 * 域格子规矩和 api/<domain>/ 一样：一域一格，index + service + contracts 三件套，
 * 新业务域照这个开户；域和域之间不许横向 import，要协作就经组合根（plugins/<domain>.ts）注入。
 */
export * from './contracts'
export * from './auth.service'
