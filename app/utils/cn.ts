import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 类名合并（shadcn 组件标配）：clsx 条件拼接 + tailwind-merge 冲突消解。
 * 同类冲突时后传者胜——ui 组件默认变体可被使用处 class 就地覆写
 * （如 LoginPage 的 rounded-lg 覆盖按钮默认 rounded-md）。
 * @param inputs 类名片段（可含 false/null 等条件占位，clsx 会过滤）
 * @returns 拼接并消解冲突后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}
