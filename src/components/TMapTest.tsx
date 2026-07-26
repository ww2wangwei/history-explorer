/**
 * TMapTest 完整版：T.Map 底图 + 朝代都城 marker + 朝代疆域 polygon + 事件点
 * 完全替代 RSM WorldMap
 */
import { useEffect, useRef, useState } from 'react'
import { loadTianditu } from '@/lib/tdt/loader'
import { useHistoryStore } from '@/store/useHistoryStore'
import { getActiveErasAtYear } from '@/utils/geo'
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
  reopenKind?: 'quickEvent' | 'geoFeature' | 'territory' | 'war' | 'majorWar' | 'majorWarNode'
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
      map.addOverLay(marker)
      eventMarkersRef.current.push(marker)
    })
  }, [currentYear, selectEra, selectEvent, setYear])

  // 监听 mapFocusTarget：详情面板点图钉跳转 → 飞向坐标 + 渲染富化浮层
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady || !mapFocusTarget) return
    const T = (window as any).T
    if (!T) return

    const { center, zoom, label, coverImageUrl, snippet, reopenLabel, kind, reopenKind } =
      mapFocusTarget as any
    const [lng, lat] = center

    // 容器可能还没拿到真实尺寸，提前 checkResize 避免 viewport=0 时坐标算错
    try { map.checkResize?.() } catch { /* ignore */ }

    try { map.setCenter(new T.LngLat(lng, lat)) } catch (e) { console.warn('[TMapTest] setCenter failed:', e) }
    try { map.setZoom(zoom) } catch (e) { console.warn('[TMapTest] setZoom failed:', e) }
    console.debug('[TMapTest] jumped to', { center, zoom, label })

    if (!label) return

    // 计算屏幕坐标（moveend 等真正渲染后）
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

    const applyCard = (sx: number, sy: number) => {
      // clamp 到地图容器内可见区域（卡片宽 ~280 / 高 ~360，留 24px 边距让小三角露在外面）
      const w = containerRef.current?.clientWidth ?? 0
      const h = containerRef.current?.clientHeight ?? 0
      const padding = 24
      // 卡片中心点要在 [padding, dim-padding] 之间
      const clampedX = w > 0 ? Math.max(padding, Math.min(sx, w - padding)) : sx
      const clampedY = h > 0 ? Math.max(padding, Math.min(sy, h - padding)) : sy
      setInfoCard({
        label,
        snippet: snippet || '（暂无简介）',
        coverImageUrl: coverImageUrl || '',
        lng, lat, screenX: clampedX, screenY: clampedY,
        source: 'jump',
        reopenLabel,
        reopenKind: reopenKind ?? kind,
      } as InfoCard)
    }

    // 第一次立即算（兜底）
    {
      // 先看目标是否在容器内；不在则把地图 pan 让 marker 落在容器中点（避免小三角尖错位）
      const containerW = containerRef.current?.clientWidth ?? 0
      const containerH = containerRef.current?.clientHeight ?? 0
      const [rawSx, rawSy] = computeScreen()
      if (
        containerW > 0 && containerH > 0 &&
        (rawSx < 80 || rawSx > containerW - 80 || rawSy < 80 || rawSy > containerH - 80)
      ) {
        try {
          // 计算需要把地图平移多少像素，让 marker 落在容器中心
          // panBy(dx, dy)：向右向下为正。我们要把 marker (rawSx, rawSy) 移到 (containerW/2, containerH/2)
          // 即屏幕向右移动 (containerW/2 - rawSx)，向下移动 (containerH/2 - rawSy)
          const dx = containerW / 2 - rawSx
          const dy = containerH / 2 - rawSy
          if (typeof map.panBy === 'function') {
            map.panBy(dx, dy)
          }
        } catch { /* ignore */ }
      }
      const [sx, sy] = computeScreen()
      console.debug('[TMapTest] computeScreen (sync)', { lng, lat, sx, sy, mapCenter: map.getCenter?.(), mapZoom: map.getZoom?.() })
      applyCard(sx, sy)
    }

    // moveend 后再算（视口异步更新——v4 setCenter 是动画过渡）
    let cancelled = false
    const onMoveEnd = () => {
      if (cancelled) return
      const [sx, sy] = computeScreen()
      console.debug('[TMapTest] computeScreen (moveend)', { sx, sy, mapCenter: map.getCenter?.(), mapZoom: map.getZoom?.() })
      // 写入 state + 直接改 DOM（双重保险，绕过 React 异步批处理）
      applyCard(sx, sy)
      requestAnimationFrame(() => {
        const el = document.querySelector('[data-testid="tmap-info-card"]') as HTMLElement | null
        if (el) {
          const computed = getComputedStyle(el)
          console.debug('[TMapTest] DOM check after moveend', {
            inlineStyle: el.getAttribute('style'),
            computedLeft: computed.left,
            computedTop: computed.top,
          })
        } else {
          console.debug('[TMapTest] DOM check after moveend: NO CARD IN DOM')
        }
      })
    }
    try { map.addEventListener('moveend', onMoveEnd) } catch { /* ignore */ }

    // 1200ms 兜底（覆盖 v4 setCenter 动画过渡时长）
    const timer = setTimeout(() => {
      if (cancelled) return
      const [sx, sy] = computeScreen()
      console.debug('[TMapTest] computeScreen (timeout 1200ms)', { sx, sy, mapCenter: map.getCenter?.(), mapZoom: map.getZoom?.() })
      applyCard(sx, sy)
    }, 1200)

    return () => {
      cancelled = true
      clearTimeout(timer)
      try { map.removeEventListener('moveend', onMoveEnd) } catch { /* ignore */ }
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
            // 触发 Layout 监听器（战争/朝代时间线/地理对应 active）
            if (kind === 'war' || kind === 'majorWar' || kind === 'majorWarNode') {
              window.dispatchEvent(new CustomEvent('history:go-wars'))
            } else if (kind === 'geoFeature' || kind === 'territory') {
              window.dispatchEvent(new CustomEvent('history:go-geography'))
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
              className="flex items-center gap-1 text-bronze-300 hover:text-bronze-200 text-xs"
              title="返回"
            >
              <span className="text-base leading-none">←</span>
              <span>{card.reopenLabel}</span>
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
              onLoad={() => console.debug('[InfoCard] image loaded:', card.coverImageUrl)}
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
