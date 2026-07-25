import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { useReducedMotionGlobal } from '@/hooks/useReducedMotion'
import WorldMap from '@/components/Map/WorldMap'
import Timeline from '@/components/Timeline/Timeline'
import EventDetail from '@/components/DetailPanel/EventDetail'
import EraDetail from '@/components/DetailPanel/EraDetail'
import NotesPanel from '@/components/NotesPanel/NotesPanel'
import SearchBar from '@/components/SearchBar'
import TimeMachine from '@/components/TimeMachine'
import FilterPanel from '@/components/FilterPanel'
import QuizLauncher from '@/components/Quiz/QuizLauncher'
import ToastHost from '@/components/ToastHost'
import AmbientBackground from '@/components/AmbientBackground'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useNotesStore } from '@/store/useNotesStore'
import { useCardsStore } from '@/store/useCardsStore'
import { useGoalStore } from '@/store/useGoalStore'
import { isDue } from '@/utils/sm2'
import { countTodayReviews } from '@/utils/cardStats'
import { formatYear } from '@/utils/time'
import NotesOverview from '@/components/NotesOverview'
import TMapTest from '@/components/TMapTest'
import Dashboard from '@/components/Dashboard'
import AIChatPanel from '@/components/AIChatPanel'
import ScenarioPlayer from '@/components/TimeTravel/ScenarioPlayer'
import FlashcardsTrigger from '@/components/Flashcards/FlashcardsTrigger'
import { useLearningPathStore, type PathId } from '@/store/useLearningPathStore'

// 次要页 lazy 化：d3-force / react-markdown 等大依赖按需加载，缩小首屏主 bundle
const RelationshipGraph = lazy(() => import('@/components/RelationshipGraph'))
const FiguresOverview = lazy(() => import('@/components/Figures/FiguresOverview'))
const WarsOverview = lazy(() => import('@/components/Wars/WarsOverview'))
const CulturesOverview = lazy(() => import('@/components/Cultures/CulturesOverview'))
const GeographyOverview = lazy(() => import('@/components/Geography/GeographyOverview'))
const TimeTravelLobby = lazy(() => import('@/components/TimeTravel/TimeTravelLobby'))
const FlashcardsPanel = lazy(() => import('@/components/Flashcards/FlashcardsPanel'))
const GoalSettings = lazy(() => import('@/components/Flashcards/GoalSettings'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-full text-ink-400">
      <div className="animate-pulse text-sm">载入中…</div>
    </div>
  )
}

export default function Layout() {
  // 响应 prefers-reduced-motion —— 全局禁用 GSAP 动画
  // 改用全局 timeScale 压缩（比逐个 useEffect 检查更可靠）
  // 注：导入在 build 时按需打包
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  useReducedMotionGlobal()
  const {
    currentYear, selectedEventId, selectedEraId,
    selectEvent, selectEra,
    viewMode, setViewMode,
    detailView, setDetailView,
    mapFocusTarget, setMapFocus,
    setMapPosition,
  } = useHistoryStore()

  // 笔记总数（用于 Header 圆点徽章）
  const notesCount = useNotesStore(s => Object.keys(s.notes).length)

  // Header "更多" 下拉菜单
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!moreMenuOpen) return
    const onDown = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [moreMenuOpen])

  // 复习模式状态
  const [flashcardsActive, setFlashcardsActive] = useState(false)
  const [figuresActive, setFiguresActive] = useState(false)
  const [warsActive, setWarsActive] = useState(false)
  const [culturesActive, setCulturesActive] = useState(false)
  const [geographyActive, setGeographyActive] = useState(false)
  const [timeTravelActive, setTimeTravelActive] = useState(false)
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(null)
  // 从 Dashboard 进入全人物时携带的"默认打开的人物"（来自 onEnterPath 的 eraId 槽位）
  const [initialFigureId, setInitialFigureId] = useState<string | null>(null)
  const [goalSettingsOpen, setGoalSettingsOpen] = useState(false)
  // 待复习卡片数（订阅 store 让徽章实时更新）
  const cardsCount = useCardsStore(s => Object.keys(s.cards).length)
  const dueCount = useCardsStore(s => {
    const now = Date.now()
    return Object.values(s.cards).filter(c => isDue(c, now)).length
  })
  // 学习目标 + 今日已复习
  const goalTarget = useGoalStore(s => s.target)
  const todayCount = useCardsStore(s => countTodayReviews(s.cards))

  const showDetailPanel = selectedEventId || selectedEraId
  const bothSelected = !!(selectedEventId && selectedEraId)

  // 笔记总览页面状态（替换主区域的地图/图谱）
  const [overviewActive, setOverviewActive] = useState(false)

  // 学习引导 Dashboard 默认开启，但如果 URL 有 focus 参数则跳过（直接进入地图）
  const [dashboardActive, setDashboardActive] = useState(() => {
    if (typeof window === 'undefined') return true
    return !new URLSearchParams(window.location.search).has('focus')
  })

  // 当 selected 从 null 变成非 null 时，重置 detailView 到对应默认
  // 用 ref 跟踪上一次 selected，仅当从无到有时重置 view
  const prevSelectedRef = useRef<{ event: string | null; era: string | null } | null>(null)
  useEffect(() => {
    const prev = prevSelectedRef.current
    const becameSelected =
      prev !== null &&
      ((prev.event == null && selectedEventId) || (prev.era == null && selectedEraId))
    const initialMount = prev === null
    prevSelectedRef.current = { event: selectedEventId, era: selectedEraId }
    if (initialMount) {
      // 初始挂载
      if (selectedEventId && !selectedEraId) setDetailView('event')
      else if (selectedEraId && !selectedEventId) setDetailView('era')
      else if (!selectedEventId && !selectedEraId) setDetailView('event')
    } else if (becameSelected) {
      // 仅当 detailView 不是 'notes' 时才重置（避免覆盖 NotesOverview 跳转后主动设置的 'notes'）
      if (detailView === 'notes') return
      if (selectedEventId && !selectedEraId) setDetailView('event')
      else if (selectedEraId && !selectedEventId) setDetailView('era')
    }
  }, [selectedEventId, selectedEraId, setDetailView, detailView])

  // ESC 键：总览/复习页激活时优先关闭，否则关闭详情面板
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (overviewActive || flashcardsActive) return  // 各自内部处理
        if (showDetailPanel) {
          selectEvent(null)
          selectEra(null)
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [overviewActive, flashcardsActive, showDetailPanel, selectEvent, selectEra])

  // 决定显示哪个 detail
  const showEvent = detailView === 'event' && !!selectedEventId
  const showEra = detailView === 'era' && !!selectedEraId
  const showNotes = detailView === 'notes' && (!!selectedEventId || !!selectedEraId)

  // 笔记面板的目标（优先选事件，否则选朝代）
  const notesTarget = selectedEventId
    ? { kind: 'event' as const, id: selectedEventId }
    : selectedEraId
    ? { kind: 'era' as const, id: selectedEraId }
    : null

  // 朝代选择历史与撤销
  const eraSelectionHistory = useHistoryStore(s => s.eraSelectionHistory)
  const undoEraSelect = useHistoryStore(s => s.undoEraSelect)

  // 全局键盘快捷键（capture phase，不被具体组件拦截时使用）
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // 输入框/textarea 中忽略（避免影响文字输入）
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      // 已经按住的修饰键（除 Shift）忽略
      if (e.ctrlKey || e.metaKey || e.altKey) return

      // Esc: 关闭详情面板 / 退出对照 / 关闭闪卡 / 关闭笔记总览 / 关闭全人物 / 撤销朝代选择
      if (e.key === 'Escape') {
        if (selectedEventId) { selectEvent(null); e.preventDefault(); return }
        if (selectedEraId && eraSelectionHistory.length > 0) {
          undoEraSelect(); e.preventDefault(); return
        }
        if (selectedEraId) { selectEra(null); e.preventDefault(); return }
        if (figuresActive) { setFiguresActive(false); e.preventDefault(); return }
        if (flashcardsActive) { setFlashcardsActive(false); e.preventDefault(); return }
        if (overviewActive) { setOverviewActive(false); e.preventDefault(); return }
        if (timeTravelActive) { if (currentScenarioId) setCurrentScenarioId(null); else setTimeTravelActive(false); e.preventDefault(); return }
      }

      // u: 撤销朝代选择（回退一步）
      if (e.key === 'u' || e.key === 'U') {
        if (eraSelectionHistory.length > 0) {
          undoEraSelect(); e.preventDefault(); return
        }
      }

      // ← / →: ±1 年；Shift + ←/→: ±10 年
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const step = e.shiftKey ? 10 : 1
        const delta = e.key === 'ArrowLeft' ? -step : step
        useHistoryStore.getState().setYear(currentYear + delta)
        e.preventDefault()
        return
      }

      // g: 切到地图视图
      if (e.key === 'g' || e.key === 'G') {
        if (viewMode !== 'map') setViewMode('map')
        e.preventDefault()
        return
      }

      // r: 切到关系图谱
      if (e.key === 'r' || e.key === 'R') {
        if (viewMode !== 'graph') setViewMode('graph')
        e.preventDefault()
        return
      }

      // c: 打开中外对照（已迁移到 EraDetail 内嵌，移除）
      // f: 打开复习卡片（仅当有待复习时）
      if (e.key === 'f' || e.key === 'F') {
        if (dueCount > 0 && !flashcardsActive) setFlashcardsActive(true)
        e.preventDefault()
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    selectedEventId, selectedEraId, currentYear, viewMode,
    flashcardsActive, overviewActive, dueCount,
    eraSelectionHistory,
    selectEvent, selectEra, undoEraSelect, setFlashcardsActive, setOverviewActive, setViewMode,
  ])

  return (
    <div className="h-screen w-screen flex flex-col bg-ink-900 text-parchment-50 overflow-y-auto overflow-x-hidden">
      {/* 顶部 Header */}
      <header className="flex items-center justify-between px-6 py-2.5 border-b border-ink-600 bg-ink-800/80 backdrop-blur z-10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-baseline gap-3 shrink-0">
            <h1 className="text-lg font-serif text-bronze-400">📜 历史探索者</h1>
            <span className="text-xs text-ink-500 hidden lg:inline">History Explorer</span>
          </div>
          <SearchBar />
          <TimeMachine />
          <FilterPanel />
          {/* 视图切换按钮组 */}
          <div className="flex rounded-lg bg-ink-700/80 border border-ink-600 overflow-hidden shrink-0">
            <button
              className={`px-2.5 py-1.5 text-xs shrink-0 whitespace-nowrap transition-colors ${
                viewMode === 'map'
                  ? 'bg-bronze-600/40 text-bronze-400'
                  : 'text-ink-500 hover:text-parchment-50 hover:bg-ink-600'
              }`}
              onClick={() => {
                setDashboardActive(false)
                setFiguresActive(false)
                setWarsActive(false)
                setCulturesActive(false)
                setGeographyActive(false)
                setTimeTravelActive(false)
                setOverviewActive(false)
                setFlashcardsActive(false)
                setViewMode('map')
              }}
              title="地图视图"
            >
              🗺️ 地图
            </button>
            <button
              className={`px-2.5 py-1.5 text-xs shrink-0 whitespace-nowrap transition-colors ${
                viewMode === 'graph'
                  ? 'bg-bronze-600/40 text-bronze-400'
                  : 'text-ink-500 hover:text-parchment-50 hover:bg-ink-600'
              }`}
              onClick={() => {
                setDashboardActive(false)
                setFiguresActive(false)
                setWarsActive(false)
                setCulturesActive(false)
                setGeographyActive(false)
                setTimeTravelActive(false)
                setOverviewActive(false)
                setFlashcardsActive(false)
                setViewMode('graph')
              }}
              title="关系图谱"
            >
              🕸️ 图谱
            </button>
          </div>
          {/* 学习引导（核心返回入口，常驻） */}
          <button
            className={`px-2.5 py-1.5 rounded-lg shrink-0 whitespace-nowrap text-xs flex items-center gap-1.5 transition-colors border ${
              dashboardActive
                ? 'bg-bronze-600/40 text-bronze-400 border-bronze-500/60'
                : 'bg-ink-700/80 hover:bg-bronze-600/40 border-ink-600 text-bronze-400'
            }`}
            onClick={() => setDashboardActive(true)}
            title="返回学习引导主页"
          >
            🏠 学习引导
          </button>
          {/* 复习按钮（带数字徽章） */}
          <FlashcardsTrigger
            dueCount={dueCount}
            todayCount={todayCount}
            target={goalTarget}
            active={flashcardsActive}
            onClick={() => { setDashboardActive(false); setFlashcardsActive(true) }}
          />
          {/* 更多菜单：收纳低频/次要动作 */}
          <div className="relative shrink-0" ref={moreMenuRef}>
            <button
              className={`px-2 py-1.5 rounded-lg whitespace-nowrap text-xs flex items-center gap-1 transition-colors border relative ${
                moreMenuOpen || overviewActive
                  ? 'bg-bronze-600/40 text-bronze-400 border-bronze-500/60'
                  : 'bg-ink-700/80 hover:bg-ink-600 border-ink-600 text-bronze-400'
              }`}
              onClick={() => setMoreMenuOpen(o => !o)}
              title="更多"
              aria-haspopup="menu"
              aria-expanded={moreMenuOpen}
            >
              ⋯ 更多
              {notesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-bronze-500 ring-2 ring-ink-800" />
              )}
            </button>
            {moreMenuOpen && (
              <div
                className="absolute top-full right-0 mt-1 w-44 py-1 rounded-lg bg-ink-800 border border-ink-600 shadow-2xl z-50"
                role="menu"
              >
                <button
                  className="w-full text-left px-3 py-2 text-xs text-parchment-50 hover:bg-ink-700 flex items-center justify-between gap-2 transition-colors"
                  onClick={() => { setMoreMenuOpen(false); setDashboardActive(false); setOverviewActive(true) }}
                  role="menuitem"
                >
                  <span>📒 我的笔记</span>
                  {notesCount > 0 && <span className="text-ink-500">{notesCount}</span>}
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-xs text-parchment-50 hover:bg-ink-700 flex items-center justify-between gap-2 transition-colors"
                  onClick={() => { setMoreMenuOpen(false); setGoalSettingsOpen(true) }}
                  role="menuitem"
                >
                  <span>🎯 每日目标</span>
                  <span className="text-ink-500">{goalTarget}</span>
                </button>
                {mapFocusTarget && (
                  <button
                    className="w-full text-left px-3 py-2 text-xs text-bronze-300 hover:bg-ink-700 flex items-center gap-2 transition-colors border-t border-ink-700 mt-1 pt-2"
                    onClick={() => {
                      setMoreMenuOpen(false)
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

      {/* AmbientBackground 动态背景 — 进入任一页面都能看到的色彩漂移 */}
      <AmbientBackground />

      {/* 中间：地图/图谱 或 笔记总览页 + 详情面板 */}
      <main className="flex-1 min-h-0 flex relative overflow-hidden">
        <div className="flex-1 min-w-0 min-h-0 relative overflow-hidden">
          {dashboardActive ? (
            <Dashboard
              isActive={dashboardActive}
              onEnterMap={() => {
                setDashboardActive(false)
                setViewMode('map')
              }}
              onEnterPath={(pathId, eraId) => {
                setDashboardActive(false)
                if (pathId === 'review') {
                  setFlashcardsActive(true)
                } else if (pathId === 'allFigures') {
                  // eraId 在此场景下实际是 personId（Dashboard 全人物弹窗传入）
                  setInitialFigureId(eraId ?? null)
                  setFiguresActive(true)
                } else if (pathId === 'allWars') {
                  setWarsActive(true)
                } else if (pathId === 'allCultures') {
                  setCulturesActive(true)
                } else if (pathId === 'allGeography') {
                  setGeographyActive(true)
                } else if (pathId === 'timeTravel') {
                  setTimeTravelActive(true)
                } else {
                  setViewMode('map')
                }
                if (eraId && pathId !== 'allFigures') useLearningPathStore.getState().recordVisit(pathId, eraId)
              }}
            />
          ) : flashcardsActive ? (
            <Suspense fallback={<PageFallback />}>
              <FlashcardsPanel
                isActive={flashcardsActive}
                onClose={() => setFlashcardsActive(false)}
              />
            </Suspense>
          ) : overviewActive ? (
            <NotesOverview
              variant="page"
              isActive={overviewActive}
              onClose={() => setOverviewActive(false)}
            />
          ) : figuresActive ? (
            <Suspense fallback={<PageFallback />}>
              <FiguresOverview
                isActive={figuresActive}
                onClose={() => { setFiguresActive(false); setInitialFigureId(null); setDashboardActive(true) }}
                initialPersonId={initialFigureId}
              />
            </Suspense>
          ) : warsActive ? (
            <Suspense fallback={<PageFallback />}>
              <WarsOverview
                isActive={warsActive}
                onClose={() => { setWarsActive(false); setDashboardActive(true) }}
                onViewOnMap={() => {
                  setWarsActive(false)
                  setViewMode('map')
                }}
              />
            </Suspense>
          ) : culturesActive ? (
            <Suspense fallback={<PageFallback />}>
              <CulturesOverview
                isActive={culturesActive}
                onClose={() => { setCulturesActive(false); setDashboardActive(true) }}
              />
            </Suspense>
          ) : geographyActive ? (
            <Suspense fallback={<PageFallback />}>
              <GeographyOverview
                isActive={geographyActive}
                onClose={() => { setGeographyActive(false); setDashboardActive(true) }}
              />
            </Suspense>
          ) : timeTravelActive ? (
            currentScenarioId ? (
              <ScenarioPlayer
                scenarioId={currentScenarioId}
                onExit={() => { setCurrentScenarioId(null); setDashboardActive(true) }}
              />
            ) : (
              <Suspense fallback={<PageFallback />}>
                <TimeTravelLobby
                  isActive={timeTravelActive}
                  onClose={() => { setTimeTravelActive(false); setDashboardActive(true) }}
                  onStart={(scenarioId) => setCurrentScenarioId(scenarioId)}
                />
              </Suspense>
            )
          ) : viewMode === 'graph' ? (
            <Suspense fallback={<PageFallback />}>
              <RelationshipGraph />
            </Suspense>
          ) : (
            <TMapTest />
          )}
        </div>

        {/* 右侧详情面板 */}
        {showDetailPanel && (
          <aside
            className="border-l border-ink-600 bg-ink-800/95 backdrop-blur overflow-hidden flex flex-col flex-shrink-0"
            style={{ width: '480px' }}
          >
            {/* 面板头部：tab + 关闭按钮 */}
            <div className="flex items-center border-b border-ink-600 text-xs bg-ink-800">
              {bothSelected ? (
                <>
                  <button
                    className={`flex-1 px-3 py-2.5 border-r border-ink-600 transition-colors ${
                      detailView === 'event'
                        ? 'bg-bronze-600/30 text-bronze-400 border-b-2 border-bronze-400'
                        : 'text-ink-500 hover:bg-ink-700 hover:text-parchment-50'
                    }`}
                    onClick={() => setDetailView('event')}
                  >
                    📅 事件
                  </button>
                  <button
                    className={`flex-1 px-3 py-2.5 border-r border-ink-600 transition-colors ${
                      detailView === 'era'
                        ? 'bg-bronze-600/30 text-bronze-400 border-b-2 border-bronze-400'
                        : 'text-ink-500 hover:bg-ink-700 hover:text-parchment-50'
                    }`}
                    onClick={() => setDetailView('era')}
                  >
                    🏛️ 朝代
                  </button>
                  <button
                    className={`flex-1 px-3 py-2.5 border-r border-ink-600 transition-colors ${
                      detailView === 'notes'
                        ? 'bg-bronze-600/30 text-bronze-400 border-b-2 border-bronze-400'
                        : 'text-ink-500 hover:bg-ink-700 hover:text-parchment-50'
                    }`}
                    onClick={() => setDetailView('notes')}
                  >
                    📝 笔记
                  </button>
                </>
              ) : (
                <>
                  {/* 单选时第一个 tab 也可点击切回详情 */}
                  <button
                    className={`flex-1 px-3 py-2.5 border-r border-ink-600 transition-colors ${
                      detailView !== 'notes'
                        ? 'bg-bronze-600/30 text-bronze-400 border-b-2 border-bronze-400'
                        : 'text-ink-500 hover:bg-ink-700 hover:text-parchment-50'
                    }`}
                    onClick={() => setDetailView(selectedEventId ? 'event' : 'era')}
                  >
                    {selectedEventId ? '📅 事件详情' : '🏛️ 朝代详情'}
                  </button>
                  <button
                    className={`flex-1 px-3 py-2.5 border-r border-ink-600 transition-colors ${
                      detailView === 'notes'
                        ? 'bg-bronze-600/30 text-bronze-400 border-b-2 border-bronze-400'
                        : 'text-ink-500 hover:bg-ink-700 hover:text-parchment-50'
                    }`}
                    onClick={() => setDetailView('notes')}
                  >
                    📝 笔记
                  </button>
                </>
              )}
              {/* 明显的关闭按钮 */}
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

            {/* 内容区 */}
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

      {/* 底部：时间轴 — 只在地图视图显示 */}
      {!dashboardActive && !figuresActive && !warsActive && !culturesActive && !geographyActive && !timeTravelActive && !overviewActive && !flashcardsActive && viewMode !== 'graph' && (
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
          isOpen={goalSettingsOpen}
          onClose={() => setGoalSettingsOpen(false)}
        />
      </Suspense>
      <AIChatPanel />
      <QuizLauncher />
      <ToastHost />
    </div>
  )
}