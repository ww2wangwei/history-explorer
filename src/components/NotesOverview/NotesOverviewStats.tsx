/**
 * 笔记统计卡片
 *
 * 显示：总数、按朝代分组数、按事件分组数
 */
import type { Note } from '@/types/notes'

interface Props {
  notes: Note[]
  onExport?: () => void
  onImport?: () => void
}

export default function NotesOverviewStats({ notes, onExport, onImport }: Props) {
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
    <div className="flex items-center gap-4 text-xs px-5 py-2 border-b border-ink-600">
      <div className="flex items-center gap-4 flex-1 min-w-0">
      <div className="flex items-baseline gap-1.5">
        <span className="text-ink-300">共</span>
        <span className="text-vermilion-300 text-lg font-serif tabular-nums">{notes.length}</span>
        <span className="text-ink-300">条</span>
      </div>
      <span className="text-ink-400">·</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-ink-300">朝代</span>
        <span className="text-parchment-50 tabular-nums">{eraCount}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-ink-300">事件</span>
        <span className="text-parchment-50 tabular-nums">{eventCount}</span>
      </div>
      {topTargets.length > 0 && (
        <span className="text-ink-400">·</span>
      )}
      {topTargets.slice(0, 3).map((t, i) => (
        <span key={t.id} className="text-ink-300">
          {i > 0 && <span className="text-ink-400 mx-1">/</span>}
          <span className="text-parchment-50">{t.kind === 'era' ? '朝代' : '事件'}</span>
          <span className="ml-0.5 text-ink-300">×{t.count}</span>
        </span>
      ))}
      </div>
      {(onExport || onImport) && (
        <div className="flex items-center gap-1.5 shrink-0">
          {onImport && (
            <button
              onClick={onImport}
              className="px-2 py-1 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 hover:text-parchment-50 transition-colors"
              title="从 JSON 文件导入笔记"
            >
              ⬆ 导入
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="px-2 py-1 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 hover:text-parchment-50 transition-colors"
              title="导出所有笔记为 JSON"
            >
              ⬇ 导出
            </button>
          )}
        </div>
      )}
    </div>
  )
}