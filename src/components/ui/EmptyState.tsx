/**
 * EmptyState — 友好的空状态展示组件
 *
 * 用法:
 *   <EmptyState
 *     emoji="🌍"
 *     title="还没添加任何自然特征"
 *     hint="试试切换左侧筛选条件"
 *     actionLabel="返回"
 *     onAction={() => resetFilter()}
 *   />
 */
interface Props {
  emoji?: string
  title: string
  hint?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export default function EmptyState({
  emoji = '📭',
  title,
  hint,
  actionLabel,
  onAction,
  className = '',
}: Props) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="text-6xl mb-3 inline-block opacity-70">{emoji}</div>
      <div className="text-sm text-parchment-200 mb-1">{title}</div>
      {hint && (
        <div className="text-xs text-ink-300 mb-3">{hint}</div>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-xs px-3 py-1.5 rounded-lg bg-vermilion-500/30 hover:bg-vermilion-500/50 border border-vermilion-500/60 text-vermilion-300 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
