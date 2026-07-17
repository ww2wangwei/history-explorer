/**
 * 复习统计仪表盘主容器
 *
 * - 半透明背景（点击关闭）
 * - 内容卡：标题 + 总览 + 30 天柱状图 + 评级分布 + streak
 * - ESC 关闭
 *
 * 数据快照：在打开时一次性计算（getState 而非订阅）
 */
import { useEffect, useMemo } from 'react'
import { useCardsStore } from '@/store/useCardsStore'
import { calcDashboardStats, calcStreak } from '@/utils/cardStats'
import StatsOverview from './StatsOverview'
import StatsDailyChart from './StatsDailyChart'
import StatsRatingChart from './StatsRatingChart'

interface Props {
  onClose: () => void
}

export default function StatsDashboard({ onClose }: Props) {
  // 用 getState 取快照（不订阅，避免 cards 变化时重渲染）
  const cards = useCardsStore.getState().cards

  const stats = useMemo(() => calcDashboardStats(cards), [cards])
  const streak = useMemo(() => calcStreak(cards), [cards])

  // ESC 关闭（用 stopPropagation 避免被外层 FlashcardsPanel 的 ESC handler 误关）
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()  // 阻止冒泡到 FlashcardsPanel
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey, true)  // capture phase 提前拦截
    // 阻止 body 滚动
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey, true)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <>
      {/* 半透明背景 */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        role="presentation"
      >
        {/* 内容卡（阻止冒泡，避免内部点击关闭） */}
        <div
          onClick={e => e.stopPropagation()}
          className="bg-ink-800/98 border border-ink-600 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin"
          role="dialog"
          aria-label="复习统计"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-600">
            <h2 className="font-serif text-xl text-bronze-400 flex items-center gap-2">
              📊 复习统计
            </h2>
            <button
              onClick={onClose}
              className="px-2 py-1 text-ink-500 hover:text-parchment-50 hover:bg-red-900/30 rounded transition-colors text-base"
              title="关闭 (ESC)"
            >
              ✕
            </button>
          </div>

          {/* 内容 */}
          <div className="px-6 py-5 space-y-6">
            {/* 总览 */}
            <section>
              <h3 className="text-xs text-ink-500 mb-2">总览</h3>
              <StatsOverview
                totalCards={stats.totalCards}
                dueCount={stats.dueCount}
                newCount={stats.newCount}
                masteredCount={stats.masteredCount}
                totalReviews={stats.totalReviews}
              />
            </section>

            {/* 30 天复习量 */}
            <section>
              <h3 className="text-xs text-ink-500 mb-2">过去 30 天复习量</h3>
              <div className="px-2 py-3 bg-ink-700/20 rounded border border-ink-600">
                <StatsDailyChart dailyReviews={stats.dailyReviews} />
              </div>
            </section>

            {/* 评级分布 */}
            <section>
              <h3 className="text-xs text-ink-500 mb-2">评级分布</h3>
              <div className="px-2 py-3 bg-ink-700/20 rounded border border-ink-600">
                <StatsRatingChart counts={stats.ratingCounts} />
              </div>
            </section>

            {/* 连续学习天数 */}
            <section className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded border border-amber-700/30">
              <span className="text-2xl">🔥</span>
              <span className="text-sm text-ink-300">连续复习</span>
              <span className="text-2xl font-serif text-amber-300 tabular-nums">{streak}</span>
              <span className="text-sm text-ink-300">天</span>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}