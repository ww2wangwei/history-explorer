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
  | 'plains' | 'peninsulas' | 'straits'

/** 用于 UI 展示的层级元数据 */
export const LAYER_META: Record<GeoLayerKey, { type: GeoFeatureType; label: string; icon: string; defaultOn: boolean; desc: string }> = {
  rivers:      { type: 'river',       label: '河流',    icon: '🌊', defaultOn: true,  desc: '尼罗河、长江、黄河… 文明常傍河而兴' },
  mountains:   { type: 'mountain',    label: '山脉',    icon: '⛰️',  defaultOn: true,  desc: '喜马拉雅、阿尔卑斯、安第斯… 文明的分界与庇护' },
  seas:        { type: 'sea',         label: '海洋',    icon: '🌀', defaultOn: true,  desc: '地中海、红海、波斯湾…' },
  lakes:       { type: 'lake',        label: '湖泊',    icon: '💧', defaultOn: true,  desc: '贝加尔湖、维多利亚湖…' },
  deserts:     { type: 'desert',      label: '沙漠',    icon: '🏜️',  defaultOn: false, desc: '撒哈拉、塔克拉玛干、阿拉伯…' },
  plains:      { type: 'plain',       label: '平原',    icon: '🌾', defaultOn: false, desc: '恒河、两河、尼罗河、北中国平原…' },
  peninsulas:  { type: 'peninsula',   label: '半岛',    icon: '📍', defaultOn: true,  desc: '阿拉伯、印度、中南、伊比利亚…' },
  straits:     { type: 'strait',      label: '海峡',    icon: '↔️',  defaultOn: true,  desc: '直布罗陀、霍尔木兹、白令…' },
}

const ALL_KEYS = Object.keys(LAYER_META) as GeoLayerKey[]

/** AMap.Map.setFeatures() 支持的 feature 类别（高德官方只支持这 6 个） */
export type AmapFeatureKey =
  | 'bg' | 'point' | 'road' | 'building'
  | 'water' | 'mask'

export const AMAP_FEATURE_META: Record<AmapFeatureKey, { label: string; icon: string; defaultOn: boolean; desc: string }> = {
  bg:       { label: '底图背景',    icon: '🎨', defaultOn: true,  desc: '高德底图的底层瓦片（关掉全黑）' },
  point:    { label: 'POI 点',       icon: '📍', defaultOn: false, desc: '景点/餐厅等兴趣点（极多，默认关减轻负载）' },
  road:     { label: '道路',        icon: '🛣️',  defaultOn: false, desc: '道路网络（瓦片重，默认关减轻负载）' },
  building: { label: '建筑',        icon: '🏢', defaultOn: false, desc: '3D 建筑（瓦片重，默认关减轻负载）' },
  water:    { label: '水域面',       icon: '🌊', defaultOn: true,  desc: '海域/河面/湖面（关掉只剩陆地）' },
  mask:     { label: '区域遮罩',     icon: '🎭', defaultOn: false, desc: '国境/省界遮罩（关掉跨国连成一片）' },
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
  /** 地球仪：OSM POI 点（historic/tourism/heritage/place）可见性 */
  showOsmPois: boolean
  /** 地球仪：昼夜光照 */
  showDayNight: boolean

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
  /** 切换 OSM POI 显示（地球仪模式） */
  toggleOsmPois: () => void
  /** 切换昼夜光照 */
  toggleDayNight: () => void
}

function defaultVisible(): Record<GeoLayerKey, boolean> {
  const out = {} as Record<GeoLayerKey, boolean>
  for (const k of ALL_KEYS) out[k] = LAYER_META[k].defaultOn
  return out
}

function defaultAmapFeatures(): AmapFeatureKey[] {
  // 默认关闭 POI/道路/建筑 — 这些图层瓦片极重，拖动会卡
  // 水系/陆地/标注/遮罩/绿地保留
  return ALL_AMAP_KEYS.filter(k => AMAP_FEATURE_META[k].defaultOn)
}

export const useMapLayersStore = create<MapLayersState>()(
  persist(
    (set) => ({
      visible: defaultVisible(),
      showLabels: true,
      amapFeatures: defaultAmapFeatures(),
      showGraticule: false,
      showCloud: false,
      showOsmPois: true,
      showDayNight: false,

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
      toggleOsmPois: () => set(s => ({ showOsmPois: !s.showOsmPois })),
      toggleDayNight: () => set(s => ({ showDayNight: !s.showDayNight })),
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
        showOsmPois: s.showOsmPois,
        showDayNight: s.showDayNight,
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
        // v8: OSM 开关字段（旧用户没有 → 默认 true）
        if (persisted && persisted.showOsmPois === undefined) {
          persisted.showOsmPois = true
        }
        // v10: showDayNight 字段（旧用户没有 → 默认 false）
        if (persisted && persisted.showDayNight === undefined) {
          persisted.showDayNight = false
        }
        // v5: 老用户的 amapFeatures 可能含 POI/道路/建筑（极重，拖动卡），迁移时过滤掉
        if (persisted && Array.isArray(persisted.amapFeatures)) {
          persisted.amapFeatures = persisted.amapFeatures.filter(
            (k: string) => {
              const meta = (AMAP_FEATURE_META as any)[k]
              return meta && meta.defaultOn
            }
          )
        }
        // v7: 取消"大洲名/海洋/河流/山脉"默认开启，恢复全 false
        // 老用户的 visible 在 v6 时被重置为新默认（部分 true），这里再清空
        if (persisted && persisted.visible) {
          persisted.visible = defaultVisible()
        }
        // v14: 删除了 continents/waterfalls/regions 三种类型；
        //   同时把 rivers/mountains/seas/lakes/peninsulas/straits 的 defaultOn 改为 true
        //   已存在的用户若 visible 含已删字段 → 清理；缺新默认 → 用新 defaultOn 补全
        if (persisted && persisted.visible && typeof persisted.visible === 'object') {
          const merged: Record<string, boolean> = {}
          for (const k of ALL_KEYS) {
            if (typeof persisted.visible[k] === 'boolean') {
              merged[k] = persisted.visible[k]
            } else {
              merged[k] = LAYER_META[k].defaultOn
            }
          }
          persisted.visible = merged
        }
        return persisted
      },
      version: 14,
    },
  ),
)