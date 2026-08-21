import { create } from 'zustand'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'history-explorer:theme'

function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  const v = window.localStorage.getItem(STORAGE_KEY)
  if (v === 'light' || v === 'dark') return v
  return null
}

function readSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/**
 * 应用到 <html data-theme="...">
 * 不直接重绘，由 CSS 变量切换驱动全站
 */
function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', t)
}

interface ThemeState {
  theme: Theme
  // 用户是否手动指定过；未指定则跟随系统
  setTheme: (t: Theme) => void
  toggle: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  // 默认浅色（用户偏好）；若用户已手动指定过则用其选择，否则跟随系统
  theme: readStoredTheme() ?? 'light',
  setTheme: (t) => {
    applyTheme(t)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, t)
    }
    set({ theme: t })
  },
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },
}))

// 监听系统主题变化（仅当用户未手动指定时才跟随）
if (typeof window !== 'undefined') {
  const mq = window.matchMedia?.('(prefers-color-scheme: light)')
  if (mq?.addEventListener) {
    mq.addEventListener('change', (e) => {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'light' : 'dark')
        useThemeStore.setState({ theme: e.matches ? 'light' : 'dark' })
      }
    })
  }
}

// 模块加载时立即应用一次（防止 FOUC）
if (typeof document !== 'undefined') {
  applyTheme(useThemeStore.getState().theme)
}