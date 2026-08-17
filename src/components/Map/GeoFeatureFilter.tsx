/**
 * GeoFeatureFilter — 地图左上角的"图层"切换面板
 *
 *  收起时只显示一个浮动按钮 🗺 图层
 *  展开后展示三栏：
 *    A. 底图样式（高德原生 / OpenTopoMap / ArcGIS 卫星）
 *    B. 自定义叠加层（11 个 GeoFeature：山脉/河流/海洋/沙漠…）
 *    C. AMap 自带 feature 类别（10 类：POI/道路/水系标注/绿地/建筑…）
 */
import { useState } from 'react'
import {
  useMapLayersStore,
  LAYER_META,
  AMAP_FEATURE_META,
  AMAP_FEATURE_KEYS_FOR_UI,
  type GeoLayerKey,
  type AmapFeatureKey,
} from '@/store/useMapLayersStore'
import {
  useMapStyleStore,
  STYLE_META,
  STYLE_KEYS_FOR_UI,
  type MapStyleKey,
} from '@/store/useMapStyleStore'
import { LAYER_KEYS_FOR_UI } from './GeoFeatureLayer'

export default function GeoFeatureFilter() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'style' | 'custom' | 'amap'>('style')

  const visible = useMapLayersStore(s => s.visible)
  const showLabels = useMapLayersStore(s => s.showLabels)
  const toggle = useMapLayersStore(s => s.toggle)
  const toggleLabels = useMapLayersStore(s => s.toggleLabels)
  const showAll = useMapLayersStore(s => s.showAll)
  const hideAll = useMapLayersStore(s => s.hideAll)
  const resetDefault = useMapLayersStore(s => s.resetDefault)

  const amapFeatures = useMapLayersStore(s => s.amapFeatures)
  const toggleAmap = useMapLayersStore(s => s.toggleAmap)
  const amapShowAll = useMapLayersStore(s => s.amapShowAll)
  const amapHideAll = useMapLayersStore(s => s.amapHideAll)
  const amapResetDefault = useMapLayersStore(s => s.amapResetDefault)

  const showGraticule = useMapLayersStore(s => s.showGraticule)
  const toggleGraticule = useMapLayersStore(s => s.toggleGraticule)

  const showCloud = useMapLayersStore(s => s.showCloud)
  const toggleCloud = useMapLayersStore(s => s.toggleCloud)

  const mapStyle = useMapStyleStore(s => s.style)
  const setMapStyle = useMapStyleStore(s => s.setStyle)

  const onCount = (LAYER_KEYS_FOR_UI as GeoLayerKey[]).filter(k => visible[k]).length
  const amapOnCount = amapFeatures.length

  return (
    <>
      {/* 浮动按钮 — 紧贴左上角 T.Map 面板正下方 */}
      <button
        onClick={() => setOpen(o => !o)}
        title="图层（底图样式 + 自定义叠加 + AMap 自带 feature）"
        className={`absolute left-2 z-50 px-3 py-2 rounded-lg border-2 shadow-2xl text-sm font-serif flex items-center gap-1.5 transition-all backdrop-blur ${
          open
            ? 'bg-bronze-600 border-bronze-300 text-parchment-50'
            : 'bg-ink-900/95 border-bronze-500/80 text-bronze-300 hover:bg-ink-800 hover:border-bronze-300'
        }`}
        style={{ top: '70px' }}
      >
        🗺 图层
        {onCount + amapOnCount > 0 && (
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-bronze-500 text-ink-900 font-serif font-bold">{onCount + amapOnCount}</span>
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
            <div className="text-sm font-serif text-bronze-300">🗺 地图图层</div>
            <button
              onClick={() => setOpen(false)}
              className="text-ink-500 hover:text-parchment-50 text-base leading-none"
              aria-label="关闭"
            >×</button>
          </div>

          {/* Tab 切换 */}
          <div className="flex rounded-lg bg-ink-900/60 border border-ink-700 overflow-hidden text-xs mb-3">
            <button
              onClick={() => setTab('style')}
              className={`flex-1 px-2 py-1.5 transition-colors ${
                tab === 'style' ? 'bg-bronze-700/40 text-bronze-200' : 'text-ink-400 hover:text-parchment-50'
              }`}
            >
              底图样式
            </button>
            <button
              onClick={() => setTab('custom')}
              className={`flex-1 px-2 py-1.5 transition-colors ${
                tab === 'custom' ? 'bg-bronze-700/40 text-bronze-200' : 'text-ink-400 hover:text-parchment-50'
              }`}
            >
              叠加层 <span className="text-[10px] opacity-70">({onCount})</span>
            </button>
            <button
              onClick={() => setTab('amap')}
              className={`flex-1 px-2 py-1.5 transition-colors ${
                tab === 'amap' ? 'bg-bronze-700/40 text-bronze-200' : 'text-ink-400 hover:text-parchment-50'
              }`}
            >
              底图要素 <span className="text-[10px] opacity-70">({amapOnCount})</span>
            </button>
          </div>

          {tab === 'style' ? (
            <>
              <div className="space-y-1 mb-2">
                {STYLE_KEYS_FOR_UI.map((k: MapStyleKey) => {
                  const meta = STYLE_META[k]
                  const active = k === mapStyle
                  return (
                    <label
                      key={k}
                      className={`flex items-start gap-2 text-xs cursor-pointer px-1.5 py-1.5 rounded transition-colors ${
                        active ? 'bg-bronze-900/40 border border-bronze-500/40' : 'hover:bg-ink-700/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="map-style"
                        checked={active}
                        onChange={() => setMapStyle(k)}
                        className="accent-bronze-500 mt-0.5"
                      />
                      <span className="text-base leading-none mt-0">{meta.icon}</span>
                      <span className="flex-1 min-w-0">
                        <span className="text-parchment-50 font-serif">{meta.label}</span>
                        <span className="block text-[10px] text-ink-400 leading-tight mt-0.5">{meta.desc}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
              <div className="text-[10px] text-ink-500 mt-2 leading-relaxed pt-2 border-t border-ink-700">
                💡 高德原生样式是抽象政治底图；「地形图（ArcGIS）」和「世界卫星（ArcGIS）」是真实地形/卫星图。
              </div>
            </>
          ) : tab === 'custom' ? (
            <>
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
                💡 叠加层 = 我们额外画的线/面（蓝色河道、棕色山脉等）。
              </div>
            </>
          ) : (
            <>
              <label className="flex items-center gap-2 text-xs text-parchment-50 cursor-pointer mb-2 select-none px-1.5 py-1.5 rounded hover:bg-ink-700/40 transition-colors">
                <input
                  type="checkbox"
                  checked={showGraticule}
                  onChange={toggleGraticule}
                  className="accent-bronze-500"
                />
                <span className="text-base leading-none">🌐</span>
                <span className="font-serif">显示经纬网</span>
                <span className="text-[10px] text-ink-400 ml-1">（每 30° 主线 / 10° 副线）</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-parchment-50 cursor-pointer mb-2 select-none px-1.5 py-1.5 rounded hover:bg-ink-700/40 transition-colors">
                <input
                  type="checkbox"
                  checked={showCloud}
                  onChange={toggleCloud}
                  className="accent-bronze-500"
                />
                <span className="text-base leading-none">⛅</span>
                <span className="font-serif">实时云图</span>
                <span className="text-[10px] text-ink-400 ml-1">（OpenWeatherMap，10 分钟更新）</span>
              </label>

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
                💡 底图要素 = 高德地图自带的 POI、道路、水系标注等。「水系标注」关掉后高德的"长江""黄河"文字会消失（叠加层里仍有）。
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
