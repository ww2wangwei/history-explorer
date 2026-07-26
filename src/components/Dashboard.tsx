/**
 * 学习引导 Dashboard
 *
 * 用户进应用的"主页" — 提供：
 *   1. 欢迎 + 当前学习位置（继续上次）
 *   2. 学习进度概览（已学朝代 / 笔记 / 复习）
 *   3. 4 个学习路径卡片
 *   4. 智能"下一步"推荐
 */
import { useMemo, useState, useEffect, useRef } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useCardsStore } from '@/store/useCardsStore'
import { useNotesStore } from '@/store/useNotesStore'
import { useAIStore } from '@/store/useAIStore'
import { countTodayReviews } from '@/utils/cardStats'
import { getTargetTitle } from '@/utils/lookups'
import { bingImage, fallbackKeyword } from '@/utils/geoImage'
import { summarizeEra } from '@/utils/summarize'
import { useJumpToMap } from '@/hooks/useJumpToMap'
import { useGoalStore } from '@/store/useGoalStore'
import { useLearningPathStore, type PathId } from '@/store/useLearningPathStore'
import ModalShell from '@/components/ui/Modal'
import { useCountUp } from '@/hooks/useCountUp'
import gsap from 'gsap'
import { isDue } from '@/utils/sm2'
import erasData from '@/data/eras.json'
import eventsData from '@/data/events.json'
import peopleData from '@/data/people.json'
import type { Era, FigureCategory, HistoricalEvent, HistoricalFigure } from '@/types'

const eras = erasData as Era[]
const events = eventsData as HistoricalEvent[]
const people = peopleData as HistoricalFigure[]

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
  // 基础订阅（细粒度 selector）
  const currentYear = useHistoryStore(s => s.currentYear)
  const setYear = useHistoryStore(s => s.setYear)
  const selectEra = useHistoryStore(s => s.selectEra)
  const selectEvent = useHistoryStore(s => s.selectEvent)
  const eraSelectionHistory = useHistoryStore(s => s.eraSelectionHistory)

  // 进度数据
  const goal = useGoalStore(s => s.target)
  const cardsArr = useCardsStore(s => s.cards)

  // 快速学习 Modal（朝代时间线路径进入时显示）
  const [learnEraId, setLearnEraId] = useState<string | null>(null)
  // 关键大事详情弹窗（包含 longDesc 用于详情介绍段）
  const [selectedQuickEvent, setSelectedQuickEvent] = useState<{
    year: number
    title: string
    desc?: string
    longDesc?: string
  } | null>(null)
  const aiSetPersona = useAIStore(s => s.setPersonaPrompt)
  const aiNewThread = useAIStore(s => s.newThread)
  const aiOpenPanel = useAIStore(s => s.openPanel)
  const jumpToMap = useJumpToMap()
  const [showEraList, setShowEraList] = useState(false)
  const learnEra = learnEraId ? eras.find(e => e.id === learnEraId) : null
  // 5 件大事时间线容器（已停用 GSAP，保留 ref 兼容）
  const timelineListRef = useRef<HTMLDivElement | null>(null)
  // 学习路径卡片容器 — 用于 hover GSAP 微动
  const pathCardsRef = useRef<HTMLDivElement | null>(null)
  // 欢迎标题容器 — 用于 fly-in + 字符级 stagger 动效
  const welcomeTitleRef = useRef<HTMLDivElement | null>(null)
  // StatCard 容器 — 用于 stagger 入场
  const statCardsRef = useRef<HTMLDivElement | null>(null)
  // 按时间顺序的所有朝代（用于"上一/下一"导航 + 选择列表）
  const sortedEras = useMemo(
    () => eras.slice().sort((a, b) => a.startYear - b.startYear),
    []
  )

  // 朝代时间线路径 — 弹出"快速学习"模态，不进入地图
  const openQuickLearn = (eraId: string) => {
    setLearnEraId(eraId)
    recordVisit('timeline', eraId)
  }
  const closeQuickLearn = () => setLearnEraId(null)

  // 🎯 监听 store.pendingReopen — 浮层「🔙 回到事件」触发
  useEffect(() => {
    // 立即读一次：Dashboard 可能在 pendingReopen 已被 setMapFocus 之后才 mount
    const current = useHistoryStore.getState().pendingReopen
    if (current?.kind === 'quickEvent') {
      openQuickLearn(current.eraId)
      setTimeout(() => {
        setSelectedQuickEvent(current.event)
        useHistoryStore.getState().setPendingReopen(null)
      }, 80)
    } else if (current?.kind === 'event') {
      // 还原 EventDetail
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

  // 上一/下一朝代
  const learnIdx = learnEraId ? sortedEras.findIndex(e => e.id === learnEraId) : -1
  const prevLearnEra = learnIdx > 0 ? sortedEras[learnIdx - 1] : null
  const nextLearnEra = learnIdx >= 0 && learnIdx < sortedEras.length - 1 ? sortedEras[learnIdx + 1] : null

  // 标记为已学 — 写 progressByPath
  const markLearned = () => {
    if (learnEra) {
      recordVisit('timeline', learnEra.id)
    }
  }

  // 跳到下一朝代
  const gotoNextLearn = () => {
    if (nextLearnEra) setLearnEraId(nextLearnEra.id)
  }
  const gotoPrevLearn = () => {
    if (prevLearnEra) setLearnEraId(prevLearnEra.id)
  }

  // 详情页时间线 —— 不再使用 GSAP stagger（详情页立即显示）

  // GSAP hover: 学习路径卡片的 hover 微弹 + 进入动画
  useEffect(() => {
    if (!pathCardsRef.current) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const container = pathCardsRef.current
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.path-card')
      // 入场：从下弹入，stagger
      gsap.from(cards, {
        opacity: 0, y: 24, duration: 0.55, stagger: 0.07, ease: 'power3.out',
      })
      // hover 微动：每张卡 mouseenter 微弹
      cards.forEach(card => {
        const enter = () => gsap.to(card, { y: -4, scale: 1.02, duration: 0.25, ease: 'power2.out' })
        const leave = () => gsap.to(card, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' })
        card.addEventListener('mouseenter', enter)
        card.addEventListener('mouseleave', leave)
        // cleanup 通过 gsap.context 自动 revert
        return () => {
          card.removeEventListener('mouseenter', enter)
          card.removeEventListener('mouseleave', leave)
        }
      })
    }, container)
    return () => ctx.revert()
  }, [])

  // GSAP fly-in：欢迎标题进入时主标题+副标题分两段淡入
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

  // ⚠️ 旧逻辑：StatCard stagger 用到 learnedInTimeline 等变量，已删除（变量在 if (!isActive) 之后声明，会触发 hoisting 错误）

  const todayCount = useMemo(() => countTodayReviews(cardsArr), [cardsArr])
  const cardsCount = useMemo(() => Object.keys(cardsArr).length, [cardsArr])
  const dueCount = useMemo(() => {
    const now = Date.now()
    return Object.values(cardsArr).filter(c => isDue(c, now)).length
  }, [cardsArr])

  // 学习路径进度
  const progressByPath = useLearningPathStore(s => s.progressByPath)
  const recommendNext = useLearningPathStore(s => s.recommendNext)
  const recordVisit = useLearningPathStore(s => s.recordVisit)

  // 计算推荐（仅依赖稳定值）
  const recommendation = useMemo(
    () => recommendNext(currentYear, useHistoryStore.getState().selectedEraId, eraSelectionHistory),
    // 故意省 deps（详见注释：不想在 selectedEraId 变化时重渲染 dashboard 自身）
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentYear, eraSelectionHistory],
  )

  // 学习进度派生值（供 StatCard 入场动画依赖，须在任何早返回之前声明）
  const learnedInTimeline = progressByPath.timeline.visitedEraIds.length
  const xrefVisitedCount = progressByPath.crossReference.visitedEraIds.length

  // GSAP stagger: StatCard 4 张卡片依次入场
  // 关键：hook 必须在 `if (!isActive) return null` 之前调用（Rules of Hooks）。
  // 未激活时 statCardsRef 为 null，effect 内部提前 return，行为等价。
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

  // 今日目标完成度
  const goalPct = Math.min(100, Math.round((todayCount / Math.max(1, goal)) * 100))
  const totalEras = eras.length
  // learnedInXref 不再作为 Dashboard 独立统计指标（进入 EraDetail 即触发 recordVisit）

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-thin bg-ink-900 paper-texture vignette">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 欢迎标题 —— GSAP fly-in */}
        <div ref={welcomeTitleRef} className="mb-8">
          <h1 className="text-display font-serif text-bronze-300 mb-2 title-underline inline-block">📜 历史探索者</h1>
          <p className="text-ink-400 text-sm leading-relaxed">
            从 {currentYear < 0 ? `公元前${-currentYear}` : currentYear} 年开始，
            系统地学习中国和世界的 50 个朝代 + 251 个历史事件。
          </p>
        </div>

        {/* 继续上次 */}
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
          {/* 已对照朝代（进入 EraDetail 即累计）— 数据来自 progressByPath.crossReference */}
          <StatCard icon="🌍" label="已对照朝代" value={`${progressByPath.crossReference.visitedEraIds.length} / ${totalEras}`} hint={`${Math.round((progressByPath.crossReference.visitedEraIds.length / totalEras) * 100)}%`} />
          <StatCard icon="📝" label="复习卡" value={String(cardsCount)} hint={dueCount > 0 ? `${dueCount} 待复习` : '全掌握！'} />
          <StatCard icon="🎯" label="今日目标" value={`${todayCount} / ${goal}`} hint={`${goalPct}%`} progress={goalPct} />
        </div>

        {/* 学习路径 */}
        <h2 className="text-sm text-ink-500 mb-3 uppercase tracking-wider">选择学习路径</h2>
        <div ref={pathCardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PATHS.filter(p => p.title).map(p => {
            const progress = progressByPath[p.id] ?? { visitedEraIds: [] }
            // allFigures 用 visitedFigureIds，其他用 visitedEraIds
            const visited = p.id === 'allFigures'
              ? (progress.visitedFigureIds?.length ?? 0)
              : progress.visitedEraIds.length
            const total = p.id === 'allFigures' ? 26 : totalEras
            const pPct = total > 0 ? Math.round((visited / total) * 100) : 0
            return (
              <button
                key={p.id}
                onClick={() => {
                  // 路径进入策略：
                  // - 朝代时间线：弹朝代选择列表 → 用户选后进 QuickLearnModal
                  // - 其他路径（全人物/全战争/全文化/全地理/今日复习）：直接进对应全屏浏览页
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

      {/* 📜 朝代时间线 — 朝代选择列表 */}
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
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sortedEras.map((era, idx) => {
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
                          <span
                            className="text-base font-serif flex-1 truncate"
                            style={{ color: era.color }}
                          >
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

      {/* 全人物路径已统一到 FiguresOverview 全屏页（不再需要 modal） */}

      {/* 🚀 快速学习 Modal（朝代时间线路径） */}
      {learnEra && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
          onClick={closeQuickLearn}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-bronze-500/40 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="详情"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-ink-600 px-6 py-4 flex items-start justify-between">
              <div>
                <div className="text-xs text-ink-500 mb-1">
                  {learnEra.region === 'china' ? '中国朝代' : '世界文明'} ·{' '}
                  {learnEra.startYear < 0 ? `BC ${-learnEra.startYear}` : learnEra.startYear} ~ {learnEra.endYear}
                </div>
                <h2 className="text-2xl font-serif" style={{ color: learnEra.color }}>
                  {learnEra.name}
                </h2>
                {learnEra.shortDesc && (
                  <div className="text-sm text-ink-400 mt-1 italic">{learnEra.shortDesc}</div>
                )}
              </div>
              <button
                className="text-ink-500 hover:text-parchment-50 text-2xl leading-none"
                onClick={closeQuickLearn}
                title="关闭 (Esc)"
                aria-label="关闭"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* 5 个核心要点 */}
              {learnEra.keyPoints && learnEra.keyPoints.length > 0 && (
                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📚 核心要点（5 条）</div>
                  <ol className="text-sm text-parchment-50 space-y-1.5 list-decimal pl-5 marker:text-bronze-500">
                    {learnEra.keyPoints.map((pt, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: renderMarkdownBold(pt) }} />
                    ))}
                  </ol>
                </div>
              )}

              {/* 5 件大事 */}
              {learnEra.quickEvents && learnEra.quickEvents.length > 0 && (
                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📜 5 件关键大事</div>
                  <div ref={timelineListRef} className="relative pl-5">
                    <div className="absolute left-1.5 top-1 bottom-1 w-px bg-bronze-600/40" />
                    {learnEra.quickEvents.map((ev, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedQuickEvent({
                            year: ev.year,
                            title: ev.title,
                            desc: ev.desc,
                            longDesc: ev.longDesc,
                          })
                        }}
                        className="w-full text-left relative pb-3 mb-1 last:pb-0 cursor-pointer rounded-lg border border-transparent hover:border-bronze-500/60 hover:bg-bronze-900/30 transition-colors group p-2 -ml-2"
                        title="点击查看详情"
                        style={{ zIndex: 10 }}
                      >
                        <div className="absolute -left-3.5 top-2.5 w-2 h-2 rounded-full bg-bronze-500 ring-2 ring-ink-900 group-hover:scale-150 transition-transform pointer-events-none" />
                        <div className="text-xs text-bronze-400 tabular-nums">
                          {ev.year < 0 ? `BC ${-ev.year}` : ev.year}
                        </div>
                        <div className="text-sm font-serif text-parchment-50 group-hover:text-bronze-200 transition-colors mt-0.5">{ev.title}</div>
                        {ev.desc && <div className="text-xs text-ink-500 mt-0.5 line-clamp-2">{ev.desc}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 历史意义 */}
              {learnEra.legacy && (
                <div className="p-3 rounded-lg bg-bronze-900/20 border border-bronze-700/40">
                  <div className="text-xs text-bronze-400 uppercase tracking-wider mb-1.5">🎯 历史意义 / 对后世影响</div>
                  <div
                    className="text-sm text-parchment-50 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownBold(learnEra.legacy) }}
                  />
                </div>
              )}

              {/* 朝代连续性 */}
              {learnEra.succession && (learnEra.succession.predecessor || learnEra.succession.successor) && (
                <div className="p-3 rounded-lg bg-ink-700/40 border border-ink-600/60">
                  <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🔗 朝代连续性</div>
                  {learnEra.succession.predecessor && (
                    <div className="text-xs text-ink-300 mb-1">
                      <span className="text-ink-500">← 前承：</span>{learnEra.succession.predecessor}
                    </div>
                  )}
                  {learnEra.succession.successor && (
                    <div className="text-xs text-ink-300">
                      <span className="text-ink-500">后继：</span>{learnEra.succession.successor} →
                    </div>
                  )}
                </div>
              )}

              {/* 描述（如果前面字段没填详细描述，这里 fallback） */}
              {!learnEra.keyPoints && learnEra.description && (
                <p className="text-sm text-parchment-50 leading-relaxed whitespace-pre-line">
                  {learnEra.description}
                </p>
              )}

              {/* 自动生成的"同时期事件"（未填 quickLearn 的朝代也会有内容） */}
              {!learnEra.quickEvents && (
                <AutoEventsInRange eraId={learnEra.id} startYear={learnEra.startYear} endYear={learnEra.endYear} />
              )}

              {/* 自动生成的"同时期世界"（同期其他朝代） */}
              {!learnEra.succession && (
                <AutoContemporaries era={learnEra} allEras={eras} />
              )}

              {/* 📝 已关联笔记（按 target.kind='era' + id 查） */}
              <RelatedNotes eraId={learnEra.id} />

              {/* 🃏 已关联复习卡（按 target.kind='era' + id 查） */}
              <RelatedCards eraId={learnEra.id} />
            </div>

            <div className="sticky bottom-0 z-10 bg-ink-800/95 backdrop-blur border-t border-ink-600 px-6 py-3 flex items-center justify-between">
              <button
                className="px-3 py-1.5 rounded-lg text-xs text-ink-300 hover:text-bronze-300 border border-ink-600 transition-colors"
                onClick={gotoPrevLearn}
                disabled={!prevLearnEra}
                title={prevLearnEra ? `上一朝代：${prevLearnEra.name}` : '已是第一朝代'}
              >
                ← {prevLearnEra?.name ?? '最早'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg text-xs bg-bronze-600/30 text-bronze-300 hover:bg-bronze-600/50 border border-bronze-500/60 transition-colors"
                  onClick={() => {
                    markLearned()
                  }}
                >
                  ✓ 标记已学
                </button>
              </div>
              <button
                className="px-3 py-1.5 rounded-lg text-xs text-ink-300 hover:text-bronze-300 border border-ink-600 transition-colors"
                onClick={gotoNextLearn}
                disabled={!nextLearnEra}
                title={nextLearnEra ? `下一朝代：${nextLearnEra.name}` : '已是最后朝代'}
              >
                {nextLearnEra?.name ?? '最晚'} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 关键大事详情弹窗（升级版：16:9 图片头 + longDesc 详细介绍 + 2x2 信息卡片） */}
      {selectedQuickEvent && learnEra && (() => {
        const yearLabel = selectedQuickEvent.year < 0
          ? `公元前 ${-selectedQuickEvent.year} 年`
          : `${selectedQuickEvent.year} 年`
        // 智能推断事件类型（用于标签展示）
        const eventType = inferEventType(selectedQuickEvent.title)
        // Bing 图片关键词（含 era 名更精准）
        const imgKw = `${selectedQuickEvent.title} ${learnEra.name} historical`
        const eventImg = bingImage(imgKw, 800, 450)
        return (
          <ModalShell
            isOpen
            onClose={() => setSelectedQuickEvent(null)}
            innerStyle={{ borderColor: learnEra.color + '60' }}
          >
              {/* 顶部：16:9 图片头（双层：渐变兜底 + Bing 真实图，加载成功后淡入覆盖） */}
              <div className="relative w-full bg-ink-900" style={{ aspectRatio: '16/9' }}>
                {/* 兜底：渐变 + 事件名首字（始终可见） */}
                <div
                  className="absolute inset-0 flex items-center justify-center select-none"
                  style={{ background: `linear-gradient(135deg, ${learnEra.color}55 0%, ${learnEra.color}22 100%)` }}
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-serif font-bold shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${learnEra.color} 0%, ${learnEra.color}aa 100%)`,
                      color: '#fff',
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      border: '2px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    {selectedQuickEvent.title.charAt(0)}
                  </div>
                </div>
                {/* img：真实 Bing 图（成功加载后淡入覆盖在兜底之上） */}
                <img
                  src={eventImg}
                  alt={selectedQuickEvent.title}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-10"
                  style={{ opacity: 0 }}
                  loading="eager"
                  onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
                />
                {/* 渐变覆盖层（让底部标题清晰可读） */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/30 to-transparent pointer-events-none z-10" />
                {/* 标题 + 元信息覆盖在图片底部 */}
                <div className="absolute bottom-0 left-0 right-0 px-6 pt-8 pb-4 z-20">
                  <div className="text-xs text-bronze-300 mb-1 tracking-wider uppercase">
                    {learnEra.name} · {eventType} · {yearLabel}
                  </div>
                  <h2 className="text-2xl font-serif leading-snug" style={{ color: learnEra.color }}>
                    {selectedQuickEvent.title}
                  </h2>
                </div>
                {/* 关闭按钮 */}
                <button
                  onClick={() => setSelectedQuickEvent(null)}
                  className="absolute top-3 right-3 z-20 text-parchment-50/80 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg bg-ink-900/60 hover:bg-ink-900/80 backdrop-blur"
                  title="关闭 (ESC)"
                  aria-label="关闭"
                >×</button>
              </div>

              {/* 内容区：详细描述 + 一句话简介 + 2x2 信息卡 */}
              <div className="p-6 space-y-4">
                {/* 详细描述（longDesc）— 多段 markdown */}
                {selectedQuickEvent.longDesc ? (
                  <div>
                    <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📖 事件详情</div>
                    <div
                      className="text-sm text-parchment-100 leading-relaxed space-y-2"
                      dangerouslySetInnerHTML={{ __html: renderMarkdownBold(selectedQuickEvent.longDesc) }}
                    />
                  </div>
                ) : selectedQuickEvent.desc ? (
                  // 没 longDesc 就把 desc 升格到详情段落显示
                  <div>
                    <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📖 事件详情</div>
                    <div className="text-sm text-parchment-100 leading-relaxed">
                      {selectedQuickEvent.desc}
                    </div>
                  </div>
                ) : null}

                {/* 一句话简介（highlights）— 当 longDesc 存在时作为补充高亮 */}
                {selectedQuickEvent.longDesc && selectedQuickEvent.desc && (
                  <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
                    <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">📋 一句话简介</div>
                    <div className="text-sm text-bronze-300 font-serif italic">{selectedQuickEvent.desc}</div>
                  </div>
                )}

                {/* 上下文 2x2 信息卡：所属文明 / 时间 / 分类 / 重要程度 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
                    <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">🏛️ 所属文明</div>
                    <div className="text-sm font-serif" style={{ color: learnEra.color }}>{learnEra.name}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
                    <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">📅 时间</div>
                    <div className="text-sm text-bronze-300 font-serif">{yearLabel}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
                    <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">📂 分类</div>
                    <div className="text-sm text-parchment-50">{eventType}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
                    <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">⭐ 重要程度</div>
                    <div className="text-sm text-parchment-50">⭐⭐⭐ 关键</div>
                  </div>
                </div>
              </div>

              {/* 地图定位按钮（朝代都城坐标） — 无 capital 的朝代则不显示 */}
              {learnEra.capital && (
                <div className="px-6 pb-3">
                  <button
                    onClick={() => {
                      const eventSnipped = selectedQuickEvent.desc ?? selectedQuickEvent.longDesc?.slice(0, 120) ?? ''
                      jumpToMap(
                        learnEra.capital!,
                        `${selectedQuickEvent.title} · ${learnEra.name}`,
                        4,
                        {
                          coverImageUrl: eventImg,
                          snippet: eventSnipped,
                          reopenLabel: 'BACK',
                          eraId: learnEra.id,
                          eventYear: selectedQuickEvent.year,
                        }
                      )
                      setSelectedQuickEvent(null)
                    }}
                    className="w-full px-4 py-2.5 rounded-lg bg-emerald-700/40 hover:bg-emerald-600/60 border border-emerald-500/50 text-emerald-200 text-sm font-serif transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-base">📍</span>
                    <span>在地图上定位（{learnEra.name} 都城）</span>
                  </button>
                  <div className="text-[10px] text-ink-500 text-center mt-1.5">
                    跳转至 {learnEra.capital[0].toFixed(2)}°, {learnEra.capital[1].toFixed(2)}° 查看坐标
                  </div>
                </div>
              )}

              {/* AI 按钮 */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => {
                    const longDescText = selectedQuickEvent.longDesc ?? selectedQuickEvent.desc ?? ''
                    const persona = `你是历史学家，专精 ${learnEra.name} 时期的历史。用户询问关键事件「${selectedQuickEvent.title}」(${yearLabel})：${longDescText}。请详细解释：1.背景 2.经过 3.影响 4.关键人物 5.历史评价。2-4 段话。`
                    aiSetPersona(persona)
                    aiNewThread(`关于 ${selectedQuickEvent.title}`)
                    aiOpenPanel()
                    setSelectedQuickEvent(null)
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-purple-700/40 hover:bg-purple-600/60 border border-purple-500/50 text-purple-200 text-sm font-serif transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-base">🤖</span>
                  <span>让 AI 详细讲解这个事件</span>
                </button>
                <div className="text-xs text-ink-500 text-center mt-2">
                  AI 将解释：背景 / 经过 / 影响 / 关键人物 / 历史评价
                </div>
              </div>
          </ModalShell>
        )
      })()}
    </div>
  )
}

function StatCard({ icon, label, value, hint, progress }: { icon: string; label: string; value: string; hint?: string; progress?: number }) {
  // 解析 value 字符串（如 "12 / 50"），把前面的数字做 CountUp 动画
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
        {match && match[3] && <><span> / </span><span ref={totalEl!}>0</span></>}
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

/** 把 **加粗** 转成 <strong>，段落用 <p> 分隔（保持其他文本安全） */
function renderMarkdownBold(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-bronze-300">$1</strong>')
  // 把换行 / 句末空格拆成段落
  return escaped
    .split(/\n+|(?<=[。！？!?])\s+/)
    .filter(p => p.trim())
    .map(p => `<p class="leading-relaxed">${p.trim()}</p>`)
    .join('')
}

/** 推断事件类型（用于弹窗标签展示）—— 与 EraDetail 保持一致规则 */
function inferEventType(title: string): string {
  if (/(建立|建国|创建|立国|开国)/.test(title)) return '建国'
  if (/(战争|战役|征服|入侵|起义|兵变|平定|伐|攻陷|击败|大捷)/.test(title)) return '战争'
  if (/(即位|继位|登基|加冕|称帝|称王)/.test(title)) return '即位'
  if (/(改革|变法|维新|改制)/.test(title)) return '改革'
  if (/(鼎盛|繁荣|黄金时代|盛世|崛起)/.test(title)) return '鼎盛'
  if (/(衰|亡|灭|覆灭|终结|陷落|灭亡)/.test(title)) return '衰亡'
  if (/(迁|迁都|移民)/.test(title)) return '迁都'
  if (/(建|修|筑|造|成)/.test(title)) return '建设'
  return '关键事件'
}

/** 📝 已关联此朝代的笔记列表（按 target.kind='era' + id 查） */
function RelatedNotes({ eraId }: { eraId: string }) {
  const notesMap = useNotesStore(s => s.notes)
  const notes = useMemo(
    () => Object.values(notesMap)
      .filter(n => n.target.kind === 'era' && n.target.id === eraId)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5),
    [notesMap, eraId]
  )
  if (notes.length === 0) return null
  return (
    <div>
      <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📝 已关联笔记（{notes.length}）</div>
      <div className="space-y-1.5">
        {notes.map(n => (
          <div
            key={n.id}
            className="p-2 rounded-lg bg-ink-700/30 border border-ink-600/40 text-xs"
          >
            <div className="text-parchment-50 truncate">{n.title || '(无标题)'}</div>
            <div className="text-ink-500 text-xs truncate mt-0.5">
              {n.content.split('\n').find(l => l.trim()) || '(空)'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 🃏 已关联此朝代的复习卡（按 target.kind='era' + id 查） */
function RelatedCards({ eraId }: { eraId: string }) {
  const cardsMap = useCardsStore(s => s.cards)
  const cards = useMemo(
    () => Object.values(cardsMap)
      .filter(c => c.target.kind === 'era' && c.target.id === eraId)
      .slice(0, 5),
    [cardsMap, eraId]
  )
  if (cards.length === 0) return null
  return (
    <div>
      <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">🃏 已关联复习卡（{cards.length}）</div>
      <div className="grid grid-cols-2 gap-1.5">
        {cards.map(c => (
          <div
            key={c.id}
            className="p-2 rounded-lg bg-ink-700/30 border border-ink-600/40 text-xs"
          >
            <div className="text-ink-400 text-xs">到期：{new Date(c.nextReviewAt).toLocaleDateString()}</div>
            <div className="text-parchment-50 truncate mt-0.5">{getTargetTitle(c.target.kind, c.target.id) || '(空)'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 自动 fallback：朝代期间内发生的关键事件（最多 5 条）
 * 当 Era.quickEvents 字段为空时显示
 */
function AutoEventsInRange({ eraId, startYear, endYear }: { eraId: string; startYear: number; endYear: number }) {
  const eraEvents = events
    .filter(e => e.year >= startYear && e.year <= endYear)
    .sort((a, b) => a.year - b.year)
    .slice(0, 5)
  if (eraEvents.length === 0) return null
  return (
    <div>
      <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📜 同时期关键事件（自动聚合）</div>
      <div className="relative pl-5">
        <div className="absolute left-1.5 top-1 bottom-1 w-px bg-bronze-600/40" />
        {eraEvents.map((ev, i) => (
          <div key={i} className="relative pb-3 last:pb-0">
            <div className="absolute -left-3.5 top-1 w-2 h-2 rounded-full bg-bronze-500 ring-2 ring-ink-900" />
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-xs text-bronze-400 tabular-nums">
                {ev.year < 0 ? `BC ${-ev.year}` : ev.year}
              </span>
              {ev.importance === 3 && <span className="text-xs text-amber-400">⭐ 关键</span>}
              <span className="text-xs text-ink-500">· {ev.category}</span>
            </div>
            <div className="text-sm font-serif text-parchment-100">{ev.title}</div>
            {ev.description && (
              <div className="text-[11px] text-ink-400 mt-1 leading-relaxed">{ev.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 自动 fallback：与当前朝代同时期（时间重叠）的其他朝代
 * 当 Era.succession 字段为空时显示
 */
function AutoContemporaries({ era, allEras }: { era: Era; allEras: Era[] }) {
  // 找时间重叠（startYear1 <= endYear2 && startYear2 <= endYear1），但排除自己
  const contemporaries = allEras
    .filter(e => e.id !== era.id && e.startYear <= era.endYear && e.endYear >= era.startYear)
    .sort((a, b) => a.startYear - b.startYear)
    .slice(0, 8)  // 最多 8 个
  if (contemporaries.length === 0) return null
  return (
    <div>
      <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">🌍 同时期其他文明</div>
      <div className="text-xs text-ink-400 mb-2">
        同期 <span className="text-parchment-50">{contemporaries.length}</span> 个朝代与你选的朝代时间重叠：
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {contemporaries.map(e => (
          <div
            key={e.id}
            className="text-xs px-2 py-1 rounded-lg bg-ink-700/40 border border-ink-600/40 flex items-center gap-1"
            style={{ borderLeft: `2px solid ${e.color}` }}
          >
            <span className="text-parchment-50 flex-1 truncate" style={{ color: e.color }}>{e.name}</span>
            <span className="text-ink-500 tabular-nums">
              {e.startYear < 0 ? `BC ${-e.startYear}` : e.startYear}~{e.endYear < 0 ? `BC ${-e.endYear}` : e.endYear}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
