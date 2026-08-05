/**
 * GeoFeatureFilter — 地图右上角的"地理要素"图层切换面板
 *
 *  - 收起时只显示一个浮动按钮 🗺 图层
 *  - 展开后展示 11 个要素类别的勾选列表 + 显示标签开关 + 全开/全关/恢复默认
 */
import { useState } from 'react'
import { useMapLayersStore, LAYER_META, type GeoLayerKey } from '@/store/useMapLayersStore'
import { LAYER_KEYS_FOR_UI } from './GeoFeatureLayer'

export default function GeoFeatureFilter() {
  const [open, setOpen] = useState(false)
  const visible = useMapLayersStore(s => s.visible)
  const showLabels = useMapLayersStore(s => s.showLabels)
  const toggle = useMapLayersStore(s => s.toggle)
  const toggleLabels = useMapLayersStore(s => s.toggleLabels)
  const showAll = useMapLayersStore(s => s.showAll)
  const hideAll = useMapLayersStore(s => s.hideAll)
  const resetDefault = useMapLayersStore(s => s.resetDefault)

  const onCount = (LAYER_KEYS_FOR_UI as GeoLayerKey[]).filter(k => visible[k]).length

  return (
    <>
      {/* 浮动按钮 — 直接放在左上角 T.Map 面板正下方（top-2 ~ 60px 高度） */}
      <button
        onClick={() => setOpen(o => !o)}
        title="自然地理要素图层（河流/山脉/海洋…）"
        className={`absolute left-2 z-50 px-3 py-2 rounded-lg border-2 shadow-2xl text-sm font-serif flex items-center gap-1.5 transition-all backdrop-blur ${
          open
            ? 'bg-bronze-600 border-bronze-300 text-parchment-50'
            : 'bg-ink-900/95 border-bronze-500/80 text-bronze-300 hover:bg-ink-800 hover:border-bronze-300'
        }`}
        style={{ top: '70px' }}
      >
        🗺 图层
        {onCount > 0 && (
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-bronze-500 text-ink-900 font-serif font-bold">{onCount}</span>
        )}
      </button>

      {/* 面板 */}
      {open && (
        <div
          className="absolute left-2 z-50 w-72 max-h-[70vh] overflow-y-auto scrollbar-thin rounded-lg border border-bronze-500/40 bg-ink-800/95 backdrop-blur shadow-2xl p-3"
          style={{ top: '115px' }}
          role="dialog"
          aria-label="地理要素图层"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-serif text-bronze-300">🗺 自然地理要素</div>
            <button
              onClick={() => setOpen(false)}
              className="text-ink-500 hover:text-parchment-50 text-base leading-none"
              aria-label="关闭"
            >×</button>
          </div>

          <label className="flex items-center gap-2 text-xs text-parchment-50 cursor-pointer mb-2 select-none">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={toggleLabels}
              className="accent-bronze-500"
            />
            <span>显示要素名称标签</span>
          </label>

          <div className="space-y-1.5 mb-2">
            {(LAYER_KEYS_FOR_UI as GeoLayerKey[]).map(k => {
              const meta = LAYER_META[k]
              return (
                <label key={k} className="flex items-start gap-2 text-xs cursor-pointer hover:bg-ink-700/40 px-1.5 py-1 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={visible[k]}
                    onChange={() => toggle(k)}
                    className="accent-bronze-500 mt-0.5"
                  />
                  <span className="text-base leading-none mt-0">{meta.icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="text-parchment-50 font-serif">{meta.label}</span>
                    {meta.desc && <span className="block text-[10px] text-ink-400 leading-tight mt-0.5">{meta.desc}</span>}
                  </span>
                </label>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-ink-700 text-[10px]">
            <button onClick={showAll} className="px-2 py-1 rounded border border-ink-600 text-ink-300 hover:border-bronze-500 hover:text-bronze-300">全开</button>
            <button onClick={hideAll} className="px-2 py-1 rounded border border-ink-600 text-ink-300 hover:border-bronze-500 hover:text-bronze-300">全关</button>
            <button onClick={resetDefault} className="px-2 py-1 rounded border border-ink-600 text-ink-300 hover:border-bronze-500 hover:text-bronze-300 ml-auto">恢复默认</button>
          </div>

          <div className="text-[10px] text-ink-500 mt-2 leading-relaxed">
            💡 提示：山脉、河流是讲"地理决定历史"的最佳辅助——譬如看到幼发拉底河与底格里斯河两岸的世界（两河文明），自然就懂为何古巴比伦在那一带。
          </div>
        </div>
      )}
    </>
  )
}