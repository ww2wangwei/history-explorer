/**
 * WorldHistoryOverview — 少年世界史(全文明)161 节
 *
 * 99 集正课 + 57 个番外/答疑专题 + 5 个罕见史料(NotebookLM 转写提取)。
 * - 复用 OverviewLayout
 * - 左侧:按组(正课/番外/罕见史料)分组的章节列表(可搜索)
 * - 右侧:章节详情(摘要/时代/关键人物/关键事件/要点/时间线/历史意义/全文/配图)
 * - 配图用 bingImage + imageKeywords 生成代表图,可点击放大
 *
 * 数据:src/data/youth-world-history.json
 * 由 Layout.tsx 用 lazy + Suspense 包裹。
 */
import { useEffect, useMemo, useState } from 'react'
import worldData from '@/data/youth-world-history.json'
import { useLearningPathStore } from '@/store/useLearningPathStore'
import { useAIStore } from '@/store/useAIStore'
import OverviewLayout from '@/components/ui/OverviewLayout'
import { audioEngine } from '@/utils/audioEngine'
import { bingImage } from '@/utils/geoImage'
import { resolveAsset } from '@/utils/asset'

type TimelineEvent = { year: number; yearLabel?: string; event: string }

type Lesson = {
  id: string
  group: 'main' | 'bonus' | 'rare'
  title: string
  era: string
  summary: string
  keyFigures: string[]
  keyEvents: string[]
  keyPoints: string[]
  timeline: TimelineEvent[]
  significance: string
  fullText?: string
  imageKeywords?: string[]
  infographic?: string
}

const lessons = (worldData as { lessons: Lesson[] }).lessons
const title = (worldData as { title: string }).title
const subtitle = (worldData as { subtitle: string }).subtitle
const intro = (worldData as { _intro: string })._intro
const source = (worldData as { _source: string })._source

// 分组配色:正课(琥珀金)/番外(青蓝)/罕见史料(紫)
const GROUP_META: Record<Lesson['group'], { label: string; color: string }> = {
  main: { label: '正课', color: '#d4a85b' },
  bonus: { label: '番外·人物专题', color: '#5b9bc8' },
  rare: { label: '罕见史料', color: '#9b7eb6' },
}

interface Props {
  isActive: boolean
  onClose: () => void
}

export default function WorldHistoryOverview({ isActive, onClose }: Props) {
  const [activeId, setActiveId] = useState<string>(lessons[0].id)
  const [query, setQuery] = useState('')
  const [lightbox, setLightbox] = useState<{ url: string; caption: string; source: string } | null>(null)

  const markVisited = useLearningPathStore(s => s.markWorldHistoryVisited)
  const visitedLessonIds = useLearningPathStore(s => s.progressByPath.worldHistory.visitedLessonIds) ?? []
  const setContext = useAIStore(s => s.setContext)
  const setPersonaPrompt = useAIStore(s => s.setPersonaPrompt)
  const newThread = useAIStore(s => s.newThread)
  const openPanel = useAIStore(s => s.openPanel)

  useEffect(() => {
    if (isActive) audioEngine.playModalOpen()
  }, [isActive])

  useEffect(() => {
    if (isActive && activeId) markVisited(activeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return lessons
    return lessons.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.era.toLowerCase().includes(q) ||
      l.summary.toLowerCase().includes(q) ||
      l.keyFigures.some(f => f.toLowerCase().includes(q)) ||
      l.keyEvents.some(e => e.toLowerCase().includes(q))
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
      const el = document.querySelector('[data-world-detail-top]')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleAskAI = () => {
    setContext(null, null, null)
    setPersonaPrompt(
      `你是世界史讲师,正在讲解"少年世界史"第 ${activeIdx + 1} 节: ${active.title}(${active.era})。` +
      `请基于以下要点展开: ${active.summary}` +
      `关键人物: ${active.keyFigures.join('、')}; 关键事件: ${active.keyEvents.join('、')}。` +
      `请用通俗语言、面向青少年,举 1-2 个具体例子, 300-500 字回答。`
    )
    newThread(`世界史: ${active.title}`)
    openPanel()
  }

  if (!isActive) return null

  const groupMeta = GROUP_META[active.group] ?? GROUP_META.main
  const groupColor = groupMeta.color
  // 优先用本地信息图作封面，否则用 imageKeywords[0] 生成 Bing 图
  const coverKeyword = active.imageKeywords?.[0]
    ? active.imageKeywords[0]
    : `${active.title} ${active.keyEvents[0] ?? ''}`
  const cover = active.infographic ? resolveAsset(active.infographic) : bingImage(coverKeyword, 800, 300)

  return (
    <OverviewLayout
      emoji="🌍"
      title={title}
      subtitle={
        <>
          {subtitle} · <span className="text-vermilion-300">{source}</span> · 已读{' '}
          <span className="text-vermilion-300">{visitedCount}</span> / {totalCount} ({pPct}%)
        </>
      }
      onClose={onClose}
      headerBorderClass="border-amber-500/30"
    >
      {/* 顶部 intro 卡片 */}
      <div className="mb-5 p-4 rounded-lg bg-gradient-to-br from-amber-950/30 to-ink-800 border border-amber-700/40">
        <div className="text-xs text-amber-300 uppercase tracking-wider mb-2">🌐 课程导言</div>
        <p className="text-sm text-parchment-50 leading-relaxed">{intro}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* 左侧:章节列表 */}
        <aside className="space-y-3">
          <input
            type="text"
            placeholder="🔍 搜索课程/人物/事件..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-ink-700 border border-ink-600 text-sm text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-amber-500"
          />
          <div className="text-xs text-ink-300 px-1">
            {filtered.length} / {lessons.length} 节
          </div>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto scrollbar-thin pr-1">
            {filtered.map((l) => {
              const isActive = l.id === activeId
              const isVisited = visitedLessonIds.includes(l.id)
              const color = GROUP_META[l.group].color
              return (
                <button
                  key={l.id}
                  onClick={() => handleSelect(l.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-amber-700/30 border-amber-500/70 text-parchment-50'
                      : isVisited
                      ? 'bg-ink-800/80 border-emerald-700/40 text-ink-300 hover:border-amber-500/60'
                      : 'bg-ink-800/40 border-ink-700 text-ink-400 hover:border-amber-500/40 hover:text-parchment-50'
                  }`}
                  style={{ borderLeftWidth: '3px', borderLeftColor: color }}
                >
                  <div className="flex items-start gap-2">
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-serif ${
                      isActive ? 'bg-amber-500 text-ink-900' : isVisited ? 'bg-emerald-700/40 text-emerald-300' : 'bg-ink-700 text-ink-300'
                    }`}>
                      {isVisited && !isActive ? '✓' : lessons.findIndex(x => x.id === l.id) + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs mb-0.5" style={{ color }}>
                        {GROUP_META[l.group].label}
                      </div>
                      <div className="text-sm font-serif leading-snug">{l.title}</div>
                      <div className="text-xs text-ink-300 mt-0.5">{l.era}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* 右侧:详情 */}
        <main data-world-detail-top className="space-y-4">
          {/* 顶部进度条 */}
          <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all bg-gradient-to-r from-amber-500 to-amber-300"
              style={{ width: `${pPct}%` }}
            />
          </div>

          {/* 章节标题 + 配图 */}
          <div
            className="rounded-lg overflow-hidden border"
            style={{ borderColor: `${groupColor}66` }}
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
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: groupColor }}>
                  第 {activeIdx + 1} 节 · {GROUP_META[active.group].label} · {active.era}
                </div>
                <h2 className="text-2xl font-serif text-parchment-50 mb-2">{active.title}</h2>
                <p className="text-sm text-parchment-50 leading-relaxed">{active.summary}</p>
              </div>
            </div>
          </div>

          {/* 关键人物 + 关键事件 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-lg border border-amber-700/40 bg-amber-950/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👑</span>
                <span className="text-sm font-serif text-amber-300">关键人物</span>
              </div>
              <ul className="space-y-1">
                {active.keyFigures.map((f, i) => (
                  <li key={i} className="text-sm text-parchment-50 leading-relaxed">
                    · {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-sky-700/40 bg-sky-950/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏛️</span>
                <span className="text-sm font-serif text-sky-300">关键事件/名词</span>
              </div>
              <ul className="space-y-1">
                {active.keyEvents.map((w, i) => (
                  <li key={i} className="text-sm text-parchment-50 leading-relaxed">
                    · {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* NotebookLM 课程信息图(可点击放大) */}
          {active.infographic && (
            <div className="p-5 rounded-lg bg-ink-800/80 border border-amber-700/40">
              <div className="text-xs text-amber-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>📊 课程信息图(NotebookLM)</span>
                <button
                  onClick={() => setLightbox({
                    url: resolveAsset(active.infographic!),
                    caption: active.title,
                    source: `《${active.title}》 · 少年世界史信息图`,
                  })}
                  className="text-xs text-amber-400 hover:text-amber-200 transition-colors cursor-zoom-in"
                >
                  点击放大 🔍
                </button>
              </div>
              <button
                onClick={() => setLightbox({
                  url: resolveAsset(active.infographic!),
                  caption: active.title,
                  source: `《${active.title}》 · 少年世界史信息图`,
                })}
                className="block w-full rounded-lg overflow-hidden border border-amber-800/50 hover:border-amber-500/70 transition-all cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <img
                  src={resolveAsset(active.infographic)}
                  alt={`${active.title} 信息图`}
                  loading="lazy"
                  className="w-full h-auto"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement
                    el.style.display = 'none'
                    el.parentElement?.classList.add('hidden')
                  }}
                />
              </button>
              <div className="text-xs text-ink-300 mt-2 italic">
                * 由 NotebookLM 基于本课内容自动生成的图文信息图
              </div>
            </div>
          )}

          {/* 代表场景图(可点击放大) */}
          {active.imageKeywords && active.imageKeywords.length > 0 && (
            <div className="p-5 rounded-lg bg-ink-800/80 border border-ink-700">
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>🌄 代表场景(点击放大)</span>
                <span className="text-ink-400 normal-case">{active.imageKeywords.length} 幅</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {active.imageKeywords.map((kw, i) => {
                  const thumbUrl = bingImage(kw, 320, 240)
                  const fullUrl = bingImage(kw, 1280, 960)
                  const caption = kw.split(' ').slice(0, 3).join(' ')
                  return (
                    <button
                      key={i}
                      onClick={() => setLightbox({
                        url: fullUrl,
                        caption: caption,
                        source: `《${active.title}》 · ${source}`,
                      })}
                      className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-ink-700 hover:border-amber-500/70 transition-all cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      title={caption}
                    >
                      <img
                        src={thumbUrl}
                        alt={caption}
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
                          {caption}
                        </div>
                      </div>
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink-900/70 backdrop-blur flex items-center justify-center text-amber-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        🔍
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="text-xs text-ink-300 mt-3 italic">
                * 配图由 Bing 搜索(英文关键词),点击放大查看
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
                  <div className="text-xs text-ink-300 mt-2">点击背景或按 ESC 关闭</div>
                </div>
                <button
                  onClick={() => setLightbox(null)}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-ink-800 text-parchment-50 hover:bg-amber-600 transition-colors flex items-center justify-center text-lg leading-none shadow-lg"
                  aria-label="关闭"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* 关键要点 */}
          <div className="p-5 rounded-lg bg-ink-800/80 border border-ink-700">
            <div className="text-xs text-ink-300 uppercase tracking-wider mb-3">📌 关键要点</div>
            <ul className="space-y-2">
              {active.keyPoints.map((kp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-parchment-50 leading-relaxed">
                  <span className="mt-0.5 shrink-0" style={{ color: groupColor }}>▸</span>
                  <span>{kp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 关键时间线 */}
          {active.timeline && active.timeline.length > 0 && (
            <div className="p-5 rounded-lg bg-ink-800/80 border border-ink-700">
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-3">⏳ 关键时间线</div>
              <ol className="relative border-l-2 ml-2 space-y-3" style={{ borderColor: `${groupColor}66` }}>
                {active.timeline.map((t, i) => (
                  <li key={i} className="pl-5 relative">
                    <span
                      className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ring-2 ring-ink-800"
                      style={{ backgroundColor: groupColor }}
                    />
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-mono shrink-0 tabular-nums" style={{ color: groupColor }}>
                        {t.yearLabel || (t.year < 0 ? `公元前 ${-t.year}` : t.year)}
                      </span>
                      <span className="text-sm text-parchment-50 leading-relaxed">{t.event}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 历史意义 */}
          <div className="p-5 rounded-lg bg-gradient-to-br from-emerald-950/30 to-ink-800 border border-emerald-700/40">
            <div className="text-xs text-emerald-400 uppercase tracking-wider mb-3">🌍 历史意义</div>
            <p className="text-sm text-parchment-50 leading-relaxed">{active.significance}</p>
          </div>

          {/* 课程笔记全文(来自 NotebookLM 抽取) */}
          {active.fullText && active.fullText.trim() && (
            <details className="group rounded-lg bg-ink-800/80 border border-amber-700/40 overflow-hidden">
              <summary className="cursor-pointer select-none px-5 py-3 text-xs text-amber-300 uppercase tracking-wider hover:bg-ink-700/40 transition-colors flex items-center justify-between">
                <span>📖 课程笔记全文(来自 NotebookLM)</span>
                <span className="text-ink-300 group-open:rotate-90 transition-transform">▶</span>
              </summary>
              <div className="px-5 pb-5 pt-2 border-t border-ink-700/60">
                <pre className="text-sm text-parchment-50 leading-relaxed whitespace-pre-wrap font-sans">
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
