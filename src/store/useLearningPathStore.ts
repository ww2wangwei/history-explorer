/**
 * 学习路径 store
 *
 * 跟踪用户在 4 个学习路径中的进度，决定 Dashboard 的"下一步推荐"
 *
 * 持久化到 localStorage（key: history-explorer-path:v1）
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import erasData from '@/data/eras.json'
import type { Era } from '@/types'

const eras = erasData as Era[]

export type PathId = 'timeline' | 'crossReference' | 'eraDetail' | 'review' | 'allFigures' | 'allWars' | 'allCultures' | 'allGeography' | 'timeTravel'

export interface PathProgress {
  visitedEraIds: string[]
  lastVisitedEraId: string | null
  lastVisitedAt: number | null
  /** 仅 allFigures 路径使用：已查看的人物 id 列表 */
  visitedFigureIds?: string[]
  /** 仅 allFigures 路径使用：最近查看的人物 */
  lastVisitedFigureId?: string | null
  /** 仅 timeTravel 路径使用：已通关的剧本 + 达成结局（支持多个） */
  completedScenarios?: string[]
  /** scenarioId → endingId[] （多结局支持） */
  scenarioEndings?: Record<string, string[]>
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
        timeTravel: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, completedScenarios: [], scenarioEndings: {} },
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

      recordExit: () => set({ lastViewedAt: Date.now() }),

      getVisitedEras: (path) => get().progressByPath[path]?.visitedEraIds ?? [],

      recommendNext: (currentYear, lastSelectedEraId, eraSelectionHistory) => {
        const visitedTimeline = new Set(get().progressByPath.timeline?.visitedEraIds ?? [])

        // 优先级 1: 用户最近撤销过 — 推荐刚才看的朝代
        if (lastSelectedEraId && eraSelectionHistory && eraSelectionHistory.length > 0) {
          const historyTraverse = eraSelectionHistory[eraSelectionHistory.length - 1]
          if (historyTraverse && historyTraverse !== lastSelectedEraId) {
            const era = eras.find(e => e.id === historyTraverse)
            if (era) {
              return { eraId: historyTraverse, era, reason: '回退到你之前看过的朝代' }
            }
          }
        }

        // 优先级 2: 推荐当前 year 附近、没在 timeline 学过的最早朝代
        const sorted = eras.slice().sort((a, b) => Math.abs(a.startYear - currentYear) - Math.abs(b.startYear - currentYear))
        for (const era of sorted) {
          if (!visitedTimeline.has(era.id)) {
            const yrLabel = currentYear < 0 ? `公元前${-currentYear}` : currentYear
            return { eraId: era.id, era, reason: `在你当前年份 (${yrLabel}) 附近.` }
          }
        }
        // 全部学完 → 推荐第一个
        return {
          eraId: sorted[0].id,
          era: sorted[0],
          reason: '已学完时间线. 回顾最早的朝代',
        }
      },
    }
    },
    {
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
          timeTravel: { visitedEraIds: [], lastVisitedEraId: null, lastVisitedAt: null, completedScenarios: [], scenarioEndings: {} },
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
