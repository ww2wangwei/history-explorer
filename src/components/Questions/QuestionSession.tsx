/**
 * QuestionSession — 「全问题」答题对话浮层
 *
 * 流程：
 *  - 展示开场问题与提示
 *  - 用户答题 → AI 苏格拉底式追问（逐步加深，最多 maxRounds 次）
 *  - 到轮数或用户主动点「结束并评分」→ AI 多维度评分
 *  - 自动把整场问答+评分存成一条笔记
 */
import { useEffect, useRef, useState } from 'react'
import { useAIStore } from '@/store/useAIStore'
import { useNotesStore } from '@/store/useNotesStore'
import { useQuestionsStore } from '@/store/useQuestionsStore'
import { streamAI } from '@/utils/aiStream'
import { audioEngine } from '@/utils/audioEngine'
import { buildDeepenPrompt, buildScorePrompt } from './questionPrompt'
import { parseScore } from './parseAI'
import { cleanAI, stripThinkingLive } from './cleanAI'
import type { Question } from '@/types/questions'
import { SCORE_DIMS } from '@/types/questions'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  question: Question
  onClose: () => void
  onSaved: () => void
}

export default function QuestionSession({ question, onClose, onSaved }: Props) {
  const apiKey = useAIStore(s => s.apiKey)
  const apiConfig = useAIStore(s => s.apiConfig)

  // 对话记录（含 AI 追问），用 ref 镜像避免闭包陈旧
  const messagesRef = useRef<Msg[]>([])
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [phase, setPhase] = useState<'answering' | 'scoring' | 'result'>('answering')
  const [error, setError] = useState<string | null>(null)
  const [score, setScore] = useState<{ total: number; dims: Record<string, number>; summary: string } | null>(null)
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null)

  const streamControlRef = useRef<{ abort: () => void } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const roundRef = useRef(0)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [onClose])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, phase, streaming])

  const pushMsg = (m: Msg) => {
    messagesRef.current = [...messagesRef.current, m]
    setMessages(messagesRef.current)
  }
  const patchLast = (patch: Partial<Msg>) => {
    messagesRef.current = messagesRef.current.map((m, i) =>
      i === messagesRef.current.length - 1 ? { ...m, ...patch } : m,
    )
    setMessages(messagesRef.current)
  }
  const getHistory = (): Msg[] => messagesRef.current

  // 发送一轮回答 → AI 追问
  const sendAnswer = async () => {
    const text = input.trim()
    if (!text || streaming) return
    if (!apiKey) {
      setError('请先在 AI 面板配置 API key')
      return
    }
    setError(null)
    setInput('')
    pushMsg({ role: 'user', content: text })
    roundRef.current = roundRef.current + 1

    setStreaming(true)
    try {
      const maxRounds = question.maxRounds
      const history = getHistory()
      const prompt = buildDeepenPrompt(question, roundRef.current, maxRounds, history)
      pushMsg({ role: 'assistant', content: '' })
      let streamBuf = '' // 累积所有 delta，做最后清理兜底
      const handle = streamAI({
        protocol: apiConfig.protocol,
        apiKey,
        baseUrl: apiConfig.baseUrl,
        model: apiConfig.model,
        messages: apiConfig.disableThinking
          ? [
              { role: 'user', content: prompt },
              { role: 'assistant', content: '【点评】' }, // 预填，把模型拉回正文轨道
            ]
          : [{ role: 'user', content: prompt }],
        maxTokens: 800,
        disableThinking: apiConfig.disableThinking,
        onDelta: (delta) => {
          streamBuf += delta
          // 实时：把"buffer 中已确认可见"的内容显示出来，丢掉思考块
          const visible = stripThinkingLive(streamBuf)
          patchLast({ content: visible })
        },
      })
      streamControlRef.current = handle
      await handle.promise
      audioEngine.playAiReply()

      // 流式结束后，做一次"杂质清理"，并对空内容做兜底
      const lastIdx = messagesRef.current.length - 1
      const cleaned = cleanAI(messagesRef.current[lastIdx]?.content ?? '')
      if (!cleaned) {
        const hint = apiConfig.disableThinking
          ? '（AI 没有返回可显示的文字内容。可能原因：① 该模型的"思考"模式无法被 API 参数关闭；② maxTokens 不够；③ 网络异常。请尝试换用其他模型，或在 AI 设置中换用 claude-haiku / gpt-3.5-turbo 等不带思考块的模型。）'
          : '（AI 这一次只返回了内部思考块。请打开 AI 设置里的"禁用 AI 思考模式"，或换用不带思考功能的模型。）'
        messagesRef.current = messagesRef.current.map((m, i) =>
          i === lastIdx ? { ...m, content: hint } : m,
        )
        setMessages(messagesRef.current)
      } else if (cleaned !== messagesRef.current[lastIdx].content) {
        messagesRef.current = messagesRef.current.map((m, i) =>
          i === lastIdx ? { ...m, content: cleaned } : m,
        )
        setMessages(messagesRef.current)
      }
    } catch (e: any) {
      console.error('[QuestionSession] deepen error', e)
      if (e?.name !== 'AbortError') {
        setError(e?.message || '追问失败，请重试')
        patchLast({ content: `⚠ ${e?.message || 'AI 无响应，请重试'}` })
      }
    } finally {
      setStreaming(false)
      streamControlRef.current = null
    }
  }

  // 结束并评分
  const finishAndScore = async () => {
    if (!apiKey) {
      setError('请先在 AI 面板配置 API key')
      return
    }
    if (streaming) return
    setError(null)

    // 若有未发送的输入，先并入对话
    if (input.trim()) {
      pushMsg({ role: 'user', content: input.trim() })
      setInput('')
      roundRef.current = roundRef.current + 1
    }

    setPhase('scoring')
    try {
      const history = getHistory()
      const prompt = buildScorePrompt(question, history)
      let full = ''
      const handle = streamAI({
        protocol: apiConfig.protocol,
        apiKey,
        baseUrl: apiConfig.baseUrl,
        model: apiConfig.model,
        messages: apiConfig.disableThinking
          ? [
              { role: 'user', content: prompt },
              { role: 'assistant', content: '【总评】' },
            ]
          : [{ role: 'user', content: prompt }],
        maxTokens: 900,
        disableThinking: apiConfig.disableThinking,
        onDelta: (d) => { full += d },
      })
      streamControlRef.current = handle
      await handle.promise
      const cleaned = cleanAI(full)
      const parsed = parseScore(cleaned)
      if (!parsed) {
        setError('AI 评分格式无法解析，请再试一次。')
        setPhase('answering')
        return
      }
      setScore(parsed)
      setPhase('result')
      await saveNote(parsed)
    } catch (e: any) {
      console.error('[QuestionSession] score error', e)
      if (e?.name !== 'AbortError') {
        setError(e?.message || '评分失败，请重试')
        setPhase('answering')
      }
    } finally {
      streamControlRef.current = null
    }
  }

  // 保存整场问答 + 评分到笔记，并标记完成
  const saveNote = async (parsed: NonNullable<typeof score>) => {
    const history = getHistory()
    const qaText = history
      .filter(m => m.role === 'user')
      .map((m, i) => `**第 ${i + 1} 轮回答：**\n${m.content}`)
      .join('\n\n')
    const aiText = history
      .filter(m => m.role === 'assistant' && m.content)
      .map((m, i) => `**AI 追问 ${i + 1}：**\n${m.content}`)
      .join('\n\n')
    const content = [
      `# ${question.title}`,
      `> ${question.opening}`,
      `> 难度：${question.difficulty}★ · 风格：${question.style} · ${question.region === 'china' ? '🇨🇳 中国' : '🌍 世界'}`,
      '',
      '## 我的回答',
      qaText || '（未作答）',
      '',
      aiText ? '## AI 引导追问\n\n' + aiText : '',
      '## 评分',
      `总分 **${parsed.total}/100**`,
      SCORE_DIMS.map(d => `- ${d}：${parsed.dims[d] ?? '—'}`).join('\n'),
      '',
      parsed.summary ? `> ${parsed.summary}` : '',
      '',
      '[来源：💭 全问题 · AI 引导思考]',
    ]
      .filter(Boolean)
      .join('\n')

    const notes = useNotesStore.getState()
    const noteId = notes.addNote(
      { kind: 'era', id: 'questions' },
      { title: question.title, content },
    )
    setSavedNoteId(noteId)
    useQuestionsStore.getState().markDone(question.id, {
      totalScore: parsed.total,
      dims: parsed.dims,
      noteId,
    })
    onSaved()
  }

  const stopStreaming = () => streamControlRef.current?.abort()

  const userCount = messages.filter(m => m.role === 'user').length
  const allRoundsDone = roundRef.current >= question.maxRounds
  const canScore = userCount > 0

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-900/90 backdrop-blur p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-ink-800 rounded-lg border border-vermilion-500/40 shadow-2xl"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={question.title}
      >
        {/* 头部 */}
        <div className="px-5 py-3 border-b border-ink-600 flex items-center justify-between">
          <div>
            <div className="text-xl font-serif text-vermilion-300 flex items-center gap-2">
              <span>{question.icon}</span>
              {question.title}
            </div>
            <div className="text-xs text-ink-400 mt-1 flex items-center gap-2 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-ink-700 text-ink-300">{`${question.difficulty}★ 难度`}</span>
              <span className="px-1.5 py-0.5 rounded bg-ink-700 text-ink-300">{question.style}</span>
              <span className="px-1.5 py-0.5 rounded bg-ink-700 text-ink-300">{question.region === 'china' ? '🇨🇳 中国' : '🌍 世界'}</span>
              <span className="px-1.5 py-0.5 rounded bg-ink-700 text-ink-300">已答 {userCount}/{question.maxRounds} 轮</span>
            </div>
          </div>
          <button
            onClick={() => !streaming && onClose()}
            className="text-ink-300 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700"
            aria-label="关闭"
          >×</button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
          {/* 开场问题 */}
          <div className="rounded-lg p-3 bg-gradient-to-br from-vermilion-900/30 to-ink-700/30 border border-bronze-700/40">
            <div className="text-xs text-vermilion-300 mb-1">📜 开始思考</div>
            <div className="text-sm text-parchment-50 leading-relaxed whitespace-pre-wrap">{question.opening}</div>
            {question.hints.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-xs text-ink-300">切入点：</span>
                {question.hints.map((h, i) => (
                  <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-ink-800 text-ink-300 border border-ink-600">{h}</span>
                ))}
              </div>
            )}
          </div>

          {/* 对话记录 */}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-lg p-3 text-sm ${
                m.role === 'user' ? 'bg-vermilion-900/30 ml-8 border border-bronze-800/30' : 'bg-ink-700/40 mr-4'
              }`}
            >
              <div className="text-xs text-ink-300 mb-1">
                {m.role === 'user' ? '👤 你的回答' : '🤖 AI 追问'}
              </div>
              <div className="text-xs leading-relaxed whitespace-pre-wrap">
                {m.content || (streaming ? '▍' : '')}
              </div>
            </div>
          ))}

          {streaming && (
            <div className="rounded-lg p-3 bg-ink-700/40 mr-4 text-xs text-ink-400 animate-pulse">🤖 AI 正在思考并追问…</div>
          )}

          {phase === 'scoring' && !streaming && (
            <div className="rounded-lg p-3 bg-ink-700/40 mr-4 text-xs text-ink-400 animate-pulse">✍️ AI 正在逐维度评分…</div>
          )}

          {error && (
            <div className="rounded-lg bg-red-900/30 border border-red-700/40 p-2 text-[11px] text-red-300">
              ⚠ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入 / 评分区 */}
        <div className="border-t border-ink-600 p-4 bg-ink-900/30 space-y-3">
          {phase !== 'result' ? (
            <>
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (!allRoundsDone) sendAnswer()
                    }
                  }}
                  placeholder={roundRef.current === 0 ? '写下你对这道题的初步思考…' : `继续回应 AI 的追问…`}
                  rows={3}
                  className="flex-1 text-xs px-2 py-1.5 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50 resize-none"
                />
                <div className="flex flex-col gap-2">
                  {!allRoundsDone ? (
                    <button
                      onClick={sendAnswer}
                      disabled={!input.trim() || streaming}
                      className="px-4 py-1.5 text-xs bg-vermilion-500 hover:bg-vermilion-600 disabled:opacity-50 disabled:cursor-not-allowed text-parchment-50 rounded-lg"
                    >
                      回答
                    </button>
                  ) : null}
                  <button
                    onClick={finishAndScore}
                    disabled={streaming || !canScore}
                    className="px-3 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-parchment-50 rounded-lg"
                  >
                    ✨ 结束并评分
                  </button>
                </div>
              </div>
              {allRoundsDone && (
                <div className="text-xs text-emerald-300">已答满 {question.maxRounds} 轮，可点击「结束并评分」查看收获。</div>
              )}
              {streaming && (
                <button onClick={stopStreaming} className="text-xs text-red-400 hover:text-red-300">
                  ■ 停止生成
                </button>
              )}
            </>
          ) : (
            score && (
              <div className="p-3 rounded-lg border border-vermilion-500/40 bg-ink-900/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-3xl font-serif text-vermilion-300">
                      {score.total}<span className="text-sm text-ink-400">/100</span>
                    </div>
                    <div className="text-xs text-ink-400 mt-0.5">
                      {score.total >= 85 ? '👏 见解深刻' : score.total >= 70 ? '👍 思路不错' : score.total >= 55 ? '💡 有潜力' : '🌱 继续钻研'}
                    </div>
                  </div>
                  {savedNoteId && <div className="text-xs text-green-400">✓ 已保存到笔记</div>}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {SCORE_DIMS.map(d => {
                    const v = score.dims[d] ?? 0
                    return (
                      <div key={d}>
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="text-ink-400">{d}</span>
                          <span className="font-serif text-vermilion-300">{v}</span>
                        </div>
                        <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
                          <div className="h-full bg-bronze-500" style={{ width: `${v}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                {score.summary && (
                  <div className="text-xs text-ink-300 leading-relaxed whitespace-pre-wrap border-t border-ink-700 pt-2">{score.summary}</div>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs bg-vermilion-500 hover:bg-vermilion-600 text-parchment-50 rounded-lg"
                  >
                    完成
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.clipboard) navigator.clipboard.writeText(score.summary || `${score.total}/100`)
                    }}
                    className="px-4 py-2 text-xs border border-ink-600 text-ink-300 hover:text-parchment-50 hover:border-vermilion-500/40 rounded-lg"
                  >
                    📋 复制总评
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}