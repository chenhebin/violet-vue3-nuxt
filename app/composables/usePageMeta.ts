/**
 * 页面 SEO 元信息门面：title/description 登记一次，
 * og:* 分享卡片字段顺手一起落齐，调用方不用重复填。
 * @param meta 页面元信息（title/description）
 */
export function usePageMeta(meta: { title: string; description: string }) {
  useSeoMeta({
    title: meta.title,
    description: meta.description,
    ogTitle: meta.title,
    ogDescription: meta.description
  })
}
