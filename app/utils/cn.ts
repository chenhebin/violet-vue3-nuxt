import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 类名合并工具（shadcn 组件标配）：clsx 按条件拼类名，tailwind-merge 解决冲突。
 * 同类冲突后传的赢——ui 组件的默认变体能被使用处的 class 当场覆盖
 * （比如 LoginPage 用 rounded-lg 覆盖按钮默认的 rounded-md）。
 * @param inputs 类名片段，可混 false/null 等条件占位，clsx 自动过滤
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}
