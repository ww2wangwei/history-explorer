/**
 * Layout 状态机
 *
 * 原来 Layout 内部有 9 个相互影响的 boolean state（dashboardActive / flashcardsActive / ...）
 * + 2 个 UI 浮层（goalSettingsOpen / moreMenuOpen），每次切换都得手动清 8 个 setter。
 *
 * 这里把它们压缩成两个互不耦合的层：
 *   - main: 主视图（一次只可能一种模式）
 *   - 浮层（goalSettingsOpen, moreMenuOpen）
 *
 * viewMode / mapFocusTarget / selectedEventId / selectedEraId / detailView 仍归 useHistoryStore
 * —— 它们是跨组件共享的全局状态，但 store.viewMode 在 Layout 内部会与 main.mode 同步：
 *   地图按钮 → dispatch(OPEN_MAP) + setViewMode('map')
 *   图谱按钮 → dispatch(OPEN_GRAPH) + setViewMode('graph')
 *
 * main.mode 9 种语义：
 *   home      → Dashboard 学习引导
 *   map       → 地图（含时间轴）
 *   graph     → 关系图谱
 *   flashcards/overview/figures/wars/cultures/geography/timeTravel → 覆盖层
 */

import type { PathId } from '@/store/useLearningPathStore'

// ============================================================================
// 类型
// ============================================================================

/** 主视图模式（10 种互斥态） */
export type MainView =
  | { mode: 'home' }                                            // Dashboard 学习引导
  | { mode: 'map' }                                             // 地图
  | { mode: 'graph' }                                           // 关系图谱
  | { mode: 'flashcards' }                                      // 复习卡片
  | { mode: 'overview' }                                        // 笔记总览
  | { mode: 'figures'; initialPersonId: string | null }         // 全人物
  | { mode: 'wars' }                                            // 全战争
  | { mode: 'cultures' }                                        // 全文化
  | { mode: 'geography' }                                       // 全地理
  | { mode: 'poems' }                                           // 全诗词
  | { mode: 'civilizations' }                                   // 中西方文明大对比
  | { mode: 'timeTravel'; scenarioId: string | null }           // 穿越历史（null = 大厅）

/** Layout 整体 UI 状态（局部） */
export interface LayoutUIState {
  main: MainView
  goalSettingsOpen: boolean
  moreMenuOpen: boolean
}

/** Action（13 种） */
export type LayoutAction =
  // 主视图切换
  | { type: 'OPEN_HOME' }
  | { type: 'OPEN_MAP' }
  | { type: 'OPEN_GRAPH' }
  | { type: 'OPEN_FLASHCARDS' }
  | { type: 'OPEN_OVERVIEW' }
  | { type: 'OPEN_FIGURES'; initialPersonId?: string | null }
  | { type: 'OPEN_WARS' }
  | { type: 'OPEN_CULTURES' }
  | { type: 'OPEN_GEOGRAPHY' }
  | { type: 'OPEN_POEMS' }
  | { type: 'OPEN_CIVILIZATIONS' }
  | { type: 'OPEN_TIME_TRAVEL' }
  | { type: 'START_SCENARIO'; scenarioId: string }
  | { type: 'EXIT_SCENARIO' }           // 回到 timeTravel lobby
  | { type: 'LEAVE_OVERLAY' }           // 从任何非 home 状态回到 home
  // UI 浮层
  | { type: 'OPEN_GOAL_SETTINGS' }
  | { type: 'CLOSE_GOAL_SETTINGS' }
  | { type: 'TOGGLE_MORE_MENU' }
  | { type: 'CLOSE_MORE_MENU' }

// ============================================================================
// 初始状态
// ============================================================================

/** 初始状态：默认 home。如果 URL 有 `focus` 参数则直接进入地图 */
export function getInitialLayoutState(): LayoutUIState {
  const skipHome =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('focus')
  return {
    main: { mode: skipHome ? 'map' : 'home' },
    goalSettingsOpen: false,
    moreMenuOpen: false,
  }
}

// ============================================================================
// Reducer
// ============================================================================

export function layoutReducer(state: LayoutUIState, action: LayoutAction): LayoutUIState {
  switch (action.type) {
    // ---- 主视图 ----
    case 'OPEN_HOME':
      return { ...state, main: { mode: 'home' } }

    case 'OPEN_MAP':
      return { ...state, main: { mode: 'map' } }

    case 'OPEN_GRAPH':
      return { ...state, main: { mode: 'graph' } }

    case 'OPEN_FLASHCARDS':
      return { ...state, main: { mode: 'flashcards' } }

    case 'OPEN_OVERVIEW':
      return { ...state, main: { mode: 'overview' } }

    case 'OPEN_FIGURES':
      return {
        ...state,
        main: { mode: 'figures', initialPersonId: action.initialPersonId ?? null },
      }

    case 'OPEN_WARS':
      return { ...state, main: { mode: 'wars' } }

    case 'OPEN_CULTURES':
      return { ...state, main: { mode: 'cultures' } }

    case 'OPEN_GEOGRAPHY':
      return { ...state, main: { mode: 'geography' } }

    case 'OPEN_POEMS':
      return { ...state, main: { mode: 'poems' } }

    case 'OPEN_CIVILIZATIONS':
      return { ...state, main: { mode: 'civilizations' } }

    case 'OPEN_TIME_TRAVEL':
      return { ...state, main: { mode: 'timeTravel', scenarioId: null } }

    case 'START_SCENARIO':
      // 进入 play 模式（无论当前 state 如何都强制进 play）
      return { ...state, main: { mode: 'timeTravel', scenarioId: action.scenarioId } }

    case 'EXIT_SCENARIO':
      // 回到 timeTravel lobby
      if (state.main.mode === 'timeTravel' && state.main.scenarioId !== null) {
        return { ...state, main: { mode: 'timeTravel', scenarioId: null } }
      }
      return state

    case 'LEAVE_OVERLAY':
      // 任何非 home 状态都回到 home
      if (state.main.mode === 'home') return state
      return { ...state, main: { mode: 'home' } }

    // ---- UI 浮层 ----
    case 'OPEN_GOAL_SETTINGS':
      return { ...state, goalSettingsOpen: true, moreMenuOpen: false }

    case 'CLOSE_GOAL_SETTINGS':
      return { ...state, goalSettingsOpen: false }

    case 'TOGGLE_MORE_MENU':
      return { ...state, moreMenuOpen: !state.moreMenuOpen }

    case 'CLOSE_MORE_MENU':
      return { ...state, moreMenuOpen: false }

    default: {
      const _exhaustive: never = action
      return state
    }
  }
}

// ============================================================================
// 派生 helpers
// ============================================================================

/** 是否在覆盖层（flashcards / overview / figures / wars / cultures / geography / timeTravel） */
export function isOverlayActive(main: MainView): boolean {
  return main.mode === 'flashcards'
      || main.mode === 'overview'
      || main.mode === 'figures'
      || main.mode === 'wars'
      || main.mode === 'cultures'
      || main.mode === 'geography'
      || main.mode === 'poems'
      || main.mode === 'civilizations'
      || main.mode === 'timeTravel'
}

/** 时间轴显示条件：只在地图模式显示 */
export function shouldShowTimeline(main: MainView): boolean {
  return main.mode === 'map'
}

/** 从 Dashboard 的 onEnterPath 派生 Action */
export function pathEntryToAction(
  pathId: PathId,
  eraId?: string | null,
): LayoutAction {
  switch (pathId) {
    case 'review':
      return { type: 'OPEN_FLASHCARDS' }
    case 'allFigures':
      // 兼容历史上的"eraId 实际是 personId"约定
      return { type: 'OPEN_FIGURES', initialPersonId: eraId ?? null }
    case 'allWars':
      return { type: 'OPEN_WARS' }
    case 'allCultures':
      return { type: 'OPEN_CULTURES' }
    case 'allGeography':
      return { type: 'OPEN_GEOGRAPHY' }
    case 'allPoems':
      return { type: 'OPEN_POEMS' }
    case 'civilizations':
      return { type: 'OPEN_CIVILIZATIONS' }
    case 'timeTravel':
      return { type: 'OPEN_TIME_TRAVEL' }
    case 'timeline':
    default:
      // timeline 路径不进覆盖层；由 Dashboard 自己处理（弹出朝代列表）
      return { type: 'OPEN_HOME' }
  }
}
