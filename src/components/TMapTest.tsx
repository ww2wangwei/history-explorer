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
import { createMapMarker } from '@/lib/tdt/markers'
import { getClampedScreenPoint } from '@/lib/tdt/mapHelpers'
import { getReopenEvent } from '@/lib/reopenRoutes'
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
  /** 卡片来源：hover=临时(移出即消失)，jump=点击跳转(需手动关闭) */
  source?: 'hover' | 'jump'
  /** 「🔙 回到 {label}」按钮文案；无则不显示按钮（普通定位） */
  reopenLabel?: string
  /** 浮层返回时所需 — 只存在 reopenLabel 时才有意义 */
  reopenKind?: ReopenKind
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
  const backInProgressRef = useRef(false)

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

    let cancelled = false
    let createdMap: any = null
    const timeoutIds: number[] = []
    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn()
      }, delay)
      timeoutIds.push(id)
    }

    setStatus('loading T API...')
    loadTianditu(tk)
      .then(async () => {
        if (cancelled || !containerRef.current) return
        const T = (window as any).T
        if (!T) { setError('T undefined'); return }

        // 等浏览器完成布局计算后再创建地图。
        await new Promise<void>(resolve => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve())
          })
        })
        if (cancelled || !containerRef.current) return
        const container = containerRef.current

        // Strict Mode 可能先执行一次已取消的初始化；只有当前 effect 才能清理/创建容器。
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }

        setStatus('creating T.Map...')
        const map = new T.Map(container, {
          enableDrag: true,
          enableScrollWheelZoom: true,
        })
        createdMap = map
        // 初始中心：默认定位到美索不达米亚（文明摇篮），打开地图就在内容区域
        const initialCenter: [number, number] = [44, 34]
        const initialZoom = 4
        map.centerAndZoom(new T.LngLat(initialCenter[0], initialCenter[1]), initialZoom)
        // 注意：v4.0 中 disableDoubleClickZoom 可能误伤拖拽，先不调用
        // 改用构造函数选项控制（T.Map v4.0 constructor 支持 doubleClickZoom: false）
        // 启用滚轮缩放（构造函数选项 + 显式调用双保险）
        if (typeof map.enableScrollWheelZoom === 'function') {
          map.enableScrollWheelZoom()
        }
        // 初始化完成后再校正一次容器尺寸和交互状态。
        schedule(() => {
          try {
            map.checkResize?.()
            map.enableDrag?.()
          } catch { /* ignore */ }
        }, 200)
        mapRef.current = map
        ;(window as any).__tdtTestMap = map
        setStatus('T.Map ready')
        setMapReady(true)
      })
      .catch(err => setError(err.message || String(err)))

    // 容器尺寸变化时通知 T.Map 重算视口（影响拖拽/缩放行为）
    let resizeObserver: ResizeObserver | null = null
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        const map = mapRef.current
        if (!map) return
        try { map.checkResize?.() } catch { /* ignore */ }
      })
      resizeObserver.observe(containerRef.current)
    }

    let resizeHandler: (() => void) | null = null
    // 稍后再挂 resize（等 map 存在）
    schedule(() => {
      const map = mapRef.current
      if (!map) return
      resizeHandler = () => {
        try { map.checkResize?.() } catch { /* ignore */ }
      }
      window.addEventListener('resize', resizeHandler)
    }, 500)

    return () => {
      cancelled = true
      timeoutIds.forEach(id => window.clearTimeout(id))
      if (resizeObserver) resizeObserver.disconnect()
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)
      // 只销毁本次 effect 创建的实例，避免 Strict Mode 旧任务误删新地图。
      const map = createdMap
      if (map) {
        markersRef.current.forEach((m: any) => { try { map.removeOverLay(m) } catch { /* ignore */ } })
        polygonsRef.current.forEach((p: any) => { try { map.removeOverLay(p) } catch { /* ignore */ } })
        eventMarkersRef.current.forEach((e: any) => { try { map.removeOverLay(e) } catch { /* ignore */ } })
        try { map.destroy() } catch { /* ignore */ }
      }
      markersRef.current = []
      polygonsRef.current = []
      eventMarkersRef.current = []
      if (mapRef.current === map) mapRef.current = null
      if (containerRef.current && map) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild)
        }
      }
      setMapReady(false)
      if ((window as any).__tdtTestMap === map) delete (window as any).__tdtTestMap
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
    const w = containerRef.current?.clientWidth ?? 0
    const h = containerRef.current?.clientHeight ?? 0
    const { x: sx, y: sy } = getClampedScreenPoint(map, lng, lat, w, h, 24)
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
    // 抑制窗口期内跳过 setCenter — useJumpToMap 调用时会设置 jumpSuppressUntil = now + 1200，
    // 防止 currentYear effect 在 mapFocusTarget effect 之前/之后抢飞地图。
    const jumpSuppressUntil = useHistoryStore.getState().jumpSuppressUntil
    const isSuppressed = jumpSuppressUntil > Date.now()
    if (chinaEra?.capital && !isSuppressed) {
      const [lng, lat] = chinaEra.capital
      // 飞向当前朝代都城（拆成 setCenter + setZoom 两步，v4 更可靠）
      try {
        map.setCenter(new T.LngLat(lng, lat))
        map.setZoom(4)
      } catch (e) { /* ignore */ }

      const marker = createMapMarker(map, {
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
      if (marker) {
        try { map.addOverLay(marker) } catch { /* ignore */ }
        markersRef.current.push(marker)
      }
    }

    // 同时期的世界朝代都城 marker
    const activeEras = getActiveErasAtYear(eras, currentYear)
    activeEras.filter(e => e.region !== 'china' && e.capital).slice(0, 4).forEach(era => {
      const [lng, lat] = era.capital!
      const marker = createMapMarker(map, {
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
      if (marker) {
        try { map.addOverLay(marker) } catch { /* ignore */ }
        markersRef.current.push(marker)
      }
    })

    // 该时期事件点（红色圆点）
    const eraEvents = events.filter(
      e => e.coordinates && e.importance >= 2 &&
           Math.abs(e.year - currentYear) <= 50
    ).slice(0, 30)
    eraEvents.forEach(ev => {
      const [lng, lat] = ev.coordinates!
      const marker = createMapMarker(map, {
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
      if (marker) {
        try { map.addOverLay(marker) } catch { /* ignore */ }
        eventMarkersRef.current.push(marker)
      }
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
            if (backInProgressRef.current) return
            backInProgressRef.current = true
            // 统一路由表：kind → CustomEvent（新增 reopen 路径只需在 reopenRoutes.ts 加一行）
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
