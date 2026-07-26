/**
 * 学习引导 Dashboard
 *
 * 用户进应用的"主页" — 提供：
 *   1. 欢迎 + 当前学习位置
 *   2. 学习进度概览
 *   3. 学习路径卡片
 *   4. 智能"下一步"推荐
 *
 * 快速学习 / 关键大事详情两个 Modal 已抽到 ./QuickLearn/EraQuickLearnModal.tsx
 */
import { useMemo, useState, useEffect, useRef } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useCardsStore } from '@/store/useCardsStore'
import { useAIStore } from '@/store/useAIStore'
import { countTodayReviews } from '@/utils/cardStats'
import { bingImage, fallbackKeyword } from '@/utils/geoImage'
import { summarizeEra } from '@/utils/summarize'
import { useJumpToMap } from '@/hooks/useJumpToMap'
import { useGoalStore } from '@/store/useGoalStore'
import { useLearningPathStore, type PathId } from '@/store/useLearningPathStore'
import { useCountUp } from '@/hooks/useCountUp'
import gsap from 'gsap'
import { isDue } from '@/utils/sm2'
import erasData from '@/data/eras.json'
import type { Era } from '@/types'
import EraQuickLearnModal, { type QuickEventState } from './QuickLearn/EraQuickLearnModal'

const eras = erasData as Era[]

interface Props {
  isActive: boolean
  onEnterMap: () => void
  onEnterPath: (pathId: PathId, eraId?: string) => void
}

const PATHS: { id: PathId; icon: string; title: string; desc: string; color: string }[] = [
  { id: 'timeline', icon: '📜', title: '朝代时间线', desc: '按时间顺序学习每个朝代', color: '#c89a5b' },
  { id: 'allFigures', icon: '👥', title: '全人物', desc: '浏览 26+ 位历史人物并与 AI 对话', color: '#9b7eb6' },
  { id: 'allWars', icon: '⚔️', title: '全战争', desc: '从武王伐纣到现代的关键战争 75 场', color: '#b85450' },
  { id: 'allCultures', icon: '📚', title: '全文化', desc: '思想家、文学家、宗教人物的代表作品', color: '#5b9bc8' },
  { id: 'allGeography', icon: '🗺️', title: '全地理', desc: '自然地理特征 + 疆域变迁', color: '#5bc89a' },
  { id: 'timeTravel', icon: '🎭', title: '穿越历史', desc: '化身历史人物，在关键节点做选择', color: '#9b7eb6' },
  { id: 'review', icon: '🎯', title: '今日复习', desc: '基于 SM-2 算法的间隔复习', color: '#9bc89a' },
]

export default function Dashboard({ isActive, onEnterMap, onEnterPath }: Props) {
  const currentYear = useHistoryStore(s => s.currentYear)
  const setYear = useHistoryStore(s => s.setYear)
  const selectEra = useHistoryStore(s => s.selectEra)
  const selectEvent = useHistoryStore(s => s.selectEvent)
  const eraSelectionHistory = useHistoryStore(s => s.eraSelectionHistory)

  const goal = useGoalStore(s => s.target)
  const cardsArr = useCardsStore(s => s.cards)

  const [learnEraId, setLearnEraId] = useState<string | null>(null)
  const [selectedQuickEvent, setSelectedQuickEvent] = useState<QuickEventState | null>(null)
  const jumpToMap = useJumpToMap()
  const [showEraList, setShowEraList] = useState(false)

  const learnEra: Era | null = learnEraId ? (eras.find(e => e.id === learnEraId) ?? null) : null
  const welcomeTitleRef = useRef<HTMLDivElement | null>(null)
  const pathCardsRef = useRef<HTMLDivElement | null>(null)
  const statCardsRef = useRef<HTMLDivElement | null>(null)

  const sortedEras = useMemo(
    () => eras.slice().sort((a, b) => a.startYear - b.startYear),
    []
  )

  const openQuickLearn = (eraId: string) => {
    setLearnEraId(eraId)
    recordVisit('timeline', eraId)
  }
  const closeQuickLearn = () => setLearnEraId(null)

  // 🎯 pendingReopen → 还原 Modal 状态
  useEffect(() => {
    const current = useHistoryStore.getState().pendingReopen
    if (current?.kind === 'quickEvent') {
      openQuickLearn(current.eraId)
      setTimeout(() => {
        setSelectedQuickEvent(current.event)
        useHistoryStore.getState().setPendingReopen(null)
      }, 80)
    } else if (current?.kind === 'event') {
      selectEvent(current.eventId)
      useHistoryStore.getState().setPendingReopen(null)
    }
    return useHistoryStore.subscribe((s, prev) => {
      const target = s.pendingReopen
      if (!target || target === prev.pendingReopen) return
      if (target.kind === 'quickEvent') {
        openQuickLearn(target.eraId)
        setTimeout(() => {
          setSelectedQuickEvent(target.event)
          useHistoryStore.getState().setPendingReopen(null)
        }, 60)
      } else if (target.kind === 'event') {
        selectEvent(target.eventId)
        useHistoryStore.getState().setPendingReopen(null)
      }
    })
  }, [])

  const learnIdx = learnEraId ? sortedEras.findIndex(e => e.id === learnEraId) : -1
  const prevLearnEra = learnIdx > 0 ? sortedEras[learnIdx - 1] : null
  const nextLearnEra = learnIdx >= 0 && learnIdx < sortedEras.length - 1 ? sortedEras[learnIdx + 1] : null

  const markLearned = () => {
    if (learnEra) recordVisit('timeline', learnEra.id)
  }

  // GSAP hover: 学习路径卡片
  useEffect(() => {
    if (!pathCardsRef.current) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const container = pathCardsRef.current
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.path-card')
      gsap.from(cards, { opacity: 0, y: 24, duration: 0.55, stagger: 0.07, ease: 'power3.out' })
      cards.forEach(card => {
        const enter = () => gsap.to(card, { y: -4, scale: 1.02, duration: 0.25, ease: 'power2.out' })
        const leave = () => gsap.to(card, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' })
        card.addEventListener('mouseenter', enter)
        card.addEventListener('mouseleave', leave)
        return () => {
          card.removeEventListener('mouseenter', enter)
          card.removeEventListener('mouseleave', leave)
        }
      })
    }, container)
    return () => ctx.revert()
  }, [])

  // GSAP fly-in: 欢迎标题
  useEffect(() => {
    if (!welcomeTitleRef.current) return
    const el = welcomeTitleRef.current
    const h1 = el.querySelector('h1')
    const p = el.querySelector('p')
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      gsap.set([h1, p], { autoAlpha: 1 })
      return
    }
    gsap.set([h1, p], { autoAlpha: 0, y: 14 })
    const tl = gsap.timeline()
    tl.to(h1, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' })
      .to(p, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
    return () => { tl.kill() }
  }, [currentYear])

  const todayCount = useMemo(() => countTodayReviews(cardsArr), [cardsArr])
  const cardsCount = useMemo(() => Object.keys(cardsArr).length, [cardsArr])
  const dueCount = useMemo(() => {
    const now = Date.now()
    return Object.values(cardsArr).filter(c => isDue(c, now)).length
  }, [cardsArr])

  const progressByPath = useLearningPathStore(s => s.progressByPath)
  const recommendNext = useLearningPathStore(s => s.recommendNext)
  const recordVisit = useLearningPathStore(s => s.recordVisit)

  const recommendation = useMemo(
    () => recommendNext(currentYear, useHistoryStore.getState().selectedEraId, eraSelectionHistory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentYear, eraSelectionHistory],
  )

  const learnedInTimeline = progressByPath.timeline.visitedEraIds.length
  const xrefVisitedCount = progressByPath.crossReference.visitedEraIds.length

  // StatCard stagger
  useEffect(() => {
    if (!isActive || !statCardsRef.current) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const cards = statCardsRef.current.querySelectorAll<HTMLElement>(':scope > div')
    if (!cards.length) return
    gsap.from(cards, {
      opacity: 0, y: 16, scale: 0.95,
      duration: 0.45, stagger: 0.08, ease: 'back.out(1.2)',
    })
  }, [isActive, learnedInTimeline, xrefVisitedCount, cardsCount, dueCount])

  if (!isActive) return null

  const goalPct = Math.min(100, Math.round((todayCount / Math.max(1, goal)) * 100))
  const totalEras = eras.length

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-thin bg-ink-900 paper-texture vignette">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 欢迎标题 */}
        <div ref={welcomeTitleRef} className="mb-8">
          <h1 className="text-display font-serif text-bronze-300 mb-2 title-underline inline-block">📜 历史探索者</h1>
          <p className="text-ink-400 text-sm leading-relaxed">
            从 {currentYear < 0 ? `公元前${-currentYear}` : currentYear} 年开始，
            系统地学习中国和世界的 50 个朝代 + 251 个历史事件。
          </p>
        </div>

        {/* 智能推荐 */}
        {recommendation && (
          <div
            className="mb-6 p-5 rounded-lg border border-bronze-500/40 bg-gradient-to-r from-bronze-900/30 to-ink-800/80 cursor-pointer hover:border-bronze-400 transition-colors shine-on-hover focus-ring depth-2"
            onClick={() => {
              selectEra(recommendation.eraId)
              recordVisit('timeline', recommendation.eraId)
              if (recommendation.era.capital && Array.isArray(recommendation.era.capital)) {
                jumpToMap(
                  recommendation.era.capital as [number, number],
                  `${recommendation.era.name} 都城`,
                  2,
                  {
                    coverImageUrl: bingImage(fallbackKeyword(recommendation.era.name, recommendation.era.region), 400, 240),
                    snippet: summarizeEra(recommendation.era),
                    reopenLabel: `${recommendation.era.name} 都城`,
                    eraId: recommendation.era.id,
                    eventYear: recommendation.era.startYear,
                  }
                )
              } else {
                onEnterMap()
              }
            }}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">👉</div>
              <div className="flex-1">
                <div className="text-xs text-ink-500 mb-1">智能推荐 · 下一步</div>
                <div className="text-lg font-serif text-bronze-300 mb-1">
                  {recommendation.era.name}
                  <span className="ml-2 text-xs text-ink-400">
                    ({recommendation.era.startYear < 0 ? `公元前${-recommendation.era.startYear}` : recommendation.era.startYear}
                    {' ~ '}
                    {recommendation.era.endYear < 0 ? `公元前${-recommendation.era.endYear}` : recommendation.era.endYear} 年)
                  </span>
                </div>
                <div className="text-xs text-ink-500">{recommendation.reason}</div>
              </div>
              <div className="text-bronze-400 text-2xl flex-shrink-0">→</div>
            </div>
          </div>
        )}

        {/* 进度概览 */}
        <div ref={statCardsRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard icon="📜" label="已学朝代（时间线）" value={`${learnedInTimeline} / ${totalEras}`} hint={`${Math.round((learnedInTimeline / totalEras) * 100)}%`} />
          <StatCard icon="🌍" label="已对照朝代" value={`${progressByPath.crossReference.visitedEraIds.length} / ${totalEras}`} hint={`${Math.round((progressByPath.crossReference.visitedEraIds.length / totalEras) * 100)}%`} />
          <StatCard icon="📝" label="复习卡" value={String(cardsCount)} hint={dueCount > 0 ? `${dueCount} 待复习` : '全掌握！'} />
          <StatCard icon="🎯" label="今日目标" value={`${todayCount} / ${goal}`} hint={`${goalPct}%`} progress={goalPct} />
        </div>

        {/* 学习路径 */}
        <h2 className="text-sm text-ink-500 mb-3 uppercase tracking-wider">选择学习路径</h2>
        <div ref={pathCardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PATHS.filter(p => p.title).map(p => {
            const progress = progressByPath[p.id] ?? { visitedEraIds: [] }
            const visited = p.id === 'allFigures'
              ? (progress.visitedFigureIds?.length ?? 0)
              : progress.visitedEraIds.length
            const total = p.id === 'allFigures' ? 26 : totalEras
            const pPct = total > 0 ? Math.round((visited / total) * 100) : 0
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (p.id === 'timeline') {
                    setShowEraList(true)
                    if (recommendation) recordVisit('timeline', recommendation.eraId)
                  } else {
                    onEnterPath(p.id as PathId)
                  }
                }}
                className="text-left p-5 rounded-lg border border-ink-600 bg-ink-800/60 hover:border-bronze-500 hover:bg-ink-800 transition-all group path-card"
                style={{ borderLeftWidth: '3px', borderLeftColor: p.color }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0" style={{ filter: `drop-shadow(0 0 6px ${p.color}40)` }}>{p.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-serif text-base group-hover:text-bronze-300 transition-colors" style={{ color: p.color }}>
                        {p.title}
                      </div>
                      <div className="text-xs text-ink-500">{pPct}%</div>
                    </div>
                    <div className="text-xs text-ink-400 mb-2">{p.desc}</div>
                    <div className="h-1 bg-ink-700 rounded-lg overflow-hidden">
                      <div className="h-full transition-all" style={{ width: `${pPct}%`, background: p.color }} />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* 快速入口 */}
        <div className="mt-8 flex flex-wrap gap-3 text-xs text-ink-400">
          <button onClick={onEnterMap} className="px-3 py-1.5 rounded-lg border border-ink-600 hover:border-bronze-500 hover:text-bronze-300 transition-colors">
            🗺 进入地图（自由浏览）
          </button>
          <button onClick={() => setYear(0)} className="px-3 py-1.5 rounded-lg border border-ink-600 hover:border-bronze-500 hover:text-bronze-300 transition-colors">
            ⏳ 跳到公元 0 年
          </button>
          <div className="px-3 py-1.5 text-ink-500">
            快捷键 <kbd className="px-1 bg-ink-700 rounded-lg">g</kbd> 地图 · <kbd className="px-1 bg-ink-700 rounded-lg">r</kbd> 图谱
          </div>
        </div>
      </div>

      {/* 朝代选择列表 */}
      {showEraList && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
          onClick={() => setShowEraList(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-bronze-500/40 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="详情"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-ink-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif text-bronze-300">📜 选一个朝代学习</h2>
                <div className="text-xs text-ink-500 mt-0.5">按时间顺序排列。已学的朝代用 <span className="text-green-400">绿色</span> 标记，下一个推荐的用 <span className="text-bronze-400">金色</span> 高亮。</div>
              </div>
              <button
                className="text-ink-500 hover:text-parchment-50 text-2xl leading-none"
                onClick={() => setShowEraList(false)}
                title="关闭 (Esc)"
                aria-label="关闭"
              >×</button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sortedEras.map((era) => {
                  const visited = progressByPath.timeline.visitedEraIds.includes(era.id)
                  const isRecommended = recommendation?.era?.id === era.id
                  const hasQuick = !!era.keyPoints
                  const eraImg = bingImage(`${era.name} ${era.region === 'china' ? 'chinese dynasty' : 'civilization'} ${era.startYear}`, 400, 240)
                  return (
                    <button
                      key={era.id}
                      onClick={() => {
                        setLearnEraId(era.id)
                        recordVisit('timeline', era.id)
                        setShowEraList(false)
                      }}
                      className={`text-left rounded-lg border-2 transition-all overflow-hidden group ${
                        isRecommended
                          ? 'border-bronze-500 hover:border-bronze-400'
                          : visited
                          ? 'border-green-700/50 hover:border-green-500/80'
                          : 'border-ink-600 hover:border-bronze-500/60'
                      }`}
                    >
                      <div className="relative w-full h-28 bg-ink-900">
                        <img
                          src={eraImg}
                          alt={era.name}
                          loading="lazy"
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 flex items-center gap-2">
                          {isRecommended && <span className="text-bronze-300 text-xs bg-bronze-900/70 backdrop-blur px-1.5 py-0.5 rounded-lg">👉 推荐</span>}
                          {visited && <span className="text-green-300 text-xs bg-green-900/70 backdrop-blur px-1.5 py-0.5 rounded-lg">✓ 已学</span>}
                          {!hasQuick && <span className="text-ink-400 text-xs bg-ink-900/70 backdrop-blur px-1.5 py-0.5 rounded-lg">详细</span>}
                          <span className="text-base font-serif flex-1 truncate" style={{ color: era.color }}>
                            {era.name}
                          </span>
                        </div>
                      </div>
                      <div className="px-3 py-2">
                        <div className="text-xs text-ink-400 tabular-nums">
                          {era.startYear < 0 ? `BC ${-era.startYear}` : era.startYear} ~ {era.endYear < 0 ? `BC ${-era.endYear}` : era.endYear} · {era.region === 'china' ? '🇨🇳 中国' : '🌍 世界'}
                        </div>
                        {era.shortDesc && (
                          <div className="text-xs text-ink-300 mt-0.5 line-clamp-2 leading-relaxed">{era.shortDesc}</div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 快速学习 Modal + 关键大事详情（已抽到子组件） */}
      <EraQuickLearnModal
        era={learnEra}
        quickEvent={selectedQuickEvent}
        onClose={closeQuickLearn}
        onCloseQuickEvent={() => setSelectedQuickEvent(null)}
        onOpenQuickEvent={(ev) => setSelectedQuickEvent(ev)}
        onPrev={() => prevLearnEra && setLearnEraId(prevLearnEra.id)}
        onNext={() => nextLearnEra && setLearnEraId(nextLearnEra.id)}
        onMarkLearned={markLearned}
        prevEra={prevLearnEra}
        nextEra={nextLearnEra}
      />
    </div>
  )
}

// ===== StatCard =====

function StatCard({ icon, label, value, hint, progress }: { icon: string; label: string; value: string; hint?: string; progress?: number }) {
  const match = value.match(/^(\d+)(\s*\/\s*(\d+))?$/)
  const mainRef = useCountUp(match ? Number(match[1]) : 0)
  const totalRef = useCountUp(match && match[3] ? Number(match[3]) : 0, { delay: 0.15 })
  const totalStr = match && match[3] ? ' / ' : ''
  const totalEl = match && match[3] ? totalRef : null
  return (
    <div className="p-3 rounded-lg bg-ink-800/60 border border-ink-600 hover:border-bronze-500/60 transition-colors shine-on-hover focus-ring depth-1 hover:depth-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <div className="text-xs text-ink-500 uppercase tracking-wider truncate">{label}</div>
      </div>
      <div className="text-xl font-serif text-parchment-50 tabular-nums">
        <span ref={mainRef}>0</span>
        {match && match[3] && <><span>{totalStr}</span><span ref={totalEl!}>0</span></>}
      </div>
      {hint && (
        <div className={`text-xs mt-0.5 ${progress === 100 ? 'text-green-400' : 'text-ink-500'}`}>{hint}</div>
      )}
      {progress !== undefined && (
        <div className="h-1 bg-ink-700 rounded-lg overflow-hidden mt-1.5">
          <div className="h-full bg-bronze-500" style={{ width: `${progress}%`, transition: 'width 1.2s ease-out' }} />
        </div>
      )}
    </div>
  )
}