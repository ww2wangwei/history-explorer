/**
 * WarsAdmin — 战争事件编辑器
 */
import { useState, useMemo, useEffect } from 'react'
import { useAdminStore, type EventOverride } from '@/store/useAdminStore'
import { getMergedEvents } from '@/utils/adminData'
import { bingImage } from '@/utils/geoImage'
import type { HistoricalEvent } from '@/types'

export default function WarsAdmin() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [onlyEdited, setOnlyEdited] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  const all = useMemo(() => getMergedEvents(), [])
  const wars = useMemo(() => all.filter(e => (e as any).category === '军事' || (e as any).category === 'military'), [all])
  const overrides = useAdminStore(s => s.eventsOverrides)
  const onlyDeletedCount = useMemo(() => Object.values(overrides).filter(o => o.__deleted).length, [overrides])
  const deletedIds = useMemo(() => Object.entries(overrides).filter(([_, o]) => o.__deleted).map(([id]) => id), [overrides])

  const filtered = useMemo(() => {
    return wars.filter(w => {
      if (onlyEdited && !overrides[w.id]) return false
      if (query) {
        const q = query.toLowerCase()
        if (!w.title.toLowerCase().includes(q) && !w.id.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [wars, query, onlyEdited, overrides])

  const deletedFeatures = useMemo(() => deletedIds.map(id => ({ id, title: id, year: 0, category: '军事', region: 'world', coordinates: [0, 0] as [number, number], description: '' } as any)), [deletedIds])
  const selected = showDeleted ? (deletedFeatures.find(w => w.id === selectedId) ?? null) : (wars.find(w => w.id === selectedId) ?? null)

  return (
    <div className="flex h-full">
      <div className="w-96 flex-shrink-0 border-r border-ink-700 flex flex-col">
        <div className="p-3 border-b border-ink-700 space-y-2">
          <div className="flex gap-2">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索 标题 / id..." className="flex-1 px-3 py-1.5 text-sm bg-ink-800 border border-ink-600 rounded text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500" />
            <button onClick={() => {
              const id = `ev-new-${Date.now()}`
              useAdminStore.getState().createEvent({ id, title: '新建战争', year: 0, category: '军事', description: '', region: 'world', coordinates: [0, 0], importance: 1 })
              setSelectedId(id)
            }} className="px-3 py-1.5 rounded bg-emerald-700/40 hover:bg-emerald-600/60 border border-emerald-500/50 text-emerald-200 text-sm whitespace-nowrap">➕ 新增</button>
          </div>
          <label className="flex items-center gap-1.5 text-xs text-ink-400 cursor-pointer">
            <input type="checkbox" checked={onlyEdited} onChange={e => setOnlyEdited(e.target.checked)} />
            只看已编辑 ({Object.keys(overrides).length})
          </label>
          {onlyDeletedCount > 0 && (
            <label className="flex items-center gap-1.5 text-xs text-red-300 cursor-pointer">
              <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} />
              🚫 显示已删除 ({onlyDeletedCount})
            </label>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {showDeleted ? (
            <>
              <div className="p-2 text-[10px] text-red-300 bg-red-900/20 border-b border-red-700/30">🚫 已删除</div>
              {deletedFeatures.map(w => (
                <button key={w.id} onClick={() => setSelectedId(w.id)} className={`w-full text-left p-2 border-b border-ink-800 hover:bg-ink-800/60 ${selectedId === w.id ? 'bg-bronze-900/20 border-l-2 border-l-bronze-500' : ''}`}>
                  <div className="flex items-center gap-2"><span>🚫</span><span className="text-sm text-parchment-50 line-through opacity-60 truncate flex-1">{w.title}</span></div>
                </button>
              ))}
            </>
          ) : (
            filtered.map(w => {
              const ov = overrides[w.id]
              const edited = !!ov && !ov.__new
              const isNew = ov?.__new
              return (
                <button key={w.id} onClick={() => setSelectedId(w.id)}
                  className={`w-full text-left p-2 border-b border-ink-800 hover:bg-ink-800/60 ${selectedId === w.id ? 'bg-bronze-900/20 border-l-2 border-l-bronze-500' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-ink-500 tabular-nums">{w.year < 0 ? `BC ${-w.year}` : w.year}</span>
                    <span className="text-sm text-parchment-50 truncate flex-1">{w.title}</span>
                    {isNew && <span className="text-[9px] text-emerald-400 bg-emerald-900/30 px-1 rounded">新</span>}
                    {!isNew && edited && <span className="text-[9px] text-amber-400 bg-amber-900/30 px-1 rounded">已编辑</span>}
                  </div>
                  <div className="text-[10px] text-ink-500 truncate">{w.region === 'china' ? '🇨🇳 中国' : '🌍 世界'}</div>
                </button>
              )
            })
          )}
          {filtered.length === 0 && !showDeleted && <div className="p-4 text-center text-ink-500 text-sm">无匹配</div>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {selected ? <WarEditForm key={selected.id} war={selected} /> : <div className="p-8 text-center text-ink-500">← 选择左侧条目（共 {wars.length} 场战争）</div>}
      </div>
    </div>
  )
}

function WarEditForm({ war }: { war: HistoricalEvent }) {
  const override = useAdminStore(s => s.eventsOverrides[war.id]) ?? {}
  const setOverride = useAdminStore(s => s.setEventOverride)
  const deleteOverride = useAdminStore(s => s.deleteEventOverride)
  const markDeleted = useAdminStore(s => s.markEventDeleted)
  const undelete = useAdminStore(s => s.undeleteEvent)
  const isEdited = Object.keys(override).filter(k => !k.startsWith('__')).length > 0
  const isNew = override.__new
  const isDeleted = override.__deleted

  const [title, setTitle] = useState(override.title ?? war.title)
  const [year, setYear] = useState<number>(override.year ?? war.year)
  const [description, setDescription] = useState(override.description ?? war.description ?? '')
  const [imageSearch, setImageSearch] = useState(override.imageSearch ?? '')
  const [lng, setLng] = useState<number>(override.coordinates?.[0] ?? war.coordinates?.[0] ?? 0)
  const [lat, setLat] = useState<number>(override.coordinates?.[1] ?? war.coordinates?.[1] ?? 0)

  useEffect(() => {
    setTitle(override.title ?? war.title)
    setYear(override.year ?? war.year)
    setDescription(override.description ?? war.description ?? '')
    setImageSearch(override.imageSearch ?? '')
    setLng(override.coordinates?.[0] ?? war.coordinates?.[0] ?? 0)
    setLat(override.coordinates?.[1] ?? war.coordinates?.[1] ?? 0)
  }, [war.id])

  const inputCls = 'w-full px-3 py-1.5 text-sm bg-ink-800 border border-ink-600 rounded text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500'
  const previewUrl = imageSearch ? bingImage(imageSearch, 800, 450) : ''

  const handleSave = () => {
    const patch: Partial<EventOverride> = {
      title: title !== war.title ? title : undefined,
      year: year !== war.year ? year : undefined,
      description: description !== (war.description ?? '') ? description : undefined,
      imageSearch: imageSearch || undefined,
      coordinates: lng !== (war.coordinates?.[0] ?? 0) || lat !== (war.coordinates?.[1] ?? 0) ? [lng, lat] : undefined,
    }
    Object.keys(patch).forEach(k => (patch as any)[k] === undefined && delete (patch as any)[k])
    if (Object.keys(patch).length > 0) setOverride(war.id, patch)
  }

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-ink-500 uppercase tracking-wider flex items-center gap-2">
            <span>编辑战争事件</span>
            {isNew && <span className="text-emerald-400 bg-emerald-900/30 px-1.5 rounded">🆕 新建</span>}
            {isDeleted && <span className="text-red-400 bg-red-900/30 px-1.5 rounded">🚫 已删除</span>}
          </div>
          <h2 className="text-2xl font-serif text-bronze-300 mt-1">{war.title}</h2>
          <code className="text-xs text-ink-500">id: {war.id}</code>
        </div>
        <div className="flex gap-2">
          {isDeleted ? (
            <button onClick={() => undelete(war.id)} className="px-3 py-1.5 rounded bg-emerald-700/40 hover:bg-emerald-600/60 border border-emerald-600/50 text-emerald-200 text-xs">↩️ 恢复</button>
          ) : (
            <button onClick={() => {
              if (isNew) { if (confirm(`永久删除新建战争 "${war.title}"？`)) deleteOverride(war.id) }
              else if (confirm(`标记 "${war.title}" 为已删除？（主应用将隐藏）`)) markDeleted(war.id)
            }} className="px-3 py-1.5 rounded bg-red-900/40 hover:bg-red-800/60 border border-red-600/50 text-red-200 text-xs">🗑️ 删除</button>
          )}
          {isEdited && !isNew && !isDeleted && (
            <button onClick={() => { if (confirm(`撤销 "${war.title}" 的所有编辑？`)) deleteOverride(war.id) }} className="px-3 py-1.5 rounded bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 text-xs">↺ 撤销编辑</button>
          )}
        </div>
      </div>

      <Field label="标题"><input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} /></Field>
      <Field label="年代（负数=BC）"><input type="number" value={year} onChange={e => setYear(parseInt(e.target.value) || 0)} className={inputCls} /></Field>
      <Field label="经纬度"><div className="flex gap-2"><input type="number" step="0.01" value={lng} onChange={e => setLng(parseFloat(e.target.value))} placeholder="经度" className={inputCls + ' flex-1'} /><input type="number" step="0.01" value={lat} onChange={e => setLat(parseFloat(e.target.value))} placeholder="纬度" className={inputCls + ' flex-1'} /></div></Field>
      <Field label="描述"><textarea value={description} onChange={e => setDescription(e.target.value)} rows={8} className={inputCls + ' font-sans leading-relaxed'} /><div className="text-[10px] text-ink-500 mt-1">{description.length} 字</div></Field>
      <Field label="图片"><div className="space-y-2"><input value={imageSearch} onChange={e => setImageSearch(e.target.value)} placeholder="英文搜索词（如 battle of waterloo）" className={inputCls} />{previewUrl && <div className="rounded border border-ink-600 overflow-hidden"><img src={previewUrl} alt={war.title} className="w-full" /></div>}</div></Field>

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
