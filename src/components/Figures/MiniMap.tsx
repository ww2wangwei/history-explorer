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

const WIDTH = 360
const HEIGHT = 220

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

        // 创建地图（中心 = 当前节点位置，zoom 3 国家级）
        const map = new T.Map(containerRef.current, {
          projection: 'EPSG:4326',
        })
        const center: [number, number] = focusPos ?? [104, 35]
        const zoom = focusPos ? 4 : 3
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

    // 加所有节点 marker
    nodePositions.forEach(({ node, pos }) => {
      if (!pos) return
      const isFocus = node === focusNode
      const isImp3 = node.importance === 3

      // 自定义 marker DOM
      const el = document.createElement('div')
      el.style.cssText = `
        position: relative;
        width: ${isFocus ? 18 : isImp3 ? 12 : 10}px;
        height: ${isFocus ? 18 : isImp3 ? 12 : 10}px;
        background: ${isFocus ? '#ffd47a' : isImp3 ? '#b85450' : '#7a8a98'};
        border: ${isFocus ? '2px solid #fdf8f0' : '1px solid rgba(255,255,255,0.3)'};
        border-radius: 50%;
        cursor: pointer;
        box-shadow: ${isFocus ? '0 0 12px rgba(255,212,122,0.6)' : '0 1px 3px rgba(0,0,0,0.5)'};
      `
      el.title = `${node.year < 0 ? 'BC ' + (-node.year) : node.year} · ${node.title}`

      if (isFocus) {
        const label = document.createElement('div')
        label.textContent = node.title
        label.style.cssText = `
          position: absolute;
          left: 50%;
          top: -22px;
          transform: translateX(-50%);
          background: rgba(15, 14, 12, 0.85);
          color: #ffd47a;
          font-size: 11px;
          font-family: serif;
          padding: 1px 6px;
          border-radius: 3px;
          white-space: nowrap;
          text-shadow: 0 0 3px #0f0e0c;
        `
        el.appendChild(label)
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        if (isFocus) {
          onJumpToMap(pos, node.year, node.title)
        } else {
          onSwitchNodeRef.current?.(node)
        }
      })

      const marker = new T.Marker(new T.LngLat(pos[0], pos[1]), { icon: el })
      map.addOverLay(marker)
      markersRef.current.push(marker)
    })
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
