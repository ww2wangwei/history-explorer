/**
 * GeoFeatureFilter — 地图左上角的"底图要素"切换面板
 *
 *  通过 AMap.Map.setFeatures() 控制高德底图自带的要素类别
 *  （POI/道路/水系标注/绿地/建筑…），不需要额外画 polyline。
 */
import { useState } from 'react'
import {
  useMapLayersStore,
  AMAP_FEATURE_META,
  AMAP_FEATURE_KEYS_FOR_UI,
  type AmapFeatureKey,
} from '@/store/useMapLayersStore'

export default function GeoFeatureFilter() {
  const [open, setOpen] = useState(false)
  const amapFeatures = useMapLayersStore(s => s.amapFeatures)
  const toggleAmap = useMapLayersStore(s => s.toggleAmap)
  const amapShowAll = useMapLayersStore(s => s.amapShowAll)
  const amapHideAll = useMapLayersStore(s => s.amapHideAll)
  const amapResetDefault = useMapLayersStore(s => s.amapResetDefault)

  const onCount = amapFeatures.length

  return (
    <>
      {/* 浮动按钮 — 紧贴左上角 T.Map 面板正下方 */}
      <button
        onClick={() => setOpen(o => !o)}
        title="底图要素图层（AMap setFeatures 控制）"
        className={`absolute left-2 z-50 px-3 py-2 rounded-lg border-2 shadow-2xl text-sm font-serif flex items-center gap-1.5 transition-all backdrop-blur ${
          open
            ? 'bg-bronze-600 border-bronze-300 text-parchment-50'
            : 'bg-ink-900/95 border-bronze-500/80 text-bronze-300 hover:bg-ink-800 hover:border-bronze-300'
        }`}
        style={{ top: '70px' }}
      >
        🗺 底图要素
        {onCount > 0 && onCount < AMAP_FEATURE_KEYS_FOR_UI.length && (
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-bronze-500 text-ink-900 font-serif font-bold">{onCount}</span>
        )}
      </button>

      {/* 面板 */}
      {open && (
        <div
          className="absolute left-2 z-50 w-72 max-h-[70vh] overflow-y-auto scrollbar-thin rounded-lg border border-bronze-500/40 bg-ink-800/95 backdrop-blur shadow-2xl p-3"
          style={{ top: '115px' }}
          role="dialog"
          aria-label="底图要素图层"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-serif text-bronze-300">🗺 高德底图要素</div>
            <button
              onClick={() => setOpen(false)}
              className="text-ink-500 hover:text-parchment-50 text-base leading-none"
              aria-label="关闭"
            >×</button>
          </div>

          <div className="space-y-1.5 mb-2">
            {AMAP_FEATURE_KEYS_FOR_UI.map(k => {
              const meta = AMAP_FEATURE_META[k]
              const checked = amapFeatures.includes(k)
              return (
                <label key={k} className="flex items-start gap-2 text-xs cursor-pointer hover:bg-ink-700/40 px-1.5 py-1 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAmap(k)}
                    className="accent-bronze-500 mt-0.5"
                  />
                  <span className="text-base leading-none mt-0">{meta.icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="text-parchment-50 font-serif">{meta.label}</span>
                    <span className="block text-[10px] text-ink-400 leading-tight mt-0.5">{meta.desc}</span>
                    <span className="block text-[10px] text-ink-500 leading-tight">高德内部：<code className="text-ink-400">{k}</code></span>
                  </span>
                </label>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-ink-700 text-[10px]">
            <button onClick={amapShowAll} className="px-2 py-1 rounded border border-ink-600 text-ink-300 hover:border-bronze-500 hover:text-bronze-300">全开</button>
            <button onClick={amapHideAll} className="px-2 py-1 rounded border border-ink-600 text-ink-300 hover:border-bronze-500 hover:text-bronze-300">全关</button>
            <button onClick={amapResetDefault} className="px-2 py-1 rounded border border-ink-600 text-ink-300 hover:border-bronze-500 hover:text-bronze-300 ml-auto">恢复默认</button>
          </div>

          <div className="text-[10px] text-ink-500 mt-2 leading-relaxed">
            💡 通过 AMap.Map.setFeatures() 控制底图要素。需要纯净底图时关掉 POI 和道路，需要纯净水域时关掉陆地。
          </div>
        </div>
      )}
    </>
  )
}