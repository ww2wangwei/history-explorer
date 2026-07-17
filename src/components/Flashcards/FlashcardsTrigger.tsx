/**
 * Header 复习按钮 + 数字徽章 + 目标进度
 *
 * 显示逻辑：
 * - target === 0：显示 dueCount（红色徽章）
 * - target > 0 && todayCount < target：显示「X/Y」蓝色徽章（进度）
 * - target > 0 && todayCount >= target：显示 ✓ 绿色徽章（已完成）
 */

interface Props {
  dueCount: number
  active?: boolean
  onClick: () => void
  /** 今日已复习数 */
  todayCount?: number
  /** 每日目标（0 = 关闭） */
  target?: number
  title?: string
}

export default function FlashcardsTrigger({
  dueCount,
  active,
  onClick,
  todayCount = 0,
  target = 0,
  title,
}: Props) {
  // 目标开启
  const goalEnabled = target > 0
  const goalReached = goalEnabled && todayCount >= target
  const showProgress = goalEnabled && !goalReached

  return (
    <button
      className={`px-3 py-1.5 rounded text-xs flex items-center gap-1.5 relative transition-colors ${
        active
          ? 'bg-bronze-600/40 text-bronze-400 border border-bronze-500/60'
          : goalReached
          ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50'
          : 'bg-ink-700/80 hover:bg-ink-600 border border-ink-600 text-bronze-400'
      }`}
      onClick={onClick}
      title={
        title
          ?? goalReached
          ? `今日已完成 ${todayCount}/${target}，所有卡片明天见`
          : goalEnabled
          ? `复习（今日 ${todayCount}/${target}）`
          : `复习（待复习 ${dueCount} 张）`
      }
    >
      {goalReached ? '✓ 已完成' : '🎴 复习'}

      {/* 徽章 */}
      {goalReached ? (
        <span className="ml-0.5 tabular-nums text-emerald-300">
          {todayCount}/{target}
        </span>
      ) : showProgress ? (
        <span className="ml-0.5 tabular-nums text-blue-300">
          {todayCount}/{target}
        </span>
      ) : dueCount > 0 ? (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-medium flex items-center justify-center ring-2 ring-ink-800 tabular-nums">
          {dueCount > 99 ? '99+' : dueCount}
        </span>
      ) : null}
    </button>
  )
}