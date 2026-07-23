/**
 * OverviewSearch — 各总览页的搜索输入框
 *
 * 此前在 Figures/Wars/Cultures 各写一遍（样式完全一致，仅 placeholder / min-width 不同）。
 */
interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** 最小宽度（px），默认 180 */
  minWidth?: number
  className?: string
}

export default function OverviewSearch({
  value,
  onChange,
  placeholder = '搜索...',
  minWidth = 180,
  className = '',
}: Props) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      style={{ minWidth: `${minWidth}px` }}
      className={`flex-1 text-xs px-3 py-1.5 bg-ink-700/60 border border-ink-600 rounded-lg text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500 ${className}`}
    />
  )
}
