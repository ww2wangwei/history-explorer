/**
 * TMapTest 完整版：T.Map 底图 + 朝代都城 marker + 朝代疆域 polygon + 事件点
 * 完全替代 RSM WorldMap
 */
import { useEffect, useRef, useState } from 'react'
import { loadTianditu } from '@/lib/tdt/loader'
import { useHistoryStore } from '@/store/useHistoryStore'
import { getActiveErasAtYear } from '@/utils/geo'
import { bingImage, fallbackKeyword } from '@/utils/geoImage'
import { summarizeEra, summarizeEvent } from '@/utils/summarize'
import erasData from '@/data/eras.json'
import eventsData from '@/data/events.json'
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
  /** 卡片来源：hover=临时(移出即消失)，jump=点击跳转(需手动关闭) */
  source?: 'hover' | 'jump'
  /** 「🔙 回到 {label}」按钮文案；无则不显示按钮（普通定位） */
  reopenLabel?: string
  /** 浮层返回时所需 — 只存在 reopenLabel 时才有意义 */
  reopenKind?: 'quickEvent' | 'event' | 'cultureEvent' | 'geoFeature' | 'territory' | 'war' | 'majorWar' | 'majorWarNode'
  reopenEraId?: string
  reopenEventYear?: number
  reopenFeatureId?: string
  reopenTerritoryId?: string
  reopenTerritoryRegion?: 'china' | 'world'
  reopenWarId?: string
  reopenMwKey?: string
  reopenNodeIndex?: number
}

export default function TMapTest() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polygonsRef = useRef<any[]>([])
  const eventMarkersRef = useRef<any[]>([])

  const [status, setStatus] = useState<string>('init')
  const [error, setError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [infoCard, setInfoCard] = useState<InfoCard | null>(null)

  const currentYear = useHistoryStore(s => s.currentYear)
  const selectEra = useHistoryStore(s => s.selectEra)
  const selectEvent = useHistoryStore(s => s.selectEvent)
  const setYear = useHistoryStore(s => s.setYear)
  const mapFocusTarget = useHistoryStore(s => s.mapFocusTarget)
  const setMapFocus = useHistoryStore(s => s.setMapFocus)

  // 初始化 T.Map（只一次）
  useEffect(() => {
    const tk = import.meta.env.VITE_TIANDITU_KEY as string | undefined
    if (!tk || !containerRef.current) return

    setStatus('loading T API...')
    loadTianditu(tk)
      .then(() => {
        if (!containerRef.current) return
        const T = (window as any).T
        if (!T) { setError('T undefined'); return }

        // 清理容器
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild)
        }

        setStatus('creating T.Map...')
        const map = new T.Map(containerRef.current)
        setTimeout(() => {
          try { map.checkResize?.() } catch { /* ignore */ }
        }, 200)
        // 初始中心：默认定位到美索不达米亚（文明摇篮），打开地图就在内容区域
        const initialCenter: [number, number] = [44, 34]
        const initialZoom = 4
        map.centerAndZoom(new T.LngLat(initialCenter[0], initialCenter[1]), initialZoom)
        map.disableDoubleClickZoom()
        // 启用滚轮缩放
        if (typeof map.enableScrollWheelZoom === 'function') {
          map.enableScrollWheelZoom()
        }
        mapRef.current = map
        ;(window as any).__tdtTestMap = map
        setStatus('T.Map ready')
        setMapReady(true)
      })
      .catch(err => setError(err.message || String(err)))

    let resizeHandler: (() => void) | null = null
    // 稍后再挂 resize（等 map 存在）
    setTimeout(() => {
      const map = mapRef.current
      if (!map) return
      resizeHandler = () => {
        try { map.checkResize?.() } catch { /* ignore */ }
      }
      window.addEventListener('resize', resizeHandler)
    }, 500)

    return () => {
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)
      // 清理所有 overlays
      const map = mapRef.current
      if (map) {
        markersRef.current.forEach((m: any) => { try { map.removeOverLay(m) } catch { /* ignore */ } })
        polygonsRef.current.forEach((p: any) => { try { map.removeOverLay(p) } catch { /* ignore */ } })
        eventMarkersRef.current.forEach((e: any) => { try { map.removeOverLay(e) } catch { /* ignore */ } })
        try { map.destroy() } catch { /* ignore */ }
      }
      markersRef.current = []
      polygonsRef.current = []
      eventMarkersRef.current = []
      mapRef.current = null
      setMapReady(false)
      if ((window as any).__tdtTestMap) delete (window as any).__tdtTestMap
    }
  }, [])

  // 显示 hover 卡片（含图片 + 简介）—— 移入图钉时调用
  // 关键约束：
  //   - 不覆盖已有的 jump 卡片（带 reopenLabel 的持久卡片优先）
  //   - 计算屏幕坐标用 map.lngLatToContainerPoint（hover 时 viewport 已稳定）
  //   - 24px 边距 clamp 防止卡片溢出容器
  const showHoverCard = (
    label: string,
    lng: number,
    lat: number,
    coverImageUrl: string,
    snippet: string,
  ) => {
    const map = mapRef.current as any
    if (!map) return
    const T = (window as any).T
    if (!T) return
    let pt: any = null
    try {
      if (typeof map.lngLatToContainerPoint === 'function') {
        pt = map.lngLatToContainerPoint(new T.LngLat(lng, lat))
      } else if (typeof map.lngLatToPoint === 'function') {
        pt = map.lngLatToPoint(new T.LngLat(lng, lat))
      }
    } catch { /* ignore */ }
    let sx = 0
    let sy = 0
    if (pt) {
      if (Array.isArray(pt)) { sx = pt[0]; sy = pt[1] }
      else if (pt.x !== undefined) { sx = pt.x; sy = pt.y }
    }
    const w = containerRef.current?.clientWidth ?? 0
    const h = containerRef.current?.clientHeight ?? 0
    const padding = 24
    if (w > 0) sx = Math.max(padding, Math.min(sx, w - padding))
    if (h > 0) sy = Math.max(padding, Math.min(sy, h - padding))
    // 不覆盖 jump 卡片
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

  // 清除 hover 卡片 —— 移出图钉时调用
  // 关键约束：只清除 source === 'hover' 的卡片，绝不误关 jump 卡片
  const hideHoverCard = () => {
    setInfoCard(prev => (prev?.source === 'hover' ? null : prev))
  }

  // currentYear 变化时：飞向当前朝代都城 + 重建 markers/polygons
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const T = (window as any).T
    if (!T) return

    // 清理旧 markers/polygons
    markersRef.current.forEach((m: any) => { try { map.removeOverLay(m) } catch { /* ignore */ } })
    polygonsRef.current.forEach((p: any) => { try { map.removeOverLay(p) } catch { /* ignore */ } })
    eventMarkersRef.current.forEach((e: any) => { try { map.removeOverLay(e) } catch { /* ignore */ } })
    markersRef.current = []
    polygonsRef.current = []
    eventMarkersRef.current = []

    const chinaEra = getChinaEraAtYear(currentYear)
    // 如果有待处理的跳转（来自详情面板的「📍 在地图上定位」），
    // 跳过 currentYear 的 setCenter，避免与 mapFocusTarget effect 的飞行动画竞态。
    const hasPendingJump = !!useHistoryStore.getState().mapFocusTarget
    if (chinaEra?.capital && !hasPendingJump) {
      const [lng, lat] = chinaEra.capital
      // 飞向当前朝代都城（拆成 setCenter + setZoom 两步，v4 更可靠）
      try {
        map.setCenter(new T.LngLat(lng, lat))
        map.setZoom(4)
      } catch (e) { /* ignore */ }

      // 朝代都城 marker（金色图钉）
      const icon = new T.Icon({
        iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 22 30">
            <path d="M 11 28 L 6 16 L 16 16 Z" fill="#c89a5b" stroke="#0f0e0c" stroke-width="1"/>
            <circle cx="11" cy="9" r="9" fill="#c89a5b" stroke="#fdf8f0" stroke-width="1.5"/>
            <circle cx="11" cy="9" r="3" fill="#fdf8f0"/>
          </svg>`
        ),
        iconSize: new T.Point(22, 30),
        iconAnchor: new T.Point(11, 28),
      })
      const marker = new T.Marker(new T.LngLat(lng, lat), { icon })
      const label = new T.Label({
        text: `★ ${chinaEra.name}`,
        offset: new T.Point(0, -32),
      })
      try { marker.setLabel(label) } catch { /* v4.0 可能不支持，回退到 addOverLay */ }
      try { map.addOverLay(label) } catch { /* ignore */ }
      marker.addEventListener('click', () => selectEra(chinaEra.id))
      // hover 卡片：鼠标移入显示图片+简介，移开消失
      try {
        marker.addEventListener('mouseover', () => {
          showHoverCard(
            `${chinaEra.name} 都城`,
            lng,
            lat,
            bingImage(fallbackKeyword(chinaEra.name, chinaEra.region), 400, 240),
            summarizeEra(chinaEra as any),
          )
        })
        marker.addEventListener('mouseout', hideHoverCard)
      } catch { /* v4.0 不支持时跳过 */ }
      map.addOverLay(marker)
      markersRef.current.push(marker)
    }

    // 同时期的世界朝代都城 marker
    const activeEras = getActiveErasAtYear(eras, currentYear)
    activeEras.filter(e => e.region !== 'china' && e.capital).slice(0, 4).forEach(era => {
      const [lng, lat] = era.capital!
      const icon = new T.Icon({
        iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
            <path d="M 9 22 L 5 13 L 13 13 Z" fill="${era.color}" stroke="#0f0e0c" stroke-width="1"/>
            <circle cx="9" cy="7" r="7" fill="${era.color}" stroke="#fdf8f0" stroke-width="1"/>
            <circle cx="9" cy="7" r="2" fill="#fdf8f0"/>
          </svg>`
        ),
        iconSize: new T.Point(18, 24),
        iconAnchor: new T.Point(9, 22),
      })
      const marker = new T.Marker(new T.LngLat(lng, lat), { icon })
      const label = new T.Label({
        text: era.name,
        offset: new T.Point(0, -26),
      })
      try { marker.setLabel(label) } catch { /* v4.0 回退 */ }
      try { map.addOverLay(label) } catch { /* ignore */ }
      marker.addEventListener('click', () => selectEra(era.id))
      // hover 卡片
      try {
        marker.addEventListener('mouseover', () => {
          showHoverCard(
            era.name,
            lng,
            lat,
            bingImage(fallbackKeyword(era.name, era.region), 400, 240),
            summarizeEra(era as any),
          )
        })
        marker.addEventListener('mouseout', hideHoverCard)
      } catch { /* ignore */ }
      map.addOverLay(marker)
      markersRef.current.push(marker)
    })

    // 该时期事件点（红色圆点）
    const eraEvents = events.filter(
      e => e.coordinates && e.importance >= 2 &&
           Math.abs(e.year - currentYear) <= 50
    ).slice(0, 30)
    eraEvents.forEach(ev => {
      const [lng, lat] = ev.coordinates!
      const dot = new T.Icon({
        iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="5" fill="#dc2626" stroke="#fdf8f0" stroke-width="1.5"/>
          </svg>`
        ),
        iconSize: new T.Point(12, 12),
        iconAnchor: new T.Point(6, 6),
      })
      const marker = new T.Marker(new T.LngLat(lng, lat), { icon: dot })
      try { marker.setTitle(ev.title) } catch { /* v4.0 可能不支持 */ }
      marker.addEventListener('click', () => {
        selectEvent(ev.id)
        setYear(ev.year)
      })
      // hover 卡片
      try {
        marker.addEventListener('mouseover', () => {
          showHoverCard(
            ev.title,
            lng,
            lat,
            bingImage(fallbackKeyword(ev.title, ev.category), 400, 240),
            summarizeEvent(ev as any),
          )
        })
        marker.addEventListener('mouseout', hideHoverCard)
      } catch { /* ignore */ }
      map.addOverLay(marker)
      eventMarkersRef.current.push(marker)
    })
  }, [currentYear, selectEra, selectEvent, setYear])

  // 监听 mapFocusTarget：详情面板点图钉跳转 → 飞向坐标 + 渲染富化浮层
  // 简化方案：
  //   1) centerAndZoom 把目标放在地图中央 → 卡片初始定位在容器中央 → 小三角指向中央 = 指向 marker
  //   2) 监听 dragend/zoomend：用户拖动/缩放地图后重新算 lngLatToContainerPoint，让卡片跟随 marker
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady || !mapFocusTarget) return
    const T = (window as any).T
    if (!T) return

    const { center, zoom, label, coverImageUrl, snippet, reopenLabel, kind, reopenKind } =
      mapFocusTarget as any
    const [lng, lat] = center

    // 1) checkResize 确保容器尺寸准确
    try { map.checkResize?.() } catch { /* ignore */ }

    // 2) 用一行 centerAndZoom 完成飞行（与初始化 line 89 一致；v4 中比 setCenter + setZoom 两步更可靠）
    try { map.centerAndZoom(new T.LngLat(lng, lat), zoom) } catch { /* ignore */ }

    if (!label) return

    const computeScreen = (): [number, number] => {
      try {
        let pt: any = null
        if (typeof map.lngLatToContainerPoint === 'function') {
          pt = map.lngLatToContainerPoint(new T.LngLat(lng, lat))
        } else if (typeof map.lngLatToPoint === 'function') {
          pt = map.lngLatToPoint(new T.LngLat(lng, lat))
        }
        if (Array.isArray(pt)) return [pt[0], pt[1]]
        if (pt && typeof pt.x === 'number') return [pt.x, pt.y]
      } catch { /* ignore */ }
      return [0, 0]
    }

    // 3) 初始把卡片放在容器中央（centerAndZoom 会把目标放到中央 → 卡片在中央 →
    //    小三角指向中央 = 指向 marker；这里用确定的 (w/2, h/2) 而不是 lngLatToContainerPoint，
    //    因为飞行是异步的，调用时 viewport 还没跟上，会算出错的坐标）
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
        let [cx, cy] = computeScreen()
        sx = Math.max(padding, Math.min(cx, w - padding))
        sy = Math.max(padding, Math.min(cy, h - padding))
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

    // 4) 初始放置：直接用容器中央（确定值，不受异步飞行影响）
    placeCard(true)

    // 5) 用户拖动/缩放后重新放置卡片（dragend/zoomend 时机确定，viewport 稳定，可信赖 lngLatToContainerPoint）
    let cancelled = false
    const onViewChange = () => {
      if (cancelled) return
      placeCard(false)
    }
    try { map.addEventListener('dragend', onViewChange) } catch { /* ignore */ }
    try { map.addEventListener('zoomend', onViewChange) } catch { /* ignore */ }

    return () => {
      cancelled = true
      try { map.removeEventListener('dragend', onViewChange) } catch { /* ignore */ }
      try { map.removeEventListener('zoomend', onViewChange) } catch { /* ignore */ }
    }
  }, [mapFocusTarget, mapReady])

  return (
    <div className="w-full h-full relative">
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />
      <div className="absolute top-2 left-2 z-10 text-xs bg-ink-800/95 px-3 py-1.5 rounded-lg border border-bronze-500/40 shadow-lg">
        <span className="text-bronze-400 font-serif">天地图 T.Map</span>
        <span className="ml-2 text-parchment-100">Status: {status}</span>
        {error && <span className="text-red-400 ml-2">ERROR: {error}</span>}
        <div className="text-xs text-ink-500 mt-1">
          当前年: {currentYear} · 朝代: {getChinaEraAtYear(currentYear)?.name ?? '无'}
        </div>
      </div>

      {infoCard && (
        <InfoCardView
          card={infoCard}
          onClose={() => {
            setInfoCard(null)
            setMapFocus(null)
          }}
          onBack={() => {
            const kind = infoCard.reopenKind
            // 触发 Layout 监听器（战争/朝代时间线/地理/文化对应 active）
            if (kind === 'war' || kind === 'majorWar' || kind === 'majorWarNode') {
              window.dispatchEvent(new CustomEvent('history:go-wars'))
            } else if (kind === 'geoFeature' || kind === 'territory') {
              window.dispatchEvent(new CustomEvent('history:go-geography'))
            } else if (kind === 'cultureEvent') {
              window.dispatchEvent(new CustomEvent('history:go-cultures'))
            } else {
              window.dispatchEvent(new CustomEvent('history:go-dashboard'))
            }
            setInfoCard(null)
            setMapFocus(null)
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
      data-testid="tmap-info-card"
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
      {/* 卡片主体 */}
      <div className="relative bg-ink-900/95 border border-bronze-500/50 rounded-lg shadow-2xl overflow-hidden">
        {/* 返回箭头 / 关闭按钮 */}
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

        {/* 图片 */}
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

        {/* 文本 */}
        <div className="px-3 py-2">
          <div className="text-sm font-medium text-parchment-100 truncate">{card.label}</div>
          {card.snippet && (
            <div className="text-xs text-ink-300 mt-1 line-clamp-3">{card.snippet}</div>
          )}
        </div>
      </div>

      {/* 朝下指向 marker 的小三角（CSS）— 必须在 overflow-hidden 外层（内层会裁掉） */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: '100%',  // 紧贴内层卡片下边缘
          marginTop: '-1px', // 盖住 border-bronze-500/50 的 1px 边
          width: 0, height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid rgba(30, 28, 24, 0.95)', // 与 bg-ink-900/95 匹配
          filter: 'drop-shadow(0 1px 0 rgba(201, 154, 91, 0.5))',
        }}
      />
    </div>
  )
}
