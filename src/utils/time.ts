/**
 * 时间相关工具函数
 */

/**
 * 格式化年份显示
 * - 负数（公元前）："公元前 221 年"
 * - 0："公元元年"
 * - 正数："公元 1644 年"
 */
export function formatYear(year: number): string {
  if (year < 0) {
    return `公元前 ${Math.abs(year)} 年`
  }
  if (year === 0) {
    return '公元元年'
  }
  return `公元 ${year} 年`
}

/**
 * 简短年份显示（用于空间紧凑的地方）
 * "-221" / "1644"
 */
export function formatYearShort(year: number): string {
  if (year < 0) {
    return `前${Math.abs(year)}`
  }
  if (year === 0) {
    return '元年'
  }
  return `${year}`
}

/**
 * 将年份四舍五入到指定步长的最近整数（用于对齐 GeoJSON 数据点）
 * 例如 year=-215, step=10 → -220
 */
export function alignYearToStep(year: number, step: number): number {
  return Math.round(year / step) * step
}

/**
 * 计算两个年份之间的时长（用于显示"持续了 X 年"）
 */
export function durationYears(startYear: number, endYear: number): number {
  return Math.abs(endYear - startYear)
}

/**
 * 判断事件是否在当前年份活跃
 */
export function isEventActiveAtYear(
  event: { year: number; endYear?: number },
  currentYear: number
): boolean {
  if (currentYear < event.year) return false
  if (event.endYear !== undefined && currentYear > event.endYear) return false
  return true
}