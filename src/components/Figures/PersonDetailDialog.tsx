/**
 * PersonDetailDialog — 人物详情弹窗（含 AI 对话 + 关系网 + 闪卡入口）
 */
import { useState } from 'react'
import erasData from '@/data/eras.json'
import { useCardsStore } from '@/store/useCardsStore'
import type { Era, HistoricalFigure } from '@/types'
import FigureRelationshipGraph from './FigureRelationshipGraph'

const eras = erasData as Era[]

interface Props {
  person: HistoricalFigure
  onClose: () => void
  onChat: () => void
}

export default function PersonDetailDialog({ person, onClose, onChat }: Props) {
  const [showGraph, setShowGraph] = useState(false)
  const [graphFocusId, setGraphFocusId] = useState<string>(person.id)
  // 闪卡：订阅该人物的卡片状态（addCard 后 store 变化触发重渲染）
  const existingCard = useCardsStore(s =>
    Object.values(s.cards).find(c => c.target.kind === 'figure' && c.target.id === person.id)
  )
  const addCard = useCardsStore(s => s.addCard)
  const removeCard = useCardsStore(s => s.removeCard)

  const hasRelations = (person.relatedFigureIds?.length ?? 0) > 0
  const eraList = person.eraIds
    .map(eid => eras.find(e => e.id === eid))
    .filter((e): e is Era => Boolean(e))
  const lifespan = person.birthYear && person.deathYear
    ? (() => {
        const b = person.birthYear < 0 ? `BC ${-person.birthYear}` : `${person.birthYear}`
        const d = person.deathYear < 0 ? `BC ${-person.deathYear}` : `${person.deathYear}`
        return `${b} — ${d}`
      })()
    : null

  const handleAddCard = () => {
    addCard({ kind: 'figure', id: person.id })
  }
  const handleRemoveCard = () => {
    if (existingCard) removeCard(existingCard.id)
  }

  return (
    <>
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-bronze-500/40 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-bronze-500/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-5xl">{person.emoji || '👤'}</div>
            <div>
              <h3 className="text-xl font-serif text-bronze-300">{person.name}</h3>
              <p className="text-xs text-ink-400 mt-0.5">{person.role}</p>
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

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* 生卒年 */}
          {lifespan && (
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">📅 生卒年</div>
              <div className="text-sm text-parchment-50 font-serif">{lifespan}</div>
            </div>
          )}

          {/* 所属朝代 */}
          {eraList.length > 0 && (
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">🏛️ 所属朝代</div>
              <div className="flex flex-wrap gap-1.5">
                {eraList.map(e => (
                  <span
                    key={e.id}
                    className="text-xs px-2 py-0.5 rounded border"
                    style={{ background: e.color + '20', color: e.color, borderColor: e.color + '40' }}
                  >
                    {e.name}（{e.startYear < 0 ? `BC ${-e.startYear}` : e.startYear} ~ {e.endYear < 0 ? `BC ${-e.endYear}` : e.endYear}）
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 简介 */}
          <div>
            <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">📜 简介</div>
            <div className="text-sm text-parchment-50 leading-relaxed">{person.description}</div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-3 border-t border-ink-700">
            <button
              onClick={onChat}
              className="flex-1 px-4 py-2.5 rounded bg-purple-900/40 hover:bg-purple-800/60 border border-purple-600/50 text-purple-200 text-sm transition-colors"
            >
              💬 与 {person.name} 对话
            </button>
            {hasRelations && (
              <button
                onClick={() => setShowGraph(true)}
                className="px-4 py-2.5 rounded bg-bronze-900/40 hover:bg-bronze-800/60 border border-bronze-600/50 text-bronze-200 text-sm transition-colors"
                title="查看关系网"
              >
                🕸️ 关系网
              </button>
            )}
          </div>

          {/* 闪卡操作 — 第二行 */}
          <div className="flex gap-2">
            {existingCard ? (
              <>
                <div className="flex-1 px-3 py-2 rounded bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2">
                  <span>📇</span>
                  <span>已加入闪卡</span>
                  {existingCard.interval > 0 && (
                    <span className="text-ink-400 ml-auto">
                      {existingCard.interval === 1 ? '明天复习' : `${existingCard.interval} 天后复习`}
                    </span>
                  )}
                  {existingCard.interval === 0 && existingCard.repetitions === 0 && (
                    <span className="text-amber-400 ml-auto">新卡</span>
                  )}
                </div>
                <button
                  onClick={handleRemoveCard}
                  className="px-3 py-2 rounded bg-ink-700/60 hover:bg-red-900/40 border border-ink-600 hover:border-red-700/60 text-ink-400 hover:text-red-300 text-xs transition-colors"
                  title="移除闪卡"
                >
                  移除
                </button>
              </>
            ) : (
              <button
                onClick={handleAddCard}
                className="flex-1 px-3 py-2 rounded bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-600/50 text-emerald-200 text-xs transition-colors"
              >
                📇 加入闪卡（自动 SM-2 复习）
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-2 rounded bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 text-xs transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* 🕸️ 关系网弹层 */}
    {showGraph && (
      <FigureRelationshipGraph
        focusFigureId={graphFocusId}
        onClose={() => setShowGraph(false)}
        onSwitchFocus={(id) => setGraphFocusId(id)}
      />
    )}
    </>
  )
}
