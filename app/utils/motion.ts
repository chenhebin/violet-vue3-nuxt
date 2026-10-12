/**
 * prefers-reduced-motion 查询串全站唯一出处：组合根（plugins/animation.client.ts）与
 * basic 播放器共用。播放器在 basic 层（禁依赖 composables），故放 utils 而非门面。
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
