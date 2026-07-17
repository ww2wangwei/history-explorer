/**
 * 笔记总览抽屉顶部：标题 + 关闭按钮
 */
interface Props {
  onClose: () => void
}

export default function NotesOverviewHeader({ onClose }: Props) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-ink-600">
      <h2 className="font-serif text-lg text-bronze-400 flex items-center gap-2">
        📒 我的笔记
      </h2>
      <button
        onClick={onClose}
        className="px-2 py-1 text-ink-500 hover:text-parchment-50 hover:bg-red-900/30 rounded transition-colors text-base"
        title="关闭 (ESC)"
      >
        ✕
      </button>
    </div>
  )
}