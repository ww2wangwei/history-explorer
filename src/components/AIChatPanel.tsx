/**
 * AI 问答聊天面板 — 浮动按钮 + 全屏对话
 *
 * 用 Anthropic Messages API 流式响应。直接 fetch（不用 SDK）以减小 bundle。
 * 上下文自动从 useHistoryStore 注入：当前 selectedEraId / selectedEventId / currentYear。
 *
 * 用法：在 Layout 加 <AIChatPanel />，右下角浮动按钮 + 弹出抽屉。
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { useAIStore, MAX_TOKENS, type AIMessage } from '@/store/useAIStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useNotesStore } from '@/store/useNotesStore'
import type { NoteTargetKind } from '@/types/notes'
import { useAllLearningContexts } from '@/utils/useLearningContext'
import { streamAI, requestAI, type AIRequestHandle } from '@/utils/aiStream'
import { useDraggableFab } from '@/hooks/useDraggableFab'
import erasData from '@/data/eras.json'
import peopleData from '@/data/people.json'
import type { Era } from '@/types'
import { audioEngine } from '@/utils/audioEngine'

const eras = erasData as Era[]
const people = peopleData as Array<{ id: string; name: string; emoji?: string; role: string; description: string }>

/** 系统提示词：定义 AI 是历史学习助手 */
const SYSTEM_PROMPT = `你是「历史探索者」应用内置的 AI 学习助手，专门帮助用户深入学习中国和世界历史（公元前 3500 年至今）。

回答要求：
1. **基于事实**：使用公认的历史学和考古学共识。不杜撰、不断言存疑内容。
2. **结构化**：用 markdown 标题、要点列表、引用等。**关键名词加粗（用 **xxx**）**。
3. **多角度**：政治、经济、文化、思想、技术、外交 6 个维度。涉及争议时给两种或多种学术解释。
4. **故事化**：用人物 + 冲突 + 转折讲，让用户记得住。
5. **时空锚定**：明确"何时何地"，给具体年份。
6. **联系现代**：适当联系今天的中国/世界。

回答长度：500-1500 字。深入但简洁。

如果用户问的不是历史（如闲聊），礼貌地引导回历史话题。

重要输出规则：
- 你的最终回复**只能包含给用户看的内容**。不要在回复中输出任何内部思考 / 推理过程 / 思维链 / 思考块。
- 不要使用 <thinking>...</thinking>、<reasoning>...</reasoning>、<analysis>...</analysis> 等任何 XML-like 标签。
- 不要在回复开头或中间写"让我想想"、"我需要考虑..."、"First, ..."、"I think, ..."、"分析一下"、"我们来看"、"显然"等思考/引导词。
- 不要解释"为什么这样回答"——直接给答案本身。
- 直接给出最终答案（结构化 markdown），不要展示中间步骤。
`

interface Props {
  /** 显示浮动按钮（默认 true） */
  showFab?: boolean
  /** 默认方向：右下 */
  fabPosition?: 'bottom-right' | 'bottom-left'
}

/** 测试按钮：发送简单请求验证大模型配置 */
function TestButton({ protocol, baseUrl, model, apiKey }: {
  protocol: 'anthropic' | 'openai'
  baseUrl: string
  model: string
  apiKey: string
}) {
  const [state, setState] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')
  const [msg, setMsg] = useState('')

  const handleTest = async () => {
    if (!apiKey) { setState('fail'); setMsg('请先输入 API key'); return }
    if (!baseUrl) { setState('fail'); setMsg('请填写 Base URL'); return }
    setState('testing')
    setMsg('')

    try {
      const fallbackModel = protocol === 'anthropic' ? 'claude-haiku-4-5-20251001' : 'gpt-3.5-turbo'
      await requestAI({
        protocol,
        apiKey,
        baseUrl,
        model: model || fallbackModel,
        messages: [{ role: 'user', content: '回复"OK"' }],
        maxTokens: 50,
        timeoutMs: 15_000,
      }).promise
      setState('ok')
      setMsg(`${model || fallbackModel} ✓`)
    } catch (e) {
      setState('fail')
      setMsg((e as Error).message.substring(0, 200))
    }
  }

  return (
    <button
      onClick={handleTest}
      disabled={state === 'testing'}
      className={`px-3 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${
        state === 'testing' ? 'bg-ink-600 text-ink-400 cursor-wait' :
        state === 'ok' ? 'bg-green-700/50 text-green-300 border border-green-500/40' :
        state === 'fail' ? 'bg-red-800/50 text-red-300 border border-red-500/40' :
        'bg-ink-700/60 hover:bg-ink-600 text-ink-300 border border-ink-500'
      }`}
      title={msg || '测试连接'}
    >
      {state === 'testing' ? '⏳ 测试中...' :
       state === 'ok' ? '✅ 连接成功' :
       state === 'fail' ? '❌ 失败' :
       '🔍 测试'}
      {msg && <span className="text-[10px] opacity-70">{msg}</span>}
    </button>
  )
}

const QUICK_PROMPTS = [
  '请用 5 个要点总结这个朝代',
  '比较这个朝代和同时期的另一大文明',
  '这个朝代灭亡的主要原因是什么？',
  '这个朝代对后世的最大贡献是什么？',
  '给我讲一个关于这个朝代的代表性故事',
]

export default function AIChatPanel({ showFab = true, fabPosition = 'bottom-right' }: Props) {
  const {
    apiKey,
    activeThreadId,
    threads,
    panelOpen,
    contextEraId,
    contextEventId,
    contextPersonId,
    personaSystemPrompt,
    pendingError,
  } = useAIStore()
  const setPersonaPrompt = useAIStore(s => s.setPersonaPrompt)
  const aiSetContext = useAIStore(s => s.setContext)
  const openPanel = useAIStore(s => s.openPanel)
  const closePanel = useAIStore(s => s.closePanel)
  const togglePanel = useAIStore(s => s.togglePanel)
  const setPendingError = useAIStore(s => s.setPendingError)
  const setApiKey = useAIStore(s => s.setApiKey)

  // 当前对话关联人物的学习上下文（用于在头部显示"AI 知道"）
  const allContexts = useAllLearningContexts()
  const currentContext = contextPersonId ? allContexts[contextPersonId] : null
  const newThread = useAIStore(s => s.newThread)
  const addMessage = useAIStore(s => s.addMessage)
  const updateMessage = useAIStore(s => s.updateMessage)
  const setActiveThread = useAIStore(s => s.setActiveThread)
  const deleteThread = useAIStore(s => s.deleteThread)

  // API config（用户配置 baseUrl / model / protocol）
  const apiConfig = useAIStore((s) => s.apiConfig)
  const setApiConfig = useAIStore((s) => s.setApiConfig)

  const selectedEraId = useHistoryStore((s) => s.selectedEraId)
  const currentYear = useHistoryStore((s) => s.currentYear)
  const selectEra = useHistoryStore((s) => s.selectEra)
  const selectEvent = useHistoryStore((s) => s.selectEvent)

  // 自动跟踪 context（用户在地图选了某个朝代/事件时同步）
  useEffect(() => {
    aiSetContext(selectedEraId, null)
  }, [selectedEraId, aiSetContext])

  // 启动时检查 sessionStorage 是否有"待发送的问题"（PersonDetailDialog 提问建议桥接）
  useEffect(() => {
    // 显示外部模块（地图/地球仪点击）通过 store 传入的 pendingError
    // 显示后立刻清空，避免下次面板打开又出现
    if (pendingError) {
      setError(pendingError)
      setPendingError(null)
    }
  }, [pendingError, setPendingError])

  useEffect(() => {
    const pending = sessionStorage.getItem('history-explorer-pending-question')
    if (pending) {
      setInput(pending)
      sessionStorage.removeItem('history-explorer-pending-question')
    }
    // 自动发送（地图点击 / 外部触发）
    const auto = sessionStorage.getItem('history-explorer-pending-auto-question')
    if (auto && apiKey) {
      sessionStorage.removeItem('history-explorer-pending-auto-question')
      // 延迟一帧确保 input 已同步
      setTimeout(() => sendMessage(auto), 50)
    } else if (auto) {
      // 没 API key — 把问题留到输入框并提示用户
      setInput(auto)
      sessionStorage.removeItem('history-explorer-pending-auto-question')
      setError('请先在右上"设置"中输入你的 API key')
    }
  }, [panelOpen])

  const [input, setInput] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(apiKey ?? '')
  const [apiBaseUrl, setApiBaseUrl] = useState(apiConfig.baseUrl)
  const [apiModel, setApiModel] = useState(apiConfig.model)
  const [apiProtocol, setApiProtocol] = useState(apiConfig.protocol)
  const [apiDisableThinking, setApiDisableThinking] = useState<boolean>(apiConfig.disableThinking !== false)
  const [error, setError] = useState<string | null>(null)
  // 最近保存的 AI 消息 id（用于显示"✓ 已加入笔记"反馈）
  const [noteSavedFor, setNoteSavedFor] = useState<string | null>(null)
  const abortHandleRef = useRef<AIRequestHandle<string> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isStreamingRef = useRef(false)

  // 面板位置（可拖动）
  const [panelPos, setPanelPos] = useState<{ left: number; top: number } | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; origLeft: number; origTop: number } | null>(null)

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea, select')) return
    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const current = panelPos ?? { left: rect.left, top: rect.top }
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origLeft: current.left,
      origTop: current.top,
    }
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY
      const newLeft = Math.max(0, Math.min(window.innerWidth - 200, dragRef.current.origLeft + dx))
      const newTop = Math.max(0, Math.min(window.innerHeight - 100, dragRef.current.origTop + dy))
      setPanelPos({ left: newLeft, top: newTop })
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // 当前活动 thread
  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null

  // 滚动到底部
  useEffect(() => {
    if (panelOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [panelOpen, activeThread?.messages.length])

  // 构建上下文消息（system 提示 + 用户消息中插入 context）
  const buildContextPrefix = (): string => {
    const parts: string[] = []
    if (contextEraId) {
      const era = eras.find((e) => e.id === contextEraId)
      if (era) {
        parts.push(
          `[当前选中的朝代] ${era.name}（${era.startYear < 0 ? `BC ${-era.startYear}` : era.startYear} ~ ${era.endYear < 0 ? `BC ${-era.endYear}` : era.endYear}）` +
            (era.region === 'china' ? '（中国）' : '（世界）') +
            (era.shortDesc ? `：${era.shortDesc}` : ''),
        )
      }
    }
    if (typeof currentYear === 'number') {
      parts.push(`[当前时间轴年份] ${currentYear < 0 ? `BC ${-currentYear}` : currentYear}`)
    }
    return parts.length ? '【应用上下文】\n' + parts.join('\n') : ''
  }

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreamingRef.current) return
      if (!apiKey) {
        setShowKeyInput(true)
        setError('请先在右上"设置"中输入你的 Anthropic API key（格式：sk-ant-...）')
        return
      }

      setError(null)

      // 1. 确保有 thread
      let threadId = activeThreadId
      if (!threadId) {
        threadId = newThread(text.slice(0, 30) + (text.length > 30 ? '...' : ''))
      }

      // 2. 上下文 + 用户消息
      const userMsg: AIMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
        contextEras: contextEraId ? [contextEraId] : undefined,
      }
      addMessage(threadId, userMsg)
      setInput('')

      // 3. 助手消息（流式填充）
      const assistantId = `msg-${Date.now() + 1}-${Math.random().toString(36).slice(2, 6)}`
      const assistantMsg: AIMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        loading: true,
      }
      addMessage(threadId, assistantMsg)

      isStreamingRef.current = true

      // 4. 构造 messages 数组给 API
      const contextPrefix = buildContextPrefix()
      const apiMessages: { role: 'user' | 'assistant' | 'system'; content: string }[] = []
      // 加入历史消息（最近 5 条）
      const recent = (activeThread?.messages ?? []).slice(-5)
      for (const m of recent) {
        apiMessages.push({ role: m.role, content: m.content })
      }
      // 加当前 user 消息（含 context）
      const finalUserText = contextPrefix
        ? `${contextPrefix}\n\n${text.trim()}`
        : text.trim()
      apiMessages.push({ role: 'user', content: finalUserText })

      // 5. 决定 system prompt：有 persona 角色用 persona，否则默认
      const activeSystemPrompt = personaSystemPrompt || SYSTEM_PROMPT

      const ctrl = new AbortController()
      const handle: AIRequestHandle<string> = streamAI({
        protocol: apiConfig.protocol,
        apiKey,
        baseUrl: apiConfig.baseUrl,
        model: apiConfig.model,
        messages: [{ role: 'system', content: activeSystemPrompt }, ...apiMessages],
        maxTokens: MAX_TOKENS,
        signal: ctrl.signal,
        disableThinking: apiConfig.disableThinking,
        onDelta: (delta) => {
          updateMessage(threadId, assistantId, (m) => ({
            content: m.content + delta,
            loading: true,
          }))
        },
      })
      abortHandleRef.current = handle
      try {
        await handle.promise
        // 完成
        updateMessage(threadId, assistantId, { loading: false })
        audioEngine.playAiReply()
      } catch (e: any) {
        console.error('[AI] sendMessage catch', e.name, e.message)
        if (e.name !== 'AbortError' && e.name !== 'TimeoutError') {
          setError(e.message || '请求失败')
          updateMessage(threadId, assistantId, { loading: false, error: e.message })
        }
      } finally {
        isStreamingRef.current = false
        abortHandleRef.current = null
      }
    },
    [apiKey, activeThreadId, contextEraId, currentYear, threads, personaSystemPrompt],
  )

  const stopStreaming = () => {
    abortHandleRef.current?.abort()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // 把 AI 回答加入笔记
  const saveAsNote = (m: AIMessage) => {
    if (m.role !== "assistant") return
    const notes = useNotesStore.getState()
    const eraId = m.contextEras && m.contextEras[0]
    // 无朝代关联的自由问答：仍存为 era 类型的占位笔记（id 标记为 ai-chat）
    const target: { kind: NoteTargetKind; id: string } = eraId
      ? { kind: "era", id: eraId }
      : { kind: "era", id: "ai-chat" }
    const firstLine = m.content.split('\n').find(l => l.trim()) || m.content
    const title = firstLine.replace(/[*#`]/g, '').trim().slice(0, 40) || 'AI 回答'
    const source = eraId ? '\n\n[AI 助手·来自朝代：' + eraId + ']' : '\n\n[AI 助手·历史问答]'
    notes.addNote(target, { title: title, content: m.content + source })
    setNoteSavedFor(m.id)
    setTimeout(() => setNoteSavedFor(curr => curr === m.id ? null : curr), 2000)
  }

  // 浮动按钮位置（可拖拽，位置持久化到 localStorage）
  const fabPos = useDraggableFab({
    storageKey: 'ai-fab-pos',
    initial: fabPosition === 'bottom-left' ? { right: -1, bottom: 16 } : { right: 16, bottom: 16 },
  })

  // 全局键盘快捷键：? 键唤起 AI 面板（不与 ? 帮助冲突 — 改用 `Cmd+K` / `Ctrl+K` 唤起）
  useEffect(() => {
    if (!showFab) return
    const handler = (e: KeyboardEvent) => {
      // 忽略输入框中
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        togglePanel()
      } else if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // 问号键（Shift+/）— 唤起 AI 面板
        e.preventDefault()
        if (!panelOpen) openPanel()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showFab, panelOpen, openPanel, togglePanel])

  return (
    <>
      {/* 浮动按钮（可拖拽；位置会保存到 localStorage） */}
      {showFab && (
        <button
          onPointerDown={fabPos.onPointerDown}
          onClickCapture={fabPos.suppressClickIfDragged}
          onClick={togglePanel}
          className="fixed z-[70] group flex items-center gap-2 transition-all cursor-grab active:cursor-grabbing select-none touch-none"
          style={{
            right: fabPos.pos.right,
            bottom: fabPos.pos.bottom,
          }}
          title={panelOpen ? '关闭 AI 对话 (Cmd+K / ?)' : '打开 AI 对话 (Cmd+K / ?)'}
        >
          <span className="hidden group-hover:inline-block text-xs px-2 py-1 rounded-lg bg-ink-800/95 border border-vermilion-500/40 text-vermilion-300 shadow-lg whitespace-nowrap">
            🤖 AI 问 · <kbd className="px-1 bg-ink-700 rounded-lg text-xs">?</kbd>
          </span>
          <span
            className="w-11 h-11 rounded-full shadow-2xl flex items-center justify-center border-2"
            style={{
              background: 'rgb(184 67 58)',
              borderColor: 'rgb(154 51 44)',
              boxShadow: '0 0 0 4px rgb(184 67 58 / 0.18), 0 4px 12px rgb(0 0 0 / 0.3), inset 0 0 0 2px rgb(154 51 44 / 0.6)',
            }}
          >
            {panelOpen ? (
              <svg width="16" height="16" viewBox="0 0 20 20">
                <path d="M4 4 L16 16 M16 4 L4 16" stroke="#f7eed8" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              </svg>
            ) : (
              <span className="font-brush text-base text-[#f7eed8] leading-none tracking-wide" style={{ textShadow: '0 1px 0 rgb(0 0 0 / 0.3)' }}>
                问
              </span>
            )}
          </span>
        </button>
      )}

      {/* 对话面板 */}
      {panelOpen && (
        <div
          className="fixed z-[70] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] flex flex-col bg-ink-800 rounded-lg border border-vermilion-500/40 shadow-2xl resize overflow-auto"
          style={{
            width: 450,
            height: 580,
            minWidth: 320,
            minHeight: 360,
            ...(panelPos ? { left: panelPos.left, top: panelPos.top, right: 'auto', bottom: 'auto' } : { right: 16, bottom: 80 }),
          }}
        >
          {/* 当前角色卡片（persona 激活时显示） */}
          {personaSystemPrompt && (() => {
            const person = peopleData.find(p => p.id === contextPersonId)
            if (!person) return null
            return (
              <div>
              <div className="px-4 py-2.5 border-b border-purple-700/40 bg-gradient-to-r from-purple-900/30 to-bronze-900/20 flex items-center gap-3">
                <div className="text-3xl shrink-0">{person.emoji || '👤'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-serif text-purple-200 truncate">
                    正在与 <span className="text-vermilion-300">{person.name}</span> 对话
                  </div>
                  <div className="text-xs text-purple-300/70 truncate">{person.role}</div>
                </div>
                <button
                  onClick={() => {
                    setPersonaPrompt(null)
                    aiSetContext(contextEraId, contextEventId, null)
                  }}
                  className="text-ink-500 hover:text-parchment-50 text-base shrink-0"
                  title="退出角色扮演"
                  aria-label="退出角色扮演"
                >
                  ×
                </button>
              </div>
              {/* 🧠 AI 知道你的学习上下文指示器 */}
              {currentContext && currentContext.summary !== '上下文已加载' && (
                <div className="px-4 py-1.5 border-b border-purple-900/30 bg-purple-950/30 text-xs text-purple-300/80 flex items-center gap-1.5">
                  <span>🧠</span>
                  <span className="truncate">AI 知道：{currentContext.summary}</span>
                </div>
              )}
              </div>
            )
          })()}

          {/* 头部 - 可拖动手柄（不响应 button/input） */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-ink-600 select-none"
            style={{ cursor: 'move' }}
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <div className="text-sm font-serif text-vermilion-300">历史问答助手</div>
                <div className="text-xs text-ink-500">
                  {apiKey ? '✓ API key 已配置' : '⚠ 需要 API key'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setShowKeyInput((s) => !s)
                  setApiKeyInput(apiKey ?? '')
                }}
                className="text-xs text-ink-400 hover:text-vermilion-300 px-2 py-1 rounded-lg hover:bg-ink-700/60"
                title="设置 Anthropic API key"
                aria-label="设置 Anthropic API key"
              >
                ⚙ 设置
              </button>
              <button
                onClick={closePanel}
                className="text-ink-500 hover:text-parchment-50 text-xl leading-none"
                title="关闭"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
          </div>

          {/* API key 设置面板 */}
          {showKeyInput && (
            <div className="p-3 border-b border-ink-600 bg-ink-900/40 space-y-2">
              <div className="text-xs text-ink-400">
                1. 选 API 协议：
              </div>
              <div className="flex gap-2 text-xs">
                {(['anthropic', 'openai'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      // 只切 protocol，不动 baseUrl / model（用户已填的不覆盖）
                      setApiProtocol(p)
                    }}
                    className={`px-2 py-1 rounded-lg border ${
                      apiProtocol === p
                        ? 'border-vermilion-500/40 bg-vermilion-500/30 text-vermilion-300'
                        : 'border-ink-600 text-ink-400'
                    }`}
                  >
                    {p === 'anthropic' ? 'Anthropic Claude' : 'OpenAI 兼容（Minimax / DeepSeek 等）'}
                  </button>
                ))}
              </div>

              <div className="text-xs text-ink-400">
                2. Base URL（不含 /v1/messages 或 /chat/completions）：
              </div>
              <input
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder={apiProtocol === 'anthropic' ? 'https://api.anthropic.com' : 'https://api.minimax.chat'}
                className="w-full text-xs px-2 py-1 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50"
              />

              <div className="text-xs text-ink-400">
                3. Model 名：
              </div>
              <input
                value={apiModel}
                onChange={(e) => setApiModel(e.target.value)}
                placeholder="claude-haiku-4-5-20251001"
                className="w-full text-xs px-2 py-1 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50"
              />

              <div className="text-xs text-ink-400">
                4. API key（保存到 localStorage）：
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={apiProtocol === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
                  className="flex-1 text-xs px-2 py-1 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50"
                />
                <button
                  onClick={() => {
                    setApiKey(apiKeyInput)
                    setApiConfig({
                      protocol: apiProtocol,
                      baseUrl: apiBaseUrl.trim(),
                      model: apiModel.trim() || 'minimax-chat',
                      disableThinking: apiDisableThinking,
                    })
                    setShowKeyInput(false)
                  }}
                  className="px-3 py-1 text-xs bg-vermilion-500 hover:bg-vermilion-600 text-parchment-50 rounded-lg"
                >
                  保存
                </button>
                <TestButton
                  protocol={apiProtocol}
                  baseUrl={apiBaseUrl.trim()}
                  model={apiModel.trim()}
                  apiKey={apiKeyInput}
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-ink-300 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={apiDisableThinking}
                  onChange={e => setApiDisableThinking(e.target.checked)}
                  className="accent-vermilion-500"
                />
                <span>禁用 AI 思考模式</span>
                <span className="text-ink-500">（MiniMax / DeepSeek 等模型关闭 &lt;thinking&gt; 块，推荐打开）</span>
              </label>
            </div>
          )}

          {/* thread 切换（带删除按钮） */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-ink-600 bg-ink-900/30 overflow-x-auto">
            {threads.slice(-5).map((t) => (
              <div
                key={t.id}
                className={`flex items-center gap-0.5 rounded-lg whitespace-nowrap ${
                  t.id === activeThreadId
                    ? 'bg-vermilion-500/40 text-vermilion-300'
                    : 'text-ink-400 hover:bg-ink-700/40'
                }`}
              >
                <button
                  onClick={() => setActiveThread(t.id)}
                  className="text-xs px-2 py-1"
                >
                  {t.title}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`删除对话"${t.title}"?`)) deleteThread(t.id)
                  }}
                  className="text-xs px-1.5 py-1 text-ink-500 hover:text-red-400"
                  title="删除此对话"
                  aria-label="删除此对话"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => newThread('新对话')}
              className="text-xs px-2 py-1 rounded-lg text-ink-400 hover:text-parchment-50 hover:bg-ink-700/40"
            >
              + 新对话
            </button>
            {threads.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`清空所有 ${threads.length} 个对话?`)) {
                    threads.forEach(t => deleteThread(t.id))
                  }
                }}
                className="ml-auto text-xs px-2 py-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/30"
                title="删除所有对话历史"
                aria-label="删除所有对话历史"
              >
                🗑 清空
              </button>
            )}
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
            {!activeThread && (
              <div className="text-center text-ink-500 text-xs py-8">
                问任何历史问题 — 比如：
                <div className="mt-2 text-ink-400">
                  • 唐朝为什么衰落？
                </div>
                <div className="text-ink-400">• 蒙古帝国如何改变欧亚？</div>
                <div className="text-ink-400">• 比较汉朝和罗马帝国</div>
              </div>
            )}

            {activeThread && activeThread.messages.length === 0 && contextEraId && (
              <div className="space-y-1.5">
                <div className="text-xs text-vermilion-300 mb-2">💡 快速提问（已选朝代自动带入上下文）：</div>
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p)}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-ink-700/40 hover:bg-ink-700/80 text-parchment-50 border border-ink-600/40"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {activeThread?.messages.map((m) => {
              // 查找消息关联的人物（userMsg 通过 contextEras 间接找；assistant 通过 thread title 找）
              const personForMsg = m.role === 'user' && contextPersonId
                ? people.find(p => p.id === contextPersonId)
                : null
              return (
              <div
                key={m.id}
                className={`rounded-lg p-3 ${
                  m.role === 'user'
                    ? 'bg-vermilion-900/30 ml-8'
                    : 'bg-ink-700/40 mr-8'
                }`}
              >
                <div className="text-xs text-ink-500 mb-1 flex items-center gap-1">
                  {personForMsg && (
                    <span className="text-base" title={`正在与 ${personForMsg.name} 对话`}>
                      {personForMsg.emoji || '👤'}
                    </span>
                  )}
                  <span className={m.role === 'user' ? 'text-vermilion-300' : 'text-purple-300'}>
                    {m.role === 'user' ? '👤 你' : (contextPersonId ? `🎭 ${people.find(p => p.id === contextPersonId)?.name ?? 'AI'}` : '🤖 AI')}
                  </span>
                  {m.contextEras?.map(eid => {
                    const era = eras.find((e) => e.id === eid)
                    return era ? (
                      <span key={eid} className="px-1.5 py-0.5 rounded-lg bg-ink-800/60" style={{ color: era.color }}>
                        {era.name}
                      </span>
                    ) : null
                  })}
                </div>
                <div
                  className="text-xs text-parchment-50 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                />
                {/* AI 回答：操作栏（加入笔记 + 复制） */}
                {m.role === 'assistant' && !m.loading && m.content && !m.error && (
                  <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-ink-700/40">
                    <button
                      onClick={() => saveAsNote(m)}
                      className="text-xs px-2 py-0.5 rounded-lg text-vermilion-300 hover:text-vermilion-300 hover:bg-vermilion-900/30 border border-bronze-700/30"
                      title="把这条 AI 回答加入笔记"
                    aria-label="把这条 AI 回答加入笔记"
                    >
                      📥 加入笔记
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(m.content)
                      }}
                      className="text-xs px-2 py-0.5 rounded-lg text-ink-400 hover:text-parchment-50 hover:bg-ink-700/40"
                      title="复制全文"
                    aria-label="复制全文"
                    >
                      📋 复制
                    </button>
                    {noteSavedFor === m.id && (
                      <span className="text-xs text-green-400">✓ 已加入笔记</span>
                    )}
                  </div>
                )}
                {m.loading && (
                  <div className="text-xs text-ink-500 mt-1 animate-pulse">▍ 正在输入...</div>
                )}
                {m.error && (
                  <div className="text-xs text-red-400 mt-1">⚠ {m.error}</div>
                )}
              </div>
              )
            })}

            {error && (
              <div className="rounded-lg bg-red-900/30 border border-red-700/40 p-2 text-[11px] text-red-300">
                ⚠ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入区 */}
          <div className="border-t border-ink-600 p-3 bg-ink-900/30">
            {activeThread?.messages.some((m) => m.loading) ? (
              <button
                onClick={stopStreaming}
                className="w-full px-3 py-2 text-xs bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg"
              >
                ■ 停止生成
              </button>
            ) : (
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={
                    contextEraId
                      ? `问关于 ${eras.find((e) => e.id === contextEraId)?.name} 的任何问题...`
                      : '问任何历史问题...'
                  }
                  rows={2}
                  className="flex-1 text-xs px-2 py-1.5 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50 resize-none"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || !apiKey}
                  className="px-3 py-1.5 text-xs bg-vermilion-500 hover:bg-vermilion-600 disabled:opacity-50 disabled:cursor-not-allowed text-parchment-50 rounded-lg self-end"
                >
                  发送
                </button>
              </div>
            )}
            <div className="text-xs text-ink-500 mt-1">
              Enter 发送，Shift+Enter 换行
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/** 简易 markdown 渲染 + 去除 thinking 块：
 *  - **加粗** 转 <strong>
 *  - 换行转 <br/>
 *  - 去除 <thinking>/<reasoning>/<analysis> 块（防御 Minimax 等 API 偶发泄漏）
 */
function renderMarkdown(text: string): string {
  return text
    .replace(/<\/?(thinking|reasoning|analysis|thought|reflection)>\s*/gi, '')
    .replace(/<\|.*?\|>/gs, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-vermilion-300">$1</strong>')
    .replace(/\n/g, '<br/>')
}
