/**
 * GeoAdmin — 地理内容编辑器
 * 表格 + 选中条目后右侧编辑表单
 */
import { useState, useMemo, useEffect } from 'react'
import { useAdminStore, type GeoFeatureOverride } from '@/store/useAdminStore'
import { ALL_GEO_FEATURES_FLAT, getMergedGeoFeatures, GEO_TYPE_OPTIONS, GEO_TYPE_LABELS } from '@/utils/adminData'
import { bingImage } from '@/utils/geoImage'
import type { GeoFeature } from '@/data/geographic-features'

export default function GeoAdmin() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [onlyEdited, setOnlyEdited] = useState(false)

  const merged = useMemo(() => getMergedGeoFeatures(), [])
  const overrides = useAdminStore(s => s.geoOverrides)

  const filtered = useMemo(() => {
    return merged.filter(f => {
      if (typeFilter !== 'all' && f.type !== typeFilter) return false
      if (onlyEdited && !overrides[f.id]) return false
      if (query) {
        const q = query.toLowerCase()
        if (!f.name.toLowerCase().includes(q) && !f.id.toLowerCase().includes(q) && !(f.description ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [merged, query, typeFilter, onlyEdited, overrides])

  const selected = merged.find(f => f.id === selectedId) ?? null

  return (
    <div className="flex h-full">
      {/* 左：表格 */}
      <div className="w-96 flex-shrink-0 border-r border-ink-700 flex flex-col">
        <div className="p-3 border-b border-ink-700 space-y-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索 id / 名称 / 描述..."
            className="w-full px-3 py-1.5 text-sm bg-ink-800 border border-ink-600 rounded text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500"
          />
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setTypeFilter('all')}
              className={`text-[10px] px-2 py-0.5 rounded border ${typeFilter === 'all' ? 'bg-bronze-700/40 border-bronze-500 text-bronze-200' : 'bg-ink-800 border-ink-600 text-ink-400'}`}
            >
              全部 ({merged.length})
            </button>
            {GEO_TYPE_OPTIONS.map(t => {
              const count = merged.filter(f => f.type === t).length
              if (count === 0) return null
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`text-[10px] px-2 py-0.5 rounded border ${typeFilter === t ? 'bg-bronze-700/40 border-bronze-500 text-bronze-200' : 'bg-ink-800 border-ink-600 text-ink-400'}`}
                >
                  {GEO_TYPE_LABELS[t]} ({count})
                </button>
              )
            })}
          </div>
          <label className="flex items-center gap-1.5 text-xs text-ink-400 cursor-pointer">
            <input type="checkbox" checked={onlyEdited} onChange={e => setOnlyEdited(e.target.checked)} />
            只看已编辑 ({Object.keys(overrides).length})
          </label>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(f => {
            const edited = !!overrides[f.id]
            return (
              <button
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                className={`w-full text-left p-2 border-b border-ink-800 hover:bg-ink-800/60 transition-colors ${
                  selectedId === f.id ? 'bg-bronze-900/20 border-l-2 border-l-bronze-500' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{GEO_TYPE_LABELS[f.type]?.split(' ')[0]}</span>
                  <span className="text-sm text-parchment-50 truncate flex-1">{f.name}</span>
                  {edited && <span className="text-[9px] text-amber-400 bg-amber-900/30 px-1 rounded">已编辑</span>}
                </div>
                <div className="text-[10px] text-ink-500 truncate mt-0.5">
                  {f.id} · {f.labelPos[0].toFixed(1)}, {f.labelPos[1].toFixed(1)}
                </div>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div className="p-4 text-center text-ink-500 text-sm">无匹配条目</div>
          )}
        </div>
      </div>

      {/* 右：编辑表单 */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <GeoEditForm key={selected.id} feature={selected} />
        ) : (
          <div className="p-8 text-center text-ink-500">
            ← 选择左侧条目进行编辑<br/>
            <span className="text-xs">共 {merged.length} 条，已编辑 {Object.keys(overrides).length} 条</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ============= 单条编辑表单 =============
function GeoEditForm({ feature }: { feature: GeoFeature }) {
  const override = useAdminStore(s => s.geoOverrides[feature.id]) ?? {}
  const setOverride = useAdminStore(s => s.setGeoOverride)
  const deleteOverride = useAdminStore(s => s.deleteGeoOverride)

  const isEdited = Object.keys(override).length > 0

  // 字段值（effective = override || source）
  const v = (key: keyof GeoFeatureOverride, fallback: any) => override[key] ?? fallback
  const vString = (key: keyof GeoFeatureOverride, fallback: string) => (override[key] as string) ?? fallback

  const [name, setName] = useState(vString('name', feature.name))
  const [type, setType] = useState(vString('type', feature.type))
  const [importance, setImportance] = useState<number>(v('importance', feature.importance ?? 1) as number)
  const [lat, setLat] = useState<number>(v('labelPos', feature.labelPos)[1])
  const [lng, setLng] = useState<number>(v('labelPos', feature.labelPos)[0])
  const [description, setDescription] = useState(vString('description', feature.description ?? ''))
  const [imageSearch, setImageSearch] = useState(vString('imageSearch', ''))
  const [imageUrl, setImageUrl] = useState(vString('imageUrl', feature.imageUrl ?? ''))

  // 同步外部数据变化
  useEffect(() => {
    setName(vString('name', feature.name))
    setType(vString('type', feature.type))
    setImportance(v('importance', feature.importance ?? 1) as number)
    setLat(v('labelPos', feature.labelPos)[1])
    setLng(v('labelPos', feature.labelPos)[0])
    setDescription(vString('description', feature.description ?? ''))
    setImageSearch(vString('imageSearch', ''))
    setImageUrl(vString('imageUrl', feature.imageUrl ?? ''))
  }, [feature.id])

  // 图片预览（imageSearch 优先，否则 imageUrl，否则源 imageUrl）
  const previewKw = imageSearch || (imageUrl ? '' : '')
  const previewUrl = imageSearch
    ? bingImage(imageSearch, 800, 450)
    : (imageUrl || feature.imageUrl || '')

  const save = (patch: Partial<GeoFeatureOverride>) => {
    setOverride(feature.id, patch)
  }

  const handleSaveAll = () => {
    const patch: Partial<GeoFeatureOverride> = {
      name: name !== feature.name ? name : undefined,
      type: type !== feature.type ? (type as any) : undefined,
      importance: importance !== (feature.importance ?? 1) ? (importance as 1 | 2 | 3) : undefined,
      labelPos: lat !== feature.labelPos[1] || lng !== feature.labelPos[0] ? [lng, lat] : undefined,
      description: description !== (feature.description ?? '') ? description : undefined,
      imageSearch: imageSearch || undefined,
      imageUrl: imageUrl !== (feature.imageUrl ?? '') ? imageUrl : undefined,
    }
    // 清理 undefined
    Object.keys(patch).forEach(k => patch[k as keyof GeoFeatureOverride] === undefined && delete patch[k as keyof GeoFeatureOverride])
    if (Object.keys(patch).length > 0) save(patch)
  }

  const handleReset = () => {
    if (confirm(`确定要重置 "${feature.name}" 的所有编辑吗？`)) {
      deleteOverride(feature.id)
    }
  }

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-ink-500 uppercase tracking-wider">编辑地理条目</div>
          <h2 className="text-2xl font-serif text-bronze-300 mt-1">{feature.name}</h2>
          <code className="text-xs text-ink-500">id: {feature.id}</code>
        </div>
        <div className="flex gap-2">
          {isEdited && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded bg-red-900/40 hover:bg-red-800/60 border border-red-600/50 text-red-200 text-xs"
            >
              🗑️ 重置
            </button>
          )}
        </div>
      </div>

      {/* 名称 */}
      <Field label="名称">
        <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
      </Field>

      {/* 类型 */}
      <Field label="类型">
        <select value={type} onChange={e => setType(e.target.value)} className={inputCls}>
          {GEO_TYPE_OPTIONS.map(t => <option key={t} value={t}>{GEO_TYPE_LABELS[t]}</option>)}
        </select>
      </Field>

      {/* 重要性 */}
      <Field label="重要性">
        <div className="flex gap-2">
          {[1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => setImportance(n)}
              className={`px-3 py-1 rounded border text-sm ${
                importance === n
                  ? 'bg-amber-700/40 border-amber-500 text-amber-200'
                  : 'bg-ink-800 border-ink-600 text-ink-400'
              }`}
            >
              {n === 3 ? '⭐⭐⭐' : n === 2 ? '⭐⭐' : '⭐'}
            </button>
          ))}
        </div>
      </Field>

      {/* 位置 */}
      <Field label="位置（经度, 纬度）">
        <div className="flex gap-2">
          <input type="number" step="0.01" value={lng} onChange={e => setLng(parseFloat(e.target.value))} placeholder="经度" className={inputCls + ' flex-1'} />
          <input type="number" step="0.01" value={lat} onChange={e => setLat(parseFloat(e.target.value))} placeholder="纬度" className={inputCls + ' flex-1'} />
        </div>
      </Field>

      {/* 描述 */}
      <Field label="介绍描述">
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={6}
          className={inputCls + ' font-sans leading-relaxed'}
        />
        <div className="text-[10px] text-ink-500 mt-1">{description.length} 字</div>
      </Field>

      {/* 图片 */}
      <Field label="图片">
        <div className="space-y-2">
          <div>
            <div className="text-[10px] text-ink-500 mb-1">搜索关键词（推荐 · 英文更准）</div>
            <input value={imageSearch} onChange={e => setImageSearch(e.target.value)} placeholder="如：nile river egypt" className={inputCls} />
            <div className="text-[10px] text-ink-500 mt-0.5">留空表示不改图片</div>
          </div>
          <div>
            <div className="text-[10px] text-ink-500 mb-1">或：直接 URL</div>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className={inputCls + ' font-mono text-xs'} />
          </div>
          {previewUrl && (
            <div className="mt-2 rounded border border-ink-600 overflow-hidden">
              <div className="text-[10px] text-ink-500 bg-ink-800 px-2 py-1">预览</div>
              <img src={previewUrl} alt={feature.name} className="w-full" />
            </div>
          )}
        </div>
      </Field>

      {/* 保存按钮 */}
      <div className="pt-3 border-t border-ink-700 flex gap-2">
        <button
          onClick={handleSaveAll}
          className="px-4 py-2 rounded bg-emerald-700/40 hover:bg-emerald-600/60 border border-emerald-500/50 text-emerald-200 text-sm"
        >
          💾 保存
        </button>
        {isEdited && (
          <span className="text-xs text-amber-400 self-center">已编辑（{Object.keys(override).length} 个字段）</span>
        )}
      </div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-1.5 text-sm bg-ink-800 border border-ink-600 rounded text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">{label}</div>
      {children}
    </div>
  )
}
