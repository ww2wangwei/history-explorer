/**
 * MiniMap — 节点位置缩略图（纯 SVG 简化世界版）
 * 用 SVG path 画简化大洲 + 节点标记
 * 不依赖 react-simple-maps / 天地图瓦片（被 WAF 拦了）
 */
import { useMemo, useState, useRef, useEffect } from 'react'
import { lookupLocation, type LngLat } from '@/utils/locationCoords'
import { useHistoryStore } from '@/store/useHistoryStore'
import type { MajorWarNode } from './WarsOverview'

interface MiniMapProps {
  focusNode: MajorWarNode
  allNodes: MajorWarNode[]
  onJumpToMap: (lngLat: LngLat, year: number, label: string) => void
  onSwitchNode?: (node: MajorWarNode) => void
}

const WIDTH = 360
const HEIGHT = 220

/** 大洲 SVG 路径（手绘简化 [lng, lat] 格式） */
const CONTINENT_PATHS = [
  // 欧亚大陆
  'M -10 60 L 20 50 L 30 45 L 50 35 L 70 28 L 90 22 L 110 20 L 130 25 L 145 35 L 160 50 L 170 55 L 150 60 L 130 65 L 110 70 L 80 72 L 50 70 L 20 70 L -10 70 Z',
  // 非洲
  'M -15 30 L 0 28 L 15 30 L 30 25 L 40 15 L 50 0 L 45 -15 L 35 -30 L 20 -35 L 10 -25 L 0 -10 L -10 5 L -15 20 Z',
  // 北美
  'M -170 60 L -130 65 L -100 70 L -80 65 L -60 60 L -55 45 L -65 30 L -80 28 L -100 25 L -125 30 L -140 40 L -160 50 Z',
  // 南美
  'M -78 8 L -70 5 L -60 -5 L -50 -15 L -40 -25 L -35 -40 L -45 -50 L -55 -45 L -65 -30 L -72 -15 L -78 0 Z',
  // 澳大利亚
  'M 115 -12 L 130 -10 L 145 -15 L 150 -25 L 140 -38 L 125 -35 L 118 -25 Z',
  // 不列颠群岛
  'M -8 56 L -2 58 L -3 52 L -8 50 Z',
  // 日本
  'M 138 35 L 142 32 L 144 38 L 140 40 Z',
  // 印尼
  'M 95 -2 L 110 -3 L 125 -5 L 130 -8 L 115 -10 L 100 -8 Z',
]

/** 经纬度 → SVG 像素（墨卡托投影简化） */
function lngLatToSvgPx(lng: number, lat: number, width: number, height: number) {
  // Web Mercator 投影（简化）：lng → x 线性，lat → y 用对数
  const x = (lng + 180) / 360 * width
  const latRad = (lat * Math.PI) / 180
  const y = (height / 2) - (height / (2 * Math.PI)) * Math.log(Math.tan(Math.PI / 4 + latRad / 2))
  return { x, y }
}

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

  // 拖动平移
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [panning, setPanning] = useState(false)
  const panRef = useRef({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
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

  // 节点像素位置（应用 pan 偏移）
  const nodeMarkers = nodePositions.map(({ node, pos }) => {
    const { x, y } = lngLatToSvgPx(pos[0], pos[1], WIDTH, HEIGHT)
    return {
      node,
      x: x + pan.x,
      y: y + pan.y,
      isFocus: node === focusNode,
      isImp3: node.importance === 3,
    }
  })

  return (
    <div
      className="relative w-full h-[220px] overflow-hidden rounded border border-ink-600 bg-[#0a1820]"
      style={{ cursor: panning ? 'grabbing' : 'grab' }}
    >
      <svg
        ref={svgRef}
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="absolute inset-0"
        style={{ cursor: panning ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
      >
        {/* 海洋背景（深蓝） */}
        <rect width={WIDTH} height={HEIGHT} fill="#0a1820" />

        {/* 大洲轮廓（深蓝绿色） */}
        <g transform={`translate(${pan.x}, ${pan.y})`}>
          {CONTINENT_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="#2a4a5a"
              stroke="#3a6a7a"
              strokeWidth={0.5}
            />
          ))}
        </g>

        {/* 节点标记 */}
        <g transform={`translate(${pan.x}, ${pan.y})`}>
          {nodeMarkers.map(({ node, x, y, isFocus, isImp3 }) => {
            if (!Number.isFinite(x) || !Number.isFinite(y)) return null
            return (
              <g
                key={`${node.year}-${node.title}`}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isFocus) {
                    handleJump()
                  } else if (onSwitchNode) {
                    onSwitchNode(node)
                  }
                }}
              >
                {isFocus && (
                  <circle cx={x} cy={y} r={10} fill="#ffd47a" opacity={0.3} />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isFocus ? 5 : isImp3 ? 4 : 3}
                  fill={isFocus ? '#ffd47a' : isImp3 ? '#b85450' : '#7a8a98'}
                  stroke={isFocus ? '#fdf8f0' : 'none'}
                  strokeWidth={isFocus ? 1.5 : 0}
                >
                  <title>{`${node.year < 0 ? 'BC ' + (-node.year) : node.year} · ${node.title}`}</title>
                </circle>
                {isFocus && (
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#ffd47a"
                    style={{ paintOrder: 'stroke', stroke: '#0f0e0c', strokeWidth: 2.5, pointerEvents: 'none' }}
                  >
                    {node.title}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

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
