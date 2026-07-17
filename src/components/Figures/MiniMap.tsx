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

const WIDTH = 480
const HEIGHT = 300

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
      // 清理 markers
      markersRef.current.forEach(m => {
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
    if (status !== 'ready' || !mapRef.current) return
    const T = (window as any).T
    if (!T) return

    const map = mapRef.current

    // 清理旧 markers
    markersRef.current.forEach(m => {
      try { map.removeOverLay(m) } catch { /* ignore */ }
    })
    markersRef.current = []

    // 只加 focus 节点（用绝对定位 HTML marker，不依赖天地图 img 加载器）
    const focusEntry = nodePositions.find(({ node }) => node === focusNode)
    if (focusEntry && focusEntry.pos) {
      const { node, pos } = focusEntry
      // 创建一个绝对定位的 HTML div 作为 marker
      const markerEl = document.createElement('div')
      markerEl.style.cssText = `
        position: absolute;
        width: 80px;
        height: 56px;
        margin-left: -40px;
        margin-top: -24px;
        pointer-events: none;
        z-index: 1000;
        font-family: serif;
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
      // 把 div 放在 TMap 内部 mapPane（最大尺寸的 div 子元素）
      const mapContainer = containerRef.current
      if (!mapContainer) return
      // 找最深的 div 子元素（mapPane 嵌套最深）
      let overlayPane: HTMLElement = mapContainer
      let deepestSize = 0
      mapContainer.querySelectorAll('div').forEach(div => {
        const rect = div.getBoundingClientRect()
        const size = rect.width * rect.height
        if (size > deepestSize) {
          deepestSize = size
          overlayPane = div as HTMLElement
        }
      })
      // 确保 overlayPane 是 relative 或 absolute（这样 absolute 子元素定位正确）
      const cs = window.getComputedStyle(overlayPane)
      if (cs.position === 'static') {
        overlayPane.style.position = 'relative'
      }
      overlayPane.appendChild(markerEl)
      markersRef.current.push({ el: markerEl, pos })

      // 定位 marker 跟随地图缩放/平移
      const updatePosition = () => {
        try {
          const T = (window as any).T
          // 尝试多种 TMap API
          let point: { x: number; y: number } | null = null
          if (typeof map.lngLatToContainerPoint === 'function') {
            point = map.lngLatToContainerPoint(new T.LngLat(pos[0], pos[1]))
          } else if (typeof map.lngLatToPoint === 'function') {
            point = map.lngLatToPoint(new T.LngLat(pos[0], pos[1]))
          } else if (typeof map.project === 'function') {
            // 找到 map.getSize 和 map.getBounds 自己算
            const p = map.project(new T.LngLat(pos[0], pos[1]))
            const size = map.getSize?.()
            const tl = map.getBounds?.()
            if (size && tl) {
              const nwPx = map.project(new T.LngLat(tl.getWest(), tl.getNorth()))
              const sePx = map.project(new T.LngLat(tl.getEast(), tl.getSouth()))
              const ratio = (p.x - nwPx.x) / (sePx.x - nwPx.x)
              const ratioY = (p.y - nwPx.y) / (sePx.y - nwPx.y)
              point = { x: ratio * size.w, y: ratioY * size.h }
            }
          }
          if (point) {
            markerEl.style.left = point.x + 'px'
            markerEl.style.top = point.y + 'px'
            markerEl.style.display = 'block'
          } else {
            markerEl.style.display = 'none'
          }
        } catch {
          markerEl.style.display = 'none'
        }
      }
      // 初始定位
      updatePosition()
      // 跟随地图缩放/平移
      map.addEventListener?.('moveend', updatePosition)
      map.addEventListener?.('zoomend', updatePosition)
      map.addEventListener?.('viewreset', updatePosition)
      // 存清理函数
      markersRef.current.push({ cleanup: () => {
        map.removeEventListener?.('moveend', updatePosition)
        map.removeEventListener?.('zoomend', updatePosition)
        map.removeEventListener?.('viewreset', updatePosition)
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
          📍 {focusNode.location}
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
