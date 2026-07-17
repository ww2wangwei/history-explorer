/**
 * 题库系统 store
 *
 * - questions: 已审批（可在答题用）
 * - pending: AI 生成待审批
 * - attempts: 答题记录（持久化最近 200 条）
 * - sessions: 完成的测试会话汇总
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { QuizQuestion, QuizAttempt, QuizSessionResult, QuestionSource } from '@/types/quiz'

interface QuizState {
  questions: Record<string, QuizQuestion>
  pending: Record<string, QuizQuestion>   // AI 生成待审批
  attempts: QuizAttempt[]
  sessions: QuizSessionResult[]            // 最近的会话

  // Actions
  addQuestion: (q: Omit<QuizQuestion, 'id' | 'createdAt'>) => string
  removeQuestion: (id: string) => void
  recordAttempt: (a: QuizAttempt) => void
  recordSession: (s: QuizSessionResult) => void
  addPending: (qs: Omit<QuizQuestion, 'id' | 'createdAt' | 'source'>[]) => string[]
  approvePending: (ids: string[]) => void
  rejectPending: (ids: string[]) => void
  clearAttempts: () => void
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      questions: {},
      pending: {},
      attempts: [],
      sessions: [],

      addQuestion: (q) => {
        const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        set((s) => ({
          questions: { ...s.questions, [id]: { ...q, id, createdAt: Date.now() } },
        }))
        return id
      },

      removeQuestion: (id) => {
        set((s) => {
          const { [id]: _, ...rest } = s.questions
          return { questions: rest }
        })
      },

      recordAttempt: (a) => {
        set((s) => {
          const next = [...s.attempts, a]
          // 只保留最近 200 条
          return { attempts: next.slice(-200) }
        })
      },

      recordSession: (sess) => {
        set((s) => {
          const next = [sess, ...s.sessions].slice(0, 50)  // 最多 50 个会话
          return { sessions: next }
        })
      },

      addPending: (qs) => {
        const ids: string[] = []
        set((s) => {
          const newPending: Record<string, QuizQuestion> = { ...s.pending }
          const now = Date.now()
          for (const q of qs) {
            const id = `q-${now}-${Math.random().toString(36).slice(2, 8)}-${ids.length}`
            newPending[id] = { ...q, id, source: 'ai-generated' as QuestionSource, createdAt: now }
            ids.push(id)
          }
          return { pending: newPending }
        })
        return ids
      },

      approvePending: (ids) => {
        set((s) => {
          const newQuestions = { ...s.questions }
          const newPending = { ...s.pending }
          for (const id of ids) {
            const q = s.pending[id]
            if (q) {
              newQuestions[id] = { ...q, source: 'ai-approved' as QuestionSource }
              delete newPending[id]
            }
          }
          return { questions: newQuestions, pending: newPending }
        })
      },

      rejectPending: (ids) => {
        set((s) => {
          const newPending = { ...s.pending }
          for (const id of ids) delete newPending[id]
          return { pending: newPending }
        })
      },

      clearAttempts: () => set({ attempts: [] }),
    }),
    {
      name: 'history-explorer-quiz:v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        questions: s.questions,
        pending: s.pending,
        attempts: s.attempts.slice(-200),
        sessions: s.sessions.slice(0, 50),
      }),
      migrate: (persisted, _fromVersion) => persisted as QuizState,
    },
  ),
)
