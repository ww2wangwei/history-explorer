/**
 * SearchWorker — 全局搜索后台线程
 *
 * 🎯 性能优化：把"跨数据集模糊搜索"放到后台线程，主线程不卡顿。
 *
 * 数据：worker 启动时同步 import eras + events + people。
 *   - 主线程不直接持有数据副本（通过 sharedDataLoader 懒加载）
 *   - worker chunk 会包含这 3 个 JSON（约 550 KB），独立下载
 *
 * 协议：
 *   主线程 → worker: { type: 'search', query: string, types?: string[], limit?: number }
 *   worker → 主线程: { type: 'results', results: SearchResultItem[], durationMs: number }
 */

import erasData from '@/data/eras.json'
import eventsData from '@/data/events.json'
import peopleData from '@/data/people.json'
import type { Era, HistoricalEvent, HistoricalFigure } from '@/types'

const eras = erasData as Era[]
const events = eventsData as HistoricalEvent[]
const people = peopleData as HistoricalFigure[]

interface SearchRequest {
  type: 'search'
  query: string
  limit?: number
}

interface SearchResultItem {
  type: 'era' | 'event' | 'figure'
  id: string
  title: string
  subtitle?: string
  year?: number
  endYear?: number
  color?: string
}

interface SearchResponse {
  type: 'results'
  results: SearchResultItem[]
  durationMs: number
  total: number
}

// 预归一化（一次，省后续每次查询）
const NORM = (s: string) => s.toLowerCase().trim()
const NORM_ERAS = eras.map(e => ({
  e,
  name: NORM(e.name),
  shortDesc: NORM(e.shortDesc ?? ''),
  desc: NORM(e.description ?? ''),
}))
const NORM_EVENTS = events.map(ev => ({
  ev,
  title: NORM(ev.title),
  desc: NORM(ev.description),
}))
const NORM_PEOPLE = people.map(p => ({
  p,
  name: NORM(p.name),
  role: NORM(p.role),
  desc: NORM(p.description),
}))

function search(query: string, limit: number): SearchResultItem[] {
  const q = NORM(query)
  if (!q) return []
  const results: SearchResultItem[] = []

  // 朝代（按 name / shortDesc / description 匹配）
  for (const { e, name, shortDesc, desc } of NORM_ERAS) {
    if (
      name.includes(q) ||
      shortDesc.includes(q) ||
      desc.includes(q)
    ) {
      results.push({
        type: 'era',
        id: e.id,
        title: e.name,
        subtitle: e.shortDesc ?? '',
        year: e.startYear,
        endYear: e.endYear,
        color: e.color,
      })
      if (results.length >= limit) break
    }
  }

  // 事件
  for (const { ev, title, desc } of NORM_EVENTS) {
    if (title.includes(q) || desc.includes(q)) {
      results.push({
        type: 'event',
        id: ev.id,
        title: ev.title,
        subtitle: ev.description.slice(0, 80),
        year: ev.year,
        endYear: ev.endYear,
      })
      if (results.length >= limit * 2) break
    }
  }

  // 人物
  for (const { p, name, role, desc } of NORM_PEOPLE) {
    if (name.includes(q) || role.includes(q) || desc.includes(q)) {
      results.push({
        type: 'figure',
        id: p.id,
        title: p.name,
        subtitle: `${p.role} · ${p.description.slice(0, 60)}`,
        year: p.birthYear,
        endYear: p.deathYear,
      })
      if (results.length >= limit * 3) break
    }
  }

  return results
}

self.addEventListener('message', (e: MessageEvent<SearchRequest>) => {
  const msg = e.data
  if (msg.type !== 'search') return
  const start = performance.now()
  const limit = msg.limit ?? 20
  const results = search(msg.query, limit)
  const response: SearchResponse = {
    type: 'results',
    results,
    durationMs: Math.round(performance.now() - start),
    total: results.length,
  }
  ;(self as unknown as Worker).postMessage(response)
})

// 通知主线程 worker 已就绪
;(self as unknown as Worker).postMessage({ type: 'ready', counts: { eras: eras.length, events: events.length, people: people.length } })