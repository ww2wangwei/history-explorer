import type { Era } from '@/types'

/**
 * 判断当前年份处于哪个朝代/文明
 * 支持多朝代并存的情况（如中国宋朝 + 阿拉伯帝国）
 */
export function getActiveErasAtYear(eras: Era[], year: number): Era[] {
  return eras.filter(e => year >= e.startYear && year <= e.endYear)
}

/**
 * 根据当前年份找到覆盖该年份的最强（最长）朝代
 * 优先返回中国朝代，其次按持续时间排序
 */
export function getPrimaryEraAtYear(eras: Era[], year: number): Era | null {
  const active = getActiveErasAtYear(eras, year)
  if (active.length === 0) return null
  // 优先中国朝代
  const china = active.find(e => e.region === 'china')
  if (china) return china
  // 否则按持续时长降序
  return active.sort((a, b) => (b.endYear - b.startYear) - (a.endYear - a.startYear))[0]
}

/**
 * 检查 GeoJSON 中的 feature 是否代表一个朝代/文明
 * 通过 properties.name 或 properties.id 匹配
 */
export function findEraByFeature(eras: Era[], feature: GeoJSON.Feature): Era | null {
  if (!feature.properties) return null
  const props = feature.properties as Record<string, unknown>
  const name = (props.name as string) || (props.NAME as string) || ''
  const id = (props.id as string) || (props.ISO_A3 as string) || ''

  // 优先匹配 id
  if (id) {
    const byId = eras.find(e => e.id === id)
    if (byId) return byId
  }
  // 再匹配名称（不区分大小写，模糊匹配）
  if (name) {
    const lowerName = name.toLowerCase()
    const byName = eras.find(e =>
      e.name.toLowerCase() === lowerName ||
      lowerName.includes(e.name.toLowerCase()) ||
      e.name.toLowerCase().includes(lowerName)
    )
    if (byName) return byName
  }
  return null
}

/**
 * 判断一个 GeoJSON Feature 是否是当前活跃的朝代
 */
export function isFeatureActiveAtYear(
  feature: GeoJSON.Feature,
  year: number
): boolean {
  if (!feature.properties) return false
  const props = feature.properties as Record<string, unknown>
  const startYear = (props.startYear as number) ?? (props.START_YEAR as number)
  const endYear = (props.endYear as number) ?? (props.END_YEAR as number)
  if (startYear === undefined || endYear === undefined) {
    // 数据中没有年份信息，认为一直存在
    return true
  }
  return year >= startYear && year <= endYear
}
/**
 * 按时间窗口拆分（用于地图显示）
 *
 * 当前年份 ± halfRange 年内的项为 inRange（正常显示），
 * 之外的为 ghost（淡化显示）。
 *
 * @param items 朝代或事件
 * @param currentYear 当前年份
 * @param halfRange 时间窗口半径（默认 50；0 = 全部 inRange）
 */
export function splitByTimeWindow<
  T extends { startYear?: number; endYear?: number; year?: number }
>(items: T[], currentYear: number, halfRange: number = 50): { inRange: T[]; ghost: T[] } {
  const inRange: T[] = []
  const ghost: T[] = []
  for (const item of items) {
    // 朝代：startYear/endYear
    if (typeof item.startYear === 'number' && typeof item.endYear === 'number') {
      if (
        currentYear >= item.startYear - halfRange &&
        currentYear <= item.endYear + halfRange
      ) {
        inRange.push(item)
      } else {
        ghost.push(item)
      }
      continue
    }
    // 事件：year
    if (typeof item.year === 'number') {
      if (Math.abs(item.year - currentYear) <= halfRange) {
        inRange.push(item)
      } else {
        ghost.push(item)
      }
    }
  }
  return { inRange, ghost }
}
