/**
 * 复习统计计算
 *
 * 用于仪表盘展示：5 个总览数字、过去 30 天每日复习量、评级分布、连续学习天数
 */
import type { Card } from '@/types/flashcards'
import { isDue } from '@/utils/sm2'

const DAY_MS = 24 * 60 * 60 * 1000

/** 仪表盘所有统计 */
export interface DashboardStats {
  /** 总卡片数 */
  totalCards: number
  /** 待复习数（nextReviewAt <= now） */
  dueCount: number
  /** 新卡数（repetitions === 0） */
  newCount: number
  /** 已掌握数（interval >= 21 天） */
  masteredCount: number
  /** 累计复习次数（所有 reviews.length 之和） */
  totalReviews: number
  /** 过去 30 天每日复习量（索引 0 = 今天，索引 29 = 30 天前） */
  dailyReviews: number[]
  /** 评级分布 */
  ratingCounts: {
    forgot: number
    hard: number
    good: number
    easy: number
  }
}

/** 计算某天的本地零点时间戳 */
function startOfDay(timestamp: number): number {
  const d = new Date(timestamp)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * 计算仪表盘所有统计
 * @param cards 卡片字典
 * @param now 当前时间（默认 Date.now()）
 */
export function calcDashboardStats(
  cards: Record<string, Card>,
  now: number = Date.now(),
): DashboardStats {
  const list = Object.values(cards)

  // 评级分布 + 累计复习次数
  let totalReviews = 0
  const ratingCounts = { forgot: 0, hard: 0, good: 0, easy: 0 }
  for (const card of list) {
    for (const review of card.reviews) {
      totalReviews++
      ratingCounts[review.rating]++
    }
  }

  // 每日复习量
  const todayStart = startOfDay(now)
  const dailyReviews = new Array(30).fill(0)
  for (const card of list) {
    for (const review of card.reviews) {
      const reviewDayStart = startOfDay(review.at)
      const dayDiff = Math.floor((todayStart - reviewDayStart) / DAY_MS)
      if (dayDiff >= 0 && dayDiff < 30) {
        dailyReviews[dayDiff]++
      }
    }
  }

  return {
    totalCards: list.length,
    dueCount: list.filter(c => isDue(c, now)).length,
    newCount: list.filter(c => c.repetitions === 0).length,
    masteredCount: list.filter(c => c.interval >= 21).length,
    totalReviews,
    dailyReviews,
    ratingCounts,
  }
}

/**
 * 当前连续学习天数（从今天往前数，有复习记录的最长连续天数）
 *
 * 注意：如果今天没复习但昨天复习了，streak 仍然从昨天开始连续计算
 *       （更宽容的逻辑，避免用户因一次跳过而失去 streak）
 */
export function calcStreak(
  cards: Record<string, Card>,
  now: number = Date.now(),
): number {
  const list = Object.values(cards)
  if (list.length === 0) return 0

  const todayStart = startOfDay(now)

  // 收集所有有复习记录的"距今天数"集合
  const reviewedDays = new Set<number>()
  for (const card of list) {
    for (const review of card.reviews) {
      const dayDiff = Math.floor((todayStart - startOfDay(review.at)) / DAY_MS)
      if (dayDiff >= 0) {
        reviewedDays.add(dayDiff)
      }
    }
  }

  if (reviewedDays.size === 0) return 0

  // 从今天开始往前数连续天数
  // 如果今天没复习但昨天复习，从 day=1 开始数（即不把今天算 0 阻断）
  let streak = 0
  let day = 0
  // 特殊处理：如果今天没复习，从昨天开始数
  if (!reviewedDays.has(0)) {
    day = 1
  }
  while (reviewedDays.has(day)) {
    streak++
    day++
  }
  return streak
}

/** 格式化日期为简短显示（如 7/3, 7/10） */
export function formatShortDate(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/** 今日已复习数（从 dailyReviews[0] 取，等价于 O(1)） */
export function countTodayReviews(cards: Record<string, Card>): number {
  return calcDashboardStats(cards).dailyReviews[0] ?? 0
}