/**
 * AmapTest — 高德地图 (AMap) 完整版：
 *   底图 + 朝代都城 marker + 事件点 + 地理要素图层。
 *
 * 历史说明：
 *   - TMapTest.tsx → QqMapTest.tsx → AmapTest.tsx
 *   - AMap 矢量底图自带水系/绿地/POI 标注，配合 GeoFeatureFilter 显示山脉/河流/海洋
 *     等叠加层，整体观感显著优于天地图。
 */
import { useEffect, useRef, useState } from 'react'
import { loadAmap } from '@/lib/amap/loader'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useMapLayersStore } from '@/store/useMapLayersStore'
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

export default function AmapTest() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const labelsRef = useRef<any[]>([])
  const eventMarkersRef = useRef<any[]>([])
  const eventLabelsRef = useRef<any[]>([])

  const [status, setStatus] = useState<string>('init')
  const [error, setError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [infoCard, setInfoCard] = useState<InfoCard | null>(null)
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
        const map = new A.Map(container, {
          center,
          zoom: 4,
          draggable: true,
          scrollWheel: true,
          doubleClickZoom: true,
          zoomControl: false,    // 用我们自定义按钮
          mapStyle: 'amap://styles/darkblue', // 暗色风格与项目主题契合
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

  // 自然地理要素图层
  const layersVisible = useMapLayersStore(s => s.visible)
  const showLabels = useMapLayersStore(s => s.showLabels)
  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    if (!map) return
    return renderGeoFeatures(map, layersVisible, showLabels)
  }, [mapReady, layersVisible, showLabels])

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

      <GeoFeatureFilter />

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