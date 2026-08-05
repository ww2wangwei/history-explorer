/**
 * useMapLayersStore — 地图 AMap 自带 feature 类别显隐持久化
 *
 *  - 通过 AMap.Map.setFeatures() 控制底图要素（POI/道路/水系标注/绿地…）
 *  - 选择持久化到 localStorage（key: history-explorer-map-layers:v1）
 *
 * 注意：原 GeoFeatureLayer 自定义叠加层（我们额外画的 polyline/polygon）已移除，
 * 因为高德底图自带相同要素，手动叠加是冗余的。
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/** AMap.Map.setFeatures() 支持的 feature 类别（高德官方） */
export type AmapFeatureKey =
  | 'bg' | 'point' | 'road' | 'building'
  | 'water' | 'waterlabel' | 'land'
  | 'label' | 'mask' | 'grass'

export const AMAP_FEATURE_META: Record<AmapFeatureKey, { label: string; icon: string; desc: string }> = {
  bg:         { label: '底图背景',    icon: '🎨', desc: '关掉则底图全黑（一般保留）' },
  point:      { label: 'POI 点',       icon: '📍', desc: '城市/景点/公司等小圆点' },
  road:       { label: '道路',        icon: '🛣️',  desc: '街道、高速、国道线' },
  building:   { label: '建筑',        icon: '🏢', desc: '城市建筑色块' },
  water:      { label: '水域面',       icon: '🌊', desc: '河海蓝色面' },
  waterlabel: { label: '水系标注',     icon: '🏷️',  desc: '"长江""黄河"等文字' },
  land:       { label: '陆地',        icon: '🗻', desc: '陆地色块' },
  label:      { label: '地名标注',     icon: '🔤', desc: '城市/省/国家名' },
  mask:       { label: '区域遮罩',     icon: '🎭', desc: '省界/区域色带' },
  grass:      { label: '绿地/林地',    icon: '🌳', desc: '公园、森林绿色面' },
}

const ALL_AMAP_KEYS = Object.keys(AMAP_FEATURE_META) as AmapFeatureKey[]
export const AMAP_FEATURE_KEYS_FOR_UI: AmapFeatureKey[] = ALL_AMAP_KEYS

interface MapLayersState {
  /** AMap 自带 feature 类别（勾选表示显示） */
  amapFeatures: AmapFeatureKey[]
  /** 切换单个 AMap feature */
  toggleAmap: (key: AmapFeatureKey) => void
  /** AMap features 全开 / 全关 */
  amapShowAll: () => void
  amapHideAll: () => void
  /** AMap features 重置为默认（全开） */
  amapResetDefault: () => void
}

function defaultAmapFeatures(): AmapFeatureKey[] {
  return [...ALL_AMAP_KEYS]
}

export const useMapLayersStore = create<MapLayersState>()(
  persist(
    (set) => ({
      amapFeatures: defaultAmapFeatures(),

      toggleAmap: (key) => set(s => ({
        amapFeatures: s.amapFeatures.includes(key)
          ? s.amapFeatures.filter(k => k !== key)
          : [...s.amapFeatures, key],
      })),
      amapShowAll: () => set({ amapFeatures: [...ALL_AMAP_KEYS] }),
      amapHideAll: () => set({ amapFeatures: [] }),
      amapResetDefault: () => set({ amapFeatures: defaultAmapFeatures() }),
    }),
    {
      name: 'history-explorer-map-layers:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ amapFeatures: s.amapFeatures }),
      // 老用户没有 amapFeatures 字段 → 给默认（版本 1 升级到 2）
      migrate: (persisted: any, _fromVersion) => {
        if (persisted && !persisted.amapFeatures) {
          persisted.amapFeatures = defaultAmapFeatures()
        }
        return persisted
      },
      version: 2,
    },
  ),
)