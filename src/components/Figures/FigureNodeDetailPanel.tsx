/**
 * FigureNodeDetailPanel — 人物关系网中节点点击后的详情面板
 *
 * 显示：
 * - 人物基本信息（姓名 / 角色 / 出生-卒 / 朝代）
 * - 简介
 * - 关联人物列表（按 mentor/rival/successor/contemporary/family 分组）
 */
import type { HistoricalFigure } from '@/types'
import type { RelationType } from './FigureRelationshipGraph'

interface RelatedOther {
  id: string
  name: string
  role?: string
  emoji?: string
  eraNames?: string
}

interface Props {
  node: {
    figure: HistoricalFigure
  }
  relations: {
    type: RelationType
    label: string
    other: RelatedOther
  }[]
  onSelectNode: (id: string) => void
  onClose: () => void
}

const TYPE_META: Record<RelationType, { label: string; color: string; icon: string }> = {
  mentor:      { label: '师承',     color: '#5b9bc8', icon: '👨‍🏫' },
  rival:       { label: '对手',     color: '#b85450', icon: '⚔️' },
  successor:   { label: '传承',     color: '#5bc89a', icon: '👑' },
  contemporary:{ label: '同代',     color: '#8a8a8a', icon: '🤝' },
  family:      { label: '家族',     color: '#9b7eb6', icon: '👪' },
}

export default function FigureNodeDetailPanel({ node, relations, onSelectNode, onClose }: Props) {
  const fig = node.figure
  const grouped = relations.reduce<Record<string, typeof relations>>((acc, r) => {
    (acc[r.type] ||= []).push(r)
    return acc
  }, {} as Record<string, typeof relations>)

  const order: RelationType[] = ['mentor', 'successor', 'family', 'rival', 'contemporary']

  return (
    <div className="absolute top-3 right-3 w-80 max-h-[calc(100%-6rem)] flex flex-col bg-ink-800/95 backdrop-blur border border-purple-500/40 rounded-lg shadow-2xl z-30 overflow-hidden">
      <div className="px-4 py-3 border-b border-ink-700">
        <div className="flex items-start gap-2">
          <span className="text-2xl flex-shrink-0">{fig.emoji || '👤'}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-serif text-purple-300 truncate">{fig.name}</div>
            <div className="text-xs text-ink-500 mt-0.5 truncate">{fig.role}</div>
            {fig.birthYear !== undefined && fig.deathYear !== undefined && (
              <div className="text-xs text-ink-500 tabular-nums">
                {fig.birthYear < 0 ? `BC ${-fig.birthYear}` : fig.birthYear} ~{' '}
                {fig.deathYear < 0 ? `BC ${-fig.deathYear}` : fig.deathYear}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-parchment-50 w-6 h-6 flex items-center justify-center rounded text-base leading-none"
            title="关闭"
            aria-label="关闭"
          >×</button>
        </div>
        {fig.description && (
          <div className="text-xs text-ink-400 mt-2 leading-relaxed line-clamp-3">
            {fig.description}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-4 py-2 text-xs text-ink-500 uppercase tracking-wider border-b border-ink-700">
          👥 关联人物（{relations.length}）
        </div>
        {relations.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-ink-500">
            没有关联人物
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
                  <span className="text-base flex-shrink-0">{r.other.emoji ?? '👤'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-parchment-100 truncate group-hover:text-purple-300 transition-colors">
                      {r.other.name}
                    </div>
                    <div className="text-xs text-ink-500 truncate">
                      {r.other.role}{r.other.eraNames ? ` · ${r.other.eraNames}` : ''}
                    </div>
                  </div>
                  <span className="text-ink-500 group-hover:text-purple-400 text-base">›</span>
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
