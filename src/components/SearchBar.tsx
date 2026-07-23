import { useState, useMemo } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'
import { formatYear } from '@/utils/time'
import { CATEGORY_COLORS, type HistoricalEvent } from '@/types'
import eventsData from '@/data/events.json'
import erasData from '@/data/eras.json'

const events = eventsData as HistoricalEvent[]
const eras = erasData as Array<{ id: string; name: string; region: string; startYear: number; endYear: number; shortDesc?: string }>

interface SearchResult {
  type: 'event' | 'era'
  id: string
  title: string
  year?: number
  endYear?: number
  subtitle?: string
  color?: string
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { setYear, selectEvent, selectEra } = useHistoryStore()

  // 搜索结果
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return []
    const q = query.trim().toLowerCase()

    const matchedEvents: SearchResult[] = events
      .filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
      .slice(0, 10)
      .map(e => ({
        type: 'event' as const,
        id: e.id,
        title: e.title,
        year: e.year,
        endYear: e.endYear,
        subtitle: e.description.slice(0, 50) + (e.description.length > 50 ? '...' : ''),
        color: CATEGORY_COLORS[e.category],
      }))

    const matchedEras: SearchResult[] = eras
      .filter(e => e.name.toLowerCase().includes(q) || (e.shortDesc?.toLowerCase().includes(q) ?? false))
      .slice(0, 5)
      .map(e => ({
        type: 'era' as const,
        id: e.id,
        title: e.name,
        year: e.startYear,
        endYear: e.endYear,
        subtitle: e.shortDesc,
        color: '#c89a5b',
      }))

    return [...matchedEvents, ...matchedEras]
  }, [query])

  const handleSelect = (result: SearchResult) => {
    if (result.year !== undefined) {
      setYear(result.year)
    }
    if (result.type === 'event') {
      selectEvent(result.id)
    } else {
      selectEra(result.id)
    }
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative w-40 md:w-52 xl:w-72">
      <div className="relative">
        <input
          type="text"
          placeholder="搜索事件、朝代..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full px-3 py-1.5 pl-8 rounded-lg bg-ink-700 border border-ink-600 text-sm text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500"
        />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500 text-sm">
          🔍
        </span>
      </div>

      {/* 下拉结果 */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto bg-ink-800 border border-ink-600 rounded-lg shadow-2xl z-50 scrollbar-thin">
          {results.map(result => (
            <button
              key={`${result.type}-${result.id}`}
              className="w-full text-left px-3 py-2 hover:bg-ink-700 border-b border-ink-700 last:border-b-0 transition-colors"
              onClick={() => handleSelect(result)}
            >
              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                <span className="text-sm text-parchment-50 flex items-baseline gap-1.5">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-lg shrink-0"
                    style={{
                      background: `${result.color}20`,
                      color: result.color,
                      border: `1px solid ${result.color}60`,
                    }}
                  >
                    {result.type === 'event' ? '事件' : '朝代'}
                  </span>
                  <span className="truncate">{result.title}</span>
                </span>
                <span className="text-xs text-ink-500 font-serif shrink-0">
                  {result.year !== undefined && (
                    <>
                      {result.year < 0 ? `前${Math.abs(result.year)}` : result.year}
                      {result.endYear !== undefined && result.endYear !== result.year && (
                        <> – {result.endYear < 0 ? `前${Math.abs(result.endYear)}` : result.endYear}</>
                      )}
                    </>
                  )}
                </span>
              </div>
              {result.subtitle && (
                <div className="text-[11px] text-ink-500 ml-12 truncate">{result.subtitle}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 空结果提示 */}
      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-xs text-ink-500 z-50">
          没有匹配结果
        </div>
      )}
    </div>
  )
}