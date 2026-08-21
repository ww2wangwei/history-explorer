import { useState } from 'react'
import { useThemeStore, type Theme } from '@/store/useThemeStore'
import { audioEngine } from '@/utils/audioEngine'

/**
 * 主题切换器 —— Header 右上角
 *
 * demo 阶段：3 选项 (深色 / 浅色 / 豆沙)
 * - 深色 = 墨·朱砂（默认深色）
 * - 浅色 = 宣纸·朱砂
 * - 豆沙 = 豆沙色 #481e1c 主调（待用户评审）
 */
export default function ThemeToggle() {
  const theme = useThemeStore(s => s.theme)
  const setTheme = useThemeStore(s => s.setTheme)
  const [open, setOpen] = useState(false)

  const currentIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌰'
  const currentLabel = theme === 'dark' ? '深色' : theme === 'light' ? '浅色' : '豆沙'

  const options: { value: Theme; icon: string; label: string; swatch: string; desc: string }[] = [
    { value: 'dark',   icon: '🌙', label: '深色', swatch: '#1a1714', desc: '墨·朱砂' },
    { value: 'light',  icon: '☀️', label: '浅色', swatch: '#ede4cf', desc: '宣纸·朱砂' },
    { value: 'dousha', icon: '🌰', label: '豆沙', swatch: '#481e1c', desc: '豆沙主调（demo）' },
  ]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { audioEngine.playClick(); setOpen(o => !o) }}
        className="shrink-0 w-9 h-9 rounded-lg border border-ink-600 bg-ink-700/80 hover:bg-vermilion-500/30 hover:border-vermilion-500/40 text-vermilion-300 flex items-center justify-center transition-colors"
        title={`当前：${currentLabel}`}
        aria-label={`当前主题：${currentLabel}`}
      >
        <span className="text-base leading-none">{currentIcon}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-56 rounded-lg border border-ink-600 bg-ink-800 shadow-xl shadow-black/40 overflow-hidden">
            <div className="px-3 py-2 text-xs text-ink-300 border-b border-ink-700">
              切换主题
            </div>
            {options.map(opt => {
              const active = opt.value === theme
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    audioEngine.playClick()
                    setTheme(opt.value)
                    setOpen(false)
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-ink-700/60 transition-colors text-left ${active ? 'bg-vermilion-500/15' : ''}`}
                >
                  <span
                    className="w-6 h-6 rounded border border-ink-500 shrink-0"
                    style={{ backgroundColor: opt.swatch }}
                    aria-hidden
                  />
                  <span className="flex-1 min-w-0">
                    <div className="text-sm text-ink-100 flex items-center gap-1">
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                      {active && <span className="text-[10px] text-vermilion-300 ml-1">✓</span>}
                    </div>
                    <div className="text-[10px] text-ink-400 truncate">{opt.desc}</div>
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}