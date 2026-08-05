/**
 * useMapLayersStore — 地图图层（自然地理要素）的可见性持久化
 *
 *  - 每类要素独立开关
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
  rivers:      { type: 'river',       label: '河流',    icon: '🌊', defaultOn: true,  desc: '尼罗河、长江、黄河… 文明常傍河而兴' },
  mountains:   { type: 'mountain',    label: '山脉',    icon: '⛰️',  defaultOn: true,  desc: '喜马拉雅、阿尔卑斯、安第斯… 文明的分界与庇护' },
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

interface MapLayersState {
  /** layerKey -> 是否可见 */
  visible: Record<GeoLayerKey, boolean>
  /** 是否同时显示要素名称标签 */
  showLabels: boolean
  /** 切换单个图层 */
  toggle: (key: GeoLayerKey) => void
  /** 是否显示标签 */
  toggleLabels: () => void
  /** 全部显示/隐藏 */
  showAll: () => void
  hideAll: () => void
  /** 重置为默认 */
  resetDefault: () => void
}

function defaultVisible(): Record<GeoLayerKey, boolean> {
  const out = {} as Record<GeoLayerKey, boolean>
  for (const k of ALL_KEYS) out[k] = LAYER_META[k].defaultOn
  return out
}

export const useMapLayersStore = create<MapLayersState>()(
  persist(
    (set) => ({
      visible: defaultVisible(),
      showLabels: true,
      toggle: (key) => set(s => ({ visible: { ...s.visible, [key]: !s.visible[key] } })),
      toggleLabels: () => set(s => ({ showLabels: !s.showLabels })),
      showAll: () => set({ visible: ALL_KEYS.reduce((o, k) => { o[k] = true; return o }, {} as Record<GeoLayerKey, boolean>) }),
      hideAll: () => set({ visible: ALL_KEYS.reduce((o, k) => { o[k] = false; return o }, {} as Record<GeoLayerKey, boolean>) }),
      resetDefault: () => set({ visible: defaultVisible(), showLabels: true }),
    }),
    {
      name: 'history-explorer-map-layers:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ visible: s.visible, showLabels: s.showLabels }),
    },
  ),
)