import { getHello } from '~/api/hello'
import type { HelloResult } from '~/api/hello'

/**
 * hello 域门面：示例问候数据源（useAsyncData 包装）。
 * - key 走域前缀制（'域:实体'，对齐 auth:me），pc/m 双端共用一份——
 *   URL 与响应类型不再内联视图、不再两端复制（视图层禁值导入 api/ 的合规消费位）
 */
export function useHello() {
  const api = useApiClient()
  return useAsyncData<HelloResult>('hello:message', () => getHello(api))
}
