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
 * "公元前221" / "1644"
 */
export function formatYearShort(year: number): string {
  if (year < 0) {
    return `公元前${Math.abs(year)}`
  }
  if (year === 0) {
    return '元年'
  }
  return `${year}`
}

/**
 * 计算两个年份之间的时长（用于显示"持续 X 年"）
 */
export function durationYears(startYear: number, endYear: number): number {
  return Math.abs(endYear - startYear)
}
