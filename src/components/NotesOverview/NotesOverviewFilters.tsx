/**
 * 笔记总览筛选：kind 三选一 chip + target 下拉
 *
 * kind: 全部 / 朝代 / 事件
 * target: 仅在 kind != 全部时启用，列出该 kind 下所有有笔记的朝代/事件
 */
import type { NoteTargetKind } from '@/types/notes'

export type KindFilter = 'all' | NoteTargetKind

interface Props {
  kind: KindFilter
  onKindChange: (k: KindFilter) => void
  /** 该 kind 下所有有笔记的 target 列表（带显示标题） */
  targetOptions: Array<{ id: string; title: string }>
  /** 当前 target id（'all' = 不筛选具体 target） */
  targetId: string
  onTargetChange: (id: string) => void
}

export default function NotesOverviewFilters({
  kind,
  onKindChange,
  targetOptions,
  targetId,
  onTargetChange,
}: Props) {
  const kindOptions: Array<{ value: KindFilter; label: string }> = [
    { value: 'all', label: '全部' },
    { value: 'era', label: '朝代' },
    { value: 'event', label: '事件' },
  ]

  const showTarget = kind !== 'all'

  return (
    <div className="space-y-2">
      {/* kind 三选一 chip */}
      <div className="flex items-center gap-1">
        {kindOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => onKindChange(opt.value)}
            className={`flex-1 px-3 py-1 text-xs rounded-lg transition-colors ${
              kind === opt.value
                ? 'bg-vermilion-500/40 text-vermilion-300 border border-vermilion-500/60'
                : 'bg-ink-700/60 text-ink-500 hover:bg-ink-700 hover:text-parchment-50 border border-ink-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* target 下拉（仅 kind 选中后显示） */}
      {showTarget && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-500 shrink-0">
            {kind === 'era' ? '朝代：' : '事件：'}
          </span>
          <select
            value={targetId}
            onChange={e => onTargetChange(e.target.value)}
            className="flex-1 px-2 py-1 text-xs bg-ink-700/60 border border-ink-600 rounded-lg text-parchment-50 focus:outline-none focus:border-vermilion-500/40"
          >
            <option value="all">全部{kind === 'era' ? '朝代' : '事件'}</option>
            {targetOptions.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.title}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}