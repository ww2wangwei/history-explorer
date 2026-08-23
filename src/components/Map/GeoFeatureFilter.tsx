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
  const viewMode = useMapStyleStore(s => s.viewMode)
  const setViewMode = useMapStyleStore(s => s.setViewMode)

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
            ? 'bg-vermilion-500 border-bronze-300 text-parchment-50'
            : 'bg-ink-900/95 border-vermilion-500/40/80 text-vermilion-300 hover:bg-ink-800 hover:border-bronze-300'
        }`}
        style={{ top: '10px' }}
      >
        🗺 图层
        {onCount + amapOnCount > 0 && (
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-bronze-500 text-ink-900 font-serif font-bold">{onCount + amapOnCount}</span>
        )}
      </button>

      {/* 面板 */}
      {open && (
        <div
          className="absolute left-2 z-50 w-72 max-h-[55vh] flex flex-col rounded-lg border border-vermilion-500/40 bg-ink-800/95 backdrop-blur shadow-2xl"
          style={{ top: '55px' }}
          role="dialog"
          aria-label="地理要素图层"
        >
          {/* 头部（固定） */}
          <div className="flex items-center justify-between p-3 pb-2 border-b border-ink-700 shrink-0">
            <div className="text-sm font-serif text-vermilion-300">🗺 地图图层</div>
            <button
              onClick={() => setOpen(false)}
              className="text-ink-500 hover:text-parchment-50 text-base leading-none"
              aria-label="关闭"
            >×</button>
          </div>

          {/* Tab 切换 */}
          <div className="flex rounded-lg bg-ink-900/60 border border-ink-700 overflow-hidden text-xs m-3 mb-0 shrink-0">
            <button
              onClick={() => setTab('style')}
              className={`flex-1 px-2 py-1.5 transition-colors ${
                tab === 'style' ? 'bg-vermilion-700/40 text-vermilion-200' : 'text-ink-400 hover:text-parchment-50'
              }`}
            >
              底图样式
            </button>
            <button
              onClick={() => setTab('custom')}
              className={`flex-1 px-2 py-1.5 transition-colors ${
                tab === 'custom' ? 'bg-vermilion-700/40 text-vermilion-200' : 'text-ink-400 hover:text-parchment-50'
              }`}
            >
              叠加层 <span className="text-[10px] opacity-70">({onCount})</span>
            </button>
            <button
              onClick={() => setTab('amap')}
              className={`flex-1 px-2 py-1.5 transition-colors ${
                tab === 'amap' ? 'bg-vermilion-700/40 text-vermilion-200' : 'text-ink-400 hover:text-parchment-50'
              }`}
            >
              底图要素 <span className="text-[10px] opacity-70">({amapOnCount})</span>
            </button>
          </div>

          {/* Tab 内容区（可滚动） */}
          <div className="overflow-y-auto scrollbar-thin p-3 flex-1 min-h-0">

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
                        active ? 'bg-vermilion-900/30 border border-vermilion-500/40' : 'hover:bg-ink-700/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="map-style"
                        checked={active}
                        onChange={() => setMapStyle(k)}
                        className="accent-vermilion-500 mt-0.5"
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
                  className="accent-vermilion-500"
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
                        className="accent-vermilion-500 mt-0.5"
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
                <button onClick={showAll} className="px-2 py-1 rounded border border-ink-600 text-ink-300 hover:border-vermilion-500/40 hover:text-vermilion-300">全开</button>
                <button onClick={hideAll} className="px-2 py-1 rounded border border-ink-600 text-ink-300 hover:border-vermilion-500/40 hover:text-vermilion-300">全关</button>
                <button onClick={resetDefault} className="px-2 py-1 rounded border border-ink-600 text-ink-300 hover:border-vermilion-500/40 hover:text-vermilion-300 ml-auto">恢复默认</button>
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
                  className="accent-vermilion-500"
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
                  className="accent-vermilion-500"
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
                        className="accent-vermilion-500 mt-0.5"
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

              <div className="flex items-center gap-1.5 pt-2 border-t border-ink-700 text-[10px]">
                <button onClick={amapShowAll} className="px-2 py-1 rounded border border-ink-600 text-ink-300 hover:border-vermilion-500/40 hover:text-vermilion-300">全开</button>
                <button onClick={amapHideAll} className="px-2 py-1 rounded border border-ink-600 text-ink-300 hover:border-vermilion-500/40 hover:text-vermilion-300">全关</button>
                <button onClick={amapResetDefault} className="px-2 py-1 rounded border border-ink-600 text-ink-300 hover:border-vermilion-500/40 hover:text-vermilion-300 ml-auto">恢复默认</button>
              </div>

              <div className="text-[10px] text-ink-500 mt-2 leading-relaxed">
                💡 底图要素 = 高德地图自带的 POI、道路、水系标注等。「水系标注」关掉后高德的"长江""黄河"文字会消失（叠加层里仍有）。
              </div>
            </>
          )}

          </div>{/* /Tab 内容滚动区 */}

          {/* 2D / 3D 切换 — 任何 tab 都可见（固定底部，不滚动） */}
          <div className="p-3 pt-2 border-t border-ink-700 shrink-0">
            <div className="text-[10px] text-ink-400 mb-1.5">视图模式</div>
            <div className="flex gap-1">
              <button
                onClick={() => viewMode !== '2D' && setViewMode('2D')}
                className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                  viewMode === '2D'
                    ? 'bg-vermilion-500 text-parchment-50 font-serif'
                    : 'bg-ink-900 text-ink-400 hover:bg-ink-700 hover:text-parchment-50'
                }`}
                title="标准平面地图"
              >
                🗺 2D 平面
              </button>
              <button
                onClick={() => viewMode !== '3D' && setViewMode('3D')}
                className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                  viewMode === '3D'
                    ? 'bg-vermilion-500 text-parchment-50 font-serif'
                    : 'bg-ink-900 text-ink-400 hover:bg-ink-700 hover:text-parchment-50'
                }`}
                title="立体透视图（右键拖动调俯仰角）"
              >
                🏔 3D 立体
              </button>
            </div>
            {viewMode === '3D' && (
              <div className="text-[10px] text-ink-500 mt-1.5 leading-relaxed">
                切换会重建地图（保留中心/缩放）。3D 模式右键拖动调俯仰角，左键拖动旋转。
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
