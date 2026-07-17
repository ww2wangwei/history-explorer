/**
 * FiguresOverview — 全人物全屏浏览页
 * 与 NotesOverview variant="page" 同模式
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import peopleData from '@/data/people.json'
import erasData from '@/data/eras.json'
import type { Era, FigureCategory, HistoricalFigure } from '@/types'
import { useLearningPathStore } from '@/store/useLearningPathStore'
import { useAIStore } from '@/store/useAIStore'
import { useAllLearningContexts } from '@/utils/useLearningContext'
import { enhancePersonaPrompt } from '@/utils/useLearningContext'
import PersonDetailDialog from './PersonDetailDialog'

const people = peopleData as HistoricalFigure[]
const eras = erasData as Era[]

interface Props {
  isActive: boolean
  onClose: () => void
  /** 从 Dashboard 直接选择某人物时传入 — 进入页面后立即打开该人物的详情弹窗 */
  initialPersonId?: string | null
}

type RegionFilter = 'all' | 'china' | 'world'
type CategoryFilter = 'all' | FigureCategory

const CATEGORY_LABEL: Record<FigureCategory, { icon: string; label: string; color: string }> = {
  politician: { icon: '👑', label: '政治家', color: '#c89a5b' },
  military:   { icon: '⚔️', label: '军事家', color: '#b85450' },
  thinker:    { icon: '📚', label: '思想家', color: '#9b7eb6' },
  literati:   { icon: '✒️', label: '文人/艺术家', color: '#5b9bc8' },
  scientist:  { icon: '🔬', label: '科学家', color: '#5bc89a' },
  reformer:   { icon: '⚖️', label: '改革家', color: '#c8a85b' },
  explorer:   { icon: '🚢', label: '探险家', color: '#5b8fc8' },
  religious:  { icon: '☸️', label: '宗教人物', color: '#c89a8a' },
}

export default function FiguresOverview({ isActive, onClose, initialPersonId }: Props) {
  const [region, setRegion] = useState<RegionFilter>('all')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [query, setQuery] = useState('')
  const [selectedPerson, setSelectedPerson] = useState<HistoricalFigure | null>(null)

  const markVisited = useLearningPathStore(s => s.markFigureVisited)
  const setContext = useAIStore(s => s.setContext)
  const setPersonaPrompt = useAIStore(s => s.setPersonaPrompt)
  const newThread = useAIStore(s => s.newThread)
  const openPanel = useAIStore(s => s.openPanel)
  const visitedFigureIds = useLearningPathStore(s => s.progressByPath.allFigures.visitedFigureIds) ?? []

  // 从 Dashboard 直接跳过来时，立即打开该人物详情 + 标记已了解
  // 用 ref 记录"已处理过的 initialPersonId" — 只触发一次（否则 store action 引用变化会反复 setSelectedPerson，导致关闭弹窗后又自动弹出）
  const handledInitialIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!isActive || !initialPersonId) return
    if (handledInitialIdRef.current === initialPersonId) return
    const person = people.find(p => p.id === initialPersonId)
    if (person) {
      handledInitialIdRef.current = initialPersonId
      setSelectedPerson(person)
      markVisited(person.id)
    }
  }, [isActive, initialPersonId, markVisited])

  // ESC 关闭页面（不关闭弹窗）
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPerson) {
          setSelectedPerson(null) // 优先关弹窗
        } else {
          onClose()
        }
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, selectedPerson, onClose])

  if (!isActive) return null

  // 筛选 + 搜索
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return people.filter(p => {
      // 区域
      if (region === 'china') {
        const isChinese = p.eraIds.some(eid => eras.find(e => e.id === eid)?.region === 'china')
        if (!isChinese) return false
      } else if (region === 'world') {
        const isWorld = p.eraIds.some(eid => {
          const e = eras.find(er => er.id === eid)
          return e && e.region !== 'china'
        })
        if (!isWorld) return false
      }
      // 分类（用数据里的 category 字段，不再用正则推断）
      if (category !== 'all' && p.category !== category) return false
      // 搜索
      if (q) {
        const text = (p.name + ' ' + p.role + ' ' + p.description).toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  }, [region, category, query])

  const handlePersonClick = (person: HistoricalFigure) => {
    setSelectedPerson(person)
    markVisited(person.id)
  }

  // 一次性为所有人物建好学习上下文 map（避免在回调里调 hook）
  const allContexts = useAllLearningContexts()

  const handleChat = (person: HistoricalFigure) => {
    // 选第一个 eraId 作为 context（用于在 AI 面板显示"当前朝代"）
    const firstEraId = person.eraIds[0] ?? null
    setContext(firstEraId, null, person.id)
    // 拼上该人物相关的学习上下文
    const contextString = allContexts[person.id]?.contextString ?? ''
    // 基础 persona + 学习上下文 + 角色扮演守则（统一追加"第一人称/不编造/知识截止"声明）
    const basePersona = person.personaPrompt || `你是${person.name}，${person.role}。${person.description}`
    const persona = enhancePersonaPrompt(basePersona + contextString, person.name)
    setPersonaPrompt(persona)
    newThread(`与 ${person.name} 对话`)
    openPanel()
    setSelectedPerson(null) // 关闭弹窗
  }

  const visitedCount = visitedFigureIds.length
  const total = people.length

  return (
    <div className="w-full h-full bg-ink-900 overflow-y-auto">
      {/* 头部 */}
      <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-bronze-500/40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-serif text-bronze-300">👥 全人物</h2>
              <p className="text-xs text-ink-500 mt-1">
                {visitedCount >= total
                  ? `🎉 你已了解所有 ${total} 位历史人物！`
                  : `已了解 ${visitedCount} / ${total} 位历史人物`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-ink-700"
              title="返回 Dashboard (ESC)"
            >
              ×
            </button>
          </div>

          {/* 筛选条 */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 区域 */}
            <div className="flex rounded bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
              {(['all', 'china', 'world'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-3 py-1.5 transition-colors ${
                    region === r
                      ? 'bg-bronze-600/40 text-bronze-300'
                      : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
                  }`}
                >
                  {r === 'all' ? '全部' : r === 'china' ? '🇨🇳 中国' : '🌍 世界'}
                </button>
              ))}
            </div>

            {/* 分类 — chips 风格（可显示每个分类下的人数） */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setCategory('all')}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  category === 'all'
                    ? 'bg-bronze-600/40 text-bronze-300 border-bronze-500/60'
                    : 'bg-ink-700/60 text-ink-400 border-ink-600 hover:text-parchment-50'
                }`}
              >
                全部 <span className="text-ink-500 ml-1">({people.length})</span>
              </button>
              {(Object.keys(CATEGORY_LABEL) as FigureCategory[]).map(cat => {
                const count = people.filter(p => p.category === cat).length
                if (count === 0) return null
                const meta = CATEGORY_LABEL[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                      category === cat
                        ? 'border-bronze-500/60'
                        : 'bg-ink-700/60 text-ink-400 border-ink-600 hover:text-parchment-50'
                    }`}
                    style={category === cat ? { background: meta.color + '30', color: meta.color } : undefined}
                    title={meta.label}
                  >
                    {meta.icon} {meta.label} <span className="text-ink-500 ml-1">({count})</span>
                  </button>
                )
              })}
            </div>

            {/* 搜索 */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索名字/角色/简介..."
              className="flex-1 min-w-[180px] text-xs px-3 py-1.5 bg-ink-700/60 border border-ink-600 rounded text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500"
            />
          </div>
        </div>
      </div>

      {/* 卡片网格 */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center text-ink-500 py-12">未找到匹配的人物</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(p => (
              <PersonCard
                key={p.id}
                person={p}
                visited={visitedFigureIds.includes(p.id)}
                onClick={() => handlePersonClick(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedPerson && (
        <PersonDetailDialog
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onChat={() => handleChat(selectedPerson)}
        />
      )}
    </div>
  )
}

function PersonCard({ person, visited, onClick }: {
  person: HistoricalFigure
  visited: boolean
  onClick: () => void
}) {
  const eraNames = person.eraIds
    .map(eid => eras.find(e => e.id === eid))
    .filter((e): e is Era => Boolean(e))
  const catMeta = CATEGORY_LABEL[person.category]

  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-lg bg-ink-800/60 border border-ink-700 hover:border-bronze-500/60 hover:bg-ink-700/60 transition-all relative group"
    >
      {visited && (
        <span className="absolute top-2 right-2 text-green-400 text-sm" title="已了解">✓</span>
      )}
      {/* 分类小徽章 — 卡片左上角 */}
      <span
        className="absolute top-2 left-2 text-[9px] px-1.5 py-0.5 rounded font-serif"
        style={{ background: catMeta.color + '20', color: catMeta.color }}
        title={catMeta.label}
      >
        {catMeta.icon}
      </span>
      <div className="text-4xl mb-2 mt-3">{person.emoji || '👤'}</div>
      <div className="text-sm font-serif text-parchment-50 truncate">{person.name}</div>
      <div className="text-[10px] text-ink-400 mt-1 line-clamp-2 min-h-[2.5em]">{person.role}</div>
      <div className="flex flex-wrap gap-1 mt-2">
        {eraNames.slice(0, 2).map(e => (
          <span
            key={e.id}
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: e.color + '20', color: e.color }}
          >
            {e.name}
          </span>
        ))}
        {eraNames.length > 2 && (
          <span className="text-[9px] text-ink-500">+{eraNames.length - 2}</span>
        )}
      </div>
    </button>
  )
}
