/**
 * PeopleAdmin — 人物编辑器
 */
import { useState, useMemo, useEffect } from 'react'
import { useAdminStore, type PersonOverride } from '@/store/useAdminStore'
import { getMergedPeople } from '@/utils/adminData'
import { bingImage } from '@/utils/geoImage'
import type { HistoricalFigure } from '@/types'

const CATEGORIES = ['politician', 'military', 'thinker', 'literati', 'scientist', 'reformer', 'explorer', 'religious'] as const
const CATEGORY_LABELS: Record<string, string> = {
  politician: '👑 政治家', military: '⚔️ 军事家', thinker: '📚 思想家', literati: '✒️ 文人/艺术家',
  scientist: '🔬 科学家', reformer: '⚖️ 改革家', explorer: '🚢 探险家', religious: '☸️ 宗教人物',
}

export default function PeopleAdmin() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [onlyEdited, setOnlyEdited] = useState(false)
  const merged = useMemo(() => getMergedPeople(), [])
  const overrides = useAdminStore(s => s.peopleOverrides)

  const filtered = useMemo(() => {
    return merged.filter(p => {
      if (onlyEdited && !overrides[p.id]) return false
      if (query) {
        const q = query.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q) && !(p.description ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [merged, query, onlyEdited, overrides])

  const selected = merged.find(p => p.id === selectedId) ?? null

  return (
    <div className="flex h-full">
      <div className="w-96 flex-shrink-0 border-r border-ink-700 flex flex-col">
        <div className="p-3 border-b border-ink-700 space-y-2">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索 名字 / id / 描述..." className="w-full px-3 py-1.5 text-sm bg-ink-800 border border-ink-600 rounded text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500" />
          <label className="flex items-center gap-1.5 text-xs text-ink-400 cursor-pointer">
            <input type="checkbox" checked={onlyEdited} onChange={e => setOnlyEdited(e.target.checked)} />
            只看已编辑 ({Object.keys(overrides).length})
          </label>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(p => {
            const edited = !!overrides[p.id]
            return (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className={`w-full text-left p-2 border-b border-ink-800 hover:bg-ink-800/60 ${selectedId === p.id ? 'bg-bronze-900/20 border-l-2 border-l-bronze-500' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{p.emoji || '👤'}</span>
                  <span className="text-sm text-parchment-50 truncate flex-1">{p.name}</span>
                  {edited && <span className="text-[9px] text-amber-400 bg-amber-900/30 px-1 rounded">已编辑</span>}
                </div>
                <div className="text-[10px] text-ink-500 truncate mt-0.5">{p.role}</div>
              </button>
            )
          })}
          {filtered.length === 0 && <div className="p-4 text-center text-ink-500 text-sm">无匹配</div>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {selected ? <PersonEditForm key={selected.id} person={selected} /> : <div className="p-8 text-center text-ink-500">← 选择左侧条目（共 {merged.length} 人）</div>}
      </div>
    </div>
  )
}

function PersonEditForm({ person }: { person: HistoricalFigure }) {
  const override = useAdminStore(s => s.peopleOverrides[person.id]) ?? {}
  const setOverride = useAdminStore(s => s.setPersonOverride)
  const deleteOverride = useAdminStore(s => s.deletePersonOverride)
  const isEdited = Object.keys(override).length > 0

  const [name, setName] = useState(override.name ?? person.name)
  const [role, setRole] = useState(override.role ?? person.role)
  const [category, setCategory] = useState(override.category ?? person.category)
  const [description, setDescription] = useState(override.description ?? person.description ?? '')
  const [imageSearch, setImageSearch] = useState(override.imageSearch ?? '')
  const [birthYear, setBirthYear] = useState<number>(override.birthYear ?? person.birthYear ?? 0)
  const [deathYear, setDeathYear] = useState<number>(override.deathYear ?? person.deathYear ?? 0)

  useEffect(() => {
    setName(override.name ?? person.name)
    setRole(override.role ?? person.role)
    setCategory(override.category ?? person.category)
    setDescription(override.description ?? person.description ?? '')
    setImageSearch(override.imageSearch ?? '')
    setBirthYear(override.birthYear ?? person.birthYear ?? 0)
    setDeathYear(override.deathYear ?? person.deathYear ?? 0)
  }, [person.id])

  const previewUrl = imageSearch ? bingImage(imageSearch, 600, 400) : ''
  const inputCls = 'w-full px-3 py-1.5 text-sm bg-ink-800 border border-ink-600 rounded text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500'

  const handleSave = () => {
    const patch: Partial<PersonOverride> = {
      name: name !== person.name ? name : undefined,
      role: role !== person.role ? role : undefined,
      category: category !== person.category ? category : undefined,
      description: description !== (person.description ?? '') ? description : undefined,
      imageSearch: imageSearch || undefined,
      birthYear: birthYear !== (person.birthYear ?? 0) ? birthYear : undefined,
      deathYear: deathYear !== (person.deathYear ?? 0) ? deathYear : undefined,
    }
    Object.keys(patch).forEach(k => (patch as any)[k] === undefined && delete (patch as any)[k])
    if (Object.keys(patch).length > 0) setOverride(person.id, patch)
  }

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-ink-500 uppercase tracking-wider">编辑人物</div>
          <h2 className="text-2xl font-serif text-bronze-300 mt-1">{person.name}</h2>
          <code className="text-xs text-ink-500">id: {person.id}</code>
        </div>
        {isEdited && <button onClick={() => { if (confirm(`重置 "${person.name}" 的所有编辑？`)) deleteOverride(person.id) }} className="px-3 py-1.5 rounded bg-red-900/40 hover:bg-red-800/60 border border-red-600/50 text-red-200 text-xs">🗑️ 重置</button>}
      </div>

      <Field label="姓名"><input value={name} onChange={e => setName(e.target.value)} className={inputCls} /></Field>
      <Field label="角色"><input value={role} onChange={e => setRole(e.target.value)} className={inputCls} /></Field>
      <Field label="分类">
        <select value={category} onChange={e => setCategory(e.target.value as any)} className={inputCls}>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </Field>
      <Field label="生卒年">
        <div className="flex gap-2">
          <input type="number" value={birthYear} onChange={e => setBirthYear(parseInt(e.target.value) || 0)} placeholder="出生年（负数=BC）" className={inputCls + ' flex-1'} />
          <input type="number" value={deathYear} onChange={e => setDeathYear(parseInt(e.target.value) || 0)} placeholder="去世年" className={inputCls + ' flex-1'} />
        </div>
      </Field>
      <Field label="介绍描述">
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={8} className={inputCls + ' font-sans leading-relaxed'} />
        <div className="text-[10px] text-ink-500 mt-1">{description.length} 字</div>
      </Field>
      <Field label="图片">
        <div className="space-y-2">
          <input value={imageSearch} onChange={e => setImageSearch(e.target.value)} placeholder="英文搜索词（如 confucius portrait）" className={inputCls} />
          {previewUrl && <div className="rounded border border-ink-600 overflow-hidden"><img src={previewUrl} alt={person.name} className="w-full" /></div>}
        </div>
      </Field>

      <div className="pt-3 border-t border-ink-700 flex gap-2">
        <button onClick={handleSave} className="px-4 py-2 rounded bg-emerald-700/40 hover:bg-emerald-600/60 border border-emerald-500/50 text-emerald-200 text-sm">💾 保存</button>
        {isEdited && <span className="text-xs text-amber-400 self-center">已编辑（{Object.keys(override).length} 字段）</span>}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">{label}</div>{children}</div>
}
