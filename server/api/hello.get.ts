export default defineEventHandler((event) => {
  const device = getHeader(event, 'x-v-device')
  return apiOk({ message: 'hello from nitro', device: device ?? 'unknown' })
})
