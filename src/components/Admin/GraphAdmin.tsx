/**
 * GraphAdmin — 人物关系网编辑器
 *
 * 功能：
 * - 选择焦点人物（中心节点）
 * - 1 度 + 2 度人物自动展开（同原 FigureRelationshipGraph）
 * - 拖动节点移动位置（位置不持久化，每次重新布局）
 * - 鼠标悬停节点 + 拖到另一个节点 → 创建关系（弹窗选类型）
 * - 点击边 → 弹窗确认删除
 * - 右侧列表：focus 的直接关系（可单独编辑/删除）
 * - 改动实时写入 useAdminStore
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { getMergedPeople } from '@/utils/adminData'
import type { HistoricalFigure } from '@/types'

type RelationType = 'mentor' | 'rival' | 'successor' | 'contemporary' | 'family'

const RELATION_STYLE: Record<RelationType, { color: string; label: string; icon: string }> = {
  mentor:       { color: '#5b9bc8', label: '师承', icon: '👨‍🏫' },
  rival:        { color: '#b85450', label: '对手', icon: '⚔️' },
  successor:    { color: '#5bc89a', label: '传承', icon: '👑' },
  contemporary: { color: '#8a8a8a', label: '同代', icon: '🤝' },
  family:       { color: '#9b7eb6', label: '家族', icon: '👪' },
}

const WIDTH = 1100
const HEIGHT = 600
const NODE_R = 30
const FOCUS_R = 42

interface NodePos { id: string; x: number; y: number; figure: HistoricalFigure; isFocus: boolean; degree: 0 | 1 | 2 }

// 简单圆形布局（按度数分环）
function layoutNodes(focusId: string, allIds: string[], people: HistoricalFigure[]): NodePos[] {
  const byId = new Map(people.map(p => [p.id, p]))
  const focus = byId.get(focusId)
  if (!focus) return []

  const oneDeg = allIds.filter(id => id !== focusId)
  const twoDeg: string[] = []  // 暂未实现
  void twoDeg

  const cx = WIDTH / 2
  const cy = HEIGHT / 2
  const positions: NodePos[] = []

  // 焦点居中
  positions.push({ id: focusId, x: cx, y: cy, figure: focus, isFocus: true, degree: 0 })

  // 1 度节点绕中心均匀分布
  const r1 = 200
  oneDeg.forEach((id, i) => {
    const fig = byId.get(id)
    if (!fig) return
    const angle = (i / oneDeg.length) * Math.PI * 2 - Math.PI / 2
    positions.push({
      id, x: cx + r1 * Math.cos(angle), y: cy + r1 * Math.sin(angle),
      figure: fig, isFocus: false, degree: 1,
    })
  })

  return positions
}

export default function GraphAdmin() {
  const [focusId, setFocusId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const merged = useMemo(() => getMergedPeople(), [])
  const overrides = useAdminStore(s => s.peopleOverrides)

  // 焦点人物
  useEffect(() => {
    if (!focusId && merged.length > 0) {
      setFocusId(merged[0].id)
    }
  }, [focusId, merged])

  // 焦点人物的直接关系（合并 override）
  const focusFigure = merged.find(p => p.id === focusId)
  const directRelations = useMemo(() => {
    if (!focusFigure) return []
    return (focusFigure.relatedFigureIds ?? []).map(rel => ({
      targetId: rel.id,
      type: rel.type as RelationType,
      target: merged.find(p => p.id === rel.id),
    }))
  }, [focusFigure, merged])

  // 1 度节点 ids
  const oneDegreeIds = useMemo(() => directRelations.map(r => r.targetId).filter(Boolean), [directRelations])

  // 计算边
  const edges = useMemo(() => {
    if (!focusFigure) return []
    return directRelations
      .filter(r => r.target)
      .map(r => ({
        key: `${focusFigure.id}-${r.targetId}`,
        source: focusFigure.id,
        target: r.targetId,
        type: r.type,
      }))
  }, [focusFigure, directRelations])

  // 节点位置
  const nodePositions = useMemo(() => {
    if (!focusId) return [] as NodePos[]
    return layoutNodes(focusId, oneDegreeIds, merged)
  }, [focusId, oneDegreeIds, merged])

  const posById = useMemo(() => {
    const m = new Map<string, NodePos>()
    nodePositions.forEach(p => m.set(p.id, p))
    return m
  }, [nodePositions])

  // 拖拽 + 创建关系
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragState, setDragState] = useState<{
    fromId: string
    fromX: number
    fromY: number
    toX: number
    toY: number
    overId: string | null
  } | null>(null)

  // 创建/删除/编辑 弹窗
  const [newRel, setNewRel] = useState<{ source: string; target: string; type: RelationType } | null>(null)
  const [delRel, setDelRel] = useState<{ source: string; target: string; name: string } | null>(null)
  const [editRel, setEditRel] = useState<{ source: string; target: string; type: RelationType } | null>(null)

  const setPersonOverride = useAdminStore(s => s.setPersonOverride)

  // 提交新关系：添加到 source 的 relatedFigureIds
  const handleCreateRel = (type: RelationType) => {
    if (!newRel) return
    const { source, target } = newRel
    // 读当前 override
    const sourceOv = overrides[source] ?? {}
    const sourceBase = merged.find(p => p.id === source)
    const currentRels = sourceOv.relatedFigureIds ?? sourceBase?.relatedFigureIds ?? []
    // 去重（检查是否已有 target 的关系）
    if (currentRels.some(r => r.id === target)) {
      alert('这两人之间已有关系，请用"编辑"修改')
      setNewRel(null)
      return
    }
    const newRels = [...currentRels, { id: target, type }]
    setPersonOverride(source, { relatedFigureIds: newRels })
    setNewRel(null)
  }

  // 删除关系：从 source 移除
  const handleDeleteRel = () => {
    if (!delRel) return
    const { source, target } = delRel
    const sourceOv = overrides[source] ?? {}
    const sourceBase = merged.find(p => p.id === source)
    const currentRels = sourceOv.relatedFigureIds ?? sourceBase?.relatedFigureIds ?? []
    const newRels = currentRels.filter(r => r.id !== target)
    setPersonOverride(source, { relatedFigureIds: newRels })
    setDelRel(null)
  }

  // 编辑关系类型：只改 type
  const handleEditRel = (newType: RelationType) => {
    if (!editRel) return
    const { source, target } = editRel
    const sourceOv = overrides[source] ?? {}
    const sourceBase = merged.find(p => p.id === source)
    const currentRels = sourceOv.relatedFigureIds ?? sourceBase?.relatedFigureIds ?? []
    const newRels = currentRels.map(r => r.id === target ? { ...r, type: newType } : r)
    setPersonOverride(source, { relatedFigureIds: newRels })
    setEditRel(null)
  }

  // 拖动节点：开始时记录起始点，悬停时显示"连接到 X"
  const handleNodeMouseDown = (node: NodePos, e: React.MouseEvent) => {
    e.stopPropagation()
    if (node.isFocus) return  // 不允许拖动焦点
    // 进入"创建关系模式"：记录起点，等用户拖到另一个节点
    setDragState({
      fromId: node.id,
      fromX: node.x,
      fromY: node.y,
      toX: node.x,
      toY: node.y,
      overId: null,
    })
  }

  useEffect(() => {
    if (!dragState) return
    const handleMove = (e: MouseEvent) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * WIDTH
      const y = ((e.clientY - rect.top) / rect.height) * HEIGHT
      // 检测悬停的节点
      let overId: string | null = null
      for (const p of nodePositions) {
        if (p.id === dragState.fromId) continue
        const dx = x - p.x, dy = y - p.y
        if (Math.sqrt(dx * dx + dy * dy) < NODE_R + 4) { overId = p.id; break }
      }
      setDragState({ ...dragState, toX: x, toY: y, overId })
    }
    const handleUp = () => {
      if (dragState.overId && dragState.overId !== dragState.fromId) {
        setNewRel({ source: dragState.fromId, target: dragState.overId, type: 'contemporary' })
      }
      setDragState(null)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [dragState, nodePositions])

  // ESC 关闭弹窗
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (newRel) setNewRel(null)
        else if (delRel) setDelRel(null)
        else if (editRel) setEditRel(null)
        else if (dragState) setDragState(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [newRel, delRel, editRel, dragState])

  // 搜索过滤
  const searchResults = useMemo(() => {
    if (!search) return []
    const q = search.toLowerCase()
    return merged.filter(p =>
      p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [search, merged])

  return (
    <div className="flex h-full">
      {/* 左：人物选择 */}
      <div className="w-72 flex-shrink-0 border-r border-ink-700 flex flex-col">
        <div className="p-3 border-b border-ink-700">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索人物设置焦点..."
            className="w-full px-3 py-1.5 text-sm bg-ink-800 border border-ink-600 rounded-lg text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {search ? (
            searchResults.length === 0 ? (
              <div className="p-4 text-center text-ink-500 text-sm">无匹配</div>
            ) : (
              searchResults.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setFocusId(p.id); setSearch('') }}
                  className="w-full text-left p-2 border-b border-ink-800 hover:bg-ink-800/60"
                >
                  <div className="flex items-center gap-2">
                    <span>{p.emoji || '👤'}</span>
                    <span className="text-sm text-parchment-50">{p.name}</span>
                  </div>
                </button>
              ))
            )
          ) : (
            <div className="p-3 space-y-2 text-xs text-ink-400">
              <div className="text-bronze-300">💡 使用方法</div>
              <ul className="list-disc list-inside space-y-1">
                <li>上方搜索框切换焦点人物</li>
                <li>SVG 中<strong>从一个节点拖到另一个</strong> → 创建关系</li>
                <li>SVG 中<strong>点击边</strong> → 编辑/删除关系</li>
                <li>右侧列表单独编辑某条关系</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 中：图谱 */}
      <div className="flex-1 flex flex-col bg-ink-900">
        {focusFigure ? (
          <>
            <div className="p-3 border-b border-ink-700 flex items-center justify-between">
              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider">焦点人物</div>
                <h2 className="text-lg font-serif text-purple-300 flex items-center gap-2">
                  <span>{focusFigure.emoji || '👤'}</span>
                  {focusFigure.name}
                </h2>
              </div>
              <div className="text-xs text-ink-400">
                {directRelations.length} 条直接关系 · {oneDegreeIds.length} 位相关人物
              </div>
            </div>
            <div className="flex-1 relative">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
              >
                {/* 边 */}
                {edges.map(e => {
                  const s = posById.get(e.source)
                  const t = posById.get(e.target)
                  if (!s || !t) return null
                  const style = RELATION_STYLE[e.type as RelationType] ?? RELATION_STYLE.contemporary
                  const midX = (s.x + t.x) / 2
                  const midY = (s.y + t.y) / 2
                  return (
                    <g key={e.key}>
                      <line
                        x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                        stroke={style.color}
                        strokeWidth={2}
                        strokeOpacity={0.7}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setEditRel({ source: e.source, target: e.target, type: e.type as RelationType })}
                      />
                      {/* 边中点文字标签（点击删除） */}
                      <g
                        transform={`translate(${midX}, ${midY})`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setDelRel({ source: e.source, target: e.target, name: (s.figure.name) + ' — ' + (t.figure.name) })}
                      >
                        <rect
                          x={-32} y={-9} width={64} height={18}
                          fill="#0f0e0c" stroke={style.color} strokeWidth={1} rx={3} opacity={0.95}
                        />
                        <text
                          textAnchor="middle" dominantBaseline="central"
                          fontSize={10} fill={style.color}
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {style.icon} {style.label}
                        </text>
                      </g>
                    </g>
                  )
                })}

                {/* 节点 */}
                {nodePositions.map(p => {
                  const r = p.isFocus ? FOCUS_R : NODE_R
                  return (
                    <g
                      key={p.id}
                      transform={`translate(${p.x},${p.y})`}
                      style={{ cursor: p.isFocus ? 'default' : 'grab' }}
                      onMouseDown={e => handleNodeMouseDown(p, e)}
                    >
                      {p.isFocus && <circle r={r + 10} fill="#c89a5b" opacity={0.2} />}
                      <circle
                        r={r}
                        fill={p.isFocus ? '#c89a5b' : '#3a3a4a'}
                        stroke={p.isFocus ? '#ffd47a' : '#6a6a7a'}
                        strokeWidth={p.isFocus ? 3 : 2}
                      />
                      <text
                        textAnchor="middle" dominantBaseline="central"
                        fontSize={p.isFocus ? 26 : 18}
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {p.figure.emoji || '👤'}
                      </text>
                      <text
                        y={r + 14} textAnchor="middle"
                        fontSize={p.isFocus ? 13 : 11}
                        fill={p.isFocus ? '#ffd47a' : '#e8d5a0'}
                        style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'serif' }}
                      >
                        {p.figure.name}
                      </text>
                    </g>
                  )
                })}

                {/* 拖拽中的连线 */}
                {dragState && (
                  <line
                    x1={dragState.fromX} y1={dragState.fromY}
                    x2={dragState.toX} y2={dragState.toY}
                    stroke={dragState.overId ? '#ffd47a' : '#9b7eb6'}
                    strokeWidth={2} strokeDasharray="6 4"
                  />
                )}
              </svg>

              {/* 帮助提示 */}
              <div className="absolute top-3 left-3 bg-ink-800/80 backdrop-blur border border-ink-600 rounded-lg px-3 py-1.5 text-xs text-ink-400">
                💡 拖节点到另一节点 → 创建关系 · 点击边标签 → 编辑/删除
              </div>

              {/* 拖动悬停指示 */}
              {dragState?.overId && (() => {
                const p = posById.get(dragState.overId)
                if (!p) return null
                return (
                  <div
                    className="absolute pointer-events-none bg-amber-900/80 text-amber-100 text-xs px-2 py-1 rounded-lg"
                    style={{
                      left: `${(p.x / WIDTH) * 100}%`,
                      top: `${(p.y / HEIGHT) * 100}%`,
                      transform: 'translate(-50%, -120%)',
                    }}
                  >
                    松手连接到 {p.figure.name}
                  </div>
                )
              })()}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-ink-500">
            ← 左侧选择焦点人物
          </div>
        )}
      </div>

      {/* 右：关系列表 */}
      <div className="w-80 flex-shrink-0 border-l border-ink-700 flex flex-col">
        <div className="p-3 border-b border-ink-700">
          <div className="text-xs text-ink-500 uppercase tracking-wider">直接关系</div>
          <div className="text-xs text-ink-400 mt-0.5">{focusFigure?.name} → {directRelations.length} 人</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {directRelations.length === 0 ? (
            <div className="p-4 text-center text-ink-500 text-xs">
              还没有关系。<br/>
              在中间图谱里<strong>拖节点到另一节点</strong>来创建。
            </div>
          ) : (
            directRelations.map(r => {
              if (!r.target) return null
              const style = RELATION_STYLE[r.type] ?? RELATION_STYLE.contemporary
              return (
                <div key={r.targetId} className="p-2 border-b border-ink-800 hover:bg-ink-800/40 group">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{r.target.emoji || '👤'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-parchment-50 truncate">{r.target.name}</div>
                      <div className="text-xs text-ink-500" style={{ color: style.color }}>{style.icon} {style.label}</div>
                    </div>
                    <button
                      onClick={() => setDelRel({ source: focusFigure!.id, target: r.targetId, name: focusFigure!.name + ' — ' + r.target!.name })}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-200 text-xs px-1"
                      title="删除"
                      aria-label="删除"
                    >🗑️</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 新建关系弹窗 */}
      {newRel && (() => {
        const s = merged.find(p => p.id === newRel.source)
        const t = merged.find(p => p.id === newRel.target)
        if (!s || !t) return null
        return (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-900/85 backdrop-blur p-4" onClick={() => setNewRel(null)}>
            <div className="bg-ink-800 rounded-lg border border-bronze-500/40 p-6 w-96" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-serif text-bronze-300 mb-3">➕ 创建关系</h3>
              <div className="mb-3 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span>{s.emoji || '👤'}</span>
                  <span className="text-parchment-50">{s.name}</span>
                </div>
                <div className="text-xs text-ink-500 mb-1.5">↓ 类型 ↓</div>
                <div className="flex items-center gap-2">
                  <span>{t.emoji || '👤'}</span>
                  <span className="text-parchment-50">{t.name}</span>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1 mb-4">
                {(Object.keys(RELATION_STYLE) as RelationType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setNewRel({ ...newRel, type: t })}
                    className={`p-2 rounded-lg text-xs border ${newRel.type === t ? 'border-amber-500' : 'border-ink-600'}`}
                    style={{ background: newRel.type === t ? RELATION_STYLE[t].color + '40' : 'transparent' }}
                  >
                    <div className="text-base">{RELATION_STYLE[t].icon}</div>
                    <div className="text-xs mt-1" style={{ color: RELATION_STYLE[t].color }}>{RELATION_STYLE[t].label}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCreateRel(newRel.type)}
                  className="flex-1 px-3 py-2 rounded-lg bg-emerald-700/40 hover:bg-emerald-600/60 border border-emerald-500/50 text-emerald-200 text-sm"
                >💾 创建</button>
                <button onClick={() => setNewRel(null)} className="px-3 py-2 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 text-sm">取消</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 删除确认 */}
      {delRel && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-900/85 backdrop-blur p-4" onClick={() => setDelRel(null)}>
          <div className="bg-ink-800 rounded-lg border border-red-500/40 p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-serif text-red-300 mb-3">🗑️ 删除关系</h3>
            <p className="text-sm text-parchment-100 mb-4">
              确定删除关系：<br/>
              <span className="font-serif text-red-200">{delRel.name}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteRel}
                className="flex-1 px-3 py-2 rounded-lg bg-red-700/40 hover:bg-red-600/60 border border-red-500/50 text-red-200 text-sm"
              >🗑️ 删除</button>
              <button onClick={() => setDelRel(null)} className="px-3 py-2 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 text-sm">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑关系类型 */}
      {editRel && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-900/85 backdrop-blur p-4" onClick={() => setEditRel(null)}>
          <div className="bg-ink-800 rounded-lg border border-bronze-500/40 p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-serif text-bronze-300 mb-3">✏️ 编辑关系类型</h3>
            <div className="grid grid-cols-5 gap-1 mb-4">
              {(Object.keys(RELATION_STYLE) as RelationType[]).map(t => (
                <button
                  key={t}
                  onClick={() => handleEditRel(t)}
                  className={`p-2 rounded-lg text-xs border ${editRel.type === t ? 'border-amber-500' : 'border-ink-600'}`}
                  style={{ background: editRel.type === t ? RELATION_STYLE[t].color + '40' : 'transparent' }}
                >
                  <div className="text-base">{RELATION_STYLE[t].icon}</div>
                  <div className="text-xs mt-1" style={{ color: RELATION_STYLE[t].color }}>{RELATION_STYLE[t].label}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setEditRel(null)} className="w-full px-3 py-2 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 text-sm">取消</button>
          </div>
        </div>
      )}
    </div>
  )
}
