/**
 * useAdminStore — 后台管理 store
 * 把所有"内容数据"的运行时覆盖存到 localStorage
 * 数据源：源文件（geographic-features / people / events / culture-events）
 * 覆盖：用户在 /admin 页面编辑的版本
 *
 * 优先级：admin overrides > 源数据
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminState {
  // 各数据源的 override（只存 id → 字段的局部覆盖）
  geoOverrides: Record<string, Partial<GeoFeatureOverride>>
  peopleOverrides: Record<string, Partial<PersonOverride>>
  eventsOverrides: Record<string, Partial<EventOverride>>
  cultureOverrides: Record<string, Partial<CultureOverride>>

  // 元数据
  lastModified: string | null
  isDirty: boolean

  // 操作
  setGeoOverride: (id: string, patch: Partial<GeoFeatureOverride>) => void
  deleteGeoOverride: (id: string) => void
  setPersonOverride: (id: string, patch: Partial<PersonOverride>) => void
  deletePersonOverride: (id: string) => void
  setEventOverride: (id: string, patch: Partial<EventOverride>) => void
  deleteEventOverride: (id: string) => void
  setCultureOverride: (id: string, patch: Partial<CultureOverride>) => void
  deleteCultureOverride: (id: string) => void

  resetAll: () => void
  exportAll: () => string
  importAll: (json: string) => boolean
}

// 简化的 override 类型（只存可编辑字段）
export type GeoFeatureOverride = {
  name?: string
  type?: string
  labelPos?: [number, number]
  importance?: 1 | 2 | 3
  description?: string
  imageUrl?: string
  imageSearch?: string
  geometry?: [number, number][]
}

export type PersonOverride = {
  name?: string
  role?: string
  category?: string
  description?: string
  personaPrompt?: string
  imageSearch?: string
  birthYear?: number
  deathYear?: number
  relatedFigureIds?: Array<{ id: string; type: string }>
}

export type EventOverride = {
  title?: string
  year?: number
  category?: string
  description?: string
  imageSearch?: string
  coordinates?: [number, number]
}

export type CultureOverride = {
  title?: string
  year?: number
  category?: string
  description?: string
  imageSearch?: string
  location?: [number, number]
  region?: string
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      geoOverrides: {},
      peopleOverrides: {},
      eventsOverrides: {},
      cultureOverrides: {},
      lastModified: null,
      isDirty: false,

      setGeoOverride: (id, patch) => set(s => ({
        geoOverrides: { ...s.geoOverrides, [id]: { ...s.geoOverrides[id], ...patch } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),
      deleteGeoOverride: (id) => set(s => {
        const { [id]: _, ...rest } = s.geoOverrides
        return { geoOverrides: rest, lastModified: new Date().toISOString(), isDirty: true }
      }),

      setPersonOverride: (id, patch) => set(s => ({
        peopleOverrides: { ...s.peopleOverrides, [id]: { ...s.peopleOverrides[id], ...patch } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),
      deletePersonOverride: (id) => set(s => {
        const { [id]: _, ...rest } = s.peopleOverrides
        return { peopleOverrides: rest, lastModified: new Date().toISOString(), isDirty: true }
      }),

      setEventOverride: (id, patch) => set(s => ({
        eventsOverrides: { ...s.eventsOverrides, [id]: { ...s.eventsOverrides[id], ...patch } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),
      deleteEventOverride: (id) => set(s => {
        const { [id]: _, ...rest } = s.eventsOverrides
        return { eventsOverrides: rest, lastModified: new Date().toISOString(), isDirty: true }
      }),

      setCultureOverride: (id, patch) => set(s => ({
        cultureOverrides: { ...s.cultureOverrides, [id]: { ...s.cultureOverrides[id], ...patch } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),
      deleteCultureOverride: (id) => set(s => {
        const { [id]: _, ...rest } = s.cultureOverrides
        return { cultureOverrides: rest, lastModified: new Date().toISOString(), isDirty: true }
      }),

      resetAll: () => set({
        geoOverrides: {},
        peopleOverrides: {},
        eventsOverrides: {},
        cultureOverrides: {},
        lastModified: new Date().toISOString(),
        isDirty: false,
      }),

      exportAll: () => {
        const state = get()
        return JSON.stringify({
          version: 1,
          exportedAt: new Date().toISOString(),
          geoOverrides: state.geoOverrides,
          peopleOverrides: state.peopleOverrides,
          eventsOverrides: state.eventsOverrides,
          cultureOverrides: state.cultureOverrides,
        }, null, 2)
      },

      importAll: (json) => {
        try {
          const data = JSON.parse(json)
          if (typeof data !== 'object' || data === null) return false
          set({
            geoOverrides: data.geoOverrides ?? {},
            peopleOverrides: data.peopleOverrides ?? {},
            eventsOverrides: data.eventsOverrides ?? {},
            cultureOverrides: data.cultureOverrides ?? {},
            lastModified: new Date().toISOString(),
            isDirty: true,
          })
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'history-explorer-admin',
      version: 1,
    }
  )
)
