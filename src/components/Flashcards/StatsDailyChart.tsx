/**
 * 过去 30 天每日复习量柱状图（纯 SVG，零依赖）
 *
 * - viewBox 600×180，30 根柱子
 * - 今天（索引 0）高亮 bronze-400，其他 bronze-500
 * - 0 天柱子显示底部小点（避免完全消失）
 * - X 轴每 7 天显示一次日期
 */
import { formatShortDate } from '@/utils/cardStats'

interface Props {
  dailyReviews: number[]  // 索引 0 = 今天，长度 30
}

const WIDTH = 600
const HEIGHT = 180
const PADDING_LEFT = 24
const PADDING_RIGHT = 8
const PADDING_TOP = 12
const PADDING_BOTTOM = 28
const CHART_W = WIDTH - PADDING_LEFT - PADDING_RIGHT
const CHART_H = HEIGHT - PADDING_TOP - PADDING_BOTTOM

export default function StatsDailyChart({ dailyReviews }: Props) {
  // 安全处理：长度不足 30 补 0
  const data = [...dailyReviews]
  while (data.length < 30) data.push(0)

  const max = Math.max(...data, 1)  // 至少 1，避免除 0
  const barWidth = (CHART_W - 29 * 2) / 30  // 每根柱宽，间隔 2px

  // Y 轴刻度（4 个刻度）
  const yTicks = [0, Math.ceil(max / 2), max]

  // X 轴标签位置：今天 + 7 天前 + 14 天前 + 21 天前 + 28 天前
  const today = Date.now()
  const xLabels = [0, 7, 14, 21, 28].map(dayOffset => ({
    dayOffset,
    label: formatShortDate(today - dayOffset * 24 * 60 * 60 * 1000),
    x: PADDING_LEFT + (CHART_W - barWidth) * (1 - dayOffset / 29),
  }))

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label="过去 30 天每日复习量">
      {/* Y 轴网格 + 刻度 */}
      {yTicks.map((tick, i) => {
        const y = PADDING_TOP + CHART_H - (tick / max) * CHART_H
        return (
          <g key={`tick-${i}`}>
            <line
              x1={PADDING_LEFT}
              y1={y}
              x2={WIDTH - PADDING_RIGHT}
              y2={y}
              stroke="#3a342a"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
            <text
              x={PADDING_LEFT - 4}
              y={y + 3}
              fontSize="9"
              fill="#5a5142"
              textAnchor="end"
            >
              {tick}
            </text>
          </g>
        )
      })}

      {/* 柱 */}
      {data.map((count, i) => {
        const x = PADDING_LEFT + i * (barWidth + 2)
        const height = count > 0 ? (count / max) * CHART_H : 2
        const y = PADDING_TOP + CHART_H - height
        const isToday = i === 0
        return (
          <rect
            key={`bar-${i}`}
            x={x}
            y={y}
            width={barWidth}
            height={height}
            fill={isToday ? '#c89a5b' : '#a87a3e'}
            fillOpacity={count === 0 ? 0.3 : 0.85}
            rx="1"
          >
            <title>{`${i === 0 ? '今天' : i + '天前'}: ${count} 次复习`}</title>
          </rect>
        )
      })}

      {/* X 轴标签 */}
      {xLabels.map(({ dayOffset, label, x }) => (
        <text
          key={`xlabel-${dayOffset}`}
          x={x + barWidth / 2}
          y={HEIGHT - 8}
          fontSize="9"
          fill="#5a5142"
          textAnchor="middle"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}