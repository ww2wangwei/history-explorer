/**
 * FigureRelationshipGraph — 以某个人物为中心的关系网
 *
 * 视图逻辑：
 *   - 中心节点 = focusFigure（金色边框、放大、轻微脉动）
 *   - 1 度节点 = focusFigure.relatedFigureIds 中的人物
 *   - 2 度节点 = 1 度节点的相关人物中、未在 1 度集合内的（保持稀疏）
 *   - 边 = 关系（按 type 着色：mentor 蓝、rival 红、successor 绿、contemporary 灰、family 紫）
 *
 * 交互：
 *   - 拖动节点（其他节点跟随物理响应）
 *   - 滚轮缩放（整体）
 *   - 点击节点 → 切换焦点（关闭后由父级在 onClose 时更新）
 *   - 点击空白 + ESC 关闭
 */
import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force'
import peopleData from '@/data/people.json'
import type { HistoricalFigure } from '@/types'

const people = peopleData as HistoricalFigure[]

type RelationType = 'rival' | 'mentor' | 'successor' | 'contemporary' | 'family'

// 关系样式：颜色、图例、强度（决定距离）
const RELATION_STYLE: Record<RelationType, { color: string; label: string; dash: string; distance: number; strength: number }> = {
  mentor:      { color: '#5b9bc8', label: '👨‍🏫 师承',     dash: '0',  distance: 110, strength: 0.6 },
  rival:       { color: '#b85450', label: '⚔️ 对手',     dash: '0',  distance: 130, strength: 0.4 },
  successor:   { color: '#5bc89a', label: '👑 传承',     dash: '0',  distance: 110, strength: 0.6 },
  contemporary:{ color: '#8a8a8a', label: '🤝 同代',     dash: '4 4', distance: 95,  strength: 0.2 },
  family:      { color: '#9b7eb6', label: '👪 家族',     dash: '0',  distance: 90,  strength: 0.7 },
}

interface GraphNode extends SimulationNodeDatum {
  id: string
  figure: HistoricalFigure
  isFocus: boolean
  // 距中心几度
  degree: 0 | 1 | 2
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  type: RelationType
  source: string | GraphNode
  target: string | GraphNode
}

interface Props {
  focusFigureId: string
  onClose: () => void
  /** 切换焦点人物（点击其他人物时调用，父级可同步更新 detail dialog） */
  onSwitchFocus?: (figureId: string) => void
}

const WIDTH = 1200
const HEIGHT = 700
const NODE_RADIUS = 36  // 节点半径（用于 collide）

export default function FigureRelationshipGraph({ focusFigureId, onClose, onSwitchFocus }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(WIDTH)
  const [height, setHeight] = useState(HEIGHT)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  // 用 React state 同步节点位置（避免直接修改 d3 引用）
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({})
  // 视图缩放与平移
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, k: 1 })
  // 节点拖拽
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const dragHasMovedRef = useRef(false)

  // 焦点人物
  const focusFigure = useMemo(
    () => people.find(p => p.id === focusFigureId) ?? null,
    [focusFigureId]
  )

  // 构建图：1 度 + 2 度
  const { nodes, links } = useMemo(() => {
    if (!focusFigure) return { nodes: [] as GraphNode[], links: [] as GraphLink[] }
    const byId = new Map(people.map(p => [p.id, p]))

    // 1 度 = focus 的直接关系
    const oneDegreeIds = new Set<string>()
    const oneDegreeLinks: GraphLink[] = []
    ;(focusFigure.relatedFigureIds ?? []).forEach(rel => {
      if (!byId.has(rel.id)) return
      oneDegreeIds.add(rel.id)
      oneDegreeLinks.push({
        source: focusFigure.id,
        target: rel.id,
        type: rel.type,
      })
    })

    // 2 度 = 1 度节点的关系中、尚未在 1 度的
    const twoDegreeIds = new Set<string>()
    const twoDegreeLinks: GraphLink[] = []
    oneDegreeIds.forEach(id => {
      const fig = byId.get(id)
      if (!fig?.relatedFigureIds) return
      fig.relatedFigureIds.forEach(rel => {
        if (!byId.has(rel.id)) return
        if (rel.id === focusFigure.id) return  // 反向边不重复
        if (oneDegreeIds.has(rel.id)) {
          // 1 度之间的关系（保留，但 degree 仍为 1）
          oneDegreeLinks.push({ source: id, target: rel.id, type: rel.type })
          return
        }
        if (twoDegreeIds.has(rel.id)) return
        twoDegreeIds.add(rel.id)
        twoDegreeLinks.push({ source: id, target: rel.id, type: rel.type })
      })
    })

    // 组装节点
    const allIds = new Set([focusFigure.id, ...oneDegreeIds, ...twoDegreeIds])
    const graphNodes: GraphNode[] = []
    allIds.forEach(id => {
      const fig = byId.get(id)
      if (!fig) return
      graphNodes.push({
        id: fig.id,
        figure: fig,
        isFocus: id === focusFigure.id,
        degree: id === focusFigure.id ? 0 : (oneDegreeIds.has(id) ? 1 : 2),
      })
    })

    return { nodes: graphNodes, links: [...oneDegreeLinks, ...twoDegreeLinks] }
  }, [focusFigure])

  // d3-force 模拟
  const simulationRef = useRef<ReturnType<typeof forceSimulation<GraphNode>> | null>(null)

  useEffect(() => {
    if (nodes.length === 0) return

    const sim = forceSimulation<GraphNode>(nodes)
      .force('link', forceLink<GraphNode, GraphLink>(links)
        .id(d => d.id)
        .distance(d => RELATION_STYLE[d.type as RelationType]?.distance ?? 100)
        .strength(d => RELATION_STYLE[d.type as RelationType]?.strength ?? 0.3)
      )
      .force('charge', forceManyBody().strength(-450))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide<GraphNode>().radius(NODE_RADIUS + 6))
      .on('tick', () => {
        const positions: Record<string, { x: number; y: number }> = {}
        nodes.forEach(n => {
          if (n.x !== undefined && n.y !== undefined) {
            positions[n.id] = { x: n.x, y: n.y }
          }
        })
        setNodePositions(positions)
      })

    // 焦点固定在中心
    const focusNode = nodes.find(n => n.isFocus)
    if (focusNode) {
      focusNode.fx = width / 2
      focusNode.fy = height / 2
    }

    // 预跑 200 tick 让初始位置稳定
    for (let i = 0; i < 200; i++) sim.tick()
    const initialPositions: Record<string, { x: number; y: number }> = {}
    nodes.forEach(n => {
      if (n.x !== undefined && n.y !== undefined) {
        initialPositions[n.id] = { x: n.x, y: n.y }
      }
    })
    setNodePositions(initialPositions)

    simulationRef.current = sim
    return () => { sim.stop() }
  }, [nodes, links, width, height])

  // 容器尺寸
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect
      if (rect) {
        setWidth(rect.width)
        setHeight(rect.height)
        if (simulationRef.current) {
          simulationRef.current.force('center', forceCenter(rect.width / 2, rect.height / 2))
          // 重新固定焦点到中心
          const focusNode = nodes.find(n => n.isFocus)
          if (focusNode) {
            focusNode.fx = rect.width / 2
            focusNode.fy = rect.height / 2
          }
          simulationRef.current.alpha(0.3).restart()
        }
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [nodes])

  // 节点拖拽
  const handleMouseDown = useCallback((node: GraphNode, e: React.MouseEvent) => {
    e.stopPropagation()
    setDraggingNodeId(node.id)
    dragHasMovedRef.current = false
    if (simulationRef.current) {
      // 焦点节点保持固定；其他节点临时固定
      node.fx = node.x
      node.fy = node.y
      simulationRef.current.alphaTarget(0.3).restart()
    }
  }, [])

  const handleMouseUp = useCallback((node: GraphNode, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!dragHasMovedRef.current) {
      // 是点击 — 切换焦点（不能切到焦点自己）
      if (!node.isFocus && onSwitchFocus) {
        onSwitchFocus(node.id)
      }
    }
    if (simulationRef.current) {
      // 释放非焦点节点的固定
      if (!node.isFocus) {
        node.fx = null
        node.fy = null
      }
      simulationRef.current.alphaTarget(0)
    }
    setDraggingNodeId(null)
  }, [onSwitchFocus])

  useEffect(() => {
    if (!draggingNodeId) return
    const handleMove = (e: MouseEvent) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      // 转换到 SVG 坐标系（考虑 viewTransform）
      const x = (e.clientX - rect.left - viewTransform.x) / viewTransform.k
      const y = (e.clientY - rect.top - viewTransform.y) / viewTransform.k
      const node = nodes.find(n => n.id === draggingNodeId)
      if (node) {
        const prev = nodePositions[draggingNodeId]
        if (prev) {
          const dx = x - prev.x
          const dy = y - prev.y
          if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragHasMovedRef.current = true
        }
        // 焦点节点 fx/fy 已被固定在中心，不通过拖动改变
        if (!node.isFocus) {
          node.fx = x
          node.fy = y
        }
      }
    }
    const handleUp = () => setDraggingNodeId(null)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [draggingNodeId, nodes, nodePositions, viewTransform])

  // 滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    setViewTransform(prev => {
      const newK = Math.max(0.3, Math.min(2.5, prev.k * factor))
      // 让缩放围绕鼠标位置
      const dx = mouseX - (mouseX - prev.x) * (newK / prev.k)
      const dy = mouseY - (mouseY - prev.y) * (newK / prev.k)
      return { x: dx, y: dy, k: newK }
    })
  }, [])

  // 拖动空白平移视图
  const panningRef = useRef<{ x: number; y: number } | null>(null)
  const handleBackgroundMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return
    panningRef.current = { x: e.clientX - viewTransform.x, y: e.clientY - viewTransform.y }
  }, [viewTransform])
  useEffect(() => {
    if (!panningRef.current) return
    const handleMove = (e: MouseEvent) => {
      if (!panningRef.current) return
      setViewTransform(prev => ({
        ...prev,
        x: e.clientX - panningRef.current!.x,
        y: e.clientY - panningRef.current!.y,
      }))
    }
    const handleUp = () => { panningRef.current = null }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [panningRef.current])

  // ESC 关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [onClose])

  if (!focusFigure) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/85 backdrop-blur p-4">
        <div className="text-parchment-50">未找到该人物</div>
      </div>
    )
  }

  // 统计各关系类型数量（图例用）
  const typeCounts: Record<RelationType, number> = {
    mentor: 0, rival: 0, successor: 0, contemporary: 0, family: 0,
  }
  links.forEach(l => { typeCounts[l.type] = (typeCounts[l.type] ?? 0) + 1 })

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/90 backdrop-blur p-4"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl h-[90vh] overflow-hidden bg-ink-800 rounded-lg border border-purple-500/40 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-ink-800/95 backdrop-blur border-b border-ink-600 px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif text-purple-300 flex items-center gap-2">
              🕸️ 人物关系网
              <span className="text-sm text-parchment-50 font-serif">· {focusFigure.name}</span>
            </h2>
            <div className="text-[10px] text-ink-500 mt-0.5">
              中心人物 + {nodes.length - 1} 位相关人物 · {links.length} 条关系 ·
              拖动节点 / 滚轮缩放 / 点击空白平移 / 点击其他人物切换焦点
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-ink-700"
            title="关闭 (ESC)"
          >
            ×
          </button>
        </div>

        {/* 图例（左下） */}
        <div className="absolute bottom-3 left-3 z-20 bg-ink-800/90 backdrop-blur border border-ink-600 rounded px-3 py-2 text-[10px] space-y-1">
          <div className="text-ink-500 uppercase tracking-wider mb-1">关系类型</div>
          {(Object.keys(RELATION_STYLE) as RelationType[]).map(t => (
            <div key={t} className="flex items-center gap-2 text-parchment-50">
              <svg width="20" height="6">
                <line x1="0" y1="3" x2="20" y2="3"
                  stroke={RELATION_STYLE[t].color}
                  strokeWidth="2"
                  strokeDasharray={RELATION_STYLE[t].dash} />
              </svg>
              <span>{RELATION_STYLE[t].label}</span>
              <span className="text-ink-500">({typeCounts[t]})</span>
            </div>
          ))}
        </div>

        {/* 缩放控制（右下） */}
        <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1 bg-ink-800/90 backdrop-blur border border-ink-600 rounded">
          <button
            onClick={() => setViewTransform(t => ({ ...t, k: Math.min(2.5, t.k * 1.2) }))}
            className="w-8 h-8 text-parchment-50 hover:bg-ink-700 rounded-t"
            title="放大"
          >+</button>
          <button
            onClick={() => setViewTransform(t => ({ ...t, k: Math.max(0.3, t.k * 0.8) }))}
            className="w-8 h-8 text-parchment-50 hover:bg-ink-700"
            title="缩小"
          >−</button>
          <button
            onClick={() => setViewTransform({ x: 0, y: 0, k: 1 })}
            className="w-8 h-8 text-xs text-ink-400 hover:text-parchment-50 hover:bg-ink-700 rounded-b"
            title="重置视图"
          >⛶</button>
        </div>

        {/* SVG 图 */}
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleBackgroundMouseDown}
        >
          <g transform={`translate(${viewTransform.x},${viewTransform.y}) scale(${viewTransform.k})`}>
            {/* 边 */}
            {links.map((link, i) => {
              const sId = typeof link.source === 'string' ? link.source : link.source.id
              const tId = typeof link.target === 'string' ? link.target : link.target.id
              const s = nodePositions[sId]
              const t = nodePositions[tId]
              if (!s || !t) return null
              const style = RELATION_STYLE[link.type]
              const isHighlighted = hoveredNodeId === sId || hoveredNodeId === tId
              return (
                <line
                  key={i}
                  x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke={style.color}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeOpacity={isHighlighted ? 0.9 : 0.55}
                  strokeDasharray={style.dash}
                />
              )
            })}

            {/* 节点 */}
            {nodes.map(node => {
              const pos = nodePositions[node.id]
              if (!pos) return null
              const isHovered = hoveredNodeId === node.id
              const r = node.isFocus ? 46 : (node.degree === 1 ? 32 : 24)
              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x},${pos.y})`}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onMouseDown={(e) => handleMouseDown(node, e)}
                  onMouseUp={(e) => handleMouseUp(node, e)}
                >
                  {/* 中心焦点光晕 */}
                  {node.isFocus && (
                    <circle r={r + 12} fill="#c89a5b" opacity={0.15} />
                  )}
                  {/* 节点圆 */}
                  <circle
                    r={r}
                    fill={node.isFocus ? '#c89a5b' : (node.degree === 1 ? '#3a3a4a' : '#2a2a3a')}
                    stroke={node.isFocus ? '#ffd47a' : (isHovered ? '#9b7eb6' : '#5a5a6a')}
                    strokeWidth={node.isFocus ? 3 : (isHovered ? 2 : 1.5)}
                  />
                  {/* emoji */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={node.isFocus ? 28 : (node.degree === 1 ? 20 : 16)}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {node.figure.emoji || '👤'}
                  </text>
                  {/* 名字 */}
                  <text
                    y={r + 14}
                    textAnchor="middle"
                    fontSize={node.isFocus ? 14 : 11}
                    fill={node.isFocus ? '#ffd47a' : (node.degree === 1 ? '#e8d5a0' : '#a0a0a0')}
                    style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'serif' }}
                  >
                    {node.figure.name}
                  </text>
                  {/* 1 度边类型标签（仅显示与 focus 节点的边） */}
                  {node.degree === 1 && (() => {
                    const linkToFocus = links.find(l => {
                      const sId = typeof l.source === 'string' ? l.source : l.source.id
                      const tId = typeof l.target === 'string' ? l.target : l.target.id
                      return (sId === focusFigure.id && tId === node.id) ||
                             (tId === focusFigure.id && sId === node.id)
                    })
                    if (!linkToFocus) return null
                    const style = RELATION_STYLE[linkToFocus.type]
                    return (
                      <text
                        y={r + 26}
                        textAnchor="middle"
                        fontSize={9}
                        fill={style.color}
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {style.label}
                      </text>
                    )
                  })()}
                </g>
              )
            })}
          </g>
        </svg>

        {/* hover 信息卡 */}
        {hoveredNodeId && hoveredNodeId !== focusFigure.id && (() => {
          const fig = people.find(p => p.id === hoveredNodeId)
          if (!fig) return null
          return (
            <div className="absolute top-20 right-3 z-20 max-w-xs bg-ink-800/95 backdrop-blur border border-purple-500/40 rounded-lg p-3 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{fig.emoji || '👤'}</span>
                <div>
                  <div className="text-sm font-serif text-purple-300">{fig.name}</div>
                  <div className="text-[10px] text-ink-400">{fig.role}</div>
                </div>
              </div>
              <div className="text-[10px] text-ink-500 italic">点击切换为焦点</div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
