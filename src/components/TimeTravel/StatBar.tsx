/**
 * StatBar — 穿越历史双值状态栏
 * 两个互相拉扯的状态值(如 兵权/人心),常驻场景顶部。
 */
interface StatDef {
  id: string
  name: string
  emoji: string
  init: number
  max: number
}

interface Props {
  statA: StatDef
  statB: StatDef
  valueA: number
  valueB: number
  color: string
}

function OneStat({ def, value, color }: { def: StatDef; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / def.max) * 100))
  const high = value >= def.max * 0.7
  const danger = value <= def.max * 0.2
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-parchment-100 flex items-center gap-1">
          <span>{def.emoji}</span>
          <span className="font-serif">{def.name}</span>
        </span>
        <span
          className={`tabular-nums font-serif ${danger ? 'text-danger' : high ? 'text-vermilion-300' : 'text-parchment-100'}`}
        >
          {value} / {def.max}
        </span>
      </div>
      <div className="h-2 rounded-full bg-ink-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: danger ? '#b85450' : color,
            boxShadow: high ? `0 0 8px ${color}` : danger ? '0 0 8px #b85450' : 'none',
          }}
        />
      </div>
    </div>
  )
}

export default function StatBar({ statA, statB, valueA, valueB, color }: Props) {
  return (
    <div className="mb-5 p-3 rounded-lg bg-ink-800/70 border border-ink-700 flex items-center gap-5">
      <OneStat def={statA} value={valueA} color={color} />
      <div className="w-px h-8 bg-ink-600 shrink-0" />
      <OneStat def={statB} value={valueB} color={color} />
    </div>
  )
}
