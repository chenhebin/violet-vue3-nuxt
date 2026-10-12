/**
 * mock 会话接口：校验 Bearer token；scene=expired 时强制 401，演示会话过期
 * @param event 请求事件对象
 */
export default defineEventHandler((event) => {
  const scene = String(getQuery(event).scene ?? '')
  const authorization = getHeader(event, 'authorization') ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  if (scene === 'expired' || !token.startsWith('v-mock-token-')) {
    throw createError({ statusCode: 401, statusMessage: 'token invalid or expired' })
  }

  // 返回形态契约见 shared/types/auth.ts（AuthUser）：apiOk 泛型标注后，server 与 app 契约漂移在 typecheck 就红
  return apiOk<AuthUser>({ id: 1, username: token.replace('v-mock-token-', ''), nickname: '紫罗兰' })
})
