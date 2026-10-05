import { getHello } from '~/api/hello'
import type { HelloResult } from '~/api/hello'

/**
 * hello 域门面：示例问候数据源（包了层 useAsyncData）。
 * - key 走域前缀制（'域:实体'，对齐 auth:me），pc/m 双端共用这一份——
 *   URL 和响应类型不再内联在视图里、也不用两端各抄一遍（这是视图层禁值导入 api/ 后的合规消费位）
 */
export function useHello() {
  const api = useApiClient()
  return useAsyncData<HelloResult>('hello:message', () => getHello(api))
}
