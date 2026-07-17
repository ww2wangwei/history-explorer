/**
 * 题库系统类型
 *
 * 难度 1-5 星逐级递进：
 * - 1 星：基础事实（年代/人物/地点）
 * - 2 星：多事实（选择多个）
 * - 3 星：时间轴（按顺序）
 * - 4 星：因果/比较（解释原因）
 * - 5 星：跨朝代综合（综合分析）
 */
export type Difficulty = 1 | 2 | 3 | 4 | 5
export type QuizCategory = 'memory' | 'analysis' | 'comparison'
export type QuestionSource = 'manual' | 'ai-generated' | 'ai-approved'

export interface QuizQuestion {
  id: string
  difficulty: Difficulty
  category: QuizCategory
  /** 关联朝代 id（可选） */
  eraId?: string
  /** 关联事件 id（可选） */
  eventId?: string
  prompt: string
  options: string[]         // 长度 4
  answer: number            // 0-3 索引
  explanation: string
  source: QuestionSource
  createdAt: number
}

export interface QuizAttempt {
  questionId: string
  correct: boolean
  userAnswer: number
  ms: number                 // 答这一题用时毫秒
  at: number                  // 时间戳
}

export interface QuizSessionResult {
  startedAt: number
  finishedAt: number
  total: number
  correct: number
  questionIds: string[]      // 出题顺序
  byDifficulty: Record<Difficulty, { correct: number; total: number }>
}
