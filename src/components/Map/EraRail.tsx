/**
 * EraRail — 右侧时代栏（地图为主角布局）
 *
 * 常驻在布局右侧 280px，显示：
 *   1. 当前年份（大字）+ 上下年按钮
 *   2. 当前活跃朝代/文明（中国主朝代 + 世界并列）
 *   3. ±50 年关键大事列表（点击 → selectEvent + 飞到地图）
 *   4. 朝代快捷跳转（时间机）
 *   5. 事件筛选（收纳式）
 *
 * 目的：让地图保持全幅主角，时间上下文全部收进这一栏。
 */
import { useMemo, useState, useRef, useEffect } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useMapLayersStore } from '@/store/useMapLayersStore'
import { getActiveErasAtYear } from '@/utils/geo'
import { formatYear, formatYearShort } from '@/utils/time'
import { audioEngine } from '@/utils/audioEngine'
import { CATEGORY_COLORS, type EventCategory, type HistoricalEvent } from '@/types'
import erasData from '@/data/eras.json'
import eventsData from '@/data/events.json'
import type { Era } from '@/types'

const eras = erasData as Era[]
const events = eventsData as HistoricalEvent[]

const ALL_CATEGORIES: EventCategory[] = ['政治', '经济', '文化', '军事', '科技', '思想', '外交']
const ALL_REGIONS = ['china', 'rome', 'arab', 'persia', 'mongol', 'britain', 'other']
const REGION_LABELS: Record<string, string> = {
  china: '🇨🇳 中国',
  rome: '🏛️ 罗马',
  arab: '☪️ 阿拉伯',
  persia: '波斯',
  mongol: '🏹 蒙古',
  britain: '🇬🇧 英国',
  other: '🌍 其他',
}

export default function EraRail() {
  const currentYear = useHistoryStore(s => s.currentYear)
  const setYear = useHistoryStore(s => s.setYear)
  const selectEra = useHistoryStore(s => s.selectEra)
  const selectEvent = useHistoryStore(s => s.selectEvent)
  const setTimelineView = useHistoryStore(s => s.setTimelineView)
  const { filters, toggleCategory, toggleRegion, setMinImportance, resetFilters } = useHistoryStore()

  // 事件筛选（地图 ±50 年窗口保持一致）
  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        if (Math.abs(e.year - currentYear) > 50) return false
        if (filters.categories.length > 0 && !filters.categories.includes(e.category)) return false
        if (filters.regions.length > 0 && !filters.regions.includes(e.region)) return false
        if (e.importance < filters.minImportance) return false
        return true
      })
      .sort((a, b) => b.importance - a.importance || Math.abs(a.year - currentYear) - Math.abs(b.year - currentYear))
      .slice(0, 12)
  }, [currentYear, filters])

  const activeEras = useMemo(() => getActiveErasAtYear(eras, currentYear), [currentYear])
  const chinaEra = activeEras.find(e => e.region === 'china')
  const worldEras = activeEras.filter(e => e.region !== 'china').slice(0, 3)

  const [timeOpen, setTimeOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const sortedEras = useMemo(() => eras.slice().sort((a, b) => a.startYear - b.startYear), [])
  const filteredEras = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sortedEras
    return sortedEras.filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.shortDesc?.toLowerCase().includes(q) ?? false)
    )
  }, [query, sortedEras])

  useEffect(() => {
    if (!timeOpen && !filterOpen) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTimeOpen(false)
        setFilterOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [timeOpen, filterOpen])

  const jumpToEra = (era: Era) => {
    audioEngine.playSelect()
    const centerYear = Math.round((era.startYear + era.endYear) / 2)
    setYear(centerYear)
    setTimelineView(centerYear, 1.5)
    setTimeOpen(false)
    setQuery('')
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.regions.length > 0 ||
    filters.minImportance > 1

  return (
    <aside
      ref={containerRef}
      className="w-[280px] shrink-0 h-full flex flex-col border-l border-ink-400 bg-paper-warm/70 backdrop-blur overflow-hidden"
    >
      {/* 顶部：年份 */}
      <div className="px-4 pt-4 pb-3 border-b border-ink-400">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-ink-300 uppercase tracking-wider">当前时间</span>
          <button
            onClick={() => { audioEngine.playClick(); resetFilters() }}
            className={`text-[10px] underline transition-colors ${hasActiveFilters ? 'text-vermilion-300' : 'text-ink-300 hover:text-ink-200'}`}
            title="重置筛选"
          >
            {hasActiveFilters ? '已筛选 · 重置' : '全部事件'}
          </button>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <button
            onClick={() => { audioEngine.playClick(); setYear(currentYear - 1) }}
            className="w-7 h-7 rounded-lg border border-ink-400 text-ink-300 hover:text-bone hover:border-vermilion-500/60 transition-colors leading-none"
            title="上一年 (←)"
          >‹</button>
          <div className="flex-1 text-center">
            <div className="font-brush text-2xl text-bone tabular-nums leading-none tracking-wide">
              {formatYearShort(currentYear)}
            </div>
            <div className="text-[10px] text-ink-300 mt-1">
              {formatYear(currentYear)}
            </div>
          </div>
          <button
            onClick={() => { audioEngine.playClick(); setYear(currentYear + 1) }}
            className="w-7 h-7 rounded-lg border border-ink-400 text-ink-300 hover:text-bone hover:border-vermilion-500/60 transition-colors leading-none"
            title="下一年 (→)"
          >›</button>
        </div>
      </div>

      {/* 当前朝代 */}
      <div className="px-4 py-3 border-b border-ink-400">
        <div className="text-xs text-ink-300 uppercase tracking-wider mb-2">此刻的文明</div>
        <div className="space-y-1.5">
          {chinaEra && (
            <button
              onClick={() => selectEra(chinaEra.id)}
              className="w-full text-left px-3 py-2 rounded-lg bg-vermilion-tint/40 border border-vermilion/40 hover:border-vermilion transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="font-brush text-sm text-vermilion group-hover:text-vermilion-2 transition-colors tracking-wide">
                  {chinaEra.name}
                </span>
                <span className="text-[10px] text-ink-300 tabular-nums">
                  {chinaEra.startYear < 0 ? `BC ${-chinaEra.startYear}` : chinaEra.startYear}
                  {' ~ '}
                  {chinaEra.endYear < 0 ? `BC ${-chinaEra.endYear}` : chinaEra.endYear}
                </span>
              </div>
              {chinaEra.shortDesc && (
                <div className="text-[10px] text-ink-200 mt-1 line-clamp-2 leading-relaxed">{chinaEra.shortDesc}</div>
              )}
            </button>
          )}
          {worldEras.map(era => (
            <button
              key={era.id}
              onClick={() => selectEra(era.id)}
              className="w-full text-left px-3 py-1.5 rounded-lg border border-ink-400 bg-paper-card/60 hover:border-vermilion-500/40 hover:bg-paper-card transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-brush tracking-wide group-hover:text-vermilion transition-colors" style={{ color: era.color }}>
                  {era.name}
                </span>
                <span className="text-[10px] text-ink-300 tabular-nums">
                  {era.startYear < 0 ? `BC ${-era.startYear}` : era.startYear}
                  {' ~ '}
                  {era.endYear < 0 ? `BC ${-era.endYear}` : era.endYear}
                </span>
              </div>
            </button>
          ))}
          {activeEras.length === 0 && (
            <div className="text-xs text-ink-300 px-1">（无对应朝代）</div>
          )}
        </div>
      </div>

      {/* ±50 年大事 */}
      <div className="flex-1 min-h-0 flex flex-col px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-ink-300 uppercase tracking-wider">近 50 年大事</span>
          <span className="text-[10px] text-ink-300 tabular-nums">{filteredEvents.length} 条</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin -mx-1 px-1">
          <div className="space-y-1.5">
            {filteredEvents.map(ev => (
              <button
                key={ev.id}
                onClick={() => {
                  audioEngine.playSelect()
                  selectEvent(ev.id)
                  setYear(ev.year)
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg border border-ink-400 bg-paper-card hover:border-vermilion-500/40 hover:bg-paper-warm transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ background: CATEGORY_COLORS[ev.category] }}
                  />
                  <span className="text-[10px] text-ink-300 tabular-nums font-mono">
                    {ev.year < 0 ? `BC ${-ev.year}` : ev.year}
                  </span>
                  <span className="text-[9px] text-ink-300">{ev.category}</span>
                  {ev.importance >= 3 && <span className="text-[9px] text-vermilion ml-auto">★</span>}
                </div>
                <div className="text-xs text-ink-200 group-hover:text-bone mt-0.5 line-clamp-2 leading-relaxed transition-colors">
                  {ev.title}
                </div>
              </button>
            ))}
            {filteredEvents.length === 0 && (
              <div className="text-xs text-ink-300 px-1 py-4 text-center">当前筛选下无事件</div>
            )}
          </div>
        </div>
      </div>

      {/* 底部：朝代跳转 + 筛选 */}
      <div className="px-4 py-2.5 border-t border-ink-700 flex gap-1.5">
        <div className="relative flex-1">
          <button
            onClick={() => { audioEngine.playClick(); setTimeOpen(o => !o); setFilterOpen(false) }}
            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
              timeOpen
                ? 'bg-vermilion-500/30 border-vermilion-500/60 text-vermilion-300'
                : 'border-ink-600 text-ink-400 hover:border-vermilion-500/40 hover:text-vermilion-300'
            }`}
            title="朝代快捷跳转"
          >
            🕰 跳转朝代
          </button>
          {timeOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 max-h-64 overflow-hidden rounded-lg border border-ink-600 bg-ink-800 shadow-2xl z-50 flex flex-col">
              <div className="p-2 border-b border-ink-700">
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="搜索朝代…"
                  className="w-full px-2 py-1 text-xs bg-ink-900 border border-ink-600 rounded focus:outline-none focus:border-vermilion-500/60 placeholder:text-ink-600"
                />
              </div>
              <div className="overflow-y-auto scrollbar-thin">
                {filteredEras.slice(0, 20).map(era => (
                  <button
                    key={era.id}
                    onClick={() => jumpToEra(era)}
                    className="w-full text-left px-3 py-1.5 text-xs text-ink-200 hover:bg-ink-700 transition-colors flex items-center justify-between"
                  >
                    <span style={{ color: era.color }}>{era.name}</span>
                    <span className="text-[10px] text-ink-500 tabular-nums">
                      {formatYearShort(era.startYear)}~{formatYearShort(era.endYear)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => { audioEngine.playClick(); setFilterOpen(o => !o); setTimeOpen(false) }}
            className={`px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
              filterOpen || hasActiveFilters
                ? 'bg-vermilion-500/30 border-vermilion-500/60 text-vermilion-300'
                : 'border-ink-600 text-ink-400 hover:border-vermilion-500/40 hover:text-vermilion-300'
            }`}
            title="事件筛选"
          >
            ⚙ 筛选
          </button>
          {filterOpen && (
            <div className="absolute bottom-full right-0 mb-1 w-64 max-h-80 overflow-y-auto scrollbar-thin rounded-lg border border-ink-600 bg-ink-800 shadow-2xl z-50 p-3">
              <div className="text-xs text-ink-500 mb-2">分类</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {ALL_CATEGORIES.map(cat => {
                  const active = filters.categories.includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-2 py-0.5 rounded-lg text-xs border transition-all ${
                        active ? 'border-current' : 'border-ink-600 text-ink-500 hover:border-ink-500'
                      }`}
                      style={{
                        background: active ? `${CATEGORY_COLORS[cat]}30` : 'transparent',
                        color: active ? CATEGORY_COLORS[cat] : undefined,
                      }}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>

              <div className="text-xs text-ink-500 mb-2">地区</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {ALL_REGIONS.map(region => {
                  const active = filters.regions.includes(region)
                  return (
                    <button
                      key={region}
                      onClick={() => toggleRegion(region)}
                      className={`px-2 py-0.5 rounded-lg text-xs border transition-all ${
                        active
                          ? 'bg-vermilion-500/30 border-vermilion-500/60 text-vermilion-300'
                          : 'border-ink-600 text-ink-500 hover:border-ink-500'
                      }`}
                    >
                      {REGION_LABELS[region]}
                    </button>
                  )
                })}
              </div>

              <div className="text-xs text-ink-500 mb-2">重要度</div>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3].map(level => (
                  <button
                    key={level}
                    onClick={() => setMinImportance(level as 1 | 2 | 3)}
                    className={`flex-1 px-2 py-1 rounded-lg text-xs border transition-all ${
                      filters.minImportance === level
                        ? 'bg-vermilion-500/30 border-vermilion-500/60 text-vermilion-300'
                        : 'border-ink-600 text-ink-500 hover:border-ink-500'
                    }`}
                  >
                    {level === 1 ? '全部' : level === 2 ? '中等+' : '最重要'}
                  </button>
                ))}
              </div>

              <button
                onClick={resetFilters}
                className="w-full px-2 py-1.5 rounded border border-ink-600 text-xs text-ink-400 hover:border-vermilion-500/40 hover:text-vermilion-300 transition-colors"
              >
                重置筛选
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}