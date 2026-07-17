import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps'
import { feature } from 'topojson-client'
import { geoEqualEarth, geoPath } from 'd3-geo'
import { useHistoryStore } from '@/store/useHistoryStore'
import { getActiveErasAtYear, splitByTimeWindow } from '@/utils/geo'
import { CATEGORY_COLORS } from '@/types'
import TiandituTiles from './TiandituTiles'
import type { Era, HistoricalEvent } from '@/types'
import eventsData from '@/data/events.json'
import erasData from '@/data/eras.json'
import {
  CONTINENTS,
  SEAS,
  RIVERS,
  MOUNTAINS,
  REGIONS,
  GEO_FEATURE_STYLES,
  type GeoFeature,
} from '@/data/geographic-features'
import { OCEAN_LABELS } from '@/data/oceans'

const events = eventsData as HistoricalEvent[]
const eras = erasData as Era[]

// 基础世界地图：按需加载 50m（天地图瓦片为底图）
let cachedWorldGeo: GeoJSON.FeatureCollection | null = null
let worldGeoPromise: Promise<GeoJSON.FeatureCollection> | null = null

async function loadWorldGeoBase(): Promise<GeoJSON.FeatureCollection> {
  if (cachedWorldGeo) return cachedWorldGeo
  if (!worldGeoPromise) {
    worldGeoPromise = import('world-atlas/countries-50m.json').then(mod => {
      const raw = mod.default ?? mod
      const geo = feature(raw as any, (raw as any).objects.countries) as unknown as GeoJSON.FeatureCollection
      cachedWorldGeo = geo
      return geo
    })
  }
  return worldGeoPromise
}

const PROJECTION_CONFIG = {
  scale: 175,
  center: [0, 20] as [number, number],
}

const WIDTH = 980
const HEIGHT = 500

// 单例 projection 实例（用于 onMove 时反算 lng/lat）
// 与 RSM 内部一致：geoEqualEarth + translate([WIDTH/2, HEIGHT/2]) + scale 175 + center (0,20)
// 注意：RSM 在 ComposableMap 创建时会先 .translate([width/2, height/2])，
// 然后应用 projectionConfig 中的 scale/center/rotate/parallels
// 这里必须复现完全相同的初始化顺序，否则反算 lng/lat 偏差
const projectionInstance = geoEqualEarth()
  .translate([WIDTH / 2, HEIGHT / 2])
  .scale(175)
  .center([0, 20]) as any

// 把 d3-zoom 的 transform 反算回地图 center (lng/lat)
// getCoords 与 RSM 内部一致：(w*k - w)/2 计算偏移
function getCoordsFromRSM(w: number, h: number, tx: number, ty: number, k: number): [number, number] {
  const xOffset = (w * k - w) / 2
  const yOffset = (h * k - h) / 2
  return [w / 2 - (xOffset + tx) / k, h / 2 - (yOffset + ty) / k]
}
function invertFromD3Zoom(tx: number, ty: number, k: number, width: number, height: number): [number, number] | null {
  try {
    const [px, py] = getCoordsFromRSM(width, height, tx, ty, k)
    const inv = projectionInstance.invert([px, py])
    if (!Array.isArray(inv) || !Number.isFinite(inv[0]) || !Number.isFinite(inv[1])) return null
    return inv as [number, number]
  } catch {
    return null
  }
}

function getChinaEraAtYear(year: number): Era | null {
  const chinaEras = eras.filter(e => e.region === 'china')
  return chinaEras.find(e => year >= e.startYear && year <= e.endYear) ?? null
}

function isEventVisibleAtYear(event: HistoricalEvent, year: number, window = 50): boolean {
  return Math.abs(year - event.year) <= window
}

// 判断 GeoJSON feature 是否属于中国朝代
function isChinaEraFeature(geo: any, activeChinaEra: Era | null): boolean {
  if (!activeChinaEra || !geo?.properties?.id) return false
  return geo.properties.id === activeChinaEra.id
}

// 判断 GeoJSON feature 是否属于世界朝代（非中国）
function isWorldEraFeature(geo: any, worldEras: Era[]): Era | null {
  if (!geo?.properties?.id) return null
  return worldEras.find(e => e.id === geo.properties.id) ?? null
}

export default function WorldMap() {
  const {
    currentYear, selectEra, selectEvent, filters,
    mapFocusTarget, setMapFocus,
    eraOpacities, setEraOpacity, resetEraOpacities,
    mapCenter, mapZoom, setMapPosition, setMapZoom,
  } = useHistoryStore()

  const [chinaGeoData, setChinaGeoData] = useState<GeoJSON.FeatureCollection | null>(null)
  // 世界朝代 GeoJSON 数据缓存（key=eraId）
  const [worldEraGeoCache, setWorldEraGeoCache] = useState<Record<string, GeoJSON.FeatureCollection>>({})
  // 地图视图状态（center/zoom 现在用 store，让 Dashboard / CrossRef / 重置按钮跨组件生效）
  const mapPosition = { center: mapCenter, zoom: mapZoom }
  // 容器尺寸（用于响应式）
  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 })
  const containerRef = useRef<HTMLDivElement>(null)
  // 节流 onMove 给 React state 写入（避免频繁 setMapPosition 触发 RSM 重置 transform）
  const lastMapSyncRef = useRef<number>(0)
  // 只有 zoom 真的改变时才同步 React state（拖动期间 zoom 不变，跳过以避免整树重渲染）
  const lastReactZoomRef = useRef<number>(1)

  const activeChinaEra = getChinaEraAtYear(currentYear)
  const activeEras = getActiveErasAtYear(eras, currentYear)
  // 当前活跃的世界朝代（非中国，且有 GeoJSON 文件）
  const activeWorldEras = activeEras.filter(e => e.region !== 'china' && e.geoFile)

  // 用户在右侧详情面板选中的朝代（用于在地图上显示都城 marker，无论有无 geoFile）
  const selectedEra = useHistoryStore(s => s.selectedEraId ? eras.find(e => e.id === s.selectedEraId) ?? null : null)

  // 时间窗口过滤：当前年份 ±N 年内的朝代/事件为正常显示，其他为 ghost
  const [timeWindow, setTimeWindow] = useState<number>(50)  // 0 = 全部 inRange
  // 时间窗面板展开/收起（默认收起，不挡地图）
  const [timeWindowOpen, setTimeWindowOpen] = useState<boolean>(false)
  // 同时活跃文明面板展开/收起
  const [erasPanelOpen, setErasPanelOpen] = useState<boolean>(false)
  const isInRange = <T extends { startYear?: number; endYear?: number; year?: number }>(item: T) => {
    if (timeWindow === 0) return true
    const { inRange } = splitByTimeWindow([item], currentYear, timeWindow)
    return inRange.length > 0
  }

  // 应用筛选后的事件
  const visibleEvents = events.filter(e => {
    if (!isEventVisibleAtYear(e, currentYear)) return false
    if (filters.categories.length > 0 && !filters.categories.includes(e.category)) return false
    if (filters.regions.length > 0 && !filters.regions.includes(e.region)) return false
    if (e.importance < filters.minImportance) return false
    return true
  })

  // 响应聚焦请求（程序触发，如 mapFocusTarget）
  useEffect(() => {
    if (!mapFocusTarget) return
    setMapPosition({
      center: mapFocusTarget.center,
      zoom: mapFocusTarget.zoom,
    })
  }, [mapFocusTarget])

  // URL ?focus=lng,lat,zoom,label 调试用：直接设置聚焦进入地图
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const focusParam = params.get('focus')
    if (!focusParam) return
    const [lng, lat, zoom, ...labelParts] = focusParam.split(',')
    const label = labelParts.join(',') || '定位'
    setMapFocus({
      center: [parseFloat(lng) || 0, parseFloat(lat) || 0],
      zoom: parseFloat(zoom) || 2,
      label,
    })
  }, [setMapFocus])

  // 监听容器尺寸变化（用于 HTML overlay 计算）
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect
      if (rect) {
        setContainerSize({ width: rect.width, height: rect.height })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // 同步 zoom/center 给天地图瓦片（用 onMove，避免轮询引起的 d3/React 状态错位）
  // onMove 在 wheel/touch/drag 时都会触发，比 onMoveEnd 更及时
  useEffect(() => {
    // 不再需要读 transform 轮询 — 改用 ZoomableGroup 的 onMove 回调
  }, [])

  // 加载中国朝代
  useEffect(() => {
    if (!activeChinaEra?.geoFile) {
      setChinaGeoData(null)
      return
    }
    fetch(`/geo/china/${activeChinaEra.geoFile}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setChinaGeoData(data))
      .catch(() => setChinaGeoData(null))
  }, [activeChinaEra?.id])

  // 懒加载世界朝代 GeoJSON（按需）
  useEffect(() => {
    activeWorldEras.forEach(era => {
      if (worldEraGeoCache[era.id]) return
      if (!era.geoFile) return
      fetch(`/geo/${era.geoFile}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setWorldEraGeoCache(prev => ({ ...prev, [era.id]: data }))
          }
        })
        .catch(() => { /* 忽略加载失败 */ })
    })
  }, [activeWorldEras.map(e => e.id).join(',')])

  // 按需加载 50m 世界地图（dynamic import）
  const [worldGeoBase, setWorldGeoBase] = useState<GeoJSON.FeatureCollection | null>(cachedWorldGeo)
  useEffect(() => {
    if (worldGeoBase) return
    let cancelled = false
    loadWorldGeoBase().then(geo => {
      if (!cancelled) setWorldGeoBase(geo)
    })
    return () => { cancelled = true }
  }, [worldGeoBase])

  // 天地图是否可用（Key 配置 + 瓦片加载成功）
  const [tiandituReady, setTiandituReady] = useState(false)
  const tiandituKey = import.meta.env.VITE_TIANDITU_KEY as string | undefined
  useEffect(() => {
    setTiandituReady(!!tiandituKey)
  }, [tiandituKey])

  // 合并的世界 GeoJSON（详细世界地图 + 中国朝代 + 世界朝代）
  const mergedWorldGeo = useMemo(() => {
    if (!worldGeoBase) return null
    const extraFeatures: GeoJSON.Feature[] = []
    if (chinaGeoData) {
      chinaGeoData.features.forEach(f => extraFeatures.push(f))
    }
    Object.values(worldEraGeoCache).forEach(gj => {
      gj.features.forEach(f => extraFeatures.push(f))
    })
    if (extraFeatures.length === 0) return worldGeoBase
    return {
      type: 'FeatureCollection' as const,
      features: [...worldGeoBase.features, ...extraFeatures],
    }
  }, [worldGeoBase, chinaGeoData, worldEraGeoCache])

  // 当前活跃的世界朝代列表（用于标记都城）
  const visibleWorldEras = useMemo(() => {
    return activeWorldEras
  }, [activeWorldEras])

  return (
    <div ref={containerRef} className="w-full h-full relative bg-ink-900" style={{ overflow: 'hidden' }}>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={PROJECTION_CONFIG}
        width={980}
        height={500}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#0f0e0c',
          overflow: 'visible',
        }}
      >
        <ZoomableGroup
          zoom={mapPosition.zoom}
          minZoom={0.5}
          maxZoom={6}
          center={mapPosition.center}
          onMove={(pos) => {
            // 关键策略：拖动期间不写 React state（d3 自己管 transform）。
            //   只在 zoom 跨级时写 store 中的 mapZoom，让 TiandituTiles 重算 z level。
            //   **不写 center**——避免 RSM useEffect 用新 center 重置 d3 transform，
            //   防止 d3 transform 与 React 重算的瓦片 attr_x 形成双重偏移（→ 黑屏）。
            if (!Number.isFinite(pos.zoom)) return
            if (Math.abs(pos.zoom - lastReactZoomRef.current) < 0.01) return
            lastReactZoomRef.current = pos.zoom
            setMapZoom(pos.zoom)
          }}
          onMoveEnd={(pos) => {
            // 关键设计：onMoveEnd 也不写 React state。
            //   - d3 自己维护 transform（用户拖动结果）— 让 d3 transform 决定屏幕位置
            //   - 任何对 React state 的修改会触发 RSM useEffect 重置 d3 transform + 瓦片 attr 重算，
            //     容易引入"瓦片 attr 与 d3 transform 错位"的视觉漂移
            //   - 用户拖动后的"位置"完全由 d3.transform 表达，不需要 React state 跟踪
            //   - 仅在程序触发（mapFocusTarget / 重置视图）才同步 React state
            // onMoveEnd 已被 bypassEvents 在 d3 侧处理，bypassEvents.current = true（不重复触发事件）
          }}
        >        {/* 天地图瓦片底图（SVG 内部，会跟随 zoom/center 变换） */}
        <TiandituTiles
          center={mapPosition.center}
          zoom={mapPosition.zoom}
        />
        {/* 大洲/海洋轮廓 — 不画轮廓（已被天地图瓦片覆盖），仅保留 hover 反馈 */}
        <Geographies geography={{ type: 'FeatureCollection', features: [
          ...CONTINENTS.map(cont => ({
            type: 'Feature' as const,
            properties: { name: cont.name, id: cont.id, kind: 'continent' },
            geometry: { type: 'Polygon' as const, coordinates: [cont.geometry] },
          })),
        ] }}>
          {({ geographies }) => (
            <g style={{ display: 'none' }}>
              {geographies.map(geo => (
                <Geography key={geo.rsmKey} geography={geo} />
              ))}
            </g>
          )}
        </Geographies>

        {/* 山脉/河流/海域/古都 — 均由天地图瓦片自带，不再叠加渲染 */}

        <Geographies geography={mergedWorldGeo ?? { type: 'FeatureCollection', features: [] }}>
          {({ geographies }) =>
            geographies.length === 0 ? (
              // 加载中 placeholder
              <g>
                <text
                  x={0}
                  y={0}
                  textAnchor="middle"
                  style={{ fill: '#5a5142', fontSize: 12 }}
                >
                  {worldGeoBase ? '无地理数据' : '加载世界地图中…'}
                </text>
              </g>
            ) : geographies.map(geo => {
              // 1. 中国朝代：纯透明，hover/pressed 也不变亮（用户要求零视觉反馈）
              if (isChinaEraFeature(geo, activeChinaEra) && activeChinaEra) {
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => selectEra(activeChinaEra.id)}
                    style={{
                      default: {
                        fill: 'transparent',
                        fillOpacity: 0,
                        stroke: 'transparent',
                        strokeWidth: 0,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      hover: {
                        fill: 'transparent',
                        fillOpacity: 0,
                        stroke: 'transparent',
                        strokeWidth: 0,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: 'transparent',
                        fillOpacity: 0,
                        stroke: 'transparent',
                        strokeWidth: 0,
                        outline: 'none',
                      },
                    }}
                  />
                )
              }

              // 2. 世界朝代：纯透明，hover/pressed 也不变亮
              const worldEra = isWorldEraFeature(geo, activeWorldEras)
              if (worldEra) {
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => selectEra(worldEra.id)}
                    style={{
                      default: {
                        fill: 'transparent',
                        fillOpacity: 0,
                        stroke: 'transparent',
                        strokeWidth: 0,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      hover: {
                        fill: 'transparent',
                        fillOpacity: 0,
                        stroke: 'transparent',
                        strokeWidth: 0,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: 'transparent',
                        fillOpacity: 0,
                        stroke: 'transparent',
                        strokeWidth: 0,
                        outline: 'none',
                      },
                    }}
                  />
                )
              }

              // 3. 其他国家（50m 矢量，仅作为命中区域，不画轮廓避免与天地图瓦片重叠）
              // 隐藏全部样式 — 天地图瓦片自己提供国界线
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: 'transparent',
                      fillOpacity: 0,
                      stroke: 'transparent',
                      strokeWidth: 0,
                      strokeOpacity: 0,
                      outline: 'none',
                      pointerEvents: 'none',  // 非朝代/事件国家不接收鼠标事件，hover 反馈由瓦片承担
                    },
                    hover: {
                      fill: 'transparent',
                      fillOpacity: 0,
                      stroke: 'transparent',
                      strokeWidth: 0,
                      outline: 'none',
                    },
                    pressed: {
                      fill: 'transparent',
                      outline: 'none',
                    },
                  }}
                />
              )
            })
          }
        </Geographies>

        {/* 海洋/区域标签已删除 — 天地图瓦片自带 */}

        {/* 河流/山脉标签已删除 — 天地图瓦片自带 */}

        {/* 大洋文字标签已删除 — 天地图瓦片自带 */}

        {/* 事件标记点 */}
        {visibleEvents.filter(e => e.coordinates).map(event => {
          const eventIsGhost = !isInRange(event)
          return (
            <Marker key={event.id} coordinates={event.coordinates!}>
              <g
                style={{ cursor: 'pointer', opacity: eventIsGhost ? 0.3 : 1 }}
                onClick={(e) => {
                  e.stopPropagation()
                  selectEvent(event.id)
                }}
              >
                {/* 透明 hit area，扩大点击区域（不影响视觉） */}
                <circle
                  r={12}
                  fill="transparent"
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                />
                {event.importance === 3 && (
                  <circle
                    r={10}
                    fill={CATEGORY_COLORS[event.category]}
                    opacity={0.25}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                <circle
                  r={event.importance === 3 ? 5 : event.importance === 2 ? 3.8 : 2.8}
                  fill={CATEGORY_COLORS[event.category]}
                  stroke="#fdf8f0"
                  strokeWidth={1}
                  style={{ pointerEvents: 'none' }}
                />
              <title>{`${event.title}（${event.year < 0 ? '公元前' + Math.abs(event.year) : event.year} 年）`}</title>
            </g>
          </Marker>
          )
        })}

        {/* 朝代都城 marker（统一小图钉：r=3 + 9px 标签） */}
        {selectedEra && selectedEra.capital && (
          <Marker key={`selected-${selectedEra.id}`} coordinates={selectedEra.capital}>
            <g style={{ cursor: 'pointer' }} onClick={() => selectEra(selectedEra.id)}>
              <circle r={3} fill={selectedEra.color} stroke="#fdf8f0" strokeWidth={1} />
              <text
                textAnchor="middle"
                y={-6}
                style={{ fill: selectedEra.color, fontSize: 9, fontFamily: 'serif', fontWeight: '600', paintOrder: 'stroke', stroke: '#0f0e0c', strokeWidth: 2.5, strokeLinejoin: 'round' }}
              >★ {selectedEra.name}</text>
            </g>
          </Marker>
        )}
        {activeChinaEra?.capital && (!selectedEra || selectedEra.id !== activeChinaEra.id) && (
          <Marker coordinates={activeChinaEra.capital}>
            <g>
              <circle r={3} fill="#c89a5b" stroke="#fdf8f0" strokeWidth={1} />
              <text textAnchor="middle" y={-6} style={{ fill: '#c89a5b', fontSize: 9, fontFamily: 'serif', fontWeight: '600', paintOrder: 'stroke', stroke: '#0f0e0c', strokeWidth: 2.5, strokeLinejoin: 'round' }}>★ {activeChinaEra.name}</text>
            </g>
          </Marker>
        )}
        {visibleWorldEras.filter(e => e.capital).slice(0, 4).map(era => (
          <Marker key={era.id} coordinates={era.capital!}>
            <g>
              <circle r={2.5} fill={era.color} stroke="#fdf8f0" strokeWidth={1} />
              <text textAnchor="middle" y={-7} style={{ fill: era.color, fontSize: 9, fontFamily: 'serif', paintOrder: 'stroke', stroke: '#0f0e0c', strokeWidth: 2.5, strokeLinejoin: 'round' }}>{era.name}</text>
            </g>
          </Marker>
        ))}
        </ZoomableGroup>
      </ComposableMap>

        {/* 当前朝代信息 */}
      {activeChinaEra && (
        <div className="absolute top-4 left-4 px-3 py-2 rounded bg-ink-800/95 backdrop-blur border border-ink-600 text-xs z-10 shadow-lg">
          <div className="text-ink-500 mb-1">中国朝代</div>
          <div className="text-bronze-400 font-serif text-base">
            {activeChinaEra.name}
          </div>
          <div className="text-ink-500 text-[10px] mt-1">
            {activeChinaEra.startYear < 0 ? '公元前' : ''}{Math.abs(activeChinaEra.startYear)} – {activeChinaEra.endYear < 0 ? '公元前' : ''}{Math.abs(activeChinaEra.endYear)}
          </div>
        </div>
      )}

      {/* 同时期活跃文明（带透明度调节） — 可收起 */}
      {activeEras.length > 0 && (
        <div className={`absolute bottom-4 left-4 ${erasPanelOpen ? 'max-w-md' : ''} px-3 py-2 rounded bg-ink-800/95 backdrop-blur border border-ink-600 text-xs z-10 shadow-lg transition-[max-width] duration-200`}>
          <div className="flex items-center justify-between mb-1.5">
            <button
              className="flex items-center gap-1.5 text-ink-500 hover:text-parchment-50 transition-colors"
              onClick={() => setErasPanelOpen(o => !o)}
              title={erasPanelOpen ? '收起' : '展开'}
            >
              <span className="text-[10px] leading-none">{erasPanelOpen ? '▼' : '▶'}</span>
              <span>同时活跃文明（{activeEras.length}）</span>
            </button>
            {Object.keys(eraOpacities).length > 0 && erasPanelOpen && (
              <button
                className="text-[10px] text-ink-500 hover:text-parchment-50 underline"
                onClick={resetEraOpacities}
              >
                重置透明度
              </button>
            )}
          </div>
          {erasPanelOpen && (
            <div className="flex flex-wrap gap-2">
              {activeEras.map(era => {
                const opacity = eraOpacities[era.id] ?? (era.region === 'china' ? 0.55 : 0.5)
                const isCustomized = eraOpacities[era.id] !== undefined
                return (
                  <div
                    key={era.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded"
                    style={{
                      background: `${era.color}30`,
                      border: `1px solid ${era.color}${isCustomized ? 'cc' : '60'}`,
                    }}
                  >
                    <button
                      className="text-[10px] font-medium"
                      style={{ color: era.color }}
                      onClick={() => selectEra(era.id)}
                    >
                      {era.name}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={opacity}
                      onChange={(e) => setEraOpacity(era.id, parseFloat(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      className="w-12 h-1 cursor-pointer opacity-70 hover:opacity-100"
                      style={{ accentColor: era.color }}
                      title={`${era.name} 透明度: ${Math.round(opacity * 100)}%`}
                    />
                    <span className="text-[9px] text-ink-500 w-6 text-right tabular-nums">
                      {Math.round(opacity * 100)}%
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 事件计数 */}
      <div className="absolute top-4 right-4 px-3 py-2 rounded bg-ink-800/95 backdrop-blur border border-ink-600 text-xs z-10 shadow-lg">
        <div className="text-ink-500">±{timeWindow} 年内事件</div>
        <div className="text-bronze-400 text-lg font-serif">{visibleEvents.length}</div>
      </div>

      {/* 时间窗口切换 — 可收起 */}
      <div className="absolute top-24 right-4 px-3 py-2 rounded bg-ink-800/95 backdrop-blur border border-ink-600 text-xs z-10 shadow-lg">
        <button
          className="flex items-center gap-1.5 text-ink-500 hover:text-parchment-50 transition-colors"
          onClick={() => setTimeWindowOpen(o => !o)}
          title={timeWindowOpen ? '收起' : '展开'}
        >
          <span className="text-[10px] leading-none">{timeWindowOpen ? '▼' : '▶'}</span>
          <span>地图时间窗</span>
          {!timeWindowOpen && (
            <span className="text-bronze-400 text-[10px] ml-1">
              ±{timeWindow === 0 ? '全部' : timeWindow}
            </span>
          )}
        </button>
        {timeWindowOpen && (
          <div className="flex items-center gap-1 mt-1.5">
            {[0, 50, 100, 200].map(n => (
              <button
                key={n}
                onClick={() => setTimeWindow(n)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  timeWindow === n
                    ? 'bg-bronze-600/40 text-bronze-400 border border-bronze-500/60'
                    : 'bg-ink-700/60 text-ink-400 hover:bg-ink-600 border border-ink-600'
                }`}
                title={n === 0 ? '显示全部朝代/事件' : `当前年份 ±${n} 年`}
              >
                {n === 0 ? '全部' : `±${n}`}
              </button>
            ))}
          </div>
        )}
      </div>


      {/* 地图聚焦提示 — 仅在 SVG 内部 marker 显示（跟随地图变换），
          右上角 fixed 浮层已移除，避免与 SVG marker 位置不一致。
          如需重置视图：用 Layout 头部的按钮或键盘 g reset。 */}

      {/* 缩放控制按钮 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-1 z-10">
        <button
          className="w-7 h-7 rounded bg-ink-800/90 backdrop-blur border border-ink-600 hover:bg-ink-700 text-bronze-400 text-base font-bold leading-none"
          onClick={() => {
            const svg = document.querySelector('.rsm-svg') as SVGSVGElement | null
            if (!svg) return
            const rect = svg.getBoundingClientRect()
            const evt = new WheelEvent('wheel', {
              deltaY: -100,
              clientX: rect.left + rect.width / 2,
              clientY: rect.top + rect.height / 2,
              bubbles: true,
              cancelable: true,
            })
            svg.dispatchEvent(evt)
          }}
          title="放大"
        >
          +
        </button>
        <button
          className="w-7 h-7 rounded bg-ink-800/90 backdrop-blur border border-ink-600 hover:bg-ink-700 text-bronze-400 text-base font-bold leading-none"
          onClick={() => {
            const svg = document.querySelector('.rsm-svg') as SVGSVGElement | null
            if (!svg) return
            const rect = svg.getBoundingClientRect()
            const evt = new WheelEvent('wheel', {
              deltaY: 100,
              clientX: rect.left + rect.width / 2,
              clientY: rect.top + rect.height / 2,
              bubbles: true,
              cancelable: true,
            })
            svg.dispatchEvent(evt)
          }}
          title="缩小"
        >
          −
        </button>
      </div>

      {/* 操作提示 */}
      <div className="absolute bottom-4 right-4 px-2.5 py-1.5 rounded bg-ink-800/90 backdrop-blur border border-ink-600 text-[10px] text-ink-500 z-10 leading-relaxed">
        🖱️ 滚轮缩放 · 拖拽平移 · 点击查看详情
      </div>
    </div>
  )
}