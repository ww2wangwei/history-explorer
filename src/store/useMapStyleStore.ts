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

/** 视图模式：2D 平面 / 3D 立体（高德 3D）/ globe 地球仪（react-globe.gl） */
export type MapViewMode = '2D' | '3D' | 'globe'

interface MapStyleState {
  style: MapStyleKey
  viewMode: MapViewMode
  /** 3D 模式下的俯仰角（0=俯视，83=接近平视） */
  pitch: number
  /** 3D 模式下的旋转角（0=正北，顺时针） */
  rotation: number
  /** 地球仪视角：{ 经度, 纬度, 距离 } — lat/lng 是观察点，altitude 是相机距离（默认 2.5） */
  globePointOfView: { lat: number; lng: number; altitude: number } | null
  setStyle: (k: MapStyleKey) => void
  setViewMode: (m: MapViewMode) => void
  setPitch: (p: number) => void
  setRotation: (r: number) => void
  setGlobePointOfView: (p: { lat: number; lng: number; altitude: number } | null) => void
}

export const useMapStyleStore = create<MapStyleState>()(
  persist(
    (set) => ({
      style: 'dark',
      viewMode: '2D',
      pitch: 30,
      rotation: 0,
      globePointOfView: null,
      setStyle: (k) => set({ style: k }),
      setViewMode: (m) => set({ viewMode: m }),
      setPitch: (p) => set({ pitch: p }),
      setRotation: (r) => set({ rotation: r }),
      setGlobePointOfView: (p) => set({ globePointOfView: p }),
    }),
    {
      name: 'history-explorer-map-style:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ style: s.style, viewMode: s.viewMode, pitch: s.pitch, rotation: s.rotation, globePointOfView: s.globePointOfView }),
      // v2 迁移：darkblue → dark（瓦片重→轻）；normal/light → dark（同样为了减少瓦片）
      migrate: (persisted: any, _fromVersion) => {
        if (persisted && (persisted.style === 'darkblue' || persisted.style === 'normal' || persisted.style === 'light' || persisted.style === 'fresh' || persisted.style === 'macaron' || persisted.style === 'whitesmoke')) {
          persisted.style = 'dark'
        }
        return persisted
      },
      version: 2,
    },
  ),
)
