/**
 * 动画域门面夹（composables 域化第一例）：本域全部效果门面经本 index 再导出一次，
 * 视图调用点零 import（auto-import 会扫一级子目录的 index.ts，名字不变）。
 *
 * 什么时候建域文件夹（登记在这，全域适用）：
 * - 单目录超过 15 个文件，或某域门面攒到 3 个以上 → 建域文件夹 + index.ts 再导出
 * - 单文件域（比如 useAuth）留在顶层；跨域横切门面（useApi/useTrack/useDevice/useLocale/usePageMeta）永远顶层
 * - 不为"将来可能有"预建空域文件夹（跟登记册制度一个道理）
 *
 * 新效果门面用 createEffect（生命周期骨架收在那，域内私有不在此再导出），自己只写动画配方（照 useReveal.ts 抄）。
 */
export * from './useAnimation'
export * from './useHeroTimeline'
export * from './useParallax'
export * from './usePinnedSection'
export * from './useReveal'
export * from './useSplitText'
