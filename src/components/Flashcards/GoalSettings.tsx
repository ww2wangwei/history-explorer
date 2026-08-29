/**
 * 每日复习目标设置浮层
 *
 * - 半透明背景 + 居中卡片
 * - 输入框（0-100）
 * - 建议标签（初学者/持续/冲刺）
 * - ESC + 背景点击 + ✕ 关闭
 */
import { useEffect, useState } from 'react'
import { useGoalStore, DEFAULT_TARGET } from '@/store/useGoalStore'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function GoalSettings({ isOpen, onClose }: Props) {
  const storeTarget = useGoalStore(s => s.target)
  const setStoreTarget = useGoalStore(s => s.setTarget)
  const [draft, setDraft] = useState<number>(storeTarget)

  // 打开时同步 store 当前值
  useEffect(() => {
    if (isOpen) setDraft(storeTarget)
  }, [isOpen, storeTarget])

  // ESC 关闭（capture phase，避免冒泡到外层）
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey, true)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey, true)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSave = () => {
    setStoreTarget(draft)
    onClose()
  }

  const handlePreset = (n: number) => setDraft(n)

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-ink-800/98 border border-ink-600 rounded-lg shadow-2xl max-w-md w-full"
        role="dialog"
        aria-label="设置每日复习目标"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-600">
          <h2 className="font-serif text-lg text-vermilion-300 flex items-center gap-2">
            🎯 每日复习目标
          </h2>
          <button
            onClick={onClose}
            className="px-2 py-1 text-ink-300 hover:text-parchment-50 hover:bg-red-900/30 rounded-lg transition-colors text-base"
            title="关闭 (ESC)"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div className="px-5 py-5 space-y-4">
          {/* 输入框 */}
          <div>
            <label className="text-xs text-ink-300 block mb-1.5">每日目标</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={draft}
                onChange={e => setDraft(Math.max(0, Math.min(100, parseInt(e.target.value || '0', 10))))}
                className="w-20 px-3 py-2 bg-ink-700/60 border border-ink-600 rounded-lg text-base text-parchment-50 text-center focus:outline-none focus:border-vermilion-500/40"
              />
              <span className="text-sm text-ink-300">张 / 天</span>
              <span className="text-xs text-ink-300 ml-2">（0 = 关闭目标）</span>
            </div>
          </div>

          {/* 预设按钮 */}
          <div>
            <label className="text-xs text-ink-300 block mb-1.5">建议</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handlePreset(3)}
                className="px-3 py-1.5 text-xs rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-parchment-50 transition-colors"
              >
                🌱 初学者
                <span className="text-ink-300 ml-1">3</span>
              </button>
              <button
                onClick={() => handlePreset(5)}
                className="px-3 py-1.5 text-xs rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-parchment-50 transition-colors"
              >
                📚 持续
                <span className="text-ink-300 ml-1">5</span>
              </button>
              <button
                onClick={() => handlePreset(10)}
                className="px-3 py-1.5 text-xs rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-parchment-50 transition-colors"
              >
                🔥 冲刺
                <span className="text-ink-300 ml-1">10</span>
              </button>
              <button
                onClick={() => handlePreset(0)}
                className="px-3 py-1.5 text-xs rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-400 transition-colors"
              >
                ⏸ 关闭
              </button>
            </div>
          </div>

          {/* 当前默认提示 */}
          {storeTarget === DEFAULT_TARGET && (
            <div className="text-xs text-ink-400">
              💡 默认目标为 5 张/天。可根据自己节奏调整。
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-ink-600">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm rounded-lg bg-vermilion-500/40 hover:bg-vermilion-500/60 border border-vermilion-500/60 text-vermilion-300 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}