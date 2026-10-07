// Ticket: .scratch/login-pilot/issues/01-unit-auth-service.md
import { describe, expect, it } from 'vitest'
import { ApiError } from '~/api/error'
import { createAuthService } from '~/services/auth'
import { fakeApiClient } from '../../../helpers/fakeApiClient'
import { fakeTokenStorage } from '../../../helpers/fakeTokenStorage'

const USER = { id: 1, username: 'violet', nickname: '紫罗兰' }

describe('auth 领域服务（createAuthService，桩注入）', () => {
  it('Given 登录接口成功返回 token 与 user，When login，Then token 写入存储且返回 user', async () => {
    const tokens = fakeTokenStorage()
    const auth = createAuthService(
      fakeApiClient([{ match: '/auth/login', resolve: { token: 'v-mock-token-violet', user: USER } }]),
      tokens
    )

    const user = await auth.login({ username: 'violet', password: '123456' })

    expect(user).toEqual(USER)
    expect(tokens.value()).toBe('v-mock-token-violet')
  })

  it('Given 登录接口抛 ApiError，When login，Then 不写 token 且异常原样上抛', async () => {
    const tokens = fakeTokenStorage('旧token不该被动')
    const auth = createAuthService(
      fakeApiClient([{ match: '/auth/login', reject: new ApiError('business', 1001, 'mismatch') }]),
      tokens
    )

    await expect(auth.login({ username: 'violet', password: 'wrong' })).rejects.toBeInstanceOf(ApiError)
    expect(tokens.calls).not.toContain('write')
    expect(tokens.value()).toBe('旧token不该被动')
  })

  it('Given 登出接口抛错，When logout，Then 本地凭据仍被清且异常上抛（吞异常是上层 toOutcome 的活）', async () => {
    const tokens = fakeTokenStorage('v-mock-token-violet')
    const auth = createAuthService(
      fakeApiClient([{ match: '/auth/logout', reject: new Error('mock logout boom') }]),
      tokens
    )

    await expect(auth.logout()).rejects.toThrow('mock logout boom')
    expect(tokens.value()).toBeNull()
  })

  it('Given 登出接口成功，When logout，Then 清一次凭据', async () => {
    const tokens = fakeTokenStorage('v-mock-token-violet')
    const auth = createAuthService(fakeApiClient([{ match: '/auth/logout', resolve: null }]), tokens)

    await auth.logout()

    expect(tokens.value()).toBeNull()
    expect(tokens.calls.filter(call => call === 'clear')).toHaveLength(1)
  })

  it('Given 存储有 token / 无 token，When isAuthenticated，Then 分别返回 true / false', () => {
    const authWithToken = createAuthService(fakeApiClient([]), fakeTokenStorage('v-mock-token-violet'))
    const authWithoutToken = createAuthService(fakeApiClient([]), fakeTokenStorage(null))

    expect(authWithToken.isAuthenticated()).toBe(true)
    expect(authWithoutToken.isAuthenticated()).toBe(false)
  })

  it('Given fetchMe 抛 ApiError(auth)，When fetchMe，Then 先清凭据再原样上抛', async () => {
    const tokens = fakeTokenStorage('v-mock-token-violet')
    const auth = createAuthService(
      fakeApiClient([{ match: '/auth/me', reject: new ApiError('auth', 401, 'token expired') }]),
      tokens
    )

    await expect(auth.fetchMe()).rejects.toMatchObject({ kind: 'auth', code: 401 })
    expect(tokens.value()).toBeNull()
  })

  it('Given fetchMe 抛非 auth 类 ApiError，When fetchMe，Then 不清凭据且上抛', async () => {
    const tokens = fakeTokenStorage('v-mock-token-violet')
    const auth = createAuthService(
      fakeApiClient([{ match: '/auth/me', reject: new ApiError('http', 500, 'server error') }]),
      tokens
    )

    await expect(auth.fetchMe()).rejects.toMatchObject({ kind: 'http', code: 500 })
    expect(tokens.value()).toBe('v-mock-token-violet')
  })
})
