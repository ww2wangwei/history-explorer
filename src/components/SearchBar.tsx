import { useState } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'
import { CATEGORY_COLORS } from '@/types'
import { audioEngine } from '@/utils/audioEngine'
// 🎯 性能优化：搜索改用 Web Worker，后台线程过滤，主线程不卡
import { useSearchWorker, type SearchResultItem } from '@/hooks/useSearchWorker'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { setYear, selectEvent, selectEra } = useHistoryStore()
  const { results: allResults, ready, durationMs } = useSearchWorker(query, 20)

  // 只渲染朝代 + 事件（人物结果可在其他地方展示）
  const results = allResults.filter(r => r.type === 'era' || r.type === 'event').slice(0, 15)

  const handleSelect = (result: SearchResultItem) => {
    if (result.year !== undefined) {
      setYear(result.year)
    }
    if (result.type === 'event') {
      selectEvent(result.id)
    } else {
      selectEra(result.id)
    }
    audioEngine.playSelect()
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative w-40 md:w-52 xl:w-72">
      <div className="relative">
        <input
          type="text"
          placeholder={ready ? '搜索事件、朝代...' : '加载搜索索引...'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full px-3 py-1.5 pl-8 rounded-lg bg-ink-700 border border-ink-600 text-sm text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-vermilion-500/40"
        />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500 text-sm">
          🔍
        </span>
      </div>

      {/* 下拉结果 */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto bg-ink-800 border border-ink-600 rounded-lg shadow-2xl z-50 scrollbar-thin">
          {results.map(result => {
            const color = result.color ?? (result.type === 'event' ? CATEGORY_COLORS.政治 : '#c89a5b')
            return (
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
                        background: `${color}20`,
                        color: color,
                        border: `1px solid ${color}60`,
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
            )
          })}
        </div>
      )}

      {/* 空结果提示 */}
      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-xs text-ink-500 z-50 flex items-center justify-between">
          <span>没有匹配结果</span>
          {durationMs !== null && <span className="text-ink-700">· {durationMs}ms</span>}
        </div>
      )}
    </div>
  )
}