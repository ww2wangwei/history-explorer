/**
 * 诗词用户数据 store
 *
 * 与 useNotesStore / useHistoryStore 隔离 —— 用户对单首诗的"白话翻译"、
 * 收藏、已读时间等个人数据，是独立生命周期。
 *
 * 通过 zustand persist 写入 localStorage（key: history-explorer:poems:v1）。
 * NoteTargetKind 现在只有 'era' | 'event'，本 store **不**继承 NoteTarget，
 * 避免现有 NotesStore 的迁移复杂度。
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface PoemUserState {
  /** poemId → 用户白话翻译（自己的话文版） */
  userTranslations: Record<string, string>
  /** 已收藏 poemId 列表 */
  favorites: string[]
  /** poemId → 上次打开时间戳 */
  viewedAt: Record<string, number>

  // ===== Actions =====
  /** 设置 / 清空某诗的白话翻译 */
  setTranslation: (poemId: string, text: string) => void
  /** 切换收藏 */
  toggleFavorite: (poemId: string) => void
  /** 标记已读 */
  markViewed: (poemId: string) => void

  // ===== 查询 =====
  getTranslation: (poemId: string) => string
  isFavorite: (poemId: string) => boolean
}

export const usePoemStore = create<PoemUserState>()(
  persist(
    (set, get) => ({
      userTranslations: {},
      favorites: [],
      viewedAt: {},

      setTranslation: (poemId, text) =>
        set(s => {
          const trimmed = text.length === 0
            ? (() => {
                const { [poemId]: _removed, ...rest } = s.userTranslations
                return rest
              })()
            : { ...s.userTranslations, [poemId]: text }
          return { userTranslations: trimmed }
        }),

      toggleFavorite: poemId =>
        set(s => {
          const exists = s.favorites.includes(poemId)
          return {
            favorites: exists
              ? s.favorites.filter(id => id !== poemId)
              : [...s.favorites, poemId],
          }
        }),

      markViewed: poemId =>
        set(s => ({ viewedAt: { ...s.viewedAt, [poemId]: Date.now() } })),

      getTranslation: poemId => get().userTranslations[poemId] ?? '',
      isFavorite: poemId => get().favorites.includes(poemId),
    }),
    {
      name: 'history-explorer:poems:v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // 三个数据字段才需要持久化；actions / 查询函数一律不存
      partialize: state => ({
        userTranslations: state.userTranslations,
        favorites: state.favorites,
        viewedAt: state.viewedAt,
      }),
    },
  ),
)
