/**
 * 笔记空状态
 *
 * 区分朝代 vs 事件，显示不同的引导文案。
 */
import type { NoteTargetKind } from '@/types/notes'

interface Props {
  kind: NoteTargetKind
  onCreate: () => void
}

export default function EmptyState({ kind, onCreate }: Props) {
  const isEra = kind === 'era'
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-10">
      <div className="text-3xl mb-3 opacity-60">📝</div>
      <div className="text-sm text-ink-300 mb-2 font-serif">
        这里还没有笔记
      </div>
      <div className="text-xs text-ink-500 mb-5 leading-relaxed max-w-[280px]">
        {isEra ? (
          <>
            比如：政治制度 / 重要事件 / 衰亡原因 / 文化成就
            <br />
            <span className="text-ink-600">（一个朝代可建多条独立笔记）</span>
          </>
        ) : (
          <>
            这条事件对你有什么启发？当时的背景是什么？
            <br />
            <span className="text-ink-600">（支持 Markdown + 任务列表）</span>
          </>
        )}
      </div>
      <button
        onClick={onCreate}
        className="px-4 py-1.5 text-xs rounded bg-bronze-600/30 hover:bg-bronze-600/50 border border-bronze-500/50 text-bronze-400 transition-colors"
      >
        ＋ 新建笔记
      </button>
    </div>
  )
}