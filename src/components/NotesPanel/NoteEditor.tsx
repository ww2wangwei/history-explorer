/**
 * 笔记编辑器
 *
 * - 写作模式：textarea + 标题输入
 * - 预览模式：NotePreview 渲染 Markdown
 * - 自动保存：600ms debounce 调 updateNote
 * - 强制 flush：卸载时、切换笔记前、关闭面板时
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Note } from '@/types/notes'
import { useNotesStore } from '@/store/useNotesStore'
import NotePreview from './NotePreview'
import { formatRelativeTime } from '@/utils/relativeTime'

interface Props {
  /** 要编辑的笔记（null 表示新建） */
  note: Note | null
  /** 保存后的回调（用于切换回列表态） */
  onClose: () => void
  /** 删除笔记的回调 */
  onDelete?: (id: string) => void
}

/** 简易 debounce + flush + cancel */
function createDebouncer<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, delay)
  }

  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
      if (lastArgs) fn(...lastArgs)
    }
  }
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    lastArgs = null
  }

  return debounced
}

type Mode = 'write' | 'preview'

export default function NoteEditor({ note, onClose, onDelete }: Props) {
  const updateNote = useNotesStore(s => s.updateNote)
  const deleteNote = useNotesStore(s => s.deleteNote)

  const isNew = note === null
  const noteId = note?.id ?? null

  // 本地草稿 state
  const [draft, setDraft] = useState({
    title: note?.title ?? '',
    content: note?.content ?? '',
  })
  const [mode, setMode] = useState<Mode>('write')
  const [fullscreenPreview, setFullscreenPreview] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(note?.updatedAt ?? null)

  // 全屏预览 ESC 退出
  useEffect(() => {
    if (!fullscreenPreview) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreenPreview(false) }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [fullscreenPreview])

  // 切换笔记时重置 draft（新建时进入空草稿，编辑时进入原内容）
  useEffect(() => {
    setDraft({
      title: note?.title ?? '',
      content: note?.content ?? '',
    })
    setSavedAt(note?.updatedAt ?? Date.now())
    setMode('write')
  }, [noteId])

  // 600ms debounce 自动保存
  const debouncedSave = useMemo(
    () =>
      createDebouncer((patch: { title: string; content: string }) => {
        if (!noteId) return
        updateNote(noteId, patch)
        setSavedAt(Date.now())
      }, 600),
    [noteId, updateNote],
  )

  // 草稿变化 → 触发 debounce 保存
  useEffect(() => {
    if (isNew) return
    debouncedSave(draft)
  }, [draft, debouncedSave, isNew])

  // 卸载时强制 flush（避免切走时丢未保存内容）
  useEffect(() => {
    return () => {
      debouncedSave.flush()
    }
  }, [debouncedSave])

  // 30s 刷新"相对时间"显示
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  /** 保存并关闭（手动触发，确保最新内容写入） */
  const handleSaveAndClose = () => {
    if (noteId) {
      updateNote(noteId, draft)
      setSavedAt(Date.now())
    }
    onClose()
  }

  /** 删除笔记 */
  const handleDelete = () => {
    if (!noteId) return
    if (window.confirm('确认删除这条笔记？此操作不可撤销。')) {
      deleteNote(noteId)
      onDelete?.(noteId)
      onClose()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 顶部：模式切换 + 操作 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-ink-600 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode('write')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              mode === 'write'
                ? 'bg-bronze-600/40 text-bronze-400'
                : 'text-ink-500 hover:bg-ink-700 hover:text-parchment-50'
            }`}
          >
            ✏️ 写作
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              mode === 'preview'
                ? 'bg-bronze-600/40 text-bronze-400'
                : 'text-ink-500 hover:bg-ink-700 hover:text-parchment-50'
            }`}
          >
            👁️ 预览
          </button>
          {mode === 'preview' && (
            <button
              onClick={() => setFullscreenPreview(f => !f)}
              className="text-xs px-2 py-0.5 rounded-lg text-ink-400 hover:text-bronze-300 hover:bg-ink-700"
              title={fullscreenPreview ? '退出全屏 (Esc)' : '全屏专注阅读'}
            >
              {fullscreenPreview ? '⊗ 退出' : '↗ 全屏'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="text-xs text-ink-500">
              ✓ 已保存 · {formatRelativeTime(savedAt)}
            </span>
          )}
          {noteId && (
            <button
              onClick={handleDelete}
              className="px-2 py-1 text-ink-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
              title="删除笔记"
              aria-label="删除笔记"
            >
              🗑
            </button>
          )}
          <button
            onClick={handleSaveAndClose}
            className="px-2.5 py-1 rounded-lg bg-ink-700 hover:bg-ink-600 text-bronze-400 border border-ink-600"
          >
            ← 返回列表
          </button>
        </div>
      </div>

      {/* 标题输入（仅写作模式） */}
      {mode === 'write' && (
        <input
          type="text"
          value={draft.title}
          onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
          placeholder="笔记标题（可空）"
          className="mx-3 mt-3 px-3 py-2 bg-ink-700/60 border border-ink-600 rounded-lg text-sm text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500"
        />
      )}

      {/* 内容区 */}
      <div className="flex-1 overflow-hidden px-3 py-3">
        {mode === 'write' ? (
          <textarea
            value={draft.content}
            onChange={e => setDraft(d => ({ ...d, content: e.target.value }))}
            placeholder={`支持 Markdown + GFM

## 标题
**粗体** *斜体* [链接](https://example.com)

- 列表项
- [x] 任务列表
- [ ] 未完成

> 引用块

| 列1 | 列2 |
| --- | --- |
| a   | b   |`}
            className="w-full h-full min-h-[260px] max-h-[480px] px-3 py-2 bg-ink-700/60 border border-ink-600 rounded-lg text-sm text-parchment-50 placeholder-ink-500 font-mono leading-relaxed resize-none focus:outline-none focus:border-bronze-500"
          />
        ) : (
          <div className={`h-full min-h-[260px] max-h-[480px] overflow-y-auto scrollbar-thin px-3 py-2 bg-ink-700/40 border border-ink-600 rounded-lg ${fullscreenPreview ? 'fixed inset-0 z-60 max-h-none min-h-0 px-12 py-12 border-0 rounded-none bg-ink-900' : ''}`}>
            {fullscreenPreview && (
              <button
                onClick={() => setFullscreenPreview(false)}
                className="fixed top-4 right-4 z-[80] px-3 py-1.5 rounded-lg bg-ink-800/90 hover:bg-ink-700 border border-bronze-500/60 text-bronze-300 text-sm flex items-center gap-1.5 shadow-lg"
                title="退出全屏 (Esc)"
                aria-label="退出全屏"
              >
                <span>⊗</span> 退出全屏
              </button>
            )}
            <NotePreview content={draft.content} />
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="px-3 py-1.5 border-t border-ink-600 text-xs text-ink-500 flex justify-between">
        <span>{draft.content.length} 字</span>
        <span>Markdown · GFM</span>
      </div>
    </div>
  )
}