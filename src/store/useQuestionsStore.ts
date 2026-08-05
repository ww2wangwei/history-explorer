/**
 * 「全问题」store
 *
 * - 记录每道题的作答进度（总分/分维度得分/笔记 id）
 * - 持久化 AI 生成的自定义题（localStorage）
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Question, QuestionProgress } from '@/types/questions'

interface QuestionsState {
  /** questionId → 作答进度 */
  progress: Record<string, QuestionProgress>
  /** AI 生成的自定义题（持久化，与内置题合并展示） */
  customQuestions: Question[]

  /** 标记某题完成（写入得分与笔记） */
  markDone: (
    qid: string,
    payload: { totalScore: number; dims: QuestionProgress['dims']; noteId: string | null },
  ) => void
  /** 新增一道 AI 生成题，返回新题 id */
  addCustomQuestion: (q: Omit<Question, 'id' | 'aiGenerated' | 'createdAt'>) => string
  /** 删除自定义题 */
  deleteCustomQuestion: (qid: string) => void
  /** 取某题进度 */
  getProgress: (qid: string) => QuestionProgress | undefined
}

/** 生成唯一 ID：优先 crypto.randomUUID */
function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `q-ai-${crypto.randomUUID().slice(0, 8)}`
  }
  return `q-ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useQuestionsStore = create<QuestionsState>()(
  persist(
    (set, get) => ({
      progress: {},
      customQuestions: [],

      markDone: (qid, payload) =>
        set(s => ({
          progress: {
            ...s.progress,
            [qid]: {
              status: 'done',
              totalScore: payload.totalScore,
              dims: payload.dims,
              noteId: payload.noteId,
              completedAt: Date.now(),
            },
          },
        })),

      addCustomQuestion: q => {
        const id = genId()
        const now = Date.now()
        set(s => ({
          customQuestions: [...s.customQuestions, { ...q, id, aiGenerated: true, createdAt: now }],
        }))
        return id
      },

      deleteCustomQuestion: qid =>
        set(s => {
          const { [qid]: _removed, ...rest } = s.progress
          return {
            customQuestions: s.customQuestions.filter(q => q.id !== qid),
            progress: rest,
          }
        }),

      getProgress: qid => get().progress[qid],
    }),
    {
      name: 'history-explorer-questions:v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
