/**
 * 评级分布：4 档横条
 *
 * 每行：标签（左）+ 横条（中）+ 数字 + 百分比（右）
 * 颜色与评级按钮一致（红/橙/蓝/绿）
 */

interface Props {
  counts: {
    forgot: number
    hard: number
    good: number
    easy: number
  }
}

const ROWS = [
  { key: 'forgot' as const, label: '忘了', color: '#b91c1c' },
  { key: 'hard' as const, label: '犹豫', color: '#b45309' },
  { key: 'good' as const, label: '记得', color: '#1d4ed8' },
  { key: 'easy' as const, label: '轻松', color: '#047857' },
]

export default function StatsRatingChart({ counts }: Props) {
  const total = counts.forgot + counts.hard + counts.good + counts.easy
  const max = Math.max(...Object.values(counts), 1)

  if (total === 0) {
    return (
      <div className="text-center text-sm text-ink-300 py-6">暂无复习记录</div>
    )
  }

  return (
    <div className="space-y-2">
      {ROWS.map(row => {
        const count = counts[row.key]
        const percent = Math.round((count / total) * 100)
        const widthPct = (count / max) * 100
        return (
          <div key={row.key} className="flex items-center gap-3 text-sm">
            {/* 标签 */}
            <div className="w-10 text-right text-ink-300">{row.label}</div>
            {/* 横条 */}
            <div className="flex-1 h-5 bg-ink-700/40 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-300"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: row.color,
                  opacity: count > 0 ? 0.85 : 0,
                }}
              />
            </div>
            {/* 数字 + 百分比 */}
            <div className="w-24 text-right tabular-nums">
              <span className="text-parchment-50">{count}</span>
              <span className="text-ink-300 text-xs ml-1">({percent}%)</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}