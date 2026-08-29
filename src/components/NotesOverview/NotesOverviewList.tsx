/**
 * 笔记总览列表
 *
 * - 顶部：「＋ 新建笔记」按钮（仅当 canCreate 时启用，否则禁用提示）
 * - 中间：笔记卡片列表（点击卡片进入编辑；徽章点击跳转）
 * - 空状态：无笔记 / 搜索无结果
 */
import type { Note } from '@/types/notes'
import NotesOverviewItem from './NotesOverviewItem'
import EmptyState from '@/components/ui/EmptyState'

interface Props {
  notes: Note[]
  totalCount: number
  hasFilter: boolean
  onEdit: (id: string) => void
  onJump: (note: Note) => void
  onDelete: (id: string) => void
  onCreate: () => void
  canCreate: boolean
  /** 编辑态下的紧凑模式（条目变小） */
  compact?: boolean
  /** 当前正在编辑的笔记 ID（用于高亮） */
  activeNoteId?: string | null
  /** 搜索关键词（用于高亮匹配） */
  query?: string
}

export default function NotesOverviewList({
  notes,
  totalCount,
  hasFilter,
  onEdit,
  onJump,
  onDelete,
  onCreate,
  canCreate,
  compact = false,
  activeNoteId = null,
  query = '',
}: Props) {
  // 空状态：完全没笔记
  if (totalCount === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <EmptyState
          emoji="📒"
          title="还没有任何笔记"
          hint="在朝代详情或事件详情页，点击「📝 笔记」标签页可开始记录你的理解、疑问和感悟。"
        />
      </div>
    )
  }

  // 空状态：有笔记但被过滤掉了
  if (notes.length === 0 && hasFilter) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <EmptyState
          emoji="🔍"
          title="没找到匹配的笔记"
          hint="尝试调整搜索关键词或筛选条件"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3">
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <span className="text-xs text-ink-300">
          显示 <span className="text-vermilion-300">{notes.length}</span> / {totalCount} 条
        </span>
        <button
          onClick={onCreate}
          disabled={!canCreate}
          className={`px-3 py-1 rounded-lg text-xs transition-colors ${
            canCreate
              ? 'bg-vermilion-500/30 hover:bg-vermilion-500/50 border border-vermilion-500/40 text-vermilion-300'
              : 'bg-ink-700/60 border border-ink-600 text-ink-300 cursor-not-allowed'
          }`}
          title={canCreate ? '新建笔记' : '请先在上方筛选区选择具体朝代或事件'}
        >
          ＋ 新建笔记
        </button>
      </div>
      <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
        {notes.map(note => (
          <NotesOverviewItem
            key={note.id}
            note={note}
            onEdit={onEdit}
            onJump={onJump}
            onDelete={onDelete}
            compact={compact}
            active={note.id === activeNoteId}
            query={query}
          />
        ))}
      </div>
    </div>
  )
}