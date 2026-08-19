import { useEffect, useReducer, useRef, lazy, Suspense } from 'react'
import { useReducedMotionGlobal } from '@/hooks/useReducedMotion'
import WorldMap from '@/components/AmapTest' // legacy alias
import Timeline from '@/components/Timeline/Timeline'
import EventDetail from '@/components/DetailPanel/EventDetail'
import EraDetail from '@/components/DetailPanel/EraDetail'
import NotesPanel from '@/components/NotesPanel/NotesPanel'
import SearchBar from '@/components/SearchBar'
import TimeMachine from '@/components/TimeMachine'
import FilterPanel from '@/components/FilterPanel'
import QuizLauncher from '@/components/Quiz/QuizLauncher'
import ToastHost from '@/components/ToastHost'
import PoemMapPinCard from '@/components/Poems/PoemMapPinCard'
import AmbientBackground from '@/components/AmbientBackground'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useNotesStore } from '@/store/useNotesStore'
import { useCardsStore } from '@/store/useCardsStore'
import { useGoalStore } from '@/store/useGoalStore'
import { isDue } from '@/utils/sm2'
import { countTodayReviews } from '@/utils/cardStats'
import { formatYear } from '@/utils/time'
import NotesOverview from '@/components/NotesOverview'
import TMapTest from '@/components/AmapTest'
import LadderPanel from '@/components/Ladder/LadderPanel'
import Dashboard from '@/components/Dashboard'
import AIChatPanel from '@/components/AIChatPanel'
import ScenarioPlayer from '@/components/TimeTravel/ScenarioPlayer'
import FlashcardsTrigger from '@/components/Flashcards/FlashcardsTrigger'
import { useLearningPathStore } from '@/store/useLearningPathStore'
import { useApiKeysStore } from '@/store/useApiKeysStore'
import { audioEngine } from '@/utils/audioEngine'
import {
  layoutReducer,
  getInitialLayoutState,
  shouldShowTimeline,
  pathEntryToAction,
  isOverlayActive,
  type LayoutAction,
} from './Layout/layoutReducer'

// 次要页 lazy 化：d3-force / react-markdown 等大依赖按需加载，缩小首屏主 bundle
const RelationshipGraph = lazy(() => import('@/components/RelationshipGraph'))
const FiguresOverview = lazy(() => import('@/components/Figures/FiguresOverview'))
const WarsOverview = lazy(() => import('@/components/Wars/WarsOverview'))
const CulturesOverview = lazy(() => import('@/components/Cultures/CulturesOverview'))
const GeographyOverview = lazy(() => import('@/components/Geography/GeographyOverview'))
const TimeTravelLobby = lazy(() => import('@/components/TimeTravel/TimeTravelLobby'))
const FlashcardsPanel = lazy(() => import('@/components/Flashcards/FlashcardsPanel'))
const GoalSettings = lazy(() => import('@/components/Flashcards/GoalSettings'))
const PoemsOverview = lazy(() => import('@/components/Poems/PoemsOverview'))
const CivilizationsOverview = lazy(() => import('@/components/Civilizations/CivilizationsOverview'))
const QuestionsOverview = lazy(() => import('@/components/Questions/QuestionsOverview'))
const ArtsOverview = lazy(() => import('@/components/Arts/ArtsOverview'))
const WorldHistoryOverview = lazy(() => import('@/components/WorldHistory/WorldHistoryOverview'))
const ApiKeysSettings = lazy(() => import('@/components/Settings/ApiKeysSettings'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-full text-ink-400">
      <div className="animate-pulse text-sm">载入中…</div>
    </div>
  )
}

/**
 * `history:*` 事件 → Action 的映射
 *
 * 之前有 5 个独立的 useEffect（每个挂一个 window listener），现在合并为一个。
 * 增删一条 reopen 路径只需在此表加一行。
 */
const HISTORY_EVENT_TO_ACTION: Record<string, LayoutAction> = {
  'history:go-dashboard': { type: 'OPEN_HOME' },
  // `history:enter-map` 由 useJumpToMap 主动 dispatch，含义是「退出所有覆盖层 + 切到 map」；
  // viewMode 同步由 useJumpToMap 自己 setViewMode('map')。
  'history:enter-map': { type: 'OPEN_MAP' },
  'history:go-geography': { type: 'OPEN_GEOGRAPHY' },
  'history:go-wars': { type: 'OPEN_WARS' },
  'history:go-cultures': { type: 'OPEN_CULTURES' },
  'history:go-poems': { type: 'OPEN_POEMS' },
  'history:go-civilizations': { type: 'OPEN_CIVILIZATIONS' },
}

export default function Layout() {
  // 响应 prefers-reduced-motion —— 全局禁用 GSAP 动画
  useReducedMotionGlobal()

  // ============ 历史 store（全局） ============
  const {
    currentYear, selectedEventId, selectedEraId,
    selectEvent, selectEra,
    setViewMode,                             // viewMode 同步到 store（URL 持久化）
    detailView, setDetailView,
    mapFocusTarget, setMapFocus,
    setMapPosition,
  } = useHistoryStore()

  // ============ Layout 局部状态机 ============
  const [ui, dispatch] = useReducer(layoutReducer, undefined, getInitialLayoutState)
  const main = ui.main

  // ============ 其他 store 派生 ============
  const notesCount = useNotesStore(s => Object.keys(s.notes).length)
  const cardsCount = useCardsStore(s => Object.keys(s.cards).length)
  const dueCount = useCardsStore(s => {
    const now = Date.now()
    return Object.values(s.cards).filter(c => isDue(c, now)).length
  })
  const goalTarget = useGoalStore(s => s.target)
  const todayCount = useCardsStore(s => countTodayReviews(s.cards))
  const eraSelectionHistory = useHistoryStore(s => s.eraSelectionHistory)
  const undoEraSelect = useHistoryStore(s => s.undoEraSelect)

  // ============ More 菜单：click-outside 关闭 ============
  const moreMenuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ui.moreMenuOpen) return
    const onDown = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        dispatch({ type: 'CLOSE_MORE_MENU' })
      }
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [ui.moreMenuOpen])

  // ============ 合并的 history:* 事件监听（替代 5 个重复 useEffect） ============
  useEffect(() => {
    const handler = (e: Event) => {
      const action = HISTORY_EVENT_TO_ACTION[e.type]
      if (action) dispatch(action)
    }
    Object.keys(HISTORY_EVENT_TO_ACTION).forEach(name => {
      window.addEventListener(name, handler)
    })
    return () => {
      Object.keys(HISTORY_EVENT_TO_ACTION).forEach(name => {
        window.removeEventListener(name, handler)
      })
    }
  }, [])

  // ============ mapFocusTarget 兜底：直接进入地图视图 ============
  // 当某些边缘路径绕过 history:enter-map 事件时，这里强制切到地图。
  useEffect(() => {
    if (!mapFocusTarget) return
    setViewMode('map')
    if (main.mode !== 'map') dispatch({ type: 'OPEN_MAP' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapFocusTarget])

  // ============ selectedEventId/selectedEraId → 自动切换 detailView ============
  // 仅当从 null 变成非 null 时重置（避免覆盖 NotesOverview 主动设置的 'notes'）
  const prevSelectedRef = useRef<{ event: string | null; era: string | null } | null>(null)
  useEffect(() => {
    const prev = prevSelectedRef.current
    const becameSelected =
      prev !== null &&
      ((prev.event == null && selectedEventId) || (prev.era == null && selectedEraId))
    const initialMount = prev === null
    prevSelectedRef.current = { event: selectedEventId, era: selectedEraId }
    if (initialMount) {
      if (selectedEventId && !selectedEraId) setDetailView('event')
      else if (selectedEraId && !selectedEventId) setDetailView('era')
      else if (!selectedEventId && !selectedEraId) setDetailView('event')
    } else if (becameSelected) {
      if (detailView === 'notes') return
      if (selectedEventId && !selectedEraId) setDetailView('event')
      else if (selectedEraId && !selectedEventId) setDetailView('era')
    }
  }, [selectedEventId, selectedEraId, setDetailView, detailView])

  // ============ 详情面板可见性 ============
  const showDetailPanel = !!selectedEventId || !!selectedEraId
  const bothSelected = !!(selectedEventId && selectedEraId)
  const showEvent = detailView === 'event' && !!selectedEventId
  const showEra = detailView === 'era' && !!selectedEraId
  const showNotes = detailView === 'notes' && (!!selectedEventId || !!selectedEraId)
  const notesTarget = selectedEventId
    ? { kind: 'event' as const, id: selectedEventId }
    : selectedEraId
    ? { kind: 'era' as const, id: selectedEraId }
    : null

  // ============ ESC 键盘：总览/复习页激活时由内部处理，详情面板/朝代撤销由这里 ============
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (main.mode === 'overview' || main.mode === 'flashcards') return  // 各自内部处理
      if (showDetailPanel) {
        selectEvent(null)
        selectEra(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [main.mode, showDetailPanel, selectEvent, selectEra])

  // ============ 全局键盘快捷键 ============
  // 用 ref 模式把所有 setter 缓存到 ref，effect 只挂一次（避免 13 个依赖导致的重渲染）
  const handlersRef = useRef({
    main, dueCount, eraSelectionHistory,
    selectEvent, selectEra, undoEraSelect, setViewMode, dispatch,
    currentYear: useHistoryStore.getState().currentYear,  // 实时读，下面会同步
  })

  // 同步最新状态到 ref（每次渲染后）
  handlersRef.current = {
    main, dueCount, eraSelectionHistory,
    selectEvent, selectEra, undoEraSelect, setViewMode, dispatch,
    currentYear,
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const { main, dueCount, eraSelectionHistory, selectEvent, selectEra, undoEraSelect, setViewMode, dispatch, currentYear } = handlersRef.current

      // Esc: 关闭详情面板 / 撤销朝代 / 退出覆盖层
      if (e.key === 'Escape') {
        if (selectedEventIdRef.current) { selectEvent(null); e.preventDefault(); return }
        if (selectedEraIdRef.current && eraSelectionHistory.length > 0) {
          undoEraSelect(); e.preventDefault(); return
        }
        if (selectedEraIdRef.current) { selectEra(null); e.preventDefault(); return }
        // 主视图层级退出（timeTravel 单独处理 scenarioId）
        if (main.mode === 'timeTravel' && main.scenarioId !== null) {
          dispatch({ type: 'EXIT_SCENARIO' }); e.preventDefault(); return
        }
        if (main.mode === 'timeTravel' && main.scenarioId === null) {
          dispatch({ type: 'OPEN_HOME' }); e.preventDefault(); return
        }
        if (main.mode !== 'home' && main.mode !== 'map' && main.mode !== 'graph') {
          dispatch({ type: 'LEAVE_OVERLAY' }); e.preventDefault(); return
        }
      }

      // u: 撤销朝代选择
      if (e.key === 'u' || e.key === 'U') {
        if (eraSelectionHistory.length > 0) {
          undoEraSelect(); e.preventDefault(); return
        }
      }

      // ← / →: ±1 年；Shift + ±10 年
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const step = e.shiftKey ? 10 : 1
        const delta = e.key === 'ArrowLeft' ? -step : step
        useHistoryStore.getState().setYear(currentYear + delta)
        e.preventDefault()
        return
      }

      // g: 切到地图视图
      if (e.key === 'g' || e.key === 'G') {
        if (main.mode !== 'map') {
          setViewMode('map')
          dispatch({ type: 'OPEN_MAP' })
        }
        e.preventDefault()
        return
      }

      // r: 切到关系图谱
      if (e.key === 'r' || e.key === 'R') {
        if (main.mode !== 'graph') {
          setViewMode('graph')
          dispatch({ type: 'OPEN_GRAPH' })
        }
        e.preventDefault()
        return
      }

      // f: 打开复习卡片（仅当有待复习时）
      if (e.key === 'f' || e.key === 'F') {
        if (dueCount > 0 && main.mode !== 'flashcards') {
          dispatch({ type: 'OPEN_FLASHCARDS' })
        }
        e.preventDefault()
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // 单独 ref 跟踪 useHistoryStore 里两个常变字段（避免 13 依赖）
  const selectedEventIdRef = useRef(selectedEventId)
  selectedEventIdRef.current = selectedEventId
  const selectedEraIdRef = useRef(selectedEraId)
  selectedEraIdRef.current = selectedEraId

  // ============ 渲染分支 ============
  // 渲染主区域（基于 main.mode）
  const renderMain = () => {
    switch (main.mode) {
      case 'home':
        return null  // 走外层 <Dashboard /> 分支
      case 'map':
        return <TMapTest />
      case 'graph':
        return (
          <Suspense fallback={<PageFallback />}>
            <RelationshipGraph />
          </Suspense>
        )
      case 'flashcards':
        return (
          <Suspense fallback={<PageFallback />}>
            <FlashcardsPanel isActive onClose={() => dispatch({ type: 'OPEN_HOME' })} />
          </Suspense>
        )
      case 'overview':
        return (
          <NotesOverview
            variant="page"
            isActive
            onClose={() => dispatch({ type: 'OPEN_HOME' })}
          />
        )
      case 'figures':
        return (
          <Suspense fallback={<PageFallback />}>
            <FiguresOverview
              isActive
              initialPersonId={main.initialPersonId}
              onClose={() => dispatch({ type: 'OPEN_HOME' })}
            />
          </Suspense>
        )
      case 'wars':
        return (
          <Suspense fallback={<PageFallback />}>
            <WarsOverview
              isActive
              onClose={() => dispatch({ type: 'OPEN_HOME' })}
              onViewOnMap={() => {
                setViewMode('map')
                dispatch({ type: 'OPEN_MAP' })
              }}
            />
          </Suspense>
        )
      case 'cultures':
        return (
          <Suspense fallback={<PageFallback />}>
            <CulturesOverview
              isActive
              onClose={() => dispatch({ type: 'OPEN_HOME' })}
            />
          </Suspense>
        )
      case 'geography':
        return (
          <Suspense fallback={<PageFallback />}>
            <GeographyOverview
              isActive
              onClose={() => dispatch({ type: 'OPEN_HOME' })}
            />
          </Suspense>
        )
      case 'poems':
        return (
          <Suspense fallback={<PageFallback />}>
            <PoemsOverview
              isActive
              onClose={() => dispatch({ type: 'OPEN_HOME' })}
            />
          </Suspense>
        )
      case 'civilizations':
        return (
          <Suspense fallback={<PageFallback />}>
            <CivilizationsOverview
              isActive
              onClose={() => dispatch({ type: 'OPEN_HOME' })}
            />
          </Suspense>
        )
      case 'timeTravel':
        return main.scenarioId !== null ? (
          <ScenarioPlayer
            scenarioId={main.scenarioId}
            onExit={() => dispatch({ type: 'EXIT_SCENARIO' })}
          />
        ) : (
          <Suspense fallback={<PageFallback />}>
            <TimeTravelLobby
              isActive
              onClose={() => dispatch({ type: 'OPEN_HOME' })}
              onStart={(scenarioId) => dispatch({ type: 'START_SCENARIO', scenarioId })}
            />
          </Suspense>
        )
      case 'ladder':
        return (
          <LadderPanel onClose={() => dispatch({ type: 'OPEN_HOME' })} />
        )
      case 'questions':
        return (
          <Suspense fallback={<PageFallback />}>
            <QuestionsOverview
              isActive
              onClose={() => dispatch({ type: 'OPEN_HOME' })}
            />
          </Suspense>
        )
      case 'arts':
        return (
          <Suspense fallback={<PageFallback />}>
            <ArtsOverview
              isActive
              onClose={() => dispatch({ type: 'OPEN_HOME' })}
            />
          </Suspense>
        )
      case 'worldHistory':
        return (
          <Suspense fallback={<PageFallback />}>
            <WorldHistoryOverview
              isActive
              onClose={() => dispatch({ type: 'OPEN_HOME' })}
            />
          </Suspense>
        )
    }
  }

  // home 模式渲染 Dashboard，其他模式渲染 renderMain()
  const showHome = main.mode === 'home'
  const showTimeline = shouldShowTimeline(main)

  return (
    <div className="h-screen w-screen flex flex-col bg-ink-900 text-parchment-50 ink-wash-bg overflow-hidden">
      {/* 顶部 Header */}
      <header
        className="flex items-center justify-between px-6 py-2.5 border-b border-ink-600 bg-ink-800/80 backdrop-blur z-10"
        style={{ borderBottomColor: 'rgba(110, 101, 87, 0.4)' }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-3 shrink-0">
            {/* 朱砂印章 logo（墨·朱砂 v2） */}
            <div className="vermilion-seal vermilion-seal-stamped" style={{ width: 32, height: 32, fontSize: 16, transform: 'rotate(-12deg)' }}>
              史
            </div>
            <h1 className="text-lg font-serif text-bone tracking-wide">历史探索者</h1>
            <span className="text-xs text-faint hidden lg:inline tracking-widest uppercase">History · Explorer</span>
          </div>
          <SearchBar />
          <TimeMachine />
          <FilterPanel />
          {/* 视图切换按钮组 */}
          <div className="flex rounded-lg bg-ink-700/80 border border-ink-600 overflow-hidden shrink-0">
            <button
              className={`px-2.5 py-1.5 text-xs shrink-0 whitespace-nowrap transition-colors ${
                main.mode === 'map'
                  ? 'bg-vermilion-500/30 text-vermilion-300'
                  : 'text-ink-500 hover:text-parchment-50 hover:bg-ink-600'
              }`}
              onClick={() => {
                audioEngine.playClick()
                setViewMode('map')
                dispatch({ type: 'OPEN_MAP' })
              }}
              title="地图视图"
            >
              🗺️ 地图
            </button>
            <button
              className={`px-2.5 py-1.5 text-xs shrink-0 whitespace-nowrap transition-colors ${
                main.mode === 'graph'
                  ? 'bg-vermilion-500/30 text-vermilion-300'
                  : 'text-ink-500 hover:text-parchment-50 hover:bg-ink-600'
              }`}
              onClick={() => {
                audioEngine.playClick()
                setViewMode('graph')
                dispatch({ type: 'OPEN_GRAPH' })
              }}
              title="关系图谱"
            >
              🕸️ 图谱
            </button>
          </div>
          {/* 学习引导（核心返回入口） */}
          <button
            className={`px-2.5 py-1.5 rounded-lg shrink-0 whitespace-nowrap text-xs flex items-center gap-1.5 transition-colors border ${
              main.mode === 'home'
                ? 'bg-vermilion-500/30 text-vermilion-300 border-vermilion-500/60'
                : 'bg-ink-700/80 hover:bg-vermilion-500/30 border-ink-600 text-bronze-400'
            }`}
            onClick={() => { audioEngine.playModalClose(); dispatch({ type: 'OPEN_HOME' }) }}
            title="返回学习引导主页"
          >
            🏠 学习引导
          </button>
          {/* 复习按钮（带数字徽章） */}
          <FlashcardsTrigger
            dueCount={dueCount}
            todayCount={todayCount}
            target={goalTarget}
            active={main.mode === 'flashcards'}
            onClick={() => dispatch({ type: 'OPEN_FLASHCARDS' })}
          />
          {/* 更多菜单 */}
          <div className="relative shrink-0" ref={moreMenuRef}>
            <button
              className={`px-2 py-1.5 rounded-lg whitespace-nowrap text-xs flex items-center gap-1 transition-colors border relative ${
                ui.moreMenuOpen || main.mode === 'overview'
                  ? 'bg-vermilion-500/30 text-vermilion-300 border-vermilion-500/60'
                  : 'bg-ink-700/80 hover:bg-ink-600 border-ink-600 text-bronze-400'
              }`}
              onClick={() => { audioEngine.playClick(); dispatch({ type: 'TOGGLE_MORE_MENU' }) }}
              title="更多"
              aria-haspopup="menu"
              aria-expanded={ui.moreMenuOpen}
            >
              ⋯ 更多
              {notesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-vermilion-500 ring-2 ring-ink-800" />
              )}
            </button>
            {ui.moreMenuOpen && (
              <div
                className="absolute top-full right-0 mt-1 w-44 py-1 rounded-lg bg-ink-800 border border-ink-600 shadow-2xl z-50"
                role="menu"
              >
                <button
                  className="w-full text-left px-3 py-2 text-xs text-parchment-50 hover:bg-ink-700 flex items-center justify-between gap-2 transition-colors"
                  onClick={() => {
                    audioEngine.playModalOpen()
                    dispatch({ type: 'CLOSE_MORE_MENU' })
                    dispatch({ type: 'OPEN_OVERVIEW' })
                  }}
                  role="menuitem"
                >
                  <span>📒 我的笔记</span>
                  {notesCount > 0 && <span className="text-ink-500">{notesCount}</span>}
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-xs text-parchment-50 hover:bg-ink-700 flex items-center justify-between gap-2 transition-colors"
                  onClick={() => {
                    audioEngine.playClick()
                    dispatch({ type: 'CLOSE_MORE_MENU' })
                    dispatch({ type: 'OPEN_GOAL_SETTINGS' })
                  }}
                  role="menuitem"
                >
                  <span>🎯 每日目标</span>
                  <span className="text-ink-500">{goalTarget}</span>
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-xs text-parchment-50 hover:bg-ink-700 flex items-center gap-2 transition-colors border-t border-ink-700 mt-1 pt-2"
                  onClick={() => {
                    audioEngine.playClick()
                    dispatch({ type: 'CLOSE_MORE_MENU' })
                    useApiKeysStore.getState().setModalOpen(true)
                  }}
                  role="menuitem"
                >
                  <span>🔑 API Keys</span>
                  <span className="text-ink-500 text-[10px]">
                    {useApiKeysStore.getState().amapKey ? '已设置' : '未配置'}
                  </span>
                </button>
                {mapFocusTarget && (
                  <button
                    className="w-full text-left px-3 py-2 text-xs text-bronze-300 hover:bg-ink-700 flex items-center gap-2 transition-colors border-t border-ink-700 mt-1 pt-2"
                    onClick={() => {
                      audioEngine.playClick()
                      dispatch({ type: 'CLOSE_MORE_MENU' })
                      setMapFocus(null)
                      setMapPosition({ center: [0, 20], zoom: 1 })
                    }}
                    role="menuitem"
                  >
                    🔄 重置地图视图
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="text-sm font-serif text-ink-500 shrink-0 ml-3">
          当前：<span className="text-bronze-400 text-base ml-1.5">{formatYear(currentYear)}</span>
        </div>
      </header>

      {/* AmbientBackground 动态背景 */}
      <AmbientBackground />

      {/* 中间：主区域 + 详情面板 */}
      <main className="flex-1 min-h-0 flex relative overflow-hidden">
        <div className="flex-1 min-w-0 min-h-0 relative overflow-hidden">
          {showHome ? (
            <Dashboard
              isActive={showHome}
              onEnterMap={() => {
                setViewMode('map')
                dispatch({ type: 'OPEN_MAP' })
              }}
              onEnterPath={(pathId, eraId) => {
                const action = pathEntryToAction(pathId, eraId)
                dispatch(action)
                if (eraId && pathId !== 'allFigures') {
                  useLearningPathStore.getState().recordVisit(pathId, eraId)
                }
              }}
              onEnterLadder={() => dispatch({ type: 'OPEN_LADDER' })}
            />
          ) : (
            renderMain()
          )}
        </div>

        {/* 右侧详情面板 */}
        {showDetailPanel && (
          <aside
            className="border-l border-ink-600 bg-ink-800/95 backdrop-blur overflow-hidden flex flex-col flex-shrink-0"
            style={{ width: '480px' }}
          >
            <div className="flex items-center border-b border-ink-600 text-xs bg-ink-800">
              {bothSelected ? (
                <>
                  <button
                    className={`flex-1 px-3 py-2.5 border-r border-ink-600 transition-colors ${
                      detailView === 'event'
                        ? 'bg-vermilion-500/30 text-vermilion-300 border-b-2 border-vermilion-500'
                        : 'text-ink-500 hover:bg-ink-700 hover:text-parchment-50'
                    }`}
                    onClick={() => setDetailView('event')}
                  >
                    📅 事件
                  </button>
                  <button
                    className={`flex-1 px-3 py-2.5 border-r border-ink-600 transition-colors ${
                      detailView === 'era'
                        ? 'bg-vermilion-500/30 text-vermilion-300 border-b-2 border-vermilion-500'
                        : 'text-ink-500 hover:bg-ink-700 hover:text-parchment-50'
                    }`}
                    onClick={() => setDetailView('era')}
                  >
                    🏛️ 朝代
                  </button>
                  <button
                    className={`flex-1 px-3 py-2.5 border-r border-ink-600 transition-colors ${
                      detailView === 'notes'
                        ? 'bg-vermilion-500/30 text-vermilion-300 border-b-2 border-vermilion-500'
                        : 'text-ink-500 hover:bg-ink-700 hover:text-parchment-50'
                    }`}
                    onClick={() => setDetailView('notes')}
                  >
                    📝 笔记
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`flex-1 px-3 py-2.5 border-r border-ink-600 transition-colors ${
                      detailView !== 'notes'
                        ? 'bg-vermilion-500/30 text-vermilion-300 border-b-2 border-vermilion-500'
                        : 'text-ink-500 hover:bg-ink-700 hover:text-parchment-50'
                    }`}
                    onClick={() => setDetailView(selectedEventId ? 'event' : 'era')}
                  >
                    {selectedEventId ? '📅 事件详情' : '🏛️ 朝代详情'}
                  </button>
                  <button
                    className={`flex-1 px-3 py-2.5 border-r border-ink-600 transition-colors ${
                      detailView === 'notes'
                        ? 'bg-vermilion-500/30 text-vermilion-300 border-b-2 border-vermilion-500'
                        : 'text-ink-500 hover:bg-ink-700 hover:text-parchment-50'
                    }`}
                    onClick={() => setDetailView('notes')}
                  >
                    📝 笔记
                  </button>
                </>
              )}
              <button
                className="px-3 py-2.5 text-ink-500 hover:text-parchment-50 hover:bg-red-900/40 text-base transition-colors"
                onClick={() => {
                  selectEvent(null)
                  selectEra(null)
                }}
                title="关闭 (ESC)"
                aria-label="关闭"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {showEvent && selectedEventId && <EventDetail eventId={selectedEventId} />}
              {showEra && selectedEraId && <EraDetail eraId={selectedEraId} />}
              {showNotes && notesTarget && (
                <NotesPanel kind={notesTarget.kind} targetId={notesTarget.id} />
              )}
            </div>
          </aside>
        )}
      </main>

      {/* 底部：时间轴 */}
      {showTimeline && (
        <footer className="relative z-10">
          <Timeline />
        </footer>
      )}

      {/* 键盘快捷键提示 */}
      <div className="fixed bottom-1 right-2 z-50 px-2 py-1 rounded-lg bg-ink-800/90 border border-ink-600 text-xs text-ink-500 leading-relaxed pointer-events-none opacity-70 hover:opacity-100 transition-opacity">
        <kbd className="px-1 bg-ink-700 rounded-lg">←</kbd>/<kbd className="px-1 bg-ink-700 rounded-lg">→</kbd> 年份 · <kbd className="px-1 bg-ink-700 rounded-lg">Esc</kbd> 关闭/回退 · <kbd className="px-1 bg-ink-700 rounded-lg">u</kbd> 回退朝代 · <kbd className="px-1 bg-ink-700 rounded-lg">g</kbd> 地图 · <kbd className="px-1 bg-ink-700 rounded-lg">r</kbd> 图谱 · <kbd className="px-1 bg-ink-700 rounded-lg">f</kbd> 复习 · <kbd className="px-1 bg-ink-700 rounded-lg">Cmd+K</kbd>/<kbd className="px-1 bg-ink-700 rounded-lg">?</kbd> AI 问
      </div>

      {/* 学习目标设置浮层 */}
      <Suspense fallback={null}>
        <GoalSettings
          isOpen={ui.goalSettingsOpen}
          onClose={() => dispatch({ type: 'CLOSE_GOAL_SETTINGS' })}
        />
      </Suspense>

      {/* 第三方 API Key 设置浮层 */}
      <Suspense fallback={null}>
        <ApiKeysSettings
          isOpen={useApiKeysStore(s => s.modalOpen)}
          onClose={() => useApiKeysStore.getState().setModalOpen(false)}
        />
      </Suspense>
      <AIChatPanel />
      <QuizLauncher />
      <ToastHost />
      {/* 诗词地图图钉浮层（地图模式右上角） */}
      <PoemMapPinCard
        onJumpToAllPoems={() => dispatch({ type: 'OPEN_POEMS' })}
      />
    </div>
  )
}
