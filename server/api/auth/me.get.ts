/** mock 会话接口：校验 Bearer token；scene=expired 强制 401 演示会话过期 */
export default defineEventHandler((event) => {
  const scene = String(getQuery(event).scene ?? '')
  const authorization = getHeader(event, 'authorization') ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  if (scene === 'expired' || !token.startsWith('v-mock-token-')) {
    throw createError({ statusCode: 401, statusMessage: 'token invalid or expired' })
  }

  return apiOk({ id: 1, username: token.replace('v-mock-token-', ''), nickname: '紫罗兰' })
})
