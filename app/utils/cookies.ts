/**
 * cookie 语法层纯函数：解析（server 读 requestHeaders.cookie 与 client 读 document.cookie 同语法）与
 * 客户端写串。键名一律取 COOKIE_KEYS 登记册；值的编码/白名单校验归各域 codec（如 utils/userTheme.ts）。
 */

/** 从 cookie 原文取指定键的原始值（不解码、不校验；不存在返回 null） */
export function parseCookie(raw: string | null | undefined, name: string): string | null {
  if (!raw) return null
  return raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))?.[1] ?? null
}

/** 拼客户端写串（path 固定 /；maxAge 秒，0 即清除——配合空值） */
export function buildCookie(name: string, value: string, options: { maxAge: number }): string {
  return `${name}=${value}; path=/; max-age=${options.maxAge}`
}
