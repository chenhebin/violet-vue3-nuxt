/** 凭据怎么存怎么取的契约（auth 域私有端口）：具体实现（cookie 或测试桩）由组合根注入 */
export interface TokenStorage {
  read(): string | null
  write(token: string): void
  clear(): void
}
