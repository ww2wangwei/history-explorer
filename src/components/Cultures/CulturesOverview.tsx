/**
 * CulturesOverview — 全文化全屏浏览页
 * 两个 tab:
 *   - 人物: people.json 中 thinker/literati/religious 的人物（孔子、达芬奇、释迦牟尼等）
 *   - 文化内容: culture-events.json 中的事件/作品/思想/建筑/科技/制度
 *     （造纸术、印刷术、《蒙娜丽莎》、金字塔、长城、四大发明等）
 */
import { useEffect, useMemo, useState } from 'react'
import peopleData from '@/data/people.json'
import erasData from '@/data/eras.json'
import cultureEventsData from '@/data/culture-events.json'
import { useLearningPathStore } from '@/store/useLearningPathStore'
import { useAIStore } from '@/store/useAIStore'
import { useAllLearningContexts } from '@/utils/useLearningContext'
import { enhancePersonaPrompt } from '@/utils/useLearningContext'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useJumpToMap } from '@/hooks/useJumpToMap'
import PersonDetailDialog from '@/components/Figures/PersonDetailDialog'
import MiniMap from '@/components/Figures/MiniMap'
import OverviewLayout from '@/components/ui/OverviewLayout'
import EmptyState from '@/components/ui/EmptyState'
import OverviewSearch from '@/components/ui/OverviewSearch'
import { bingImage, cultureSearchKeywords } from '@/utils/geoImage'
import type { Era, HistoricalFigure } from '@/types'

const people = peopleData as HistoricalFigure[]
const eras = erasData as Era[]
const cultureEvents = cultureEventsData as Array<{
  id: string
  title: string
  year: number
  category: string
  location: [number, number]
  region: string
  importance: 1 | 2 | 3
  description: string
}>

const CULTURE_CATEGORIES: HistoricalFigure['category'][] = ['thinker', 'literati', 'religious']
const culturePeople = people.filter(p => p.category && CULTURE_CATEGORIES.includes(p.category))

const CULTURE_CATEGORY_LABELS: Record<string, { icon: string; color: string }> = {
  '文字': { icon: '✍️', color: '#9bc89a' },
  '制度': { icon: '📜', color: '#c89a5b' },
  '建筑': { icon: '🏛️', color: '#b85450' },
  '学术': { icon: '📚', color: '#5b9bc8' },
  '科技': { icon: '⚙️', color: '#9b7eb6' },
  '艺术': { icon: '🎨', color: '#c8a85b' },
  '文学': { icon: '✒️', color: '#5bc89a' },
  '思想': { icon: '💭', color: '#7a8a98' },
  '宗教': { icon: '☸️', color: '#c89a8a' },
}

interface Props {
  isActive: boolean
  onClose: () => void
}

type Tab = 'people' | 'events'
type RegionFilter = 'all' | 'china' | 'world'

export default function CulturesOverview({ isActive, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('events')  // 默认显示文化内容（更丰富）
  const [region, setRegion] = useState<RegionFilter>('all')
  const [selectedPerson, setSelectedPerson] = useState<HistoricalFigure | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<(typeof cultureEvents)[number] | null>(null)
  const [category, setCategory] = useState<string>('all')
  const [query, setQuery] = useState('')

  const setContext = useAIStore(s => s.setContext)
  const setPersonaPrompt = useAIStore(s => s.setPersonaPrompt)
  const newThread = useAIStore(s => s.newThread)
  const openPanel = useAIStore(s => s.openPanel)
  const markVisited = useLearningPathStore(s => s.markFigureVisited)
  const visitedFigureIds = useLearningPathStore(s => s.progressByPath.allFigures.visitedFigureIds) ?? []
  const allContexts = useAllLearningContexts()
  const jumpToMap = useJumpToMap()


  useEffect(() => {
    if (!isActive) return
    // 浮层 ← 按钮返回：mount 时读 pendingReopen 恢复弹窗
    // 用 setTimeout 推迟消费，避免 Strict Mode 双挂载 race
    const timer = setTimeout(() => {
      const pending = useHistoryStore.getState().pendingReopen
      if (pending?.kind === 'cultureEvent') {
        const ev = cultureEvents.find(e => e.id === pending.cultureEventId)
        if (ev) {
          setTab('events')
          setSelectedEvent(ev)
        }
        useHistoryStore.getState().setPendingReopen(null)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedEvent) setSelectedEvent(null)
        else if (selectedPerson) setSelectedPerson(null)
        else onClose()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, selectedEvent, selectedPerson, onClose])

  // ===== 人物过滤 =====
  const filteredPeople = useMemo(() => {
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

  // ===== 文化内容过滤 =====
  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cultureEvents.filter(e => {
      if (region === 'china' && !e.region.includes('中国')) return false
      if (region === 'world' && e.region.includes('中国')) return false
      if (category !== 'all' && e.category !== category) return false
      if (q) {
        const text = (e.title + ' ' + e.category + ' ' + e.description).toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    }).sort((a, b) => a.year - b.year)
  }, [region, category, query])

  if (!isActive) return null

  // ===== 类别 chips（根据 tab 切换）=====
  const categoryOptions = tab === 'people'
    ? [['all', '全部'], ['thinker', '📚 思想家'], ['literati', '✒️ 文人'], ['religious', '☸️ 宗教']]
    : [['all', '全部'], ['文字', '✍️ 文字'], ['制度', '📜 制度'], ['建筑', '🏛️ 建筑'],
       ['学术', '📚 学术'], ['科技', '⚙️ 科技'], ['艺术', '🎨 艺术'],
       ['文学', '✒️ 文学'], ['思想', '💭 思想'], ['宗教', '☸️ 宗教']]

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

  // 文化内容 → AI 对话：把人当历史专家问
  const handleEventChat = (event: typeof cultureEvents[number]) => {
    setContext(null, null, null)
    const yearLabel = event.year < 0 ? `BC ${-event.year}` : `${event.year}`
    const persona = `你是历史学家，精通${event.region}历史。用户询问关于「${event.title}」（${yearLabel}年，${event.category}）的内容。请基于公认历史学和考古学回答，保持客观中立。如不知道请明确说。\n\n事件背景：${event.description}`
    setPersonaPrompt(enhancePersonaPrompt(persona, '历史学家'))
    newThread(`关于 ${event.title}`)
    openPanel()
    setSelectedEvent(null)
  }

  // 文化内容 → 跳到主地图
  const handleEventViewOnMap = (event: typeof cultureEvents[number]) => {
    setSelectedEvent(null)
    onClose()
    jumpToMap(
      event.location as [number, number],
      event.title,
      5,
      {
        coverImageUrl: bingImage(cultureSearchKeywords[event.id] ?? event.title, 400, 240),
        snippet: event.description ?? '',
        reopenLabel: event.title,
        cultureEventId: event.id,
      }
    )
  }

  return (
    <OverviewLayout
      emoji="📚"
      title="全文化"
      subtitle={
        tab === 'people'
          ? `${filteredPeople.length} / ${culturePeople.length} 位思想者、文学家、宗教人物`
          : `${filteredEvents.length} / ${cultureEvents.length} 个文化内容（事件/作品/思想/科技）`
      }
      onClose={onClose}
      suppressEsc
      toolbar={
        <>
          {/* Tab 切换 */}
          <div className="flex rounded-lg bg-ink-700/60 border border-ink-600 overflow-hidden text-xs mb-3 w-fit">
            <button
              onClick={() => { setTab('events'); setCategory('all') }}
              className={`px-4 py-1.5 transition-colors ${tab === 'events' ? 'bg-bronze-600/40 text-bronze-300' : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'}`}
            >
              🏛️ 文化内容 ({cultureEvents.length})
            </button>
            <button
              onClick={() => { setTab('people'); setCategory('all') }}
              className={`px-4 py-1.5 transition-colors ${tab === 'people' ? 'bg-bronze-600/40 text-bronze-300' : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'}`}
            >
              👤 人物 ({culturePeople.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
              {(['all', 'china', 'world'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-3 py-1.5 transition-colors ${region === r ? 'bg-bronze-600/40 text-bronze-300' : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'}`}
                >
                  {r === 'all' ? '全部' : r === 'china' ? '🇨🇳 中国' : '🌍 世界'}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap rounded-lg bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
              {categoryOptions.map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setCategory(k as string)}
                  className={`px-3 py-1.5 transition-colors ${category === k ? 'bg-bronze-600/40 text-bronze-300' : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <OverviewSearch
              value={query}
              onChange={setQuery}
              placeholder={tab === 'people' ? '搜索名字/角色/作品...' : '搜索文化内容...'}
              minWidth={200}
            />
          </div>
        </>
      }
    >
      <>
        {tab === 'people' ? (
          // ===== 人物 grid =====
          filteredPeople.length === 0 ? (
            <EmptyState emoji="🔍" title="未找到匹配的人物" hint="试试切换筛选条件或清空搜索" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredPeople.map(p => {
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
                    <div className="text-xs text-ink-400 mt-1 line-clamp-2 min-h-[2.5em]">{p.role}</div>
                    {p.culturalWorks && p.culturalWorks.length > 0 && (
                      <div className="text-xs text-bronze-400/80 mt-1 line-clamp-1 italic">
                        {p.culturalWorks[0]}{p.culturalWorks.length > 1 ? ` 等 ${p.culturalWorks.length} 部` : ''}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )
        ) : (
          // ===== 文化内容 grid =====
          filteredEvents.length === 0 ? (
            <EmptyState emoji="🔍" title="未找到匹配的文化内容" hint="试试切换筛选条件或清空搜索" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredEvents.map(ev => {
                const catMeta = CULTURE_CATEGORY_LABELS[ev.category] || { icon: '📜', color: '#9b7eb6' }
                const yearLabel = ev.year < 0 ? `BC ${-ev.year}` : `${ev.year}`
                const evKw = cultureSearchKeywords[ev.id] ?? `${ev.title} ${ev.category}`
                const evImg = bingImage(evKw, 400, 240)
                return (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="text-left rounded-lg bg-ink-800/60 border border-ink-700 hover:border-bronze-500/60 hover:bg-ink-700/60 transition-all relative overflow-hidden flex"
                  >
                    {/* 缩略图 */}
                    <div className="relative w-32 flex-shrink-0 bg-ink-900">
                      <img
                        src={evImg}
                        alt={ev.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink-800/30 pointer-events-none" />
                    </div>
                    {/* 内容 */}
                    <div className="flex-1 p-3 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="text-lg w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: catMeta.color + '25' }}
                        >
                          {catMeta.icon}
                        </span>
                        <span className="text-xs text-ink-500 tabular-nums">{yearLabel}</span>
                        {ev.importance === 3 && <span className="text-amber-400 text-xs">⭐ 关键</span>}
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-lg"
                          style={{ background: catMeta.color + '20', color: catMeta.color }}
                        >
                          {ev.category}
                        </span>
                        <span className="text-[9px] text-ink-500">📍 {ev.region}</span>
                      </div>
                      <div className="text-sm font-serif text-parchment-50 mb-1 truncate">{ev.title}</div>
                      <div className="text-[11px] text-ink-300 line-clamp-2 leading-relaxed">{ev.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        )}

      {/* 人物详情弹窗 */}
      {selectedPerson && (
        <PersonDetailDialog
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onChat={() => handleChat(selectedPerson)}
        />
      )}

      {/* 文化内容详情弹窗 */}
      {selectedEvent && (() => {
        const evKw = cultureSearchKeywords[selectedEvent.id] ?? `${selectedEvent.title} ${selectedEvent.category}`
        const evImg = bingImage(evKw, 800, 450)
        return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-bronze-500/40 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="文化内容详情"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 文化内容图片 */}
            <div className="relative w-full bg-ink-900" style={{ aspectRatio: '16/9' }}>
              <img
                src={evImg}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-900/95 to-transparent px-6 pt-8 pb-3">
                <div className="text-xs text-ink-300 mb-0.5 flex items-center gap-2 flex-wrap">
                  <span className="tabular-nums">{yearLabel(selectedEvent)}</span>
                  {selectedEvent.importance === 3 && <span className="text-amber-400">⭐ 关键</span>}
                  <span style={{ color: (CULTURE_CATEGORY_LABELS[selectedEvent.category] || { color: '#fff' }).color }}>
                    {(CULTURE_CATEGORY_LABELS[selectedEvent.category] || { icon: '📜' }).icon} {selectedEvent.category}
                  </span>
                  <span>📍 {selectedEvent.region}</span>
                </div>
                <h3 className="text-2xl font-serif text-bronze-200">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-3 right-3 text-parchment-50/80 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg bg-ink-900/60 hover:bg-ink-900/80 backdrop-blur"
                title="关闭 (ESC)"
                aria-label="关闭"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">📜 详细介绍</div>
                <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
                  {selectedEvent.description}
                </div>
              </div>

              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🗺️ 位置</div>
                <MiniMap
                  focusNode={{
                    title: selectedEvent.title,
                    year: selectedEvent.year,
                    location: selectedEvent.region,
                    importance: selectedEvent.importance,
                    coordinates: selectedEvent.location,
                  }}
                  allNodes={[{
                    title: selectedEvent.title,
                    year: selectedEvent.year,
                    location: selectedEvent.region,
                    importance: selectedEvent.importance,
                    coordinates: selectedEvent.location,
                  }]}
                  onJumpToMap={() => handleEventViewOnMap(selectedEvent)}
                />
                <div className="text-xs text-ink-400 tabular-nums mt-2">
                  经度 {selectedEvent.location[0].toFixed(2)}°, 纬度 {selectedEvent.location[1].toFixed(2)}° ({selectedEvent.region})
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-ink-700">
                <button
                  onClick={() => handleEventChat(selectedEvent)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-900/40 hover:bg-red-800/60 border border-red-600/50 text-red-200 text-sm transition-colors"
                >
                  💬 询问此内容
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2.5 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 text-sm transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
        )
      })()}
      </>
    </OverviewLayout>
  )
}

function yearLabel(ev: { year: number }) {
  return ev.year < 0 ? `BC ${-ev.year}` : `${ev.year}`
}
