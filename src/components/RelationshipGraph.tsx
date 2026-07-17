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
import { useHistoryStore } from '@/store/useHistoryStore'
import { generateRelationships, RELATIONSHIP_STYLES, type Relationship } from '@/data/relationships'
import peopleData from '@/data/people.json'
import type { Era, HistoricalFigure } from '@/types'
import erasData from '@/data/eras.json'

const eras = erasData as Era[]
const people = peopleData as HistoricalFigure[]

type NodeKind = 'era' | 'person'

// 节点扩展类型
interface GraphNode extends SimulationNodeDatum {
  id: string
  kind: NodeKind
  era?: Era
  figure?: HistoricalFigure
  emoji?: string
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  relationship: Relationship
  source: string | GraphNode
  target: string | GraphNode
}

const WIDTH = 1200
const HEIGHT = 700

interface Props {
  onClose?: () => void
}

/**
 * 关系图谱：用 d3-force 实现朝代/文明之间的力导向图
 *
 * 节点 = 朝代/文明
 * 边 = 关系（时间先后、同时期、继承、转型）
 */
export default function RelationshipGraph({ onClose }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(WIDTH)
  const [height, setHeight] = useState(HEIGHT)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [highlightedRelationType, setHighlightedRelationType] = useState<string | null>(null)
  // 节点位置用 React state 控制（避免 d3 mutable node 引用问题）
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({})
  // 是否显示人物层
  const [showPeople, setShowPeople] = useState(false)

  const { currentYear, setYear, selectEra } = useHistoryStore()

  // 节点和边数据
  const { nodes, links } = useMemo(() => {
    const relationships = generateRelationships()

    const graphNodes: GraphNode[] = eras.map(era => ({
      id: era.id,
      kind: 'era',
      era,
    }))

    // 先声明 graphLinks 避免 TDZ
    const graphLinks: GraphLink[] = relationships.map(rel => ({
      source: rel.source,
      target: rel.target,
      relationship: rel,
    }))

    // 添加人物节点（按 showPeople 控制）
    if (showPeople) {
      people.forEach(p => {
        graphNodes.push({
          id: p.id,
          kind: 'person',
          figure: p,
          emoji: p.emoji,
        })
      })
      // 添加人物-朝代边（person-of）
      people.forEach(p => {
        p.eraIds.forEach(eid => {
          if (eras.find(e => e.id === eid)) {
            graphLinks.push({
              source: p.id,
              target: eid,
              relationship: { source: p.id, target: eid, type: 'contemporary', label: `${p.name} (人物)` },
            })
          }
        })
        // 人物-人物关系（relatedFigureIds）
        if (p.relatedFigureIds) {
          p.relatedFigureIds.forEach(rel => {
            graphLinks.push({
              source: p.id,
              target: rel.id,
              relationship: { source: p.id, target: rel.id, type: rel.type === 'rival' ? 'transformation' : 'contemporary', label: rel.type },
            })
          })
        }
      })
    }

    return { nodes: graphNodes, links: graphLinks }
  }, [showPeople])

  // d3-force simulation

  // d3-force simulation（只用于物理计算，不再用 d3 节点引用）
  const simulationRef = useRef<ReturnType<typeof forceSimulation<GraphNode>> | null>(null)

  useEffect(() => {
    const sim = forceSimulation<GraphNode>(nodes)
      .force('link', forceLink<GraphNode, GraphLink>(links)
        .id(d => d.id)
        .distance(d => {
          if (d.relationship.type === 'succession' || d.relationship.type === 'transformation') return 80
          if (d.relationship.type === 'contemporary') return 120
          return 90
        })
        .strength(d => {
          if (d.relationship.type === 'succession' || d.relationship.type === 'transformation') return 0.6
          if (d.relationship.type === 'contemporary') return 0.2
          return 0.4
        })
      )
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide<GraphNode>().radius(40))
      .on('tick', () => {
        // 同步节点位置到 React state
        const positions: Record<string, { x: number; y: number }> = {}
        nodes.forEach(n => {
          if (n.x !== undefined && n.y !== undefined) {
            positions[n.id] = { x: n.x, y: n.y }
          }
        })
        setNodePositions(positions)
      })

    // 同步运行 200 次 tick 计算初始位置（避免初始节点位置为 (0, 0)）
    for (let i = 0; i < 200; i++) {
      sim.tick()
    }
    // 立即写入初始位置到 React state
    const initialPositions: Record<string, { x: number; y: number }> = {}
    nodes.forEach(n => {
      if (n.x !== undefined && n.y !== undefined) {
        initialPositions[n.id] = { x: n.x, y: n.y }
      }
    })
    setNodePositions(initialPositions)

    simulationRef.current = sim
    return () => {
      sim.stop()
    }
  }, [nodes, links, width, height])

  // 监听容器尺寸
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect
      if (rect) {
        setWidth(rect.width)
        setHeight(rect.height)
        if (simulationRef.current) {
          simulationRef.current.force('center', forceCenter(rect.width / 2, rect.height / 2))
          simulationRef.current.alpha(0.3).restart()
        }
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // 节点拖拽（让 simulation 继续运行，fx/fy 固定拖动节点，其他节点跟随）
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const dragHasMovedRef = useRef(false)

  const handleMouseDown = useCallback((node: GraphNode, e: React.MouseEvent) => {
    e.stopPropagation()
    setDraggingNodeId(node.id)
    dragHasMovedRef.current = false
    // 重启 simulation，让其他节点响应拖动
    if (simulationRef.current) {
      // 用 fx/fy 固定该节点（d3-force 会保持它不漂移）
      node.fx = node.x
      node.fy = node.y
      // 重新激活 simulation，让其他节点自然调整
      simulationRef.current.alphaTarget(0.3).restart()
    }
  }, [])

  const handleMouseUp = useCallback((node: GraphNode, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!dragHasMovedRef.current) {
      // 是点击，触发选择
      selectEra(node.era.id)
      setYear(Math.round((node.era.startYear + node.era.endYear) / 2))
    }
    // 取消固定，让 simulation 自然冷却
    if (simulationRef.current) {
      const draggedNode = nodes.find(n => n.id === draggingNodeId)
      if (draggedNode) {
        draggedNode.fx = null
        draggedNode.fy = null
      }
      simulationRef.current.alphaTarget(0)
    }
    setDraggingNodeId(null)
  }, [draggingNodeId, nodes, selectEra, setYear])

  useEffect(() => {
    if (!draggingNodeId) return

    const handleMove = (e: MouseEvent) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // 检查是否真的移动了（避免误判点击为拖拽）
      const node = nodes.find(n => n.id === draggingNodeId)
      const prevPos = nodePositions[draggingNodeId]
      if (node && prevPos) {
        const dx = x - prevPos.x
        const dy = y - prevPos.y
        if (Math.sqrt(dx * dx + dy * dy) > 3) {
          dragHasMovedRef.current = true
        }
      }

      // 用 fx/fy 固定拖动节点，simulation 会保持其他节点与它的拓扑关系
      if (node) {
        node.fx = x
        node.fy = y
      }
      // 触发 tick 重新计算（让其他节点跟随）
      if (simulationRef.current) {
        simulationRef.current.alpha(0.3).restart()
      }
    }

    const handleUp = () => {
      // mouseUp 在节点上时由 handleMouseUp 处理；这里处理空白处的 mouseup
      const node = nodes.find(n => n.id === draggingNodeId)
      if (node) {
        node.fx = null
        node.fy = null
      }
      if (simulationRef.current) {
        simulationRef.current.alphaTarget(0)
      }
      setDraggingNodeId(null)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [draggingNodeId, nodes, nodePositions])

  // 检查节点在当前年份是否活跃
  const isActive = (era: Era) => currentYear >= era.startYear && currentYear <= era.endYear

  // 判断节点是否被高亮关系过滤（用于决定未匹配节点的暗度）
  const isNodeDimmedByFilter = (nodeId: string) => {
    if (!highlightedRelationType) return false
    return !links.some(l => {
      const sid = typeof l.source === 'object' ? l.source.id : l.source
      const tid = typeof l.target === 'object' ? l.target.id : l.target
      return l.relationship.type === highlightedRelationType &&
        (sid === nodeId || tid === nodeId)
    })
  }

  // 节点悬浮时高亮相关边
  const isLinkHighlighted = (link: GraphLink) => {
    if (hoveredNodeId) {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source
      const targetId = typeof link.target === 'object' ? link.target.id : link.target
      return sourceId === hoveredNodeId || targetId === hoveredNodeId
    }
    if (highlightedRelationType) {
      return link.relationship.type === highlightedRelationType
    }
    return false
  }

  // 关系类型统计
  const relationTypeStats = useMemo(() => {
    const stats: Record<string, number> = {}
    links.forEach(l => {
      const t = l.relationship.type
      stats[t] = (stats[t] ?? 0) + 1
    })
    return stats
  }, [links])

  return (
    <div ref={containerRef} className="w-full h-full bg-ink-900 relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block"
        onClick={() => setHighlightedRelationType(null)}
      >
        {/* 透明背景矩形：捕获 SVG 空白点击事件（先于子元素触发） */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          style={{ pointerEvents: 'all' }}
          onClick={() => setHighlightedRelationType(null)}
        />
        {/* 边 */}
        {links.map((link, i) => {
          const source = link.source as GraphNode
          const target = link.target as GraphNode
          if (source.x === undefined || target.x === undefined) return null
          const style = RELATIONSHIP_STYLES[link.relationship.type]
          const highlighted = isLinkHighlighted(link)

          // 同时期边透明度低
          const baseOpacity = link.relationship.type === 'contemporary' ? 0.35 : 0.7
          const opacity = highlighted ? 0.95 : baseOpacity

          // 边标签
          const labelX = ((source.x ?? 0) + (target.x ?? 0)) / 2
          const labelY = ((source.y ?? 0) + (target.y ?? 0)) / 2

          return (
            <g key={i} style={{ opacity }}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={style.color}
                strokeWidth={highlighted ? style.width + 0.5 : style.width}
                strokeDasharray={style.dashArray}
              />
              {link.relationship.label && highlighted && (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="9"
                  fill={style.color}
                  className="pointer-events-none"
                  style={{ paintOrder: 'stroke', stroke: '#0f0e0c', strokeWidth: 2 }}
                >
                  {link.relationship.label}
                </text>
              )}
            </g>
          )
        })}

        {/* 节点 */}
        {nodes.map(node => {
          if (node.x === undefined) return null
          // 人物节点：小圆 + emoji
          if (node.kind === 'person') {
            return (
              <g
                key={node.id}
                transform={`translate(${nodePositions[node.id]?.x ?? node.x ?? 0}, ${nodePositions[node.id]?.y ?? node.y ?? 0})`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                <title>{`${node.figure?.name} (${node.figure?.role})`}</title>
                <circle
                  r={hoveredNodeId === node.id ? 14 : 11}
                  fill={node.figure?.eraIds[0] ? '#a08050' : '#888'}
                  stroke="#fdf8f0"
                  strokeWidth={1.5}
                  opacity={0.9}
                />
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fontSize={14}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.emoji || '👤'}
                </text>
                {hoveredNodeId === node.id && (
                  <text
                    textAnchor="middle"
                    y={-18}
                    fontSize={9}
                    fill="#c89a5b"
                    style={{ pointerEvents: 'none', userSelect: 'none', paintOrder: 'stroke', stroke: '#0f0e0c', strokeWidth: 2.5 }}
                  >
                    {node.figure?.name}
                  </text>
                )}
              </g>
            )
          }
          // 朝代节点（原有逻辑）
          const active = isActive(node.era)
          const hovered = hoveredNodeId === node.id
          const r = active ? 22 : hovered ? 20 : 16

          return (
            <g
              key={node.id}
              transform={`translate(${nodePositions[node.id]?.x ?? node.x ?? 0}, ${nodePositions[node.id]?.y ?? node.y ?? 0})`}
              style={{ cursor: draggingNodeId === node.id ? 'grabbing' : 'grab' }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              {/* 透明 hit area：同时绑定 mousedown/mouseup */}
              <circle
                r={r + 6}
                fill="transparent"
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  handleMouseDown(node, e)
                }}
                onMouseUp={(e) => {
                  e.stopPropagation()
                  handleMouseUp(node, e)
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  // 点击节点：触发选择（如果没拖动过）
                  if (!dragHasMovedRef.current) {
                    selectEra(node.era.id)
                    setYear(Math.round((node.era.startYear + node.era.endYear) / 2))
                  }
                }}
              />

              {/* 活跃朝代外圈光晕 */}
              {active && (
                <circle
                  r={r + 8}
                  fill={node.era.color}
                  opacity={0.15}
                  style={{ pointerEvents: 'none' }}
                />
              )}

              {/* 节点圆圈：基础不透明度更高，过滤未匹配时才变暗 */}
              {(() => {
                const dimmed = isNodeDimmedByFilter(node.id)
                const baseOpacity = active ? 0.9 : 0.75
                const finalOpacity = dimmed ? 0.25 : baseOpacity
                return (
                  <circle
                    r={r}
                    fill={node.era.color}
                    fillOpacity={finalOpacity}
                    stroke={active || hovered ? '#fdf8f0' : dimmed ? node.era.color : node.era.color}
                    strokeOpacity={dimmed ? 0.3 : 1}
                    strokeWidth={active ? 2 : hovered ? 1.5 : 1}
                    style={{ pointerEvents: 'none' }}
                  />
                )
              })()}

              {/* 朝代名称 */}
              {(() => {
                const dimmed = isNodeDimmedByFilter(node.id)
                return (
                  <text
                    textAnchor="middle"
                    y={r + 14}
                    fontSize="11"
                    fill={active ? '#fdf8f0' : dimmed ? '#5a5142' : '#a8a094'}
                    fontWeight={active ? 'bold' : 'normal'}
                    opacity={dimmed ? 0.4 : 1}
                    className="pointer-events-none"
                  >
                    {node.era.name}
                  </text>
                )
              })()}

              {/* 年份范围 */}
              {(() => {
                const dimmed = isNodeDimmedByFilter(node.id)
                return (
                  <text
                    textAnchor="middle"
                    y={r + 26}
                    fontSize="8"
                    fill="#5a5142"
                    opacity={dimmed ? 0.3 : 0.7}
                    className="pointer-events-none"
                  >
                    {node.era.startYear < 0 ? '前' + Math.abs(node.era.startYear) : node.era.startYear}
                    {' ~ '}
                    {node.era.endYear < 0 ? '前' + Math.abs(node.era.endYear) : node.era.endYear}
                  </text>
                )
              })()}
            </g>
          )
        })}
      </svg>

      {/* 显示人物 toggle */}
      <div className="absolute top-4 left-4 px-3 py-2 rounded bg-ink-800/95 backdrop-blur border border-ink-600 text-xs z-10 shadow-lg">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPeople}
            onChange={(e) => setShowPeople(e.target.checked)}
            className="w-3.5 h-3.5 accent-purple-500"
          />
          <span className="text-parchment-100">显示人物层</span>
          <span className="text-ink-500">({people.length} 人)</span>
        </label>
      </div>

      {/* 图例：关系类型 */}
      <div className="absolute top-16 left-4 px-3 py-2 rounded bg-ink-800/95 backdrop-blur border border-ink-600 text-xs z-10 shadow-lg">
        <div className="text-ink-500 mb-1.5">关系类型（点击高亮）</div>
        <div className="space-y-1">
          {Object.entries(RELATIONSHIP_STYLES).map(([type, style]) => {
            const active = highlightedRelationType === type
            const count = relationTypeStats[type] ?? 0
            return (
              <button
                key={type}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 transition-colors ${
                  active ? 'bg-ink-700' : 'hover:bg-ink-700/50'
                }`}
                onClick={() => setHighlightedRelationType(active ? null : type)}
              >
                <svg width="20" height="6">
                  <line
                    x1="0" y1="3" x2="20" y2="3"
                    stroke={style.color}
                    strokeWidth={style.width + 0.5}
                    strokeDasharray={style.dashArray}
                  />
                </svg>
                <span className="flex-1 text-[10px]">{style.label}</span>
                <span className="text-[10px] text-ink-500">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="absolute top-4 right-4 px-3 py-2 rounded bg-ink-800/95 backdrop-blur border border-ink-600 text-xs z-10 shadow-lg">
        <div className="text-ink-500 mb-1">图谱统计</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <span>节点：</span><span className="text-bronze-400 tabular-nums">{nodes.length}</span>
          <span>关系：</span><span className="text-bronze-400 tabular-nums">{links.length}</span>
          <span>活跃：</span>
          <span className="text-bronze-400 tabular-nums">
            {nodes.filter(n => isActive(n.era)).length}
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-ink-700 text-[10px] text-ink-500">
          当前：{currentYear < 0 ? '前' + Math.abs(currentYear) : currentYear} 年
        </div>
      </div>

      {/* 操作提示 */}
      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded bg-ink-800/90 backdrop-blur border border-ink-600 text-[10px] text-ink-500 z-10">
        拖动节点调整位置 · 点击查看朝代详情 · 拖动空白平移整个图谱
      </div>
    </div>
  )
}