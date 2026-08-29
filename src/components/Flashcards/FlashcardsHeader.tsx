/**
 * 复习页面顶部：进度条 + 退出
 */

interface Props {
  total: number
  current: number  // 0-based，当前是第几张
  onClose: () => void
}

export default function FlashcardsHeader({ total, current, onClose }: Props) {
  const percent = total > 0 ? Math.round(((current + 1) / total) * 100) : 0

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-ink-600 bg-ink-800/80">
      <div className="flex items-center gap-3 flex-1">
        <span className="font-serif text-base text-vermilion-300">🎴 复习模式</span>
        <span className="text-sm text-ink-300">
          第 <span className="text-parchment-50">{current + 1}</span> / {total} 张
        </span>
        <div className="flex-1 max-w-md mx-4">
          <div className="h-1.5 bg-ink-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-bronze-500 transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="px-2 py-1 text-ink-300 hover:text-parchment-50 hover:bg-red-900/30 rounded-lg transition-colors text-base"
        title="退出复习 (ESC)"
        aria-label="退出复习"
      >
        ✕
      </button>
    </div>
  )
}