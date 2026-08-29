/**
 * AdminLayout — 后台管理布局（侧边栏 + 顶部栏 + 内容区）
 */
import { type ReactNode } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import type { AdminTab } from './AdminApp'

interface Props {
  tab: AdminTab
  onTabChange: (tab: AdminTab) => void
  children: ReactNode
}

const TABS: Array<{ id: AdminTab; icon: string; label: string; }> = [
  { id: 'overview', icon: '🏠', label: '总览' },
  { id: 'geo', icon: '🗺️', label: '地理' },
  { id: 'people', icon: '👥', label: '人物' },
  { id: 'cultures', icon: '📚', label: '文化' },
  { id: 'wars', icon: '⚔️', label: '战争' },
  { id: 'graph', icon: '🕸️', label: '关系网' },
]

export default function AdminLayout({ tab, onTabChange, children }: Props) {
  const isDirty = useAdminStore(s => s.isDirty)
  const lastModified = useAdminStore(s => s.lastModified)
  const resetAll = useAdminStore(s => s.resetAll)
  const exportAll = useAdminStore(s => s.exportAll)
  const importAll = useAdminStore(s => s.importAll)
  const overridesCount =
    Object.keys(useAdminStore.getState().geoOverrides).length +
    Object.keys(useAdminStore.getState().peopleOverrides).length +
    Object.keys(useAdminStore.getState().eventsOverrides).length +
    Object.keys(useAdminStore.getState().cultureOverrides).length

  const handleExport = () => {
    const json = exportAll()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-overrides-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const ok = importAll(text)
      if (ok) alert('导入成功！')
      else alert('导入失败：JSON 格式错误')
    }
    input.click()
  }

  return (
    <div className="flex h-screen bg-ink-900 text-parchment-50">
      {/* 侧边栏 */}
      <aside className="w-56 flex-shrink-0 bg-ink-800 border-r border-ink-700 flex flex-col">
        <div className="px-4 py-4 border-b border-ink-700">
          <div className="text-lg font-serif text-vermilion-300 flex items-center gap-2">
            ⚙️ 后台管理
          </div>
          <div className="text-xs text-ink-300 mt-1">
            {overridesCount} 项编辑 · {isDirty ? '🟡 有未保存改动' : '🟢 已同步'}
          </div>
          {lastModified && (
            <div className="text-[9px] text-ink-400 mt-0.5">
              最近修改：{new Date(lastModified).toLocaleString('zh-CN')}
            </div>
          )}
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                tab === t.id
                  ? 'bg-bronze-700/30 text-vermilion-200 border border-bronze-600/50'
                  : 'text-ink-300 hover:bg-ink-700/60 hover:text-parchment-50 border border-transparent'
              }`}
            >
              <span className="mr-2">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-ink-700 space-y-1">
          <button
            onClick={handleExport}
            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-emerald-300 hover:bg-emerald-900/30 border border-emerald-700/30"
          >
            ⬇️ 导出 JSON
          </button>
          <button
            onClick={handleImport}
            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-blue-300 hover:bg-blue-900/30 border border-blue-700/30"
          >
            ⬆️ 导入 JSON
          </button>
          <button
            onClick={() => { if (confirm('确定要重置所有编辑吗？此操作不可撤销。')) resetAll() }}
            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-red-300 hover:bg-red-900/30 border border-red-700/30"
          >
            🗑️ 重置全部
          </button>
          <a
            href="/"
            className="block w-full text-left px-3 py-1.5 rounded-lg text-xs text-ink-400 hover:bg-ink-700/60 border border-ink-700/30"
          >
            ← 返回主应用
          </a>
        </div>
      </aside>

      {/* 内容区 */}
      <main className="flex-1 overflow-auto bg-ink-900">
        {children}
      </main>
    </div>
  )
}
