/**
 * 5 个总览数字卡片
 *
 * 总卡片 / 待复习 / 新卡 / 已掌握 / 总复习次数
 * P2.3 数字 count-up + scale-in 动画
 */
import { useCountUp } from '@/hooks/useCountUp'

interface Props {
  totalCards: number
  dueCount: number
  newCount: number
  masteredCount: number
  totalReviews: number
}

interface StatCard {
  label: string
  value: number
  color: string
}

function StatItem({ label, value, color, delay }: StatCard & { delay: number }) {
  const animated = useCountUp(value, { duration: 0.9 + delay, decimals: 0 })
  return (
    <div
      key={label}
      className="px-3 py-3 rounded-lg bg-ink-700/40 border border-ink-600 text-center scale-in"
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <div className={`text-2xl font-serif tabular-nums ${color}`}>{animated}</div>
      <div className="text-xs text-ink-300 mt-1">{label}</div>
    </div>
  )
}

export default function StatsOverview({
  totalCards,
  dueCount,
  newCount,
  masteredCount,
  totalReviews,
}: Props) {
  const stats: StatCard[] = [
    { label: '总卡片', value: totalCards, color: 'text-parchment-50' },
    { label: '待复习', value: dueCount, color: 'text-red-300' },
    { label: '新卡', value: newCount, color: 'text-blue-300' },
    { label: '已掌握', value: masteredCount, color: 'text-emerald-300' },
    { label: '总复习', value: totalReviews, color: 'text-vermilion-300' },
  ]

  return (
    <div className="grid grid-cols-5 gap-3">
      {stats.map((stat, i) => (
        <StatItem key={stat.label} {...stat} delay={i} />
      ))}
    </div>
  )
}