/**
 * 学习目标 store
 *
 * 用 Zustand + persist 写入 localStorage（key: history-explorer-goal:v1）
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DailyGoal } from '@/types/goal'

interface GoalState extends DailyGoal {
  /** 设置目标（限制 0-100） */
  setTarget: (n: number) => void
}

export const DEFAULT_TARGET = 5

export const useGoalStore = create<GoalState>()(
  persist(
    set => ({
      target: DEFAULT_TARGET,
      setTarget: (n) => set({ target: Math.max(0, Math.min(100, Math.floor(n))) }),
    }),
    {
      name: 'history-explorer-goal:v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ target: state.target }),
      migrate: (persisted, _fromVersion) => persisted as GoalState,
    },
  ),
)