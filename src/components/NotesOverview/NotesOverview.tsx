/**
 * 笔记总览顶层组件（支持两种 variant）
 */
import { useEffect, useMemo, useState } from 'react'
import type { Note, NoteTargetKind } from '@/types/notes'
import { useNotesStore } from '@/store/useNotesStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { getTargetTitle, getTargetYear } from '@/utils/lookups'
import NotesOverviewHeader from './NotesOverviewHeader'
import NotesOverviewSearch from './NotesOverviewSearch'
import NotesOverviewFilters, { type KindFilter } from './NotesOverviewFilters'
import NotesOverviewList from './NotesOverviewList'
import NotesOverviewStats from './NotesOverviewStats'
import NoteEditor from '@/components/NotesPanel/NoteEditor'
import {
  downloadNotesJson,
  parseNotesJson,
  applyImport,
  countConflicts,
} from '@/utils/notesIO'

type Variant = 'drawer' | 'page'

interface Props {
  variant: Variant
  isOpen?: boolean
  isActive?: boolean
  onClose: () => void
}

type OverviewMode = 'list' | 'edit'

export default function NotesOverview({ variant, isOpen, isActive, onClose }: Props) {
  const notesMap = useNotesStore(s => s.notes)
  const addNote = useNotesStore(s => s.addNote)
  const deleteNote = useNotesStore(s => s.deleteNote)
  const selectEvent = useHistoryStore(s => s.selectEvent)
  const selectEra = useHistoryStore(s => s.selectEra)
  const setYear = useHistoryStore(s => s.setYear)
  const setTimelineView = useHistoryStore(s => s.setTimelineView)
  const setDetailView = useHistoryStore(s => s.setDetailView)

  const [query, setQuery] = useState('')
  // 搜索区折叠：默认展开；折叠后只显示一行"▶ 展开搜索"按钮（让笔记区更大）
  const [searchOpen, setSearchOpen] = useState(true)
  const [kind, setKind] = useState<KindFilter>('all')
  const [targetId, setTargetId] = useState<string>('all')

  const [mode, setMode] = useState<OverviewMode>('list')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if ((variant === 'drawer' && isOpen) || (variant === 'page' && isActive)) {
      setQuery('')
      setKind('all')
      setTargetId('all')
      setMode('list')
      setEditingId(null)
    }
  }, [variant, isOpen, isActive])

  const allNotes = useMemo<Note[]>(
    () => Object.values(notesMap).sort((a, b) => b.updatedAt - a.updatedAt),
    [notesMap]
  )

  const targetOptions = useMemo(() => {
    if (kind === 'all') return []
    const ids = new Set<string>()
    allNotes.forEach(n => {
      if (n.target.kind === kind) ids.add(n.target.id)
    })
    return Array.from(ids)
      .map(id => ({ id, title: getTargetTitle(kind, id) }))
      .sort((a, b) => a.title.localeCompare(b.title, 'zh'))
  }, [allNotes, kind])

  const filteredNotes = useMemo<Note[]>(() => {
    const keywords = query.trim().toLowerCase().split(/\s+/).filter(k => k.length > 0)
    return allNotes.filter(n => {
      if (kind !== 'all' && n.target.kind !== kind) return false
      if (targetId !== 'all' && n.target.id !== targetId) return false
      if (keywords.length > 0) {
        const title = n.title.trim().toLowerCase()
        const content = n.content.toLowerCase()
        for (const kw of keywords) {
          if (!title.includes(kw) && !content.includes(kw)) return false
        }
      }
      return true
    })
  }, [allNotes, query, kind, targetId])

  const handleJump = (note: Note) => {
    const targetYear = getTargetYear(note.target.kind, note.target.id)
    if (note.target.kind === 'event') selectEvent(note.target.id)
    else selectEra(note.target.id)
    if (targetYear !== undefined) {
      setYear(targetYear)
      setTimelineView(targetYear, 1.5)
    }
    setDetailView('notes')
    onClose()
  }

  const handleEdit = (id: string) => { setEditingId(id); setMode('edit') }
  const handleCreate = () => {
    if (kind === 'all' || targetId === 'all') return
    const target = { kind: kind as NoteTargetKind, id: targetId }
    const newId = addNote(target)
    setEditingId(newId)
    setMode('edit')
  }
  const handleCloseEditor = () => { setMode('list'); setEditingId(null) }
  const handleDeleteFromEditor = (id: string) => {
    deleteNote(id)
    if (id === editingId) { setEditingId(null); setMode('list') }
  }
  const handleSwitchNote = (id: string) => {
    if (id === editingId) return
    setEditingId(id)
  }
  const handleDelete = (id: string) => {
    deleteNote(id)
    if (id === editingId) { setEditingId(null); setMode('list') }
  }

  const handleExport = () => {
    const allList = Object.values(notesMap)
    if (allList.length === 0) { window.alert('没有笔记可导出'); return }
    try { downloadNotesJson(allList) }
    catch (e) { window.alert(`导出失败：${(e as Error).message}`) }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      let text: string
      try { text = await file.text() }
      catch (err) { window.alert(`读取文件失败：${(err as Error).message}`); return }
      const parsed = parseNotesJson(text)
      if (!parsed.ok) { window.alert(`导入失败：${parsed.error}`); return }
      if (parsed.notes.length === 0) { window.alert('文件中没有有效笔记'); return }
      const conflicts = countConflicts(notesMap, parsed.notes)
      let strategy: 'overwrite' | 'skip'
      if (conflicts > 0) {
        const choice = window.confirm(
          `检测到 ${conflicts} 条 ID 冲突。\n\n` +
          `点击「确定」= 全部覆盖（用导入版本替换现有）\n` +
          `点击「取消」= 全部跳过（保留现有笔记）`,
        )
        strategy = choice ? 'overwrite' : 'skip'
      } else {
        strategy = 'overwrite'
      }
      const { notes, result } = applyImport(notesMap, parsed.notes, strategy)
      useNotesStore.setState({ notes })
      window.alert(
        `导入完成：\n` +
          `新建 ${result.imported} 条\n` +
          `覆盖 ${result.overwritten} 条\n` +
          `跳过 ${result.skipped} 条`,
      )
    }
    input.click()
  }

  const canCreate = kind !== 'all' && targetId !== 'all'

  useEffect(() => {
    const isDrawerOpen = variant === 'drawer' && isOpen
    const isPageActive = variant === 'page' && isActive
    if (!isDrawerOpen && !isPageActive) return
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [variant, isOpen, isActive, onClose])

  const editingNote = useMemo<Note | null>(() => {
    if (editingId === null) return null
    return notesMap[editingId] ?? null
  }, [editingId, notesMap])

  // 搜索+过滤区（可折叠）
  const searchFilterArea = (
    <div className="px-5 py-3 border-b border-ink-600 space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSearchOpen(o => !o)}
          className="text-[10px] text-ink-500 hover:text-bronze-300 px-1"
          title={searchOpen ? '收起搜索区' : '展开搜索区'}
        >
          {searchOpen ? '▼' : '▶'} {searchOpen ? '收起搜索' : (query.trim() ? `搜索词: ${query}` : '展开搜索')}
        </button>
      </div>
      {searchOpen && (
        <>
          <NotesOverviewSearch value={query} onChange={setQuery} />
          <NotesOverviewFilters
            kind={kind}
            onKindChange={(k) => { setKind(k); setTargetId('all') }}
            targetOptions={targetOptions}
            targetId={targetId}
            onTargetChange={setTargetId}
          />
        </>
      )}
    </div>
  )

  const listContent = (
    <>
      {searchFilterArea}
      <NotesOverviewList
        notes={filteredNotes}
        totalCount={allNotes.length}
        hasFilter={!!query.trim() || kind !== 'all' || targetId !== 'all'}
        onEdit={handleEdit}
        onJump={handleJump}
        onDelete={handleDelete}
        onCreate={handleCreate}
        canCreate={canCreate}
        query={query}
      />
    </>
  )

  const editContent = (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-shrink-0 max-h-[55%] border-b border-ink-600 flex flex-col min-h-0">
        <NoteEditor
          note={editingNote}
          onClose={handleCloseEditor}
          onDelete={handleDeleteFromEditor}
        />
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {searchFilterArea}
        <NotesOverviewList
          notes={filteredNotes}
          totalCount={allNotes.length}
          hasFilter={!!query.trim() || kind !== 'all' || targetId !== 'all'}
          onEdit={handleSwitchNote}
          onJump={handleJump}
          onDelete={handleDelete}
          onCreate={handleCreate}
          canCreate={canCreate}
          compact
          activeNoteId={editingId}
          query={query}
        />
      </div>
    </div>
  )

  if (variant === 'drawer') {
    return (
      <>
        <div
          onClick={onClose}
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          aria-hidden="true"
        />
        <div
          onClick={e => e.stopPropagation()}
          className={`fixed top-0 right-0 z-50 h-full bg-ink-800/98 backdrop-blur border-l border-ink-600 shadow-2xl flex flex-col transition-transform duration-200 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ width: 'min(720px, 95vw)' }}
          role="dialog"
          aria-label="我的笔记"
          aria-hidden={!isOpen}
        >
          <NotesOverviewHeader onClose={onClose} />
          {mode === 'list' ? listContent : editContent}
        </div>
      </>
    )
  }

  return (
    <div
      className="w-full h-full bg-ink-900 flex flex-col"
      role="region"
      aria-label="笔记总览页"
    >
      <NotesOverviewHeader onClose={onClose} />
      <NotesOverviewStats notes={allNotes} query={query} kind={kind} targetId={targetId} onExport={handleExport} onImport={handleImport} />
      {mode === 'list' ? listContent : editContent}
    </div>
  )
}
