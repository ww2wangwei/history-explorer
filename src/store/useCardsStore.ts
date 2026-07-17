/**
 * 学习卡片 store
 *
 * 用 Zustand + persist 写入 localStorage（key: history-explorer-cards:v1）
 * 与 useNotesStore 同模式：UI 状态非持久，只持久数据。
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Card, Rating } from '@/types/flashcards'
import { sm2, createCard, isDue } from '@/utils/sm2'

interface CardsState {
  cards: Record<string, Card>

  // ---------- Actions ----------
  /** 添加卡片。已存在返回现有 id，不重复创建。 */
  addCard: (target: { kind: 'era' | 'event' | 'figure'; id: string }) => string
  /** 删除卡片 */
  removeCard: (id: string) => void
  /** 用 SM-2 更新卡片 */
  rateCard: (id: string, rating: Rating) => void

  // ---------- Queries（不带订阅） ----------
  /** 获取所有到期卡片（nextReviewAt <= now） */
  getDueCards: () => Card[]
  /** 取单张卡片 */
  getCard: (id: string) => Card | undefined
  /** 取某目标关联的卡片（无则返回 undefined） */
  getCardByTarget: (kind: 'era' | 'event' | 'figure', id: string) => Card | undefined
  /** 取全部卡片 */
  getAllCards: () => Card[]
  /** 统计 */
  getStats: () => {
    total: number
    due: number
    new: number
    mastered: number
  }
}

export const useCardsStore = create<CardsState>()(
  persist(
    (set, get) => ({
      cards: {},

      addCard: (target) => {
        // 检查是否已有该 target 的卡片
        const existing = Object.values(get().cards).find(
          c => c.target.kind === target.kind && c.target.id === target.id,
        )
        if (existing) return existing.id

        const card = createCard(target)
        set(s => ({ cards: { ...s.cards, [card.id]: card } }))
        return card.id
      },

      removeCard: (id) =>
        set(s => {
          if (!s.cards[id]) return s
          const { [id]: _, ...rest } = s.cards
          return { cards: rest }
        }),

      rateCard: (id, rating) =>
        set(s => {
          const existing = s.cards[id]
          if (!existing) return s
          const updated = sm2(existing, rating)
          return { cards: { ...s.cards, [id]: updated } }
        }),

      getDueCards: () => {
        const now = Date.now()
        return Object.values(get().cards)
          .filter(c => isDue(c, now))
          .sort((a, b) => a.nextReviewAt - b.nextReviewAt)
      },

      getCard: (id) => get().cards[id],

      getCardByTarget: (kind, id) =>
        Object.values(get().cards).find(c => c.target.kind === kind && c.target.id === id),

      getAllCards: () => Object.values(get().cards),

      getStats: () => {
        const cards = Object.values(get().cards)
        const now = Date.now()
        return {
          total: cards.length,
          due: cards.filter(c => isDue(c, now)).length,
          new: cards.filter(c => c.repetitions === 0).length,
          mastered: cards.filter(c => c.interval >= 21).length,
        }
      },
    }),
    {
      name: 'history-explorer-cards:v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ cards: state.cards }),
      migrate: (persisted, _fromVersion) => persisted as CardsState,
    },
  ),
)