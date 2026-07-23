/**
 * 笔记总览顶部：标题 + 关闭按钮
 *
 * 视觉规格与 ui/OverviewLayout 的头部保持一致：
 *   - 关闭按钮 32×32、字形 `×`、hover 高亮、aria-label
 *   - 标题 text-2xl font-serif text-bronze-300
 * 注：本组件不套用 OverviewLayout（笔记 page 形态是 flex 撑满高度的
 *     编辑器分屏布局，与 OverviewLayout 的滚动流模型不兼容），仅对齐头部视觉。
 */
interface Props {
  onClose: () => void
}

export default function NotesOverviewHeader({ onClose }: Props) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-bronze-500/40 bg-ink-800/95 backdrop-blur">
      <h2 className="font-serif text-2xl text-bronze-300 flex items-center gap-2">
        📒 我的笔记
      </h2>
      <button
        onClick={onClose}
        className="shrink-0 text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700 transition-colors"
        title="关闭 (ESC)"
        aria-label="关闭"
      >
        ×
      </button>
    </div>
  )
}
