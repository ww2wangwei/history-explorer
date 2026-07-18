/**
 * MiniMap — 节点位置缩略图
 * 用天地图 JavaScript SDK (T.Map) 创建独立地图实例
 * 节点用 T.Marker 标记
 */
import { useEffect, useRef, useState } from 'react'
import { loadTianditu } from '@/lib/tdt/loader'
import { lookupLocation, type LngLat } from '@/utils/locationCoords'

/** 通用节点类型：战争事件或大型战争节点 */
export interface MapNode {
  title: string
  year: number
  location: string
  importance: 1 | 2 | 3
  /** 优先使用：直接经纬度（如果有） */
  coordinates?: [number, number]
}

interface MiniMapProps {
  focusNode: MapNode
  allNodes: MapNode[]
  onJumpToMap: (lngLat: LngLat, year: number, label: string) => void
  onSwitchNode?: (node: MapNode) => void
}

// 天地图 geoEqualEarth 投影下世界 2:1
// 容器也用 2:1 让地图填满（不左右留白）
const WIDTH = 480
const HEIGHT = 240

export default function MiniMap({ focusNode, allNodes, onJumpToMap, onSwitchNode }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const onSwitchNodeRef = useRef(onSwitchNode)

  const [status, setStatus] = useState<'init' | 'loading' | 'ready' | 'error'>('init')
  const [error, setError] = useState<string | null>(null)

  // 节点位置：优先用 node.coordinates（精确），否则查 location 字典
  const nodePositions = allNodes
    .map(node => ({ node, pos: node.coordinates || lookupLocation(node.location) }))
    .filter(x => x.pos) as Array<{ node: MapNode; pos: LngLat }>

  const focusPos = focusNode.coordinates || lookupLocation(focusNode.location)

  // 计算 marker 屏幕位置（Web Mercator 公式）
  // 监听 zoomend/moveend 时重算
  const TILE_SIZE = 256
  const ZOOM = 5
  const n = Math.pow(2, ZOOM)
  const containerRect = containerRef.current?.getBoundingClientRect()
  const W = containerRect.width
  const H = containerRect.height
  const scale = W / (TILE_SIZE * n)
  const lngToX = (lng: number) => (lng + 180) / 360 * (TILE_SIZE * n)
  const latToY = (lat: number) => (1 - Math.log(Math.tan(lat * Math.PI / 180 / 2 + Math.PI / 4)) / Math.PI) / 2 * (TILE_SIZE * n)
  const centerWorldX = lngToX(focusPos![0])
  const centerWorldY = latToY(focusPos![1])
  const nodeWorldX = lngToX(pos![0])
  const nodeWorldY = latToY(pos![1])
  const screenX = (nodeWorldX - centerWorldX) * scale + containerRect.left + W / 2
  const screenY = (nodeWorldY - centerWorldY) * scale + containerRect.top + H / 2

  function updatePosition() {
    if (!markerEl.isConnected || !mapRef.current) return
    // TMap v4: 用 map.lngLatToContainerPoint 把经纬度转屏幕像素
    const T = (window as any).T
    let pt: { x: number; y: number } | null = null
    if (typeof mapRef.current.lngLatToContainerPoint === 'function') {
      const p = mapRef.current.lngLatToContainerPoint(new T.LngLat(pos![0], pos![1]))
      pt = { x: p.x ?? p[0], y: p.y ?? p[1] }
    } else if (typeof mapRef.current.lngLatToPoint === 'function') {
      const p = mapRef.current.lngLatToPoint(new T.LngLat(pos![0], pos![1]))
      pt = { x: p.x ?? p[0], y: p.y ?? p[1] }
    }
    if (pt) {
      // lngLatToContainerPoint 返回相对 mapContainer 的坐标
      // 但 marker 用 fixed 定位（相对 viewport），需要加上 container 的 viewport 偏移
      const r = containerRef.current?.getBoundingClientRect()
      markerEl.style.left = (r.left + pt.x) + 'px'
      markerEl.style.top = (r.top + pt.y) + 'px'
    }
  }

  // 保持 onSwitchNode 最新（避免 effect 重跑）
  useEffect(() => { onSwitchNodeRef.current = onSwitchNode }, [onSwitchNode])

  // 初始化地图
  useEffect(() => {
    const tk = import.meta.env.VITE_TIANDITU_KEY as string | undefined
    if (!tk || !containerRef.current) {
      setStatus('error')
      setError('TMap 不可用：缺少 VITE_TIANDITU_KEY 或容器未挂载')
      return
    }

    setStatus('loading')

    loadTianditu(tk)
      .then(() => {
        if (!containerRef.current) return
        const T = (window as any).T
        if (!T) {
          setStatus('error')
          setError('TMap 全局对象 T 未定义')
          return
        }

        // 清理容器（防止 HMR 重复挂载）
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild)
        }

        // 创建地图（中心 = 当前节点位置，zoom 5 城市级）
        const map = new T.Map(containerRef.current, {
          projection: 'EPSG:4326',
        })
        const center: [number, number] = focusPos ?? [104, 35]
        const zoom = focusPos ? 5 : 3
        map.centerAndZoom(new T.LngLat(center[0], center[1]), zoom)
        if (typeof map.enableScrollWheelZoom === 'function') {
          map.enableScrollWheelZoom()
        }
        mapRef.current = map
        setStatus('ready')
      })
      .catch(err => {
        setStatus('error')
        setError(err.message || String(err))
      })

    return () => {
      // 清理 markers（包括 body 直接子元素 + TMap overlay）
      markersRef.current.forEach(m => {
        // body 直接子元素（HTML div marker）
        if (m?.el && m.el.parentNode) {
          m.el.parentNode.removeChild(m.el)
        }
        // 旧 TMap marker（防御性）
        try { mapRef.current?.removeOverLay?.(m) } catch { /* ignore */ }
      })
      markersRef.current = []
      try { mapRef.current?.destroy?.() } catch { /* ignore */ }
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNode.location])  // 节点切换时重新初始化

  // 当节点位置确定后，加 markers
  useEffect(() => {
    console.log('[MiniMap] marker effect triggered', { status, hasMap: !!mapRef.current, focusNode: focusNode?.title, nodeCount: nodePositions.length })
    if (status !== 'ready' || !mapRef.current) return
    const T = (window as any).T
    if (!T) { console.log('[MiniMap] T not available'); return }

    const map = mapRef.current

    // 清理旧 markers
    markersRef.current.forEach(m => {
      // body 直接子元素（HTML div marker）
      if (m?.el && m.el.parentNode) {
        m.el.parentNode.removeChild(m.el)
      }
      // 旧 TMap marker（防御性）
      try { map.removeOverLay?.(m) } catch { /* ignore */ }
    })
    markersRef.current = []

    // 只加 focus 节点（自己用 Web Mercator 算像素位置，不依赖天地图 API）
    // 注意: focusNode 是 props，每次 render 都是新 MapNode 对象
    // 不能用 === 比较，按 title + year 比较
    const focusEntry = nodePositions.find(
      ({ node }) => node.title === focusNode.title && node.year === focusNode.year
    )
    console.log('[MiniMap] focusEntry:', focusEntry ? `${focusEntry.node.title} @ ${focusEntry.pos}` : 'NOT FOUND')
    if (focusEntry && focusEntry.pos) {
      const { node, pos } = focusEntry
      const mapContainer = containerRef.current
      if (!mapContainer) { console.log('[MiniMap] no mapContainer'); return }
      console.log('[MiniMap] starting marker creation')

      // 创建一个绝对定位的 HTML div 作为 marker
      const markerEl = document.createElement('div')
      markerEl.style.cssText = `
        position: fixed;
        width: 80px;
        height: 56px;
        margin-left: -40px;
        margin-top: -24px;
        pointer-events: none;
        z-index: 99999;
        font-family: serif;
        will-change: transform;
      `
      markerEl.innerHTML = `
        <div style="position:absolute;left:18px;top:2px;width:44px;height:44px;border-radius:50%;background:rgba(255,212,122,0.3);"></div>
        <div style="position:absolute;left:26px;top:10px;width:28px;height:28px;border-radius:50%;background:rgba(255,212,122,0.5);"></div>
        <div style="position:absolute;left:31px;top:15px;width:18px;height:18px;border-radius:50%;background:#ffd47a;border:2.5px solid #ffffff;"></div>
        <div style="position:absolute;left:36px;top:20px;width:8px;height:8px;border-radius:50%;background:#ffffff;"></div>
        <div style="position:absolute;left:0;top:38px;width:80px;height:18px;background:rgba(15,14,12,0.9);border-radius:3px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#ffd47a;font-size:11px;font-weight:600;text-shadow:0 0 3px #0f0e0c;">${node.title.slice(0, 10)}</span>
        </div>
      `
      // 直接放到 body（最顶层，不被 TMap 内部遮挡）
      document.body.appendChild(markerEl)

      // 自己用 Web Mercator 算 marker 位置（fixed 定位用 viewport 坐标）
      // 关键: TMap 渲染逻辑 = 整世界 (lngToX/latToY) 缩放到容器
      // 公式: 屏幕位置 = (世界坐标差 * 缩放比例) + 容器中心
      // TMap zoom=5: 世界宽 256 * 2^5 = 8192 像素
      // 缩放比例 = containerWidth / 8192
      const TILE_SIZE = 256
      const ZOOM = 5
      const n = Math.pow(2, ZOOM)
      const containerRect = mapContainer.getBoundingClientRect()
      const W = containerRect.width
      const H = containerRect.height
      const scale = W / (TILE_SIZE * n)  // 缩放比例

      // TMap 内部坐标转换（Web Mercator）
      const lngToX = (lng: number) => (lng + 180) / 360 * (TILE_SIZE * n)
      const latToY = (lat: number) => (1 - Math.log(Math.tan(lat * Math.PI / 180 / 2 + Math.PI / 4)) / Math.PI) / 2 * (TILE_SIZE * n)

      // TMap center 坐标（= focusPos）
      const centerWorldX = lngToX(focusPos[0])
      const centerWorldY = latToY(focusPos[1])
      // 节点坐标
      const nodeWorldX = lngToX(pos[0])
      const nodeWorldY = latToY(pos[1])
      // 屏幕位置（容器内 + 容器 viewport 位置）
      const screenX = (nodeWorldX - centerWorldX) * scale + containerRect.left + W / 2
      const screenY = (nodeWorldY - centerWorldY) * scale + containerRect.top + H / 2

      markerEl.style.left = screenX + 'px'
      markerEl.style.top = screenY + 'px'

      console.log('[MiniMap] marker at', { screenX, screenY, containerLeft: containerRect.left, containerTop: containerRect.top })
      // 下一帧检查 marker 实际位置
      requestAnimationFrame(() => {
        if (markerEl.isConnected) {
          const r = markerEl.getBoundingClientRect()
          console.log('[MiniMap] marker rect:', { x: r.x, y: r.y, w: r.width, h: r.height, display: getComputedStyle(markerEl).display, visibility: getComputedStyle(markerEl).visibility, opacity: getComputedStyle(markerEl).opacity })
        } else {
          console.log('[MiniMap] marker not in DOM')
        }
      })

      map.addEventListener('zoomend', updatePosition)
      map.addEventListener('moveend', updatePosition)
      markersRef.current.push({ el: markerEl, cleanup: () => {
        map.removeEventListener('zoomend', updatePosition)
        map.removeEventListener('moveend', updatePosition)
      }})
    }
  }, [status, focusNode, nodePositions, onJumpToMap])

  if (!focusPos) {
    return (
      <div className="text-xs text-ink-500 italic p-3 bg-ink-700/30 rounded">
        （该节点无位置信息：{focusNode.location}）
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* 错误提示 */}
      {status === 'error' && (
        <div className="absolute top-2 left-2 right-2 z-20 px-3 py-2 rounded bg-amber-900/80 border border-amber-600/60 text-amber-100 text-xs">
          ⚠️ 天地图加载失败：{error}
        </div>
      )}

      {/* 状态提示（仅在加载中显示） */}
      {status === 'loading' && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 rounded bg-ink-900/80 text-ink-300 text-[10px]">
          ⏳ 加载天地图...
        </div>
      )}

      {/* 地图容器 */}
      <div
        ref={containerRef}
        className="rounded border border-ink-600 bg-[#0a1820]"
        style={{ width: WIDTH, height: HEIGHT }}
      />

      {/* 顶部信息条 */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 text-[10px] pointer-events-none">
        <div className="bg-ink-900/80 backdrop-blur px-2 py-1 rounded text-parchment-100/90">
          🎯 {focusNode.title}
        </div>
      </div>

      {/* 底部按钮组 */}
      <div className="absolute bottom-2 right-2 z-10 flex gap-1.5">
        <button
          onClick={() => onJumpToMap(focusPos, focusNode.year, focusNode.title)}
          className="px-2.5 py-1 rounded bg-emerald-700/80 hover:bg-emerald-600/90 border border-emerald-500/60 text-emerald-100 text-[10px] transition-colors shadow"
        >
          🗺️ 跳到主地图
        </button>
      </div>

      {/* 提示 */}
      <div className="absolute bottom-2 left-2 text-[9px] text-ink-300/90 bg-ink-900/70 backdrop-blur px-1.5 py-0.5 rounded pointer-events-none z-10">
        {nodePositions.length} 个节点 · 滚轮缩放 · 拖动平移
      </div>
    </div>
  )
}
