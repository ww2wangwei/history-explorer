import { useThemeStore } from '@/store/useThemeStore'
import { audioEngine } from '@/utils/audioEngine'

/**
 * 主题切换按钮 —— Header 右上角小图标
 * 深色 → 月亮；浅色 → 太阳
 */
export default function ThemeToggle() {
  const theme = useThemeStore(s => s.theme)
  const toggle = useThemeStore(s => s.toggle)
  const next = theme === 'dark' ? '浅色' : '深色'
  return (
    <button
      type="button"
      onClick={() => {
        audioEngine.playClick()
        toggle()
      }}
      className="shrink-0 w-9 h-9 rounded-lg border border-ink-600 bg-ink-700/80 hover:bg-vermilion-500/30 hover:border-vermilion-500/40 text-vermilion-300 flex items-center justify-center transition-colors"
      title={`切换到${next}主题`}
      aria-label={`当前主题：${theme === 'dark' ? '深色' : '浅色'}，点击切换到${next}`}
    >
      <span className="text-base leading-none">
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  )
}