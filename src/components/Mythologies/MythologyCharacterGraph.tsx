/**
 * MythologyCharacterGraph — 角色网络力导向图（d3-force + d3-zoom）
 *
 * 节点 = 神话角色
 * 边 = 关系（parent / spouse / sibling / ally / enemy / created / mentor）
 * 颜色 = 所属文明
 *
 * 交互：
 *  - 滚轮缩放（0.3x ~ 3x）+ 拖动背景平移（d3-zoom）
 *  - 拖动节点（设 fx/fy 临时固定位置，松手后释放）
 *  - hover/点击节点 → 右侧详情面板
 *  - 边上直接显示关系描述文字（如"夫妻""、"战神与花神"）
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
} from 'd3-force'
import { select } from 'd3-selection'
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom'
import {
  MYTH_CHARACTERS,
  RELATIONSHIPS,
  type MythCharacter,
} from '@/data/myth-characters'
import {
  MYTHOLOGIES,
  CIVILIZATIONS,
  type Civilization,
} from '@/data/mythologies'

const WIDTH = 1100
const HEIGHT = 640

type RelType = 'parent' | 'spouse' | 'sibling' | 'ally' | 'enemy' | 'created' | 'mentor'

interface Node extends SimulationNodeDatum {
  id: string
  char: MythCharacter
  civilization: Civilization
}
interface GraphLink {
  source: string | Node
  target: string | Node
  type: RelType
  label?: string
}

const REL_COLOR: Record<RelType, string> = {
  parent: '#c89a5b',     // bronze
  spouse: '#e879b9',     // pink
  sibling: '#5b9bc8',    // blue
  ally: '#9bc89a',       // green
  enemy: '#b85450',      // red
  created: '#d4a85b',    // gold
  mentor: '#9b7eb6',     // purple
}

const REL_LABEL: Record<RelType, string> = {
  parent: '父母',
  spouse: '配偶',
  sibling: '兄弟姐妹',
  ally: '盟友',
  enemy: '敌对',
  created: '创造/化生',
  mentor: '师徒',
}

interface Props {
  /** 限定显示哪几个文明的角色（null = 显示全部） */
  selectedCivilization?: Set<Civilization> | null
  /** 从"查看图谱"按钮跳过来时，聚焦该角色 */
  focusCharId?: string | null
  /** 当焦点已应用（选中节点 + 滚到视图中心）后回调 */
  onCharacterFocused?: () => void
}

export default function MythologyCharacterGraph({ selectedCivilization, focusCharId, onCharacterFocused }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const gRef = useRef<SVGGElement | null>(null)
  const [, setTick] = useState(0)
  const simRef = useRef<ReturnType<typeof forceSimulation<Node>> | null>(null)
  const nodesRef = useRef<Node[]>([])
  const linksRef = useRef<GraphLink[]>([])
  const [transformStr, setTransformStr] = useState('')
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const focusAppliedRef = useRef(false)

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null)
  // 防止拖动后误触发 click
  const dragMovedRef = useRef(false)

  // 过滤角色 + 关系
  const { nodes, links } = useMemo(() => {
    const civFilter = selectedCivilization
    const activeChars = MYTH_CHARACTERS.filter(c =>
      !civFilter || civFilter.has(c.civilization),
    )
    const activeIds = new Set(activeChars.map(c => c.id))
    const rels = RELATIONSHIPS.filter(r =>
      activeIds.has(r.source) && activeIds.has(r.target),
    )
    const nodes: Node[] = activeChars.map(c => ({
      id: c.id,
      char: c,
      civilization: c.civilization,
    }))
    const links: GraphLink[] = rels.map(r => ({
      source: r.source,
      target: r.target,
      type: r.type as RelType,
      label: r.label,
    }))
    return { nodes, links }
  }, [selectedCivilization])

  // 用 MYTH_CHARACTERS 自身做 id→character 查找（不用 Node 对象，避免运行时类型混乱）
  const charById = useMemo(
    () => new Map(MYTH_CHARACTERS.map(c => [c.id, c])),
    [],
  )

  // 把当前 nodes/links 同步到 ref（力导向模拟用 ref 持有）
  useEffect(() => {
    nodesRef.current = nodes
    linksRef.current = links
    focusAppliedRef.current = false
  }, [nodes, links])

  // 力导向模拟（render 必须从 simNodesRef.current 读，因为 d3-force 在 tick 时
//   会原地修改 initialNodes 的 x/y/vx/vy；React state 的 shallow copy 永远没位置）
const simNodesRef = useRef<Node[]>([])
const simLinksRef = useRef<GraphLink[]>([])

  // 力导向模拟
  useEffect(() => {
    if (nodes.length === 0) {
      simRef.current?.stop()
      simRef.current = null
      return
    }
    // 初始节点带"种子位置"避免一开始全堆 (0,0)
    const initialNodes: Node[] = nodes.map((n, i) => {
      const angle = (i / Math.max(1, nodes.length)) * Math.PI * 2
      const radius = Math.min(WIDTH, HEIGHT) * 0.35
      return {
        ...n,
        x: WIDTH / 2 + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5),
        y: HEIGHT / 2 + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5),
      }
    })
    const initialLinks: GraphLink[] = links.map(l => ({ ...l }))
    simNodesRef.current = initialNodes
    simLinksRef.current = initialLinks
    nodesRef.current = initialNodes
    linksRef.current = initialLinks

    const sim = forceSimulation<Node>(initialNodes)
      .force('link', forceLink<Node, GraphLink>(initialLinks).id(d => d.id).distance(d => {
        // 不同关系用不同距离：家族近、敌对远
        const t = (d as GraphLink).type
        if (t === 'parent' || t === 'spouse' || t === 'sibling') return 70
        if (t === 'enemy') return 140
        return 95
      }).strength(0.4))
      .force('charge', forceManyBody<Node>().strength(-200))
      .force('center', forceCenter<Node>(WIDTH / 2, HEIGHT / 2))
      .force('collide', forceCollide<Node>(34))
      .alpha(1)
      .alphaDecay(0.022)
      .velocityDecay(0.4)
    sim.on('tick', () => setTick(t => t + 1))
    simRef.current = sim
    return () => { sim.stop() }
  }, [nodes, links])

  // d3-zoom 绑定（缩放 + 背景拖动平移）
  useEffect(() => {
    if (!svgRef.current) return
    const svgSel = select(svgRef.current)
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .filter((event: any) => {
        // 滚轮始终允许；鼠标拖动只在背景（非已拖起节点）上时允许
        if (event.type === 'wheel') return true
        // 鼠标按下时检查 target：节点本身不让 zoom 处理（让节点 drag 处理）
        if (event.type === 'mousedown' || event.type === 'pointerdown') {
          const target = event.target as Element
          if (target?.getAttribute && target.getAttribute('data-node')) {
            return false
          }
        }
        return !event.button
      })
      .on('zoom', (event) => {
        setTransformStr(event.transform.toString())
      })
    svgSel.call(z)
    zoomBehaviorRef.current = z
    return () => { svgSel.on('.zoom', null) }
  }, [])

  // 应用 focusCharId（从"查看角色图谱"跳转来时）
  useEffect(() => {
    if (!focusCharId || focusAppliedRef.current) return
    const node = nodesRef.current.find(n => n.id === focusCharId)
    if (!node) return
    setSelectedCharId(focusCharId)
    // 平移到节点中心 + 适度的缩放
    const z = zoomBehaviorRef.current
    const svg = svgRef.current
    if (z && svg && node.x != null && node.y != null) {
      const k = 1.4
      const tx = WIDTH / 2 - node.x * k
      const ty = HEIGHT / 2 - node.y * k
      select(svg).call(
        z.transform,
        zoomIdentity.translate(tx, ty).scale(k),
      )
    }
    focusAppliedRef.current = true
    onCharacterFocused?.()
  }, [focusCharId, onCharacterFocused])

  // hover 时高亮（用 simLinksRef，因为 d3-force 把 source/target 替换成 Node 引用）
  const neighborIds = useMemo(() => {
    if (!hoveredId) return new Set<string>()
    const set = new Set<string>([hoveredId])
    for (const l of simLinksRef.current) {
      const s = typeof l.source === 'string' ? l.source : (l.source as Node).id
      const t = typeof l.target === 'string' ? l.target : (l.target as Node).id
      if (s === hoveredId) set.add(t)
      if (t === hoveredId) set.add(s)
    }
    return set
  }, [hoveredId])

  const selectedChar = selectedCharId ? MYTH_CHARACTERS.find(c => c.id === selectedCharId) ?? null : null

  if (nodes.length === 0) {
    return (
      <div className="rounded-xl border border-ink-700 bg-ink-800/60 p-8 text-center text-ink-300">
        当前筛选下没有角色节点。请调整文明筛选或返回列表。
      </div>
    )
  }

  // 拖动节点：mousedown 捕获、move 时更新 fx/fy、release 时解除
  function handleNodeMouseDown(e: React.MouseEvent, d: Node) {
    e.stopPropagation()
    // 阻止 zoom 行为（已在 filter 中阻止，但双保险）
    e.preventDefault()
    const svg = svgRef.current
    if (!svg || d.x == null || d.y == null) return
    const sim = simRef.current
    sim?.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
    dragMovedRef.current = false
    const startX = e.clientX
    const startY = e.clientY

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (Math.abs(dx) + Math.abs(dy) > 2) dragMovedRef.current = true
      const pt = svg.createSVGPoint()
      pt.x = ev.clientX
      pt.y = ev.clientY
      const ctm = svg.getScreenCTM()
      if (!ctm) return
      const local = pt.matrixTransform(ctm.inverse())
      d.fx = local.x
      d.fy = local.y
      setTick(t => t + 1)
    }
    const onUp = () => {
      d.fx = null
      d.fy = null
      sim?.alphaTarget(0)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      // 触发重渲染（释放后等下一帧 tick 会更新位置）
      setTimeout(() => setTick(t => t + 1), 0)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  function handleNodeClick(d: Node) {
    if (dragMovedRef.current) return
    setSelectedCharId(prev => prev === d.id ? null : d.id)
  }

  // 边的描述文字：优先用 label，否则用关系类型中文名
  function edgeLabel(l: GraphLink): string {
    return l.label ?? REL_LABEL[l.type]
  }

  // 重置缩放
  function resetZoom() {
    const z = zoomBehaviorRef.current
    const svg = svgRef.current
    if (z && svg) {
      select(svg).call(z.transform, zoomIdentity)
    }
  }

  // 渲染节点（提取到变量减少 JSX 嵌套深度）
  const renderNodes = () => (
    <g>
      {simNodesRef.current.map(n => {
        const civColor = CIVILIZATIONS.find(c => c.id === n.civilization)?.color ?? '#888'
        const dim = hoveredId && !neighborIds.has(n.id)
        const selected = n.id === selectedCharId
        return (
          <g key={n.id} transform={`translate(${n.x ?? 0}, ${n.y ?? 0})`} style={{ opacity: dim ? 0.25 : 1, transition: 'opacity 0.2s' }}>
            {n.fx != null && <circle r={selected ? 16 : 13} fill="none" stroke={civColor} strokeWidth={1} opacity={0.4} strokeDasharray="2,2" style={{ pointerEvents: 'none' }} />}
            <circle r={selected ? 13 : 10} fill={civColor} stroke={selected ? '#fff' : 'rgba(255,255,255,0.4)'} strokeWidth={selected ? 2 : 1} data-node="1" style={{ cursor: 'grab' }} onMouseEnter={() => setHoveredId(n.id)} onMouseLeave={() => setHoveredId(null)} onMouseDown={(e) => handleNodeMouseDown(e, n)} onClick={() => handleNodeClick(n)} />
            <text y={-14} textAnchor="middle" fontSize="11" fill="rgb(247, 238, 216)" style={{ pointerEvents: 'none', textShadow: '0 0 4px rgba(0,0,0,0.9)', fontWeight: selected ? 700 : 400 }}>{n.char.name}</text>
          </g>
        )
      })}
    </g>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
      <div className="rounded-xl border border-ink-700 bg-ink-900/70 overflow-hidden relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto select-none"
          style={{
            background: 'radial-gradient(circle at center, rgb(15,14,12) 0%, rgb(8,7,6) 100%)',
            cursor: 'grab',
          }}
        >
          <g ref={gRef} transform={transformStr}>
            {/* 关系边（用 simLinksRef.current，因为 d3-force 会替换 source/target 为节点引用） */}
            <g>
              {simLinksRef.current.map((l, i) => {
                const s = l.source as Node
                const t = l.target as Node
                if (typeof s.x !== 'number' || typeof t.x !== 'number' || typeof s.y !== 'number' || typeof t.y !== 'number') return null
                const sx = s.x; const sy = s.y; const tx = t.x; const ty = t.y
                const highlighted = hoveredId && (s.id === hoveredId || t.id === hoveredId)
                const dim = hoveredId && !highlighted
                // 中点 + 角度（用于文字旋转对齐边）
                const mx = (sx + tx) / 2
                const my = (sy + ty) / 2
                const dx = tx - sx
                const dy = ty - sy
                const angle = Math.atan2(dy, dx) * 180 / Math.PI
                // 文字太长则截断
                const txt = edgeLabel(l)
                const display = txt.length > 10 ? txt.slice(0, 10) + '…' : txt
                return (
                  <g key={i}>
                    <line
                      x1={s.x} y1={s.y}
                      x2={t.x} y2={t.y}
                      stroke={REL_COLOR[l.type]}
                      strokeWidth={highlighted ? 2.5 : 1.2}
                      opacity={dim ? 0.15 : highlighted ? 0.95 : 0.55}
                    />
                    {/* 关系描述文字（边上中点） */}
                    <g transform={`translate(${mx}, ${my})`}>
                      <g transform={`rotate(${angle > 90 || angle < -90 ? angle + 180 : angle})`}>
                        <rect
                          x={-((display.length * 5.5) / 2) - 3}
                          y={-7}
                          width={display.length * 5.5 + 6}
                          height={11}
                          rx={2}
                          fill="rgba(15,14,12,0.85)"
                          stroke={highlighted ? REL_COLOR[l.type] : 'rgba(80,70,55,0.4)'}
                          strokeWidth={highlighted ? 1 : 0.5}
                          opacity={dim ? 0.15 : highlighted ? 1 : 0.85}
                        />
                        <text
                          x={0}
                          y={2}
                          textAnchor="middle"
                          fontSize="9"
                          fill={highlighted ? REL_COLOR[l.type] : 'rgb(220, 200, 160)'}
                          style={{
                            pointerEvents: 'none',
                            fontWeight: highlighted ? 600 : 400,
                            opacity: dim ? 0.2 : 1,
                          }}
                        >
                          {display}
                        </text>
                      </g>
                    </g>
                  </g>
                )
              })}
</g>
            {/* 节点（handlers 全部挂在 circle 上，circle 是真正的 SVG hit target） */}
            <g>
              {renderNodes()}
            </g>
          </g>
        </svg>

        {/* 顶部工具条：缩放控制 + 提示 */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-ink-900/80 backdrop-blur rounded px-1 py-1">
          <button
            onClick={() => {
              const z = zoomBehaviorRef.current
              const svg = svgRef.current
              if (z && svg) select(svg).call(z.scaleBy, 1.3)
            }}
            className="w-7 h-7 rounded text-amber-100 hover:bg-amber-700/40 text-base"
            title="放大"
          >
            +
          </button>
          <button
            onClick={() => {
              const z = zoomBehaviorRef.current
              const svg = svgRef.current
              if (z && svg) select(svg).call(z.scaleBy, 0.77)
            }}
            className="w-7 h-7 rounded text-amber-100 hover:bg-amber-700/40 text-base"
            title="缩小"
          >
            −
          </button>
          <button
            onClick={resetZoom}
            className="w-7 h-7 rounded text-amber-100 hover:bg-amber-700/40 text-xs"
            title="重置"
          >
            ⟲
          </button>
        </div>
        {/* 操作提示 */}
        <div className="absolute top-2 right-2 text-[10px] bg-ink-900/80 backdrop-blur rounded px-2 py-1 text-ink-300">
          滚轮缩放 · 拖动背景平移 · 拖动节点
        </div>
        {/* 关系图例 */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5 text-[10px] bg-ink-900/80 backdrop-blur rounded px-2 py-1.5">
          {Object.entries(REL_LABEL).map(([type, label]) => (
            <span key={type} className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-0.5 rounded"
                style={{ background: REL_COLOR[type as RelType] }}
              />
              <span className="text-ink-300">{label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 右侧详情面板 */}
      <aside className="rounded-xl border border-ink-700 bg-ink-800/60 p-4 overflow-y-auto scrollbar-thin max-h-[70vh]">
        {selectedChar ? (
          <CharacterDetail char={selectedChar} onClose={() => setSelectedCharId(null)} />
        ) : hoveredId ? (
          <CharacterDetail char={hoveredId ? charById.get(hoveredId) ?? null : null} onClose={null} hoverOnly />
        ) : (
          <div className="text-ink-300 text-xs text-center py-8">
            点击或悬停节点查看角色详情<br />
            <span className="text-ink-400 text-[10px] mt-2 block">滚轮缩放 · 拖动背景平移 · 拖动节点固定位置</span>
          </div>
        )}
      </aside>
    </div>
  )
}

function CharacterDetail({ char, onClose, hoverOnly }: {
  char: MythCharacter | null | undefined
  onClose: (() => void) | null
  hoverOnly?: boolean
}) {
  if (!char) return <div className="text-ink-300 text-xs text-center py-8">未选中</div>
  const civ = CIVILIZATIONS.find(c => c.id === char.civilization)
  // 关联
  const related = RELATIONSHIPS.filter(r => r.source === char.id || r.target === char.id)
  const charById = new Map(MYTH_CHARACTERS.map(c => [c.id, c]))

  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{civ?.emoji}</span>
          <div>
            <div className="text-[10px] text-ink-300 uppercase tracking-wider">{civ?.name}</div>
            <div className="text-lg font-serif text-parchment-50">{char.name}</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-ink-300 hover:text-parchment-50 text-lg"
            aria-label="关闭"
          >
            ×
          </button>
        )}
      </div>
      <div className="space-y-1 mb-3 text-xs">
        <div><span className="text-ink-300">角色：</span><span className="text-parchment-50">{char.role}</span></div>
        {char.domain && <div><span className="text-ink-300">管辖：</span><span className="text-parchment-50">{char.domain}</span></div>}
      </div>
      {related.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-1.5">关系 ({related.length})</div>
          <div className="space-y-1">
            {related.map((r, i) => {
              const otherId = r.source === char.id ? r.target : r.source
              const other = charById.get(otherId)
              if (!other) return null
              const direction = r.source === char.id ? '→' : '←'
              const baseLabel = REL_LABEL[r.type as RelType]
              const detail = r.label && r.label !== baseLabel ? ` · ${r.label}` : ''
              return (
                <div key={i} className="text-xs flex items-center gap-1.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ background: REL_COLOR[r.type as RelType] }}
                  />
                  <span className="text-ink-300 shrink-0">{baseLabel} {direction}</span>
                  <span className="text-parchment-50 truncate">{other.name}</span>
                  {detail && <span className="text-ink-300 text-[10px] truncate">{detail}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div>
        <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-1.5">出现于 ({char.appearsIn.length})</div>
        <div className="flex flex-wrap gap-1">
          {char.appearsIn.map(id => {
            const m = MYTHOLOGIES.find(mm => mm.id === id)
            if (!m) return null
            return (
              <span key={id} className="text-[11px] px-2 py-0.5 rounded bg-ink-700/60 text-parchment-50">
                {m.title}
              </span>
            )
          })}
        </div>
      </div>
      {hoverOnly && (
        <div className="mt-3 text-[10px] text-ink-300 italic">悬停预览 · 点击节点固定</div>
      )}
    </div>
  )
}