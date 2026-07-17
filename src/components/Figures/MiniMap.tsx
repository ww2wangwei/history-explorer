/**
 * MiniMap — 节点位置缩略图
 * 用天地图 JavaScript SDK (T.Map) 创建独立地图实例
 * 节点用 T.Marker 标记
 */
import { useEffect, useRef, useState } from 'react'
import { loadTianditu } from '@/lib/tdt/loader'
import { lookupLocation, type LngLat } from '@/utils/locationCoords'
import type { MajorWarNode } from './WarsOverview'

interface MiniMapProps {
  focusNode: MajorWarNode
  allNodes: MajorWarNode[]
  onJumpToMap: (lngLat: LngLat, year: number, label: string) => void
  onSwitchNode?: (node: MajorWarNode) => void
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

  // 节点位置
  const nodePositions = allNodes
    .map(node => ({ node, pos: lookupLocation(node.location) }))
    .filter(x => x.pos) as Array<{ node: MajorWarNode; pos: LngLat }>

  const focusPos = lookupLocation(focusNode.location)

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

    // 只加 focus 节点（简化设计：只显示当前事件的位置）
    const focusEntry = nodePositions.find(({ node }) => node === focusNode)
    if (focusEntry && focusEntry.pos) {
      const { node, pos } = focusEntry
      // 大号金色图钉 + 金色光晕 + 节点名 label
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="56" viewBox="0 0 80 56">
          <!-- 金色光晕 -->
          <circle cx="40" cy="24" r="22" fill="#ffd47a" opacity="0.25"/>
          <circle cx="40" cy="24" r="14" fill="#ffd47a" opacity="0.35"/>
          <!-- 中心圆点 -->
          <circle cx="40" cy="24" r="9" fill="#ffd47a" stroke="#fdf8f0" stroke-width="2.5"/>
          <circle cx="40" cy="24" r="3" fill="#fdf8f0"/>
          <!-- 节点名 label（圆点下方） -->
          <rect x="0" y="38" width="80" height="18" rx="3" fill="rgba(15, 14, 12, 0.85)"/>
          <text x="40" y="50" text-anchor="middle" font-size="11" fill="#ffd47a" font-family="serif" font-weight="600" paint-order="stroke" stroke="#0f0e0c" stroke-width="2.5">${node.title.slice(0, 10)}</text>
        </svg>`
      const iconUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
      const icon = new T.Icon({
        iconUrl,
        iconSize: new T.Point(80, 56),
        iconAnchor: new T.Point(40, 24),
      })
      const marker = new T.Marker(new T.LngLat(pos[0], pos[1]), { icon })
      marker.addEventListener('click', () => {
        onJumpToMap(pos, node.year, node.title)
      })
      map.addOverLay(marker)
      markersRef.current.push(marker)
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
