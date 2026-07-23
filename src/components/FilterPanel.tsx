import { useState, useMemo, useRef, useEffect } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'
import { CATEGORY_COLORS, type EventCategory, type HistoricalEvent } from '@/types'
import eventsData from '@/data/events.json'

const events = eventsData as HistoricalEvent[]
const ALL_CATEGORIES: EventCategory[] = ['政治', '经济', '文化', '军事', '科技', '思想', '外交']
const ALL_REGIONS = ['china', 'rome', 'arab', 'persia', 'mongol', 'britain', 'other']

export default function FilterPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { filters, toggleCategory, toggleRegion, setMinImportance, resetFilters, currentYear } = useHistoryStore()

  // 计算应用筛选后的事件数（±50 年窗口）
  const filteredCount = useMemo(() => {
    return events.filter(e => {
      if (Math.abs(e.year - currentYear) > 50) return false
      if (filters.categories.length > 0 && !filters.categories.includes(e.category)) return false
      if (filters.regions.length > 0 && !filters.regions.includes(e.region)) return false
      if (e.importance < filters.minImportance) return false
      return true
    }).length
  }, [currentYear, filters])

  const totalCount = useMemo(
    () => events.filter(e => Math.abs(e.year - currentYear) <= 50).length,
    [currentYear]
  )

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.regions.length > 0 ||
    filters.minImportance > 1

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  return (
    <div className="relative" ref={containerRef}>
      <button
        className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
          hasActiveFilters
            ? 'bg-bronze-600/30 border-bronze-500/60 text-bronze-400'
            : 'bg-ink-700/80 hover:bg-ink-600 border-ink-600 text-bronze-400'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        title="事件筛选"
      >
        <span>🔍</span>
        <span>筛选</span>
        {hasActiveFilters && (
          <span className="text-[9px] bg-bronze-500 text-ink-900 rounded-full w-4 h-4 leading-4 text-center font-bold">
            !
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-ink-800 border border-ink-600 rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* 顶部：状态条 */}
          <div className="px-3 py-2 border-b border-ink-700 flex items-center justify-between">
            <div className="text-xs text-ink-500">
              <span className="text-bronze-400 font-serif">{filteredCount}</span>
              <span> / {totalCount}</span> 个事件匹配
            </div>
            {hasActiveFilters && (
              <button
                className="text-xs text-ink-500 hover:text-parchment-50 underline"
                onClick={resetFilters}
              >
                重置
              </button>
            )}
          </div>

          {/* 分类筛选 */}
          <div className="p-3 border-b border-ink-700">
            <div className="text-xs text-ink-500 mb-2">分类</div>
            <div className="flex flex-wrap gap-1">
              {ALL_CATEGORIES.map(cat => {
                const active = filters.categories.includes(cat)
                return (
                  <button
                    key={cat}
                    className={`px-2 py-0.5 rounded-lg text-xs border transition-all ${
                      active
                        ? 'border-current'
                        : 'border-ink-600 text-ink-500 hover:border-ink-500'
                    }`}
                    style={{
                      background: active ? `${CATEGORY_COLORS[cat]}30` : 'transparent',
                      color: active ? CATEGORY_COLORS[cat] : undefined,
                    }}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
            <div className="text-[9px] text-ink-600 mt-1.5">
              {filters.categories.length === 0 ? '显示所有分类' : `已选 ${filters.categories.length} 个`}
            </div>
          </div>

          {/* 地区筛选 */}
          <div className="p-3 border-b border-ink-700">
            <div className="text-xs text-ink-500 mb-2">地区</div>
            <div className="flex flex-wrap gap-1">
              {ALL_REGIONS.map(region => {
                const active = filters.regions.includes(region)
                const labels: Record<string, string> = {
                  china: '🇨🇳 中国',
                  rome: '🏛️ 罗马',
                  arab: '☪️ 阿拉伯',
                  persia: '波斯',
                  mongol: '🏹 蒙古',
                  britain: '🇬🇧 英国',
                  other: '🌍 其他',
                }
                return (
                  <button
                    key={region}
                    className={`px-2 py-0.5 rounded-lg text-xs border transition-all ${
                      active
                        ? 'bg-bronze-600/30 border-bronze-500/60 text-bronze-400'
                        : 'border-ink-600 text-ink-500 hover:border-ink-500'
                    }`}
                    onClick={() => toggleRegion(region)}
                  >
                    {labels[region]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 重要度筛选 */}
          <div className="p-3">
            <div className="text-xs text-ink-500 mb-2">重要度</div>
            <div className="flex gap-1">
              {[1, 2, 3].map(level => (
                <button
                  key={level}
                  className={`flex-1 px-2 py-1 rounded-lg text-xs border transition-all ${
                    filters.minImportance === level
                      ? 'bg-bronze-600/30 border-bronze-500/60 text-bronze-400'
                      : 'border-ink-600 text-ink-500 hover:border-ink-500'
                  }`}
                  onClick={() => setMinImportance(level as 1 | 2 | 3)}
                >
                  {level === 1 ? '全部' : level === 2 ? '中等以上' : '仅最重要'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}