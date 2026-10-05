const DEMO_CREDENTIALS = { username: 'violet', password: '123456' }

/**
 * mock 登录接口。scene 开关用来演示各条异常路径：
 * - timeout: 吊 30s，让客户端 10s 的超时先到 → network 类错误
 * - http500: 直接抛 5xx → http 类错误
 * - 密码错：返回 200 + code 1001 → business 类错误（字段级展示）
 */
export default defineEventHandler(async (event) => {
  const scene = String(getQuery(event).scene ?? '')

  if (scene === 'timeout') {
    const { promise, resolve } = Promise.withResolvers<undefined>()
    setTimeout(resolve, 30_000)
    await promise
  }
  if (scene === 'http500') {
    throw createError({ statusCode: 500, statusMessage: 'mock internal error' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  const username = typeof body?.username === 'string' ? body.username : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (username !== DEMO_CREDENTIALS.username || password !== DEMO_CREDENTIALS.password) {
    return apiFail(1001, 'username or password mismatch')
  }

  return apiOk({
    token: `v-mock-token-${username}`,
    user: { id: 1, username, nickname: '紫罗兰' }
  })
})
