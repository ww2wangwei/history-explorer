/**
 * FiguresOverview — 全人物全屏浏览页
 * 与 NotesOverview variant="page" 同模式
 *
 * 卡片渲染使用共享 PersonCard（与 Dashboard 选人物弹窗同一个组件）
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import peopleData from '@/data/people.json'
import erasData from '@/data/eras.json'
import type { Era, FigureCategory, HistoricalFigure } from '@/types'
import { useLearningPathStore } from '@/store/useLearningPathStore'
import { useAIStore } from '@/store/useAIStore'
import { useAllLearningContexts } from '@/utils/useLearningContext'
import { enhancePersonaPrompt } from '@/utils/useLearningContext'
import PersonCard, { PERSON_CATEGORY_LABEL } from './PersonCard'
import PersonDetailDialog from './PersonDetailDialog'
import EmptyState from '@/components/ui/EmptyState'
import OverviewLayout from '@/components/ui/OverviewLayout'
import RegionFilter from '@/components/ui/RegionFilter'
import OverviewSearch from '@/components/ui/OverviewSearch'
import { useStaggerEntrance } from '@/hooks/useStaggerEntrance'

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

const CATEGORY_LABEL = PERSON_CATEGORY_LABEL

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

  // 人物卡片网格容器 — GSAP stagger 进场
  const figureCardsRef = useRef<HTMLDivElement | null>(null)
  useStaggerEntrance(figureCardsRef, '.person-card', [region, category, query, filtered.length])

  if (!isActive) return null

  return (
    <OverviewLayout
      emoji="👥"
      title="全人物"
      subtitle={
        visitedCount >= total
          ? `🎉 你已了解所有 ${total} 位历史人物！`
          : `已了解 ${visitedCount} / ${total} 位历史人物`
      }
      onClose={onClose}
      suppressEsc
      toolbar={
        <div className="flex flex-wrap items-center gap-3">
          {/* 区域 */}
          <RegionFilter value={region} onChange={setRegion} />

          {/* 分类 — chips 风格（可显示每个分类下的人数） */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setCategory('all')}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
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
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
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
          <OverviewSearch value={query} onChange={setQuery} placeholder="搜索名字/角色/简介..." minWidth={180} />
        </div>
      }
    >
      {/* 卡片网格 */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="未找到匹配的人物"
          hint="试试切换分类、地区筛选，或调整搜索关键词"
        />
      ) : (
        <div ref={figureCardsRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
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

      {/* 详情弹窗 */}
      {selectedPerson && (
        <PersonDetailDialog
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onChat={() => handleChat(selectedPerson)}
        />
      )}
    </OverviewLayout>
  )
}
