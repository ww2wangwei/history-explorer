/**
 * MiniMap — 节点位置缩略图
 * 显示当前节点 + 同大战争所有节点 + 周围海洋轮廓
 * 点击节点切换焦点 + 点击空白区域跳到主地图
 */
import { useMemo, useState, useEffect, useRef } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import { CONTINENTS } from '@/data/geographic-features'
import { lookupLocation, type LngLat } from '@/utils/locationCoords'
import { useHistoryStore } from '@/store/useHistoryStore'
import type { MajorWarNode } from './WarsOverview'

interface MiniMapProps {
  /** 当前焦点节点 */
  focusNode: MajorWarNode
  /** 同专题所有节点（用于显示其他位置） */
  allNodes: MajorWarNode[]
  /** 跳到主地图的回调（关闭弹窗 + 切视图 + setYear + setMapFocus） */
  onJumpToMap: (lngLat: LngLat, year: number, label: string) => void
  /** 切换焦点的回调（点击其他节点） */
  onSwitchNode?: (node: MajorWarNode) => void
}

const WIDTH = 360
const HEIGHT = 220

/** 硬编码的简化世界大陆轮廓（用于 MiniMap，不依赖 CONTINENTS 复杂数据） */
const CONTINENTS_GEO: any = {
  type: 'FeatureCollection',
  features: [
    // 欧亚大陆（连成一片的大轮廓）
    {
      type: 'Feature',
      properties: { id: 'eurasia', name: '欧亚大陆' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-10, 70], [10, 75], [40, 75], [70, 75], [100, 75], [140, 70], [160, 65],
          [170, 60], [170, 50], [150, 45], [140, 38], [130, 35], [120, 30], [120, 22],
          [108, 20], [105, 10], [98, 8], [95, 15], [88, 22], [78, 25], [70, 22],
          [60, 25], [50, 25], [45, 30], [35, 30], [25, 35], [15, 40], [10, 45],
          [5, 50], [-5, 55], [-10, 60], [-10, 70],
        ]],
      },
    },
    // 非洲
    {
      type: 'Feature',
      properties: { id: 'africa', name: '非洲' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-15, 35], [-10, 30], [0, 30], [10, 33], [20, 32], [30, 30], [40, 20],
          [50, 12], [50, 0], [40, -10], [30, -25], [20, -34], [10, -25], [0, -10],
          [-10, 0], [-15, 15], [-15, 35],
        ]],
      },
    },
    // 北美洲
    {
      type: 'Feature',
      properties: { id: 'north-america', name: '北美洲' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-170, 70], [-130, 72], [-100, 70], [-80, 75], [-65, 80], [-55, 70],
          [-55, 55], [-65, 45], [-80, 40], [-85, 30], [-100, 30], [-110, 32],
          [-125, 40], [-130, 50], [-135, 58], [-160, 60], [-170, 70],
        ]],
      },
    },
    // 南美洲
    {
      type: 'Feature',
      properties: { id: 'south-america', name: '南美洲' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-80, 12], [-70, 12], [-60, 5], [-50, 0], [-40, -5], [-35, -15],
          [-45, -25], [-55, -35], [-65, -45], [-72, -55], [-75, -50], [-78, -35],
          [-82, -15], [-80, 0], [-80, 12],
        ]],
      },
    },
    // 澳大利亚
    {
      type: 'Feature',
      properties: { id: 'australia', name: '澳大利亚' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [115, -12], [130, -12], [142, -10], [152, -20], [150, -35], [140, -38],
          [120, -35], [115, -25], [115, -12],
        ]],
      },
    },
  ],
}

export default function MiniMap({ focusNode, allNodes, onJumpToMap, onSwitchNode }: MiniMapProps) {
  // 计算所有节点的位置（解析 location → 经纬度）
  const nodePositions = useMemo(() => {
    return allNodes.map(node => ({
      node,
      pos: lookupLocation(node.location),
    })).filter(x => x.pos) as Array<{ node: MajorWarNode; pos: LngLat }>
  }, [allNodes])

  // 焦点位置
  const focusPos = useMemo(() => lookupLocation(focusNode.location), [focusNode])

  // 计算视图中心和缩放：自动 fit 所有点（保证焦点在中心 + 全部可见）
  const [center, zoom] = useMemo<[LngLat, number]>(() => {
    if (!focusPos) return [[50, 30], 1]
    if (nodePositions.length <= 1) {
      return [focusPos, 4]  // 只有焦点
    }
    // 找到最远的点
    let maxDist = 0
    nodePositions.forEach(({ pos }) => {
      const d = Math.hypot(pos[0] - focusPos[0], pos[1] - focusPos[1])
      if (d > maxDist) maxDist = d
    })
    // 根据最大距离算合适的 zoom（粗略公式）
    // 距离 < 5°  → zoom 5
    // 距离 < 15° → zoom 3
    // 距离 < 40° → zoom 2
    // 距离 > 40° → zoom 1
    let z = 1
    if (maxDist < 5) z = 5
    else if (maxDist < 10) z = 4
    else if (maxDist < 20) z = 3
    else if (maxDist < 40) z = 2
    else z = 1.3
    return [focusPos, z]
  }, [focusPos, nodePositions])

  // 容器 ref（用于点空白平移 / 滚轮缩放）
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })

  // 滚轮缩放
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.1 : 0.9
      setTransform(prev => {
        const newK = Math.max(0.5, Math.min(8, prev.k * factor))
        // 缩放围绕鼠标
        const dx = mx - (mx - prev.x) * (newK / prev.k)
        const dy = my - (my - prev.y) * (newK / prev.k)
        return { x: dx, y: dy, k: newK }
      })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  // 拖动平移
  const [panning, setPanning] = useState(false)
  const panRef = useRef<{ x: number; y: number } | null>(null)

  const handleBackgroundDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return
    setPanning(true)
    panRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y }
  }
  useEffect(() => {
    if (!panning) return
    const handleMove = (e: MouseEvent) => {
      if (!panRef.current) return
      setTransform(prev => ({
        ...prev,
        x: e.clientX - panRef.current!.x,
        y: e.clientY - panRef.current!.y,
      }))
    }
    const handleUp = () => { setPanning(false); panRef.current = null }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [panning])

  // 重置视图
  const resetView = () => setTransform({ x: 0, y: 0, k: 1 })

  // 跳转主地图
  const handleJump = (lngLat: LngLat, year: number, label: string) => {
    onJumpToMap(lngLat, year, label)
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
      ref={containerRef}
      className="relative w-full h-[220px] overflow-hidden rounded border border-ink-600 bg-[#0a1820]"
      style={{ cursor: panning ? 'grabbing' : 'grab' }}
      onMouseDown={handleBackgroundDown}
    >
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 1 }}
        width={WIDTH}
        height={HEIGHT}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          center={center}
          zoom={zoom}
          minZoom={1}
          maxZoom={8}
        >
          {/* 海洋底色 + 大陆轮廓（用 CONTINENTS 数据） */}
          <Geographies geography={CONTINENTS_GEO}>
            {({ geographies }: any) => {
              if (!geographies || geographies.length === 0) {
                return (
                  <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" fill="#666" fontSize={12}>
                    地图加载失败
                  </text>
                )
              }
              return geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey || geo.properties?.id}
                  geography={geo}
                  fill="#3a5a70"
                  stroke="#5a8090"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#4a6a80', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }}
          </Geographies>

          {/* 所有节点标记 */}
          {nodePositions.map(({ node, pos }) => {
            const isFocus = node === focusNode
            const isImp3 = node.importance === 3
            const color = isFocus ? '#ffd47a' : (isImp3 ? '#b85450' : '#5a6a78')
            const size = isFocus ? 5 : (isImp3 ? 3.5 : 2.5)
            return (
              <Marker key={`${node.year}-${node.title}`} coordinates={pos}>
                {isFocus && (
                  <circle r={9} fill="#ffd47a" opacity={0.25} />
                )}
                <circle
                  r={size}
                  fill={color}
                  stroke={isFocus ? '#fdf8f0' : 'none'}
                  strokeWidth={isFocus ? 1.5 : 0}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isFocus && onSwitchNode) {
                      onSwitchNode(node)
                    } else if (isFocus) {
                      handleJump(pos, node.year, node.title)
                    }
                  }}
                >
                  <title>{`${node.year < 0 ? 'BC ' + (-node.year) : node.year} · ${node.title}${isFocus ? ' (当前)' : ''}`}</title>
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

      {/* 顶部信息条 */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] text-parchment-100/80 pointer-events-none">
        <div className="bg-ink-900/70 backdrop-blur px-2 py-1 rounded">
          📍 {focusNode.location}
        </div>
        <button
          onClick={resetView}
          className="bg-ink-900/70 backdrop-blur px-2 py-1 rounded text-ink-300 hover:text-parchment-50 pointer-events-auto"
          title="重置视图"
        >
          ⛶ 重置
        </button>
      </div>

      {/* 底部跳转按钮 */}
      <button
        onClick={() => handleJump(focusPos!, focusNode.year, focusNode.title)}
        className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-emerald-700/80 hover:bg-emerald-600/90 border border-emerald-500/60 text-emerald-100 text-[10px] transition-colors shadow"
      >
        🗺️ 跳到主地图
      </button>

      {/* 提示 */}
      <div className="absolute bottom-2 left-2 text-[9px] text-ink-400/80 bg-ink-900/50 backdrop-blur px-1.5 py-0.5 rounded pointer-events-none">
        {nodePositions.length} 个节点 · 滚轮缩放 · 拖动平移
      </div>
    </div>
  )
}
