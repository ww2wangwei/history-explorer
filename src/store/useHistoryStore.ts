import { create } from 'zustand'
import { TIME_RANGE, type EventCategory } from '@/types'

// 筛选状态
export interface EventFilters {
  categories: EventCategory[]  // 空数组 = 不过滤，显示全部
  regions: string[]            // 空数组 = 不过滤
  minImportance: 1 | 2 | 3     // 1 = 全部，2 = 中等及以上，3 = 仅最重要
}

interface HistoryStore {
  // 当前选中年份（公元年，公元前用负数）
  currentYear: number
  // 选中的事件 ID
  selectedEventId: string | null
  // 选中的朝代/文明 ID
  selectedEraId: string | null
  // 是否正在自动播放
  isPlaying: boolean
  // 自动播放速度（每年/秒）
  playSpeed: number

  // 时间轴视口中心年份（缩放/平移时变化）
  timelineCenterYear: number
  // 时间轴缩放级别（1=完整 5000 年，8=约 600 年，0.5=约 10000 年）
  timelineZoom: number

  // 事件筛选
  filters: EventFilters

  // 地图视图（中心 lng/lat + 缩放级别）— 在 store，让 Dashboard / CrossRef /
  // Detail Panel / URL 调试 / 重置按钮都能直接读写
  mapCenter: [number, number]
  mapZoom: number

  // 地图聚焦目标（详情面板点击"聚焦地图"时设置）
  mapFocusTarget: { center: [number, number]; zoom: number; label?: string; coverImageUrl?: string; snippet?: string } | null

  // 朝代透明度（key=eraId, value=0~1）
  eraOpacities: Record<string, number>

  // 视图模式：地图 vs 关系图谱
  viewMode: 'map' | 'graph'

  // 详情面板当前 tab：事件 / 朝代 / 笔记
  detailView: 'event' | 'era' | 'notes'

  // Actions
  setYear: (year: number) => void
  selectEvent: (id: string | null) => void
  selectEra: (id: string | null) => void
  // 朝代选择历史栈（用于回退误选）
  eraSelectionHistory: string[]
  undoEraSelect: () => void
  togglePlay: () => void
  setPlaySpeed: (speed: number) => void
  // 时间轴视口操作
  setTimelineView: (centerYear: number, zoom: number) => void
  // 地图视图操作
  setMapPosition: (pos: { center: [number, number]; zoom: number }) => void
  setMapZoom: (zoom: number) => void
  // 筛选操作
  toggleCategory: (cat: EventCategory) => void
  toggleRegion: (region: string) => void
  setMinImportance: (level: 1 | 2 | 3) => void
  resetFilters: () => void
  // 地图聚焦操作
  setMapFocus: (target: { center: [number, number]; zoom: number; label?: string; coverImageUrl?: string; snippet?: string } | null) => void
  // 朝代透明度操作
  setEraOpacity: (eraId: string, opacity: number) => void
  resetEraOpacities: () => void
  // 视图模式切换
  setViewMode: (mode: 'map' | 'graph') => void
  // 详情 tab 切换
  setDetailView: (v: 'event' | 'era' | 'notes') => void
  // 🎯 跨组件回弹窗通道：地图浮层「🔙 回到事件」按钮触发
  pendingReopen:
    | {
        kind: 'quickEvent'
        eraId: string
        event: { year: number; title: string; desc: string; longDesc?: string }
      }
    | { kind: 'event'; eventId: string }
    | { kind: 'cultureEvent'; cultureEventId: string }
    | { kind: 'geoFeature'; featureId: string }
    | { kind: 'territory'; territoryId: string; region: 'china' | 'world' }
    | { kind: 'war'; warId: string }
    | { kind: 'majorWar'; mwKey: string }
    | { kind: 'majorWarNode'; mwKey: string; nodeIndex: number }
    | null
  setPendingReopen: (target: HistoryStore['pendingReopen']) => void
}

export const MIN_ZOOM = 0.5
export const MAX_ZOOM = 8

function clampZoom(z: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z))
}

// 计算单个屏幕可见的年份数（基于 zoom 级别）
export function visibleYearSpan(zoom: number): number {
  return (TIME_RANGE.MAX_YEAR - TIME_RANGE.MIN_YEAR) / zoom
}

function clampCenter(center: number, zoom: number): number {
  const halfSpan = visibleYearSpan(zoom) / 2
  const min = TIME_RANGE.MIN_YEAR + halfSpan
  const max = TIME_RANGE.MAX_YEAR - halfSpan
  if (zoom <= 1) return center
  return Math.max(min, Math.min(max, center))
}

// 从 URL 参数读取初始年份和缩放（用于测试和分享）
function getInitialParams(): {
  year: number; zoom: number; viewMode: 'map' | 'graph'; selectedEraId: string | null;
  center: [number, number];
} {
  const defaults = {
    year: TIME_RANGE.DEFAULT_YEAR,
    zoom: 1,
    viewMode: 'map' as 'map' | 'graph',
    selectedEraId: null as string | null,
    center: [0, 20] as [number, number],
  }
  try {
    if (typeof window === 'undefined' || !window.location) return defaults
    const params = new URLSearchParams(window.location.search)
    const yearParam = params.get('year')
    const zoomParam = params.get('zoom')
    const viewParam = params.get('view')
    const eraParam = params.get('era')
    const result: { year: number; zoom: number; viewMode: 'map' | 'graph'; selectedEraId: string | null; center: [number, number] } = { ...defaults }
    if (yearParam) {
      const y = parseInt(yearParam, 10)
      if (!isNaN(y)) {
        result.year = Math.max(TIME_RANGE.MIN_YEAR, Math.min(TIME_RANGE.MAX_YEAR, y))
      }
    }
    if (zoomParam) {
      const z = parseFloat(zoomParam)
      if (!isNaN(z)) {
        result.zoom = clampZoom(z)
      }
    }
    if (viewParam === 'graph' || viewParam === 'map') {
      result.viewMode = viewParam
    }
    if (eraParam) {
      result.selectedEraId = eraParam
    }
    // ?focus=lng,lat,zoom 调试用：同时设 mapCenter/mapZoom
    const focusParam = params.get('focus')
    if (focusParam) {
      const [lng, lat, zoom] = focusParam.split(',')
      const z = parseFloat(zoom)
      result.center = [parseFloat(lng) || 0, parseFloat(lat) || 0]
      if (!isNaN(z)) result.zoom = z
    }
    return result
  } catch {
    return defaults
  }
}

const _initialParams = getInitialParams()

export const useHistoryStore = create<HistoryStore>((set) => ({
  currentYear: _initialParams.year,
  selectedEventId: null,
  selectedEraId: _initialParams.selectedEraId,
  isPlaying: false,
  playSpeed: 5,
  timelineCenterYear: _initialParams.year,
  timelineZoom: _initialParams.zoom,

  filters: {
    categories: [],
    regions: ['china'],  // 默认只显示中国事件（世界事件详情看 EraDetail）
    minImportance: 2,    // 默认中等及以上（避免地图上事件点过密）
  },

  mapFocusTarget: null,
  pendingReopen: null,

  mapCenter: _initialParams.center,
  mapZoom: _initialParams.zoom,

  eraOpacities: {},
  eraSelectionHistory: [],

  viewMode: _initialParams.viewMode,
  detailView: 'event',

  setYear: (year) => set(() => {
    const clamped = Math.max(TIME_RANGE.MIN_YEAR, Math.min(TIME_RANGE.MAX_YEAR, year))
    return { currentYear: clamped }
  }),

  selectEvent: (id) => set({ selectedEventId: id }),
  selectEra: (id) =>
    set((s) => {
      // 第一次选时记录上一个选中；同一个 id 不入栈；撤销时只切回不写栈
      const prev = s.selectedEraId
      if (prev === id || id == null) return { selectedEraId: id }
      const stack = s.eraSelectionHistory.slice(-19)  // 上限 20 条
      return {
        selectedEraId: id,
        eraSelectionHistory: [...stack, prev].filter((x): x is string => !!x),
      }
    }),
  undoEraSelect: () =>
    set((s) => {
      const stack = s.eraSelectionHistory
      if (stack.length === 0) return {}
      const last = stack[stack.length - 1]
      return {
        selectedEraId: last,
        eraSelectionHistory: stack.slice(0, -1),
      }
    }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaySpeed: (speed) => set({ playSpeed: speed }),

  setTimelineView: (centerYear, zoom) => set(() => {
    const z = clampZoom(zoom)
    const c = clampCenter(centerYear, z)
    return { timelineCenterYear: c, timelineZoom: z }
  }),

  toggleCategory: (cat) => set((s) => {
    const exists = s.filters.categories.includes(cat)
    return {
      filters: {
        ...s.filters,
        categories: exists
          ? s.filters.categories.filter(c => c !== cat)
          : [...s.filters.categories, cat],
      },
    }
  }),

  toggleRegion: (region) => set((s) => {
    const exists = s.filters.regions.includes(region)
    return {
      filters: {
        ...s.filters,
        regions: exists
          ? s.filters.regions.filter(r => r !== region)
          : [...s.filters.regions, region],
      },
    }
  }),

  setMinImportance: (level) => set((s) => ({
    filters: { ...s.filters, minImportance: level },
  })),

  resetFilters: () => set({
    filters: { categories: [], regions: [], minImportance: 1 },
  }),

  setMapFocus: (target) => set({ mapFocusTarget: target }),

  setEraOpacity: (eraId, opacity) => set((s) => ({
    eraOpacities: { ...s.eraOpacities, [eraId]: Math.max(0, Math.min(1, opacity)) },
  })),

  resetEraOpacities: () => set({ eraOpacities: {} }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setDetailView: (v) => set({ detailView: v }),

  setPendingReopen: (target) => set({ pendingReopen: target }),

  setMapPosition: (pos) => set({ mapCenter: pos.center, mapZoom: pos.zoom }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
}))

