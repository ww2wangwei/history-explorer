/**
 * 中外交叉对照工具
 *
 * 选定朝代后，自动展示同时间窗口的中国 vs 世界事件/朝代
 * 数据源：eras.json + events.json
 */
import type { Era, HistoricalEvent } from '@/types'
import erasData from '@/data/eras.json'
import eventsData from '@/data/events.json'

const ERAS = erasData as Era[]
const EVENTS = eventsData as HistoricalEvent[]

/** 两个时间区间相交判定 */
function overlaps(eraStart: number, eraEnd: number, rangeStart: number, rangeEnd: number): boolean {
  return eraEnd >= rangeStart && eraStart <= rangeEnd
}

/** 范围内中国朝代（按 startYear 升序） */
export function getChineseErasInRange(startYear: number, endYear: number): Era[] {
  return ERAS.filter(e =>
    e.region === 'china' && overlaps(e.startYear, e.endYear, startYear, endYear)
  ).sort((a, b) => a.startYear - b.startYear)
}

/** 范围内世界朝代（按 startYear 升序） */
export function getWorldErasInRange(startYear: number, endYear: number): Era[] {
  return ERAS.filter(e =>
    e.region !== 'china' && overlaps(e.startYear, e.endYear, startYear, endYear)
  ).sort((a, b) => a.startYear - b.startYear)
}

/** 范围内中国事件（按 year 升序） */
export function getChineseEventsInRange(startYear: number, endYear: number): HistoricalEvent[] {
  return EVENTS.filter(e =>
    e.region === 'china' && e.year >= startYear && e.year <= endYear
  ).sort((a, b) => a.year - b.year)
}

/** 范围内世界事件（按 year 升序） */
export function getWorldEventsInRange(startYear: number, endYear: number): HistoricalEvent[] {
  return EVENTS.filter(e =>
    e.region !== 'china' && e.year >= startYear && e.year <= endYear
  ).sort((a, b) => a.year - b.year)
}

/** 获取参考朝代 */
export function getReferenceEra(eraId: string | null): Era | null {
  if (!eraId) return null
  return ERAS.find(e => e.id === eraId) ?? null
}

/** 计算时间窗口：朝代全时段（如 0 跨度自动扩展 ±20 年） */
export function calcTimeRange(era: Era | null): { start: number; end: number } | null {
  if (!era) return null
  let { startYear, endYear } = era
  if (startYear === endYear) {
    startYear -= 20
    endYear += 20
  }
  return { start: startYear, end: endYear }
}

/** 时间跨度 → 推荐刻度间隔（年） */
export function recommendTickInterval(span: number): number {
  if (span <= 50) return 10
  if (span <= 200) return 25
  if (span <= 500) return 50
  if (span <= 1500) return 100
  return 200
}
