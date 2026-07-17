/**
 * 个人笔记 store
 *
 * 与 useHistoryStore（UI/会话状态）分离，笔记是个人数据，生命周期独立。
 * 通过 zustand persist 中间件写入 localStorage。
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Note, NoteTargetKind } from '@/types/notes'

interface NotesState {
  /** 按 noteId 索引的笔记字典 */
  notes: Record<string, Note>

  /** 新建笔记，返回新 noteId */
  addNote: (
    target: { kind: NoteTargetKind; id: string },
    initial?: { title?: string; content?: string },
  ) => string

  /** 更新笔记字段（仅支持 title / content，自动更新 updatedAt） */
  updateNote: (
    id: string,
    patch: Partial<Pick<Note, 'title' | 'content'>>,
  ) => void

  /** 删除笔记 */
  deleteNote: (id: string) => void

  // ---------- 查询（不带订阅，避免冗余）----------

  /** 取单条笔记 */
  getNote: (id: string) => Note | undefined
  /** 取某目标（朝代/事件）的所有笔记，按 updatedAt desc */
  getNotesForTarget: (kind: NoteTargetKind, targetId: string) => Note[]
  /** 取全部笔记，按 updatedAt desc */
  getAllNotes: () => Note[]
}

/** 生成唯一 ID：现代浏览器优先用 crypto.randomUUID，降级到时间戳 + 随机数 */
function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: {},

      addNote: (target, initial = {}) => {
        const now = Date.now()
        const id = genId()
        const note: Note = {
          id,
          target,
          title: initial.title ?? '',
          content: initial.content ?? '',
          createdAt: now,
          updatedAt: now,
        }
        set(s => ({ notes: { ...s.notes, [id]: note } }))
        return id
      },

      updateNote: (id, patch) =>
        set(s => {
          const existing = s.notes[id]
          if (!existing) return s
          return {
            notes: {
              ...s.notes,
              [id]: { ...existing, ...patch, updatedAt: Date.now() },
            },
          }
        }),

      deleteNote: id =>
        set(s => {
          if (!s.notes[id]) return s
          const { [id]: _removed, ...rest } = s.notes
          return { notes: rest }
        }),

      getNote: id => get().notes[id],

      getNotesForTarget: (kind, targetId) =>
        Object.values(get().notes)
          .filter(n => n.target.kind === kind && n.target.id === targetId)
          .sort((a, b) => b.updatedAt - a.updatedAt),

      getAllNotes: () =>
        Object.values(get().notes).sort((a, b) => b.updatedAt - a.updatedAt),
    }),
    {
      name: 'history-explorer:notes:v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // 只持久化笔记数据，临时 state 不写盘
      partialize: state => ({ notes: state.notes }),
      // 未来 schema 变更时可在此处理迁移
      migrate: (persisted, _fromVersion) => persisted as NotesState,
    },
  ),
)