/**
 * CivilizationsOverview — 中西方文明大对比
 *
 * 15 节对比清单(摘自张宏杰中西文明对比系列讲座),
 * 渲染为可点击的章节列表 + 详情面板。
 *
 * 数据:src/data/civilizations-comparison.json
 * - 简介: 全局 intro
 * - 15 节: 每节有 topic / title / summary / east / west / keyPoints[3] / (可选)content(完整原文)
 */
import { useEffect, useMemo, useState } from 'react'
import comparisonData from '@/data/civilizations-comparison.json'
import { useLearningPathStore } from '@/store/useLearningPathStore'
import { useAIStore } from '@/store/useAIStore'
import OverviewLayout from '@/components/ui/OverviewLayout'
import { audioEngine } from '@/utils/audioEngine'
import { renderInline } from '@/lib/inlineMd'

type Section = {
  id: string
  topic: string
  title: string
  summary: string
  background?: string
  east: string
  west: string
  keyPoints: string[]
  timeline?: Array<{ year: number; event: string; era?: string }>
  figures?: Array<{ name: string; role: string }>
  modernRelevance?: string
  questions?: string[]
  content?: string
  /** 富内容字段 - 与其他 overview 板块对齐 */
  facts?: Array<{ label: string; value: string }>
  sections?: Array<{
    type: 'paragraph' | 'callout' | 'list' | 'quote'
    heading?: string
    body?: string
    variant?: string
    items?: string[]
    text?: string
    cite?: string
  }>
  timelineRich?: Array<{ year: string; era?: string; event: string }>
  images?: Array<{ imageKeyword: string; caption: string; credit?: string }>
  related?: Array<{ id: string; title: string; reason: string }>
  source?: string
}

const sections = (comparisonData as { sections: Section[] }).sections
const intro = (comparisonData as { _intro: string })._intro
const source = (comparisonData as { _source: string })._source

interface Props {
  isActive: boolean
  onClose: () => void
}

export default function CivilizationsOverview({ isActive, onClose }: Props) {
  const [activeId, setActiveId] = useState<string>(sections[0].id)
  const [query, setQuery] = useState('')

  const markVisited = useLearningPathStore(s => s.markCivilizationVisited)
  const visitedSectionIds = useLearningPathStore(s => s.progressByPath.civilizations.visitedSectionIds) ?? []
  const setContext = useAIStore(s => s.setContext)
  const setPersonaPrompt = useAIStore(s => s.setPersonaPrompt)
  const newThread = useAIStore(s => s.newThread)
  const openPanel = useAIStore(s => s.openPanel)

  // 打开页面时播放 modal open
  useEffect(() => {
    if (isActive) audioEngine.playModalOpen()
  }, [isActive])

  // ESC 关闭
  useEffect(() => {
    if (!isActive) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isActive, onClose])

  // 切换章节时滚动到顶部 + 标记 visited + 播放翻页音
  const handleSelect = (id: string) => {
    if (id === activeId) return
    audioEngine.playPageTurn()
    setActiveId(id)
    markVisited(id)
    // 滚动到详情顶部
    requestAnimationFrame(() => {
      const el = document.querySelector('[data-civ-detail-top]')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  // 首次进入标记第一节
  useEffect(() => {
    if (isActive && activeId) markVisited(activeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sections
    return sections.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.topic.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q)
    )
  }, [query])

  const active = sections.find(s => s.id === activeId) ?? sections[0]
  const visitedCount = visitedSectionIds.length
  const totalCount = sections.length
  const pPct = Math.round((visitedCount / totalCount) * 100)

  const handleAskAI = () => {
    setContext(null, null, null)
    setPersonaPrompt(
      `你是历史讲师,正在讲解"中西方文明大对比"第 ${active.topic} 节: ${active.title}。` +
      `请基于以下要点展开: ${active.summary}` +
      `东方特点: ${active.east}; 西方特点: ${active.west}。` +
      `请用通俗语言、举 2-3 个具体历史例子, 300-500 字回答。`
    )
    newThread(`中西方对比: ${active.title}`)
    openPanel()
  }

  if (!isActive) return null

  return (
    <OverviewLayout
      emoji="⚖️"
      title={comparisonData.title}
      subtitle={
        <>
          {comparisonData.subtitle} · <span className="text-vermilion-300">{source}</span> · 已读{' '}
          <span className="text-vermilion-300">{visitedCount}</span> / {totalCount} ({pPct}%)
        </>
      }
      onClose={onClose}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* 左侧：章节列表 */}
        <aside className="space-y-3">
          <input
            type="text"
            placeholder="🔍 搜索章节..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-ink-700 border border-ink-600 text-sm text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-vermilion-500/40"
          />
          <div className="text-xs text-ink-300 px-1">
            {filtered.length} / {sections.length} 节
          </div>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto scrollbar-thin pr-1">
            {filtered.map((s, idx) => {
              const isActive = s.id === activeId
              const isVisited = visitedSectionIds.includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelect(s.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-bronze-700/30 border-vermilion-500/40/70 text-parchment-50'
                      : isVisited
                      ? 'bg-ink-800/80 border-emerald-700/40 text-ink-300 hover:border-vermilion-500/60'
                      : 'bg-ink-800/40 border-ink-700 text-ink-400 hover:border-vermilion-500/40 hover:text-parchment-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-serif ${
                      isActive ? 'bg-bronze-500 text-ink-900' : isVisited ? 'bg-emerald-700/40 text-emerald-300' : 'bg-ink-700 text-ink-300'
                    }`}>
                      {isVisited && !isActive ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-ink-300 mb-0.5">{s.topic}</div>
                      <div className="text-sm font-serif leading-snug">{s.title}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* 右侧：详情 */}
        <main data-civ-detail-top className="space-y-4">
          {/* 顶部进度条 */}
          <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all bg-gradient-to-r from-bronze-500 to-bronze-300"
              style={{ width: `${pPct}%` }}
            />
          </div>

          {/* 章节标题 */}
          <div className="p-5 rounded-lg bg-gradient-to-br from-vermilion-900/30 to-ink-800 border border-bronze-700/40">
            <div className="text-xs text-vermilion-300 uppercase tracking-wider mb-2">
              第 {sections.findIndex(s => s.id === active.id) + 1} 节 · {active.topic}
            </div>
            <h2 className="text-2xl font-serif text-parchment-50 mb-3">{active.title}</h2>
            <p className="text-base text-parchment-50 leading-relaxed">{active.summary}</p>
          </div>

          {/* 中西对比 + 要点 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-lg border border-red-700/40 bg-red-950/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏯</span>
                <span className="text-sm font-serif text-red-300">东方 · 中国</span>
              </div>
              <p className="text-sm text-parchment-50 leading-relaxed">{active.east}</p>
            </div>
            <div className="p-4 rounded-lg border border-blue-700/40 bg-blue-950/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏛️</span>
                <span className="text-sm font-serif text-blue-300">西方 · 欧洲</span>
              </div>
              <p className="text-sm text-parchment-50 leading-relaxed">{active.west}</p>
            </div>
          </div>

          {/* 背景引入 */}
          {active.background && (
            <div className="p-5 rounded-lg bg-ink-800/80 border border-ink-700">
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-3">📜 背景引入</div>
              <p className="text-sm text-parchment-50 leading-relaxed">{active.background}</p>
            </div>
          )}

          {/* 关键要点 */}
          <div className="p-5 rounded-lg bg-ink-800/80 border border-ink-700">
            <div className="text-xs text-ink-300 uppercase tracking-wider mb-3">📌 关键要点</div>
            <ul className="space-y-2">
              {active.keyPoints.map((kp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-parchment-50 leading-relaxed">
                  <span className="text-vermilion-300 mt-0.5 shrink-0">▸</span>
                  <span>{kp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 关键时间线 */}
          {active.timeline && active.timeline.length > 0 && (
            <div className="p-5 rounded-lg bg-ink-800/80 border border-ink-700">
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-3">⏳ 关键时间线</div>
              <ol className="relative border-l-2 border-bronze-700/40 ml-2 space-y-3">
                {active.timeline.map((t, i) => (
                  <li key={i} className="pl-5 relative">
                    <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-bronze-500 ring-2 ring-ink-800" />
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-mono text-vermilion-300 shrink-0 tabular-nums">
                        {t.year < 0 ? `公元前 ${-t.year}` : t.year}
                      </span>
                      <span className="text-sm text-parchment-50 leading-relaxed">{renderInline(t.event)}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 关键人物 */}
          {active.figures && active.figures.length > 0 && (
            <div className="p-5 rounded-lg bg-ink-800/80 border border-ink-700">
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-3">👤 关键人物</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {active.figures.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-vermilion-300 text-xs font-serif mt-0.5 shrink-0">▸</span>
                    <div>
                      <div className="text-sm font-serif text-vermilion-300">{f.name}</div>
                      <div className="text-xs text-ink-400 leading-relaxed">{f.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 现代意义 */}
          {active.modernRelevance && (
            <div className="p-5 rounded-lg bg-gradient-to-br from-emerald-950/30 to-ink-800 border border-emerald-700/40">
              <div className="text-xs text-emerald-400 uppercase tracking-wider mb-3">🌍 现代意义</div>
              <p className="text-sm text-parchment-50 leading-relaxed">{active.modernRelevance}</p>
            </div>
          )}

          {/* 思考问题 */}
          {active.questions && active.questions.length > 0 && (
            <div className="p-5 rounded-lg bg-ink-800/80 border border-purple-700/40">
              <div className="text-xs text-purple-400 uppercase tracking-wider mb-3">💭 思考问题</div>
              <ul className="space-y-2">
                {active.questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-parchment-50 leading-relaxed">
                    <span className="text-purple-400 mt-0.5 shrink-0 font-serif">?</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 完整原文(如果有) — 仅部分章节有完整正文 */}
          {active.content && (
            <div className="p-5 rounded-lg bg-ink-800/80 border border-amber-700/40">
              <div className="text-xs text-amber-400 uppercase tracking-wider mb-3">📜 完整原文(选自 NotebookLM 对话)</div>
              <div className="text-sm text-parchment-50 leading-relaxed whitespace-pre-wrap font-serif">
                {active.content}
              </div>
            </div>
          )}

          {/* 下一步操作 */}
          <div className="flex items-center justify-between pt-3 border-t border-ink-700">
            <div className="flex items-center gap-2">
              {(() => {
                const idx = sections.findIndex(s => s.id === active.id)
                const prev = idx > 0 ? sections[idx - 1] : null
                const next = idx < sections.length - 1 ? sections[idx + 1] : null
                return (
                  <>
                    <button
                      onClick={() => prev && handleSelect(prev.id)}
                      disabled={!prev}
                      className="px-3 py-1.5 rounded-lg text-xs bg-ink-700/60 hover:bg-ink-700 border border-ink-600 text-parchment-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ← 上一节
                    </button>
                    <button
                      onClick={() => next && handleSelect(next.id)}
                      disabled={!next}
                      className="px-3 py-1.5 rounded-lg text-xs bg-ink-700/60 hover:bg-ink-700 border border-ink-600 text-parchment-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      下一节 →
                    </button>
                  </>
                )
              })()}
            </div>
            <button
              onClick={handleAskAI}
              className="px-3 py-1.5 rounded-lg text-xs bg-purple-700/40 hover:bg-purple-600/60 border border-purple-500/50 text-purple-200 transition-colors"
            >
              💬 让 AI 深入讲解
            </button>
          </div>
        </main>
      </div>
    </OverviewLayout>
  )
}
