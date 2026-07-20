/**
 * adminData — 把 admin overrides 应用到源数据上
 * 数据流：源数据 (JSON/TS) + admin overrides (localStorage) → 运行时数据
 */
import { ALL_GEO_FEATURES, type GeoFeature, type GeoFeatureType } from '@/data/geographic-features'
import peopleData from '@/data/people.json'
import eventsData from '@/data/events.json'
import cultureData from '@/data/culture-events.json'
import { useAdminStore } from '@/store/useAdminStore'
import { bingImage } from '@/utils/geoImage'
import type { HistoricalFigure, HistoricalEvent } from '@/types'

// ============= 地理 =============
export const ALL_GEO_FEATURES_FLAT: GeoFeature[] = [
  ...ALL_GEO_FEATURES.continents,
  ...ALL_GEO_FEATURES.seas,
  ...ALL_GEO_FEATURES.lakes,
  ...ALL_GEO_FEATURES.rivers,
  ...ALL_GEO_FEATURES.mountains,
  ...ALL_GEO_FEATURES.deserts,
  ...ALL_GEO_FEATURES.plains,
  ...ALL_GEO_FEATURES.peninsulas,
  ...ALL_GEO_FEATURES.straits,
  ...ALL_GEO_FEATURES.waterfalls,
  ...ALL_GEO_FEATURES.regions,
]

export function getMergedGeoFeatures(): GeoFeature[] {
  const overrides = useAdminStore.getState().geoOverrides
  return ALL_GEO_FEATURES_FLAT.map(f => {
    const ov = overrides[f.id]
    if (!ov) return f
    return { ...f, ...ov, geometry: ov.geometry ?? f.geometry, labelPos: ov.labelPos ?? f.labelPos } as GeoFeature
  })
}

export function getMergedGeoFeature(id: string): GeoFeature | null {
  return getMergedGeoFeatures().find(f => f.id === id) ?? null
}

export function getEffectiveGeoImage(f: GeoFeature): string {
  const ov = useAdminStore.getState().geoOverrides[f.id]
  if (ov?.imageUrl) return ov.imageUrl
  if (ov?.imageSearch) return bingImage(ov.imageSearch, 800, 450)
  return f.imageUrl ?? ''
}

// ============= 人物 =============
export function getMergedPeople(): HistoricalFigure[] {
  const overrides = useAdminStore.getState().peopleOverrides
  const base = peopleData as HistoricalFigure[]
  return base.map(p => {
    const ov = overrides[p.id]
    if (!ov) return p
    return {
      ...p,
      ...ov,
      relatedFigureIds: ov.relatedFigureIds ?? p.relatedFigureIds,
      culturalWorks: p.culturalWorks,
    } as HistoricalFigure
  })
}

export function getMergedPerson(id: string): HistoricalFigure | null {
  return getMergedPeople().find(p => p.id === id) ?? null
}

export function getEffectivePersonImage(p: HistoricalFigure): string | null {
  const ov = useAdminStore.getState().peopleOverrides[p.id]
  if (ov?.imageSearch) return bingImage(ov.imageSearch, 600, 400)
  return null
}

// ============= 战争 =============
export function getMergedEvents(): HistoricalEvent[] {
  const overrides = useAdminStore.getState().eventsOverrides
  const base = eventsData as HistoricalEvent[]
  return base.map(e => {
    const ov = overrides[e.id]
    if (!ov) return e
    return { ...e, ...ov, coordinates: ov.coordinates ?? e.coordinates } as HistoricalEvent
  })
}

// ============= 文化 =============
export interface CultureEvent {
  id: string
  title: string
  year: number
  category: string
  location: [number, number]
  region: string
  importance: 1 | 2 | 3
  description: string
}

export function getMergedCultures(): CultureEvent[] {
  const overrides = useAdminStore.getState().cultureOverrides
  const base = cultureData as CultureEvent[]
  return base.map(c => {
    const ov = overrides[c.id]
    if (!ov) return c
    return { ...c, ...ov, location: ov.location ?? c.location } as CultureEvent
  })
}

export const GEO_TYPE_OPTIONS: GeoFeatureType[] = [
  'continent', 'sea', 'lake', 'river', 'mountain', 'desert', 'plain', 'peninsula', 'strait', 'waterfall', 'region',
]

export const GEO_TYPE_LABELS: Record<GeoFeatureType, string> = {
  continent: '🌏 大洲',
  sea: '🌊 海洋/海湾',
  lake: '🪞 湖泊',
  river: '🏞️ 河流',
  mountain: '⛰️ 山脉',
  desert: '🏜️ 沙漠',
  plain: '🌾 平原',
  peninsula: '🔻 半岛',
  strait: '↔️ 海峡',
  waterfall: '💦 瀑布',
  region: '🗺️ 区域',
}
