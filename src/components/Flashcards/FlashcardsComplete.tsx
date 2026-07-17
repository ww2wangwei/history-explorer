/**
 * 复习完成页面：本场统计 + 关闭按钮 + 查看统计 + 目标达成激励
 */
import { useState } from 'react'
import StatsDashboard from './StatsDashboard'

interface Props {
  totalReviewed: number
  /** 各评级数量 */
  counts: { forgot: number; hard: number; good: number; easy: number }
  onClose: () => void
  /** 今日已复习总数（含本场） */
  todayReviewed?: number
  /** 每日目标（0 = 关闭） */
  target?: number
}

export default function FlashcardsComplete({
  totalReviewed,
  counts,
  onClose,
  todayReviewed = 0,
  target = 0,
}: Props) {
  const [showStats, setShowStats] = useState(false)

  // 掌握率：good + easy 占比（不含 forgot）
  const masteredRate =
    totalReviewed > 0
      ? Math.round(((counts.good + counts.easy) / totalReviewed) * 100)
      : 0

  // 目标达成判断
  const goalEnabled = target > 0
  const goalReached = goalEnabled && todayReviewed >= target
  const progressPct = goalEnabled ? Math.min(100, Math.round((todayReviewed / target) * 100)) : 0

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12 overflow-y-auto scrollbar-thin">
        <div className="text-5xl mb-4">🎉</div>
        <div className="text-xl font-serif text-bronze-400 mb-2">本场复习完成！</div>
        <div className="text-sm text-ink-500 mb-8">所有待复习卡片已学完，下次复习时间已自动更新</div>

        {/* 目标达成激励 */}
        {goalReached && (
          <div className="mb-6 px-6 py-4 rounded-lg bg-gradient-to-r from-emerald-900/40 to-bronze-900/30 border border-emerald-700/50 max-w-sm w-full">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🎯</span>
              <span className="text-base font-serif text-emerald-300">今日目标已达成！</span>
            </div>
            <div className="flex items-center justify-between text-xs text-ink-300 mb-1">
              <span>进度</span>
              <span className="tabular-nums text-emerald-300">
                {todayReviewed} / {target}（{progressPct}%）
              </span>
            </div>
            <div className="h-2 bg-ink-700/60 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-bronze-400 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* 目标进度（未达成，显示进度条） */}
        {goalEnabled && !goalReached && (
          <div className="mb-6 px-4 py-2 rounded bg-ink-700/30 border border-ink-600 max-w-sm w-full">
            <div className="flex items-center justify-between text-xs text-ink-400 mb-1">
              <span>🎯 今日进度</span>
              <span className="tabular-nums">
                {todayReviewed} / {target}
              </span>
            </div>
            <div className="h-1.5 bg-ink-700/60 rounded overflow-hidden">
              <div
                className="h-full bg-bronze-500/70 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-4 max-w-sm w-full mb-8">
          <div className="px-4 py-3 rounded bg-ink-700/40 border border-ink-600">
            <div className="text-xs text-ink-500 mb-1">复习数量</div>
            <div className="text-2xl font-serif text-parchment-50">{totalReviewed}</div>
          </div>
          <div className="px-4 py-3 rounded bg-ink-700/40 border border-ink-600">
            <div className="text-xs text-ink-500 mb-1">掌握率</div>
            <div className="text-2xl font-serif text-bronze-400">{masteredRate}%</div>
          </div>
          <div className="px-4 py-3 rounded bg-red-900/20 border border-red-700/40">
            <div className="text-xs text-red-400 mb-1">忘了</div>
            <div className="text-2xl font-serif text-red-300">{counts.forgot}</div>
          </div>
          <div className="px-4 py-3 rounded bg-emerald-900/20 border border-emerald-700/40">
            <div className="text-xs text-emerald-400 mb-1">轻松</div>
            <div className="text-2xl font-serif text-emerald-300">{counts.easy}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowStats(true)}
            className="px-6 py-2 text-sm rounded bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-bronze-400 transition-colors"
          >
            📊 查看统计
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm rounded bg-bronze-600/30 hover:bg-bronze-600/50 border border-bronze-500/60 text-bronze-400 transition-colors"
          >
            ← 返回地图
          </button>
        </div>
      </div>

      {showStats && <StatsDashboard onClose={() => setShowStats(false)} />}
    </>
  )
}