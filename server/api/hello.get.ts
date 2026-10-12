// 返回形态契约见 shared/types/hello.ts（HelloResult）：apiOk 泛型标注后，server 与 app 契约漂移在 typecheck 就红
//（类型经 Nuxt shared 机制免 import）
export default defineEventHandler((event) => {
  const device = getHeader(event, 'x-v-device')
  return apiOk<HelloResult>({ message: 'hello from nitro', device: device ?? 'unknown' })
})
