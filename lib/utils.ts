import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并 Tailwind CSS 类名的工具函数
 * 使用 clsx 处理条件类名，twMerge 处理冲突的 Tailwind 类
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化错误消息的工具函数
 * @param error - 错误对象
 * @returns 格式化的错误消息
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

/**
 * 延迟执行的工具函数
 * @param ms - 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 生成随机 ID 的工具函数
 * @param length - ID 长度
 * @returns 随机字符串
 */
export function generateId(length: number = 8): string {
  return Math.random().toString(36).substring(2, length + 2)
}

/**
 * 格式化日期的工具函数
 * @param date - 日期对象或字符串
 * @param locale - 区域设置
 * @returns 格式化的日期字符串
 */
export function formatDate(date: Date | string, locale: string = 'zh-CN'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale)
}

/**
 * 截断文本的工具函数
 * @param text - 原始文本
 * @param maxLength - 最大长度
 * @param suffix - 后缀
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * 深度复制对象的工具函数
 * @param obj - 要复制的对象
 * @returns 复制后的对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 防抖函数
 * @param func - 要防抖的函数
 * @param wait - 等待时间
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 * @param func - 要节流的函数
 * @param limit - 限制时间
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 字符串插值函数，用于 i18n
 * @param template - 包含占位符的模板字符串
 * @param values - 替换值对象
 * @returns 插值后的字符串
 */
export function interpolate(template: string, values: Record<string, any>): string {
  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match
  })
}

/**
 * 数字格式化工具函数
 * @param num - 数字
 * @param locale - 区域设置
 * @returns 格式化的数字字符串
 */
export function formatNumber(num: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * 百分比格式化工具函数
 * @param value - 值（0-100）
 * @param decimals - 小数位数
 * @returns 格式化的百分比字符串
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`
}