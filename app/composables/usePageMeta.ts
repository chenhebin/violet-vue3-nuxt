/**
 * 页面 SEO 元信息门面：title/description 一次登记，
 * og:* 分享卡片字段同步落齐，调用方不重复填写。
 * @param meta 页面标题与描述
 */
export function usePageMeta(meta: { title: string; description: string }) {
  useSeoMeta({
    title: meta.title,
    description: meta.description,
    ogTitle: meta.title,
    ogDescription: meta.description
  })
}
