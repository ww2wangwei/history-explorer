/**
 * QuestionsOverview — 「全问题」大厅
 *
 * - 展示内置+AI 生成的全部问题，支持按难度/风格/地域筛选
 * - 显示每题作答状态与得分
 * - 提供「➕ AI 出题」生成新题并入库
 */
import { useEffect, useMemo, useState } from 'react'
import { useAIStore } from '@/store/useAIStore'
import { useQuestionsStore } from '@/store/useQuestionsStore'
import { audioEngine } from '@/utils/audioEngine'
import { streamAI } from '@/utils/aiStream'
import { buildGeneratePrompt } from './questionPrompt'
import { parseGeneratedQuestion, iconForStyle } from './parseAI'
import { cleanAI } from './cleanAI'
import QuestionSession from './QuestionSession'
import type { Question, QuestionDifficulty } from '@/types/questions'
import builtinQuestions from '@/data/questions.json'

const builtin = builtinQuestions as Question[]

interface Props {
  isActive: boolean
  onClose: () => void
}

type StyleFilter = 'all' | Question['style']
type RegionFilter = 'all' | Question['region']
type DiffFilter = 'all' | QuestionDifficulty

export default function QuestionsOverview({ isActive, onClose }: Props) {
  const progress = useQuestionsStore(s => s.progress)
  const customQuestions = useQuestionsStore(s => s.customQuestions)
  const addCustomQuestion = useQuestionsStore(s => s.addCustomQuestion)
  const deleteCustomQuestion = useQuestionsStore(s => s.deleteCustomQuestion)
  const apiKey = useAIStore(s => s.apiKey)

  const [styleFilter, setStyleFilter] = useState<StyleFilter>('all')
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('all')
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('all')
  const [active, setActive] = useState<Question | null>(null)
  const [genOpen, setGenOpen] = useState(false)

  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, onClose])

  const allQuestions = useMemo(() => [...builtin, ...customQuestions], [customQuestions])

  const filtered = useMemo(
    () =>
      allQuestions.filter(q => {
        if (styleFilter !== 'all' && q.style !== styleFilter) return false
        if (regionFilter !== 'all' && q.region !== regionFilter) return false
        if (diffFilter !== 'all' && q.difficulty !== diffFilter) return false
        return true
      }),
    [allQuestions, styleFilter, regionFilter, diffFilter],
  )

  const doneCount = Object.values(progress).filter(p => p.status === 'done').length
  const avgScore = useMemo(() => {
    const done = Object.values(progress).filter(p => p.status === 'done')
    if (done.length === 0) return 0
    return Math.round(done.reduce((s, p) => s + p.totalScore, 0) / done.length)
  }, [progress])

  if (!isActive) return null

  return (
    <div className="w-full h-full bg-gradient-to-b from-ink-900 via-ink-900 to-ink-800 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-serif text-vermilion-300 mb-1">💭 全问题</h1>
            <p className="text-sm text-ink-400">
              数十道历史思考题，用 AI 一步步陪你深挖。{allQuestions.length} 道题 · 少一个标准答案，多一层自己的见解。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center px-3 py-1 rounded-lg bg-ink-800/60 border border-ink-600 text-xs">
              <span className="text-ink-400">已作答</span>
              <span className="text-base font-serif text-vermilion-300">{doneCount}/{allQuestions.length}</span>
            </div>
            <div className="flex flex-col items-center px-3 py-1 rounded-lg bg-ink-800/60 border border-ink-600 text-xs">
              <span className="text-ink-400">平均分</span>
              <span className="text-base font-serif text-emerald-400">{avgScore || '—'}</span>
            </div>
            <button
              onClick={onClose}
              disabled={!!active || genOpen}
              className="text-ink-300 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700"
              title="返回 (ESC)"
              aria-label="返回"
            >×</button>
          </div>
        </div>

        {/* AI 出题入口 + 提示 */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setGenOpen(true)}
            className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-purple-700/60 to-bronze-700/40 border border-purple-500/50 text-purple-200 hover:border-purple-400 transition-colors"
          >
            ✨ AI 出题
          </button>
          {!apiKey && (
            <span className="text-xs text-amber-300/80">⚠ 尚未配置 API key，AI 出题与 AI 追问、评分功能不可用（可在 AI 浮动面板「⚙ 设置」中配置）。</span>
          )}
        </div>

        {/* 筛选条 */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <FilterTabs
            options={[['all', '全部难度'], [1, '1★ 基础'], [2, '2★ 进阶'], [3, '3★ 深度']] as [any, string][]}
            value={diffFilter}
            onChange={v => setDiffFilter(v)}
          />
          <FilterTabs
            options={([['all', '全部风格'], ['趣味性', '🎭 趣味性'], ['启发性', '💡 启发性'], ['思考性', '🧭 思考性']] as [any, string][])}
            value={styleFilter}
            onChange={v => setStyleFilter(v)}
          />
          <FilterTabs
            options={[['all', '全部地域'], ['china', '🇨🇳 中国'], ['world', '🌍 世界']] as [any, string][]}
            value={regionFilter}
            onChange={v => setRegionFilter(v)}
          />
          <span className="text-xs text-ink-300 ml-auto">{filtered.length} / {allQuestions.length} 道题</span>
        </div>

        {/* 题目列表 */}
        {filtered.length === 0 ? (
          <div className="text-center text-ink-300 py-12">没有匹配的题目，换一个筛选条件试试。</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(q => {
              const p = progress[q.id]
              const done = p?.status === 'done'
              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-lg border-2 transition-all flex items-start gap-4 ${
                    done ? 'border-emerald-700/40 hover:border-emerald-500/70' : 'border-ink-600 hover:border-vermilion-500/40/80'
                  }`}
                  style={{ background: `linear-gradient(135deg, ${done ? '#14532d' : '#3b2f16'}22 0%, transparent 55%)` }}
                >
                  <div className="text-3xl flex-shrink-0">{q.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-lg font-serif text-parchment-50">{q.title}</h2>
                      {q.aiGenerated && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-800/60 text-purple-200 border border-purple-600/50">🤖 AI 题</span>
                      )}
                      {done && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-800/60 text-emerald-200 border border-emerald-600/50">✓ 已答 · {p.totalScore}分</span>}
                    </div>
                    <div className="text-xs text-ink-400 mb-2 space-x-2">
                      <span>{`${q.difficulty}★`}</span>
                      <span>· {q.style}</span>
                      <span>· {q.region === 'china' ? '🇨🇳 中国' : '🌍 世界'}</span>
                      <span>· 约 {q.maxRounds} 轮追问</span>
                    </div>
                    <p className="text-sm text-ink-300 leading-relaxed line-clamp-2 mb-3">{q.opening}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          audioEngine.playClick()
                          setActive(q)
                        }}
                        className="px-4 py-1.5 text-xs rounded-lg transition-colors"
                        style={{ background: done ? '#0f6b43' : '#c89a5b', color: '#0f0e0c' }}
                      >
                        {done ? '🔁 再答一次' : '💬 开始作答'}
                      </button>
                      {q.aiGenerated && (
                        <button
                          onClick={() => {
                            if (confirm('删除这道 AI 生成的问题及其作答记录？')) {
                              audioEngine.playNoteDelete()
                              deleteCustomQuestion(q.id)
                            }
                          }}
                          className="text-xs text-ink-400 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-900/30"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 玩法说明 */}
        <div className="mt-8 p-4 rounded-lg bg-ink-800/60 border border-ink-700 text-sm text-ink-400 space-y-1">
          <div className="text-vermilion-300 font-serif mb-2">💡 玩法说明</div>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>选一道题「开始作答」，先写下你的初步想法</li>
            <li>AI 会像苏格拉底一样，顺着你的回答连环追问，帮你一步步想深</li>
            <li>每道题作答满约 {2}~{4} 轮后，点击「✨ 结束并评分」，AI 会从史实准确/思考深度/论证逻辑/发散视角四个维度为你打分</li>
            <li>每次作答结束会自动保存一条完整笔记到「我的笔记」，方便回看</li>
            <li>用「✨ AI 出题」自定义生成新题并加入题库</li>
          </ul>
        </div>
      </div>

      {/* AI 出题浮层 */}
      {genOpen && (
        <GenerateQuestionModal
          apiKey={!!apiKey}
          onClose={() => setGenOpen(false)}
          onGenerate={async (opts) => {
            const q = await generateQuestion(opts)
            if (q) {
              addCustomQuestion(q)
              audioEngine.playNoteSave()
              return q
            }
            return null
          }}
        />
      )}

      {/* 答题浮层 */}
      {active && (
        <QuestionSession
          question={active}
          onClose={() => setActive(null)}
          onSaved={() => setActive(null)}
        />
      )}
    </div>
  )
}

// ===== 通用筛选 Tab =====
function FilterTabs({ options, value, onChange }: {
  options: [any, string][]
  value: any
  onChange: (v: any) => void
}) {
  return (
    <div className="flex rounded-lg bg-ink-800/60 border border-ink-600 overflow-hidden text-xs">
      {options.map(([v, label]) => (
        <button
          key={String(v)}
          onClick={() => onChange(v)}
          className={`px-3 py-1.5 transition-colors whitespace-nowrap ${
            value === v ? 'bg-vermilion-700/40 text-vermilion-200' : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ===== AI 出题浮层 =====
function GenerateQuestionModal({ apiKey, onClose, onGenerate }: {
  apiKey: boolean
  onClose: () => void
  onGenerate: (opts: { topic: string; difficulty: string; style: string }) => Promise<Question | null>
}) {
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [style, setStyle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Question | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [onClose])

  const run = async () => {
    if (!apiKey) { setError('请先在 AI 面板配置 API key'); return }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const q = await onGenerate({ topic: topic.trim(), difficulty, style })
      if (q) {
        setResult(q)
        setTimeout(() => onClose(), 1200)
      } else {
        setError('AI 生成的题目无法解析，请调整题材后重试。')
      }
    } catch (e: any) {
      setError(e?.message || 'AI 出题失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink-900/90 backdrop-blur p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-ink-800 rounded-lg border border-purple-600/40 shadow-2xl p-5"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="AI 出题"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-serif text-purple-300">✨ AI 出题</h2>
          <button onClick={onClose} className="text-ink-300 hover:text-parchment-50 text-lg leading-none" aria-label="关闭">×</button>
        </div>

        <label className="block text-xs text-ink-400 mb-1">题材方向（可留空，例如：唐末藩镇 / 罗马衰亡 / 工业革命）</label>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="想围绕什么历史题材出题？"
          className="w-full text-xs px-2 py-1.5 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50 mb-3"
        />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-ink-400 mb-1">难度</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="w-full text-xs px-2 py-1.5 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50"
            >
              <option value="">随机</option>
              <option value="1">1★ 基础认知</option>
              <option value="2">2★ 进阶分析</option>
              <option value="3">3★ 深度思辨</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-400 mb-1">风格</label>
            <select
              value={style}
              onChange={e => setStyle(e.target.value)}
              className="w-full text-xs px-2 py-1.5 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50"
            >
              <option value="">随机</option>
              <option value="趣味性">🎭 趣味性</option>
              <option value="启发性">💡 启发性</option>
              <option value="思考性">🧭 思考性</option>
            </select>
          </div>
        </div>

        {error && <div className="text-[11px] text-red-300 mb-2">⚠ {error}</div>}
        {result && <div className="text-[11px] text-emerald-300 mb-2">✓ 已加入题库：{result.title}</div>}

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 text-xs border border-ink-600 text-ink-300 rounded-lg hover:border-ink-500">取消</button>
          <button
            onClick={run}
            disabled={loading}
            className="px-4 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-parchment-50 rounded-lg"
          >
            {loading ? '⏳ 生成中…' : '生成题目'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ===== 调用 AI 生成题目 =====
async function generateQuestion(opts: { topic: string; difficulty: string; style: string }) {
  const store = useAIStore.getState()
  if (!store.apiKey) return null
  const prompt = buildGeneratePrompt({
    topic: opts.topic || undefined,
    difficulty: opts.difficulty ? Number(opts.difficulty) : undefined,
    style: opts.style || undefined,
  })
  let full = ''
  const handle = streamAI({
    protocol: store.apiConfig.protocol,
    apiKey: store.apiKey,
    baseUrl: store.apiConfig.baseUrl,
    model: store.apiConfig.model,
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 700,
    disableThinking: store.apiConfig.disableThinking,
    onDelta: (d) => { full += d },
  })
  await handle.promise
  const parsed = parseGeneratedQuestion(cleanAI(full))
  if (!parsed) return null
  parsed.icon = parsed.icon || iconForStyle(parsed.style)
  return parsed
}