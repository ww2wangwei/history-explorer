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
import { useMemo, useState, useEffect, useRef, memo, useCallback, type ReactNode } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useCardsStore } from '@/store/useCardsStore'
import { useAIStore } from '@/store/useAIStore'
import { countTodayReviews } from '@/utils/cardStats'
import { bingImage, fallbackKeyword } from '@/utils/geoImage'
import { summarizeEra } from '@/utils/summarize'
import { useJumpToMap } from '@/hooks/useJumpToMap'
import { useGoalStore } from '@/store/useGoalStore'
import { useLearningPathStore, type PathId } from '@/store/useLearningPathStore'
import { usePoemStore } from '@/store/usePoemStore'
import { useQuestionsStore } from '@/store/useQuestionsStore'
import { audioEngine } from '@/utils/audioEngine'
import gsap from 'gsap'
import { isDue } from '@/utils/sm2'
import builtinQuestions from '@/data/questions.json'
import type { Era, HistoricalEvent } from '@/types'
import type { Question } from '@/types/questions'
import EraQuickLearnModal, { type QuickEventState } from './QuickLearn/EraQuickLearnModal'
import { ScrollEdge, Seal, GreekKeyDivider, CloudDivider } from '@/components/ui/ChineseOrnament'

// 🎯 性能优化：data 改用懒加载共享 loader — 不再静态 import，eras.json + events.json
//   从主 bundle 拆出。数据未到位时 eras/events 为空数组（useCoreDataReady 检测）。
import { getEras, getEvents, useCoreDataReady } from '@/data/sharedDataLoader'
const eras = getEras()
const events = getEvents()
const builtinQuestionList = builtinQuestions as Question[]

interface Props {
  isActive: boolean
  onEnterMap: () => void
  onEnterPath: (pathId: PathId, eraId?: string) => void
  onEnterLadder: () => void
}

const PATHS: { id: string; icon: string; title: string; desc: string; color: string }[] = [
  { id: 'timeline', icon: '📜', title: '朝代时间线', desc: '按时间顺序学习每个朝代', color: '#c89a5b' },
  { id: 'allFigures', icon: '👥', title: '全人物', desc: '浏览 26+ 位历史人物并与 AI 对话', color: '#9b7eb6' },
  { id: 'allWars', icon: '⚔️', title: '全战争', desc: '从武王伐纣到现代的关键战争 75 场', color: '#b85450' },
  { id: 'allCultures', icon: '📚', title: '全文化', desc: '思想家、文学家、宗教人物的代表作品', color: '#5b9bc8' },
  { id: 'allGeography', icon: '🗺️', title: '全地理', desc: '自然地理特征 + 疆域变迁', color: '#5bc89a' },
  { id: 'allPoems', icon: '📜', title: '全诗词', desc: '100 首最有名的唐诗宋词，含注解、注音、白话翻译', color: '#c89a8a' },
  { id: 'civilizations', icon: '⚖️', title: '中西方文明大对比', desc: '15 节对比，看清两种截然不同的历史路径', color: '#d4a85b' },
  { id: 'timeTravel', icon: '🎭', title: '穿越历史', desc: '化身历史人物，在关键节点做选择', color: '#9b7eb6' },
  { id: 'allQuestions', icon: '💭', title: '全问题', desc: '趣味/启发/思考题，AI 一问一答逐步深挖并打分', color: '#e07b9b' },
  { id: 'allArts', icon: '🎨', title: '全艺术', desc: '60 节西方艺术课 · 从史前壁画到当代观念', color: '#e879b9' },
  { id: 'worldHistory', icon: '🌍', title: '全文明', desc: '少年世界史 161 节 · 从人类起源到现代世界', color: '#d4a85b' },
  { id: 'review', icon: '🎯', title: '今日复习', desc: '基于 SM-2 算法的间隔重复', color: '#9bc89a' },
  // 👇 特殊情况：文史天梯（自定义页，非 store 路径）
  { id: 'ladder', icon: '🪜', title: '文史天梯', desc: '史·诗·人 三条天梯 · 学测记问 4 步闭环 · 通关可重开', color: '#b8433a' },
]

// === 主路径（4 个核心） ===
// 顶部 4 列大卡，朝代时间线 / 全人物 / 穿越历史 / 文史天梯
const MAIN_PATH_IDS: string[] = ['timeline', 'allFigures', 'timeTravel', 'ladder']
const MAIN_PATHS = PATHS.filter(p => MAIN_PATH_IDS.includes(p.id))

// === 次路径（其余） ===
const MORE_PATHS = PATHS.filter(p => !MAIN_PATH_IDS.includes(p.id))

// === 文史天梯在主路径里特殊处理（无 progress） ===
const PATH_TOTALS: Record<string, number> = {
  allFigures: 26,
  allPoems: 100,
  civilizations: 15,
  allArts: 60,
  worldHistory: 161,
}

export default function Dashboard({ isActive, onEnterMap, onEnterPath, onEnterLadder }: Props) {
  // 🎯 性能优化：核心数据 (eras/events) 懒加载，未到位时显示极简 loading
  const dataReady = useCoreDataReady()

  const currentYear = useHistoryStore(s => s.currentYear)
  const setYear = useHistoryStore(s => s.setYear)
  const selectEra = useHistoryStore(s => s.selectEra)
  const selectEvent = useHistoryStore(s => s.selectEvent)
  const eraSelectionHistory = useHistoryStore(s => s.eraSelectionHistory)

  const goal = useGoalStore(s => s.target)
  const cardsArr = useCardsStore(s => s.cards)
  const poemsFavoritesCount = usePoemStore(s => s.favorites.length)
  const questionsProgress = useQuestionsStore(s => s.progress)
  const customQuestionCount = useQuestionsStore(s => s.customQuestions.length)

  const [learnEraId, setLearnEraId] = useState<string | null>(null)
  const [selectedQuickEvent, setSelectedQuickEvent] = useState<QuickEventState | null>(null)
  const jumpToMap = useJumpToMap()
  const [showEraList, setShowEraList] = useState(false)

  const learnEra: Era | null = learnEraId ? (eras.find(e => e.id === learnEraId) ?? null) : null
  const welcomeTitleRef = useRef<HTMLDivElement | null>(null)
  const pathCardsRef = useRef<HTMLDivElement | null>(null)

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
  // 用 setTimeout 推迟消费，避免 React Strict Mode 双挂载时第一次清空第二次读不到
  useEffect(() => {
    let timer: number | undefined
    const doRestore = () => {
      const p = useHistoryStore.getState().pendingReopen
      if (!p) return
      if (p.kind === 'quickEvent') {
        const eraExists = eras.some(e => e.id === p.eraId)
        if (!eraExists) { useHistoryStore.getState().setPendingReopen(null); return }
        openQuickLearn(p.eraId)
        setTimeout(() => {
          setSelectedQuickEvent(p.event)
          useHistoryStore.getState().setPendingReopen(null)
        }, 80)
      } else if (p.kind === 'event') {
        const eventExists = events.some(e => e.id === p.eventId)
        useHistoryStore.getState().setPendingReopen(null)
        if (eventExists) selectEvent(p.eventId)
      }
    }
    timer = window.setTimeout(doRestore, 0)
    const unsub = useHistoryStore.subscribe((s, prev) => {
      const target = s.pendingReopen
      if (!target || target === prev.pendingReopen) return
      doRestore()
    })
    return () => {
      clearTimeout(timer)
      unsub()
    }
    return useHistoryStore.subscribe((s, prev) => {
      const target = s.pendingReopen
      if (!target || target === prev.pendingReopen) return
      if (target.kind === 'quickEvent') {
        const eraExists = eras.some(e => e.id === target.eraId)
        if (!eraExists) { useHistoryStore.getState().setPendingReopen(null); return }
        openQuickLearn(target.eraId)
        setTimeout(() => {
          setSelectedQuickEvent(target.event)
          useHistoryStore.getState().setPendingReopen(null)
        }, 60)
      } else if (target.kind === 'event') {
        const eventExists = events.some(e => e.id === target.eventId)
        useHistoryStore.getState().setPendingReopen(null)
        if (eventExists) selectEvent(target.eventId)
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
    () => recommendNext(currentYear, useHistoryStore.getState().selectedEraId, eraSelectionHistory) ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentYear, eraSelectionHistory],
  )

  // 🎯 性能优化：避免每次渲染都 .includes()（O(n) per era → O(1) per era）
  const visitedSet = useMemo(
    () => new Set(progressByPath.timeline.visitedEraIds),
    [progressByPath.timeline.visitedEraIds]
  )

  // 🎯 性能优化：eraImg URL 用 map 缓存，避免 67 次 bingImage() 重复调用
  const eraImgMap = useMemo(() => {
    const m = new Map<string, string>()
    sortedEras.forEach((era) => {
      m.set(
        era.id,
        bingImage(`${era.name} ${era.region === 'china' ? 'chinese dynasty' : 'civilization'} ${era.startYear}`, 400, 240)
      )
    })
    return m
  }, [sortedEras])

  // 🎯 性能优化：稳定 onSelect 引用，避免 EraButton memo 失效
  const handleEraSelect = useCallback((eraId: string) => {
    setLearnEraId(eraId)
    recordVisit('timeline', eraId)
    setShowEraList(false)
  }, [recordVisit])

  const learnedInTimeline = progressByPath.timeline.visitedEraIds.length
  const xrefVisitedCount = progressByPath.crossReference.visitedEraIds.length

  // 主路径卡片入场
  useEffect(() => {
    if (!isActive || !pathCardsRef.current) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const cards = pathCardsRef.current.querySelectorAll<HTMLElement>(':scope > div')
    if (!cards.length) return
    gsap.from(cards, {
      opacity: 0, y: 16, scale: 0.95,
      duration: 0.45, stagger: 0.08, ease: 'back.out(1.2)',
    })
  }, [isActive, learnedInTimeline, xrefVisitedCount, cardsCount, dueCount])

  // 主路径进度查询
  const getPathVisited = (id: string): number => {
    const p = progressByPath[id as PathId] ?? { visitedEraIds: [] }
    if (id === 'allFigures') return p.visitedFigureIds?.length ?? 0
    if (id === 'allQuestions') return Object.values(questionsProgress).filter(q => q.status === 'done').length
    if (id === 'allPoems') return poemsFavoritesCount
    if (id === 'civilizations') return p.visitedSectionIds?.length ?? 0
    if (id === 'allArts') return p.visitedLessonIds?.length ?? 0
    if (id === 'worldHistory') return p.visitedWorldLessonIds?.length ?? 0
    return p.visitedEraIds.length
  }

  const getPathTotal = (id: string): number => {
    if (id === 'review') return cardsCount
    if (id === 'ladder') return 0
    return PATH_TOTALS[id] ?? totalEras
  }

  if (!isActive) return null

  // 🎯 性能优化：核心数据未到位时显示极简 loading（避免 .find() 返回 undefined）
  if (!dataReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-ink-900">
        <div className="text-center">
          <div className="text-4xl mb-3">📜</div>
          <div className="text-sm text-ink-400 animate-pulse">正在准备朝代数据…</div>
        </div>
      </div>
    )
  }

  const totalEras = eras.length

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-thin bg-ink-900 ink-wash-bg paper-texture vignette">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* === 1. 标题（极简） === */}
        <div ref={welcomeTitleRef} className="mb-10">
          <h1 className="text-display font-brush text-bone mb-2 title-underline inline-block tracking-wide">
            📜 历史探索者
          </h1>
          <p className="text-ink-300 text-sm leading-relaxed">
            从 {currentYear < 0 ? `公元前${-currentYear}` : currentYear} 年开始 ·
            系统地学习中国和世界的 50 个朝代 + 251 个历史事件。
          </p>
        </div>

        {/* === 2. 主路径（4 个核心 · 屏风式） === */}
        <div className="flex items-center gap-4 mb-3">
          <span className="font-brush text-lg text-bone tracking-[0.4em]">主路径</span>
          <div className="flex-1">
            <GreekKeyDivider />
          </div>
          <span className="text-xs text-ink-400 font-brush tracking-widest">四扇屏风</span>
        </div>
        <div ref={pathCardsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {MAIN_PATHS.map(p => (
            <PrimaryPathCard
              key={p.id}
              path={p}
              visited={getPathVisited(p.id)}
              total={getPathTotal(p.id)}
              onClick={() => {
                if (p.id === 'ladder') {
                  onEnterLadder()
                } else if (p.id === 'timeline') {
                  audioEngine.playModalOpen()
                  if (recommendation) recordVisit('timeline', recommendation.eraId)
                  setShowEraList(true)
                } else {
                  onEnterPath(p.id as PathId)
                }
              }}
              highlight={p.id === 'ladder'}
              preview={p.id === 'timeline' ? <TimelinePreview eras={eras} visitedIds={visitedSet} /> : undefined}
            />
          ))}
        </div>

        {/* === 3. Hero CTA（当前推荐 · 卷轴式） === */}
        {recommendation && (
          <div
            className="mb-10 cursor-pointer group focus-ring transition-transform hover:translate-y-[-1px]"
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
            <div
              className="relative flex items-stretch rounded-md overflow-hidden"
              style={{
                background: 'rgb(var(--bg-card-rgb) / 0.6)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 0 0 1px rgb(var(--gold-rgb) / 0.3)',
              }}
            >
              {/* 📜 左侧卷轴（装裱杆） */}
              <div className="w-9 shrink-0 relative" aria-hidden>
                <ScrollEdge side="left" className="w-full h-full" />
              </div>

              {/* 📜 右侧卷轴 */}
              <div className="w-9 shrink-0 relative" aria-hidden>
                <ScrollEdge side="right" className="w-full h-full" />
              </div>

              {/* 📜 卷轴中央展开部分 */}
              <div className="flex-1 px-5 py-5 relative">
                {/* 顶部：题引 + 朱红印章「荐」 */}
                <div className="flex items-start gap-4 mb-2">
                  <div className="flex-1">
                    <div className="text-[10px] tracking-[0.4em] text-ink-400 mb-2 uppercase">
                      启 · 学 · 之 · 荐
                    </div>
                    <div className="font-brush text-2xl text-bone group-hover:text-vermilion-300 transition-colors tracking-wider leading-tight">
                      {recommendation.era.name}
                      <span className="ml-3 text-sm text-ink-300 font-sans tabular-nums font-normal">
                        {recommendation.era.startYear < 0 ? `BC ${-recommendation.era.startYear}` : recommendation.era.startYear}
                        {' ~ '}
                        {recommendation.era.endYear < 0 ? `BC ${-recommendation.era.endYear}` : recommendation.era.endYear} 年
                      </span>
                    </div>
                  </div>
                  {/* 朱红印章 */}
                  <Seal text="荐" size={44} rotated />
                </div>

                {/* 中部：理由 */}
                <div className="text-sm text-ink-300 leading-relaxed mb-3 pl-1">
                  {recommendation.reason}
                </div>

                {/* 底部：行动提示 */}
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="font-brush tracking-widest text-ink-400 group-hover:text-vermilion-300 transition-colors"
                  >
                    展卷而入
                  </span>
                  <span
                    className="font-brush text-vermilion-300 group-hover:translate-x-2 transition-transform"
                  >
                    →→→
                  </span>
                </div>

                {/* 右侧朝代色条 */}
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-1 h-12 rounded-full"
                  style={{ background: recommendation.era.color, opacity: 0.6 }}
                  aria-hidden
                />
              </div>
            </div>
          </div>
        )}

        {/* === 4. 进度总览（一行 timeline-style 条） === */}
        <div className="mb-8 p-4 rounded-lg bg-ink-800/40 border border-ink-700">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-ink-500">
              总进度 · {totalEras > 0 ? `${Math.round((learnedInTimeline / totalEras) * 100)}%` : '未开始'}
            </span>
            <span className="text-ink-500 font-mono tabular-nums">
              {learnedInTimeline} / {totalEras} 朝代
              {' · '}
              {cardsCount} 复习卡
              {' · '}
              {todayCount} / {goal} 今日
            </span>
          </div>
<div className="relative h-2 bg-ink-700 rounded-lg overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-vermilion-600 to-vermilion-400 transition-all duration-1000"
              style={{ width: `${Math.round((learnedInTimeline / totalEras) * 100)}%` }}
            />
            {/* 朝代 tick 标记（每 10% 一刻） */}
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="absolute inset-y-0 w-px bg-ink-500/30"
                style={{ left: `${(i + 1) * 10}%` }}
              />
            ))}
          </div>
          {/* 朝代点（按时间位置显示已学和未学） */}
          <ProgressEraDots eras={eras} visitedIds={visitedSet} />
          {dueCount > 0 && (
            <div className="text-xs text-amber-400 mt-2">
              ⏰ {dueCount} 张卡片待复习 · <button onClick={() => onEnterPath('review')} className="underline hover:text-amber-300">立即复习</button>
            </div>
          )}
        </div>

        {/* === 5. 探索更多（网格 chip · 竹简） === */}
        <div className="flex items-center gap-4 mb-3">
          <span className="font-brush text-base text-ink-200 tracking-[0.4em]">余 · 目</span>
          <div className="flex-1">
            <CloudDivider />
          </div>
          <span className="text-xs text-ink-500 font-brush tracking-widest">竹 · 简</span>
        </div>
        {/* 竹简网格：每条 = 一片编绳竹简 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {MORE_PATHS.map(p => {
            const visited = getPathVisited(p.id)
            const total = getPathTotal(p.id)
            const hasProgress = visited > 0 && total > 0
            return (
              <button
                key={p.id}
                onClick={() => onEnterPath(p.id as PathId)}
                className="group relative rounded-sm transition-all hover:translate-y-[-2px] focus:outline-none"
                style={{
                  /* 竹简：米黄底色 + 上下深褐绳带 + 4 个装订孔 */
                  background: 'linear-gradient(180deg, #d9c896 0%, #c8b478 50%, #d9c896 100%)',
                  padding: '14px 10px 18px',
                  boxShadow: 'inset 0 0 0 1px rgba(101, 67, 33, 0.35), 0 1px 2px rgba(0,0,0,0.3)',
                }}
                title={p.title}
              >
                {/* 上绳带 */}
                <div
                  className="absolute left-0 right-0 top-0 h-[6px]"
                  style={{ background: 'linear-gradient(180deg, #4a3528 0%, #6b4a32 50%, #4a3528 100%)' }}
                  aria-hidden
                />
                {/* 下绳带 */}
                <div
                  className="absolute left-0 right-0 bottom-0 h-[6px]"
                  style={{ background: 'linear-gradient(180deg, #4a3528 0%, #6b4a32 50%, #4a3528 100%)' }}
                  aria-hidden
                />
                {/* 4 个装订孔（左右上下各 1） */}
                <span
                  className="absolute w-[5px] h-[5px] rounded-full bg-[#3a2818] left-[6px] top-[2px]"
                  style={{ boxShadow: 'inset 0 0 1px rgba(0,0,0,0.6)' }}
                  aria-hidden
                />
                <span
                  className="absolute w-[5px] h-[5px] rounded-full bg-[#3a2818] right-[6px] top-[2px]"
                  style={{ boxShadow: 'inset 0 0 1px rgba(0,0,0,0.6)' }}
                  aria-hidden
                />
                <span
                  className="absolute w-[5px] h-[5px] rounded-full bg-[#3a2818] left-[6px] bottom-[2px]"
                  style={{ boxShadow: 'inset 0 0 1px rgba(0,0,0,0.6)' }}
                  aria-hidden
                />
                <span
                  className="absolute w-[5px] h-[5px] rounded-full bg-[#3a2818] right-[6px] bottom-[2px]"
                  style={{ boxShadow: 'inset 0 0 1px rgba(0,0,0,0.6)' }}
                  aria-hidden
                />

                {/* 内容 */}
                <div className="relative z-10 flex flex-col items-center gap-1.5 py-1">
                  <span className="text-xl" aria-hidden>{p.icon}</span>
                  <span
                    className="font-brush text-xs tracking-wider leading-tight text-center truncate w-full"
                    style={{ color: '#3a2818' }}
                  >
                    {p.title}
                  </span>
                  <span
                    className="text-[9px] tabular-nums"
                    style={{ color: hasProgress ? '#8b3a2c' : '#8a6a4a' }}
                  >
                    {hasProgress ? `${visited} / ${total}` : '—'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* === 6. 快捷入口（极简） === */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-500 pt-4 border-t border-ink-700">
          <button
            onClick={onEnterMap}
            className="hover:text-vermilion-300 transition-colors"
          >
            🗺 地图浏览
          </button>
          <span className="text-ink-700">·</span>
          <button
            onClick={() => setYear(0)}
            className="hover:text-vermilion-300 transition-colors"
          >
            ⏳ 跳到公元 0 年
          </button>
          <span className="text-ink-700">·</span>
          <button
            onClick={() => setShowEraList(true)}
            className="hover:text-vermilion-300 transition-colors"
          >
            📜 浏览全部朝代
          </button>
          <span className="ml-auto text-ink-600">
            <kbd className="px-1.5 py-0.5 bg-ink-700 rounded text-ink-400 font-mono">g</kbd>
            <span className="mx-1">地图</span>
            <kbd className="px-1.5 py-0.5 bg-ink-700 rounded text-ink-400 font-mono">r</kbd>
            <span className="mx-1">图谱</span>
          </span>
        </div>
      </div>

      {/* 朝代选择列表 */}
      {showEraList && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
          onClick={() => setShowEraList(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-vermilion-500/40 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="详情"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-ink-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-brush text-vermilion-300 tracking-wide">📜 选一个朝代学习</h2>
                <div className="text-xs text-ink-500 mt-0.5">按时间顺序排列。已学的朝代用 <span className="text-green-400">绿色</span> 标记，下一个推荐的用 <span className="text-vermilion-300">金色</span> 高亮。</div>
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
                  const visited = visitedSet.has(era.id)
                  const isRecommended = recommendation?.era?.id === era.id
                  const hasQuick = !!era.keyPoints
                  return (
                    <EraButton
                      key={era.id}
                      era={era}
                      visited={visited}
                      isRecommended={isRecommended}
                      hasQuick={hasQuick}
                      eraImg={eraImgMap.get(era.id) ?? ''}
                      onSelect={handleEraSelect}
                    />
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

// ===== PrimaryPathCard =====

function PrimaryPathCard({
  path: p,
  visited,
  total,
  onClick,
  highlight,
  preview,
}: {
  path: { id: string; icon: string; title: string; desc: string; color: string }
  visited: number
  total: number
  onClick: () => void
  highlight?: boolean
  /** 可选的卡片专属预览元素（如朝代时间线卡的小型时间线） */
  preview?: ReactNode
}) {
  const pct = total > 0 ? Math.round((visited / total) * 100) : 0
  const isNew = highlight
  const accent = p.color
  // 强制四张卡同高：进度条区有 / 无都用同一 min-height 填充
  return (
    <button
      onClick={onClick}
      className="group relative text-left transition-all hover:translate-y-[-2px] focus:outline-none h-full"
    >
      <div
        className="relative rounded-md overflow-hidden transition-shadow h-full flex flex-col"
        style={{
          background: 'rgb(var(--bg-card-rgb) / 0.85)',
          boxShadow: isNew
            ? '0 0 0 1px rgb(var(--vermilion-rgb) / 0.5), 0 0 18px rgb(var(--vermilion-rgb) / 0.18), inset 0 0 0 1px rgb(var(--gold-rgb) / 0.4)'
            : '0 0 0 1px rgb(var(--gold-rgb) / 0.3), inset 0 0 0 1px rgb(var(--gold-rgb) / 0.18)',
          minHeight: 180,
        }}
      >
        {/* 四角方印 */}
        <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: 'rgb(var(--gold-rgb) / 0.7)' }} />
        <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: 'rgb(var(--gold-rgb) / 0.7)' }} />
        <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: 'rgb(var(--gold-rgb) / 0.7)' }} />
        <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: 'rgb(var(--gold-rgb) / 0.7)' }} />

        {/* 顶部额枋（栏额式） */}
        <div
          className="relative px-3 py-2 flex items-center justify-between shrink-0"
          style={{
            background: `linear-gradient(180deg, rgb(var(--bg-elevated-rgb) / 0.6) 0%, rgb(var(--bg-card-rgb) / 0) 100%)`,
            borderBottom: '1px solid rgb(var(--gold-rgb) / 0.25)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl shrink-0" style={{ filter: `drop-shadow(0 0 6px ${accent}50)` }}>
              {p.icon}
            </span>
            <span className="font-brush text-base tracking-wider leading-none truncate" style={{ color: accent }}>
              {p.title}
            </span>
          </div>
          {isNew && (
            <span
              className="font-brush text-[10px] px-1.5 py-0.5 rounded-[2px] shrink-0 ml-1"
              style={{
                background: 'rgb(var(--vermilion-rgb) / 0.92)',
                color: 'rgb(var(--text-parchment-rgb))',
                transform: 'rotate(-6deg)',
                boxShadow: '0 0 0 1px rgb(var(--vermilion-3-rgb) / 1), 0 1px 4px rgba(0,0,0,0.4)',
              }}
              aria-label="新内容"
            >
              新
            </span>
          )}
        </div>

        {/* 屏风主体（flex-1 让四张等高） */}
        <div className="px-3 py-3 relative flex-1 flex flex-col">
          <p className="text-xs text-ink-300 leading-relaxed line-clamp-2">
            {p.desc}
          </p>

          {preview}

          {/* 进度区：有 total 才显示进度条；无 total 留空占位（保证高度） */}
          <div className="mt-auto pt-3 min-h-[44px]">
            {total > 0 ? (
              <>
                <div className="text-[10px] text-ink-400 tabular-nums mb-1 flex justify-between">
                  <span>已学 {visited} / {total}</span>
                  <span>{pct}%</span>
                </div>
                <div className="relative h-1 bg-ink-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}80 0%, ${accent} 100%)` }}
                  />
                </div>
              </>
            ) : (
              /* 没有进度的卡（如穿越历史、文史天梯）：显示「未启程」占位 */
              <div className="text-[10px] text-ink-500 italic">— 待启程 —</div>
            )}
          </div>

          {isNew && (
            <div className="mt-2 text-xs text-vermilion-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>入此门</span>
              <span>→</span>
            </div>
          )}
        </div>

        {/* 底部雕花条 */}
        <div
          className="h-1 shrink-0"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgb(var(--gold-rgb) / 0.5) 30%, rgb(var(--gold-rgb) / 0.5) 70%, transparent 100%)`,
          }}
          aria-hidden
        />
      </div>
    </button>
  )
}

// ===== 进度总览：朝代点 =====
// 在进度条下方画一行朝代点（按真实年份位置），已学=绿，未学=灰/朱砂（中国）
function ProgressEraDots({ eras, visitedIds }: { eras: Era[]; visitedIds: Set<string> }) {
  const MIN_YEAR = -2200
  const MAX_YEAR = 2100
  const SPAN = MAX_YEAR - MIN_YEAR
  const xFor = (y: number) => ((y - MIN_YEAR) / SPAN) * 100  // 百分比
  const KEY_YEARS: { year: number; label: string }[] = [
    { year: -221, label: '秦' },
    { year: 0,    label: '公元' },
    { year: 1279, label: '宋末' },
    { year: 1912, label: '民国' },
  ]
  return (
    <div className="relative h-4 mt-1">
      {/* 朝代点 */}
      {eras.map(e => {
        const isVisited = visitedIds.has(e.id)
        const isChina = e.region === 'china'
        const x = xFor((e.startYear + e.endYear) / 2)
        return (
          <div
            key={e.id}
            title={`${e.name}${isVisited ? ' (已学)' : ''}`}
            className={`absolute top-1/2 w-1.5 h-1.5 rounded-full transition-colors ${
              isVisited
                ? 'bg-green-400'
                : isChina
                  ? 'bg-vermilion-500/40'
                  : 'bg-ink-500/40'
            }`}
            style={{ left: `calc(${x}% - 3px)`, transform: 'translateY(-50%)' }}
          />
        )
      })}
      {/* 关键年标 */}
      {KEY_YEARS.map(k => {
        const x = xFor(k.year)
        return (
          <div
            key={k.year}
            className="absolute top-0 bottom-0 flex flex-col items-center"
            style={{ left: `${x}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-px h-full bg-gold-500/40" />
            <div className="absolute -top-0.5 text-[9px] text-gold-300 font-serif whitespace-nowrap">
              {k.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ===== 朝代时间线迷你预览 =====
// 用 SVG 显示一条压缩时间线（BC 2200 → 2100）+ 67 个朝代点 + 4 个关键年标
// 不依赖任何动效，纯粹视觉信息
function TimelinePreview({ eras, visitedIds }: { eras: Era[]; visitedIds: Set<string> }) {
  const MIN_YEAR = -2200
  const MAX_YEAR = 2100
  const SPAN = MAX_YEAR - MIN_YEAR
  const KEY_YEARS: { year: number; label: string }[] = [
    { year: -221, label: '秦' },
    { year: 0,    label: '公元' },
    { year: 1279, label: '宋末' },
    { year: 1912, label: '民国' },
  ]
  const xFor = (y: number) => ((y - MIN_YEAR) / SPAN) * 200

  return (
    <div className="mb-2">
      <svg viewBox="0 0 200 28" className="w-full h-7" preserveAspectRatio="none">
        {/* 朱砂主线 */}
        <line x1="0" y1="14" x2="200" y2="14"
          stroke="rgb(var(--vermilion-rgb))" strokeWidth="1" opacity="0.5" />
        {/* 朝代点 */}
        {eras.map(e => {
          const x = xFor(e.startYear)
          const isVisited = visitedIds.has(e.id)
          const isChina = e.region === 'china'
          return (
            <circle key={e.id}
              cx={x} cy="14" r={isChina ? 1.3 : 1}
              fill={isVisited ? 'rgb(74 222 128)' : isChina ? 'rgb(var(--vermilion-rgb))' : 'rgb(var(--text-faint-rgb))'}
              opacity={isVisited ? 0.95 : 0.6}
            />
          )
        })}
        {/* 关键年标 */}
        {KEY_YEARS.map(k => (
          <g key={k.year}>
            <line x1={xFor(k.year)} y1="20" x2={xFor(k.year)} y2="26"
              stroke="rgb(var(--gold-rgb))" strokeWidth="0.5" opacity="0.6" />
            <text x={xFor(k.year)} y="11" textAnchor="middle" fontSize="5"
              fill="rgb(var(--text-faint-rgb))" fontFamily="serif">
              {k.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// 🎯 性能优化：朝代卡 memo，避免 67 张卡全部重渲染
const EraButton = memo(function EraButton({
  era,
  visited,
  isRecommended,
  hasQuick,
  eraImg,
  onSelect,
}: {
  era: Era
  visited: boolean
  isRecommended: boolean
  hasQuick: boolean
  eraImg: string
  onSelect: (id: string) => void
}) {
  return (
    <button
      onClick={() => onSelect(era.id)}
      className={`text-left rounded-lg border-2 transition-all overflow-hidden group ${
        isRecommended
          ? 'border-vermilion-500/40 hover:border-vermilion-400'
          : visited
          ? 'border-green-700/50 hover:border-green-500/80'
          : 'border-ink-600 hover:border-vermilion-500/60'
      }`}
      style={{
        // 🎯 性能优化：浏览器自动跳过屏幕外卡渲染 + contain layout/paint
        contentVisibility: 'auto',
        containIntrinsicSize: '0 200px',
      }}
    >
      <div className="relative w-full h-28 bg-ink-900">
        <img
          src={eraImg}
          alt={era.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 flex items-center gap-2">
          {isRecommended && <span className="text-vermilion-300 text-xs bg-bronze-900/70 backdrop-blur px-1.5 py-0.5 rounded-lg">👉 推荐</span>}
          {visited && <span className="text-green-300 text-xs bg-green-900/70 backdrop-blur px-1.5 py-0.5 rounded-lg">✓ 已学</span>}
          {!hasQuick && <span className="text-ink-400 text-xs bg-ink-900/70 backdrop-blur px-1.5 py-0.5 rounded-lg">详细</span>}
          <span className="text-base font-brush flex-1 truncate tracking-wide" style={{ color: era.color }}>
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
})