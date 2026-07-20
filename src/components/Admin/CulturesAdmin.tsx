/**
 * CulturesAdmin — 文化内容编辑器
 */
import { useState, useMemo, useEffect } from 'react'
import { useAdminStore, type CultureOverride } from '@/store/useAdminStore'
import { getMergedCultures, type CultureEvent } from '@/utils/adminData'
import { bingImage } from '@/utils/geoImage'

const CATEGORIES = ['文字', '制度', '建筑', '学术', '科技', '艺术', '文学', '思想', '宗教']

export default function CulturesAdmin() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [onlyEdited, setOnlyEdited] = useState(false)
  const merged = useMemo(() => getMergedCultures(), [])
  const overrides = useAdminStore(s => s.cultureOverrides)

  const filtered = useMemo(() => {
    return merged.filter(c => {
      if (onlyEdited && !overrides[c.id]) return false
      if (query) {
        const q = query.toLowerCase()
        if (!c.title.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [merged, query, onlyEdited, overrides])

  const selected = merged.find(c => c.id === selectedId) ?? null

  return (
    <div className="flex h-full">
      <div className="w-96 flex-shrink-0 border-r border-ink-700 flex flex-col">
        <div className="p-3 border-b border-ink-700 space-y-2">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索 标题 / id..." className="w-full px-3 py-1.5 text-sm bg-ink-800 border border-ink-600 rounded text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500" />
          <label className="flex items-center gap-1.5 text-xs text-ink-400 cursor-pointer">
            <input type="checkbox" checked={onlyEdited} onChange={e => setOnlyEdited(e.target.checked)} />
            只看已编辑 ({Object.keys(overrides).length})
          </label>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => {
            const edited = !!overrides[c.id]
            return (
              <button key={c.id} onClick={() => setSelectedId(c.id)}
                className={`w-full text-left p-2 border-b border-ink-800 hover:bg-ink-800/60 ${selectedId === c.id ? 'bg-bronze-900/20 border-l-2 border-l-bronze-500' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ink-500 tabular-nums">{c.year < 0 ? `BC ${-c.year}` : c.year}</span>
                  <span className="text-sm text-parchment-50 truncate flex-1">{c.title}</span>
                  {edited && <span className="text-[9px] text-amber-400 bg-amber-900/30 px-1 rounded">已编辑</span>}
                </div>
                <div className="text-[10px] text-ink-500 truncate">{c.category} · {c.region}</div>
              </button>
            )
          })}
          {filtered.length === 0 && <div className="p-4 text-center text-ink-500 text-sm">无匹配</div>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {selected ? <CultureEditForm key={selected.id} culture={selected} /> : <div className="p-8 text-center text-ink-500">← 选择左侧条目（共 {merged.length} 条）</div>}
      </div>
    </div>
  )
}

function CultureEditForm({ culture }: { culture: CultureEvent }) {
  const override = useAdminStore(s => s.cultureOverrides[culture.id]) ?? {}
  const setOverride = useAdminStore(s => s.setCultureOverride)
  const deleteOverride = useAdminStore(s => s.deleteCultureOverride)
  const isEdited = Object.keys(override).length > 0

  const [title, setTitle] = useState(override.title ?? culture.title)
  const [year, setYear] = useState<number>(override.year ?? culture.year)
  const [category, setCategory] = useState(override.category ?? culture.category)
  const [region, setRegion] = useState(override.region ?? culture.region)
  const [description, setDescription] = useState(override.description ?? culture.description ?? '')
  const [imageSearch, setImageSearch] = useState(override.imageSearch ?? '')
  const [lng, setLng] = useState<number>(override.location?.[0] ?? culture.location[0])
  const [lat, setLat] = useState<number>(override.location?.[1] ?? culture.location[1])

  useEffect(() => {
    setTitle(override.title ?? culture.title)
    setYear(override.year ?? culture.year)
    setCategory(override.category ?? culture.category)
    setRegion(override.region ?? culture.region)
    setDescription(override.description ?? culture.description ?? '')
    setImageSearch(override.imageSearch ?? '')
    setLng(override.location?.[0] ?? culture.location[0])
    setLat(override.location?.[1] ?? culture.location[1])
  }, [culture.id])

  const inputCls = 'w-full px-3 py-1.5 text-sm bg-ink-800 border border-ink-600 rounded text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500'
  const previewUrl = imageSearch ? bingImage(imageSearch, 800, 450) : ''

  const handleSave = () => {
    const patch: Partial<CultureOverride> = {
      title: title !== culture.title ? title : undefined,
      year: year !== culture.year ? year : undefined,
      category: category !== culture.category ? category : undefined,
      region: region !== culture.region ? region : undefined,
      description: description !== (culture.description ?? '') ? description : undefined,
      imageSearch: imageSearch || undefined,
      location: lng !== culture.location[0] || lat !== culture.location[1] ? [lng, lat] : undefined,
    }
    Object.keys(patch).forEach(k => (patch as any)[k] === undefined && delete (patch as any)[k])
    if (Object.keys(patch).length > 0) setOverride(culture.id, patch)
  }

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-ink-500 uppercase tracking-wider">编辑文化内容</div>
          <h2 className="text-2xl font-serif text-bronze-300 mt-1">{culture.title}</h2>
          <code className="text-xs text-ink-500">id: {culture.id}</code>
        </div>
        {isEdited && <button onClick={() => { if (confirm(`重置 "${culture.title}" 的所有编辑？`)) deleteOverride(culture.id) }} className="px-3 py-1.5 rounded bg-red-900/40 hover:bg-red-800/60 border border-red-600/50 text-red-200 text-xs">🗑️ 重置</button>}
      </div>

      <Field label="标题"><input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} /></Field>
      <Field label="年代（负数=BC）"><input type="number" value={year} onChange={e => setYear(parseInt(e.target.value) || 0)} className={inputCls} /></Field>
      <Field label="分类">
        <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="地区"><input value={region} onChange={e => setRegion(e.target.value)} className={inputCls} /></Field>
      <Field label="经纬度"><div className="flex gap-2"><input type="number" step="0.01" value={lng} onChange={e => setLng(parseFloat(e.target.value))} placeholder="经度" className={inputCls + ' flex-1'} /><input type="number" step="0.01" value={lat} onChange={e => setLat(parseFloat(e.target.value))} placeholder="纬度" className={inputCls + ' flex-1'} /></div></Field>
      <Field label="介绍描述"><textarea value={description} onChange={e => setDescription(e.target.value)} rows={8} className={inputCls + ' font-sans leading-relaxed'} /><div className="text-[10px] text-ink-500 mt-1">{description.length} 字</div></Field>
      <Field label="图片"><div className="space-y-2"><input value={imageSearch} onChange={e => setImageSearch(e.target.value)} placeholder="英文搜索词" className={inputCls} />{previewUrl && <div className="rounded border border-ink-600 overflow-hidden"><img src={previewUrl} alt={culture.title} className="w-full" /></div>}</div></Field>

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
