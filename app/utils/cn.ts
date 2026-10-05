import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 类名合并工具（shadcn 组件的标配）：clsx 负责按条件拼类名，tailwind-merge 负责解决冲突。
 * 同类冲突时后传的赢——所以 ui 组件的默认变体能被使用处的 class 当场覆盖
 * （比如 LoginPage 用 rounded-lg 覆盖按钮默认的 rounded-md）。
 * @param inputs 类名片段（可以混 false/null 这类条件占位，clsx 会自动过滤）
 * @returns 拼好并解决完冲突的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}
