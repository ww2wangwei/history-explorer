import type { Era } from '@/types'

/**
 * 判断当前年份处于哪个朝代/文明
 * 支持多朝代并存的情况（如中国宋朝 + 阿拉伯帝国）
 */
export function getActiveErasAtYear(eras: Era[], year: number): Era[] {
  return eras.filter(e => year >= e.startYear && year <= e.endYear)
}