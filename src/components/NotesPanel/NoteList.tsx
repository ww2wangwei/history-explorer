/**
 * 笔记列表
 *
 * 列出当前目标的所有笔记，提供「+ 新建笔记」按钮
 */
import type { Note } from '@/types/notes'
import NoteCard from './NoteCard'

interface Props {
  notes: Note[]
  onCreate: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function NoteList({ notes, onCreate, onEdit, onDelete }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* 顶部：新建按钮 + 计数 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-ink-600 text-xs">
        <span className="text-ink-300">
          共 <span className="text-vermilion-300">{notes.length}</span> 条笔记
        </span>
        <button
          onClick={onCreate}
          className="px-3 py-1 rounded-lg bg-vermilion-500/30 hover:bg-vermilion-500/50 border border-vermilion-500/40 text-vermilion-300 transition-colors"
        >
          ＋ 新建笔记
        </button>
      </div>

      {/* 列表区 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-2">
        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}