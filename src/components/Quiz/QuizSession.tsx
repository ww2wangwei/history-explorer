/**
 * QuizSession — 测试答题 Modal
 *
 * 流程：
 * - 点"开始" → 选难度（1-5 星）+ 题数（10/20/30）→ 随机出题 → 进入答题
 * - 答完一题：立即高亮对错 + 显示解释（可关闭）
 * - 全部答完：结果页（正确数/正确率/分难度统计） + 错题列表
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuizStore } from '@/store/useQuizStore'
import erasData from '@/data/eras.json'
import type { QuizQuestion, Difficulty, QuizSessionResult } from '@/types/quiz'
import { audioEngine } from '@/utils/audioEngine'

type Era = (typeof erasData)[number]
const eras = erasData as Era[]
const STORAGE_KEY = 'history-explorer-quiz:v1'

interface Props {
  open: boolean
  onClose: () => void
  onManage: () => void   // 打开管理面板
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: '1★ 基础事实', 2: '2★ 多事实', 3: '3★ 时间轴', 4: '4★ 因果分析', 5: '5★ 跨朝代综合',
}

export default function QuizSession({ open, onClose, onManage }: Props) {
  const questions = useQuizStore(s => s.questions)
  const recordAttempt = useQuizStore(s => s.recordAttempt)
  const recordSession = useQuizStore(s => s.recordSession)

  // 阶段: 'config' | 'playing' | 'result'
  const [phase, setPhase] = useState<'config' | 'playing' | 'result'>('config')
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5 | 'mixed'>(3)
  const [count, setCount] = useState<number>(10)

  // 答题状态
  const [queue, setQueue] = useState<QuizQuestion[]>([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplain, setShowExplain] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [byDiff, setByDiff] = useState<Record<Difficulty, { correct: number; total: number }>>({ 1: { correct: 0, total: 0 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 }, 4: { correct: 0, total: 0 }, 5: { correct: 0, total: 0 } })
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const startedAtRef = useRef(0)
  const questionStartRef = useRef(0)

  // 重置状态（每次打开 modal）
  useEffect(() => {
    if (open) {
      setPhase('config')
      setSelected(null)
      setShowExplain(false)
      setCorrectCount(0)
      setByDiff({ 1: { correct: 0, total: 0 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 }, 4: { correct: 0, total: 0 }, 5: { correct: 0, total: 0 } })
      setWrongIds([])
    }
  }, [open])

  // 随机出题
  const startSession = () => {
    audioEngine.playClick()
    const allQs = Object.values(questions)
    if (allQs.length === 0) return
    const pool = difficulty === 'mixed' ? allQs : allQs.filter(q => q.difficulty === difficulty)
    if (pool.length === 0) return
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))
    setQueue(selected)
    setIdx(0)
    setCorrectCount(0)
    setByDiff({ 1: { correct: 0, total: 0 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 }, 4: { correct: 0, total: 0 }, 5: { correct: 0, total: 0 } })
    setWrongIds([])
    setPhase('playing')
    startedAtRef.current = Date.now()
    questionStartRef.current = Date.now()
  }

  const currentQ = queue[idx]
  const handleSelect = (i: number) => {
    if (selected !== null) return   // 已答
    setSelected(i)
    setShowExplain(true)
    const isCorrect = i === currentQ.answer
    audioEngine.playToast(isCorrect ? 'success' : 'error')
    const ms = Date.now() - questionStartRef.current
    recordAttempt({
      questionId: currentQ.id,
      correct: isCorrect,
      userAnswer: i,
      ms,
      at: Date.now(),
    })
    if (isCorrect) setCorrectCount(c => c + 1)
    else setWrongIds(w => [...w, currentQ.id])
    setByDiff(b => ({
      ...b,
      [currentQ.difficulty]: {
        correct: b[currentQ.difficulty].correct + (isCorrect ? 1 : 0),
        total: b[currentQ.difficulty].total + 1,
      },
    }))
  }

  const handleNext = () => {
    if (idx + 1 < queue.length) {
      audioEngine.playClick()
      setIdx(idx + 1)
      setSelected(null)
      setShowExplain(false)
      questionStartRef.current = Date.now()
    } else {
      // 完成
      const result: QuizSessionResult = {
        startedAt: startedAtRef.current,
        finishedAt: Date.now(),
        total: queue.length,
        correct: correctCount + (selected === currentQ.answer ? 1 : 0),
        questionIds: queue.map(q => q.id),
        byDifficulty: byDiff,
      }
      recordSession(result)
      audioEngine.playQuizComplete()
      setPhase('result')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-bronze-500/40 shadow-2xl">
        <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-ink-600 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <span className="font-serif text-bronze-300">历史测试</span>
            {phase === 'playing' && queue.length > 0 && (
              <span className="text-xs text-ink-400">· {idx + 1} / {queue.length}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onManage} className="text-xs text-ink-400 hover:text-bronze-300 px-2 py-1 rounded-lg hover:bg-ink-700">
              管理
            </button>
            <button onClick={onClose} className="text-ink-500 hover:text-parchment-50 text-xl leading-none">×</button>
          </div>
        </div>

        <div className="p-6">
          {/* 配置阶段 */}
          {phase === 'config' && (
            <ConfigPanel
              onStart={startSession}
              questionCount={Object.keys(questions).length}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              count={count}
              setCount={setCount}
            />
          )}

          {/* 答题阶段 */}
          {phase === 'playing' && currentQ && (
            <PlayingPanel
              q={currentQ}
              selected={selected}
              showExplain={showExplain}
              handleSelect={handleSelect}
              handleNext={handleNext}
              isLast={idx + 1 === queue.length}
              currentNumber={idx + 1}
              totalNumber={queue.length}
            />
          )}

          {/* 结果阶段 */}
          {phase === 'result' && (
            <ResultPanel
              total={queue.length}
              correct={correctCount}
              byDiff={byDiff}
              wrongIds={wrongIds}
              questions={questions}
              onClose={onClose}
              onRestart={() => {
                setPhase('config')
                setSelected(null)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function ConfigPanel({ onStart, questionCount, difficulty, setDifficulty, count, setCount }: {
  onStart: () => void
  questionCount: number
  difficulty: 1 | 2 | 3 | 4 | 5 | 'mixed'
  setDifficulty: (d: 1 | 2 | 3 | 4 | 5 | 'mixed') => void
  count: number
  setCount: (n: number) => void
}) {
  return (
    <div className="space-y-4">
      {questionCount === 0 ? (
        <div className="text-center text-ink-400 py-8">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-sm">题库为空</div>
          <div className="text-xs mt-1 text-ink-500">
            点击右上"管理"添加题目，或用 AI 自动出题
          </div>
        </div>
      ) : (
        <>
          <div>
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">难度等级</div>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3, 4, 5, 'mixed'] as const).map(d => (
                <button
                  key={String(d)}
                  onClick={() => setDifficulty(d as any)}
                  className={`px-3 py-2 rounded-lg text-xs ${
                    difficulty === d
                      ? 'bg-bronze-600/40 text-bronze-300 border border-bronze-500/60'
                      : 'bg-ink-700/40 text-ink-300 hover:bg-ink-700/60 border border-ink-600/40'
                  }`}
                >
                  {d === 'mixed' ? '🎲 混合' : DIFFICULTY_LABELS[d as Difficulty]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">题目数量</div>
            <div className="flex gap-2">
              {[5, 10, 20, 30].map(n => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                    count === n
                      ? 'bg-bronze-600/40 text-bronze-300 border border-bronze-500/60'
                      : 'bg-ink-700/40 text-ink-300 hover:bg-ink-700/60 border border-ink-600/40'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-ink-400 text-center">
            题库中现有 <span className="text-bronze-400">{questionCount}</span> 道题
          </div>
          <button
            onClick={onStart}
            disabled={questionCount === 0}
            className="w-full px-4 py-3 rounded-lg bg-bronze-600 hover:bg-bronze-500 disabled:opacity-50 disabled:cursor-not-allowed text-parchment-50 font-medium"
          >
            🚀 开始测试
          </button>
        </>
      )}
    </div>
  )
}

function PlayingPanel({ q, selected, showExplain, handleSelect, handleNext, isLast, currentNumber, totalNumber }: {
  q: QuizQuestion
  selected: number | null
  showExplain: boolean
  handleSelect: (i: number) => void
  handleNext: () => void
  isLast: boolean
  currentNumber: number
  totalNumber: number
}) {
  const era = q.eraId ? eras.find(e => e.id === q.eraId) : null
  const isCorrect = selected === q.answer
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-ink-500">
        <span>{DIFFICULTY_LABELS[q.difficulty]}</span>
        {era && (
          <>
            <span>·</span>
            <span style={{ color: era.color }}>{era.name}</span>
          </>
        )}
        <span className="ml-auto">{currentNumber} / {totalNumber}</span>
      </div>
      <div className="p-4 rounded-lg bg-ink-700/40 border border-ink-600/40 text-sm text-parchment-50 leading-relaxed">
        {q.prompt}
      </div>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let cls = 'bg-ink-700/40 border border-ink-600/40 hover:bg-ink-700/60'
          if (selected !== null) {
            if (i === q.answer) cls = 'bg-green-900/30 border border-green-500/50'
            else if (i === selected) cls = 'bg-red-900/30 border border-red-500/50'
            else cls = 'bg-ink-700/20 border border-ink-600/30 opacity-60'
          }
          return (
            <button
              key={i}
              disabled={selected !== null}
              onClick={() => handleSelect(i)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${cls} disabled:cursor-default`}
            >
              <span className="inline-block w-6 text-ink-500 mr-2">{['A', 'B', 'C', 'D'][i]}.</span>
              {opt}
            </button>
          )
        })}
      </div>
      {showExplain && (
        <div className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-900/20 border-green-500/40' : 'bg-red-900/20 border-red-500/40'}`}>
          <div className={`text-xs uppercase tracking-wider mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✓ 正确' : '✗ 错误'} · 正确答案是 {['A', 'B', 'C', 'D'][q.answer]}
          </div>
          <div className="text-xs text-ink-300 leading-relaxed">{q.explanation}</div>
        </div>
      )}
      {selected !== null && (
        <button
          onClick={handleNext}
          className="w-full px-4 py-3 rounded-lg bg-bronze-600 hover:bg-bronze-500 text-parchment-50 font-medium"
        >
          {isLast ? '查看结果' : '下一题 →'}
        </button>
      )}
    </div>
  )
}

function ResultPanel({ total, correct, byDiff, wrongIds, questions, onClose, onRestart }: {
  total: number
  correct: number
  byDiff: Record<Difficulty, { correct: number; total: number }>
  wrongIds: string[]
  questions: Record<string, QuizQuestion>
  onClose: () => void
  onRestart: () => void
}) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">{accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}</div>
        <div className="text-3xl font-serif text-bronze-300">{correct} / {total}</div>
        <div className="text-sm text-ink-400">正确率 {accuracy}%</div>
      </div>

      <div className="space-y-1.5">
        <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">分难度</div>
        {([1, 2, 3, 4, 5] as const).map(d => {
          const stat = byDiff[d]
          if (!stat || stat.total === 0) return null
          const pct = Math.round((stat.correct / stat.total) * 100)
          return (
            <div key={d} className="flex items-center gap-2 text-[11px]">
              <span className="w-16 text-ink-400">{DIFFICULTY_LABELS[d]}</span>
              <div className="flex-1 h-2 bg-ink-700 rounded-lg overflow-hidden">
                <div className={`h-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-bronze-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="w-12 text-right text-ink-300 tabular-nums">{stat.correct}/{stat.total}</span>
            </div>
          )
        })}
      </div>

      {wrongIds.length > 0 && (
        <div>
          <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">错题（点击再次学习）</div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {wrongIds.map(id => {
              const q = questions[id]
              if (!q) return null
              return (
                <div key={id} className="p-2 rounded-lg bg-red-900/10 border border-red-700/30 text-[11px]">
                  <div className="text-parchment-50 mb-1">{q.prompt}</div>
                  <div className="text-ink-500">正确：{['A', 'B', 'C', 'D'][q.answer]}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onRestart} className="flex-1 px-4 py-3 rounded-lg bg-ink-700 hover:bg-ink-600 text-parchment-50">
          再来一次
        </button>
        <button onClick={onClose} className="flex-1 px-4 py-3 rounded-lg bg-bronze-600 hover:bg-bronze-500 text-parchment-50">
          完成
        </button>
      </div>
    </div>
  )
}
