/**
 * AI 问答系统 store
 *
 * - 用户在 UI 中输入自己的 Anthropic API key（持久化到 localStorage）
 * - 对话历史按"主题"分组（每个朝代/事件一个 thread）
 * - 流式响应通过 fetch + ReadableStream 处理
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type AIRole = 'user' | 'assistant' | 'system'

export interface AIMessage {
  id: string
  role: AIRole
  content: string
  timestamp: number
  /** 引用的事件/朝代 id（用于显示上下文徽章） */
  contextEras?: string[]
  contextEvents?: string[]
  /** 加载状态：true 表示助手消息正在 streaming */
  loading?: boolean
  /** 错误信息（如果 API 调用失败） */
  error?: string
}

export interface AIThread {
  id: string
  title: string
  createdAt: number
  messages: AIMessage[]
}

/** API 配置（用户自填，支持 Anthropic / OpenAI 兼容如 Minimax） */
export interface AIApiConfig {
  /** API 协议 */
  protocol: 'anthropic' | 'openai'
  /** base URL（不含 /messages 或 /chat/completions） */
  baseUrl: string
  /** 模型名（anthropic: claude-...；openai: gpt-... 或 minimax-chat） */
  model: string
  /**
   * 禁用模型思考模式（如 MiniMax-Text-01 默认会吐 `<thinking>...</thinking>` 块，把这道题场景会很烦）。
   * 仅对 OpenAI 兼容协议生效；会下发 `enable_thinking: false`。
   */
  disableThinking?: boolean
}

export const DEFAULT_AI_CONFIG: AIApiConfig = {
  protocol: 'openai',
  baseUrl: 'https://api.minimaxi.com/v1',
  model: 'MiniMax-Text-01',
  disableThinking: true,
}

interface AIState {
  /** 用户 API key（持久化到 localStorage） */
  apiKey: string | null
  /** API 协议 + endpoint + model */
  apiConfig: AIApiConfig
  /** 当前激活的 thread id */
  activeThreadId: string | null
  threads: AIThread[]
  /** 浮动聊天面板开关 */
  panelOpen: boolean
  /** 选中的朝代/事件 context（用于让 AI 知道当前在讨论什么） */
  contextEraId: string | null
  contextEventId: string | null
  /** 选中的历史人物（用于 AI 角色扮演） */
  contextPersonId: string | null
  /** 当前活跃 thread 的 persona 角色设定（覆盖默认 SYSTEM_PROMPT） */
  personaSystemPrompt: string | null

  // Actions
  setApiKey: (key: string) => void
  setApiConfig: (cfg: Partial<AIApiConfig>) => void
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
  setContext: (eraId?: string | null, eventId?: string | null, personId?: string | null) => void
  setPersonaPrompt: (prompt: string | null) => void
  newThread: (title: string) => string
  addMessage: (threadId: string, msg: AIMessage) => void
  updateMessage: (threadId: string, messageId: string, patch: Partial<AIMessage> | ((m: AIMessage) => Partial<AIMessage>)) => void
  deleteThread: (threadId: string) => void
  setActiveThread: (id: string | null) => void
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      apiKey: null,
      apiConfig: DEFAULT_AI_CONFIG,
      activeThreadId: null,
      threads: [],
      panelOpen: false,
      contextEraId: null,
      contextEventId: null,
      contextPersonId: null,
      personaSystemPrompt: null,

      setApiKey: (key) => set({ apiKey: key.trim() || null }),
      setApiConfig: (cfg) => set((s) => ({ apiConfig: { ...s.apiConfig, ...cfg } })),
      openPanel: () => set({ panelOpen: true }),
      closePanel: () => set({ panelOpen: false }),
      togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
      setContext: (eraId, eventId, personId) =>
        set({
          contextEraId: eraId === undefined ? null : eraId,
          contextEventId: eventId === undefined ? null : eventId,
          contextPersonId: personId === undefined ? null : personId,
        }),
      setPersonaPrompt: (prompt) => set({ personaSystemPrompt: prompt }),
      newThread: (title) => {
        const id = `thr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        set((s) => ({
          activeThreadId: id,
          threads: [
            ...s.threads,
            { id, title, createdAt: Date.now(), messages: [] },
          ],
        }))
        return id
      },
      addMessage: (threadId, msg) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId
              ? { ...t, messages: [...t.messages, msg] }
              : t
          ),
        })),
      updateMessage: (threadId, messageId, patch) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: t.messages.map((m) => {
                    if (m.id !== messageId) return m
                    const p = typeof patch === 'function' ? patch(m) : patch
                    return { ...m, ...p }
                  }),
                }
              : t
          ),
        })),
      deleteThread: (threadId) =>
        set((s) => ({
          threads: s.threads.filter((t) => t.id !== threadId),
          activeThreadId: s.activeThreadId === threadId ? null : s.activeThreadId,
        })),
      setActiveThread: (id) => set({ activeThreadId: id }),
    }),
    {
      name: 'history-explorer-ai:v1',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      // 只持久化 API key / config / 对话历史；面板开关 / 上下文是会话级
      partialize: (state) => ({
        apiKey: state.apiKey,
        apiConfig: state.apiConfig,
        threads: state.threads,
        activeThreadId: state.activeThreadId,
      }),
      migrate: (persisted, fromVersion) => {
        if (fromVersion < 2 && persisted && typeof persisted === 'object') {
          // 老用户的 apiConfig 没有 disableThinking 字段，补默认 true（关闭模型思考）
          const p = persisted as Partial<AIState> & { apiConfig?: Partial<AIApiConfig> }
          if (p.apiConfig && typeof p.apiConfig === 'object') {
            p.apiConfig = { ...p.apiConfig, disableThinking: true }
          }
        }
        return persisted as AIState
      },
    },
  ),
)

export const MAX_TOKENS = 1024
