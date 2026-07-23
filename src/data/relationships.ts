/**
 * 朝代/文明之间的关系数据
 *
 * 关系类型：
 * - temporal-prev: 时间上前一个朝代（自动推断，标记为同 region 内的先后关系）
 * - temporal-next: 时间上后一个朝代
 * - contemporary: 同时期并存（不同 region 但时间重叠）
 * - succession: 继承关系（禅让/推翻/同源）
 * - transformation: 转型关系（如罗马共和国 → 罗马帝国 → 拜占庭）
 */

export type RelationshipType =
  | 'temporal-prev'    // 时间前序
  | 'temporal-next'    // 时间后续
  | 'contemporary'     // 同时期
  | 'succession'       // 继承（同一政权延续）
  | 'transformation'   // 转型（同一文明不同形态）

export interface Relationship {
  source: string
  target: string
  type: RelationshipType
  label?: string
}

import type { Era } from '@/types'
import erasData from './eras.json'

const eras = erasData as Era[]

/**
 * 自动生成关系数据：
 * 1. 按时间排序每个 region 内的朝代，连接相邻朝代（temporal-prev/next）
 * 2. 找出不同 region 但时间重叠的朝代对（contemporary）
 * 3. 手动标注特殊关系（succession/transformation）
 */
export function generateRelationships(): Relationship[] {
  const relationships: Relationship[] = []

  // 按 region 分组
  const byRegion = new Map<string, Era[]>()
  eras.forEach(era => {
    const list = byRegion.get(era.region) ?? []
    list.push(era)
    byRegion.set(era.region, list)
  })

  // 每个 region 内按时间排序，相邻连接
  byRegion.forEach(eraList => {
    const sorted = eraList.slice().sort((a, b) => a.startYear - b.startYear)
    for (let i = 0; i < sorted.length - 1; i++) {
      relationships.push({
        source: sorted[i].id,
        target: sorted[i + 1].id,
        type: 'temporal-next',
        label: `${sorted[i].startYear < 0 ? '前' + Math.abs(sorted[i].startYear) : sorted[i].startYear} → ${sorted[i + 1].startYear}`,
      })
      relationships.push({
        source: sorted[i + 1].id,
        target: sorted[i].id,
        type: 'temporal-prev',
      })
    }
  })

  // 同时期并存（不同 region 且时间重叠达到阈值）
  // 只有当两个政权的实际重叠年数 >= MIN_OVERLAP_YEARS 时才算"同时期"，
  // 避免仅仅擦边（如法国 843 起 与唐朝 907 止只重叠数十年）也生成大量无意义连线。
  const MIN_OVERLAP_YEARS = 80
  const eraList = eras.slice()
  for (let i = 0; i < eraList.length; i++) {
    for (let j = i + 1; j < eraList.length; j++) {
      const a = eraList[i]
      const b = eraList[j]
      if (a.region === b.region) continue
      // 重叠区间 = [max(start), min(end)]，重叠年数 = min(end) - max(start)
      const overlapStart = Math.max(a.startYear, b.startYear)
      const overlapEnd = Math.min(a.endYear, b.endYear)
      const overlapYears = overlapEnd - overlapStart
      if (overlapYears >= MIN_OVERLAP_YEARS) {
        relationships.push({
          source: a.id,
          target: b.id,
          type: 'contemporary',
          label: `并存于 ${overlapStart < 0 ? '前' + Math.abs(overlapStart) : overlapStart}`,
        })
      }
    }
  }

  // 手动标注特殊关系
  const specialRelations: Relationship[] = [
    // 罗马共和国 → 罗马帝国（转型）
    { source: 'rome-republic', target: 'rome-empire', type: 'transformation' },
    // 罗马帝国 → 拜占庭帝国（同一文明延续）
    { source: 'rome-empire', target: 'byzantine', type: 'succession', label: '东罗马延续' },
    // 蒙古帝国 → 元朝（同一政权在东亚）
    { source: 'mongol-empire', target: 'yuan', type: 'transformation' },
    // 西汉 → 东汉（朝代延续）
    { source: 'han-west', target: 'han-east', type: 'succession', label: '光武中兴' },
    // 北宋 → 南宋（朝代延续）
    { source: 'song-north', target: 'song-south', type: 'succession', label: '南宋偏安' },
  ]
  relationships.push(...specialRelations)

  return relationships
}

// 关系类型样式映射
export const RELATIONSHIP_STYLES: Record<RelationshipType, {
  color: string
  dashArray: string
  width: number
  label: string
}> = {
  'temporal-prev':  { color: '#5a5142', dashArray: '0',    width: 0.5, label: '时间前序' },
  'temporal-next':  { color: '#5a5142', dashArray: '0',    width: 0.5, label: '时间后续' },
  'contemporary':   { color: '#a87a3e', dashArray: '3,3',  width: 0.8, label: '同时期' },
  'succession':     { color: '#c89a5b', dashArray: '0',    width: 1.5, label: '继承' },
  'transformation': { color: '#fdf8f0', dashArray: '5,3',  width: 1.5, label: '转型' },
}