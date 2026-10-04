/**
 * 动画域门面夹（composables 域化第一例）：本域全部效果门面经本 index 再导出，
 * 视图调用点零 import（auto-import 扫描一级子目录 index.ts，名字不变）。
 *
 * 域化触发线（登记在此，全域适用）：
 * - 单目录 >15 个文件，或某域门面 ≥3 个 → 建域文件夹 + index.ts 再导出
 * - 单文件域（如 useAuth）留在顶层；跨域横切门面（useApi/useTrack/useDevice/useLocale/usePageMeta）永远顶层
 * - 永不为"将来可能有"预建空域文件夹（登记册制度同源）
 *
 * 新效果门面范式：抄 useReveal（onMounted 取门面 → reduced 跳过 → gsap.context → revert）。
 */
export * from './useAnimation'
export * from './useHeroTimeline'
export * from './useParallax'
export * from './usePinnedSection'
export * from './useReveal'
export * from './useSplitText'
