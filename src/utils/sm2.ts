/**
 * SM-2 间隔重复算法
 *
 * 公式来源：https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 *
 * 每次复习：
 *   1. 计算 quality（0-5）
 *   2. 如果 quality < 3：重置 repetitions=0, interval=1
 *      如果 quality >= 3：
 *        - repetitions == 1: interval = 1
 *        - repetitions == 2: interval = 6
 *        - repetitions >= 3: interval = round(interval * easiness)
 *        - repetitions += 1
 *   3. 更新 EF: easiness = max(1.3, easiness + (0.1 - (5-q) * (0.08 + (5-q) * 0.02)))
 *   4. 下次复习时间 = now + interval 天
 */
import type { Card, Rating } from '@/types/flashcards'
import { RATING_TO_QUALITY } from '@/types/flashcards'

const DAY_MS = 24 * 60 * 60 * 1000

/** SM-2 初始难度因子 */
const INITIAL_EASINESS = 2.5

/** SM-2 EF 下限 */
const MIN_EASINESS = 1.3

/**
 * SM-2 算法：根据评级计算新的 card 状态
 * 返回新 card（不变更原对象，遵循 React 不可变更新原则）
 *
 * @param card 当前 card 状态
 * @param rating 用户评级
 * @param now 当前时间（默认 Date.now()）
 */
export function sm2(card: Card, rating: Rating, now: number = Date.now()): Card {
  const q = RATING_TO_QUALITY[rating]
  let { easiness, interval, repetitions } = card

  if (q < 3) {
    // 遗忘：重置
    repetitions = 0
    interval = 1
  } else {
    repetitions += 1
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * easiness)
    }
  }

  // 更新 EF
  easiness = Math.max(
    MIN_EASINESS,
    easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  )

  return {
    ...card,
    easiness,
    interval,
    repetitions,
    nextReviewAt: now + interval * DAY_MS,
    reviews: [
      ...card.reviews,
      { at: now, rating, interval },
    ],
  }
}

/** 卡片是否到期（nextReviewAt <= now） */
export function isDue(card: Card, now: number = Date.now()): boolean {
  return card.nextReviewAt <= now
}

/** 创建一张新卡片（默认 0 间隔，立即到期可学） */
export function createCard(target: { kind: 'era' | 'event' | 'figure'; id: string }, now: number = Date.now()): Card {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

  return {
    id,
    target,
    createdAt: now,
    nextReviewAt: now,
    interval: 0,
    repetitions: 0,
    easiness: INITIAL_EASINESS,
    reviews: [],
  }
}