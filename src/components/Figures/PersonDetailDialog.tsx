/**
 * PersonDetailDialog — 人物详情弹窗（含 AI 对话 + 关系网 + 闪卡入口）
 */
import { useState } from 'react'
import erasData from '@/data/eras.json'
import { useCardsStore } from '@/store/useCardsStore'
import { useAIStore } from '@/store/useAIStore'
import { generateSuggestedQuestions } from '@/utils/useLearningContext'
import { enhancePersonaPrompt } from '@/utils/useLearningContext'
import { useAllLearningContexts } from '@/utils/useLearningContext'
import { bingImage, personSearchKeywords, fallbackKeyword } from '@/utils/geoImage'
import type { Era, HistoricalFigure } from '@/types'
import FigureRelationshipGraph from './FigureRelationshipGraph'
import ModalShell from '@/components/ui/Modal'

const eras = erasData as Era[]

interface Props {
  person: HistoricalFigure
  onClose: () => void
  onChat: () => void
}

export default function PersonDetailDialog({ person, onClose, onChat }: Props) {
  // 兼容旧 prop：如果父组件传了 onChat，包装到 handleStartChatWith
  // 推荐新代码直接传 initialQuestion 给 handleStartChatWith，但保留 onChat API 避免破坏调用方
  void onChat // onChat 现已废弃，新逻辑由 handleStartChatWith 提供
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
  const personKw = personSearchKeywords[person.id] ?? fallbackKeyword(person.name, person.category)
  const personImg = bingImage(personKw, 600, 400)
  const lifespan = person.birthYear && person.deathYear
    ? (() => {
        const b = person.birthYear < 0 ? `BC ${-person.birthYear}` : `${person.birthYear}`
        const d = person.deathYear < 0 ? `BC ${-person.deathYear}` : `${person.deathYear}`
        return `${b} — ${d}`
      })()
    : null

  // 提问建议 + AI 对话准备
  const suggestedQuestions = generateSuggestedQuestions(person)
  const allContexts = useAllLearningContexts()
  const setContext = useAIStore(s => s.setContext)
  const setPersonaPrompt = useAIStore(s => s.setPersonaPrompt)
  const newThread = useAIStore(s => s.newThread)
  const openPanel = useAIStore(s => s.openPanel)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleStartChatWith = (question?: string) => {
    // 准备 persona + context
    const firstEraId = person.eraIds[0] ?? null
    setContext(firstEraId, null, person.id)
    const contextString = allContexts[person.id]?.contextString ?? ''
    const basePersona = person.personaPrompt || `你是${person.name}，${person.role}。${person.description}`
    const persona = enhancePersonaPrompt(basePersona + contextString, person.name)
    setPersonaPrompt(persona)
    newThread(`与 ${person.name} 对话`)
    if (question) {
      // 把提问直接发出去 — 需要 access sendMessage。最简方案：开个新 thread，把问题存到一个 ref/状态让 AIChatPanel 首次打开时自动填入
      // 这里用 localStorage 作为简单桥（AIChatPanel 启动时检查并填入）
      sessionStorage.setItem('history-explorer-pending-question', question)
    }
    openPanel()
    onClose()
  }

  const handleAddCard = () => {
    addCard({ kind: 'figure', id: person.id })
  }
  const handleRemoveCard = () => {
    if (existingCard) removeCard(existingCard.id)
  }

  return (
    <>
    <ModalShell isOpen onClose={onClose} innerClassName="border-vermilion-500/40">
      {/* 人物肖像图 */}
        <div className="relative w-full bg-ink-900" style={{ aspectRatio: '3/2' }}>
          <img
            src={personImg}
            alt={person.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const el = e.target as HTMLImageElement
              el.style.display = 'none'
              const parent = el.parentElement
              if (parent) parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-9xl bg-ink-900">${person.emoji || '👤'}</div>`
            }}
          />
          {/* 名字+角色覆盖在图片底部 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-900/95 to-transparent px-6 pt-8 pb-3">
            <div className="text-xs text-vermilion-300 mb-0.5">{person.role}</div>
            <h3 className="text-2xl font-serif text-parchment-50">{person.name}</h3>
          </div>
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-parchment-50/80 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg bg-ink-900/60 hover:bg-ink-900/80 backdrop-blur"
            title="关闭 (ESC)"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {/* 头部 sticky 标题区 */}
        <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-vermilion-500/30 px-6 py-3 flex items-center justify-between">
          <div className="text-xs text-ink-300 uppercase tracking-wider">👤 人物详情</div>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* 生卒年 */}
          {lifespan && (
            <div>
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">📅 生卒年</div>
              <div className="text-sm text-parchment-50 font-serif">{lifespan}</div>
            </div>
          )}

          {/* 所属朝代 */}
          {eraList.length > 0 && (
            <div>
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">🏛️ 所属朝代</div>
              <div className="flex flex-wrap gap-1.5">
                {eraList.map(e => (
                  <span
                    key={e.id}
                    className="text-xs px-2 py-0.5 rounded-lg border"
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
            <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">📜 简介</div>
            <div className="text-sm text-parchment-50 leading-relaxed">{person.description}</div>
          </div>

          {/* 代表作品（文化人物用） */}
          {person.culturalWorks && person.culturalWorks.length > 0 && (
            <div>
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">
                📖 代表作品（{person.culturalWorks.length}）
              </div>
              <div className="flex flex-wrap gap-1.5">
                {person.culturalWorks.map((w, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-lg bg-vermilion-900/30 text-vermilion-200 border border-bronze-700/40"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-3 border-t border-ink-700">
            <button
              onClick={() => handleStartChatWith()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-600/50 text-purple-200 text-sm transition-colors"
            >
              💬 与 {person.name} 对话
            </button>
            {hasRelations && (
              <button
                onClick={() => setShowGraph(true)}
                className="px-4 py-2.5 rounded-lg bg-vermilion-900/30 hover:bg-bronze-800/60 border border-bronze-600/50 text-vermilion-200 text-sm transition-colors"
                title="查看关系网"
              >
                🕸️ 关系网
              </button>
            )}
          </div>

          {/* 💡 提问建议（折叠区） */}
          <div>
            <button
              onClick={() => setShowSuggestions(s => !s)}
              className="w-full flex items-center justify-between text-left text-xs text-purple-300/80 hover:text-purple-200 transition-colors py-1"
            >
              <span>💡 不知道问什么？试试这些</span>
              <span className="text-ink-300">{showSuggestions ? '▲' : '▼'}</span>
            </button>
            {showSuggestions && (
              <div className="mt-1 space-y-1.5">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleStartChatWith(q)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-purple-950/30 hover:bg-purple-900/50 border border-purple-800/40 hover:border-purple-600/60 text-xs text-parchment-50 transition-colors"
                    title="点击直接以这个问题开始对话"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 闪卡操作 — 第二行 */}
          <div className="flex gap-2">
            {existingCard ? (
              <>
                <div className="flex-1 px-3 py-2 rounded-lg bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2">
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
                  className="px-3 py-2 rounded-lg bg-ink-700/60 hover:bg-red-900/40 border border-ink-600 hover:border-red-700/60 text-ink-400 hover:text-red-300 text-xs transition-colors"
                  title="移除闪卡"
                >
                  移除
                </button>
              </>
            ) : (
              <button
                onClick={handleAddCard}
                className="flex-1 px-3 py-2 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-600/50 text-emerald-200 text-xs transition-colors"
              >
                📇 加入闪卡（自动 SM-2 复习）
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 text-xs transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
    </ModalShell>

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
