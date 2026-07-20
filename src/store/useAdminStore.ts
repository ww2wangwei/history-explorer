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
  markGeoDeleted: (id: string) => void
  undeleteGeo: (id: string) => void
  createGeo: (data: GeoFeatureOverride) => void

  setPersonOverride: (id: string, patch: Partial<PersonOverride>) => void
  deletePersonOverride: (id: string) => void
  markPersonDeleted: (id: string) => void
  undeletePerson: (id: string) => void
  createPerson: (data: PersonOverride) => void

  setEventOverride: (id: string, patch: Partial<EventOverride>) => void
  deleteEventOverride: (id: string) => void
  markEventDeleted: (id: string) => void
  undeleteEvent: (id: string) => void
  createEvent: (data: EventOverride) => void

  setCultureOverride: (id: string, patch: Partial<CultureOverride>) => void
  deleteCultureOverride: (id: string) => void
  markCultureDeleted: (id: string) => void
  undeleteCulture: (id: string) => void
  createCulture: (data: CultureOverride) => void

  resetAll: () => void
  exportAll: () => string
  importAll: (json: string) => boolean
}

// 简化的 override 类型（只存可编辑字段 + 新增/删除标记）
export type GeoFeatureOverride = {
  // 标记
  __deleted?: boolean
  __new?: boolean
  // 可编辑字段
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
  __deleted?: boolean
  __new?: boolean
  name?: string
  role?: string
  category?: string
  description?: string
  personaPrompt?: string
  imageSearch?: string
  birthYear?: number
  deathYear?: number
  relatedFigureIds?: Array<{ id: string; type: string }>
  emoji?: string
  eraIds?: string[]
}

export type EventOverride = {
  __deleted?: boolean
  __new?: boolean
  id?: string
  title?: string
  year?: number
  category?: string
  description?: string
  imageSearch?: string
  coordinates?: [number, number]
  region?: string
  importance?: 1 | 2 | 3
}

export type CultureOverride = {
  __deleted?: boolean
  __new?: boolean
  id?: string
  title?: string
  year?: number
  category?: string
  description?: string
  imageSearch?: string
  location?: [number, number]
  region?: string
  importance?: 1 | 2 | 3
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
      markGeoDeleted: (id) => set(s => ({
        geoOverrides: { ...s.geoOverrides, [id]: { ...s.geoOverrides[id], __deleted: true } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),
      undeleteGeo: (id) => set(s => {
        const cur = s.geoOverrides[id]
        if (!cur) return s
        const { __deleted, ...rest } = cur
        return {
          geoOverrides: { ...s.geoOverrides, [id]: rest },
          lastModified: new Date().toISOString(),
          isDirty: true,
        }
      }),
      createGeo: (data) => set(s => ({
        geoOverrides: { ...s.geoOverrides, [(data as any).id]: { ...data, __new: true } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),

      setPersonOverride: (id, patch) => set(s => ({
        peopleOverrides: { ...s.peopleOverrides, [id]: { ...s.peopleOverrides[id], ...patch } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),
      deletePersonOverride: (id) => set(s => {
        const { [id]: _, ...rest } = s.peopleOverrides
        return { peopleOverrides: rest, lastModified: new Date().toISOString(), isDirty: true }
      }),
      markPersonDeleted: (id) => set(s => ({
        peopleOverrides: { ...s.peopleOverrides, [id]: { ...s.peopleOverrides[id], __deleted: true } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),
      undeletePerson: (id) => set(s => {
        const cur = s.peopleOverrides[id]
        if (!cur) return s
        const { __deleted, ...rest } = cur
        return {
          peopleOverrides: { ...s.peopleOverrides, [id]: rest },
          lastModified: new Date().toISOString(),
          isDirty: true,
        }
      }),
      createPerson: (data) => set(s => ({
        peopleOverrides: { ...s.peopleOverrides, [(data as any).id]: { ...data, __new: true } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),

      setEventOverride: (id, patch) => set(s => ({
        eventsOverrides: { ...s.eventsOverrides, [id]: { ...s.eventsOverrides[id], ...patch } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),
      deleteEventOverride: (id) => set(s => {
        const { [id]: _, ...rest } = s.eventsOverrides
        return { eventsOverrides: rest, lastModified: new Date().toISOString(), isDirty: true }
      }),
      markEventDeleted: (id) => set(s => ({
        eventsOverrides: { ...s.eventsOverrides, [id]: { ...s.eventsOverrides[id], __deleted: true } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),
      undeleteEvent: (id) => set(s => {
        const cur = s.eventsOverrides[id]
        if (!cur) return s
        const { __deleted, ...rest } = cur
        return {
          eventsOverrides: { ...s.eventsOverrides, [id]: rest },
          lastModified: new Date().toISOString(),
          isDirty: true,
        }
      }),
      createEvent: (data) => set(s => ({
        eventsOverrides: { ...s.eventsOverrides, [(data as any).id]: { ...data, __new: true } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),

      setCultureOverride: (id, patch) => set(s => ({
        cultureOverrides: { ...s.cultureOverrides, [id]: { ...s.cultureOverrides[id], ...patch } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),
      deleteCultureOverride: (id) => set(s => {
        const { [id]: _, ...rest } = s.cultureOverrides
        return { cultureOverrides: rest, lastModified: new Date().toISOString(), isDirty: true }
      }),
      markCultureDeleted: (id) => set(s => ({
        cultureOverrides: { ...s.cultureOverrides, [id]: { ...s.cultureOverrides[id], __deleted: true } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),
      undeleteCulture: (id) => set(s => {
        const cur = s.cultureOverrides[id]
        if (!cur) return s
        const { __deleted, ...rest } = cur
        return {
          cultureOverrides: { ...s.cultureOverrides, [id]: rest },
          lastModified: new Date().toISOString(),
          isDirty: true,
        }
      }),
      createCulture: (data) => set(s => ({
        cultureOverrides: { ...s.cultureOverrides, [(data as any).id]: { ...data, __new: true } },
        lastModified: new Date().toISOString(),
        isDirty: true,
      })),

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
