/**
 * auth 域契约：登录/会话的载荷与返回形态
 */

// 登录/会话的载荷
export interface LoginPayload {
  username: string
  password: string
}

// 登录/会话的用户形态
export interface AuthUser {
  id: number
  username: string
  nickname: string
}

// 登录/会话的返回形态
export interface LoginResult {
  token: string
  user: AuthUser
}

// auth 域业务错误码联合：mock 新增分支时在此扩展，并在 errors.ts 补文案
export type AuthErrorCode = 1001

// mock 演示开关：'' | 'http500' | 'timeout' | 'expired'，仅登录 demo 使用
export type MockScene = '' | 'http500' | 'timeout' | 'expired'
