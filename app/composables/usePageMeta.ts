export function usePageMeta(meta: { title: string; description: string }) {
  useSeoMeta({
    title: meta.title,
    description: meta.description,
    ogTitle: meta.title,
    ogDescription: meta.description
  })
}
