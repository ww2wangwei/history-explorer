/**
 * 复习空状态：0 待复习卡时引导用户去详情页添加
 */

interface Props {
  onClose: () => void
}

export default function FlashcardsEmpty({ onClose }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-16 h-full">
      <div className="text-5xl mb-4 opacity-60">🎴</div>
      <div className="text-lg text-ink-300 mb-3 font-serif">没有待复习的卡片</div>
      <div className="text-sm text-ink-500 leading-relaxed max-w-md mb-6">
        在朝代详情或事件详情页点击「🎴 加入复习」按钮，把你想长期记住的内容加入复习队列。
      </div>
      <div className="text-xs text-ink-600 leading-relaxed max-w-md mb-8">
        <p className="mb-1">📖 间隔重复原理：</p>
        <p>每次复习会根据你的回忆难度（忘记/犹豫/记得/轻松），用 SM-2 算法自动计算下次复习时间。</p>
        <p>轻松答对 → 下次复习拉长；记不起来 → 立即重学。</p>
      </div>
      <button
        onClick={onClose}
        className="px-4 py-1.5 text-sm rounded-lg bg-ink-700 hover:bg-ink-600 border border-ink-600 text-vermilion-300 transition-colors"
      >
        ← 返回地图
      </button>
    </div>
  )
}