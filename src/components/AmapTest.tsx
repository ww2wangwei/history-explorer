/**
 * AmapTest — 高德地图 (AMap) 完整版：
 *   底图 + 朝代都城 marker + 事件点 + 自然地理要素叠加图层（GeoFeatureFilter）。
 *
 * 历史说明：
 *   - TMapTest.tsx → QqMapTest.tsx → AmapTest.tsx
 *   - 用户可手动切换「山脉/河流/海洋」等叠加层（同时控制 AMap 自带的 POI 标签、
 *     水系标注等的 setFeatures 开关）。
 */
import { useEffect, useRef, useState } from 'react'
import { loadAmap } from '@/lib/amap/loader'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useMapLayersStore } from '@/store/useMapLayersStore'
import { useMapStyleStore, STYLE_META, type MapStyleKey } from '@/store/useMapStyleStore'
import { getActiveErasAtYear } from '@/utils/geo'
import { bingImage, fallbackKeyword } from '@/utils/geoImage'
import { summarizeEra, summarizeEvent } from '@/utils/summarize'
import { wgs84ToGcj02 } from '@/utils/coordsTransform'
import erasData from '@/data/eras.json'
import eventsData from '@/data/events.json'
import { createMapMarker } from '@/lib/amap/markers'
import { getClampedScreenPoint } from '@/lib/amap/mapHelpers'
import { getReopenEvent } from '@/lib/reopenRoutes'
import { renderGeoFeatures } from '@/components/Map/GeoFeatureLayer'
import GeoFeatureFilter from '@/components/Map/GeoFeatureFilter'
import GraticuleLayer from '@/components/Map/GraticuleLayer'
import CloudOverlayLayer from '@/components/Map/CloudOverlayLayer'
import type { ReopenKind } from '@/lib/reopenRoutes'
import type { Era, HistoricalEvent } from '@/types'

const eras = erasData as Era[]
const events = eventsData as HistoricalEvent[]

function getChinaEraAtYear(year: number): Era | null {
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

  const [status, setStatus] = useState<string>('init')
  const [error, setError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [infoCard, setInfoCard] = useState<InfoCard | null>(null)
  const [geoCard, setGeoCard] = useState<GeoFeatureCard | null>(null)
  const backInProgressRef = useRef(false)

  const currentYear = useHistoryStore(s => s.currentYear)
  const selectEra = useHistoryStore(s => s.selectEra)
  const selectEvent = useHistoryStore(s => s.selectEvent)
  const setYear = useHistoryStore(s => s.setYear)
  const mapFocusTarget = useHistoryStore(s => s.mapFocusTarget)
  const setMapFocus = useHistoryStore(s => s.setMapFocus)

  // 初始化 AMap（只一次）
  useEffect(() => {
    const key = import.meta.env.VITE_AMAP_KEY as string | undefined
    if (!key || !containerRef.current) {
      setError('未配置 VITE_AMAP_KEY，请在 .env 设置高德地图 Key')
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

    setStatus('loading AMap...')
    const securityCode = import.meta.env.VITE_AMAP_SECURITY_CODE as string | undefined
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

        setStatus('creating AMap.Map...')
        const center = new A.LngLat(44, 34) // 美索不达米亚（文明摇篮）
        const initialStyle = useMapStyleStore.getState().style
        const initialMeta = STYLE_META[initialStyle]
        const map = new A.Map(container, {
          center,
          zoom: 4,
          draggable: true,
          scrollWheel: true,
          doubleClickZoom: true,
          zoomControl: false,    // 用我们自定义按钮
          mapStyle: initialMeta.kind === 'amap' && initialMeta.amapStyle
            ? initialMeta.amapStyle
            : 'amap://styles/darkblue', // 兜底使用 darkblue
        })
        createdMap = map
        schedule(() => {
          try { map.resize?.() } catch { /* noop */ }
        }, 200)
        mapRef.current = map
        ;(window as any).__amapTestMap = map
        setStatus('AMap ready')
        setMapReady(true)
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
  }, [])

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

  // currentYear 变化：飞向都城 + 重建 markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const A = (window as any).AMap
    if (!A) return

    // 清理旧 markers + labels（关键：text 标签也要清，否则年年累积）
    try { map.remove(markersRef.current) } catch { /* ignore */ }
    try { map.remove(labelsRef.current) } catch { /* ignore */ }
    try { map.remove(eventMarkersRef.current) } catch { /* ignore */ }
    try { map.remove(eventLabelsRef.current) } catch { /* ignore */ }
    markersRef.current = []
    labelsRef.current = []
    eventMarkersRef.current = []
    eventLabelsRef.current = []

    const chinaEra = getChinaEraAtYear(currentYear)
    const jumpSuppressUntil = useHistoryStore.getState().jumpSuppressUntil
    const isSuppressed = jumpSuppressUntil > Date.now()
    if (chinaEra?.capital && !isSuppressed) {
      const [lng, lat] = wgs84ToGcj02(chinaEra.capital)
      try {
        map.setZoomAndCenter(4, new A.LngLat(lng, lat))
      } catch { /* ignore */ }

      const res = createMapMarker(map, {
        position: [lng, lat],
        kind: 'chinaCapital',
        label: chinaEra.name,
        onClick: () => selectEra(chinaEra.id),
        onHover: () =>
          showHoverCard(
            `${chinaEra.name} 都城`,
            lng,
            lat,
            bingImage(fallbackKeyword(chinaEra.name, chinaEra.region), 400, 240),
            summarizeEra(chinaEra as any),
          ),
        onHoverOut: hideHoverCard,
      })
      if (res) {
        markersRef.current.push(res.marker)
        if (res.label) labelsRef.current.push(res.label)
      }
    }

    const activeEras = getActiveErasAtYear(eras, currentYear)
    activeEras.filter(e => e.region !== 'china' && e.capital).slice(0, 4).forEach(era => {
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
           Math.abs(e.year - currentYear) <= 50
    ).slice(0, 30)
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
  }, [currentYear, selectEra, selectEvent, setYear])

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
    }
  }, [mapFocusTarget, mapReady])

  return (
    <div className="w-full h-full relative">
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />
      <div className="absolute top-2 left-2 z-10 text-xs bg-ink-800/95 px-3 py-1.5 rounded-lg border border-bronze-500/40 shadow-lg">
        <span className="text-bronze-400 font-serif">高德地图 AMap</span>
        <span className="ml-2 text-parchment-100">Status: {status}</span>
        {error && <span className="text-red-400 ml-2">ERROR: {error}</span>}
        <div className="text-xs text-ink-500 mt-1">
          当前年: {currentYear} · 朝代: {getChinaEraAtYear(currentYear)?.name ?? '无'}
        </div>
      </div>

      {/* 自然地理要素图层切换面板（叠加层 + AMap 自带 feature 开关） */}
      <GeoFeatureFilter />

      {/* 经纬网（可开关） */}
      <GraticuleLayer map={mapRef.current} visible={showGraticule} />

      {/* 实时云图叠加（OpenWeatherMap，可开关） */}
      <CloudOverlayLayer
        map={mapRef.current}
        visible={showCloud}
        apiKey={import.meta.env.VITE_OWM_API_KEY || ''}
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
      <div className="relative bg-ink-900/95 border border-bronze-500/50 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-bronze-500/30">
          {card.reopenLabel ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center text-bronze-300 hover:text-bronze-200 text-sm"
              title="返回"
              aria-label="返回"
            >
              <span className="leading-none">←</span>
              <span className="ml-1 text-xs">Back</span>
            </button>
          ) : (
            <span className="text-xs text-ink-500">📍 位置</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-200 text-base leading-none"
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
          <div className="text-sm font-medium text-parchment-100 truncate">{card.label}</div>
          {card.snippet && (
            <div className="text-xs text-ink-300 mt-1 line-clamp-3">{card.snippet}</div>
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
      <div className="relative bg-ink-900/95 border border-bronze-500/50 rounded-lg shadow-2xl overflow-hidden">
        {/* 顶部条：类型 icon + 名称 + 关闭 */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-bronze-500/30">
          <span className="flex items-center gap-2 text-sm">
            <span className="text-base leading-none">{meta.icon}</span>
            <span className="text-bronze-300 font-serif">{f.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded border" style={{ color: meta.color, borderColor: meta.color + '60' }}>
              {f.type}
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-200 text-base leading-none"
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
        {/* 简介 */}
        <div className="px-3 py-2 max-h-60 overflow-y-auto scrollbar-thin">
          {f.description ? (
            <div className="text-xs text-parchment-100 leading-relaxed whitespace-pre-wrap">
              {f.description}
            </div>
          ) : (
            <div className="text-xs text-ink-500">（暂无简介）</div>
          )}
        </div>
        {/* 底部署名 */}
        <div className="px-3 py-1.5 bg-ink-800/60 border-t border-ink-700 text-[10px] text-ink-500 flex items-center justify-between">
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