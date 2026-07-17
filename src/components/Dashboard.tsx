/**
 * 学习引导 Dashboard
 *
 * 用户进应用的"主页" — 提供：
 *   1. 欢迎 + 当前学习位置（继续上次）
 *   2. 学习进度概览（已学朝代 / 笔记 / 复习）
 *   3. 4 个学习路径卡片
 *   4. 智能"下一步"推荐
 */
import { useMemo, useState } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useCardsStore } from '@/store/useCardsStore'
import { useNotesStore } from '@/store/useNotesStore'
import { countTodayReviews } from '@/utils/cardStats'
import { useGoalStore } from '@/store/useGoalStore'
import { useLearningPathStore, type PathId } from '@/store/useLearningPathStore'
import { isDue } from '@/utils/sm2'
import erasData from '@/data/eras.json'
import eventsData from '@/data/events.json'
import peopleData from '@/data/people.json'
import type { Era, FigureCategory, HistoricalEvent, HistoricalFigure } from '@/types'

const eras = erasData as Era[]
const events = eventsData as HistoricalEvent[]
const people = peopleData as HistoricalFigure[]

// 全人物弹窗：分类筛选标签
const FIGURE_CATEGORY_LABEL: Record<FigureCategory, { icon: string; label: string; color: string }> = {
  politician: { icon: '👑', label: '政治家', color: '#c89a5b' },
  military:   { icon: '⚔️', label: '军事家', color: '#b85450' },
  thinker:    { icon: '📚', label: '思想家', color: '#9b7eb6' },
  literati:   { icon: '✒️', label: '文人/艺术家', color: '#5b9bc8' },
  scientist:  { icon: '🔬', label: '科学家', color: '#5bc89a' },
  reformer:   { icon: '⚖️', label: '改革家', color: '#c8a85b' },
  explorer:   { icon: '🚢', label: '探险家', color: '#5b8fc8' },
  religious:  { icon: '☸️', label: '宗教人物', color: '#c89a8a' },
}

interface Props {
  isActive: boolean
  onEnterMap: () => void
  onEnterPath: (pathId: PathId, eraId?: string) => void
}

const PATHS: { id: PathId; icon: string; title: string; desc: string; color: string }[] = [
  { id: 'timeline', icon: '📜', title: '朝代时间线', desc: '按时间顺序学习每个朝代', color: '#c89a5b' },
  { id: 'allFigures', icon: '👥', title: '全人物', desc: '浏览 26+ 位历史人物并与 AI 对话', color: '#9b7eb6' },
  { id: 'review', icon: '🎯', title: '今日复习', desc: '基于 SM-2 算法的间隔复习', color: '#9bc89a' },
]

export default function Dashboard({ isActive, onEnterMap, onEnterPath }: Props) {
  // 基础订阅（细粒度 selector）
  const currentYear = useHistoryStore(s => s.currentYear)
  const setYear = useHistoryStore(s => s.setYear)
  const selectEra = useHistoryStore(s => s.selectEra)
  const eraSelectionHistory = useHistoryStore(s => s.eraSelectionHistory)

  // 进度数据
  const goal = useGoalStore(s => s.target)
  const cardsArr = useCardsStore(s => s.cards)

  // 快速学习 Modal（朝代时间线路径进入时显示）
  const [learnEraId, setLearnEraId] = useState<string | null>(null)
  const [showEraList, setShowEraList] = useState(false)
  // 全人物：人物选择列表弹窗
  const [showFigureList, setShowFigureList] = useState(false)
  // 弹窗内分类筛选（不影响页面外）
  const [figureCatFilter, setFigureCatFilter] = useState<FigureCategory | 'all'>('all')
  // 弹窗内按分类筛选后的人物列表
  const filteredPeople = useMemo(
    () => figureCatFilter === 'all' ? people : people.filter(p => p.category === figureCatFilter),
    [figureCatFilter]
  )
  const learnEra = learnEraId ? eras.find(e => e.id === learnEraId) : null
  // 按时间顺序的所有朝代（用于"上一/下一"导航 + 选择列表）
  const sortedEras = useMemo(
    () => eras.slice().sort((a, b) => a.startYear - b.startYear),
    []
  )

  // 朝代时间线路径 — 弹出"快速学习"模态，不进入地图
  const openQuickLearn = (eraId: string) => {
    setLearnEraId(eraId)
    recordVisit('timeline', eraId)
  }
  const closeQuickLearn = () => setLearnEraId(null)

  // 上一/下一朝代
  const learnIdx = learnEraId ? sortedEras.findIndex(e => e.id === learnEraId) : -1
  const prevLearnEra = learnIdx > 0 ? sortedEras[learnIdx - 1] : null
  const nextLearnEra = learnIdx >= 0 && learnIdx < sortedEras.length - 1 ? sortedEras[learnIdx + 1] : null

  // 标记为已学 — 写 progressByPath
  const markLearned = () => {
    if (learnEra) {
      recordVisit('timeline', learnEra.id)
    }
  }

  // 跳到下一朝代
  const gotoNextLearn = () => {
    if (nextLearnEra) setLearnEraId(nextLearnEra.id)
  }
  const gotoPrevLearn = () => {
    if (prevLearnEra) setLearnEraId(prevLearnEra.id)
  }

  const todayCount = useMemo(() => countTodayReviews(cardsArr), [cardsArr])
  const cardsCount = useMemo(() => Object.keys(cardsArr).length, [cardsArr])
  const dueCount = useMemo(() => {
    const now = Date.now()
    return Object.values(cardsArr).filter(c => isDue(c, now)).length
  }, [cardsArr])

  // 学习路径进度
  const progressByPath = useLearningPathStore(s => s.progressByPath)
  const recommendNext = useLearningPathStore(s => s.recommendNext)
  const recordVisit = useLearningPathStore(s => s.recordVisit)
  const setMapFocus = useHistoryStore(s => s.setMapFocus)

  // 计算推荐（仅依赖稳定值）
  const recommendation = useMemo(
    () => recommendNext(currentYear, useHistoryStore.getState().selectedEraId, eraSelectionHistory),
    // 故意省 deps（详见注释：不想在 selectedEraId 变化时重渲染 dashboard 自身）
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentYear, eraSelectionHistory],
  )

  if (!isActive) return null

  // 今日目标完成度
  const goalPct = Math.min(100, Math.round((todayCount / Math.max(1, goal)) * 100))
  const totalEras = eras.length
  const learnedInTimeline = progressByPath.timeline.visitedEraIds.length
  // learnedInXref 不再作为 Dashboard 独立统计指标（进入 EraDetail 即触发 recordVisit）

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-thin bg-ink-900">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 欢迎标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-bronze-400 mb-2">📜 历史探索者</h1>
          <p className="text-ink-400 text-sm leading-relaxed">
            从 {currentYear < 0 ? `公元前${-currentYear}` : currentYear} 年开始，
            系统地学习中国和世界的 50 个朝代 + 251 个历史事件。
          </p>
        </div>

        {/* 继续上次 */}
        {recommendation && (
          <div
            className="mb-6 p-5 rounded-lg border border-bronze-500/40 bg-gradient-to-r from-bronze-900/30 to-ink-800/80 cursor-pointer hover:border-bronze-400 transition-colors"
            onClick={() => {
              selectEra(recommendation.eraId)
              recordVisit('timeline', recommendation.eraId)
              if (recommendation.era.capital && Array.isArray(recommendation.era.capital)) {
                setMapFocus({
                  center: recommendation.era.capital as [number, number],
                  zoom: 2,
                  label: `${recommendation.era.name} 都城`,
                })
              }
              onEnterMap()
            }}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">👉</div>
              <div className="flex-1">
                <div className="text-xs text-ink-500 mb-1">智能推荐 · 下一步</div>
                <div className="text-lg font-serif text-bronze-300 mb-1">
                  {recommendation.era.name}
                  <span className="ml-2 text-xs text-ink-400">
                    ({recommendation.era.startYear < 0 ? `公元前${-recommendation.era.startYear}` : recommendation.era.startYear}
                    {' ~ '}
                    {recommendation.era.endYear < 0 ? `公元前${-recommendation.era.endYear}` : recommendation.era.endYear} 年)
                  </span>
                </div>
                <div className="text-xs text-ink-500">{recommendation.reason}</div>
              </div>
              <div className="text-bronze-400 text-2xl flex-shrink-0">→</div>
            </div>
          </div>
        )}

        {/* 进度概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard icon="📜" label="已学朝代（时间线）" value={`${learnedInTimeline} / ${totalEras}`} hint={`${Math.round((learnedInTimeline / totalEras) * 100)}%`} />
          {/* 已对照朝代（进入 EraDetail 即累计）— 数据来自 progressByPath.crossReference */}
          <StatCard icon="🌍" label="已对照朝代" value={`${progressByPath.crossReference.visitedEraIds.length} / ${totalEras}`} hint={`${Math.round((progressByPath.crossReference.visitedEraIds.length / totalEras) * 100)}%`} />
          <StatCard icon="📝" label="复习卡" value={String(cardsCount)} hint={dueCount > 0 ? `${dueCount} 待复习` : '全掌握！'} />
          <StatCard icon="🎯" label="今日目标" value={`${todayCount} / ${goal}`} hint={`${goalPct}%`} progress={goalPct} />
        </div>

        {/* 学习路径 */}
        <h2 className="text-sm text-ink-500 mb-3 uppercase tracking-wider">选择学习路径</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PATHS.filter(p => p.title).map(p => {
            const progress = progressByPath[p.id] ?? { visitedEraIds: [] }
            // allFigures 用 visitedFigureIds，其他用 visitedEraIds
            const visited = p.id === 'allFigures'
              ? (progress.visitedFigureIds?.length ?? 0)
              : progress.visitedEraIds.length
            const total = p.id === 'allFigures' ? 26 : totalEras
            const pPct = total > 0 ? Math.round((visited / total) * 100) : 0
            return (
              <button
                key={p.id}
                onClick={() => {
                  // 3 个路径有不同行为 — 都不直接进地图
                  if (p.id === 'timeline') {
                    // 📜 朝代时间线：先弹朝代选择列表，让用户自己选 → QuickLearnModal（含已关联笔记/卡）
                    setShowEraList(true)
                    if (recommendation) recordVisit('timeline', recommendation.eraId)
                  } else if (p.id === 'allFigures') {
                    // 👥 全人物：先弹人物选择列表，让用户选一个具体人物 → FiguresOverview 打开该人物详情
                    setShowFigureList(true)
                  } else {
                    // 🎯 今日复习 — 走通用流程（让 Layout 路由）
                    if (recommendation) {
                      selectEra(recommendation.eraId)
                      recordVisit(p.id as PathId, recommendation.eraId)
                    }
                    onEnterPath(p.id as PathId)
                  }
                }}
                className="text-left p-5 rounded-lg border border-ink-600 bg-ink-800/60 hover:border-bronze-500 hover:bg-ink-800 transition-all group"
                style={{ borderLeftWidth: '3px', borderLeftColor: p.color }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0" style={{ filter: `drop-shadow(0 0 6px ${p.color}40)` }}>{p.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-serif text-base group-hover:text-bronze-300 transition-colors" style={{ color: p.color }}>
                        {p.title}
                      </div>
                      <div className="text-xs text-ink-500">{pPct}%</div>
                    </div>
                    <div className="text-xs text-ink-400 mb-2">{p.desc}</div>
                    <div className="h-1 bg-ink-700 rounded overflow-hidden">
                      <div className="h-full transition-all" style={{ width: `${pPct}%`, background: p.color }} />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* 快速入口 */}
        <div className="mt-8 flex flex-wrap gap-3 text-xs text-ink-400">
          <button onClick={onEnterMap} className="px-3 py-1.5 rounded border border-ink-600 hover:border-bronze-500 hover:text-bronze-300 transition-colors">
            🗺 进入地图（自由浏览）
          </button>
          <button onClick={() => setYear(0)} className="px-3 py-1.5 rounded border border-ink-600 hover:border-bronze-500 hover:text-bronze-300 transition-colors">
            ⏳ 跳到公元 0 年
          </button>
          <div className="px-3 py-1.5 text-ink-500">
            快捷键 <kbd className="px-1 bg-ink-700 rounded">g</kbd> 地图 · <kbd className="px-1 bg-ink-700 rounded">r</kbd> 图谱
          </div>
        </div>
      </div>

      {/* 📜 朝代时间线 — 朝代选择列表 */}
      {showEraList && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
          onClick={() => setShowEraList(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-bronze-500/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-ink-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif text-bronze-300">📜 选一个朝代学习</h2>
                <div className="text-xs text-ink-500 mt-0.5">按时间顺序排列。已学的朝代用 <span className="text-green-400">绿色</span> 标记，下一个推荐的用 <span className="text-bronze-400">金色</span> 高亮。</div>
              </div>
              <button
                className="text-ink-500 hover:text-parchment-50 text-2xl leading-none"
                onClick={() => setShowEraList(false)}
                title="关闭 (Esc)"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sortedEras.map((era, idx) => {
                  const visited = progressByPath.timeline.visitedEraIds.includes(era.id)
                  const isRecommended = recommendation?.era?.id === era.id
                  const hasQuick = !!era.keyPoints
                  return (
                    <button
                      key={era.id}
                      onClick={() => {
                        setLearnEraId(era.id)
                        recordVisit('timeline', era.id)
                        setShowEraList(false)
                      }}
                      className={`text-left p-3 rounded border transition-colors ${
                        isRecommended
                          ? 'border-bronze-500 bg-bronze-900/30 hover:bg-bronze-900/50'
                          : visited
                          ? 'border-green-700/50 bg-green-900/10 hover:bg-green-900/20'
                          : 'border-ink-600 bg-ink-700/30 hover:bg-ink-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isRecommended && <span className="text-bronze-400 text-xs">👉 推荐</span>}
                        {visited && <span className="text-green-400 text-xs">✓ 已学</span>}
                        {!hasQuick && <span className="text-ink-500 text-[10px]">详细</span>}
                        <span
                          className="text-sm font-serif"
                          style={{ color: era.color }}
                        >
                          {era.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-ink-500 tabular-nums">
                        {era.startYear < 0 ? `BC ${-era.startYear}` : era.startYear} ~ {era.endYear < 0 ? `BC ${-era.endYear}` : era.endYear} ·{' '}
                        {era.region === 'china' ? '中国' : '世界'}
                      </div>
                      {era.shortDesc && (
                        <div className="text-xs text-ink-400 mt-0.5 line-clamp-2">{era.shortDesc}</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 👥 全人物 — 人物选择列表 */}
      {showFigureList && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
          onClick={() => setShowFigureList(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-purple-500/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-ink-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif text-purple-300">👥 选一位人物了解</h2>
                <div className="text-xs text-ink-500 mt-0.5">
                  点击卡片与 AI 对话 / 查看详情。已了解的人物用 <span className="text-green-400">绿色</span> 标记。
                </div>
              </div>
              <button
                className="text-ink-500 hover:text-parchment-50 text-2xl leading-none"
                onClick={() => setShowFigureList(false)}
                title="关闭 (Esc)"
              >
                ×
              </button>
            </div>

            {/* 分类 chips 筛选 */}
            <div className="sticky top-[72px] z-10 bg-ink-800/95 backdrop-blur border-b border-ink-700 px-6 py-2.5 flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFigureCatFilter('all')}
                className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                  figureCatFilter === 'all'
                    ? 'bg-purple-600/40 text-purple-200 border-purple-500/60'
                    : 'bg-ink-700/60 text-ink-400 border-ink-600 hover:text-parchment-50'
                }`}
              >
                全部 <span className="text-ink-500 ml-1">({people.length})</span>
              </button>
              {(Object.keys(FIGURE_CATEGORY_LABEL) as FigureCategory[]).map(cat => {
                const count = people.filter(p => p.category === cat).length
                if (count === 0) return null
                const meta = FIGURE_CATEGORY_LABEL[cat]
                const active = figureCatFilter === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setFigureCatFilter(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                      active
                        ? 'border-bronze-500/60'
                        : 'bg-ink-700/60 text-ink-400 border-ink-600 hover:text-parchment-50'
                    }`}
                    style={active ? { background: meta.color + '30', color: meta.color } : undefined}
                    title={meta.label}
                  >
                    {meta.icon} {meta.label} <span className="text-ink-500 ml-1">({count})</span>
                  </button>
                )
              })}
            </div>

            <div className="p-4">
              {filteredPeople.length === 0 ? (
                <div className="text-center text-ink-500 py-8">该分类下还没有人物</div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredPeople.map(person => {
                  const visited = progressByPath.allFigures?.visitedFigureIds?.includes(person.id) ?? false
                  const eraNames = person.eraIds
                    .map(eid => eras.find(e => e.id === eid))
                    .filter((e): e is Era => Boolean(e))
                  const catMeta = FIGURE_CATEGORY_LABEL[person.category]
                  return (
                    <button
                      key={person.id}
                      onClick={() => {
                        // 标记已了解 + 进入人物总览页并打开该人物详情
                        // 第二个参数复用 eraId 槽位存 figureId（onEnterPath 的 eraId 是可选的）
                        onEnterPath('allFigures', person.id)
                        setShowFigureList(false)
                      }}
                      className={`text-left p-3 rounded border transition-colors relative ${
                        visited
                          ? 'border-green-700/50 bg-green-900/10 hover:bg-green-900/20'
                          : 'border-ink-600 bg-ink-700/30 hover:bg-ink-700/60'
                      }`}
                    >
                      {/* 分类小徽章 */}
                      <span
                        className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded font-serif"
                        style={{ background: catMeta.color + '20', color: catMeta.color }}
                        title={catMeta.label}
                      >
                        {catMeta.icon}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl flex-shrink-0">{person.emoji || '👤'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {visited && <span className="text-green-400 text-xs">✓ 已了解</span>}
                            <span className="text-sm font-serif text-parchment-50">{person.name}</span>
                          </div>
                          <div className="text-[10px] text-ink-400 truncate">{person.role}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {eraNames.slice(0, 3).map(e => (
                              <span
                                key={e.id}
                                className="text-[9px] px-1.5 py-0.5 rounded"
                                style={{ background: e.color + '20', color: e.color }}
                              >
                                {e.name}
                              </span>
                            ))}
                            {eraNames.length > 3 && (
                              <span className="text-[9px] text-ink-500">+{eraNames.length - 3}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🚀 快速学习 Modal（朝代时间线路径） */}
      {learnEra && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
          onClick={closeQuickLearn}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-bronze-500/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-ink-600 px-6 py-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] text-ink-500 mb-1">
                  {learnEra.region === 'china' ? '中国朝代' : '世界文明'} ·{' '}
                  {learnEra.startYear < 0 ? `BC ${-learnEra.startYear}` : learnEra.startYear} ~ {learnEra.endYear}
                </div>
                <h2 className="text-2xl font-serif" style={{ color: learnEra.color }}>
                  {learnEra.name}
                </h2>
                {learnEra.shortDesc && (
                  <div className="text-sm text-ink-400 mt-1 italic">{learnEra.shortDesc}</div>
                )}
              </div>
              <button
                className="text-ink-500 hover:text-parchment-50 text-2xl leading-none"
                onClick={closeQuickLearn}
                title="关闭 (Esc)"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* 5 个核心要点 */}
              {learnEra.keyPoints && learnEra.keyPoints.length > 0 && (
                <div>
                  <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-2">📚 核心要点（5 条）</div>
                  <ol className="text-sm text-parchment-50 space-y-1.5 list-decimal pl-5 marker:text-bronze-500">
                    {learnEra.keyPoints.map((pt, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: renderMarkdownBold(pt) }} />
                    ))}
                  </ol>
                </div>
              )}

              {/* 5 件大事 */}
              {learnEra.quickEvents && learnEra.quickEvents.length > 0 && (
                <div>
                  <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-2">📜 5 件关键大事</div>
                  <div className="relative pl-5">
                    <div className="absolute left-1.5 top-1 bottom-1 w-px bg-bronze-600/40" />
                    {learnEra.quickEvents.map((ev, i) => (
                      <div key={i} className="relative pb-2 last:pb-0">
                        <div className="absolute -left-3.5 top-1 w-2 h-2 rounded-full bg-bronze-500 ring-2 ring-ink-900" />
                        <div className="text-[10px] text-bronze-400 tabular-nums">
                          {ev.year < 0 ? `BC ${-ev.year}` : ev.year}
                        </div>
                        <div className="text-sm font-serif text-parchment-50">{ev.title}</div>
                        <div className="text-[10px] text-ink-500 mt-0.5">{ev.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 历史意义 */}
              {learnEra.legacy && (
                <div className="p-3 rounded bg-bronze-900/20 border border-bronze-700/40">
                  <div className="text-[10px] text-bronze-400 uppercase tracking-wider mb-1.5">🎯 历史意义 / 对后世影响</div>
                  <div
                    className="text-sm text-parchment-50 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownBold(learnEra.legacy) }}
                  />
                </div>
              )}

              {/* 朝代连续性 */}
              {learnEra.succession && (learnEra.succession.predecessor || learnEra.succession.successor) && (
                <div className="p-3 rounded bg-ink-700/40 border border-ink-600/60">
                  <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">🔗 朝代连续性</div>
                  {learnEra.succession.predecessor && (
                    <div className="text-xs text-ink-300 mb-1">
                      <span className="text-ink-500">← 前承：</span>{learnEra.succession.predecessor}
                    </div>
                  )}
                  {learnEra.succession.successor && (
                    <div className="text-xs text-ink-300">
                      <span className="text-ink-500">后继：</span>{learnEra.succession.successor} →
                    </div>
                  )}
                </div>
              )}

              {/* 描述（如果前面字段没填详细描述，这里 fallback） */}
              {!learnEra.keyPoints && learnEra.description && (
                <p className="text-sm text-parchment-50 leading-relaxed whitespace-pre-line">
                  {learnEra.description}
                </p>
              )}

              {/* 自动生成的"同时期事件"（未填 quickLearn 的朝代也会有内容） */}
              {!learnEra.quickEvents && (
                <AutoEventsInRange eraId={learnEra.id} startYear={learnEra.startYear} endYear={learnEra.endYear} />
              )}

              {/* 自动生成的"同时期世界"（同期其他朝代） */}
              {!learnEra.succession && (
                <AutoContemporaries era={learnEra} allEras={eras} />
              )}

              {/* 📝 已关联笔记（按 target.kind='era' + id 查） */}
              <RelatedNotes eraId={learnEra.id} />

              {/* 🃏 已关联复习卡（按 target.kind='era' + id 查） */}
              <RelatedCards eraId={learnEra.id} />
            </div>

            <div className="sticky bottom-0 z-10 bg-ink-800/95 backdrop-blur border-t border-ink-600 px-6 py-3 flex items-center justify-between">
              <button
                className="px-3 py-1.5 rounded text-xs text-ink-300 hover:text-bronze-300 border border-ink-600 transition-colors"
                onClick={gotoPrevLearn}
                disabled={!prevLearnEra}
                title={prevLearnEra ? `上一朝代：${prevLearnEra.name}` : '已是第一朝代'}
              >
                ← {prevLearnEra?.name ?? '最早'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded text-xs bg-bronze-600/30 text-bronze-300 hover:bg-bronze-600/50 border border-bronze-500/60 transition-colors"
                  onClick={() => {
                    markLearned()
                  }}
                >
                  ✓ 标记已学
                </button>
                <button
                  className="px-3 py-1.5 rounded text-xs text-parchment-50 bg-bronze-600 hover:bg-bronze-500 border border-bronze-500 transition-colors"
                  onClick={() => {
                    selectEra(learnEra.id)
                    setLearnEraId(null)
                    onEnterMap()
                  }}
                >
                  🗺 打开地图看位置
                </button>
              </div>
              <button
                className="px-3 py-1.5 rounded text-xs text-ink-300 hover:text-bronze-300 border border-ink-600 transition-colors"
                onClick={gotoNextLearn}
                disabled={!nextLearnEra}
                title={nextLearnEra ? `下一朝代：${nextLearnEra.name}` : '已是最后朝代'}
              >
                {nextLearnEra?.name ?? '最晚'} →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, hint, progress }: { icon: string; label: string; value: string; hint?: string; progress?: number }) {
  return (
    <div className="p-3 rounded-lg bg-ink-800/60 border border-ink-600">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <div className="text-[10px] text-ink-500 uppercase tracking-wider truncate">{label}</div>
      </div>
      <div className="text-xl font-serif text-parchment-50">{value}</div>
      {hint && (
        <div className={`text-[10px] mt-0.5 ${progress === 100 ? 'text-green-400' : 'text-ink-500'}`}>{hint}</div>
      )}
      {progress !== undefined && (
        <div className="h-1 bg-ink-700 rounded overflow-hidden mt-1.5">
          <div className="h-full bg-bronze-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}

/** 把 **加粗** 转成 <strong>（保持其他文本安全转义） */
function renderMarkdownBold(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-bronze-300">$1</strong>')
}

/** 📝 已关联此朝代的笔记列表（按 target.kind='era' + id 查） */
function RelatedNotes({ eraId }: { eraId: string }) {
  const notesMap = useNotesStore(s => s.notes)
  const notes = useMemo(
    () => Object.values(notesMap)
      .filter(n => n.target.kind === 'era' && n.target.id === eraId)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5),
    [notesMap, eraId]
  )
  if (notes.length === 0) return null
  return (
    <div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-2">📝 已关联笔记（{notes.length}）</div>
      <div className="space-y-1.5">
        {notes.map(n => (
          <div
            key={n.id}
            className="p-2 rounded bg-ink-700/30 border border-ink-600/40 text-xs"
          >
            <div className="text-parchment-50 truncate">{n.title || '(无标题)'}</div>
            <div className="text-ink-500 text-[10px] truncate mt-0.5">
              {n.content.split('\n').find(l => l.trim()) || '(空)'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 🃏 已关联此朝代的复习卡（按 target.kind='era' + id 查） */
function RelatedCards({ eraId }: { eraId: string }) {
  const cardsMap = useCardsStore(s => s.cards)
  const cards = useMemo(
    () => Object.values(cardsMap)
      .filter(c => c.target.kind === 'era' && c.target.id === eraId)
      .slice(0, 5),
    [cardsMap, eraId]
  )
  if (cards.length === 0) return null
  return (
    <div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-2">🃏 已关联复习卡（{cards.length}）</div>
      <div className="grid grid-cols-2 gap-1.5">
        {cards.map(c => (
          <div
            key={c.id}
            className="p-2 rounded bg-ink-700/30 border border-ink-600/40 text-xs"
          >
            <div className="text-ink-400 text-[10px]">到期：{new Date(c.due).toLocaleDateString()}</div>
            <div className="text-parchment-50 truncate mt-0.5">{c.content || '(空)'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 自动 fallback：朝代期间内发生的关键事件（最多 5 条）
 * 当 Era.quickEvents 字段为空时显示
 */
function AutoEventsInRange({ eraId, startYear, endYear }: { eraId: string; startYear: number; endYear: number }) {
  const eraEvents = events
    .filter(e => e.year >= startYear && e.year <= endYear)
    .sort((a, b) => a.year - b.year)
    .slice(0, 5)
  if (eraEvents.length === 0) return null
  return (
    <div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-2">📜 同时期关键事件（自动聚合）</div>
      <div className="relative pl-5">
        <div className="absolute left-1.5 top-1 bottom-1 w-px bg-bronze-600/40" />
        {eraEvents.map((ev, i) => (
          <div key={i} className="relative pb-3 last:pb-0">
            <div className="absolute -left-3.5 top-1 w-2 h-2 rounded-full bg-bronze-500 ring-2 ring-ink-900" />
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-[10px] text-bronze-400 tabular-nums">
                {ev.year < 0 ? `BC ${-ev.year}` : ev.year}
              </span>
              {ev.importance === 3 && <span className="text-[10px] text-amber-400">⭐ 关键</span>}
              <span className="text-[10px] text-ink-500">· {ev.category}</span>
            </div>
            <div className="text-sm font-serif text-parchment-100">{ev.title}</div>
            {ev.description && (
              <div className="text-[11px] text-ink-400 mt-1 leading-relaxed">{ev.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 自动 fallback：与当前朝代同时期（时间重叠）的其他朝代
 * 当 Era.succession 字段为空时显示
 */
function AutoContemporaries({ era, allEras }: { era: Era; allEras: Era[] }) {
  // 找时间重叠（startYear1 <= endYear2 && startYear2 <= endYear1），但排除自己
  const contemporaries = allEras
    .filter(e => e.id !== era.id && e.startYear <= era.endYear && e.endYear >= era.startYear)
    .sort((a, b) => a.startYear - b.startYear)
    .slice(0, 8)  // 最多 8 个
  if (contemporaries.length === 0) return null
  return (
    <div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-2">🌍 同时期其他文明</div>
      <div className="text-xs text-ink-400 mb-2">
        同期 <span className="text-parchment-50">{contemporaries.length}</span> 个朝代与你选的朝代时间重叠：
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {contemporaries.map(e => (
          <div
            key={e.id}
            className="text-[10px] px-2 py-1 rounded bg-ink-700/40 border border-ink-600/40 flex items-center gap-1"
            style={{ borderLeft: `2px solid ${e.color}` }}
          >
            <span className="text-parchment-50 flex-1 truncate" style={{ color: e.color }}>{e.name}</span>
            <span className="text-ink-500 tabular-nums">
              {e.startYear < 0 ? `BC ${-e.startYear}` : e.startYear}~{e.endYear < 0 ? `BC ${-e.endYear}` : e.endYear}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
