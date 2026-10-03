export default defineEventHandler((event) => {
  const device = getHeader(event, 'x-v-device')
  return {
    code: 0,
    data: { message: 'hello from nitro', device: device ?? 'unknown' }
  }
})
