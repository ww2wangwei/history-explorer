/**
 * 笔记列表项卡片
 *
 * 显示标题 / 摘要 / 相对更新时间
 * 提供编辑（点击卡片本体）和删除按钮
 */
import type { Note } from '@/types/notes'
import {
  formatRelativeTime,
  getNoteDisplayTitle,
  getNoteExcerpt,
} from '@/utils/relativeTime'

interface Props {
  note: Note
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function NoteCard({ note, onEdit, onDelete }: Props) {
  const title = getNoteDisplayTitle(note.title, note.content)
  const excerpt = getNoteExcerpt(note.content, 60)

  return (
    <div
      className="group rounded-lg border border-ink-600 bg-ink-700/40 hover:bg-ink-700/70 hover:border-vermilion-500/40 transition-colors cursor-pointer"
      onClick={() => onEdit(note.id)}
    >
      <div className="flex items-start justify-between gap-2 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <div className="font-serif text-sm text-parchment-50 truncate">
            {title}
          </div>
          <div className="text-xs text-ink-300 mt-1 line-clamp-2 leading-relaxed">
            {excerpt}
          </div>
          <div className="text-xs text-ink-400 mt-1.5">
            {formatRelativeTime(note.updatedAt)}
          </div>
        </div>
        <button
          onClick={e => {
            e.stopPropagation()
            if (window.confirm('确认删除这条笔记？此操作不可撤销。')) {
              onDelete(note.id)
            }
          }}
          className="opacity-0 group-hover:opacity-100 px-2 py-1 text-ink-300 hover:text-red-400 hover:bg-red-900/30 rounded-lg text-xs transition-all"
          aria-label="删除笔记"
          title="删除"
        >
          🗑
        </button>
      </div>
    </div>
  )
}