import { useState, useMemo, useRef, useEffect } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'
import { formatYear } from '@/utils/time'
import type { Era } from '@/types'
import erasData from '@/data/eras.json'

const eras = erasData as Era[]

/**
 * 时间机器：朝代名快捷跳转
 * - 点击朝代名 → 跳到该朝代中心年（自动设置 timelineCenterYear）
 * - 显示下拉列表，所有朝代按时间排序
 */
export default function TimeMachine() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const { setYear, setTimelineView } = useHistoryStore()

  // 按时间排序的朝代
  const sortedEras = useMemo(
    () => eras.slice().sort((a, b) => a.startYear - b.startYear),
    []
  )

  // 过滤后的朝代
  const filteredEras = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sortedEras
    return sortedEras.filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.shortDesc?.toLowerCase().includes(q) ?? false)
    )
  }, [query, sortedEras])

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

  // 跳转到朝代中心
  const jumpToEra = (era: Era) => {
    const centerYear = Math.round((era.startYear + era.endYear) / 2)
    setYear(centerYear)
    // 同时把时间轴中心移过去（这样时间轴视图也跟着聚焦）
    setTimelineView(centerYear, 1.5)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="px-3 py-1.5 rounded-lg bg-ink-700/80 hover:bg-ink-600 border border-ink-600 text-bronze-400 text-xs flex items-center gap-1.5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        title="时间机器：跳转到特定朝代"
      >
        <span>⏳</span>
        <span>时间机器</span>
        <span className="text-[8px] text-ink-500">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 max-h-96 bg-ink-800 border border-ink-600 rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col">
          {/* 搜索框 */}
          <div className="p-2 border-b border-ink-700">
            <input
              type="text"
              placeholder="搜索朝代名（如：唐、宋、罗马、阿拉伯）..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full px-2 py-1.5 rounded-lg bg-ink-700 border border-ink-600 text-xs text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500"
            />
          </div>

          {/* 朝代列表 */}
          <div className="overflow-y-auto scrollbar-thin flex-1">
            {filteredEras.length === 0 ? (
              <div className="p-3 text-xs text-ink-500 text-center">没有匹配的朝代</div>
            ) : (
              filteredEras.map(era => (
                <button
                  key={era.id}
                  className="w-full text-left px-3 py-2 hover:bg-ink-700 border-b border-ink-700 last:border-b-0 transition-colors"
                  onClick={() => jumpToEra(era)}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: era.color }}
                      />
                      <span className="text-sm text-parchment-50">{era.name}</span>
                      <span className="text-[9px] text-ink-500 uppercase">
                        {era.region === 'china' ? '中国' : era.region}
                      </span>
                    </span>
                    <span className="text-xs text-ink-500 font-serif shrink-0">
                      {era.startYear < 0 ? '前' + Math.abs(era.startYear) : era.startYear}
                      {' ~ '}
                      {era.endYear < 0 ? '前' + Math.abs(era.endYear) : era.endYear}
                    </span>
                  </div>
                  {era.shortDesc && (
                    <div className="text-xs text-ink-500 ml-4 truncate">{era.shortDesc}</div>
                  )}
                </button>
              ))
            )}
          </div>

          {/* 提示 */}
          <div className="px-3 py-1.5 border-t border-ink-700 text-xs text-ink-500 bg-ink-900/50">
            💡 点击朝代跳转到该朝代鼎盛时期
          </div>
        </div>
      )}
    </div>
  )
}