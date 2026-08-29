/**
 * 笔记总览列表项
 *
 * 显示：📍 朝代/事件名 徽章 + 标题 + 摘要 + 相对时间
 * 交互：
 *   - 整卡点击 → onEdit（进入编辑态）
 *   - 徽章点击 → onJump（跳转回原朝代/事件，stopPropagation）
 *   - 删除按钮 → onDelete
 * hover 显示：删除按钮 + 铅笔图标（提示点击是编辑）
 *
 * query 不为空时，标题和摘要里匹配的关键词会用 <mark> 高亮
 */
import type { Note } from '@/types/notes'
import {
  formatRelativeTime,
  getNoteDisplayTitle,
  getNoteExcerpt,
} from '@/utils/relativeTime'
import { getTargetTitle, getTargetColor, isTargetMissing } from '@/utils/lookups'
import { highlightText } from '@/utils/highlight'

interface Props {
  note: Note
  onEdit: (id: string) => void
  onJump: (note: Note) => void
  onDelete: (id: string) => void
  compact?: boolean
  active?: boolean
  /** 搜索关键词（用于高亮） */
  query?: string
}

export default function NotesOverviewItem({
  note,
  onEdit,
  onJump,
  onDelete,
  compact = false,
  active = false,
  query = '',
}: Props) {
  const title = getNoteDisplayTitle(note.title, note.content)
  const excerpt = getNoteExcerpt(note.content, 80)
  const targetTitle = getTargetTitle(note.target.kind, note.target.id)
  const targetColor = getTargetColor(note.target.kind, note.target.id)
  const missing = isTargetMissing(note.target.kind, note.target.id)

  const kindLabel = note.target.kind === 'era' ? '朝代' : '事件'

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('确认删除这条笔记？此操作不可撤销。')) {
      onDelete(note.id)
    }
  }

  const handleJumpClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!missing) onJump(note)
  }

  return (
    <div
      onClick={() => onEdit(note.id)}
      className={`group rounded-lg border px-4 py-3 transition-colors cursor-pointer ${
        compact ? 'py-2' : 'py-3'
      } ${
        active
          ? 'bg-vermilion-500/20 border-vermilion-500/60 ring-1 ring-vermilion-500/40'
          : missing
          ? 'bg-ink-700/20 border-ink-600 opacity-60'
          : 'bg-ink-700/40 border-ink-600 hover:bg-ink-700/70 hover:border-vermilion-500/40'
      }`}
      title={active ? '当前编辑中' : '点击编辑'}
    >
      {/* 顶部徽章 + 时间 + 删除 + 编辑图标 */}
      <div className={`flex items-center justify-between gap-2 ${compact ? 'mb-1' : 'mb-1.5'}`}>
        <button
          onClick={handleJumpClick}
          disabled={missing}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium border transition-opacity ${
            missing
              ? 'cursor-not-allowed'
              : 'hover:opacity-80 cursor-pointer'
          }`}
          style={{
            background: targetColor ? `${targetColor}20` : 'rgba(90, 81, 66, 0.3)',
            borderColor: targetColor ? `${targetColor}80` : 'rgba(90, 81, 66, 0.5)',
            color: targetColor ?? '#a8a094',
          }}
          title={missing ? '原' + kindLabel + '已删除' : '跳转到原' + kindLabel}
        >
          <span>📍</span>
          <span>{targetTitle}</span>
          <span className="opacity-60">· {kindLabel}</span>
        </button>
        <div className="flex items-center gap-1">
          <span className="text-xs text-ink-300">
            {formatRelativeTime(note.updatedAt)}
          </span>
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 text-ink-300 hover:text-red-400 hover:bg-red-900/30 rounded-lg text-xs transition-all"
            aria-label="删除笔记"
            title="删除笔记"
          >
            🗑
          </button>
          <span
            className="opacity-0 group-hover:opacity-100 text-vermilion-300 text-sm transition-all"
            title="点击编辑"
          >
            ✏️
          </span>
        </div>
      </div>

      {/* 标题 */}
      <div className={`font-serif text-parchment-50 leading-relaxed ${compact ? 'text-xs' : 'text-sm'} mb-1`}>
        {highlightText(title, query)}
      </div>

      {/* 摘要（compact 模式下隐藏） */}
      {!compact && (
        <div className="text-xs text-ink-300 line-clamp-2 leading-relaxed">
          {highlightText(excerpt, query)}
        </div>
      )}
    </div>
  )
}