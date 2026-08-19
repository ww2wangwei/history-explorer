/**
 * useMapStyleStore — 底图样式选择（持久化）
 *
 * - darkblue / dark / normal / light / fresh / macaron / whitesmoke：高德原生
 * - satellite：高德卫星图（需要卫星瓦片 key）
 * - topo-arcgis：World Topographic Map（带等高线 / 山体阴影 / 真实地形）
 * - world-imagery：ArcGIS World Imagery（高分辨率卫星图）
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type MapStyleKey =
  | 'darkblue' | 'dark' | 'normal' | 'light'
  | 'fresh' | 'macaron' | 'whitesmoke'
  | 'satellite' | 'topo-arcgis' | 'world-imagery'

export const STYLE_META: Record<MapStyleKey, {
  label: string
  icon: string
  desc: string
  /** 样式来源：'amap' = 高德原生 styles/*；'tile' = 自定义 TileLayer；'raster' = RasterLayer */
  kind: 'amap' | 'tile' | 'raster'
  /** 自定义瓦片 URL 模板，{x}{y}{z} 替换 */
  tileUrl?: string
  /** 子域名（瓦片服务的多个子域） */
  subdomains?: string[]
  /** 高德样式 ID（只在 kind='amap' 使用） */
  amapStyle?: string
  /** 卫星图叠加（高德卫星瓦片 key） */
  satelliteKey?: string
  /** 控件属性 */
  attribution?: string
}> = {
  darkblue: {
    label: '极夜蓝（暗）',
    icon: '🌙',
    desc: '高德默认暗色，适合数据叠加',
    kind: 'amap', amapStyle: 'amap://styles/darkblue',
  },
  dark: {
    label: '幻影黑',
    icon: '⚫',
    desc: '高德纯黑底色',
    kind: 'amap', amapStyle: 'amap://styles/dark',
  },
  normal: {
    label: '标准（亮）',
    icon: '☀️',
    desc: '高德标准配色，清晰',
    kind: 'amap', amapStyle: 'amap://styles/normal',
  },
  light: {
    label: '月光银',
    icon: '🌕',
    desc: '高德淡色（浅灰）',
    kind: 'amap', amapStyle: 'amap://styles/light',
  },
  fresh: {
    label: '草色长青',
    icon: '🌿',
    desc: '绿色清新',
    kind: 'amap', amapStyle: 'amap://styles/fresh',
  },
  macaron: {
    label: '马卡龙',
    icon: '🎨',
    desc: '高德彩色风格',
    kind: 'amap', amapStyle: 'amap://styles/macaron',
  },
  whitesmoke: {
    label: '远山黛',
    icon: '🌫️',
    desc: '高德白烟灰',
    kind: 'amap', amapStyle: 'amap://styles/whitesmoke',
  },
  satellite: {
    label: '卫星图（高德）',
    icon: '🛰️',
    desc: '高德卫星影像，真实地形',
    kind: 'amap', amapStyle: 'amap://styles/satellite',
  },
  'topo-arcgis': {
    label: '地形图（ArcGIS）',
    icon: '⛰️',
    desc: 'World Topographic Map：等高线 + 山体阴影 + 真实地形',
    kind: 'tile',
    tileUrl: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    attribution: '© OpenTopoMap (CC-BY-SA)',
  },
  'world-imagery': {
    label: '世界卫星（ArcGIS）',
    icon: '🌍',
    desc: 'ArcGIS World Imagery：高分辨率卫星图',
    kind: 'tile',
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: [],
    attribution: '© Esri World Imagery',
  },
}

export const STYLE_KEYS_FOR_UI: MapStyleKey[] = [
  'darkblue', 'dark', 'normal', 'light', 'fresh', 'macaron', 'whitesmoke',
  'satellite', 'topo-arcgis', 'world-imagery',
]

/** 2D/3D 视图模式（3D 模式由 viewMode: '3D' 启用，AMap 需要在地图创建时指定，无法动态切换） */
export type MapViewMode = '2D' | '3D'

interface MapStyleState {
  style: MapStyleKey
  viewMode: MapViewMode
  /** 3D 模式下的俯仰角（0=俯视，83=接近平视） */
  pitch: number
  /** 3D 模式下的旋转角（0=正北，顺时针） */
  rotation: number
  setStyle: (k: MapStyleKey) => void
  setViewMode: (m: MapViewMode) => void
  setPitch: (p: number) => void
  setRotation: (r: number) => void
}

export const useMapStyleStore = create<MapStyleState>()(
  persist(
    (set) => ({
      style: 'darkblue',
      viewMode: '2D',
      pitch: 30,
      rotation: 0,
      setStyle: (k) => set({ style: k }),
      setViewMode: (m) => set({ viewMode: m }),
      setPitch: (p) => set({ pitch: p }),
      setRotation: (r) => set({ rotation: r }),
    }),
    {
      name: 'history-explorer-map-style:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ style: s.style, viewMode: s.viewMode, pitch: s.pitch, rotation: s.rotation }),
    },
  ),
)
