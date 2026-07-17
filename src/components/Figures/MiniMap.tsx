/**
 * MiniMap — 节点位置缩略图
 * 用 react-simple-maps + TiandituTiles（与主地图同款）
 * 节点用 SVG circle 标记
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { ComposableMap, ZoomableGroup, Marker } from 'react-simple-maps'
import { useHistoryStore } from '@/store/useHistoryStore'
import { lookupLocation, type LngLat } from '@/utils/locationCoords'
import TiandituTiles from '@/components/Map/TiandituTiles'
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
  const setMapFocus = useHistoryStore(s => s.setMapFocus)
  const setYear = useHistoryStore(s => s.setYear)

  // 节点位置
  const nodePositions = useMemo(() => {
    return allNodes
      .map(node => ({ node, pos: lookupLocation(node.location) }))
      .filter(x => x.pos) as Array<{ node: MajorWarNode; pos: LngLat }>
  }, [allNodes])

  const focusPos = useMemo(() => lookupLocation(focusNode.location), [focusNode])

  // 拖动平移（叠加在 react-simple-maps 的 zoom/pan 之外）
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [panning, setPanning] = useState(false)
  const panRef = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).tagName !== 'svg') return
    setPanning(true)
    panRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }
  useEffect(() => {
    if (!panning) return
    const move = (e: MouseEvent) => {
      setPan({ x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y })
    }
    const up = () => setPanning(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [panning])

  const resetView = () => setPan({ x: 0, y: 0 })

  const handleJump = () => {
    onJumpToMap(focusPos!, focusNode.year, focusNode.title)
  }

  if (!focusPos) {
    return (
      <div className="text-xs text-ink-500 italic p-3 bg-ink-700/30 rounded">
        （该节点无位置信息：{focusNode.location}）
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-[220px] overflow-hidden rounded border border-ink-600 bg-[#0a1820]"
      style={{ cursor: panning ? 'grabbing' : 'grab' }}
    >
      {/* react-simple-maps 地图 */}
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
      >
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 1 }}
          width={WIDTH}
          height={HEIGHT}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup center={focusPos} zoom={2.5} minZoom={1} maxZoom={6}>
            {/* 天地图瓦片层（自动用 VITE_TIANDITU_KEY） — 必须在 ZoomableGroup 内部 */}
            <TiandituTiles width={WIDTH} height={HEIGHT} />

            {/* 节点标记 */}
            {nodePositions.map(({ node, pos }) => {
              if (!pos) return null
              const isFocus = node === focusNode
              const isImp3 = node.importance === 3
              return (
                <Marker key={`${node.year}-${node.title}`} coordinates={pos}>
                  {isFocus && (
                    <circle r={9} fill="#ffd47a" opacity={0.35} style={{ pointerEvents: 'none' }} />
                  )}
                  <circle
                    r={isFocus ? 5 : isImp3 ? 4 : 3}
                    fill={isFocus ? '#ffd47a' : isImp3 ? '#b85450' : '#7a8a98'}
                    stroke={isFocus ? '#fdf8f0' : 'none'}
                    strokeWidth={isFocus ? 1.5 : 0}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isFocus) handleJump()
                      else if (onSwitchNode) onSwitchNode(node)
                    }}
                  >
                    <title>{`${node.year < 0 ? 'BC ' + (-node.year) : node.year} · ${node.title}`}</title>
                  </circle>
                  {isFocus && (
                    <text
                      textAnchor="middle"
                      y={-10}
                      fontSize={9}
                      fill="#ffd47a"
                      style={{ paintOrder: 'stroke', stroke: '#0f0e0c', strokeWidth: 2.5, pointerEvents: 'none' }}
                    >
                      {node.title}
                    </text>
                  )}
                </Marker>
              )
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* 顶部信息条 */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] text-parchment-100/90 pointer-events-none z-10">
        <div className="bg-ink-900/80 backdrop-blur px-2 py-1 rounded">
          📍 {focusNode.location}
        </div>
        <button
          onClick={resetView}
          className="bg-ink-900/80 backdrop-blur px-2 py-1 rounded text-ink-300 hover:text-parchment-50 pointer-events-auto"
          title="重置视图"
        >
          ⛶ 重置
        </button>
      </div>

      {/* 底部跳转按钮 */}
      <button
        onClick={handleJump}
        className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-emerald-700/80 hover:bg-emerald-600/90 border border-emerald-500/60 text-emerald-100 text-[10px] transition-colors shadow z-10"
      >
        🗺️ 跳到主地图
      </button>

      {/* 提示 */}
      <div className="absolute bottom-2 left-2 text-[9px] text-ink-300/90 bg-ink-900/70 backdrop-blur px-1.5 py-0.5 rounded pointer-events-none z-10">
        {nodePositions.length} 个节点 · 拖动平移
      </div>
    </div>
  )
}
