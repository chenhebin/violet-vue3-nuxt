/**
 * 设备形态契约（app + server 共享）：
 * server 端 UA 判定写入、app 端消费（布局选择 / x-v-device 注头），
 * 语义单源，两端永不漂移。
 */
export type Device = 'pc' | 'm'
