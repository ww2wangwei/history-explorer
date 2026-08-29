/**
 * QuizManager — 题库管理（添加 + AI 出题 + 审批）
 *
 * - 手动添加：单题表单
 * - AI 出题：选朝代/难度/数量 → 调 LLM API（复用 AIChatPanel 的 apiConfig）→ 解析为 QuizQuestion[] → 进入 pending
 * - 审批 pending：每题独立批准/拒绝/编辑
 * - 已审批题目列表 + 删除
 */
import { useEffect, useRef, useState } from 'react'
import { useQuizStore } from '@/store/useQuizStore'
import { useAIStore, type AIMessage } from '@/store/useAIStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import erasData from '@/data/eras.json'
import { callAIStreamWithSignal, buildQuizGenPrompt } from './quizAI'
import type { QuizQuestion, Difficulty } from '@/types/quiz'

type Era = (typeof erasData)[number]
const eras = erasData as Era[]

interface Props {
  open: boolean
  onClose: () => void
}

export default function QuizManager({ open, onClose }: Props) {
  const questions = useQuizStore(s => s.questions)
  const pending = useQuizStore(s => s.pending)
  const addQuestion = useQuizStore(s => s.addQuestion)
  const removeQuestion = useQuizStore(s => s.removeQuestion)
  const addPending = useQuizStore(s => s.addPending)
  const approvePending = useQuizStore(s => s.approvePending)
  const rejectPending = useQuizStore(s => s.rejectPending)
  const apiKey = useAIStore(s => s.apiKey)
  const apiConfig = useAIStore(s => s.apiConfig)

  const [mode, setMode] = useState<'list' | 'add' | 'ai'>('list')

  // 手动添加表单
  const [form, setForm] = useState({
    prompt: '',
    options: ['', '', '', ''],
    answer: 0,
    explanation: '',
    difficulty: 1 as Difficulty,
    eraId: '',
  })
  const [aiForm, setAiForm] = useState({
    eraId: 'tang',
    difficulty: 2 as Difficulty,
    count: 5,
  })
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const aiAbortRef = useRef<AbortController | null>(null)

  // 卸载/关闭时取消进行中的 AI 请求
  useEffect(() => {
    return () => { aiAbortRef.current?.abort() }
  }, [])

  // 切回 list 模式时取消进行中的 AI 请求（避免后台请求状态泄漏）
  const switchMode = (m: 'list' | 'add' | 'ai') => {
    if (m === 'list' && aiBusy) aiAbortRef.current?.abort()
    setMode(m)
  }

  if (!open) return null

  const handleAdd = () => {
    if (!form.prompt.trim() || form.options.some(o => !o.trim())) return
    addQuestion({
      prompt: form.prompt,
      options: form.options,
      answer: form.answer,
      explanation: form.explanation,
      difficulty: form.difficulty,
      eraId: form.eraId || undefined,
      category: 'memory',
      source: 'manual',
    })
    setForm({ prompt: '', options: ['', '', '', ''], answer: 0, explanation: '', difficulty: 1, eraId: '' })
    switchMode('list')
  }

  const handleAIGenerate = async () => {
    if (!apiKey) { setAiError('请先在 AI 面板中配置 API key'); return }
    // 重新点击时,取消上一次进行中的请求再开新一次
    if (aiBusy) aiAbortRef.current?.abort()
    setAiError(null)
    setAiBusy(true)
    const ctrl = new AbortController()
    aiAbortRef.current = ctrl
    try {
      const era = eras.find(e => e.id === aiForm.eraId)
      if (!era) { setAiError('朝代不存在'); setAiBusy(false); return }
      const prompt = buildQuizGenPrompt(era, aiForm.difficulty, aiForm.count)
      const messages: { role: 'system' | 'user'; content: string }[] = [
        { role: 'user', content: prompt },
      ]
      const collected: string[] = []
      await callAIStreamWithSignal(apiKey, apiConfig, messages, (delta) => {
        collected.push(delta)
      }, ctrl.signal)
      // 解析 JSON
      const text = collected.join('')
      const match = text.match(/\[[\s\S]*\]/)
      if (!match) { setAiError('AI 返回格式无法解析'); setAiBusy(false); return }
      const arr = JSON.parse(match[0])
      const qs: Omit<QuizQuestion, 'id' | 'createdAt' | 'source'>[] = arr.map((q: any) => ({
        prompt: q.prompt,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation || '',
        difficulty: aiForm.difficulty,
        eraId: era.id,
        category: q.category || 'analysis',
      }))
      addPending(qs)
      switchMode('list')
    } catch (e: any) {
      if (e.name === 'AbortError' || e.name === 'TimeoutError') return
      setAiError(e.message || 'AI 出题失败')
    } finally {
      setAiBusy(false)
      aiAbortRef.current = null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-vermilion-500/40 shadow-2xl">
        <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-ink-600 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <span className="font-serif text-vermilion-300">题库管理</span>
            <span className="text-xs text-ink-400">· {Object.keys(questions).length} 题 · {Object.keys(pending).length} 待审</span>
          </div>
          <div className="flex items-center gap-2">
            {mode !== 'list' && (
              <button onClick={() => switchMode('list')} className="text-xs text-ink-300 px-2 py-1 rounded-lg hover:bg-ink-700">← 返回</button>
            )}
            <button onClick={onClose} className="text-ink-300 hover:text-parchment-50 text-xl leading-none">×</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {mode === 'list' && (
            <>
              <div className="flex gap-2">
                <button onClick={() => switchMode('add')} className="flex-1 px-4 py-3 rounded-lg bg-vermilion-500 hover:bg-vermilion-600 text-parchment-50 text-sm">
                  + 手动添加题目
                </button>
                <button
                  onClick={() => switchMode('ai')}
                  disabled={!apiKey}
                  className="flex-1 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-parchment-50 text-sm"
                >
                  🤖 AI 自动出题 {!apiKey && '(需配置 API key)'}
                </button>
              </div>

              {Object.keys(pending).length > 0 && (
                <div>
                  <div className="text-xs text-amber-400 uppercase tracking-wider mb-2">⏳ 待审批 · {Object.keys(pending).length}</div>
                  <div className="space-y-2">
                    {Object.values(pending).map(q => (
                      <PendingItem key={q.id} q={q} onApprove={() => approvePending([q.id])} onReject={() => rejectPending([q.id])} />
                    ))}
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => approvePending(Object.keys(pending))} className="flex-1 px-3 py-2 rounded-lg bg-green-600/40 text-green-300 border border-green-500/40 text-sm">
                        ✓ 全部批准
                      </button>
                      <button onClick={() => rejectPending(Object.keys(pending))} className="flex-1 px-3 py-2 rounded-lg bg-red-600/40 text-red-300 border border-red-500/40 text-sm">
                        ✗ 全部拒绝
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-ink-300 uppercase tracking-wider mb-2">已批准题目 · {Object.keys(questions).length}</div>
                {Object.keys(questions).length === 0 ? (
                  <div className="text-center text-ink-300 text-sm py-4">题库为空，先添加题目</div>
                ) : (
                  <div className="space-y-1.5 max-h-96 overflow-y-auto">
                    {Object.values(questions).map(q => (
                      <div key={q.id} className="p-2 rounded-lg bg-ink-700/30 border border-ink-600/40 flex items-start gap-2">
                        <span className="text-xs text-ink-300 whitespace-nowrap pt-0.5">{q.difficulty}★</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-parchment-50 truncate">{q.prompt}</div>
                          <div className="text-xs text-ink-300 truncate">答：{['A', 'B', 'C', 'D'][q.answer]}. {q.options[q.answer]}</div>
                        </div>
                        <button onClick={() => removeQuestion(q.id)} className="text-xs text-ink-300 hover:text-red-400">删</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {mode === 'add' && (
            <div className="space-y-3">
              <div>
                <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">难度</div>
                <div className="flex gap-1">
                  {([1, 2, 3, 4, 5] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setForm({ ...form, difficulty: d })}
                      className={`flex-1 px-2 py-1 rounded-lg text-xs ${
                        form.difficulty === d
                          ? 'bg-vermilion-500/40 text-vermilion-300 border border-vermilion-500/60'
                          : 'bg-ink-700/40 text-ink-300 hover:bg-ink-700/60 border border-ink-600/40'
                      }`}
                    >
                      {d}★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">关联朝代（可选）</div>
                <select
                  value={form.eraId}
                  onChange={(e) => setForm({ ...form, eraId: e.target.value })}
                  className="w-full text-xs px-2 py-1 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50"
                >
                  <option value="">无</option>
                  {eras.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">题目</div>
                <textarea
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                  rows={3}
                  className="w-full text-xs px-2 py-1 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50"
                  placeholder="题目正文"
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-ink-300 uppercase tracking-wider">4 个选项（标记正确答案）</div>
                {form.options.map((opt, i) => (
                  <div key={i} className="flex gap-1">
                    <button
                      onClick={() => setForm({ ...form, answer: i })}
                      className={`px-2 py-1 rounded-lg text-xs ${
                        form.answer === i ? 'bg-green-600/40 text-green-300 border border-green-500/50' : 'bg-ink-700/40 text-ink-400 border border-ink-600/40'
                      }`}
                    >
                      {['A', 'B', 'C', 'D'][i]}
                    </button>
                    <input
                      value={opt}
                      onChange={(e) => {
                        const next = [...form.options]
                        next[i] = e.target.value
                        setForm({ ...form, options: next })
                      }}
                      className="flex-1 text-xs px-2 py-1 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">解释（可选）</div>
                <textarea
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  rows={2}
                  className="w-full text-xs px-2 py-1 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!form.prompt.trim() || form.options.some(o => !o.trim())}
                className="w-full px-4 py-2 rounded-lg bg-vermilion-500 hover:bg-vermilion-600 disabled:opacity-50 text-parchment-50"
              >
                ✓ 添加题目
              </button>
            </div>
          )}

          {mode === 'ai' && (
            <div className="space-y-3">
              <div>
                <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">朝代</div>
                <select
                  value={aiForm.eraId}
                  onChange={(e) => setAiForm({ ...aiForm, eraId: e.target.value })}
                  className="w-full text-xs px-2 py-1 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50"
                >
                  {eras.map(e => <option key={e.id} value={e.id}>{e.name}（{e.startYear}~{e.endYear}）</option>)}
                </select>
              </div>
              <div>
                <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">难度</div>
                <div className="flex gap-1">
                  {([1, 2, 3, 4, 5] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setAiForm({ ...aiForm, difficulty: d })}
                      className={`flex-1 px-2 py-1 rounded-lg text-xs ${
                        aiForm.difficulty === d
                          ? 'bg-vermilion-500/40 text-vermilion-300 border border-vermilion-500/60'
                          : 'bg-ink-700/40 text-ink-300 hover:bg-ink-700/60 border border-ink-600/40'
                      }`}
                    >
                      {d}★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-ink-300 uppercase tracking-wider mb-1">题目数量</div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={aiForm.count}
                  onChange={(e) => setAiForm({ ...aiForm, count: parseInt(e.target.value) || 5 })}
                  className="w-full text-xs px-2 py-1 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50"
                />
              </div>
              {aiError && <div className="text-xs text-red-400">⚠ {aiError}</div>}
              <button
                onClick={handleAIGenerate}
                disabled={aiBusy}
                className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-parchment-50"
              >
                {aiBusy ? '⏳ 生成中…' : '🤖 生成题目'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PendingItem({ q, onApprove, onReject }: { q: QuizQuestion; onApprove: () => void; onReject: () => void }) {
  return (
    <div className="p-3 rounded-lg bg-amber-900/10 border border-amber-700/30">
      <div className="text-xs text-parchment-50 mb-1">{q.prompt}</div>
      <div className="text-xs text-ink-300 mb-2">
        {q.difficulty}★ · {['A', 'B', 'C', 'D'][q.answer]}. {q.options[q.answer]}
      </div>
      <div className="flex gap-1">
        <button onClick={onApprove} className="flex-1 px-2 py-1 rounded-lg bg-green-600/30 text-green-300 border border-green-500/40 text-xs">✓ 批准</button>
        <button onClick={onReject} className="flex-1 px-2 py-1 rounded-lg bg-red-600/30 text-red-300 border border-red-500/40 text-xs">✗ 拒绝</button>
      </div>
    </div>
  )
}
