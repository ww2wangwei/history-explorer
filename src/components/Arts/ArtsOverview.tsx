/**
 * ArtsOverview — 西方艺术课 60 节
 *
 * 60 节西方艺术史课程总览(古希腊 → 当代)。
 * - 复用 OverviewLayout
 * - 左侧:按时代分组的章节列表(可搜索)
 * - 右侧:章节详情(摘要/年代/核心艺术家/代表作/风格/关键要点/时间线/历史意义/配图)
 * - 配图用 bingImage 自动生成艺术相关封面
 *
 * 数据:src/data/western-art-60-lessons.json
 * 每个 component 单独 dynamic import — 由 Layout.tsx 用 lazy + Suspense 包裹。
 */
import { useEffect, useMemo, useState } from 'react'
import artData from '@/data/western-art-60-lessons.json'
import { useLearningPathStore } from '@/store/useLearningPathStore'
import { useAIStore } from '@/store/useAIStore'
import OverviewLayout from '@/components/ui/OverviewLayout'
import { audioEngine } from '@/utils/audioEngine'
import { bingImage } from '@/utils/geoImage'

type TimelineEvent = { year: number; event: string }

type Lesson = {
  id: string
  topic: string
  title: string
  era: string
  summary: string
  keyFigures: string[]
  keyWorks: string[]
  style: string
  keyPoints: string[]
  timeline: TimelineEvent[]
  significance: string
  fullText?: string
  imageKeywords?: string[]
}

const lessons = (artData as { lessons: Lesson[] }).lessons
const title = (artData as { title: string }).title
const subtitle = (artData as { subtitle: string }).subtitle
const intro = (artData as { _intro: string })._intro
const source = (artData as { _source: string })._source

// 主题色:按 topic 派生(保证相邻 topic 颜色区分)
const TOPIC_PALETTE = [
  '#c89a5b', // bronze
  '#9b7eb6', // purple
  '#b85450', // red
  '#5b9bc8', // blue
  '#5bc89a', // green
  '#c89a8a', // pinkish
  '#d4a85b', // gold
  '#a08570', // earth
  '#7a8a98', // steel
  '#c878a0', // magenta
  '#e8a23c', // orange
  '#9bc89a', // mint
]

const TOPIC_COLOR: Record<string, string> = {}
lessons.forEach((l) => {
  if (!TOPIC_COLOR[l.topic]) {
    const idx = Object.keys(TOPIC_COLOR).length % TOPIC_PALETTE.length
    TOPIC_COLOR[l.topic] = TOPIC_PALETTE[idx]
  }
})

interface Props {
  isActive: boolean
  onClose: () => void
}

export default function ArtsOverview({ isActive, onClose }: Props) {
  const [activeId, setActiveId] = useState<string>(lessons[0].id)
  const [query, setQuery] = useState('')
  const [lightbox, setLightbox] = useState<{ url: string; caption: string; source: string } | null>(null)

  const markVisited = useLearningPathStore(s => s.markArtVisited)
  const visitedLessonIds = useLearningPathStore(s => s.progressByPath.allArts.visitedLessonIds) ?? []
  const setContext = useAIStore(s => s.setContext)
  const setPersonaPrompt = useAIStore(s => s.setPersonaPrompt)
  const newThread = useAIStore(s => s.newThread)
  const openPanel = useAIStore(s => s.openPanel)

  useEffect(() => {
    if (isActive) audioEngine.playModalOpen()
  }, [isActive])

  // 首次进入标记第一节
  useEffect(() => {
    if (isActive && activeId) markVisited(activeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return lessons
    return lessons.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.topic.toLowerCase().includes(q) ||
      l.summary.toLowerCase().includes(q) ||
      l.keyFigures.some(f => f.toLowerCase().includes(q))
    )
  }, [query])

  const active = lessons.find(l => l.id === activeId) ?? lessons[0]
  const activeIdx = lessons.findIndex(l => l.id === active.id)
  const visitedCount = visitedLessonIds.length
  const totalCount = lessons.length
  const pPct = Math.round((visitedCount / totalCount) * 100)

  const handleSelect = (id: string) => {
    if (id === activeId) return
    audioEngine.playPageTurn()
    setActiveId(id)
    markVisited(id)
    requestAnimationFrame(() => {
      const el = document.querySelector('[data-art-detail-top]')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleAskAI = () => {
    setContext(null, null, null)
    setPersonaPrompt(
      `你是艺术史讲师,正在讲解"西方艺术课60节"第 ${activeIdx + 1} 节: ${active.title}(${active.era})。` +
      `请基于以下要点展开: ${active.summary}` +
      `核心艺术家: ${active.keyFigures.join('、')}; 代表作: ${active.keyWorks.join('、')}。` +
      `请用通俗语言、举 1-2 个具体艺术作品例子, 300-500 字回答。`
    )
    newThread(`艺术课: ${active.title}`)
    openPanel()
  }

  if (!isActive) return null

  const topicColor = TOPIC_COLOR[active.topic] ?? '#c89a5b'
  // 用 imageKeywords[0] 作为精确封面关键词,否则降级
  const coverKeyword = active.imageKeywords?.[0]
    ? `${active.imageKeywords[0]} painting`
    : `${active.title} ${active.style} ${active.keyFigures[0] ?? ''}`
  const cover = bingImage(coverKeyword, 800, 300)

  return (
    <OverviewLayout
      emoji="🎨"
      title={title}
      subtitle={
        <>
          {subtitle} · <span className="text-vermilion-300">{source}</span> · 已读{' '}
          <span className="text-vermilion-300">{visitedCount}</span> / {totalCount} ({pPct}%)
        </>
      }
      onClose={onClose}
      headerBorderClass="border-pink-500/30"
    >
      {/* 顶部 intro 卡片 */}
      <div className="mb-5 p-4 rounded-lg bg-gradient-to-br from-pink-950/30 to-ink-800 border border-pink-700/40">
        <div className="text-xs text-pink-300 uppercase tracking-wider mb-2">📜 课程导言</div>
        <p className="text-sm text-parchment-100 leading-relaxed">{intro}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* 左侧:章节列表 */}
        <aside className="space-y-3">
          <input
            type="text"
            placeholder="🔍 搜索课程/艺术家..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-ink-700 border border-ink-600 text-sm text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-pink-500"
          />
          <div className="text-xs text-ink-500 px-1">
            {filtered.length} / {lessons.length} 节
          </div>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto scrollbar-thin pr-1">
            {filtered.map((l) => {
              const isActive = l.id === activeId
              const isVisited = visitedLessonIds.includes(l.id)
              const originalIdx = lessons.findIndex(x => x.id === l.id)
              const color = TOPIC_COLOR[l.topic] ?? '#c89a5b'
              return (
                <button
                  key={l.id}
                  onClick={() => handleSelect(l.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-pink-700/30 border-pink-500/70 text-parchment-50'
                      : isVisited
                      ? 'bg-ink-800/80 border-emerald-700/40 text-ink-300 hover:border-pink-500/60'
                      : 'bg-ink-800/40 border-ink-700 text-ink-400 hover:border-pink-500/40 hover:text-parchment-50'
                  }`}
                  style={{ borderLeftWidth: '3px', borderLeftColor: color }}
                >
                  <div className="flex items-start gap-2">
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-serif ${
                      isActive ? 'bg-pink-500 text-ink-900' : isVisited ? 'bg-emerald-700/40 text-emerald-300' : 'bg-ink-700 text-ink-500'
                    }`}>
                      {isVisited && !isActive ? '✓' : originalIdx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs mb-0.5" style={{ color }}>
                        {l.topic}
                      </div>
                      <div className="text-sm font-serif leading-snug">{l.title}</div>
                      <div className="text-xs text-ink-500 mt-0.5">{l.era}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* 右侧:详情 */}
        <main data-art-detail-top className="space-y-4">
          {/* 顶部进度条 */}
          <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all bg-gradient-to-r from-pink-500 to-pink-300"
              style={{ width: `${pPct}%` }}
            />
          </div>

          {/* 章节标题 + 配图 */}
          <div
            className="rounded-lg overflow-hidden border"
            style={{ borderColor: `${topicColor}66` }}
          >
            <div className="relative w-full h-44 bg-ink-900">
              <img
                src={cover}
                alt={active.title}
                loading="lazy"
                className="w-full h-full object-cover opacity-70"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: topicColor }}>
                  第 {activeIdx + 1} 节 · {active.topic} · {active.era}
                </div>
                <h2 className="text-2xl font-serif text-parchment-50 mb-2">{active.title}</h2>
                <p className="text-sm text-parchment-100 leading-relaxed">{active.summary}</p>
              </div>
            </div>
          </div>

          {/* 核心艺术家 + 代表作 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-lg border border-pink-700/40 bg-pink-950/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👨‍🎨</span>
                <span className="text-sm font-serif text-pink-300">核心艺术家</span>
              </div>
              <ul className="space-y-1">
                {active.keyFigures.map((f, i) => (
                  <li key={i} className="text-sm text-parchment-100 leading-relaxed">
                    · {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-amber-700/40 bg-amber-950/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🖼️</span>
                <span className="text-sm font-serif text-amber-300">代表作</span>
              </div>
              <ul className="space-y-1">
                {active.keyWorks.map((w, i) => (
                  <li key={i} className="text-sm text-parchment-100 leading-relaxed">
                    · {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 代表画作(可点击放大) */}
          {active.keyWorks.length > 0 && (
            <div className="p-5 rounded-lg bg-ink-800/80 border border-ink-700">
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>🖼️ 代表画作(点击放大)</span>
                <span className="text-ink-600 normal-case">{active.keyWorks.length} 件</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {active.keyWorks.map((work, i) => {
                  // 用 imageKeywords[i] 作为精确英文搜索关键词(由 nlm 提取)
                  // 降级:用 work 本身作为关键词
                  const kw = active.imageKeywords?.[i] || work
                  const thumbUrl = bingImage(`${kw} painting`, 320, 240)
                  const fullUrl = bingImage(`${kw} painting`, 1280, 960)
                  return (
                    <button
                      key={i}
                      onClick={() => setLightbox({
                        url: fullUrl,
                        caption: work,
                        source: `《${active.title}》 · ${source}`,
                      })}
                      className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-ink-700 hover:border-pink-500/70 transition-all cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                      title={work}
                    >
                      <img
                        src={thumbUrl}
                        alt={work}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement
                          el.style.display = 'none'
                          el.parentElement?.classList.add('bg-ink-900')
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <div className="text-xs text-parchment-50 font-serif line-clamp-2 leading-tight">
                          {work}
                        </div>
                      </div>
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink-900/70 backdrop-blur flex items-center justify-center text-pink-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        🔍
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="text-xs text-ink-500 mt-3 italic">
                * 配图由 Bing 搜索(精确英文标题),点击放大查看
              </div>
            </div>
          )}

          {/* Lightbox 弹窗 */}
          {lightbox && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/90 backdrop-blur-md p-4 cursor-zoom-out"
              onClick={() => setLightbox(null)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation()
                  setLightbox(null)
                }
              }}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
            >
              <div
                className="relative max-w-5xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={lightbox.url}
                  alt={lightbox.caption}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
                <div className="mt-3 text-center">
                  <div className="text-base font-serif text-parchment-50">{lightbox.caption}</div>
                  <div className="text-xs text-ink-400 mt-1">来源:{lightbox.source}</div>
                  <div className="text-xs text-ink-500 mt-2">点击背景或按 ESC 关闭</div>
                </div>
                <button
                  onClick={() => setLightbox(null)}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-ink-800 text-parchment-50 hover:bg-pink-600 transition-colors flex items-center justify-center text-lg leading-none shadow-lg"
                  aria-label="关闭"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* 风格标签 */}
          <div className="p-3 rounded-lg bg-ink-800/80 border border-ink-700 flex items-center gap-3">
            <span className="text-xs text-ink-500 uppercase tracking-wider shrink-0">🎭 艺术风格</span>
            <span
              className="px-3 py-1 rounded-full text-xs font-serif"
              style={{ backgroundColor: `${topicColor}33`, color: topicColor, border: `1px solid ${topicColor}66` }}
            >
              {active.style}
            </span>
          </div>

          {/* 关键要点 */}
          <div className="p-5 rounded-lg bg-ink-800/80 border border-ink-700">
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-3">📌 关键要点</div>
            <ul className="space-y-2">
              {active.keyPoints.map((kp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-parchment-100 leading-relaxed">
                  <span className="mt-0.5 shrink-0" style={{ color: topicColor }}>▸</span>
                  <span>{kp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 关键时间线 */}
          {active.timeline && active.timeline.length > 0 && (
            <div className="p-5 rounded-lg bg-ink-800/80 border border-ink-700">
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-3">⏳ 关键时间线</div>
              <ol className="relative border-l-2 ml-2 space-y-3" style={{ borderColor: `${topicColor}66` }}>
                {active.timeline.map((t, i) => (
                  <li key={i} className="pl-5 relative">
                    <span
                      className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ring-2 ring-ink-800"
                      style={{ backgroundColor: topicColor }}
                    />
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-mono shrink-0 tabular-nums" style={{ color: topicColor }}>
                        {t.year < 0 ? `公元前 ${-t.year}` : t.year}
                      </span>
                      <span className="text-sm text-parchment-100 leading-relaxed">{t.event}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 历史意义 */}
          <div className="p-5 rounded-lg bg-gradient-to-br from-emerald-950/30 to-ink-800 border border-emerald-700/40">
            <div className="text-xs text-emerald-400 uppercase tracking-wider mb-3">🌍 历史意义</div>
            <p className="text-sm text-parchment-100 leading-relaxed">{active.significance}</p>
          </div>

          {/* 课程笔记全文(来自 NotebookLM 抽取) */}
          {active.fullText && active.fullText.trim() && (
            <details className="group rounded-lg bg-ink-800/80 border border-pink-700/40 overflow-hidden">
              <summary className="cursor-pointer select-none px-5 py-3 text-xs text-pink-300 uppercase tracking-wider hover:bg-ink-700/40 transition-colors flex items-center justify-between">
                <span>📖 课程笔记全文(来自 NotebookLM)</span>
                <span className="text-ink-500 group-open:rotate-90 transition-transform">▶</span>
              </summary>
              <div className="px-5 pb-5 pt-2 border-t border-ink-700/60">
                <pre className="text-sm text-parchment-100 leading-relaxed whitespace-pre-wrap font-sans">
                  {active.fullText}
                </pre>
              </div>
            </details>
          )}

          {/* 上下节导航 */}
          <div className="flex items-center justify-between pt-3 border-t border-ink-700">
            <div className="flex items-center gap-2">
              {(() => {
                const prev = activeIdx > 0 ? lessons[activeIdx - 1] : null
                const next = activeIdx < lessons.length - 1 ? lessons[activeIdx + 1] : null
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