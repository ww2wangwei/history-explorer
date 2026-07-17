/**
 * 复习面板主容器
 *
 * 状态机：
 * - empty: 0 张待复习 → 显示引导
 * - reviewing: 一张一张过（正面 → 显示答案 → 评级）
 * - complete: 本场复习完成 → 显示统计
 *
 * 数据流：
 *   useCardsStore 读 due cards
 *   用户评级 → store.rateCard(SM-2 算法更新)
 */
import { useEffect, useMemo, useState } from 'react'
import type { Rating } from '@/types/flashcards'
import { useCardsStore } from '@/store/useCardsStore'
import { useGoalStore } from '@/store/useGoalStore'
import { countTodayReviews } from '@/utils/cardStats'
import { sm2 } from '@/utils/sm2'
import {
  getEraById,
  getEventById,
  getFigureById,
  getTargetColor,
} from '@/utils/lookups'
import erasData from '@/data/eras.json'
import type { Era } from '@/types'
const ERAS = erasData as Era[]
import FlashcardsHeader from './FlashcardsHeader'
import FlashcardFront from './FlashcardFront'
import FlashcardBack from './FlashcardBack'
import FlashcardsComplete from './FlashcardsComplete'
import FlashcardsEmpty from './FlashcardsEmpty'

interface Props {
  isActive: boolean
  onClose: () => void
}

type Mode = 'reviewing' | 'complete'

export default function FlashcardsPanel({ isActive, onClose }: Props) {
  // 拿到所有 due 卡片（在面板打开时一次性确定）
  const dueCards = useMemo(() => useCardsStore.getState().getDueCards(), [isActive])

  // 强制刷新（rateCard 后要触发重渲染）
  const rateCard = useCardsStore(s => s.rateCard)
  const [tick, setTick] = useState(0)

  // 目标设置 + 今日已复习数
  const goalTarget = useGoalStore(s => s.target)
  const todayReviewed = useMemo(() => countTodayReviews(useCardsStore.getState().cards), [tick])

  const [mode, setMode] = useState<Mode>('reviewing')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [counts, setCounts] = useState({ forgot: 0, hard: 0, good: 0, easy: 0 })

  // 当面板打开时重置
  useEffect(() => {
    if (isActive) {
      setMode('reviewing')
      setCurrentIdx(0)
      setShowAnswer(false)
      setCounts({ forgot: 0, hard: 0, good: 0, easy: 0 })
    }
  }, [isActive])

  // 进度统计
  const total = dueCards.length
  const currentCard = dueCards[currentIdx]

  // ESC 关闭
  useEffect(() => {
    if (!isActive) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isActive, onClose])

  // 评级时计算下次预览间隔（按当前状态模拟）
  const previewIntervals = useMemo(() => {
    if (!currentCard) return { forgot: 1, hard: 1, good: 1, easy: 1 } as Record<Rating, number>
    const result = {} as Record<Rating, number>
    for (const r of ['forgot', 'hard', 'good', 'easy'] as Rating[]) {
      const updated = sm2(currentCard, r)
      result[r] = updated.interval
    }
    return result
  }, [currentCard, tick])

  if (!isActive) return null

  // 0 张待复习
  if (total === 0 || mode === 'complete') {
    if (mode === 'complete') {
      return (
        <div
          className="w-full h-full bg-ink-900 flex flex-col"
          role="region"
          aria-label="复习完成"
        >
          <FlashcardsHeader total={total} current={currentIdx} onClose={onClose} />
          <FlashcardsComplete
            totalReviewed={counts.forgot + counts.hard + counts.good + counts.easy}
            counts={counts}
            onClose={onClose}
            todayReviewed={todayReviewed}
            target={goalTarget}
          />
        </div>
      )
    }
    return (
      <div
        className="w-full h-full bg-ink-900 flex flex-col"
        role="region"
        aria-label="复习"
      >
        <FlashcardsHeader total={0} current={0} onClose={onClose} />
        <FlashcardsEmpty onClose={onClose} />
      </div>
    )
  }

  // 取当前卡片的 target 信息
  const targetInfo = currentCard.target.kind === 'era'
    ? getEraById(currentCard.target.id)
    : currentCard.target.kind === 'event'
      ? getEventById(currentCard.target.id)
      : getFigureById(currentCard.target.id)

  const targetName = targetInfo
    ? (targetInfo as any).name ?? (targetInfo as any).title
    : currentCard.target.id
  const targetDesc = (targetInfo as any)?.shortDesc ?? (targetInfo as any)?.description ?? '（无描述）'
  const targetMissing = !targetInfo
  const targetColor = getTargetColor(currentCard.target.kind, currentCard.target.id)
  // 人物模式：附加 emoji + role + 朝代名
  const figureEmoji = currentCard.target.kind === 'figure'
    ? (targetInfo as any)?.emoji as string | undefined
    : undefined
  const figureRole = currentCard.target.kind === 'figure'
    ? (targetInfo as any)?.role as string | undefined
    : undefined
  const figureEras = currentCard.target.kind === 'figure'
    ? ((targetInfo as any)?.eraIds as string[] | undefined)
        ?.map(eid => ERAS.find(e => e.id === eid)?.name)
        .filter(Boolean)
        .slice(0, 2)
        .join('、')
    : undefined

  const handleRate = (rating: Rating) => {
    // 写入 store
    rateCard(currentCard.id, rating)
    // 计数
    setCounts(c => ({ ...c, [rating]: c[rating] + 1 }))
    setTick(t => t + 1)

    // 下一张或完成
    if (currentIdx + 1 >= total) {
      setMode('complete')
    } else {
      setCurrentIdx(i => i + 1)
      setShowAnswer(false)
    }
  }

  return (
    <div
      className="w-full h-full bg-ink-900 flex flex-col"
      role="region"
      aria-label="复习"
    >
      <FlashcardsHeader
        total={total}
        current={currentIdx}
        onClose={onClose}
      />

      <div
        className="flex-1 flex flex-col min-h-0"
        style={targetColor ? { borderTop: `4px solid ${targetColor}` } : undefined}
      >
        {showAnswer ? (
          <FlashcardBack
            targetName={targetName}
            targetKind={currentCard.target.kind}
            description={targetDesc}
            emoji={figureEmoji}
            subtitle={figureRole}
            meta={figureEras ? `所属朝代：${figureEras}` : undefined}
            currentInterval={currentCard.interval}
            previewIntervals={previewIntervals}
            onRate={handleRate}
          />
        ) : (
          <FlashcardFront
            targetName={targetName}
            targetKind={currentCard.target.kind}
            missing={targetMissing}
            emoji={figureEmoji}
            onShowAnswer={() => setShowAnswer(true)}
          />
        )}
      </div>
    </div>
  )
}