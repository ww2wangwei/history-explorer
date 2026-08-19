import { useMemo } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useCardsStore } from '@/store/useCardsStore'
import { useJumpToMap } from '@/hooks/useJumpToMap'
import { formatYear } from '@/utils/time'
import { bingImage, fallbackKeyword, cultureSearchKeywords } from '@/utils/geoImage'
import { summarizeEvent } from '@/utils/summarize'
import { CATEGORY_COLORS, type HistoricalEvent, type Era } from '@/types'
import eventsData from '@/data/events.json'
import erasData from '@/data/eras.json'
import { audioEngine } from '@/utils/audioEngine'

const events = eventsData as HistoricalEvent[]
const eras = erasData as Era[]

interface Props {
  eventId: string
}

export default function EventDetail({ eventId }: Props) {
  const selectEvent = useHistoryStore(s => s.selectEvent)
  const selectEra = useHistoryStore(s => s.selectEra)
  const setYear = useHistoryStore(s => s.setYear)
  const jumpToMap = useJumpToMap()
  const addCard = useCardsStore(s => s.addCard)
  const event = events.find(e => e.id === eventId)
  const existingCardId = useCardsStore(s => {
    for (const id in s.cards) {
      const c = s.cards[id]
      if (c.target.kind === 'event' && c.target.id === eventId) return id
    }
    return null
  })
  if (!event) return null

  // 关联朝代
  const relatedEra = event.relatedEraId ? eras.find(e => e.id === event.relatedEraId) : null

  // 相关事件：同区域、±30 年内、按重要性排序（排除自己）
  const relatedEvents = useMemo(() => {
    return events
      .filter(e =>
        e.id !== event.id &&
        e.region === event.region &&
        Math.abs(e.year - event.year) <= 30
      )
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5)
  }, [event])

  // 同时期其他地区的世界文明
  const contemporaryEras = useMemo(() => {
    return eras
      .filter(e =>
        e.region !== 'china' &&
        e.startYear <= event.year &&
        e.endYear >= event.year
      )
      .slice(0, 3)
  }, [event])

  // 聚焦到事件地点
  const focusOnMap = () => {
    if (!event) return
    if (!event.coordinates) return
    const kw = cultureSearchKeywords[event.id] ?? fallbackKeyword(event.title, event.category)
    jumpToMap(event.coordinates, event.title, 4, {
      coverImageUrl: bingImage(kw, 400, 240),
      snippet: summarizeEvent(event),
      reopenLabel: event.title,
      eventId: event.id,
    })
  }

  return (
    <div className="p-4 h-full overflow-y-auto scrollbar-thin">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div
            className="inline-block px-2 py-0.5 rounded-lg text-xs mb-2"
            style={{
              background: `${CATEGORY_COLORS[event.category]}20`,
              color: CATEGORY_COLORS[event.category],
              border: `1px solid ${CATEGORY_COLORS[event.category]}60`,
            }}
          >
            {event.category}
          </div>
          <h2 className="text-lg font-serif text-vermilion-300">{event.title}</h2>
          <div className="text-sm text-ink-500 mt-1 font-serif">{formatYear(event.year)}</div>
          {event.endYear !== undefined && (
            <div className="text-xs text-ink-500 mt-0.5">
              → {formatYear(event.endYear)}
            </div>
          )}
        </div>
        <button
          className="text-ink-500 hover:text-parchment-50 text-lg"
          onClick={() => { audioEngine.playModalClose(); selectEvent(null) }}
          title="关闭 (ESC)"
          aria-label="关闭"
        >
          ×
        </button>
      </div>

      <div className="text-sm leading-relaxed text-parchment-100 mb-4">
        {event.description}
      </div>

      <div className="flex gap-2 flex-wrap text-xs mb-4">
        <span className="px-2 py-1 rounded-lg bg-ink-700 text-ink-500">
          ⭐ 重要度 {event.importance}/3
        </span>
        {event.coordinates && (
          <button
            type="button"
            onClick={focusOnMap}
            className="px-2 py-1 rounded-lg bg-ink-700 text-ink-500 hover:bg-ink-600 hover:text-vermilion-300 transition-colors group inline-flex items-center gap-1"
            title="在地图上定位"
          >
            📍 {event.coordinates[1].toFixed(2)}°, {event.coordinates[0].toFixed(2)}°
            <span className="text-vermilion-300 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
          </button>
        )}
      </div>

      {/* 操作按钮组 */}
      <div className="flex gap-2 mb-4">
        <button
          className="flex-1 px-3 py-2 rounded-lg bg-vermilion-500/30 hover:bg-vermilion-500/50 border border-vermilion-500/40 text-vermilion-300 text-sm transition-colors"
          onClick={() => setYear(event.year)}
        >
          📅 定位时间轴
        </button>
        {event.coordinates && (
          <button
            className="flex-1 px-3 py-2 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-vermilion-300 text-sm transition-colors"
            onClick={focusOnMap}
          >
            🗺️ 聚焦地图
          </button>
        )}
        {existingCardId ? (
          <button
            className="flex-1 px-3 py-2 rounded-lg bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 text-sm cursor-not-allowed"
            disabled
            title="已在复习列表中"
          >
            ✓ 已加入复习
          </button>
        ) : (
          <button
            className="flex-1 px-3 py-2 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-vermilion-300 text-sm transition-colors"
            onClick={() => addCard({ kind: 'event', id: eventId })}
            title="加入间隔重复复习"
          >
            🎴 加入复习
          </button>
        )}
      </div>

      {/* 关联朝代 */}
      {relatedEra && (
        <div className="mb-4 border-t border-ink-600 pt-3">
          <div className="text-xs text-ink-500 mb-1.5">所属朝代</div>
          <button
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-ink-700 transition-colors flex items-center gap-2"
            onClick={() => selectEra(relatedEra.id)}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: relatedEra.color }}
            />
            <span className="flex-1 text-sm" style={{ color: relatedEra.color }}>
              {relatedEra.name}
            </span>
            <span className="text-xs text-ink-500">
              {relatedEra.startYear < 0 ? '前' + Math.abs(relatedEra.startYear) : relatedEra.startYear}
              {' ~ '}
              {relatedEra.endYear < 0 ? '前' + Math.abs(relatedEra.endYear) : relatedEra.endYear}
            </span>
          </button>
        </div>
      )}

      {/* 同时期其他文明 */}
      {contemporaryEras.length > 0 && (
        <div className="mb-4 border-t border-ink-600 pt-3">
          <div className="text-xs text-ink-500 mb-1.5">同时期其他文明</div>
          <div className="space-y-1">
            {contemporaryEras.map(era => (
              <button
                key={era.id}
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-ink-700 transition-colors flex items-center gap-2"
                onClick={() => selectEra(era.id)}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: era.color }}
                />
                <span className="flex-1 text-xs" style={{ color: era.color }}>
                  {era.name}
                </span>
                <span className="text-xs text-ink-500">
                  跳到 →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 🔗 因果关联（跨朝代故事线） */}
      {event.relatedEventIds && event.relatedEventIds.length > 0 && (() => {
        const linked = event.relatedEventIds
          .map(id => events.find(e => e.id === id))
          .filter(Boolean) as typeof events
        if (linked.length === 0) return null
        return (
          <div className="border-t border-ink-600 pt-3">
            <div className="text-xs text-amber-400 mb-1.5">🔗 因果关联（{linked.length}）</div>
            <div className="space-y-1">
              {linked.map(ev => (
                <button
                  key={ev.id}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-ink-700/60 transition-colors flex items-baseline gap-2 border border-dashed border-amber-700/40 hover:border-amber-500/80 group"
                  onClick={() => selectEvent(ev.id)}
                  title="点击查看事件详情"
                >
                  <span className="text-amber-400 text-xs shrink-0">→</span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0 translate-y-[-1px]"
                    style={{ background: CATEGORY_COLORS[ev.category] }}
                  />
                  <span className="text-xs text-ink-500 font-serif shrink-0 w-12">
                    {ev.year < 0 ? '前' + Math.abs(ev.year) : ev.year}
                  </span>
                  <span className="text-xs text-parchment-100 truncate flex-1">{ev.title}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })()}

      {/* 相关事件（同地区同时期） */}
      {relatedEvents.length > 0 && (
        <div className="border-t border-ink-600 pt-3">
          <div className="text-xs text-ink-500 mb-1.5">相关事件（附近 ±30 年）</div>
          <div className="space-y-1">
            {relatedEvents.map(ev => (
              <button
                key={ev.id}
                className="w-full text-left px-2 py-1.5 rounded-lg border border-transparent hover:border-vermilion-500/60 hover:bg-bronze-900/20 transition-colors flex items-baseline gap-2 group"
                onClick={() => selectEvent(ev.id)}
                title="点击查看事件详情"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 translate-y-[-1px]"
                  style={{ background: CATEGORY_COLORS[ev.category] }}
                />
                <span className="text-xs text-ink-500 font-serif shrink-0 w-12">
                  {ev.year < 0 ? '前' + Math.abs(ev.year) : ev.year}
                </span>
                <span className="text-xs text-parchment-100 truncate flex-1">{ev.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}