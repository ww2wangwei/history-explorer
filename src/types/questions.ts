/**
 * 「全问题」板块类型定义
 */

/** 提问风格 */
export type QuestionStyle = '趣味性' | '启发性' | '思考性'

/** 地域 */
export type QuestionRegion = 'china' | 'world'

/** 难度：1★ 基础认知 / 2★ 进阶分析 / 3★ 深度思辨 */
export type QuestionDifficulty = 1 | 2 | 3

/** 一道引导思考的历史问题 */
export interface Question {
  id: string
  title: string
  style: QuestionStyle
  icon: string
  region: QuestionRegion
  difficulty: QuestionDifficulty
  /** 开场问题（给用户看的完整题面） */
  opening: string
  /** 思考切入点提示 */
  hints: string[]
  /** 由难度推导的追问轮数 */
  maxRounds: number
  /** AI 生成题标记 */
  aiGenerated?: boolean
  createdAt?: number
}

/** 评分维度 */
export const SCORE_DIMS = ['史实准确', '思考深度', '论证逻辑', '发散视角'] as const
export type ScoreDim = (typeof SCORE_DIMS)[number]

/** 单题的作答进度 */
export interface QuestionProgress {
  status: 'new' | 'done'
  totalScore: number
  dims: Partial<Record<ScoreDim, number>>
  /** 该场问答自动保存的笔记 id */
  noteId: string | null
  completedAt: number
}

/** 由难度推导默认追问轮数 */
export function roundsForDifficulty(difficulty: QuestionDifficulty): number {
  if (difficulty >= 3) return 4
  if (difficulty === 2) return 3
  return 2
}
