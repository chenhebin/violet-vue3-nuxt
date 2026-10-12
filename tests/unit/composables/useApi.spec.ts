// Ticket: .scratch/fix-c2-c5/issues/02-contract-single-point.md
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { ApiError } from '~/api/error'
import { createGatewayClient, type GatewayClientOptions } from '~/composables/useApi'

/**
 * 传输层纯工厂的桩注入单测（不依赖 Nuxt 环境）：fetch 用本地闭包桩按脚本回放，
 * 录下 (input, init) 断言请求头与 query 注入；信封拆装与四 kind 归一是断言主体。
 */

interface FetchScript {
  status: number
  body?: unknown
  reject?: Error
}

interface RecordedCall {
  url: string
  headers: Headers | undefined
}

/** 可编程 fetch 桩：记录每次调用的 URL 与 headers，按脚本返回 Response 或 reject */
function fakeFetch(script: FetchScript) {
  const calls: RecordedCall[] = []
  const fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(input),
      headers: init?.headers === undefined ? undefined : new Headers(init.headers)
    })
    if (script.reject) return Promise.reject(script.reject)
    if (script.body === undefined) return new Response(null, { status: script.status })
    return new Response(JSON.stringify(script.body), {
      status: script.status,
      headers: { 'content-type': 'application/json' }
    })
  }) as unknown as typeof globalThis.fetch
  return { fetch, calls }
}

/** 造客户端 + 桩：defaults 全注入（device/locale/token/scene），覆盖项经 overrides 传 */
function makeClient(script: FetchScript, overrides: Partial<GatewayClientOptions> = {}) {
  const { fetch, calls } = fakeFetch(script)
  const client = createGatewayClient({
    baseURL: 'http://gate.test',
    device: ref('pc'),
    locale: ref('zh-CN'),
    token: ref('tk'),
    scene: ref(''),
    fetch,
    ...overrides
  })
  return { client, calls }
}

describe('传输层网关客户端（createGatewayClient，fetch 桩注入）', () => {
  it('Given 200 信封 code=0，When 请求，Then resolve 值为 data 字段（拆信封）', async () => {
    const { client } = makeClient({ status: 200, body: { code: 0, message: 'ok', data: { answer: 42 } } })

    await expect(client('/hello')).resolves.toEqual({ answer: 42 })
  })

  it('Given 200 信封 code≠0，When 请求，Then reject ApiError 且 kind business、code/traceId 透传', async () => {
    const { client } = makeClient({ status: 200, body: { code: 1001, message: 'mismatch', traceId: 'trace-1001', data: null } })

    const err = await client('/auth/login', { method: 'POST' }).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ kind: 'business', code: 1001, traceId: 'trace-1001' })
  })

  it('Given 401 + 信封体，When 请求，Then reject ApiError 且 kind auth、code 401', async () => {
    const { client } = makeClient({ status: 401, body: { code: 401, message: 'token invalid or expired', traceId: 'trace-401', data: null } })

    const err = await client('/auth/me').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ kind: 'auth', code: 401 })
  })

  it('Given 500 非信封体，When 请求，Then reject ApiError 且 kind http、code 500', async () => {
    const { client } = makeClient({ status: 500 })

    const err = await client('/hello').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ kind: 'http', code: 500 })
  })

  it('Given fetch 网络层 reject，When 请求，Then reject ApiError 且 kind network、code 0', async () => {
    const { client } = makeClient({ status: 0, reject: new TypeError('boom') })

    const err = await client('/auth/login', { method: 'POST' }).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ kind: 'network', code: 0 })
    expect((err as ApiError).message).toContain('boom')
  })

  it('Given device/locale/token Ref，When 请求发出，Then 请求头带上 x-v-device、accept-language、authorization', async () => {
    const { client, calls } = makeClient({ status: 200, body: { code: 0, message: 'ok', data: null } })

    await client('/hello')

    const headers = calls[0]?.headers
    expect(headers?.get('x-v-device')).toBe('pc')
    expect(headers?.get('accept-language')).toBe('zh-CN')
    expect(headers?.get('authorization')).toBe('Bearer tk')
  })

  it('Given scene Ref 非空，When 请求带既有 query，Then URL 追加 scene 且不覆盖既有 query', async () => {
    const { client, calls } = makeClient(
      { status: 200, body: { code: 0, message: 'ok', data: null } },
      { scene: ref('expired') }
    )

    await client('/hello', { query: { a: '1' } })

    const url = new URL(calls[0]!.url)
    expect(url.searchParams.get('scene')).toBe('expired')
    expect(url.searchParams.get('a')).toBe('1')
  })
})
