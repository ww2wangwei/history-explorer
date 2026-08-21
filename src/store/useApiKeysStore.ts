/**
 * useApiKeysStore — 用户在 UI 中填写的第三方 API key
 *
 * 持久化到 localStorage（key: history-explorer:api-keys:v1）。
 * 比 .env 优先级高 — 这样 .env 里没填的 key，用户可以在 UI 里现填，
 * 也方便不同的人共用同一台机器而不污染 repo。
 *
 * 使用方式：
 *   const key = useApiKeysStore.getKey('amapKey', import.meta.env.VITE_AMAP_KEY)
 *
 * 如需新增其他 key：
 *   1. 在 ApiKeysState 里加字段
 *   2. 在 partialize 里加入
 *   3. 在 ApiKeysSettings.tsx 里加输入框
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ApiKeysState {
  /** 高德地图 Web 端 JS API key（v2.0） */
  amapKey: string | null
  /** 高德地图「安全密钥」(新一代 key 必填，否则地图白屏) */
  amapSecurityCode: string | null
  /** OpenWeatherMap API key（实时云图叠加层；https://openweathermap.org/api） */
  owmApiKey: string | null
  /** 设置面板是否打开（任何组件都能调 setModalOpen 唤起） */
  modalOpen: boolean

  setAmapKey: (key: string) => void
  setAmapSecurityCode: (code: string) => void
  setOwmApiKey: (key: string) => void
  clearAmapKey: () => void
  setModalOpen: (open: boolean) => void
  /** 清除所有 key（用于调试） */
  clearAll: () => void
}

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set) => ({
      amapKey: null,
      amapSecurityCode: null,
      owmApiKey: null,
      modalOpen: false,

      setAmapKey: (key) => set({ amapKey: key.trim() || null }),
      setAmapSecurityCode: (code) => set({ amapSecurityCode: code.trim() || null }),
      setOwmApiKey: (key) => set({ owmApiKey: key.trim() || null }),
      clearAmapKey: () => set({ amapKey: null, amapSecurityCode: null }),
      setModalOpen: (open) => set({ modalOpen: open }),
      clearAll: () => set({ amapKey: null, amapSecurityCode: null, owmApiKey: null }),
    }),
    {
      name: 'history-explorer:api-keys:v1',
      storage: createJSONStorage(() => localStorage),
      // 只持久化 key 字段本身，不持久化 setter
      partialize: (state) => ({
        amapKey: state.amapKey,
        amapSecurityCode: state.amapSecurityCode,
        owmApiKey: state.owmApiKey,
      }),
      version: 1,
    }
  )
)

/**
 * getAmapKey() — 优先从用户 store 读，回退到 .env。
 * 这是所有 AMap 调用点的标准读取方式。
 */
export function getAmapKey(): string | undefined {
  const userKey = useApiKeysStore.getState().amapKey
  if (userKey) return userKey
  const envKey = (import.meta.env.VITE_AMAP_KEY as string | undefined)?.trim()
  return envKey || undefined
}

export function getAmapSecurityCode(): string | undefined {
  const userCode = useApiKeysStore.getState().amapSecurityCode
  if (userCode) return userCode
  const envCode = (import.meta.env.VITE_AMAP_SECURITY_CODE as string | undefined)?.trim()
  return envCode || undefined
}

/**
 * getOwmApiKey() — OpenWeatherMap key. 优先用户 store，回退 .env.
 */
export function getOwmApiKey(): string | undefined {
  const userKey = useApiKeysStore.getState().owmApiKey
  if (userKey) return userKey
  const envKey = (import.meta.env.VITE_OWM_API_KEY as string | undefined)?.trim()
  return envKey || undefined
}