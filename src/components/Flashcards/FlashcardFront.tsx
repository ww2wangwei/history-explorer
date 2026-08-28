/**
 * 卡片正面：只显示 target 名称 + "显示答案" 按钮
 * 支持三种 target：朝代 / 事件 / 人物
 */
import { audioEngine } from '@/utils/audioEngine'

interface Props {
  targetName: string
  targetKind: 'era' | 'event' | 'figure'
  /** target 已从 JSON 删除时提示 */
  missing?: boolean
  /** 人物 emoji（figure 模式用） */
  emoji?: string
  onShowAnswer: () => void
}

const KIND_LABEL = {
  era: '朝代',
  event: '事件',
  figure: '人物',
}

export default function FlashcardFront({ targetName, targetKind, missing, emoji, onShowAnswer }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
      <div className="text-xs text-ink-500 mb-4 uppercase tracking-wider">
        {KIND_LABEL[targetKind]} · 正面
      </div>

      {missing && (
        <div className="mb-4 px-3 py-1 text-xs rounded-lg bg-amber-900/40 text-amber-300 border border-amber-700/50">
          ⚠ 原{KIND_LABEL[targetKind]}已删除，仍可复习
        </div>
      )}

      {/* 人物模式：显示大 emoji */}
      {targetKind === 'figure' && emoji && (
        <div className="text-7xl mb-4">{emoji}</div>
      )}

      <div className="text-3xl md:text-4xl font-serif text-parchment-50 text-center mb-12 leading-relaxed">
        {targetName}
      </div>

      {targetKind === 'figure' && (
        <div className="text-xs text-ink-500 mb-6 text-center max-w-md">
          回忆：这个人是谁？做过什么？所属朝代？
        </div>
      )}

      <button
        onClick={() => { audioEngine.playReveal(); onShowAnswer() }}
        className="px-6 py-2.5 text-sm rounded-lg bg-vermilion-500/30 hover:bg-vermilion-500/50 border border-vermilion-500/60 text-vermilion-300 transition-colors"
      >
        💡 显示答案
      </button>

      <div className="mt-8 text-xs text-ink-400">回忆后点击显示答案</div>
    </div>
  )
}
