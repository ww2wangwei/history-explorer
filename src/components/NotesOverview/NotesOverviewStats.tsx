/**
 * 笔记统计卡片
 *
 * 显示：总数、按朝代分组数、按事件分组数
 */
import type { Note } from '@/types/notes'

interface Props {
  notes: Note[]
}

export default function NotesOverviewStats({ notes }: Props) {
  const eraCount = notes.filter(n => n.target.kind === 'era').length
  const eventCount = notes.filter(n => n.target.kind === 'event').length

  // 按 target.id 分组（仅显示 top 5）
  const topTargets = (() => {
    const map = new Map<string, { kind: Note['target']['kind']; count: number }>()
    notes.forEach(n => {
      const k = n.target.id
      if (!map.has(k)) map.set(k, { kind: n.target.kind, count: 0 })
      map.get(k)!.count += 1
    })
    return Array.from(map.entries())
      .map(([id, info]) => ({ id, ...info }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  })()

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-baseline gap-1.5">
        <span className="text-ink-500">共</span>
        <span className="text-bronze-400 text-lg font-serif tabular-nums">{notes.length}</span>
        <span className="text-ink-500">条</span>
      </div>
      <span className="text-ink-600">·</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-ink-500">朝代</span>
        <span className="text-parchment-50 tabular-nums">{eraCount}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-ink-500">事件</span>
        <span className="text-parchment-50 tabular-nums">{eventCount}</span>
      </div>
      {topTargets.length > 0 && (
        <span className="text-ink-600">·</span>
      )}
      {topTargets.slice(0, 3).map((t, i) => (
        <span key={t.id} className="text-ink-500">
          {i > 0 && <span className="text-ink-600 mx-1">/</span>}
          <span className="text-parchment-100">{t.kind === 'era' ? '朝代' : '事件'}</span>
          <span className="ml-0.5 text-ink-500">×{t.count}</span>
        </span>
      ))}
    </div>
  )
}