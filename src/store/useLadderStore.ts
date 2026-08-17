import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * 文史天梯（Ladder）状态机 — 4 步闭环（学 / 测 / 记 / 问）+ 难度轮回
 *
 * 持久化到 localStorage（key: history-explorer-ladder:v1）
 */

export type LadderId = 'history' | 'poem' | 'figure'
export type LadderStep = 'study' | 'quiz' | 'notes' | 'ask'
export type DifficultyCycle = 1 | 2 | 3

export const LADDER_TITLE: Record<LadderId, string> = {
  history: '史天梯',
  poem: '诗天梯',
  figure: '人天梯',
}

export const LADDER_COLOR: Record<LadderId, string> = {
  history: '#b85450',
  poem: '#c89a5b',
  figure: '#9bc89a',
}

export interface QuizQuestion {
  kind: 'single' | 'match' | 'order'
  /** 单选 */
  prompt?: string
  options?: string[]
  correctIndex?: number
  explain?: string
  /** 配对 */
  pairs?: { left: string; right: string }[]
  /** 排年表 */
  items?: { id: string; label: string }[]
  correctOrder?: string[]
}

export interface LadderLevel {
  id: string
  ladder: LadderId
  cycle: DifficultyCycle
  entityId: string
  /** 排序权重，数字小靠前 */
  order: number
  /** 上一关通过后给的 XP */
  unlockXpRequired: number
  study: {
    title: string
    summary: string
    cta: string
  }
  quiz: QuizQuestion[]
  notes: {
    templateTitle: string
    templateBody: string
  }
  ask: {
    npcOptions: Array<{
      id: string
      name: string
      era: string
      tag: string
      persona: string
    }>
    sampleQuestions: string[]
  }
  reward: {
    xp: number
    unlockIds?: string[]
  }
}

export interface CycleProgress {
  currentLevelId: string | null
  completedLevelIds: string[]
  xp: number
  /** 已解锁的最高难度 */
  cycleUnlocked: DifficultyCycle
}

export interface PerLadderProgress {
  cycles: Record<DifficultyCycle, CycleProgress>
}

interface LadderState {
  ladders: Record<LadderId, PerLadderProgress>
  stepByLevel: Record<string, LadderStep>
  notesDraftByLevel: Record<string, string>
  askCompletedByLevel: Record<string, boolean>
  cycleResetHistory: Array<{ ladder: LadderId; from: DifficultyCycle; to: DifficultyCycle; at: number }>

  enterLevel: (levelId: string) => void
  advanceStep: (levelId: string) => void
  setStep: (levelId: string, step: LadderStep) => void
  submitQuiz: (levelId: string, correct: boolean) => void
  saveNoteDraft: (levelId: string, content: string) => void
  markAskCompleted: (levelId: string) => void
  completeLevel: (levelId: string) => void
  resetCycle: (ladder: LadderId, cycle: DifficultyCycle) => void
  unlockNextCycle: (ladder: LadderId) => void
  totalXp: () => number
}

const defaultCycle = (cycle: DifficultyCycle): CycleProgress => ({
  currentLevelId: null,
  completedLevelIds: [],
  xp: 0,
  cycleUnlocked: cycle === 1 ? 1 : 1,
})

const defaultLadder = (): PerLadderProgress => ({
  cycles: {
    1: defaultCycle(1),
    2: defaultCycle(2),
    3: defaultCycle(3),
  },
})

export const useLadderStore = create<LadderState>()(
  persist(
    (set, get) => ({
      ladders: {
        history: defaultLadder(),
        poem: defaultLadder(),
        figure: defaultLadder(),
      },
      stepByLevel: {},
      notesDraftByLevel: {},
      askCompletedByLevel: {},
      cycleResetHistory: [],

      enterLevel: (levelId) =>
        set(s => {
          const ladder = (levelId.split(':')[0] as LadderId)
          if (!ladder) return s
          const cur = s.ladders[ladder] ?? defaultLadder()
          const cp = { ...cur.cycles }
          const targetCycle = (Object.keys(cp) as unknown as DifficultyCycle[])
            .map(n => Number(n) as DifficultyCycle)
            .sort((a, b) => a - b)
            .find(c => !cur.cycles[c].completedLevelIds.includes(levelId) && cur.cycles[c].cycleUnlocked) ?? 1
          cp[targetCycle] = {
            ...cur.cycles[targetCycle],
            currentLevelId: levelId,
          }
          return {
            ladders: { ...s.ladders, [ladder]: { ...cur, cycles: cp } },
            stepByLevel: { ...s.stepByLevel, [levelId]: 'study' },
          }
        }),

      advanceStep: (levelId) =>
        set(s => {
          const cur = s.stepByLevel[levelId] ?? 'study'
          const next: LadderStep =
            cur === 'study' ? 'quiz' :
            cur === 'quiz' ? 'notes' :
            cur === 'notes' ? 'ask' : 'ask'
          return { stepByLevel: { ...s.stepByLevel, [levelId]: next } }
        }),

      setStep: (levelId, step) =>
        set(s => ({ stepByLevel: { ...s.stepByLevel, [levelId]: step } })),

      submitQuiz: (levelId, correct) => {
        if (correct) get().advanceStep(levelId)
      },

      saveNoteDraft: (levelId, content) =>
        set(s => ({ notesDraftByLevel: { ...s.notesDraftByLevel, [levelId]: content } })),

      markAskCompleted: (levelId) =>
        set(s => ({ askCompletedByLevel: { ...s.askCompletedByLevel, [levelId]: true } })),

      completeLevel: (levelId) =>
        set(s => {
          const ladder = levelId.split(':')[0] as LadderId
          if (!ladder) return s
          const cur = s.ladders[ladder] ?? defaultLadder()
          const cp = { ...cur.cycles }
          const targetCycle = (Object.keys(cp) as unknown as DifficultyCycle[])
            .map(n => Number(n) as DifficultyCycle)
            .find(c => cur.cycles[c].currentLevelId === levelId) ?? 1
          const cycleP = cur.cycles[targetCycle]
          if (cycleP.completedLevelIds.includes(levelId)) return s
          cp[targetCycle] = {
            ...cycleP,
            currentLevelId: null,
            completedLevelIds: [...cycleP.completedLevelIds, levelId],
            xp: cycleP.xp + 20,
            cycleUnlocked: cycleP.cycleUnlocked,
          }
          return {
            ladders: { ...s.ladders, [ladder]: { ...cur, cycles: cp } },
          }
        }),

      resetCycle: (ladder, cycle) =>
        set(s => {
          const cur = s.ladders[ladder] ?? defaultLadder()
          const cp = { ...cur.cycles }
          cp[cycle] = { ...defaultCycle(cycle), cycleUnlocked: cycle }
          return {
            ladders: { ...s.ladders, [ladder]: { ...cur, cycles: cp } },
            cycleResetHistory: [
              ...s.cycleResetHistory,
              { ladder, from: cycle, to: cycle, at: Date.now() },
            ],
          }
        }),

      unlockNextCycle: (ladder) =>
        set(s => {
          const cur = s.ladders[ladder] ?? defaultLadder()
          const cp = { ...cur.cycles }
          const currentCycle = (Object.keys(cp) as unknown as DifficultyCycle[])
            .map(n => Number(n) as DifficultyCycle)
            .sort((a, b) => b - a)
            .find(c => cp[c].cycleUnlocked >= c) ?? 1
          const next = Math.min(3, currentCycle + 1) as DifficultyCycle
          cp[next] = { ...cp[next], cycleUnlocked: next }
          return {
            ladders: { ...s.ladders, [ladder]: { ...cur, cycles: cp } },
          }
        }),

      totalXp: () => {
        const ls = get().ladders
        let sum = 0
        for (const k of Object.keys(ls) as LadderId[]) {
          for (const c of [1, 2, 3] as DifficultyCycle[]) {
            sum += ls[k].cycles[c]?.xp ?? 0
          }
        }
        return sum
      },
    }),
    {
      name: 'history-explorer-ladder:v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

/** 辅助：从 levelId 取 ladder */
export const ladderOf = (levelId: string): LadderId =>
  (levelId.split(':')[0] as LadderId)
