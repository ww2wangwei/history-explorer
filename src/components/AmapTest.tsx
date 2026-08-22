/**
 * AmapTest — 高德地图 (AMap) 完整版：
 *   底图 + 朝代都城 marker + 事件点 + 自然地理要素叠加图层（GeoFeatureFilter）。
 *
 * 历史说明：
 *   - TMapTest.tsx → QqMapTest.tsx → AmapTest.tsx
 *   - 用户可手动切换「山脉/河流/海洋」等叠加层（同时控制 AMap 自带的 POI 标签、
 *     水系标注等的 setFeatures 开关）。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { loadAmap } from '@/lib/amap/loader'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useMapLayersStore } from '@/store/useMapLayersStore'
import { useAIStore } from '@/store/useAIStore'
import { getAmapKey, getAmapSecurityCode, getOwmApiKey, useApiKeysStore } from '@/store/useApiKeysStore'
import { useMapStyleStore, STYLE_META, type MapStyleKey } from '@/store/useMapStyleStore'
import { getActiveErasAtYear } from '@/utils/geo'
import { bingImage, fallbackKeyword } from '@/utils/geoImage'
import { summarizeEra, summarizeEvent } from '@/utils/summarize'
import { wgs84ToGcj02 } from '@/utils/coordsTransform'
// 🎯 性能优化：data 改用懒加载共享 loader — eras.json + events.json 从主 bundle 拆出
// 🎯 修复：之前 const eras = getEras() 在模块加载时执行，那时 _data 还是 EMPTY → 永久缓存 []，
//   导致 markers 永远为 0。改用函数调用 + useCoreDataReady gate。
import { getEras, getEvents, useCoreDataReady } from '@/data/sharedDataLoader'
import { createMapMarker } from '@/lib/amap/markers'
import { getClampedScreenPoint } from '@/lib/amap/mapHelpers'
import { getReopenEvent } from '@/lib/reopenRoutes'
import { renderGeoFeatures } from '@/components/Map/GeoFeatureLayer'
import GeoFeatureFilter from '@/components/Map/GeoFeatureFilter'
import GraticuleLayer from '@/components/Map/GraticuleLayer'
import CloudOverlayLayer from '@/components/Map/CloudOverlayLayer'
import type { ReopenKind } from '@/lib/reopenRoutes'
import type { Era } from '@/types'

function getChinaEraAtYear(year: number, eras: Era[]): Era | null {
  const chinaEras = eras.filter(e => e.region === 'china')
  return chinaEras.find(e => year >= e.startYear && year <= e.endYear) ?? null
}

interface InfoCard {
  label: string
  snippet: string
  coverImageUrl: string
  lng: number
  lat: number
  screenX: number
  screenY: number
  source?: 'hover' | 'jump'
  reopenLabel?: string
  reopenKind?: ReopenKind
  reopenEraId?: string
  reopenEventYear?: number
  reopenFeatureId?: string
  reopenTerritoryId?: string
  reopenTerritoryRegion?: 'china' | 'world'
  reopenWarId?: string
  reopenMwKey?: string
  reopenNodeIndex?: string | number
}

/** 用户点击自然地理要素时弹出的详情卡片（与 InfoCardView 同结构） */
interface GeoFeatureCard {
  feature: {
    id: string
    name: string
    type: string
    description?: string
    imageUrl?: string
    imageCredit?: string
    labelPos: [number, number]
  }
  screenX: number
  screenY: number
  source: 'click' | 'hover'
}

export default function AmapTest() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const customTileLayerRef = useRef<any>(null)  // 自定义 TileLayer（如 OpenTopoMap）
  const markersRef = useRef<any[]>([])
  const labelsRef = useRef<any[]>([])
  const eventMarkersRef = useRef<any[]>([])
  const eventLabelsRef = useRef<any[]>([])

  const [error, setError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [infoCard, setInfoCard] = useState<InfoCard | null>(null)
  const [geoCard, setGeoCard] = useState<GeoFeatureCard | null>(null)
  const backInProgressRef = useRef(false)
  // 跨 viewMode 切换保留视图状态（中心/缩放/俯仰/旋转）
  const savedViewStateRef = useRef<{ lng: number; lat: number; zoom: number; pitch: number; rotation: number } | null>(null)

  const currentYear = useHistoryStore(s => s.currentYear)
  // markers 直接跟随 currentYear（不再 debounce）。
  // 之前 80ms debounce 让 markers 拖拽时停在原位，
  // 但地图 setCenter 在跟 → markers 看起来"消失"了。
  // React 18 自动 batching 已合并同帧内的多次 setState，
  // 不需要手动 debounce。
  const markerYear = currentYear
  // 🎯 关键修复：数据加载状态（之前 eras/events 是模块加载时的 []，永远不变）
  const dataReady = useCoreDataReady()
  const eras = useMemo(() => (dataReady ? getEras() : []), [dataReady])
  const events = useMemo(() => (dataReady ? getEvents() : []), [dataReady])
  const selectEra = useHistoryStore(s => s.selectEra)
  const selectEvent = useHistoryStore(s => s.selectEvent)
  const setYear = useHistoryStore(s => s.setYear)
  const mapFocusTarget = useHistoryStore(s => s.mapFocusTarget)
  const setMapFocus = useHistoryStore(s => s.setMapFocus)
  // 监听 apiKeysStore — 用户改 key 后 map 自动重建
  const amapKeyFromStore = useApiKeysStore(s => s.amapKey)
  const amapSecurityFromStore = useApiKeysStore(s => s.amapSecurityCode)
  // 监听视图模式 (2D/3D) — AMap viewMode 必须在创建时指定，切换会重建
  const viewMode = useMapStyleStore(s => s.viewMode)

  // 初始化 AMap（viewMode 变化时重建）
  useEffect(() => {
    const key = getAmapKey()
    if (!key || !containerRef.current) {
      setError('未配置高德地图 Key。可在右上"更多"菜单 → 🔑 API Keys 中填写，或在 .env 设置 VITE_AMAP_KEY。')
      return
    }

    let cancelled = false
    let createdMap: any = null
    const timeoutIds: number[] = []
    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn()
      }, delay)
      timeoutIds.push(id)
    }

    setError(null)
    const securityCode = getAmapSecurityCode()
    loadAmap(key, securityCode)
      .then(async () => {
        if (cancelled || !containerRef.current) return
        const A = (window as any).AMap
        if (!A) { setError('AMap undefined'); return }

        await new Promise<void>(resolve => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve())
          })
        })
        if (cancelled || !containerRef.current) return
        const container = containerRef.current

        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }

        setError(null)
        const initialStyle = useMapStyleStore.getState().style
        const initialMeta = STYLE_META[initialStyle]
        // 跨 viewMode 切换时保留视图状态
        const saved = savedViewStateRef.current
        const center = saved
          ? new A.LngLat(saved.lng, saved.lat)
          : new A.LngLat(44, 34) // 美索不达米亚（文明摇篮）
        const initialZoom = saved?.zoom ?? 4
        const mapOpts: any = {
          center,
          zoom: initialZoom,
          viewMode: useMapStyleStore.getState().viewMode,
          draggable: true,
          scrollWheel: true,
          doubleClickZoom: true,
          zoomControl: false,    // 用我们自定义按钮
          mapStyle: initialMeta.kind === 'amap' && initialMeta.amapStyle
            ? initialMeta.amapStyle
            : 'amap://styles/darkblue', // 兜底使用 darkblue
        }
        // 3D 模式设置 pitch / rotation（保存在 store 里）
        if (useMapStyleStore.getState().viewMode === '3D') {
          // 仅当 saved.pitch > 5° 才视为"之前的 3D 状态"，否则用 store 默认值
          // (避免从 2D 切换时使用 saved.pitch=0 看上去还是平面)
          const storePitch = useMapStyleStore.getState().pitch
          const storeRot = useMapStyleStore.getState().rotation
          mapOpts.pitch = (saved?.pitch && saved.pitch > 5) ? saved.pitch : storePitch
          mapOpts.rotation = (saved?.rotation !== undefined && saved.rotation !== null)
            ? saved.rotation
            : storeRot
        }
        const map = new A.Map(container, mapOpts)
        createdMap = map

        // 3D 模式：加 ControlBar（俯仰角/旋转角控件）
        if (useMapStyleStore.getState().viewMode === '3D' && A.ControlBar) {
          try {
            const ctrl = new A.ControlBar({ position: { top: '80px', right: '10px' } })
            map.addControl(ctrl)
          } catch { /* ignore */ }
        }
        schedule(() => {
          try { map.resize?.() } catch { /* noop */ }
        }, 200)
        mapRef.current = map
        ;(window as any).__amapTestMap = map
        setError(null)
        setMapReady(true)

        // 地图任意点点击：反向地理编码 → 弹 AI 窗口介绍这块地
        // 必须挂在 init effect 里，否则 viewMode 切换重建后 handler 不重新挂上
        const onMapClick = (e: any) => {
          const lng = e?.lnglat?.getLng?.() ?? e?.lnglat?.lng
          const lat = e?.lnglat?.getLat?.() ?? e?.lnglat?.lat
          if (typeof lng !== 'number' || typeof lat !== 'number') return

          const ask = (region: string) => {
            const prompt = `我点击了地图上的一个位置（经度 ${lng.toFixed(2)}°，纬度 ${lat.toFixed(2)}°${region ? `，约位于${region}` : ''}）。请介绍这个地区的地理与历史背景：它属于哪个朝代/文明？这里曾经发生过哪些重要历史事件？相关的著名人物？不要使用 markdown 表格。`
            sessionStorage.setItem('history-explorer-pending-auto-question', prompt)
            useAIStore.getState().openPanel()
          }

          if (A.Geocoder) {
            try {
              const geo = new A.Geocoder({ city: '', extensions: 'base' })
              geo.getAddress([lng, lat], (status: string, result: any) => {
                if (status === 'complete' && result?.regeocode) {
                  const ac = result.regeocode.addressComponent || {}
                  const region = [ac.country, ac.province, ac.city, ac.district].filter(Boolean).join(' ')
                  ask(region)
                } else {
                  ask('')
                }
              })
            } catch {
              ask('')
            }
          } else {
            ask('')
          }
        }
        map.on('click', onMapClick)

        // 🎯 性能监控（拖动卡顿诊断用）：记录每个地图事件的耗时
        if ((window as any).__MAP_PERF_MONITOR__ !== false) {
          const perfEvents = ['dragstart', 'dragging', 'dragend', 'movestart', 'moving', 'moveend', 'zoomstart', 'zoom', 'zoomend']
          perfEvents.forEach(ev => {
            const t0 = performance.now()
            let count = 0
            map.on(ev, () => {
              const now = performance.now()
              const dt = now - t0
              count++
              if (ev === 'dragging' || ev === 'moving') {
                // 高频事件：每 60 次打印一次
                if (count % 60 === 0) {
                  console.log(`[map-perf] ${ev}: avg ${dt.toFixed(2)}ms / event over ${count} events`)
                }
              } else {
                console.log(`[map-perf] ${ev}: ${dt.toFixed(2)}ms (count=${count})`)
              }
            })
          })
        }
        // 让 cleanup 拿到 onMapClick 用于 off
        ;(map as any).__onMapClick = onMapClick
      })
      .catch(err => setError(err.message || String(err)))

    let resizeObserver: ResizeObserver | null = null
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        const map = mapRef.current
        if (!map) return
        try { map.resize?.() } catch { /* noop */ }
      })
      resizeObserver.observe(containerRef.current)
    }

    let resizeHandler: (() => void) | null = null
    schedule(() => {
      const map = mapRef.current
      if (!map) return
      resizeHandler = () => {
        try { map.resize?.() } catch { /* noop */ }
      }
      window.addEventListener('resize', resizeHandler)
    }, 500)

    return () => {
      cancelled = true
      timeoutIds.forEach(id => window.clearTimeout(id))
      if (resizeObserver) resizeObserver.disconnect()
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)
      const map = createdMap
      if (map) {
        // 销毁前保留视图状态，下次重建（viewMode 切换）时复用
        try {
          const c = map.getCenter?.()
          const z = map.getZoom?.()
          const p = map.getPitch?.()
          const r = map.getRotation?.()
          if (c && Number.isFinite(z)) {
            savedViewStateRef.current = {
              lng: c.getLng ? c.getLng() : c.lng,
              lat: c.getLat ? c.getLat() : c.lat,
              zoom: z,
              pitch: typeof p === 'function' ? p() : (p ?? 0),
              rotation: typeof r === 'function' ? r() : (r ?? 0),
            }
          }
        } catch { /* noop */ }
        // 移除 click handler（init effect 里挂上的）
        try {
          const handler = (map as any).__onMapClick
          if (handler) map.off('click', handler)
        } catch { /* noop */ }
        try { map.destroy?.() } catch { /* ignore */ }
      }
      markersRef.current = []
      labelsRef.current = []
      eventMarkersRef.current = []
      eventLabelsRef.current = []
      if (mapRef.current === map) mapRef.current = null
      if (containerRef.current && map) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild)
        }
      }
      setMapReady(false)
      if ((window as any).__amapTestMap === map) delete (window as any).__amapTestMap
    }
  }, [amapKeyFromStore, amapSecurityFromStore, viewMode])

  // 自然地理要素图层（叠加山脉/河流/海洋等）+ AMap 自带 feature 类别控制
  const layersVisible = useMapLayersStore(s => s.visible)
  const showLabels = useMapLayersStore(s => s.showLabels)
  const amapFeatures = useMapLayersStore(s => s.amapFeatures)
  const showGraticule = useMapLayersStore(s => s.showGraticule)
  const showCloud = useMapLayersStore(s => s.showCloud)

  /** 鼠标移入要素 → 在该要素的标签位置上方弹卡 */
  const handleGeoHover = (f: any) => {
    const map = mapRef.current
    let sx = 0
    let sy = 0
    if (map && f.labelPos) {
      const w = containerRef.current?.clientWidth ?? 0
      const h = containerRef.current?.clientHeight ?? 0
      // 24px padding：避免卡片贴边
      const { x, y } = getClampedScreenPoint(map, f.labelPos[0], f.labelPos[1], w, h, 24)
      sx = x
      sy = y
    }
    setGeoCard({
      feature: {
        id: f.id,
        name: f.name,
        type: f.type,
        description: f.description,
        imageUrl: f.imageUrl,
        imageCredit: f.imageCredit,
        labelPos: f.labelPos,
      },
      screenX: sx,
      screenY: sy,
      source: 'hover',
    })
  }

  /** 鼠标移出要素 → 关闭卡片 */
  const handleGeoLeave = (f: any) => {
    setGeoCard(null)
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    // 1) 自然地理要素叠加层
    if (mapReady) {
      const dispose = renderGeoFeatures(map, layersVisible, showLabels, handleGeoHover, handleGeoLeave)
      return dispose
    }
  }, [mapReady, layersVisible, showLabels])

  // 2) AMap 自带 feature 类别（POI、水系标注等）
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    if (typeof map.setFeatures === 'function') {
      try { map.setFeatures(amapFeatures) } catch { /* noop */ }
    }
  }, [mapReady, amapFeatures])

  // 3) 底图样式切换（高德原生样式 / 自定义瓦片源）
  const mapStyleKey = useMapStyleStore(s => s.style)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    const A = (window as any).AMap
    if (!A) return
    const meta = STYLE_META[mapStyleKey]

    // 移除旧的自定义瓦片层
    if (customTileLayerRef.current) {
      try { map.remove(customTileLayerRef.current) } catch { /* noop */ }
      customTileLayerRef.current = null
    }

    // 应用新样式
    if (meta.kind === 'amap' && meta.amapStyle) {
      try {
        if (typeof map.setMapStyle === 'function') {
          map.setMapStyle(meta.amapStyle)
        }
      } catch { /* noop */ }
    } else if (meta.kind === 'tile' && meta.tileUrl) {
      // 自定义瓦片层（OpenTopoMap / ArcGIS）
      try {
        const subdomains = meta.subdomains && meta.subdomains.length > 0
          ? meta.subdomains
          : ['']
        const config: any = {
          url: meta.tileUrl,
          subdomains,
          tileSize: 256,
          zIndex: 1,
        }
        if (subdomains.length > 0) {
          config.getTileUrl = (x: number, y: number, z: number) => {
            const sub = subdomains[Math.abs(x + y) % subdomains.length]
            return meta.tileUrl!
              .replace('{s}', sub)
              .replace('{x}', String(x))
              .replace('{y}', String(y))
              .replace('{z}', String(z))
          }
        }
        const tileLayer = new A.TileLayer(config)
        tileLayer.setMap(map)
        customTileLayerRef.current = tileLayer
      } catch { /* noop */ }
    }
  }, [mapReady, mapStyleKey])

  // 显示 hover 卡片
  const showHoverCard = (
    label: string,
    lng: number,
    lat: number,
    coverImageUrl: string,
    snippet: string,
  ) => {
    const map = mapRef.current as any
    if (!map) return
    const w = containerRef.current?.clientWidth ?? 0
    const h = containerRef.current?.clientHeight ?? 0
    const { x: sx, y: sy } = getClampedScreenPoint(map, lng, lat, w, h, 24)
    setInfoCard(prev => {
      if (prev?.source === 'jump') return prev
      return {
        label,
        snippet: snippet || '（暂无简介）',
        coverImageUrl: coverImageUrl || '',
        lng,
        lat,
        screenX: sx,
        screenY: sy,
        source: 'hover',
      }
    })
  }

  const hideHoverCard = () => {
    setInfoCard(prev => (prev?.source === 'hover' ? null : prev))
  }

  // currentYear 变化：飞向/center 都城（便宜，纯 transform，60Hz 可承受）
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const A = (window as any).AMap
    if (!A) return
    const jumpSuppressUntil = useHistoryStore.getState().jumpSuppressUntil
    if (jumpSuppressUntil > Date.now()) return

    const chinaEra = getChinaEraAtYear(currentYear, eras)
    let chinaToShow = chinaEra
    if (!chinaToShow) {
      const chinaEras = eras.filter(e => e.region === 'china' && e.capital)
      if (chinaEras.length > 0) {
        chinaToShow = chinaEras
          .map(e => ({ era: e, dist: Math.abs((e.startYear + e.endYear) / 2 - currentYear) }))
          .sort((a, b) => a.dist - b.dist)[0].era
      }
    }
    if (!chinaToShow?.capital) return

    const [lng, lat] = wgs84ToGcj02(chinaToShow.capital)
    // 🎯 拖拽时不要 zoom（zoom=4 太近，世界朝代图钉被裁出屏幕外）
    //   只在"非拖拽"（点击/跳转）时才 setZoomAndCenter；拖拽用 setCenter 保留原 zoom
    const lastSetAt = useHistoryStore.getState().lastSetYearAt
    const isDragging = lastSetAt > 0 && (Date.now() - lastSetAt) < 200
    try {
      if (isDragging) {
        map.setCenter(new A.LngLat(lng, lat))
      } else {
        map.setZoomAndCenter(4, new A.LngLat(lng, lat))
      }
    } catch { /* ignore */ }
  }, [currentYear])

  // markerYear 变化（80ms debounce）：重建 markers + labels
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const A = (window as any).AMap
    if (!A) return
    // 🎯 关键 gate：dataReady 之前 eras/events 还是 []，跳过重建
    //   等数据加载完，dataReady 翻转 → 重新跑这个 effect 用真实数据
    if (!dataReady) return

    // 清理旧 markers + labels（关键：text 标签也要清，否则年年累积）
    try { map.remove(markersRef.current) } catch { /* ignore */ }
    try { map.remove(labelsRef.current) } catch { /* ignore */ }
    try { map.remove(eventMarkersRef.current) } catch { /* ignore */ }
    try { map.remove(eventLabelsRef.current) } catch { /* ignore */ }
    markersRef.current = []
    labelsRef.current = []
    eventMarkersRef.current = []
    eventLabelsRef.current = []

    const chinaEra = getChinaEraAtYear(markerYear, eras)
    const jumpSuppressUntil = useHistoryStore.getState().jumpSuppressUntil
    const isSuppressed = jumpSuppressUntil > Date.now()
    // 🎯 UX 修复：当前年份若没有中国朝代（pre-Qin / 1912+），
    //   fallback 到"时间最近"的中国朝代，避免点击中国都城闪烁消失
    let chinaToShow = chinaEra
    if (!chinaToShow && !isSuppressed) {
      const chinaEras = eras.filter(e => e.region === 'china' && e.capital)
      if (chinaEras.length > 0) {
        chinaToShow = chinaEras
          .map(e => ({ era: e, dist: Math.abs((e.startYear + e.endYear) / 2 - markerYear) }))
          .sort((a, b) => a.dist - b.dist)[0].era
      }
    }
    if (chinaToShow?.capital && !isSuppressed) {
      const [lng, lat] = wgs84ToGcj02(chinaToShow.capital)

      const res = createMapMarker(map, {
        position: [lng, lat],
        kind: 'chinaCapital',
        label: chinaToShow.name,
        onClick: () => selectEra(chinaToShow.id),
        onHover: () =>
          showHoverCard(
            `${chinaToShow.name} 都城`,
            lng,
            lat,
            bingImage(fallbackKeyword(chinaToShow.name, chinaToShow.region), 400, 240),
            summarizeEra(chinaToShow as any),
          ),
        onHoverOut: hideHoverCard,
      })
      if (res) {
        markersRef.current.push(res.marker)
        if (res.label) labelsRef.current.push(res.label)
      }
    }

    const activeEras = getActiveErasAtYear(eras, markerYear)
    // 🎯 性能/UX 修复：若当前年份无活跃朝代（如 modern era、史前时期），
    //   fallback 显示 4 个"时间最近的"朝代，避免地图完全空旷
    const worldErasToShow = activeEras.filter(e => e.region !== 'china' && e.capital).slice(0, 4)
      .concat(
        activeEras.filter(e => e.region !== 'china' && e.capital).length === 0
          ? [...eras]
              .filter(e => e.region !== 'china' && e.capital)
              .map(e => ({ era: e, dist: Math.abs((e.startYear + e.endYear) / 2 - markerYear) }))
              .sort((a, b) => a.dist - b.dist)
              .slice(0, 4)
              .map(x => x.era)
          : []
      )

    worldErasToShow.forEach(era => {
      const [lng, lat] = wgs84ToGcj02(era.capital!)
      const res = createMapMarker(map, {
        position: [lng, lat],
        kind: 'worldCapital',
        color: era.color,
        label: era.name,
        onClick: () => selectEra(era.id),
        onHover: () =>
          showHoverCard(
            era.name,
            lng,
            lat,
            bingImage(fallbackKeyword(era.name, era.region), 400, 240),
            summarizeEra(era as any),
          ),
        onHoverOut: hideHoverCard,
      })
      if (res) {
        markersRef.current.push(res.marker)
        if (res.label) labelsRef.current.push(res.label)
      }
    })

    const eraEvents = events.filter(
      e => e.coordinates && e.importance >= 2 &&
           Math.abs(e.year - markerYear) <= 50
    ).slice(0, 15)  // 减少到 15 个：viewport 内同时显示的 markers 更少，地图拖动更快
    eraEvents.forEach(ev => {
      const [lng, lat] = wgs84ToGcj02(ev.coordinates!)
      const res = createMapMarker(map, {
        position: [lng, lat],
        kind: 'event',
        hoverTitle: ev.title,
        onClick: () => {
          selectEvent(ev.id)
          setYear(ev.year)
        },
        onHover: () =>
          showHoverCard(
            ev.title,
            lng,
            lat,
            bingImage(fallbackKeyword(ev.title, ev.category), 400, 240),
            summarizeEvent(ev as any),
          ),
        onHoverOut: hideHoverCard,
      })
      if (res) {
        eventMarkersRef.current.push(res.marker)
        if (res.label) eventLabelsRef.current.push(res.label)
      }
    })
  }, [markerYear, dataReady, selectEra, selectEvent, setYear])

  // mapFocusTarget 跳转
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady || !mapFocusTarget) return
    const A = (window as any).AMap
    if (!A) return

    const { center, zoom, label, coverImageUrl, snippet, reopenLabel, kind, reopenKind } =
      mapFocusTarget as any
    const [lng, lat] = wgs84ToGcj02(center)

    try { map.resize?.() } catch { /* noop */ }
    try {
      map.setZoomAndCenter(zoom, new A.LngLat(lng, lat))
    } catch { /* ignore */ }

    if (!label) return

    const placeCard = (useCenter: boolean) => {
      const w = containerRef.current?.clientWidth ?? 0
      const h = containerRef.current?.clientHeight ?? 0
      const padding = 24
      let sx: number
      let sy: number
      if (useCenter || w <= 0 || h <= 0) {
        sx = w > 0 ? w / 2 : 0
        sy = h > 0 ? h / 2 : 0
      } else {
        const { x: cx, y: cy } = getClampedScreenPoint(map, lng, lat, w, h, padding)
        sx = cx
        sy = cy
      }
      setInfoCard({
        label,
        snippet: snippet || '（暂无简介）',
        coverImageUrl: coverImageUrl || '',
        lng, lat,
        screenX: sx,
        screenY: sy,
        source: 'jump',
        reopenLabel,
        reopenKind: reopenKind ?? kind,
      } as InfoCard)
    }

    placeCard(true)

    let cancelled = false
    const onViewChange = () => {
      if (cancelled) return
      placeCard(false)
    }
    map.on('dragend', onViewChange)
    map.on('zoomend', onViewChange)

    return () => {
      cancelled = true
      map.off('dragend', onViewChange)
      map.off('zoomend', onViewChange)
      // click handler 在 init effect 里挂，这里不再重复
    }
  }, [mapFocusTarget, mapReady])

  return (
    <div className="w-full h-full relative">
      <div
        ref={containerRef}
        // 🎯 强制 GPU 合成层：避免 Chrome DevTools 关闭后拖动卡顿
        //   （DevTools 打开时强制 GPU，关闭时退回 CPU → 容器无 transform 提示就退回 CPU 渲染）
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          transform: 'translateZ(0)',
          willChange: 'transform',
          contain: 'layout paint size',
        }}
      />
      {/* 加载/错误状态（极简，不再显示调试 status 文本） */}
      {!mapReady && !error && (
        <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-ink-900/85 backdrop-blur border border-vermilion-500/30 shadow-lg flex items-center gap-2 text-xs text-ink-300">
          <span className="animate-spin inline-block w-3 h-3 border-2 border-vermilion-500 border-t-transparent rounded-full" />
          地图加载中…
        </div>
      )}
      {error && (
        <div className="absolute top-3 left-3 z-10 max-w-xs px-3 py-2 rounded-lg bg-ink-900/90 backdrop-blur border border-red-500/40 shadow-lg text-xs">
          <div className="text-red-400 font-serif mb-1">⚠ 地图加载失败</div>
          <div className="text-ink-300 leading-relaxed">{error}</div>
          <button
            onClick={() => useApiKeysStore.getState().setModalOpen(true)}
            className="mt-2 px-2 py-0.5 rounded bg-vermilion-500 hover:bg-vermilion-600 text-bone text-[11px] font-serif"
            title="打开 API Key 设置"
          >
            ⚙ 设置 Key
          </button>
        </div>
      )}

      {/* 自然地理要素图层切换面板（叠加层 + AMap 自带 feature 开关） */}
      <GeoFeatureFilter />

      {/* 经纬网（可开关） */}
      <GraticuleLayer map={mapRef.current} visible={showGraticule} />

      {/* 实时云图叠加（OpenWeatherMap，可开关） */}
      <CloudOverlayLayer
        map={mapRef.current}
        visible={showCloud}
        apiKey={getOwmApiKey() || ''}
      />

      {infoCard && (
        <InfoCardView
          card={infoCard}
          onClose={() => {
            setInfoCard(null)
            setMapFocus(null)
          }}
          onBack={() => {
            if (backInProgressRef.current) return
            backInProgressRef.current = true
            window.dispatchEvent(new CustomEvent(getReopenEvent(infoCard.reopenKind)))
            setInfoCard(null)
            setMapFocus(null)
            setTimeout(() => { backInProgressRef.current = false }, 0)
          }}
        />
      )}

      {geoCard && (
        <GeoFeatureCardView
          card={geoCard}
          onClose={() => setGeoCard(null)}
        />
      )}
    </div>
  )
}

function InfoCardView({
  card,
  onClose,
  onBack,
}: {
  card: InfoCard
  onClose: () => void
  onBack: () => void
}) {
  const [imgFailed, setImgFailed] = useState(false)
  return (
    <div
      data-testid="amap-info-card"
      className="absolute z-20 pointer-events-auto"
      style={{
        left: card.screenX,
        top: card.screenY,
        transform: 'translate(-50%, calc(-100% - 14px))',
        width: '280px',
        maxWidth: 'calc(100vw - 32px)',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div
        className="relative rounded-lg shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'rgb(26 23 20 / 0.95)',
          border: '1px solid rgb(184 67 58 / 0.4)',
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: '1px solid rgb(184 67 58 / 0.3)' }}
        >
          {card.reopenLabel ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center text-vermilion-300 hover:text-vermilion-200 text-sm"
              title="返回"
              aria-label="返回"
            >
              <span className="leading-none">←</span>
              <span className="ml-1 text-xs">Back</span>
            </button>
          ) : (
            <span className="text-xs" style={{ color: 'rgb(154 143 126)' }}>📍 位置</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-base leading-none hover:text-vermilion-300"
            style={{ color: 'rgb(154 143 126)' }}
            title="关闭"
          >
            ×
          </button>
        </div>
        {card.coverImageUrl && !imgFailed && (
          <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
            <img
              src={card.coverImageUrl}
              alt={card.label}
              onError={() => setImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}
        <div className="px-3 py-2">
          <div
            className="text-sm font-brush truncate"
            style={{ color: 'rgb(247 238 216)' }}
          >
            {card.label}
          </div>
          {card.snippet && (
            <div
              className="text-xs mt-1 line-clamp-3"
              style={{ color: 'rgb(184 198 184)' }}
            >
              {card.snippet}
            </div>
          )}
        </div>
      </div>
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: '100%',
          marginTop: '-1px',
          width: 0, height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid rgba(30, 28, 24, 0.95)',
          filter: 'drop-shadow(0 1px 0 rgba(201, 154, 91, 0.5))',
        }}
      />
    </div>
  )
}

/**
 * GeoFeatureCardView — 自然地理要素详情卡（与 InfoCardView 同结构、同风格）
 *  - 用户点击叠加层（河流/山脉/海洋/...）的名称 → 飞向位置 + 弹卡
 *  - 显示类型 icon、名称、简介、Bing 图
 *  - 顶部锚定（不被地图拖动影响）；关闭按钮回到地图
 */
const TYPE_META: Record<string, { icon: string; color: string }> = {
  river:     { icon: '🌊', color: '#5fb0d8' },
  mountain:  { icon: '⛰️',  color: '#c8997a' },
  sea:       { icon: '🌀', color: '#3a6e9e' },
  lake:      { icon: '💧', color: '#6a9ab6' },
  desert:    { icon: '🏜️', color: '#c89a5b' },
  plain:     { icon: '🌾', color: '#9bbf73' },
  peninsula: { icon: '📍', color: '#b88a6a' },
  strait:    { icon: '↔️',  color: '#8a9aba' },
  waterfall: { icon: '🪨', color: '#6abab6' },
  region:    { icon: '🗺', color: '#c8553d' },
  continent: { icon: '🌐', color: '#a89a82' },
}

function GeoFeatureCardView({
  card,
  onClose,
}: {
  card: GeoFeatureCard
  onClose: () => void
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const f = card.feature
  const meta = TYPE_META[f.type] ?? { icon: '📌', color: '#c89a5b' }
  return (
    <div
      data-testid="amap-geo-card"
      className="absolute z-20 pointer-events-auto"
      style={{
        // 卡片定位：在标签位置的正上方（与 InfoCardView 相同的"小三角指向"风格）
        //  - left = 标签 screenX
        //  - top  = 标签 screenY
        //  - transform: translate(-50%, -100%) + 6px  → 卡片底边在标签上方 6px
        left: card.screenX,
        top: card.screenY,
        transform: 'translate(-50%, calc(-100% - 6px))',
        width: '320px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'min(620px, calc(100vh - 80px))',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div
        className="relative rounded-lg shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'rgb(26 23 20 / 0.95)',
          border: '1px solid rgb(184 67 58 / 0.4)',
        }}
      >
        {/* 顶部条：类型 icon + 名称 + 关闭 */}
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: '1px solid rgb(184 67 58 / 0.3)' }}
        >
          <span className="flex items-center gap-2 text-sm">
            <span className="text-base leading-none">{meta.icon}</span>
            <span className="text-vermilion-300 font-brush">{f.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded border" style={{ color: meta.color, borderColor: meta.color + '60' }}>
              {f.type}
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-base leading-none hover:text-vermilion-300"
            style={{ color: 'rgb(154 143 126)' }}
            title="关闭"
            aria-label="关闭"
          >
            ×
          </button>
        </div>
        {/* 图片（Bing 图片源） */}
        {f.imageUrl && !imgFailed && (
          <div className="relative w-full bg-ink-800" style={{ aspectRatio: '16 / 9' }}>
            <img
              src={f.imageUrl}
              alt={f.name}
              onError={() => setImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {f.imageCredit && (
              <div className="absolute bottom-1 right-1 text-[9px] text-parchment-100/70 bg-ink-900/60 px-1 rounded">
                {f.imageCredit}
              </div>
            )}
          </div>
        )}
        {/* 简介 —— 始终深色底+浅色文字（地图浮层，不跟随主题切换） */}
        <div className="px-3 py-2 max-h-60 overflow-y-auto scrollbar-thin">
          {f.description ? (
            <div
              className="text-xs leading-relaxed whitespace-pre-wrap"
              style={{ color: 'rgb(247 238 216)' }}
            >
              {f.description}
            </div>
          ) : (
            <div className="text-xs" style={{ color: 'rgb(154 143 126)' }}>（暂无简介）</div>
          )}
        </div>
        {/* 底部署名 */}
        <div
          className="px-3 py-1.5 text-[10px] flex items-center justify-between"
          style={{
            backgroundColor: 'rgb(38 34 29 / 0.6)',
            borderTop: '1px solid rgb(51 44 37)',
            color: 'rgb(154 143 126)',
          }}
        >
          <span>来源：Bing 图片搜索 + 项目数据</span>
          <span style={{ color: meta.color }}>· {f.type}</span>
        </div>
      </div>
      {/* 朝下箭头 */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: '100%',
          marginTop: '-1px',
          width: 0, height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid rgba(30, 28, 24, 0.95)',
          filter: 'drop-shadow(0 1px 0 rgba(201, 154, 91, 0.5))',
        }}
      />
    </div>
  )
}