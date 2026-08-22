/**
 * useMapLayersStore — 地图图层的可见性持久化
 *
 *  - visible: 我们自己叠加的「山脉/河流/海洋」等 GeoFeature
 *  - amapFeatures: 高德底图自带的要素类别（POI/水系标注等），
 *                  通过 AMap.Map.setFeatures(['bg','point','road','water',...]) 控制
 *  - 选择持久化到 localStorage（key: history-explorer-map-layers:v1）
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { GeoFeatureType } from '@/data/geographic-features'

export type GeoLayerKey =
  | 'rivers' | 'mountains' | 'seas' | 'lakes' | 'deserts'
  | 'plains' | 'peninsulas' | 'straits' | 'waterfalls' | 'regions'
  | 'continents'

/** 用于 UI 展示的层级元数据 */
export const LAYER_META: Record<GeoLayerKey, { type: GeoFeatureType; label: string; icon: string; defaultOn: boolean; desc: string }> = {
  rivers:      { type: 'river',       label: '河流',    icon: '🌊', defaultOn: false, desc: '尼罗河、长江、黄河… 文明常傍河而兴' },
  mountains:   { type: 'mountain',    label: '山脉',    icon: '⛰️',  defaultOn: false, desc: '喜马拉雅、阿尔卑斯、安第斯… 文明的分界与庇护' },
  seas:        { type: 'sea',         label: '海洋',    icon: '🌀', defaultOn: false, desc: '地中海、红海、波斯湾…' },
  lakes:       { type: 'lake',        label: '湖泊',    icon: '💧', defaultOn: false, desc: '贝加尔湖、维多利亚湖…' },
  deserts:     { type: 'desert',      label: '沙漠',    icon: '🏜️',  defaultOn: false, desc: '撒哈拉、塔克拉玛干、阿拉伯…' },
  plains:      { type: 'plain',       label: '平原',    icon: '🌾', defaultOn: false, desc: '恒河、两河、尼罗河、北中国平原…' },
  peninsulas:  { type: 'peninsula',   label: '半岛',    icon: '📍', defaultOn: false, desc: '阿拉伯、印度、中南、伊比利亚…' },
  straits:     { type: 'strait',      label: '海峡',    icon: '↔️',  defaultOn: false, desc: '直布罗陀、霍尔木兹、白令…' },
  waterfalls:  { type: 'waterfall',   label: '瀑布',    icon: '🪨',  defaultOn: false, desc: '' },
  regions:     { type: 'region',      label: '区域',    icon: '🗺', defaultOn: false, desc: '' },
  continents:  { type: 'continent',   label: '大洲名',  icon: '🌐', defaultOn: false, desc: '亚洲、欧洲… 仅显示名称标签' },
}

const ALL_KEYS = Object.keys(LAYER_META) as GeoLayerKey[]

/** AMap.Map.setFeatures() 支持的 feature 类别（高德官方） */
export type AmapFeatureKey =
  | 'bg' | 'point' | 'road' | 'building'
  | 'water' | 'waterlabel' | 'land'
  | 'label' | 'mask' | 'grass'

export const AMAP_FEATURE_META: Record<AmapFeatureKey, { label: string; icon: string; defaultOn: boolean }> = {
  bg:         { label: '底图背景',    icon: '🎨', defaultOn: true },
  point:      { label: 'POI 点',       icon: '📍', defaultOn: false },  // POI 极多，默认关减少 tile 渲染
  road:       { label: '道路',        icon: '🛣️',  defaultOn: false },  // 道路瓦片重，默认关
  building:   { label: '建筑',        icon: '🏢', defaultOn: false },  // 3D 建筑瓦片重，默认关
  water:      { label: '水域面',       icon: '🌊', defaultOn: true },
  waterlabel: { label: '水系标注',     icon: '🏷️',  defaultOn: true },
  land:       { label: '陆地',        icon: '🗻', defaultOn: true },
  label:      { label: '地名标注',     icon: '🔤', defaultOn: true },
  mask:       { label: '区域遮罩',     icon: '🎭', defaultOn: true },
  grass:      { label: '绿地/林地',    icon: '🌳', defaultOn: true },
}

const ALL_AMAP_KEYS = Object.keys(AMAP_FEATURE_META) as AmapFeatureKey[]
export const AMAP_FEATURE_KEYS_FOR_UI: AmapFeatureKey[] = ALL_AMAP_KEYS

interface MapLayersState {
  /** layerKey -> 是否可见（自定义叠加层） */
  visible: Record<GeoLayerKey, boolean>
  /** 自定义叠加层是否显示名称标签 */
  showLabels: boolean
  /** AMap 自带 feature 类别 */
  amapFeatures: AmapFeatureKey[]
  /** 经纬网可见性 */
  showGraticule: boolean
  /** 实时云图可见性 */
  showCloud: boolean

  /** 切换单个自定义图层 */
  toggle: (key: GeoLayerKey) => void
  /** 切换标签显示 */
  toggleLabels: () => void
  /** 自定义图层全开 / 全关 */
  showAll: () => void
  hideAll: () => void
  /** 重置自定义图层到默认 */
  resetDefault: () => void

  /** 切换 AMap 自带 feature 类别 */
  toggleAmap: (key: AmapFeatureKey) => void
  /** AMap features 全开 / 全关 */
  amapShowAll: () => void
  amapHideAll: () => void
  /** AMap features 重置为默认（全开） */
  amapResetDefault: () => void

  /** 切换经纬网 */
  toggleGraticule: () => void
  /** 切换实时云图 */
  toggleCloud: () => void
}

function defaultVisible(): Record<GeoLayerKey, boolean> {
  const out = {} as Record<GeoLayerKey, boolean>
  for (const k of ALL_KEYS) out[k] = LAYER_META[k].defaultOn
  return out
}

function defaultAmapFeatures(): AmapFeatureKey[] {
  return [...ALL_AMAP_KEYS]
}

export const useMapLayersStore = create<MapLayersState>()(
  persist(
    (set) => ({
      visible: defaultVisible(),
      showLabels: true,
      amapFeatures: defaultAmapFeatures(),
      showGraticule: false,
      showCloud: false,

      toggle: (key) => set(s => ({ visible: { ...s.visible, [key]: !s.visible[key] } })),
      toggleLabels: () => set(s => ({ showLabels: !s.showLabels })),
      showAll: () => set({ visible: ALL_KEYS.reduce((o, k) => { o[k] = true; return o }, {} as Record<GeoLayerKey, boolean>) }),
      hideAll: () => set({ visible: ALL_KEYS.reduce((o, k) => { o[k] = false; return o }, {} as Record<GeoLayerKey, boolean>) }),
      resetDefault: () => set({ visible: defaultVisible(), showLabels: true }),

      toggleAmap: (key) => set(s => ({
        amapFeatures: s.amapFeatures.includes(key)
          ? s.amapFeatures.filter(k => k !== key)
          : [...s.amapFeatures, key],
      })),
      amapShowAll: () => set({ amapFeatures: [...ALL_AMAP_KEYS] }),
      amapHideAll: () => set({ amapFeatures: [] }),
      amapResetDefault: () => set({ amapFeatures: defaultAmapFeatures() }),

      toggleGraticule: () => set(s => ({ showGraticule: !s.showGraticule })),
      toggleCloud: () => set(s => ({ showCloud: !s.showCloud })),
    }),
    {
      name: 'history-explorer-map-layers:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        visible: s.visible,
        showLabels: s.showLabels,
        amapFeatures: s.amapFeatures,
        showGraticule: s.showGraticule,
        showCloud: s.showCloud,
      }),
      // 老用户没有 amapFeatures 字段 → 给默认；老用户没有 showGraticule → 给 false
      migrate: (persisted: any, _fromVersion) => {
        if (persisted && !persisted.amapFeatures) {
          persisted.amapFeatures = defaultAmapFeatures()
        }
        if (persisted && persisted.showGraticule === undefined) {
          persisted.showGraticule = false
        }
        if (persisted && persisted.showCloud === undefined) {
          persisted.showCloud = false
        }
        return persisted
      },
      version: 4,
    },
  ),
)