/**
 * 学习路径 store
 *
 * 跟踪用户在 4 个学习路径中的进度，决定 Dashboard 的"下一步推荐"
 *
 * 持久化到 localStorage（key: history-explorer-path:v1）
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getEras } from '@/data/sharedDataLoader'
import type { Era } from '@/types'

// 🎯 修复：之前 const eras = getEras() 在模块加载时执行，那时 _data 还是 EMPTY
//   → eras 永久 []。改成函数内部按需取最新值。
function getErasSafe(): Era[] {
  try {
    return getEras() ?? []
  } catch {
    return []
  }
}
const eras = getErasSafe()

export type PathId = 'timeline' | 'crossReference' | 'eraDetail' | 'review' | 'allFigures' | 'allWars' | 'allCultures' | 'allGeography' | 'allPoems' | 'civilizations' | 'allArts' | 'worldHistory' | 'timeTravel' | 'allQuestions' | 'allMythologies' | 'allTraditions'

export interface PathProgress {
  visitedEraIds: string[]
  lastVisitedEraId: string | null
  lastVisitedAt: number | null
  /** 仅 allFigures 路径使用：已查看的人物 id 列表 */
  visitedFigureIds?: string[]
  /** 仅 allFigures 路径使用：最近查看的人物 */
  lastVisitedFigureId?: string | null
  /** 仅 civilizations 路径使用：已读 section id 列表 */
  visitedSectionIds?: string[]
  /** 仅 civilizations 路径使用：最近查看的 section */
  lastVisitedSectionId?: string | null
  /** 仅 allArts 路径使用：已读 lesson id 列表 */
  visitedLessonIds?: string[]
  /** 仅 allArts 路径使用：最近查看的 lesson */
  lastVisitedLessonId?: string | null
  /** 仅 worldHistory 路径使用：已读 lesson id 列表 */
  visitedWorldLessonIds?: string[]
  /** 仅 worldHistory 路径使用：最近查看的 lesson */
  lastVisitedWorldLessonId?: string | null
  /** 仅 timeTravel 路径使用：已通关的剧本 + 达成结局（支持多个） */
  completedScenarios?: string[]
  /** scenarioId → endingId[] （多结局支持） */
  scenarioEndings?: Record<string, string[]>
  /** 仅 allMythologies 路径使用：已查看的神话 id 列表 */
  visitedMythIds?: string[]
  /** 仅 allMythologies 路径使用：最近查看的神话 */
  lastVisitedMythId?: string | null
}

interface LearningPathState {
  /** 各路径的进度，初始空对象 */
  progressByPath: Record<PathId, PathProgress>
  /** 上次离开时在哪（跨路径共享） */
  lastViewedAt: number | null
  /** Actions */
  recordVisit: (path: PathId, eraId: string) => void
  /** 全人物：标记某人物为已了解 */
  markFigureVisited: (figureId: string) => void
  /** 全诗词：标记已浏览 */
  markPoemVisited: () => void
  /** 中西方文明大对比：标记某节已读 */
  markCivilizationVisited: (sectionId: string) => void
  /** 全艺术：标记某节已读 */
  markArtVisited: (lessonId: string) => void
  /** 全文明（少年世界史）：标记某节已读 */
  markWorldHistoryVisited: (lessonId: string) => void
  /** 全神话：标记某条已读 */
  markMythVisited: (mythId: string) => void
  recordExit: () => void
  /** 获取某路径已学朝代 */
  getVisitedEras: (path: PathId) => string[]
  /** 智能推荐：基于 currentYear + lastVisitedEraId 给下一个朝代 */
  recommendNext: (currentYear: number, lastSelectedEraId: string | null, eraSelectionHistory?: string[]) => {
    eraId: string
    era: Era
    reason: string
  } | null
}

export const useLearningPathStore = create<LearningPathState>()(
  persist(
    (set, get) => {
      // 默认 progressByPath — 保证所有 PathId 都有值（避免旧 persisted state 缺键导致 undefined）
      const defaultProgress: Record<PathId, PathProgress> = {
        timeline: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
        crossReference: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
        eraDetail: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
        review: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
        allFigures: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, visitedFigureIds: [], lastVisitedFigureId: null },
        allWars: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
        allCultures: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
        allGeography: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
        allPoems: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
        civilizations: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, visitedSectionIds: [], lastVisitedSectionId: null },
        allArts: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, visitedLessonIds: [], lastVisitedLessonId: null },
        worldHistory: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, visitedWorldLessonIds: [], lastVisitedWorldLessonId: null },
        timeTravel: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, completedScenarios: [], scenarioEndings: {} },
        allQuestions: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
        allMythologies: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, visitedMythIds: [], lastVisitedMythId: null },
        allTraditions: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
      }
      return {
      progressByPath: defaultProgress,
      lastViewedAt: null,

      recordVisit: (path, eraId) =>
        set(s => {
          const cur = s.progressByPath[path] ?? defaultProgress[path]
          const visited = cur.visitedEraIds.includes(eraId)
            ? cur.visitedEraIds
            : [...cur.visitedEraIds, eraId]
          return {
            progressByPath: {
              ...s.progressByPath,
              [path]: {
                visitedEraIds: visited,
                lastVisitedEraId: eraId,
                lastVisitedAt: Date.now(),
              },
            },
            lastViewedAt: Date.now(),
          }
        }),

      markFigureVisited: (figureId) =>
        set(s => {
          const cur = s.progressByPath.allFigures ?? defaultProgress.allFigures
          const visited = cur.visitedFigureIds?.includes(figureId)
            ? cur.visitedFigureIds ?? []
            : [...(cur.visitedFigureIds ?? []), figureId]
          return {
            progressByPath: {
              ...s.progressByPath,
              allFigures: {
                ...cur,
                visitedFigureIds: visited,
                lastVisitedFigureId: figureId,
                lastVisitedAt: Date.now(),
              },
            },
            lastViewedAt: Date.now(),
          }
        }),

      markPoemVisited: () =>
        set(s => {
          const cur = s.progressByPath.allPoems ?? defaultProgress.allPoems
          return {
            progressByPath: {
              ...s.progressByPath,
              allPoems: {
                ...cur,
                lastVisitedAt: Date.now(),
              },
            },
            lastViewedAt: Date.now(),
          }
        }),

      markCivilizationVisited: (sectionId) =>
        set(s => {
          const cur = s.progressByPath.civilizations ?? defaultProgress.civilizations
          const visited = cur.visitedSectionIds?.includes(sectionId)
            ? cur.visitedSectionIds ?? []
            : [...(cur.visitedSectionIds ?? []), sectionId]
          return {
            progressByPath: {
              ...s.progressByPath,
              civilizations: {
                ...cur,
                visitedSectionIds: visited,
                lastVisitedSectionId: sectionId,
                lastVisitedAt: Date.now(),
              },
            },
            lastViewedAt: Date.now(),
          }
        }),

      markArtVisited: (lessonId) =>
        set(s => {
          const cur = s.progressByPath.allArts ?? defaultProgress.allArts
          const visited = cur.visitedLessonIds?.includes(lessonId)
            ? cur.visitedLessonIds ?? []
            : [...(cur.visitedLessonIds ?? []), lessonId]
          return {
            progressByPath: {
              ...s.progressByPath,
              allArts: {
                ...cur,
                visitedLessonIds: visited,
                lastVisitedLessonId: lessonId,
                lastVisitedAt: Date.now(),
              },
            },
            lastViewedAt: Date.now(),
          }
        }),

      markWorldHistoryVisited: (lessonId) =>
        set(s => {
          const cur = s.progressByPath.worldHistory ?? defaultProgress.worldHistory
          const visited = cur.visitedWorldLessonIds?.includes(lessonId)
            ? cur.visitedWorldLessonIds ?? []
            : [...(cur.visitedWorldLessonIds ?? []), lessonId]
          return {
            progressByPath: {
              ...s.progressByPath,
              worldHistory: {
                ...cur,
                visitedWorldLessonIds: visited,
                lastVisitedWorldLessonId: lessonId,
                lastVisitedAt: Date.now(),
              },
            },
            lastViewedAt: Date.now(),
          }
        }),

      markMythVisited: (mythId) =>
        set(s => {
          const cur = s.progressByPath.allMythologies ?? defaultProgress.allMythologies
          const visited = cur.visitedMythIds?.includes(mythId)
            ? cur.visitedMythIds ?? []
            : [...(cur.visitedMythIds ?? []), mythId]
          return {
            progressByPath: {
              ...s.progressByPath,
              allMythologies: {
                ...cur,
                visitedMythIds: visited,
                lastVisitedMythId: mythId,
                lastVisitedAt: Date.now(),
              },
            },
            lastViewedAt: Date.now(),
          }
        }),

      recordExit: () => set({ lastViewedAt: Date.now() }),

      getVisitedEras: (path) => get().progressByPath[path]?.visitedEraIds ?? [],

      recommendNext: (currentYear, lastSelectedEraId, eraSelectionHistory) => {
        const visitedTimeline = new Set(get().progressByPath.timeline?.visitedEraIds ?? [])
        // 🎯 修复：每次调用都从 sharedDataLoader 取最新数据
        //   （之前用模块级常量，数据未加载完时永久是 []）
        const liveEras = getErasSafe()

        // 优先级 1: 用户最近撤销过 — 推荐刚才看的朝代
        if (lastSelectedEraId && eraSelectionHistory && eraSelectionHistory.length > 0) {
          const historyTraverse = eraSelectionHistory[eraSelectionHistory.length - 1]
          if (historyTraverse && historyTraverse !== lastSelectedEraId) {
            const era = liveEras.find(e => e.id === historyTraverse)
            if (era) {
              return { eraId: historyTraverse, era, reason: '回退到你之前看过的朝代' }
            }
          }
        }

        // 优先级 2: 推荐当前 year 附近、没在 timeline 学过的最早朝代
        const sorted = liveEras.slice().sort((a, b) => Math.abs(a.startYear - currentYear) - Math.abs(b.startYear - currentYear))
        for (const era of sorted) {
          if (!visitedTimeline.has(era.id)) {
            const yrLabel = currentYear < 0 ? `公元前${-currentYear}` : currentYear
            return { eraId: era.id, era, reason: `在你当前年份 (${yrLabel}) 附近.` }
          }
        }
        // 全部学完 → 推荐第一个；若 eras 数据未加载（sorted 为空）则返回 null
        if (sorted.length === 0) return null
        return {
          eraId: sorted[0].id,
          era: sorted[0],
          reason: '已学完时间线. 回顾最早的朝代',
        }
      },
    }
    },
    {
      name: 'history-explorer-path:v1',
      storage: createJSONStorage(() => localStorage),
      // 合并策略：旧 persisted state 缺键时用默认值补齐（避免老用户的 localStorage 缺少新增的 allFigures 等键）
      merge: (persisted, current) => {
        const persistedState = (persisted ?? {}) as Partial<LearningPathState>
        const mergedProgress: Record<PathId, PathProgress> = {
          timeline: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
          crossReference: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
          eraDetail: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
          review: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
          allFigures: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, visitedFigureIds: [], lastVisitedFigureId: null },
          allWars: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
          allCultures: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
          allGeography: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
          allPoems: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
          civilizations: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, visitedSectionIds: [], lastVisitedSectionId: null },
          allArts: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, visitedLessonIds: [], lastVisitedLessonId: null },
          worldHistory: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, visitedWorldLessonIds: [], lastVisitedWorldLessonId: null },
          timeTravel: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, completedScenarios: [], scenarioEndings: {} },
          allQuestions: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
          allMythologies: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, visitedMythIds: [], lastVisitedMythId: null },
          allTraditions: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null },
        }
        if (persistedState.progressByPath) {
          for (const key of Object.keys(mergedProgress) as PathId[]) {
            const persistedKey = (persistedState.progressByPath as Record<string, PathProgress | undefined>)[key]
            if (persistedKey) {
              mergedProgress[key] = { ...mergedProgress[key], ...persistedKey }
            }
          }
        }
        return {
          ...current,
          ...persistedState,
          progressByPath: mergedProgress,
        }
      },
    },
  ),
)
