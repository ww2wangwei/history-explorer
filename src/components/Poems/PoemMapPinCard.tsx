/**
 * 地图上的诗词图钉卡 — Layout 顶层 Portal 渲染
 *
 * 当 pendingReopen.kind === 'poem' 时，在地图右上角显示一个简介卡片：
 *   诗题 / 作者 / 朝代 / 写作地 / 创作背景 / 回到全诗词按钮 / 关闭按钮
 *
 * 数据流：
 *   PoemDetailDialog 「🗺️ 在地图上查看」按钮
 *     → useJumpToMap([lng,lat], label, zoom, {reopenKind:'poem', poemId})
 *     → useHistoryStore.pendingReopen = { kind:'poem', poemId }
 *   本组件读 poemsData[poemId]，渲染
 *   用户点 × 或「← 返回」→ 清 pendingReopen
 */
import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import poemsData from '@/data/poems.json'
import type { Poem } from '@/types/poems'
import { useHistoryStore } from '@/store/useHistoryStore'

const poemsById = new Map<string, Poem>((poemsData.poems as Poem[]).map(p => [p.id, p]))

interface Props {
  /** 跳转到"全诗词"模块（来自 history:go-poems 事件 → dispatcher 用） */
  onJumpToAllPoems: () => void
}

export default function PoemMapPinCard({ onJumpToAllPoems }: Props) {
  const pending = useHistoryStore(s => s.pendingReopen)
  const setPendingReopen = useHistoryStore(s => s.setPendingReopen)

  const poem = useMemo(() => {
    if (pending?.kind !== 'poem') return null
    return poemsById.get(pending.poemId) ?? null
  }, [pending])

  // ESC 关闭
  useEffect(() => {
    if (!poem) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPendingReopen(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [poem, setPendingReopen])

  if (!poem) return null

  // 图钉强调色（来自 poem.palette.accent）
  const accent = poem.palette.accent

  return createPortal(
    <div
      className="fixed top-16 right-4 z-40 w-80 max-w-[calc(100vw-32px)] rounded-lg border bg-ink-800/95 backdrop-blur shadow-2xl overflow-hidden"
      style={{ borderColor: accent + '88' }}
      role="dialog"
      aria-label={`${poem.title} — ${poem.geoLabel || '创作地'}`}
    >
      {/* 头部 —— 写景渐变 */}
      <div
        className="px-4 pt-3 pb-3"
        style={{
          background: `linear-gradient(135deg, ${poem.palette.from}cc 0%, ${poem.palette.to}cc 100%)`,
        }}
      >
        <div className="flex items-start gap-2">
          <span className="text-2xl flex-shrink-0 drop-shadow">{poem.motif}</span>
          <div className="flex-1 min-w-0">
            <div className="font-serif text-base text-parchment-50 drop-shadow truncate">
              《{poem.title}》
            </div>
            <div className="text-xs text-parchment-50/85 mt-0.5">
              {poem.author} · {poem.dynasty}
            </div>
          </div>
          <button
            onClick={() => setPendingReopen(null)}
            className="text-parchment-50/85 hover:text-parchment-50 text-base leading-none w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-900/50"
            title="关闭 (ESC)"
            aria-label="关闭"
          >
            ×
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div className="px-4 py-3 space-y-2.5">
        <div className="text-xs">
          <span
            className="inline-block text-[10px] px-1.5 py-0.5 rounded mr-2"
            style={{ background: accent + '25', color: accent }}
          >
            📍 创作地
          </span>
          <span className="text-parchment-50">{poem.geoLabel ?? '未知'}</span>
          {poem.geo && (
            <span className="text-ink-300 ml-1.5 tabular-nums">
              [{poem.geo[0].toFixed(2)}, {poem.geo[1].toFixed(2)}]
            </span>
          )}
        </div>
        <div className="text-xs text-parchment-50/90 leading-relaxed line-clamp-5">
          {poem.background}
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex border-t border-ink-700 text-xs">
        <button
          onClick={() => {
            setPendingReopen(null)
            onJumpToAllPoems()
          }}
          className="flex-1 py-2 text-vermilion-300 hover:bg-ink-700/80 transition-colors border-r border-ink-700"
        >
          ← 返回全诗词
        </button>
        <button
          onClick={() => setPendingReopen(null)}
          className="flex-1 py-2 text-ink-400 hover:bg-ink-700/80 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>,
    document.body,
  )
}
