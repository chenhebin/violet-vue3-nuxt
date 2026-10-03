/**
 * auth 域（services 侧）门面 —— 外部只允许 import '~/services/auth'（本文件），域内文件免进。
 * 域格子约定与 api/<domain>/ 同构：一域一格，index + service + contracts 三件套，
 * 新业务域照此开户；域间禁止横向 import，协作一律经组合根（plugins/<domain>.ts）注入。
 */
export * from './contracts'
export * from './auth.service'
