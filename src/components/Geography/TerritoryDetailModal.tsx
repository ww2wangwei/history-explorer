/**
 * TerritoryDetailModal — 疆域详情弹窗
 *
 * 性能优化要点：
 * 1. 弹窗挂载后，先渲染 header + 骨架占位（首帧 ~10ms 完成）
 * 2. 下一帧 requestAnimationFrame 后才渲染重组件（大地图、Markdown 区、第二个 MiniMap）
 * 3. 这把"点击→弹窗可见"的响应延迟从一次同步重渲（~300-800ms）拆成两次串行任务，
 *    用户体验上点开是"立即可见"，重内容稍后出现。
 */
import { useEffect, useState, memo } from 'react'
import TerritoryMapThumb from './TerritoryMapThumb'
import MarkdownText from './MarkdownText'
import MiniMap from '@/components/Figures/MiniMap'
import { OverviewRichContent } from '@/components/ui/OverviewRichContent'
import { TERRITORY_FILES } from '@/data/territory-files'
import { ERA_CENTERS } from '@/data/era-centers'
import { getProvincesForTerritory, type Province } from '@/data/china-provinces'
import { getCountriesForEmpire, EMPIRE_COUNTRIES, COUNTRIES } from '@/data/empire-countries'
import { HISTORICAL_CAPITALS } from '@/data/historical-capitals'
import type { Era } from '@/types'
import type { FeatureCollection } from 'geojson'

/**
 * ⚡ 模块级查找表 — 让 TerritoryDetailModal 内部所有派生数据都是稳定引用。
 * 每次 selectedTerritory prop 变化时，这些值都不会重新计算，浏览器也不重排 SVG。
 */
const EMPTY_LABEL_POINTS: any[] = []
const EMPTY_STRINGS: string[] = []

// 按 territoryId 缓存：地图用的 LabelPoint[]（中国朝代 = getProvincesForTerritory；世界帝国 = 转 lat/lon）
const PROVINCE_POINTS_BY_ID: Record<string, any[]> = {}
const COUNTRY_CODES_BY_ID: Record<string, string[]> = {}
const PROVINCE_NAMES_BY_ID: Record<string, string[]> = {}
// 是否是"历史都邑"标注（春战国、三国等没有现代省份对应的朝代）
const IS_HISTORICAL_CAPITAL_BY_ID: Record<string, boolean> = {}
for (const f of TERRITORY_FILES) {
  if (f.region === 'china') {
    // ⚡ getProvincesForTerritory —— 内含历史都邑 + TERRITORY_FALLBACK 回退
    const pts: Province[] = getProvincesForTerritory(f.id)
    PROVINCE_POINTS_BY_ID[f.id] = pts
    PROVINCE_NAMES_BY_ID[f.id] = pts.map(p => p.name)
    IS_HISTORICAL_CAPITAL_BY_ID[f.id] = !!HISTORICAL_CAPITALS[f.id]
  } else {
    // getCountriesForEmpire 已经做了 EMPIRE_FALLBACK 回退 + 转 LabelPoint
    const pts = getCountriesForEmpire(f.id)
    PROVINCE_POINTS_BY_ID[f.id] = pts
    PROVINCE_NAMES_BY_ID[f.id] = pts.map(p => p.name)
    COUNTRY_CODES_BY_ID[f.id] = EMPIRE_COUNTRIES[f.id] ?? []
  }
}

export interface TerritoryDetailModalProps {
  territoryId: string
  region: 'china' | 'world'
  era?: Era
  geojson?: FeatureCollection | null
  onClose: () => void
  onJumpToMap: (center: [number, number], year: number, label: string) => void
}

function TerritoryDetailModalInner({ territoryId, region, era: eraProp, geojson, onClose, onJumpToMap }: TerritoryDetailModalProps) {
  // 🚦 懒加载开关：true 时显示重组件，false 时显示骨架占位
  const [showHeavy, setShowHeavy] = useState(false)

  useEffect(() => {
    // 弹窗刚挂载：让浏览器先把轻的 header 渲染出来，下一帧再解锁重的部分
    // 用 rAF 而不是 setTimeout(_,0)：rAF 与浏览器渲染管线对齐，效果更稳定
    const raf = requestAnimationFrame(() => setShowHeavy(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // 反查 TERRITORY_FILES 拿 fallbackColor（避免塞进 era 里——era 数据来自 eras.json）
  const era = eraProp
  const tf = TERRITORY_FILES.find(f => f.id === territoryId)
  const fallbackColor = tf?.fallbackColor ?? era?.color ?? '#5b9bc8'

  // ⚡ 模块级查找：provincePoints 按 (id, region) 派生并缓存为稳定引用
  const provincePoints = PROVINCE_POINTS_BY_ID[territoryId] ?? EMPTY_LABEL_POINTS
  const countryCodes = COUNTRY_CODES_BY_ID[territoryId] ?? EMPTY_STRINGS
  const provinceNames = PROVINCE_NAMES_BY_ID[territoryId] ?? EMPTY_STRINGS
  const center: [number, number] = ERA_CENTERS[territoryId] ?? (
    region === 'china' ? [108.94, 34.34] : [0, 30]
  )
  const title = era?.name ?? territoryId
  const midYear = era ? Math.round((era.startYear + era.endYear) / 2) : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-emerald-700/40 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="疆域详情"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 朝代色带 — 轻组件，立刻渲染 */}
        {era && (
          <div
            className="h-2 rounded-t-lg"
            style={{ background: fallbackColor }}
          />
        )}

        {/* Header — 轻组件，立刻渲染 */}
        <div className="px-6 py-4 border-b border-emerald-700/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-ink-300 mb-1">
              🏛️ 疆域变迁 · {region === 'china' ? '🇨🇳 中国' : '🌍 世界'}
            </div>
            <h3 className="text-xl font-serif text-emerald-300">{title}</h3>
            {era && (
              <div className="text-xs text-ink-400 mt-0.5 tabular-nums">
                {era.startYear < 0 ? `BC ${-era.startYear}` : era.startYear} ~ {era.endYear < 0 ? `BC ${-era.endYear}` : era.endYear}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-ink-300 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          {/* 🗺️ 大疆域地图 — 重的：TerritoryMapThumb 含 d3-geo projection + 世界底图 */}
          {showHeavy ? (
            geojson ? (
              <div className="rounded-lg overflow-hidden border border-emerald-700/40 bg-ink-900/40">
                <TerritoryMapThumb
                  geojson={geojson}
                  fallbackColor={fallbackColor}
                  className="w-full h-auto"
                  alt={`${territoryId} 详细疆域图`}
                  center={center}
                  label={title}
                  provinces={region === 'china' ? provincePoints : (provincePoints as any)}
                  cacheId={`${territoryId}-detail`}
                />
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-ink-300 bg-ink-900/30 rounded">
                暂无边界数据
              </div>
            )
          ) : (
            // 骨架占位 — 与真实地图尺寸一致，避免内容跳动
            <div className="rounded-lg overflow-hidden border border-emerald-700/40 bg-ink-900/30 animate-pulse" style={{ aspectRatio: '16/9' }}>
              <div className="w-full h-full flex items-center justify-center text-xs text-ink-400">
                🗺️ 疆域图加载中...
              </div>
            </div>
          )}

          {/* 文字描述区 — 全部 MarkdownText 重组件，下一帧渲染 */}
          {showHeavy && (
            <>
              {/* 一句话概述 */}
              {era?.shortDesc && (
                <div className="text-parchment-50 leading-relaxed italic border-l-2 border-emerald-500/50 pl-3">
                  <MarkdownText content={era.shortDesc} />
                </div>
              )}

              {/* 完整介绍 */}
              {era?.description && (
                <div>
                  <div className="text-xs text-ink-300 uppercase tracking-wider mb-1.5">📜 详细介绍</div>
                  <div className="text-parchment-50 leading-relaxed">
                    <MarkdownText content={era.description} />
                  </div>
                </div>
              )}

              {/* 富内容 */}
              {era && <OverviewRichContent item={era as any} />}

              {/* 核心要点 */}
              {era?.keyPoints && era.keyPoints.length > 0 && (
                <div>
                  <div className="text-xs text-ink-300 uppercase tracking-wider mb-1.5">🎯 核心要点</div>
                  <ul className="space-y-1">
                    {era.keyPoints.map((kp, i) => (
                      <li key={i} className="flex items-start gap-2 text-parchment-50">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span><MarkdownText content={kp} /></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 关键事件 */}
              {era?.quickEvents && era.quickEvents.length > 0 && (
                <div>
                  <div className="text-xs text-ink-300 uppercase tracking-wider mb-1.5">⚡ 关键事件</div>
                  <div className="space-y-2">
                    {era.quickEvents.map((ev, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="text-xs text-emerald-300 tabular-nums whitespace-nowrap mt-0.5">
                          {ev.year < 0 ? `BC ${-ev.year}` : ev.year}
                        </div>
                        <div>
                          <div className="text-parchment-50"><MarkdownText content={ev.title} /></div>
                          <div className="text-[11px] text-ink-300 mt-0.5"><MarkdownText content={ev.desc} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 历史意义 */}
              {era?.legacy && (
                <div>
                  <div className="text-xs text-ink-300 uppercase tracking-wider mb-1.5">🌟 历史意义</div>
                  <div className="text-parchment-50 leading-relaxed">
                    <MarkdownText content={era.legacy} />
                  </div>
                </div>
              )}

              {/* 对应现代省份/地区（中国朝代时）；早期朝代改用历史都邑（齐临淄、晋绛…） */}
              {region === 'china' && provinceNames.length > 0 && (
                <div>
                  <div className="text-xs text-ink-300 uppercase tracking-wider mb-1.5">
                    📍 {IS_HISTORICAL_CAPITAL_BY_ID[territoryId] ? '主要诸侯国都邑' : '对应现代省/地区'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {provinceNames.map(name => (
                      <span key={name} className="text-xs px-2 py-0.5 rounded bg-ink-800 border border-ink-600 text-parchment-200">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 对应覆盖的现代国家（世界帝国时） */}
              {region === 'world' && countryCodes.length > 0 && (
                <div>
                  <div className="text-xs text-ink-300 uppercase tracking-wider mb-1.5">🌍 对应覆盖的现代国家</div>
                  <div className="flex flex-wrap gap-1.5">
                    {countryCodes.map(name => {
                      const cn = COUNTRIES[name]?.name ?? name
                      return (
                        <span key={name} className="text-xs px-2 py-0.5 rounded bg-ink-800 border border-ink-600 text-parchment-200">
                          {cn}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 都城/中心位置 — MiniMap 也是重组件，留在第二阶段 */}
              <div>
                <div className="text-xs text-ink-300 uppercase tracking-wider mb-1.5">🗺️ 都城/中心位置</div>
                <MiniMap
                  focusNode={{
                    title,
                    year: midYear,
                    location: title,
                    importance: 3,
                    coordinates: center,
                  }}
                  allNodes={[{
                    title,
                    year: midYear,
                    location: title,
                    importance: 3,
                    coordinates: center,
                  }]}
                  onJumpToMap={() => onJumpToMap(center, midYear, title)}
                />
                <div className="text-xs text-ink-400 tabular-nums mt-2">
                  经度 {center[0].toFixed(2)}°, 纬度 {center[1].toFixed(2)}°
                </div>
              </div>

              <div>
                <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">🗺️ 数据源</div>
                <div className="text-xs text-ink-400 font-mono break-all">
                  geo/{region === 'china' ? 'china' : 'world/eras'}/{territoryId}.geojson
                </div>
              </div>
              <div className="text-xs text-ink-300 italic pt-2 border-t border-ink-700">
                💡 在主地图视图（顶栏"🗺️ 地图"）点击该朝代查看疆域渲染
              </div>
            </>
          )}

          {/* 轻量骨架占位（在重组件渲染前替代整个文字区） */}
          {!showHeavy && (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-ink-700/50 rounded w-3/4" />
              <div className="h-4 bg-ink-700/50 rounded w-5/6" />
              <div className="h-4 bg-ink-700/50 rounded w-2/3" />
              <div className="h-4 bg-ink-700/50 rounded w-4/5 mt-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const TerritoryDetailModal = memo(TerritoryDetailModalInner)
export default TerritoryDetailModal