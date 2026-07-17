/**
 * 间隔重复学习卡片类型定义
 *
 * 算法：经典 SM-2（SuperMemo 2）
 * - 评级 4 档：忘记 / 犹豫 / 记得 / 轻松
 * - 间隔重复：quality >= 3 时延长；quality < 3 时重置
 * - 难度因子 EF：初始 2.5，最小 1.3
 */

/** 评级（4 档） */
export type Rating = 'forgot' | 'hard' | 'good' | 'easy'

/** 评级对应的中文标签 */
export const RATING_LABELS: Record<Rating, string> = {
  forgot: '忘了',
  hard: '犹豫',
  good: '记得',
  easy: '轻松',
}

/** 评级对应的 SM-2 quality 值（0-5） */
export const RATING_TO_QUALITY: Record<Rating, number> = {
  forgot: 0,  // 完全忘记
  hard: 3,    // 正确但很犹豫
  good: 4,    // 正确但需要思考
  easy: 5,    // 轻松完美
}

/** 一次复习记录 */
export interface CardReview {
  /** 复习时间 */
  at: number
  /** 评级 */
  rating: Rating
  /** 复习后的间隔（天） */
  interval: number
}

/** 一张学习卡片 */
export interface Card {
  id: string
  /** 关联目标（朝代 / 事件 / 人物） */
  target: { kind: 'era' | 'event' | 'figure'; id: string }
  /** 加入时间 */
  createdAt: number
  /** 下次复习时间（ms 时间戳） */
  nextReviewAt: number
  /** 当前间隔（天）。0 表示新卡片 */
  interval: number
  /** 重复次数。0 表示新卡片 */
  repetitions: number
  /** 难度因子（Easiness Factor）。初始 2.5，最小 1.3 */
  easiness: number
  /** 复习历史 */
  reviews: CardReview[]
}