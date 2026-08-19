/**
 * 卡片背面：target 名称 + 描述 + 4 档评级按钮
 * 支持三种 target：朝代 / 事件 / 人物
 */
import type { Rating } from '@/types/flashcards'
import { RATING_LABELS } from '@/types/flashcards'

interface Props {
  targetName: string
  targetKind: 'era' | 'event' | 'figure'
  description: string
  /** 人物模式用：额外显示 emoji + role + eraNames */
  emoji?: string
  subtitle?: string
  meta?: string
  /** 当前间隔（天） */
  currentInterval: number
  /** 下次复习将变成的间隔（按 4 档预览） */
  previewIntervals: Record<Rating, number>
  onRate: (rating: Rating) => void
}

const KIND_LABEL = {
  era: '朝代',
  event: '事件',
  figure: '人物',
}

const RATING_CONFIG: Array<{
  key: Rating
  bg: string
  border: string
  text: string
  desc: string
}> = [
  { key: 'forgot', bg: 'bg-red-900/40 hover:bg-red-900/60', border: 'border-red-700/60', text: 'text-red-300', desc: '完全忘记' },
  { key: 'hard', bg: 'bg-amber-900/40 hover:bg-amber-900/60', border: 'border-amber-700/60', text: 'text-amber-300', desc: '记得但很犹豫' },
  { key: 'good', bg: 'bg-blue-900/40 hover:bg-blue-900/60', border: 'border-blue-700/60', text: 'text-blue-300', desc: '记得但要思考' },
  { key: 'easy', bg: 'bg-emerald-900/40 hover:bg-emerald-900/60', border: 'border-emerald-700/60', text: 'text-emerald-300', desc: '轻松回忆' },
]

export default function FlashcardBack({
  targetName,
  targetKind,
  description,
  emoji,
  subtitle,
  meta,
  previewIntervals,
  onRate,
}: Props) {
  return (
    <div className="flex-1 flex flex-col px-8 py-6 min-h-0">
      {/* 顶部：目标名 + 当前间隔 */}
      <div className="text-center mb-4 flex-shrink-0">
        <div className="text-xs text-ink-500 mb-1 uppercase tracking-wider">
          {KIND_LABEL[targetKind]} · 背面
        </div>
        {targetKind === 'figure' && emoji && (
          <div className="text-5xl mb-1">{emoji}</div>
        )}
        <div className="text-xl md:text-2xl font-serif text-vermilion-300">{targetName}</div>
        {subtitle && (
          <div className="text-xs text-ink-400 mt-1">{subtitle}</div>
        )}
        {meta && (
          <div className="text-xs text-ink-500 mt-0.5">{meta}</div>
        )}
      </div>

      {/* 描述区 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-4 mb-4">
        <div className="text-base text-parchment-100 leading-relaxed whitespace-pre-wrap">
          {description}
        </div>
      </div>

      {/* 评级按钮：4 档 */}
      <div className="flex-shrink-0">
        <div className="text-xs text-ink-500 mb-2 text-center">回想得如何？</div>
        <div className="grid grid-cols-4 gap-2">
          {RATING_CONFIG.map(cfg => {
            const nextDays = previewIntervals[cfg.key]
            return (
              <button
                key={cfg.key}
                onClick={() => onRate(cfg.key)}
                className={`px-3 py-2 rounded-lg border ${cfg.bg} ${cfg.border} ${cfg.text} transition-colors flex flex-col items-center gap-1`}
              >
                <span className="text-sm font-medium">{RATING_LABELS[cfg.key]}</span>
                <span className="text-xs opacity-70">{cfg.desc}</span>
                <span className="text-xs text-ink-400">
                  {nextDays === 1 ? '明天' : `${nextDays} 天后`}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
