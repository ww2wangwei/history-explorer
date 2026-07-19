/**
 * GeographyOverview — 全地理全屏浏览页
 * 2 个子 tab：
 *   - 🌍 自然地理：来自 geographic-features.ts（山/河/湖/海/平原/半岛）
 *   - 🏛️ 疆域变迁：来自 public/geo/world/eras/*.geojson + public/geo/china/*.geojson
 */
import { useEffect, useMemo, useState } from 'react'
import { CONTINENTS, SEAS, MOUNTAINS, RIVERS, REGIONS, type GeoFeature, type GeoFeatureType } from '@/data/geographic-features'
import { OCEAN_LABELS } from '@/data/oceans'
import erasData from '@/data/eras.json'
import MiniMap from '@/components/Figures/MiniMap'
import { useHistoryStore } from '@/store/useHistoryStore'
import type { Era } from '@/types'

const eras = erasData as Era[]

interface Props {
  isActive: boolean
  onClose: () => void
}

type Tab = 'nature' | 'territory'

// 疆域数据（手工枚举 GeoJSON 文件）
const TERRITORY_FILES = [
  ...['han', 'ming', 'qin', 'qing', 'song', 'tang', 'yuan'].map(id => ({ id, region: 'china' as const, label: '中国' })),
  ...['arab-caliphate', 'british-empire', 'byzantine', 'mongol-empire', 'ottoman', 'persia-safavid', 'rome-empire', 'rome-republic'].map(id => ({ id, region: 'world' as const, label: '世界' })),
]

const FEATURE_LABELS: Record<GeoFeatureType, { icon: string; label: string; color: string }> = {
  continent: { icon: '🌏', label: '大洲', color: '#9bc89a' },
  sea: { icon: '🌊', label: '海洋/海域', color: '#5b9bc8' },
  mountain: { icon: '⛰️', label: '山脉', color: '#a89070' },
  river: { icon: '🏞️', label: '河流', color: '#5bc8c8' },
  desert: { icon: '🏜️', label: '沙漠', color: '#c8a85b' },
  region: { icon: '🗺️', label: '区域', color: '#9b7eb6' },
}

export default function GeographyOverview({ isActive, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('nature')
  const [featureType, setFeatureType] = useState<GeoFeatureType | 'all'>('all')
  const [territoryRegion, setTerritoryRegion] = useState<'all' | 'china' | 'world'>('all')
  const [selectedFeature, setSelectedFeature] = useState<GeoFeature | null>(null)
  const [selectedTerritory, setSelectedTerritory] = useState<{ id: string; region: 'china' | 'world'; era?: Era } | null>(null)

  const setMapFocus = useHistoryStore(s => s.setMapFocus)
  const setYear = useHistoryStore(s => s.setYear)

  // 朝代/文明的近似中心坐标（用于疆域弹窗的缩略图）
  const ERA_CENTERS: Record<string, [number, number]> = {
    'qin': [108.94, 34.34],          // 咸阳
    'han': [108.94, 34.34],          // 长安
    'tang': [108.94, 34.34],         // 长安
    'song': [114.3, 30.6],           // 开封/杭州
    'yuan': [116.4, 39.9],           // 大都（北京）
    'ming': [116.4, 39.9],           // 北京
    'qing': [116.4, 39.9],           // 北京
    'rome-republic': [12.5, 41.9],   // 罗马
    'rome-empire': [12.5, 41.9],     // 罗马/君士坦丁堡
    'byzantine': [28.98, 41.01],     // 君士坦丁堡
    'arab-caliphate': [44.42, 32.54], // 巴格达
    'ottoman': [28.98, 41.01],       // 伊斯坦布尔
    'mongol-empire': [106.92, 47.92], // 哈拉和林
    'persia-safavid': [51.42, 35.69], // 伊斯法罕
    'british-empire': [-0.13, 51.51], // 伦敦
  }

  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedFeature || selectedTerritory) {
          setSelectedFeature(null)
          setSelectedTerritory(null)
        } else {
          onClose()
        }
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, selectedFeature, selectedTerritory, onClose])

  if (!isActive) return null

  // 合并所有自然地理特征
  const allFeatures: GeoFeature[] = useMemo(() => [
    ...CONTINENTS,
    ...SEAS,
    ...MOUNTAINS,
    ...RIVERS,
    ...REGIONS,
  ], [])

  const filteredFeatures = useMemo(() => {
    return allFeatures
      .filter(f => featureType === 'all' || f.type === featureType)
      .sort((a, b) => (b.importance ?? 1) - (a.importance ?? 1))
  }, [allFeatures, featureType])

  return (
    <div className="w-full h-full bg-ink-900 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-emerald-700/40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-serif text-emerald-300">🗺️ 全地理</h2>
              <p className="text-xs text-ink-500 mt-1">
                {tab === 'nature'
                  ? `${filteredFeatures.length} 项自然地理特征`
                  : `${TERRITORY_FILES.length} 个朝代/文明的疆域变迁`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-ink-700"
              title="返回 Dashboard (ESC)"
            >
              ×
            </button>
          </div>
          {/* Tab 切换 */}
          <div className="flex rounded bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
            <button
              onClick={() => setTab('nature')}
              className={`px-4 py-1.5 transition-colors ${
                tab === 'nature' ? 'bg-emerald-700/40 text-emerald-300' : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
              }`}
            >
              🌍 自然地理
            </button>
            <button
              onClick={() => setTab('territory')}
              className={`px-4 py-1.5 transition-colors ${
                tab === 'territory' ? 'bg-emerald-700/40 text-emerald-300' : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
              }`}
            >
              🏛️ 疆域变迁
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {tab === 'nature' ? (
          <>
            {/* 特征类型 chips 筛选 */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              <button
                onClick={() => setFeatureType('all')}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  featureType === 'all'
                    ? 'bg-emerald-700/40 text-emerald-200 border-emerald-500/60'
                    : 'bg-ink-700/60 text-ink-400 border-ink-600 hover:text-parchment-50'
                }`}
              >
                全部 <span className="text-ink-500 ml-1">({allFeatures.length})</span>
              </button>
              {(Object.keys(FEATURE_LABELS) as GeoFeatureType[]).map(t => {
                const count = allFeatures.filter(f => f.type === t).length
                if (count === 0) return null
                const meta = FEATURE_LABELS[t]
                return (
                  <button
                    key={t}
                    onClick={() => setFeatureType(t)}
                    className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                      featureType === t ? 'border-emerald-500/60' : 'bg-ink-700/60 text-ink-400 border-ink-600 hover:text-parchment-50'
                    }`}
                    style={featureType === t ? { background: meta.color + '30', color: meta.color } : undefined}
                  >
                    {meta.icon} {meta.label} <span className="text-ink-500 ml-1">({count})</span>
                  </button>
                )
              })}
            </div>
            {/* 大洋文字标签 */}
            <div className="mb-4 p-3 rounded bg-ink-800/40 border border-ink-700">
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-2">五大洋</div>
              <div className="flex flex-wrap gap-2">
                {OCEAN_LABELS.map(o => (
                  <span key={o.id} className="text-xs px-2 py-0.5 rounded bg-blue-900/30 text-blue-200 border border-blue-700/40">
                    {o.name}
                  </span>
                ))}
              </div>
            </div>
            {/* 特征卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredFeatures.map(f => {
                const meta = FEATURE_LABELS[f.type]
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFeature(f)}
                    className="text-left p-3 rounded border border-ink-600 bg-ink-800/60 hover:border-emerald-500/60 hover:bg-ink-700/60 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: meta.color }}>{meta.icon}</span>
                      <span className="text-sm font-serif text-parchment-50">{f.name}</span>
                      <span className="text-[10px] text-ink-500 ml-auto">
                        {meta.label}{f.importance === 3 ? ' · 重要' : ''}
                      </span>
                    </div>
                    <div className="text-[10px] text-ink-500 tabular-nums">
                      位置：{f.labelPos[0].toFixed(1)}°, {f.labelPos[1].toFixed(1)}°
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <div className="flex rounded bg-ink-700/60 border border-ink-600 overflow-hidden text-xs mb-4 w-fit">
              {(['all', 'china', 'world'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setTerritoryRegion(r)}
                  className={`px-3 py-1.5 transition-colors ${
                    territoryRegion === r
                      ? 'bg-emerald-700/40 text-emerald-300'
                      : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
                  }`}
                >
                  {r === 'all' ? '全部' : r === 'china' ? '🇨🇳 中国' : '🌍 世界'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {TERRITORY_FILES.filter(f => territoryRegion === 'all' || f.region === territoryRegion).map(f => {
                const era = eras.find(e => e.id === f.id)
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedTerritory({ id: f.id, region: f.region, era })}
                    className="text-left p-3 rounded border border-ink-600 bg-ink-800/60 hover:border-emerald-500/60 hover:bg-ink-700/60 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-serif" style={{ color: era?.color ?? '#c89a5b' }}>
                        {era?.name ?? f.id}
                      </span>
                      {era && (
                        <span className="text-[10px] text-ink-500">
                          {era.startYear < 0 ? `BC ${-era.startYear}` : era.startYear} ~ {era.endYear < 0 ? `BC ${-era.endYear}` : era.endYear}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-ink-500">
                      {f.region === 'china' ? '🇨🇳 中国朝代' : '🌍 世界文明'} · GeoJSON 已就绪
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* 自然地理详情弹窗 */}
      {selectedFeature && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
          onClick={() => setSelectedFeature(null)}
        >
          <div
            className="relative w-full max-w-lg bg-ink-800 rounded-lg border border-emerald-700/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-emerald-700/30 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-ink-500 mb-1">
                  {FEATURE_LABELS[selectedFeature.type].icon} {FEATURE_LABELS[selectedFeature.type].label}
                </div>
                <h3 className="text-xl font-serif text-emerald-300">{selectedFeature.name}</h3>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-ink-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div>
                <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">🗺️ 位置</div>
                <MiniMap
                  focusNode={{
                    title: selectedFeature.name,
                    year: 0,
                    location: selectedFeature.name,
                    importance: (selectedFeature.importance ?? 1) as 1 | 2 | 3,
                    coordinates: selectedFeature.labelPos,
                  }}
                  allNodes={[{
                    title: selectedFeature.name,
                    year: 0,
                    location: selectedFeature.name,
                    importance: (selectedFeature.importance ?? 1) as 1 | 2 | 3,
                    coordinates: selectedFeature.labelPos,
                  }]}
                  onJumpToMap={() => {
                    setMapFocus({ center: selectedFeature.labelPos, zoom: 4, label: selectedFeature.name })
                    setYear(0)
                    setSelectedFeature(null)
                  }}
                />
                <div className="text-xs text-ink-400 tabular-nums mt-2">
                  经度 {selectedFeature.labelPos[0].toFixed(2)}°, 纬度 {selectedFeature.labelPos[1].toFixed(2)}°
                </div>
              </div>
              <div>
                <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">📐 几何数据点</div>
                <div className="text-parchment-50">{selectedFeature.geometry.length} 个点</div>
              </div>
              <div>
                <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">⭐ 重要性</div>
                <div className="text-parchment-50">
                  {selectedFeature.importance === 3 ? '⭐⭐⭐ 重要' : selectedFeature.importance === 2 ? '⭐⭐ 中等' : '⭐ 一般'}
                </div>
              </div>
              <div className="text-xs text-ink-500 italic pt-2 border-t border-ink-700">
                💡 在主地图视图（顶栏"🗺️ 地图"）拖动时间轴可看到该特征
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 疆域详情弹窗 */}
      {selectedTerritory && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
          onClick={() => setSelectedTerritory(null)}
        >
          <div
            className="relative w-full max-w-lg bg-ink-800 rounded-lg border border-emerald-700/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-emerald-700/30 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-ink-500 mb-1">🏛️ 疆域变迁</div>
                <h3 className="text-xl font-serif text-emerald-300">
                  {selectedTerritory.era?.name ?? selectedTerritory.id}
                </h3>
                {selectedTerritory.era && (
                  <div className="text-xs text-ink-400 mt-0.5 tabular-nums">
                    {selectedTerritory.era.startYear < 0 ? `BC ${-selectedTerritory.era.startYear}` : selectedTerritory.era.startYear} ~ {selectedTerritory.era.endYear < 0 ? `BC ${-selectedTerritory.era.endYear}` : selectedTerritory.era.endYear}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedTerritory(null)}
                className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-ink-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {selectedTerritory.era?.shortDesc && (
                <div>
                  <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">📜 概述</div>
                  <div className="text-parchment-100 leading-relaxed">{selectedTerritory.era.shortDesc}</div>
                </div>
              )}

              {/* 疆域缩略地图 */}
              <div>
                <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">🗺️ 都城/中心位置</div>
                {(() => {
                  const center = ERA_CENTERS[selectedTerritory.id] ?? (
                    selectedTerritory.region === 'china' ? [108.94, 34.34] : [0, 30]
                  ) as [number, number]
                  const title = selectedTerritory.era?.name ?? selectedTerritory.id
                  const year = selectedTerritory.era
                    ? Math.round((selectedTerritory.era.startYear + selectedTerritory.era.endYear) / 2)
                    : 0
                  return (
                    <>
                      <MiniMap
                        focusNode={{
                          title,
                          year,
                          location: title,
                          importance: 3,
                          coordinates: center,
                        }}
                        allNodes={[{
                          title,
                          year,
                          location: title,
                          importance: 3,
                          coordinates: center,
                        }]}
                        onJumpToMap={() => {
                          setMapFocus({ center, zoom: 4, label: title })
                          setYear(year)
                          setSelectedTerritory(null)
                        }}
                      />
                      <div className="text-xs text-ink-400 tabular-nums mt-2">
                        经度 {center[0].toFixed(2)}°, 纬度 {center[1].toFixed(2)}°
                      </div>
                    </>
                  )
                })()}
              </div>

              <div>
                <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">🗺️ 数据源</div>
                <div className="text-xs text-ink-400 font-mono break-all">
                  public/geo/{selectedTerritory.region === 'china' ? 'china' : 'world/eras'}/{selectedTerritory.id}.geojson
                </div>
              </div>
              <div className="text-xs text-ink-500 italic pt-2 border-t border-ink-700">
                💡 在主地图视图（顶栏"🗺️ 地图"）点击该朝代查看疆域渲染
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
