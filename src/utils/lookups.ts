/**
 * 同步反查工具：按 ID 查 era / event / figure
 *
 * 用 Map 缓存 O(1) 查找，避免每个笔记都 find()。
 * 不放进 store（store 不依赖静态数据）；不与 dataLoader.ts 混（async loader 是另一回事）。
 */
import eventsData from '@/data/events.json'
import erasData from '@/data/eras.json'
import peopleData from '@/data/people.json'
import { CATEGORY_COLORS, type Era, type HistoricalEvent, type HistoricalFigure } from '@/types'

const EVENTS = eventsData as HistoricalEvent[]
const ERAS = erasData as Era[]
const FIGURES = peopleData as HistoricalFigure[]

const EVENT_BY_ID = new Map(EVENTS.map(e => [e.id, e]))
const ERA_BY_ID = new Map(ERAS.map(e => [e.id, e]))
const FIGURE_BY_ID = new Map(FIGURES.map(p => [p.id, p]))

export function getEventById(id: string): HistoricalEvent | undefined {
  return EVENT_BY_ID.get(id)
}

export function getEraById(id: string): Era | undefined {
  return ERA_BY_ID.get(id)
}

export function getFigureById(id: string): HistoricalFigure | undefined {
  return FIGURE_BY_ID.get(id)
}

/** 取笔记/闪卡关联目标的显示标题，找不到返回 id */
export function getTargetTitle(kind: 'event' | 'era' | 'figure', id: string): string {
  if (kind === 'event') return getEventById(id)?.title ?? id
  if (kind === 'figure') return getFigureById(id)?.name ?? id
  return getEraById(id)?.name ?? id
}

/** 取笔记/闪卡关联目标的年份：事件 → year；朝代 → 中心年；人物 → 出生年 */
export function getTargetYear(kind: 'event' | 'era' | 'figure', id: string): number | undefined {
  if (kind === 'event') return getEventById(id)?.year
  if (kind === 'figure') return getFigureById(id)?.birthYear
  const era = getEraById(id)
  if (!era) return undefined
  return Math.round((era.startYear + era.endYear) / 2)
}

/** 取目标配色：朝代 → era.color；事件 → CATEGORY_COLORS[category]；人物 → 紫色 */
export function getTargetColor(kind: 'event' | 'era' | 'figure', id: string): string | undefined {
  if (kind === 'event') {
    const ev = getEventById(id)
    return ev ? CATEGORY_COLORS[ev.category] : undefined
  }
  if (kind === 'figure') return '#9b7eb6'  // 紫色：与"全人物"主题一致
  return getEraById(id)?.color
}

/** 是否目标已被删除（笔记指向不存在的 era/event/figure） */
export function isTargetMissing(kind: 'event' | 'era' | 'figure', id: string): boolean {
  if (kind === 'event') return !EVENT_BY_ID.has(id)
  if (kind === 'figure') return !FIGURE_BY_ID.has(id)
  return !ERA_BY_ID.has(id)
}
