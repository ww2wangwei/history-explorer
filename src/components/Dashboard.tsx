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
import { formatYearShort } from '@/utils/time'
import gsap from 'gsap'
import { isDue } from '@/utils/sm2'
import builtinQuestions from '@/data/questions.json'
import type { Era } from '@/types'
import type { Question } from '@/types/questions'
import EraQuickLearnModal, { type QuickEventState } from './QuickLearn/EraQuickLearnModal'
import { Seal, GreekKeyDivider } from '@/components/ui/ChineseOrnament'
import ThoughtsOverview from '@/components/Thoughts/ThoughtsOverview'
import TechnologyOverview from '@/components/Technology/TechnologyOverview'
import ReligionOverview from '@/components/Religion/ReligionOverview'

// 🎯 性能优化：data 改用懒加载共享 loader — 不再静态 import，eras.json + events.json
//   从主 bundle 拆出。数据未到位时 eras/events 为空数组（useCoreDataReady 检测）。
// 🎯 修复：之前 const eras = getEras() 在模块加载时执行，那时 _data 还是 EMPTY
//   → eras 永久 []。改用 useMemo + useCoreDataReady gate。
import { getEras, getEvents, useCoreDataReady } from '@/data/sharedDataLoader'
const builtinQuestionList = builtinQuestions as Question[]

interface Props {
  isActive: boolean
  onEnterMap: () => void
  onEnterPath: (pathId: PathId, eraId?: string) => void
  onEnterLadder: () => void
}

const PATHS: { id: string; icon: string; title: string; desc: string; color: string; imageKeyword: string; imageUrl?: string }[] = [
  // 高清图全部来自 Wikimedia Commons（公共版权）
  { id: 'timeline', icon: '📜', title: '朝代时间线', desc: '按时间顺序学习每个朝代', color: '#c89a5b', imageKeyword: 'chinese dynasty scroll timeline',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/A_Thousand_Li_of_Rivers_and_Mountains_part.jpg' }, // 千里江山图（北宋·王希孟）
  { id: 'allFigures', icon: '👥', title: '全人物', desc: '浏览 26+ 位历史人物并与 AI 对话', color: '#9b7eb6', imageKeyword: 'historical figure portrait painting',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Yan_Liben._Thirteen_Emperors_Scroll%2C_detail._Boston_MFA.jpg' }, // 历代帝王图（唐·阎立本）
  { id: 'allWars', icon: '⚔️', title: '全战争', desc: '从武王伐纣到现代的关键战争 75 场', color: '#b85450', imageKeyword: 'ancient war battlefield painting',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Jan_Matejko%2C_Bitwa_pod_Grunwaldem.jpg/1280px-Jan_Matejko%2C_Bitwa_pod_Grunwaldem.jpg' }, // 格伦瓦德之战（Matejko）
  { id: 'allCultures', icon: '📚', title: '全文化', desc: '思想家、文学家、宗教人物的代表作品', color: '#5b9bc8', imageKeyword: 'ancient culture calligraphy',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/XingshuLantingxv.jpg' }, // 兰亭集序（东晋·王羲之）
  { id: 'allGeography', icon: '🗺️', title: '全地理', desc: '自然地理特征 + 疆域变迁', color: '#5bc89a', imageKeyword: 'world map historical geography',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/%E6%98%AD%E9%99%B5%E5%85%AD%E9%AA%8F-%E8%A5%BF%E5%AE%89%E7%A2%91%E6%9E%97%E7%9F%B3%E5%88%BB%E8%89%BA%E6%9C%AF%E5%AE%A4_2023-09-29_01.jpg/1280px-%E6%98%AD%E9%99%B5%E5%85%AD%E9%AA%8F-%E8%A5%BF%E5%AE%89%E7%A2%91%E6%9E%97%E7%9F%B3%E5%88%BB%E8%89%BA%E6%9C%AF%E5%AE%A4_2023-09-29_01.jpg' }, // 昭陵六骏（唐·石刻）
  { id: 'allPoems', icon: '📜', title: '全诗词', desc: '100 首最有名的唐诗宋词，含注解、注音、白话翻译', color: '#c89a8a', imageKeyword: 'chinese poetry scroll ink',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/%E5%90%8D%E7%BB%98%E9%9B%86%E7%8F%8D%E5%86%8C_1_%E5%8D%97%E5%AE%8B_%E4%BD%9A%E5%90%8D_%E6%91%B9%E6%99%8B%E9%A1%BE%E6%81%BA%E4%B9%8B%E6%B4%9B%E7%A5%9E%E5%9B%BE.jpg/1280px-%E5%90%8D%E7%BB%98%E9%9B%86%E7%8F%8D%E5%86%8C_1_%E5%8D%97%E5%AE%8B_%E4%BD%9A%E5%90%8D_%E6%91%B9%E6%99%8B%E9%A1%BE%E6%81%BA%E4%B9%8B%E6%B4%9B%E7%A5%9E%E5%9B%BE.jpg' }, // 洛神赋图（南宋·摹顾恺之）
  { id: 'civilizations', icon: '⚖️', title: '中西方文明大对比', desc: '15 节对比，看清两种截然不同的历史路径', color: '#d4a85b', imageKeyword: 'east west civilization contrast',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/The_Forbidden_City_-_View_from_Coal_Hill.jpg/1280px-The_Forbidden_City_-_View_from_Coal_Hill.jpg' }, // 故宫俯瞰（景山视角）
  { id: 'timeTravel', icon: '🎭', title: '穿越历史', desc: '化身历史人物，在关键节点做选择', color: '#9b7eb6', imageKeyword: 'classical chinese painting historical figures court scene',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Gu_Hongzhong%27s_Night_Revels%2C_Detail_1.jpg/1280px-Gu_Hongzhong%27s_Night_Revels%2C_Detail_1.jpg' }, // 韩熙载夜宴图（五代·顾闳中）
  { id: 'allQuestions', icon: '💭', title: '全问题', desc: '趣味/启发/思考题，AI 一问一答逐步深挖并打分', color: '#e07b9b', imageKeyword: 'philosophical question thinking',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg' }, // 雅典学院（Raphael）
  { id: 'allArts', icon: '🎨', title: '全艺术', desc: '60 节西方艺术课 · 从史前壁画到当代观念', color: '#e879b9', imageKeyword: 'ancient art painting gallery',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg' }, // 维纳斯的诞生（Botticelli）
  { id: 'allMythologies', icon: '🔱', title: '全神话', desc: '7 大文明 · 78 篇神话 · 角色图谱串起神祇家族', color: '#a07050', imageKeyword: 'greek mythology marble statue gods',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Laoco%C3%B6n_and_his_sons_group.jpg/1280px-Laoco%C3%B6n_and_his_sons_group.jpg' }, // 拉奥孔群像
  { id: 'worldHistory', icon: '🌍', title: '全文明', desc: '少年世界史 161 节 · 从人类起源到现代世界', color: '#d4a85b', imageKeyword: 'world civilization ruins',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/88/51714-Terracota-Army.jpg' }, // 兵马俑一号坑
  { id: 'review', icon: '🎯', title: '今日复习', desc: '基于 SM-2 算法的间隔重复', color: '#9bc89a', imageKeyword: 'ancient scrolls scholar desk library candle',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Rembrandt_-_The_Philosopher_in_Meditation.jpg' }, // 沉思的哲学家（Rembrandt）
  // 👇 特殊情况：文史天梯（自定义页，非 store 路径）
  { id: 'ladder', icon: '🪜', title: '文史天梯', desc: '史·诗·人 三条天梯 · 学测记问 4 步闭环 · 通关可重开', color: '#b8433a', imageKeyword: 'ancient stone temple stairs scholarly',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Skylight%2C_chandelier_and_stairs%2C_Ashmolean_Museum%2C_Oxford.jpg' }, // 阿什莫林博物馆天梯（喻登阶）
  { id: 'allTraditions', icon: '🪷', title: '全传统', desc: '12 子分类 · 中国人的历史、家、神话、哲学、文字、文学、艺术、历法节气、礼仪制度、衣食住行、科技', color: '#d4856a', imageKeyword: 'chinese tradition ink painting calligraphy' },
  { id: 'allThoughts', icon: '💡', title: '全思想', desc: '集中收集整理全人类的思想精华 · 老子·孔子·苏格拉底·柏拉图·佛陀·更多', color: '#9b7eb6', imageKeyword: 'philosophy ancient greek thinker meditation candle' },
  { id: 'allTechnology', icon: '⚙️', title: '全科技', desc: '整理人类发展至今最具影响力的科技创新 · 火·农业·文字·纸·印刷·蒸汽·电力·互联网', color: '#d4a85b', imageKeyword: 'invention technology gears industry innovation' },
  { id: 'allReligion', icon: '🛕', title: '全宗教', desc: '详细整理从古至今的重要宗教 · 基督教·伊斯兰教·佛教·印度教·犹太教·道教·儒教·锡克教·耆那教·巴哈伊', color: '#5b9bc8', imageKeyword: 'religion temple worship spiritual' },
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
  allMythologies: 78,
  worldHistory: 161,
}

export default function Dashboard({ isActive, onEnterMap, onEnterPath, onEnterLadder }: Props) {
  // 🎯 性能优化：核心数据 (eras/events) 懒加载，未到位时显示极简 loading
  const dataReady = useCoreDataReady()
  // 🎯 修复：dataReady 翻转时，从 sharedDataLoader 取最新数据
  const eras = useMemo(() => (dataReady ? getEras() : []), [dataReady])
  const events = useMemo(() => (dataReady ? getEvents() : []), [dataReady])

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
  const [showThoughts, setShowThoughts] = useState(false)
  const [showTechnology, setShowTechnology] = useState(false)
  const [showReligion, setShowReligion] = useState(false)

  const learnEra: Era | null = learnEraId ? (eras.find(e => e.id === learnEraId) ?? null) : null
  const welcomeTitleRef = useRef<HTMLDivElement | null>(null)

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

  // 🎯 弧形画廊的 hover 由 ArcCard 内部 CSS transition 处理，旧的 grid hover 已移除

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

  // 🎯 弧形画廊入场动画已迁到 ArcGallery 组件内

  // 主路径进度查询
  const getPathVisited = (id: string): number => {
    const p = progressByPath[id as PathId] ?? { visitedEraIds: [] }
    if (id === 'allFigures') return p.visitedFigureIds?.length ?? 0
    if (id === 'allQuestions') return Object.values(questionsProgress).filter(q => q.status === 'done').length
    if (id === 'allPoems') return poemsFavoritesCount
    if (id === 'civilizations') return p.visitedSectionIds?.length ?? 0
    if (id === 'allArts') return p.visitedLessonIds?.length ?? 0
    if (id === 'allMythologies') return p.visitedMythIds?.length ?? 0
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
      <div className="max-w-5xl mx-auto px-6 py-4">
        {/* === 1. 标题（极简） === */}
        <div ref={welcomeTitleRef} className="mb-4">
          <h1 className="text-2xl font-brush text-bone mb-1 tracking-wide inline-block">
            📜 历史探索者
          </h1>
          <p className="text-ink-300 text-xs leading-relaxed">
            当前定位 {currentYear < 0 ? `公元前${-currentYear}` : currentYear} 年 ·
            系统梳理中国与世界 50 个朝代 + 251 个历史事件的时空脉络。
          </p>
        </div>

        {/* === 2. 学习路径（14 卡 · 3 列行网格 · motionsites 风） === */}
        <div className="flex items-center gap-4 mb-3">
          <span className="font-brush text-lg text-bone tracking-[0.4em]">学习路径</span>
          <div className="flex-1">
            <GreekKeyDivider />
          </div>
          <span className="text-xs text-ink-400 font-brush tracking-widest">17 板块</span>
        </div>
      </div>

      {/* Filmstrip 横向全屏（紧跟"学习路径"标题下方，绕过 max-w-5xl 居中容器） */}
      <FilmstripGallery
        paths={PATHS}
        getVisited={getPathVisited}
        getTotal={getPathTotal}
        onEnterPath={onEnterPath}
        onEnterLadder={onEnterLadder}
        onOpenEraList={() => {
          audioEngine.playModalOpen()
          if (recommendation) recordVisit('timeline', recommendation.eraId)
          setShowEraList(true)
        }}
        onOpenThoughts={() => {
          audioEngine.playModalOpen()
          setShowThoughts(true)
        }}
        onOpenTechnology={() => {
          audioEngine.playModalOpen()
          setShowTechnology(true)
        }}
        onOpenReligion={() => {
          audioEngine.playModalOpen()
          setShowReligion(true)
        }}
        newPathId="ladder"
      />

      {/* Filmstrip 已包含全思想板块（横向折叠第 15 个） */}

      <div className="px-4 sm:px-8 py-4">
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
              className="relative rounded-lg overflow-hidden transition-all hover:shadow-[0_6px_24px_rgba(0,0,0,0.4)]"
              style={{
                background: 'rgb(var(--bg-card-rgb) / 0.7)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 0 0 1px rgb(var(--gold-rgb) / 0.25)',
              }}
            >
              {/* 左侧朝代色条（细窄，沿用整高） */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ background: recommendation.era.color, opacity: 0.75 }}
                aria-hidden
              />

              {/* 顶部题引条 */}
              <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-gold-500/10">
                <span
                  className="font-serif text-[11px] tracking-[0.35em] text-gold-400/85 select-none"
                  style={{ fontFeatureSettings: '"palt"' }}
                >
                  师者所荐 · 今学于此
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-gold-500/20 to-transparent" />
              </div>

              {/* 中部：标题 + 年份 + 理由 + 印章 */}
              <div className="px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* 朝代名 + 年份（一行） */}
                  <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                    <h2
                      className="font-serif text-[26px] leading-none text-vermilion-400 group-hover:text-vermilion-300 transition-colors tracking-wide"
                      style={{ fontWeight: 500 }}
                    >
                      {recommendation.era.name}
                    </h2>
                    <span className="text-[13px] text-ink-400 tabular-nums font-light tracking-wider">
                      {formatYearShort(recommendation.era.startYear)}
                      <span className="mx-2 text-gold-500/50">—</span>
                      {formatYearShort(recommendation.era.endYear)}
                    </span>
                  </div>
                  {/* 理由 */}
                  <p className="text-[13px] text-ink-300/90 leading-relaxed">
                    {recommendation.reason}
                  </p>
                </div>

                {/* 朱红印章（不旋转，作为装饰重点） */}
                <div className="shrink-0 -mt-1">
                  <Seal text="荐" size={52} rotated={false} />
                </div>
              </div>

              {/* 底部行动提示 */}
              <div
                className="px-5 py-2.5 flex items-center justify-between border-t border-gold-500/10"
                style={{ background: 'rgb(var(--bg-elevated-rgb) / 0.3)' }}
              >
                <span
                  className="font-serif text-xs text-ink-400 tracking-[0.35em] group-hover:text-vermilion-400 transition-colors"
                >
                  展卷而入
                </span>
                <span className="text-vermilion-400 text-sm group-hover:translate-x-1.5 transition-transform">
                  →
                </span>
              </div>
            </div>
          </div>
        )}

        {/* === 4. 进度总览（一行 timeline-style 条） === */}
        <div className="mb-8 p-4 rounded-lg bg-ink-800/40 border border-ink-700">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-ink-300">
              总进度 · {totalEras > 0 ? `${Math.round((learnedInTimeline / totalEras) * 100)}%` : '未开始'}
            </span>
            <span className="text-ink-300 font-mono tabular-nums">
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

        {/* === 5. 已合并到「学习路径」section（上方），删除旧的独立余·目 section === */}

        {/* === 6. 快捷入口（极简） === */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-300 pt-4 border-t border-ink-700">
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
          <span className="ml-auto text-ink-400">
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
                <div className="text-xs text-ink-300 mt-0.5">按时间顺序排列。已学的朝代用 <span className="text-green-400">绿色</span> 标记，下一个推荐的用 <span className="text-vermilion-300">金色</span> 高亮。</div>
              </div>
              <button
                className="text-ink-300 hover:text-parchment-50 text-2xl leading-none"
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

      {/* 💡 全思想 Modal */}
      {showThoughts && (
        <ThoughtsOverview
          isActive={showThoughts}
          onClose={() => { audioEngine.playModalClose(); setShowThoughts(false) }}
        />
      )}

      {/* ⚙️ 全科技 Modal */}
      {showTechnology && (
        <TechnologyOverview
          isActive={showTechnology}
          onClose={() => { audioEngine.playModalClose(); setShowTechnology(false) }}
        />
      )}

      {/* 🛕 全宗教 Modal */}
      {showReligion && (
        <ReligionOverview
          isActive={showReligion}
          onClose={() => { audioEngine.playModalClose(); setShowReligion(false) }}
        />
      )}
    </div>
  )
}

// ===== MotionsitesCard =====
// 灵感：motionsites.ai 的 wide preview cards + awwwards Wabi-Sabi 项目页
// 设计：每个板块一个矩形卡
//   - variant='hero' (默认)：横向，左预览 + 右文字（重点推荐）
//   - variant='grid'：纵向，上预览 + 下文字（2-col grid 紧凑展示）
function MotionsitesCard({
  path: p,
  visited,
  total,
  onClick,
  highlight,
  variant = 'hero',
}: {
  path: { id: string; icon: string; title: string; desc: string; color: string; imageKeyword: string; imageUrl?: string }
  visited: number
  total: number
  onClick: () => void
  highlight?: boolean
  variant?: 'hero' | 'grid'
}) {
  const pct = total > 0 ? Math.round((visited / total) * 100) : 0
  const accent = p.color

  const isGrid = variant === 'grid'
  // 13 个板块共用 Bing CDN 图（主区 800×450、次区 grid 400×220）
  const bgW = isGrid ? 400 : 800
  const bgH = isGrid ? 220 : 450

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl transition-all hover:translate-y-[-2px] focus:outline-none w-full text-left flex ${
        isGrid ? 'flex-col' : 'flex'
      } ${highlight ? 'ring-1 ring-vermilion-500/60' : ''}`}
      style={{
        background: 'rgb(var(--bg-card-rgb) / 0.85)',
        boxShadow: highlight
          ? '0 6px 24px rgba(0,0,0,0.4), 0 0 0 1px rgb(var(--vermilion-rgb) / 0.5), inset 0 0 0 1px rgb(var(--gold-rgb) / 0.4)'
          : '0 4px 16px rgba(0,0,0,0.3), inset 0 0 0 1px rgb(var(--gold-rgb) / 0.25)',
      }}
    >
      {/* 预览区：hero=左 40%（横），grid=顶部 100%（纵） */}
      <div
        className={`relative overflow-hidden shrink-0 ${isGrid ? 'w-full' : 'w-2/5'}`}
        style={{
          background: `linear-gradient(135deg, ${accent}66 0%, ${accent}22 100%)`,
          backgroundImage: `url(${bingImage(p.imageKeyword, bgW, bgH)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: isGrid ? 110 : 140,
          aspectRatio: isGrid ? '16/9' : undefined,
        }}
      >
        {/* 暗色蒙版（保证顶部百分比 / 底部进度条可读） */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.12) 35%, rgba(0,0,0,0.55) 100%)',
          }}
        />
        {/* 装饰：左上角小色块 */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
          <span className={isGrid ? 'text-base' : 'text-xl'}>{p.icon}</span>
          {visited > 0 && pct > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-vermilion-500/80 text-bone font-bold">
              {pct}%
            </span>
          )}
        </div>
        {/* 底部进度条 */}
        {total > 0 && pct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-ink-900/40">
            <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: accent }} />
          </div>
        )}
      </div>
      {/* 文字区 */}
      <div className={`flex-1 min-w-0 flex flex-col justify-between ${isGrid ? 'p-3' : 'p-4'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-serif tracking-wide truncate ${isGrid ? 'text-sm' : 'text-lg'} text-bone`}>{p.title}</h3>
            {highlight && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-vermilion-500/30 border border-vermilion-500/50 text-vermilion-300 font-bold tracking-wider shrink-0">NEW</span>
            )}
          </div>
          <p className={`${isGrid ? 'text-[10px] line-clamp-1' : 'text-[11px] line-clamp-2'} text-ink-300 leading-relaxed`}>{p.desc}</p>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-ink-300 tabular-nums">
            {total > 0 ? `${visited} / ${total}` : '无限探索'}
          </span>
          <span
            className="font-serif text-[10px] tracking-widest transition-colors"
            style={{ color: accent }}
          >
            进入 →
          </span>
        </div>
      </div>
    </button>
  )
}

// ===== PathScrollCard =====
// 行形全宽卡 — 灵感：motionsites.ai 的横排 row cards
// 3 列 grid 中每张卡撑满列宽，landscape 16:9（行形状），图片铺满、文字浮于左下
function PathScrollCard({
  path: p,
  visited,
  total,
  onClick,
  highlight,
}: {
  path: { id: string; icon: string; title: string; desc: string; color: string; imageKeyword: string; imageUrl?: string }
  visited: number
  total: number
  onClick: () => void
  highlight?: boolean
}) {
  const pct = total > 0 ? Math.round((visited / total) * 100) : 0
  const accent = p.color
  return (
    <button
      onClick={onClick}
      className={`group relative block w-full overflow-hidden rounded-xl text-left transition-all hover:-translate-y-0.5 focus:outline-none ${
        highlight ? 'ring-1 ring-vermilion-500/60' : ''
      }`}
      style={{
        aspectRatio: '16 / 9',
        background: 'rgb(var(--bg-card-rgb) / 0.85)',
        boxShadow: highlight
          ? '0 6px 24px rgba(0,0,0,0.4), 0 0 0 1px rgb(var(--vermilion-rgb) / 0.5), inset 0 0 0 1px rgb(var(--gold-rgb) / 0.4)'
          : '0 4px 16px rgba(0,0,0,0.35), inset 0 0 0 1px rgb(var(--gold-rgb) / 0.25)',
      }}
      aria-label={`${p.title} — ${p.desc}`}
    >
      {/* 背景图 */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${bingImage(p.imageKeyword, 800, 450)})` }}
      />
      {/* 暗色蒙版：底部深 + 顶部轻，保证文字可读 */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.80) 100%)',
        }}
      />
      {/* 顶部：icon + NEW 徽章 / 进度百分比 */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
        <span className="text-xl drop-shadow">{p.icon}</span>
        <div className="flex items-center gap-1">
          {highlight && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-vermilion-500/90 text-bone font-bold tracking-wider">
              NEW
            </span>
          )}
          {visited > 0 && pct > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-vermilion-500/85 text-bone font-bold backdrop-blur">
              {pct}%
            </span>
          )}
        </div>
      </div>
      {/* 底部：标题 + 描述 + 进度条 */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <h3 className="font-serif text-sm text-bone tracking-wide truncate mb-0.5 drop-shadow">
          {p.title}
        </h3>
        <p className="text-[10px] text-bone/75 leading-snug line-clamp-2 mb-1.5 drop-shadow">
          {p.desc}
        </p>
        {total > 0 && pct > 0 && (
          <div className="h-0.5 bg-bone/15 overflow-hidden rounded-full">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${pct}%`, background: accent }}
            />
          </div>
        )}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-bone/60 tabular-nums">
            {total > 0 ? `${visited} / ${total}` : '无限探索'}
          </span>
          <span
            className="font-serif text-[10px] tracking-widest transition-transform group-hover:translate-x-0.5"
            style={{ color: accent }}
          >
            进入 →
          </span>
        </div>
      </div>
    </button>
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
  size = 'normal',
  className = '',
}: {
  path: { id: string; icon: string; title: string; desc: string; color: string; imageKeyword: string; imageUrl?: string }
  visited: number
  total: number
  onClick: () => void
  highlight?: boolean
  /** 可选的卡片专属预览元素（如朝代时间线卡的小型时间线） */
  preview?: ReactNode
  /** bento 排版：大卡（2×2） vs 小卡（1×1） vs 竖卡（1×2） */
  size?: 'large' | 'normal' | 'tall'
  /** 额外的 className（如 col-span/row-span） */
  className?: string
}) {
  const pct = total > 0 ? Math.round((visited / total) * 100) : 0
  const isNew = highlight
  const accent = p.color
  const isLarge = size === 'large'
  const isTall = size === 'tall'
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-lg transition-all hover:translate-y-[-3px] focus:outline-none h-full text-left flex flex-col ${className}`}
      style={{
        boxShadow: isNew
          ? '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgb(var(--vermilion-rgb) / 0.5), inset 0 0 0 1px rgb(var(--gold-rgb) / 0.4)'
          : '0 4px 12px rgba(0,0,0,0.25), inset 0 0 0 1px rgb(var(--gold-rgb) / 0.3)',
        background: 'rgb(var(--bg-card-rgb) / 0.95)',
      }}
    >
      {/* 顶部彩色边条 */}
      <div className="h-1 shrink-0" style={{ background: accent }} aria-hidden />

      {/* 主体区：左 icon + 右标题（无图片） */}
      <div className={`flex-1 flex ${
          isLarge ? 'flex-col p-3 gap-2' :
          isTall ? 'flex-col p-2 gap-1.5' :
          'flex-row items-center gap-2 p-2'
        }`}>
        {/* 左上 / 大卡顶部 icon */}
        <div
          className={`shrink-0 flex items-center justify-center rounded-md ${
            isLarge ? 'w-12 h-12 text-3xl' :
            isTall ? 'w-9 h-9 text-lg' :
            'w-9 h-9 text-lg'
          }`}
          style={{
            background: `linear-gradient(135deg, ${accent}33 0%, ${accent}66 100%)`,
            boxShadow: `0 0 12px ${accent}33`,
            border: `1px solid ${accent}55`,
          }}
        >
          {p.icon}
        </div>

        {/* 文字主体 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <h3
              className={`font-brush tracking-wider leading-tight truncate ${
                isLarge ? 'text-lg' :
                isTall ? 'text-sm' :
                'text-xs'
              }`}
              style={{ color: accent }}
            >
              {p.title}
            </h3>
            {isNew && (
              <span
                className="font-brush text-[10px] px-1.5 py-0.5 rounded-[2px] shrink-0"
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

          <p className={`leading-snug mt-0.5 ${
               isLarge ? 'text-xs' :
               isTall ? 'text-[10px] line-clamp-2' :
               'text-[10px] line-clamp-1'
             }`}
             style={{ color: 'rgb(var(--text-primary-rgb) / 0.85)' }}>
            {p.desc}
          </p>

          {/* 预览元素（朝代时间线小图） */}
          {preview && <div className={isLarge ? 'mt-3' : 'hidden'}>{preview}</div>}

          {/* 进度条 / 占位 */}
          {hasProgress(visited, total) ? (
            <div className={isLarge ? 'mt-3' : isTall ? 'mt-1.5' : 'mt-1.5'}>
              <div className="text-[10px] tabular-nums mb-1 flex justify-between" style={{ color: 'rgb(var(--text-secondary-rgb))' }}>
                <span>已学 {visited} / {total}</span>
                <span>{pct}%</span>
              </div>
              <div className="relative h-1 bg-ink-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}80 0%, ${accent} 100%)` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-[10px] italic mt-1.5" style={{ color: 'rgb(var(--text-faint-rgb))' }}>
              — 待启程 —
            </div>
          )}
        </div>
      </div>

      {/* 底部细线 */}
      <div
        className="h-px shrink-0"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accent}55 50%, transparent 100%)`,
        }}
        aria-hidden
      />
    </button>
  )
}

function hasProgress(visited: number, total: number): boolean {
  return visited > 0 && total > 0
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
            className={`absolute top-1/2 w-1.5 h-1.5 rounded-full transition-all node-scale-in hover:scale-[2.5] hover:shadow-lg ${
              isVisited
                ? 'bg-green-400 hover:bg-green-300'
                : isChina
                  ? 'bg-vermilion-500/40 hover:bg-vermilion-400'
                  : 'bg-ink-500/40 hover:bg-parchment-50'
            }`}
            style={{ left: `calc(${x}% - 3px)`, transform: 'translateY(-50%)', animationDelay: `${Math.abs(x) * 0.02}s` }}
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

// ===== FilmstripGallery =====
// Filmstrip 横向画廊（rolandomolalia.com 风）：
// - 默认每张卡极窄（~52px 竖向条），竖排标题 + 进度条可见
// - hover 时该卡平滑展开到 ~420px，显示完整背景图 + 标题 + 描述 + CTA
// - 鼠标离开整排回到默认（首个卡为活动态）
// - 点击直接进入对应路径
function FilmstripGallery({
  paths,
  getVisited,
  getTotal,
  onEnterPath,
  onEnterLadder,
  onOpenEraList,
  onOpenThoughts,
  onOpenTechnology,
  onOpenReligion,
  newPathId,
}: {
  paths: { id: string; icon: string; title: string; desc: string; color: string; imageKeyword: string; imageUrl?: string }[]
  getVisited: (id: string) => number
  getTotal: (id: string) => number
  onEnterPath: (id: PathId) => void
  onEnterLadder: () => void
  onOpenEraList: () => void
  onOpenThoughts?: () => void
  onOpenTechnology?: () => void
  onOpenReligion?: () => void
  newPathId?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState<string | null>(paths[0]?.id ?? null)

  // 入场：所有卡从下方淡入
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const cards = containerRef.current?.querySelectorAll<HTMLElement>(':scope > button')
    if (!cards || !cards.length) return
    gsap.from(cards, {
      opacity: 0,
      y: 24,
      scale: 0.94,
      duration: 0.55,
      stagger: 0.03,
      ease: 'power3.out',
    })
  }, [])

  const handleClick = (id: string) => {
    if (id === 'ladder') onEnterLadder()
    else if (id === 'timeline') onOpenEraList()
    else if (id === 'allThoughts') onOpenThoughts?.()
    else if (id === 'allTechnology') onOpenTechnology?.()
    else if (id === 'allReligion') onOpenReligion?.()
    else onEnterPath(id as PathId)
  }

  return (
    <div className="relative mb-6 w-full">
      {/* 左右淡出蒙版 — 仅在溢出时显示（hover 时通过 :hover 显示提示箭头） */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-ink-900 to-transparent opacity-0 group-hover/strip:opacity-100 transition-opacity" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l from-ink-900 to-transparent opacity-0 group-hover/strip:opacity-100 transition-opacity" />

      <div
        ref={containerRef}
        className="group/strip flex items-stretch gap-1.5 h-[400px] w-full"
        onMouseLeave={() => setActiveId(paths[0]?.id ?? null)}
      >
        {paths.map((p) => {
          const isActive = activeId === p.id
          const visited = getVisited(p.id)
          const total = getTotal(p.id)
          const pct = total > 0 ? Math.round((visited / total) * 100) : 0
          const isNew = p.id === newPathId
          return (
            <button
              key={p.id}
              onMouseEnter={() => setActiveId(p.id)}
              onClick={() => handleClick(p.id)}
              className="group relative h-full rounded-xl overflow-hidden text-left focus:outline-none"
              style={{
                // ⚡ 默认态：flex:1 1 0（自动均分父容器宽度），14 张卡全可见
                // 激活态：固定 ~38vw 让位，活动卡大、其余小
                flex: isActive ? '0 0 auto' : '1 1 0',
                width: isActive ? 'min(420px, 38vw)' : undefined,
                minWidth: isActive ? 'min(420px, 38vw)' : '56px',
                transition:
                  'flex 0.65s cubic-bezier(0.2, 0.8, 0.3, 1), width 0.65s cubic-bezier(0.2, 0.8, 0.3, 1), box-shadow 0.5s ease, min-width 0.65s ease',
                background: 'rgb(var(--bg-card-rgb) / 0.85)',
                boxShadow: isActive
                  ? '0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgb(var(--gold-rgb) / 0.5)'
                  : '0 4px 12px rgba(0,0,0,0.35), inset 0 0 0 1px rgb(var(--gold-rgb) / 0.2)',
              }}
              aria-label={`${p.title} — ${p.desc}`}
            >
              {/* 背景图（激活态轻微放大；降级色作为网络失败占位） */}
              <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundColor: p.color + '60',
                  backgroundImage: `url(${p.imageUrl ?? bingImage(p.imageKeyword, 480, 480)})`,
                  transform: isActive ? 'scale(1.05)' : 'scale(1.2)',
                  transition: 'transform 0.7s ease',
                }}
              />
              {/* 暗色蒙版（顶轻底重；激活态更深以便文字可读） */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: isActive
                    ? 'linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.88) 100%)'
                    : 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.70) 100%)',
                  transition: 'background 0.5s ease',
                }}
              />

              {/* 收起态：朱砂印章 + 竖排衬底文字 + 进度 */}
              {!isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-between py-3 z-10 pointer-events-none">
                  {/* 顶部：朱砂小印章（首字，旋转 -8°） */}
                  <div
                    className="w-7 h-7 flex items-center justify-center rounded-[1px] font-brush shrink-0"
                    style={{
                      background: p.color,
                      color: '#fdf8f0',
                      fontSize: '15px',
                      fontWeight: 700,
                      lineHeight: 1,
                      transform: 'rotate(-8deg)',
                      boxShadow:
                        '0 2px 4px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.18)',
                    }}
                    aria-hidden
                  >
                    {p.title.charAt(0)}
                  </div>

                  {/* 中部：竖排全名（深色 backdrop 保证双主题可读） */}
                  <div className="flex-1 flex items-end justify-center w-full py-3">
                    <span
                      className="font-serif text-[10px] tracking-[0.3em] whitespace-nowrap rounded-sm"
                      style={{
                        writingMode: 'vertical-rl',
                        color: '#fdf8f0',
                        background: 'rgba(14, 12, 10, 0.5)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        paddingBlock: '6px',
                        paddingInline: '3px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                      }}
                    >
                      {p.title}
                    </span>
                  </div>

                  {/* 底部：进度条 / 计数 */}
                  {visited > 0 && pct > 0 ? (
                    <div
                      className="relative w-1 h-12 rounded-full overflow-hidden shrink-0"
                      style={{ background: 'rgba(253, 248, 240, 0.22)' }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-full"
                        style={{ height: `${pct}%`, background: p.color }}
                      />
                    </div>
                  ) : (
                    <span
                      className="text-[8px] tabular-nums shrink-0"
                      style={{
                        color: '#fdf8f0',
                        textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                      }}
                    >
                      {total > 0 ? `0/${total}` : '∞'}
                    </span>
                  )}
                </div>
              )}

              {/* 展开态：完整内容 */}
              {isActive && (
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 text-bone">
                  {/* 顶部：图标 + 徽章 */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl drop-shadow">{p.icon}</span>
                    <div className="flex items-center gap-1">
                      {isNew && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-vermilion-500/90 text-bone font-bold tracking-wider">
                          NEW
                        </span>
                      )}
                      {visited > 0 && pct > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-vermilion-500/85 text-bone font-bold backdrop-blur">
                          {pct}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 底部：标题 + 描述 + 进度 + CTA */}
                  <div>
                    <h3 className="font-serif text-2xl text-bone tracking-wide mb-2 drop-shadow">
                      {p.title}
                    </h3>
                    <p className="text-xs text-bone/85 leading-relaxed line-clamp-3 mb-3 drop-shadow">
                      {p.desc}
                    </p>
                    {total > 0 && pct > 0 && (
                      <div className="h-0.5 bg-bone/15 overflow-hidden rounded-full mb-2">
                        <div
                          className="h-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: p.color }}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-bone/70 tracking-widest">
                      <span className="tabular-nums">
                        {total > 0 ? `${visited} / ${total}` : '无限探索'}
                      </span>
                      <span className="font-serif">点击进入 →</span>
                    </div>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}