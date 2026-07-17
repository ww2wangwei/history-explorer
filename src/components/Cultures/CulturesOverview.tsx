/**
 * CulturesOverview — 全文化全屏浏览页
 * 数据源：people.json 中 category in ['thinker', 'literati', 'religious'] 的人物
 * 完全复用 FiguresOverview 的模式 + PersonDetailDialog
 */
import { useEffect, useMemo, useState } from 'react'
import peopleData from '@/data/people.json'
import erasData from '@/data/eras.json'
import { useLearningPathStore } from '@/store/useLearningPathStore'
import { useAIStore } from '@/store/useAIStore'
import { useAllLearningContexts } from '@/utils/useLearningContext'
import { enhancePersonaPrompt } from '@/utils/useLearningContext'
import PersonDetailDialog from '@/components/Figures/PersonDetailDialog'
import type { Era, HistoricalFigure } from '@/types'

const people = peopleData as HistoricalFigure[]
const eras = erasData as Era[]

// 全文化只展示这些分类的人物
const CULTURE_CATEGORIES: HistoricalFigure['category'][] = ['thinker', 'literati', 'religious']
const culturePeople = people.filter(p => p.category && CULTURE_CATEGORIES.includes(p.category))

interface Props {
  isActive: boolean
  onClose: () => void
}

type RegionFilter = 'all' | 'china' | 'world'

export default function CulturesOverview({ isActive, onClose }: Props) {
  const [region, setRegion] = useState<RegionFilter>('all')
  const [category, setCategory] = useState<'all' | 'thinker' | 'literati' | 'religious'>('all')
  const [query, setQuery] = useState('')
  const [selectedPerson, setSelectedPerson] = useState<HistoricalFigure | null>(null)

  const setContext = useAIStore(s => s.setContext)
  const setPersonaPrompt = useAIStore(s => s.setPersonaPrompt)
  const newThread = useAIStore(s => s.newThread)
  const openPanel = useAIStore(s => s.openPanel)
  const markVisited = useLearningPathStore(s => s.markFigureVisited)
  const visitedFigureIds = useLearningPathStore(s => s.progressByPath.allFigures.visitedFigureIds) ?? []
  const allContexts = useAllLearningContexts()

  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPerson) setSelectedPerson(null)
        else onClose()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, selectedPerson, onClose])

  if (!isActive) return null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return culturePeople.filter(p => {
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
      if (category !== 'all' && p.category !== category) return false
      if (q) {
        const text = (p.name + ' ' + p.role + ' ' + p.description + ' ' + (p.culturalWorks?.join(' ') ?? '')).toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  }, [region, category, query])

  const handlePersonClick = (person: HistoricalFigure) => {
    setSelectedPerson(person)
    markVisited(person.id)
  }

  const handleChat = (person: HistoricalFigure) => {
    const firstEraId = person.eraIds[0] ?? null
    setContext(firstEraId, null, person.id)
    const contextString = allContexts[person.id]?.contextString ?? ''
    const basePersona = person.personaPrompt || `你是${person.name}，${person.role}。${person.description}`
    const persona = enhancePersonaPrompt(basePersona + contextString, person.name)
    setPersonaPrompt(persona)
    newThread(`与 ${person.name} 对话`)
    openPanel()
    setSelectedPerson(null)
  }

  return (
    <div className="w-full h-full bg-ink-900 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-bronze-500/40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-serif text-bronze-300">📚 全文化</h2>
              <p className="text-xs text-ink-500 mt-1">
                {filtered.length} / {culturePeople.length} 位思想者、文学家、宗教人物
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
          <div className="flex flex-wrap items-center gap-2">
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
            <div className="flex rounded bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
              {([
                ['all', '全部'],
                ['thinker', '📚 思想家'],
                ['literati', '✒️ 文人'],
                ['religious', '☸️ 宗教'],
              ] as const).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setCategory(k as typeof category)}
                  className={`px-3 py-1.5 transition-colors ${
                    category === k
                      ? 'bg-bronze-600/40 text-bronze-300'
                      : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索名字/角色/作品..."
              className="flex-1 min-w-[200px] text-xs px-3 py-1.5 bg-ink-700/60 border border-ink-600 rounded text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-bronze-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center text-ink-500 py-12">未找到匹配的人物</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(p => {
              const visited = visitedFigureIds.includes(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => handlePersonClick(p)}
                  className="text-left p-4 rounded-lg bg-ink-800/60 border border-ink-700 hover:border-bronze-500/60 hover:bg-ink-700/60 transition-all relative group"
                >
                  {visited && (
                    <span className="absolute top-2 right-2 text-green-400 text-sm" title="已了解">✓</span>
                  )}
                  <div className="text-4xl mb-2">{p.emoji || '👤'}</div>
                  <div className="text-sm font-serif text-parchment-50 truncate">{p.name}</div>
                  <div className="text-[10px] text-ink-400 mt-1 line-clamp-2 min-h-[2.5em]">{p.role}</div>
                  {p.culturalWorks && p.culturalWorks.length > 0 && (
                    <div className="text-[10px] text-bronze-400/80 mt-1 line-clamp-1 italic">
                      {p.culturalWorks[0]}{p.culturalWorks.length > 1 ? ` 等 ${p.culturalWorks.length} 部` : ''}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

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
