/**
 * NodeDetailPanel — 点击图谱节点时显示的右侧详情面板
 *
 * 显示：
 * - 节点基本信息（朝代 / 人物 / 时间）
 * - 所有关联关系（按类型分组：时间前序/后续/同时期/继承/转型）
 * - 每条关系可点击 → 切换到该节点的详情
 */
import type { Era, HistoricalFigure } from '@/types'
import type { Relationship, RelationshipType } from '@/data/relationships'

interface Props {
  node: {
    id: string
    kind: 'era' | 'person'
    era?: Era
    figure?: HistoricalFigure
    emoji?: string
  }
  /** 节点关联的所有关系 —— 已按类型分组 */
  relations: {
    type: RelationshipType
    other: { id: string; name: string; emoji?: string; era?: Era }
    label?: string
    direction: 'out' | 'in'  // 出/入
  }[]
  onSelectNode: (id: string) => void
  onClose: () => void
}

const TYPE_META: Record<RelationshipType, { label: string; color: string; icon: string }> = {
  'temporal-prev':  { label: '时间前序', color: '#5a5142', icon: '◀' },
  'temporal-next':  { label: '时间后续', color: '#5a5142', icon: '▶' },
  'contemporary':   { label: '同时期',    color: '#a87a3e', icon: '◐' },
  'succession':     { label: '继承',      color: '#c89a5b', icon: '↓' },
  'transformation': { label: '转型',      color: '#fdf8f0', icon: '⤳' },
}

export default function NodeDetailPanel({ node, relations, onSelectNode, onClose }: Props) {
  // 按类型分组
  const grouped = relations.reduce<Record<string, typeof relations>>((acc, r) => {
    (acc[r.type] ||= []).push(r)
    return acc
  }, {} as Record<string, typeof relations>)

  const order: RelationshipType[] = ['succession', 'transformation', 'contemporary', 'temporal-prev', 'temporal-next']

  return (
    <div className="absolute top-4 right-4 w-80 max-h-[calc(100vh-2rem)] flex flex-col bg-ink-800/95 backdrop-blur border border-bronze-500/40 rounded-lg shadow-2xl z-30 overflow-hidden">
      {/* 头部：节点基本信息 */}
      <div className="px-4 py-3 border-b border-ink-700">
        <div className="flex items-start gap-2">
          <span className="text-2xl flex-shrink-0">{node.emoji || (node.kind === 'era' ? '🏛' : '👤')}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-serif text-bronze-300 truncate">
              {node.era?.name ?? node.figure?.name ?? node.id}
            </div>
            <div className="text-xs text-ink-500 mt-0.5">
              {node.era && (
                <>
                  {node.era.startYear < 0 ? `BC ${-node.era.startYear}` : node.era.startYear} ~{' '}
                  {node.era.endYear < 0 ? `BC ${-node.era.endYear}` : node.era.endYear}
                </>
              )}
              {node.figure && node.figure.birthYear !== undefined && (
                <>{node.figure.birthYear} ~ {node.figure.deathYear}</>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-parchment-50 w-6 h-6 flex items-center justify-center rounded text-base leading-none"
            title="关闭"
            aria-label="关闭"
          >×</button>
        </div>
        {/* 描述 */}
        {(node.era?.shortDesc || node.era?.description || node.figure?.description) && (
          <div className="text-xs text-ink-400 mt-2 leading-relaxed line-clamp-3">
            {node.era?.shortDesc ?? node.figure?.description}
          </div>
        )}
      </div>

      {/* 关系列表 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-4 py-2 text-xs text-ink-500 uppercase tracking-wider border-b border-ink-700">
          🔗 关联关系（{relations.length}）
        </div>
        {relations.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-ink-500">
            没有关联关系
          </div>
        )}
        {order.map(t => {
          const group = grouped[t]
          if (!group || group.length === 0) return null
          const meta = TYPE_META[t]
          return (
            <div key={t} className="border-b border-ink-700/50">
              <div className="px-4 py-1.5 text-xs flex items-center gap-2" style={{ color: meta.color }}>
                <span>{meta.icon}</span>
                <span className="font-medium">{meta.label}</span>
                <span className="text-ink-500">({group.length})</span>
              </div>
              {group.map((r, i) => (
                <button
                  key={i}
                  onClick={() => onSelectNode(r.other.id)}
                  className="w-full text-left px-4 py-2 hover:bg-ink-700/60 transition-colors flex items-center gap-2 group"
                  style={{ borderLeft: `2px solid ${meta.color}` }}
                >
                  <span className="text-base flex-shrink-0">{r.other.emoji ?? '📍'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-parchment-100 truncate group-hover:text-bronze-300 transition-colors">
                      {r.direction === 'in' && '← '}
                      {r.other.name}
                      {r.direction === 'out' && ' →'}
                    </div>
                    {r.label && (
                      <div className="text-xs text-ink-500 truncate">
                        {r.label}
                      </div>
                    )}
                  </div>
                  <span className="text-ink-500 group-hover:text-bronze-400 text-base">›</span>
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
