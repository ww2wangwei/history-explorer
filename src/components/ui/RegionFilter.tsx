/**
 * RegionFilter — "全部 / 中国 / 世界" 区域筛选段
 *
 * 此前在 Figures/Wars/Cultures/Geography 各写一遍且样式略有出入，统一抽出。
 */
export type RegionValue = 'all' | 'china' | 'world'

interface Props {
  value: RegionValue
  onChange: (value: RegionValue) => void
  className?: string
}

const OPTIONS: { value: RegionValue; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'china', label: '🇨🇳 中国' },
  { value: 'world', label: '🌍 世界' },
]

export default function RegionFilter({ value, onChange, className = '' }: Props) {
  return (
    <div className={`flex rounded-lg bg-ink-700/60 border border-ink-600 overflow-hidden text-xs ${className}`}>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 transition-colors ${
            value === opt.value
              ? 'bg-vermilion-500/40 text-vermilion-300'
              : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
