/**
 * AdminOverview — 后台总览
 */
import { useAdminStore } from '@/store/useAdminStore'
import type { AdminTab } from './AdminApp'

interface Props { onTabChange: (tab: AdminTab) => void }

export default function AdminOverview({ onTabChange }: Props) {
  const geo = useAdminStore(s => s.geoOverrides)
  const people = useAdminStore(s => s.peopleOverrides)
  const events = useAdminStore(s => s.eventsOverrides)
  const culture = useAdminStore(s => s.cultureOverrides)
  const lastModified = useAdminStore(s => s.lastModified)
  const isDirty = useAdminStore(s => s.isDirty)
  const resetAll = useAdminStore(s => s.resetAll)

  const total = Object.keys(geo).length + Object.keys(people).length + Object.keys(events).length + Object.keys(culture).length

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-serif text-vermilion-300 mb-2">⚙️ 后台管理</h1>
      <p className="text-sm text-ink-400 mb-8">
        编辑后的内容存在浏览器 localStorage（key: <code className="text-vermilion-300">history-explorer-admin</code>），不影响源文件。
        主应用读取时会优先用这里的覆盖。
      </p>

      {/* 状态卡 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard icon="🗺️" label="地理编辑" count={Object.keys(geo).length} color="#5b9bc8" onClick={() => onTabChange('geo')} />
        <StatCard icon="👥" label="人物编辑" count={Object.keys(people).length} color="#c89a5b" onClick={() => onTabChange('people')} />
        <StatCard icon="📚" label="文化编辑" count={Object.keys(culture).length} color="#9b7eb6" onClick={() => onTabChange('cultures')} />
        <StatCard icon="⚔️" label="战争编辑" count={Object.keys(events).length} color="#b85450" onClick={() => onTabChange('wars')} />
      </div>

      <div className="p-4 rounded-lg bg-ink-800 border border-ink-700 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-parchment-50 mb-1">
              总编辑数：<span className="text-2xl font-serif text-vermilion-300">{total}</span>
            </div>
            <div className="text-xs text-ink-500">
              状态：{isDirty ? '🟡 有未保存改动（已自动存到 localStorage）' : '🟢 已同步'}
            </div>
            {lastModified && (
              <div className="text-xs text-ink-600 mt-1">
                最近修改：{new Date(lastModified).toLocaleString('zh-CN')}
              </div>
            )}
          </div>
          <button
            onClick={() => { if (confirm('确定要重置所有编辑吗？')) resetAll() }}
            disabled={total === 0}
            className="px-3 py-2 rounded-lg bg-red-900/40 hover:bg-red-800/60 border border-red-600/50 text-red-200 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🗑️ 重置全部
          </button>
        </div>
      </div>

      {/* 说明 */}
      <div className="p-4 rounded-lg bg-ink-800/60 border border-ink-700 text-sm text-ink-300 space-y-2">
        <div className="text-vermilion-300 font-serif">💡 使用说明</div>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>在 <strong>地理/人物/文化/战争</strong> 页面可以增删改查条目</li>
          <li>图片字段输入<strong>英文关键词</strong>，保存后自动用 Bing 缩略图</li>
          <li>关系网 tab 可以可视化编辑人物之间的关系</li>
          <li>改完<strong>自动存</strong>到 localStorage，无需手动保存</li>
          <li>主应用打开对应弹窗时会<strong>优先用你的编辑</strong>，否则 fallback 到源数据</li>
          <li>导出的 JSON 可用于备份或换设备时迁移</li>
        </ul>
      </div>
    </div>
  )
}

function StatCard({ icon, label, count, color, onClick }: { icon: string; label: string; count: number; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-lg bg-ink-800 border border-ink-700 hover:border-vermilion-500/60 text-left transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-ink-400">{label}</span>
      </div>
      <div className="text-2xl font-serif" style={{ color }}>{count}</div>
      <div className="text-xs text-ink-500 mt-1">点击编辑 →</div>
    </button>
  )
}
