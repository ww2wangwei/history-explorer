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
  // 1) 源数据合并 overrides，过滤掉 __deleted
  const merged: GeoFeature[] = ALL_GEO_FEATURES_FLAT
    .map(f => {
      const ov = overrides[f.id]
      if (!ov) return f
      if (ov.__deleted) return null
      return { ...f, ...ov, geometry: ov.geometry ?? f.geometry, labelPos: ov.labelPos ?? f.labelPos } as GeoFeature
    })
    .filter((f): f is GeoFeature => f !== null)
  // 2) 追加 __new 的纯新增条目
  for (const [id, ov] of Object.entries(overrides)) {
    if (ov.__new && !ov.__deleted) {
      merged.push({
        id,
        type: (ov.type ?? 'region') as GeoFeatureType,
        name: ov.name ?? id,
        labelPos: ov.labelPos ?? [0, 0],
        importance: (ov.importance ?? 1) as 1 | 2 | 3,
        description: ov.description,
        imageUrl: ov.imageUrl,
        geometry: ov.geometry ?? [[0, 0]],
      })
    }
  }
  return merged
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
  const merged: HistoricalFigure[] = base
    .map(p => {
      const ov = overrides[p.id]
      if (!ov) return p
      if (ov.__deleted) return null
      return {
        ...p,
        ...ov,
        relatedFigureIds: ov.relatedFigureIds ?? p.relatedFigureIds,
        culturalWorks: p.culturalWorks,
        eraIds: ov.eraIds ?? p.eraIds,
      } as HistoricalFigure
    })
    .filter((p): p is HistoricalFigure => p !== null)
  // __new
  for (const [id, ov] of Object.entries(overrides)) {
    if (ov.__new && !ov.__deleted) {
      merged.push({
        id,
        name: ov.name ?? id,
        role: ov.role ?? '',
        category: (ov.category ?? 'politician') as any,
        description: ov.description ?? '',
        personaPrompt: ov.personaPrompt ?? '',
        imageSearch: ov.imageSearch,
        birthYear: ov.birthYear,
        deathYear: ov.deathYear,
        eraIds: ov.eraIds ?? [],
        relatedFigureIds: ov.relatedFigureIds ?? [],
        culturalWorks: [],
        emoji: ov.emoji,
      } as unknown as HistoricalFigure)
    }
  }
  return merged
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
  const merged: HistoricalEvent[] = base
    .map(e => {
      const ov = overrides[e.id]
      if (!ov) return e
      if (ov.__deleted) return null
      return { ...e, ...ov, coordinates: ov.coordinates ?? e.coordinates } as HistoricalEvent
    })
    .filter((e): e is HistoricalEvent => e !== null)
  for (const [id, ov] of Object.entries(overrides)) {
    if (ov.__new && !ov.__deleted) {
      merged.push({
        id,
        title: ov.title ?? id,
        year: ov.year ?? 0,
        category: (ov.category ?? '军事') as any,
        description: ov.description ?? '',
        region: (ov.region ?? 'world') as any,
        coordinates: ov.coordinates ?? [0, 0],
        importance: ov.importance ?? 1,
      } as unknown as HistoricalEvent)
    }
  }
  return merged
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
  const merged: CultureEvent[] = base
    .map(c => {
      const ov = overrides[c.id]
      if (!ov) return c
      if (ov.__deleted) return null
      return { ...c, ...ov, location: ov.location ?? c.location } as CultureEvent
    })
    .filter((c): c is CultureEvent => c !== null)
  for (const [id, ov] of Object.entries(overrides)) {
    if (ov.__new && !ov.__deleted) {
      merged.push({
        id,
        title: ov.title ?? id,
        year: ov.year ?? 0,
        category: ov.category ?? '文化',
        location: ov.location ?? [0, 0],
        region: ov.region ?? '',
        importance: (ov.importance ?? 1) as 1 | 2 | 3,
        description: ov.description ?? '',
      })
    }
  }
  return merged
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
