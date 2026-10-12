/**
 * 主题域门面夹：本域门面经本 index 再导出一次，视图调用点零 import
 * （auto-import 会扫一级子目录的 index.ts，名字不变——机制同 animation/index.ts）。
 *
 * 建夹缘由：域化门槛是「攒到 3 个门面」（登记在 animation/index.ts），theme 域当时只有 2 个
 * （useTheme 切换 / useUserTheme 用户覆盖），经产品决策提前建夹——主题域是既定增长位，
 * 品牌主题包门面、账号级同步门面（真实后端接入时）落位于此。
 */
export * from './useTheme'
export * from './useUserTheme'
