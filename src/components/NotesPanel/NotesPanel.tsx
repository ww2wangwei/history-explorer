/**
 * 笔记面板主容器
 *
 * 状态机：列表态 ↔ 编辑态
 * - 列表态：空时显示 EmptyState；非空显示 NoteList
 * - 编辑态：NoteEditor（note 为 null 表示新建）
 *
 * 数据：从 useNotesStore 实时读取（store 用 Zustand 订阅，notes 变化时自动重渲染）
 */
import { useMemo, useState } from 'react'
import type { Note, NoteTargetKind } from '@/types/notes'
import { useNotesStore } from '@/store/useNotesStore'
import NoteList from './NoteList'
import NoteEditor from './NoteEditor'
import EmptyState from './EmptyState'

interface Props {
  kind: NoteTargetKind
  targetId: string
}

export default function NotesPanel({ kind, targetId }: Props) {
  // 订阅 notes 字典，确保新增/删除时重渲染
  const notesMap = useNotesStore(s => s.notes)
  const addNote = useNotesStore(s => s.addNote)
  const deleteNote = useNotesStore(s => s.deleteNote)

  // 过滤 + 排序（按 updatedAt desc）
  const notes = useMemo<Note[]>(() => {
    return Object.values(notesMap)
      .filter(n => n.target.kind === kind && n.target.id === targetId)
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }, [notesMap, kind, targetId])

  // 编辑态：当前编辑的笔记 ID（null 表示新建但未保存）
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)

  // 派生当前编辑的 Note 对象
  const editingNote = useMemo<Note | null>(() => {
    if (editingId === 'new' || editingId === null) return null
    return notesMap[editingId] ?? null
  }, [editingId, notesMap])

  /** 进入编辑态：现有笔记 */
  const handleEdit = (id: string) => setEditingId(id)

  /** 进入编辑态：新建笔记 */
  const handleCreate = () => {
    const newId = addNote({ kind, id: targetId })
    setEditingId(newId)
  }

  /** 删除笔记（从 store 删除，不离开编辑态——NoteEditor 自己会关闭） */
  const handleDelete = (id: string) => {
    deleteNote(id)
    if (editingId === id) setEditingId(null)
  }

  /** 返回列表态 */
  const handleCloseEditor = () => setEditingId(null)

  // 编辑态
  if (editingId !== null) {
    return (
      <NoteEditor
        note={editingNote}
        onClose={handleCloseEditor}
        onDelete={handleDelete}
      />
    )
  }

  // 列表态
  if (notes.length === 0) {
    return <EmptyState kind={kind} onCreate={handleCreate} />
  }

  return (
    <NoteList
      notes={notes}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}