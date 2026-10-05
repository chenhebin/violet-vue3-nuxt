/**
 * 设备形态契约（app 和 server 共用）：
 * server 端判 UA 后写入，app 端拿来用（选布局 / 注 x-v-device 头）。
 * 语义只有这一份，两端永不走样。
 */
export type Device = 'pc' | 'm'
