/**
 * auth 域契约：登录/会话的入参和返回长什么样
 */

// 登录/会话的入参
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

// auth 域业务错误码联合。mock 加新分支就在这扩展，同时去 errors.ts 补文案
export type AuthErrorCode = 1001

// mock 演示开关：'' | 'http500' | 'timeout' | 'expired'，只有登录 demo 在用
export type MockScene = '' | 'http500' | 'timeout' | 'expired'
