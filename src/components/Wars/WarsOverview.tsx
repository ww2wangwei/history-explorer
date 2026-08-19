/**
 * WarsOverview — 全战争全屏浏览页
 * 数据源：events.json 中 category='军事' 的事件
 * 复用模式与 FiguresOverview 相同（区域筛选 + importance 筛选 + 搜索 + 详情弹窗）
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import eventsData from '@/data/events.json'
import erasData from '@/data/eras.json'
import { useAIStore } from '@/store/useAIStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useAllLearningContexts } from '@/utils/useLearningContext'
import { enhancePersonaPrompt } from '@/utils/useLearningContext'
import { bingImage, warSearchKeywords, majorWarSearchKeywords } from '@/utils/geoImage'
import { summarizeEvent } from '@/utils/summarize'
import type { Era, HistoricalEvent } from '@/types'
import MiniMap from '@/components/Figures/MiniMap'
import EmptyState from '@/components/ui/EmptyState'
import OverviewLayout from '@/components/ui/OverviewLayout'
import OverviewSearch from '@/components/ui/OverviewSearch'
import { useStaggerEntrance } from '@/hooks/useStaggerEntrance'
import { useJumpToMap } from '@/hooks/useJumpToMap'
import { lookupLocationStrict } from '@/utils/locationCoords'

const events = eventsData as HistoricalEvent[]
const eras = erasData as Era[]
const wars = events.filter(e => e.category === '军事' || e.category === 'military')

import { MAJOR_WARS, type MajorWar, type MajorWarNode } from '@/data/majorWars'
import MajorWarDetailDialog from '@/components/Wars/MajorWarDetailDialog'

interface Props {
  isActive: boolean
  onClose: () => void
  /** 跳到主地图：父组件关闭本视图 + 切到地图 */
  onViewOnMap?: () => void
}

type RegionFilter = 'all' | 'china' | 'world'

export default function WarsOverview({ isActive, onClose, onViewOnMap }: Props) {
  const [region, setRegion] = useState<RegionFilter>('all')
  const [importance, setImportance] = useState<0 | 1 | 2 | 3>(0)
  const [query, setQuery] = useState('')
  const [selectedWar, setSelectedWar] = useState<HistoricalEvent | null>(null)
  const [selectedMajorWar, setSelectedMajorWar] = useState<MajorWar | null>(null)
  const [selectedMajorNode, setSelectedMajorNode] = useState<{ mw: MajorWar; node: MajorWarNode } | null>(null)

  // 战争卡片容器 — GSAP stagger 进场
  const warCardsRef = useRef<HTMLDivElement | null>(null)
  // 大型战争专题卡片容器 — 单独 stagger
  const majorWarCardsRef = useRef<HTMLDivElement | null>(null)

  // AI 对话准备
  const setContext = useAIStore(s => s.setContext)
  const setPersonaPrompt = useAIStore(s => s.setPersonaPrompt)
  const newThread = useAIStore(s => s.newThread)
  const openPanel = useAIStore(s => s.openPanel)
  const allContexts = useAllLearningContexts()
  // 跳到地图：设置年份 + 聚焦到战争地点
  const jumpToMap = useJumpToMap()

  /** 处理"在地图看位置"：通过 jumpToMap 统一走 EraDetail 相同路径 */
  const handleViewOnMap = (war: HistoricalEvent) => {
    if (war.coordinates) {
      const warKw = warSearchKeywords[war.id] ?? `${war.title} battle`
      jumpToMap(war.coordinates!, war.title, 4, {
        coverImageUrl: bingImage(warKw, 400, 240),
        snippet: summarizeEvent(war),
        reopenLabel: war.title,
        warId: war.id,
      })
    }
    setSelectedWar(null)
    onViewOnMap?.()
  }

  // 浮层 ← 按钮返回：mount 时立即读 pendingReopen 重开对应弹窗
  // 用 setTimeout 推迟消费，避免 React Strict Mode 双挂载时第一次消费后第二次看到 null
  useEffect(() => {
    if (!isActive) return
    const timer = setTimeout(() => {
      const pending = useHistoryStore.getState().pendingReopen
      if (!pending) return
      if (pending.kind === 'war') {
        const war = wars.find(w => w.id === pending.warId)
        if (war) setSelectedWar(war)
        useHistoryStore.getState().setPendingReopen(null)
      } else if (pending.kind === 'majorWar') {
        const mw = MAJOR_WARS.find(m => m.key === pending.mwKey)
        if (mw) setSelectedMajorWar(mw)
        useHistoryStore.getState().setPendingReopen(null)
      } else if (pending.kind === 'majorWarNode') {
        const mw = MAJOR_WARS.find(m => m.key === pending.mwKey)
        const node = mw?.nodes[pending.nodeIndex]
        if (mw && node) setSelectedMajorNode({ mw, node })
        useHistoryStore.getState().setPendingReopen(null)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [isActive])

  // ESC 关闭
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedWar) setSelectedWar(null)
        else if (selectedMajorNode) setSelectedMajorNode(null)
        else if (selectedMajorWar) setSelectedMajorWar(null)
        else onClose()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, selectedWar, selectedMajorNode, selectedMajorWar, onClose])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return wars.filter(w => {
      if (region === 'china' && w.region !== 'china') return false
      if (region === 'world' && w.region === 'china') return false
      if (importance > 0 && w.importance !== importance) return false
      if (q && !(w.title.toLowerCase().includes(q) || (w.description ?? '').toLowerCase().includes(q))) return false
      return true
    }).sort((a, b) => a.year - b.year)
  }, [region, importance, query])

  const handleChat = (war: HistoricalEvent) => {
    // 上下文：所属朝代（让 AI 知道背景时期）
    setContext(war.relatedEraId ?? null, war.id, null)
    // 拼上学习上下文（让 AI 知道用户学过什么）
    const contextString = allContexts[war.relatedEraId ?? '']?.contextString ?? ''
    // persona prompt 注入战争的 4 段内容（如有）+ 守则
    const warDetails = [
      war.warBackground && `【背景】\n${war.warBackground}`,
      war.description && `【经过】\n${war.description}`,
      war.warResult && `【结果】\n${war.warResult}`,
      war.warImpact && `【影响】\n${war.warImpact}`,
    ].filter(Boolean).join('\n\n')
    const basePersona = `你是历史军事专家。请基于以下这场战争的背景资料回答用户问题，保持客观中立，引述史料，遇到存疑处说明学界争议。\n\n【战争】${war.title}（${war.year < 0 ? `BC ${-war.year}` : war.year}）\n${war.country ? `地点：${war.country}\n` : ''}${warDetails}`
    const persona = enhancePersonaPrompt(basePersona + contextString, '历史军事专家')
    setPersonaPrompt(persona)
    newThread(`关于 ${war.title}`)
    openPanel()
    setSelectedWar(null)
  }

  // GSAP stagger: 战争卡片入场（筛选/搜索时重跑）
  useStaggerEntrance(warCardsRef, '.war-card', [region, importance, query, filtered.length])

  // GSAP stagger: 大型战争专题卡片入场（每次组件挂载跑一次）
  useStaggerEntrance(majorWarCardsRef, '.major-war-card', [], { y: 18, scale: 0.95, duration: 0.5, each: 0.06 })

  if (!isActive) return null

  return (
    <OverviewLayout
      emoji="⚔️"
      title="全战争"
      subtitle={`${filtered.length} / ${wars.length} 场战争 · 从公元前 1046 武王伐纣到 20 世纪`}
      onClose={onClose}
      suppressEsc
      headerBorderClass="border-red-700/40"
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
            {(['all', 'china', 'world'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-3 py-1.5 transition-colors ${
                  region === r
                    ? 'bg-red-700/40 text-red-300'
                    : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
                }`}
              >
                {r === 'all' ? '全部' : r === 'china' ? '🇨🇳 中国' : '🌍 世界'}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
            {([0, 1, 2, 3] as const).map(i => (
              <button
                key={i}
                onClick={() => setImportance(i)}
                className={`px-2.5 py-1.5 transition-colors ${
                  importance === i
                    ? 'bg-red-700/40 text-red-300'
                    : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
                }`}
                title={i === 0 ? '全部' : `重要性 ${i}（${i === 3 ? '关键' : i === 2 ? '重要' : '一般'}）`}
              >
                {i === 0 ? '全部' : `${'⭐'.repeat(i)}`}
              </button>
            ))}
          </div>
          <OverviewSearch value={query} onChange={setQuery} placeholder="搜索战争名/描述..." minWidth={200} />
        </div>
      }
    >
      {/* 🔥 大型/长期战争专题 — 单独的醒目栏目 */}
      {MAJOR_WARS.length > 0 && (
        <div className="py-4">
          <div className="mb-3 flex items-baseline gap-2">
            <h3 className="text-base font-serif text-red-300">🔥 大型战争专题</h3>
            <span className="text-xs text-ink-500">持续多年、多国卷入的综合博弈</span>
          </div>
          <div ref={majorWarCardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {MAJOR_WARS.map(mw => {
              const startYearLabel = mw.startYear < 0 ? `BC ${-mw.startYear}` : `${mw.startYear}`
              const endYearLabel = mw.endYear < 0 ? `BC ${-mw.endYear}` : `${mw.endYear}`
              const mwKw = majorWarSearchKeywords[mw.key] ?? mw.title
              const mwImg = bingImage(mwKw, 400, 240)
              return (
                <div
                  key={mw.key}
                  className="major-war-card rounded-lg border border-red-700/40 bg-gradient-to-br from-red-950/30 to-ink-800/80 hover:border-red-500/80 transition-colors overflow-hidden"
                >
                  {/* 顶部图片 */}
                  <div className="relative w-full bg-ink-900" style={{ aspectRatio: '16/9' }}>
                    <img
                      src={mwImg}
                      alt={mw.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink-900/60 pointer-events-none" />
                    {/* 标题覆盖在图片底部 */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 pt-6 pb-2">
                      <div className="text-sm font-serif text-red-100 truncate">{mw.title}</div>
                      <div className="text-xs text-ink-200 tabular-nums">
                        {startYearLabel} ~ {endYearLabel} · {mw.nodes.length} 个关键节点
                      </div>
                    </div>
                    {mw.importance === 3 && (
                      <span className="absolute top-2 right-2 text-xs text-amber-300 bg-ink-900/70 backdrop-blur px-1.5 py-0.5 rounded-lg">⭐ 关键</span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-[11px] text-parchment-100 leading-relaxed mb-2 line-clamp-3">
                      {mw.summary}
                    </div>
                    {/* 显示前 3 个关键节点标题 */}
                    <div className="text-xs text-ink-500 mb-2">
                      关键节点预览：
                      {mw.nodes.slice(0, 3).map((n, i) => (
                        <span key={i} className="ml-1 text-ink-400">
                          {n.title}{i < Math.min(2, mw.nodes.length - 1) ? '、' : ''}
                        </span>
                      ))}
                      {mw.nodes.length > 3 && <span className="text-ink-600"> 等</span>}
                    </div>
                    {/* 进入专题详情按钮 */}
                    <button
                      onClick={() => setSelectedMajorWar(mw)}
                      className="w-full px-3 py-1.5 rounded-lg bg-red-800/50 hover:bg-red-700/70 border border-red-600/60 text-red-100 text-xs transition-colors"
                    >
                      📖 进入专题详情 →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 列表 */}
      <div className="py-6">
        {filtered.length === 0 ? (
          <EmptyState
            emoji="🕊"
            title="未找到匹配的战争"
            hint="调整筛选条件，或按 ESC 退出取消筛选"
          />
        ) : (
          <div ref={warCardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(war => {
              const yearLabel = war.year < 0 ? `BC ${-war.year}` : `${war.year}`
              const relatedEra = war.relatedEraId ? eras.find(e => e.id === war.relatedEraId) : null
              const warKw = warSearchKeywords[war.id] ?? `${war.title} battle`
              const warImg = bingImage(warKw, 400, 240)
              const firstSentence = (war.warBackground || war.description || '').split(/[。.!?！？]/)[0].trim()
              return (
                <div
                  key={war.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedWar(war)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedWar(war) } }}
                  className="war-card text-left rounded-lg border border-ink-600 bg-ink-800/60 hover:border-red-500/60 hover:bg-ink-700/60 transition-colors group overflow-hidden flex cursor-pointer focus:outline-none focus:ring-2 focus:ring-vermilion-500"
                >
                  {/* 战争图片 */}
                  <div className="relative w-32 flex-shrink-0 bg-ink-900">
                    <img
                      src={warImg}
                      alt={war.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink-800/30 pointer-events-none" />
                  </div>
                  {/* 信息 */}
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-red-400 tabular-nums font-serif">{yearLabel}</span>
                      {war.importance === 3 && <span className="text-amber-400 text-xs">⭐ 关键</span>}
                      {war.importance === 2 && <span className="text-amber-400/60 text-xs">⭐ 重要</span>}
                      {war.region === 'china'
                        ? <span className="text-xs px-1.5 py-0.5 rounded-lg bg-amber-900/30 text-amber-300 border border-amber-700/40">中国</span>
                        : <span className="text-xs px-1.5 py-0.5 rounded-lg bg-blue-900/30 text-blue-300 border border-blue-700/40">世界</span>
                      }
                    </div>
                    <div className="text-sm font-serif text-parchment-50 truncate">{war.title}</div>
                    <div className="text-[11px] text-ink-400 line-clamp-2 mt-0.5">{war.description}</div>
                    {relatedEra && (
                      <div className="text-xs text-ink-500 mt-1">
                        朝代：<span style={{ color: relatedEra.color }}>{relatedEra.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedWar && (
        <WarDetailDialog
          war={selectedWar}
          onClose={() => setSelectedWar(null)}
          onChat={() => handleChat(selectedWar)}
          onViewOnMap={() => handleViewOnMap(selectedWar)}
        />
      )}

      {/* 🔥 大型战争专题详情弹窗 */}
      {selectedMajorWar && !selectedMajorNode && (
        <MajorWarDetailDialog
          mw={selectedMajorWar}
          onClose={() => setSelectedMajorWar(null)}
          onSelectNode={(node) => setSelectedMajorNode({ mw: selectedMajorWar, node })}
        />
      )}

      {/* 🔥 大型战争 — 节点详情弹窗（4 段结构化） */}
      {selectedMajorNode && (
        <MajorWarNodeDetailDialog
          mw={selectedMajorNode.mw}
          node={selectedMajorNode.node}
          onClose={() => setSelectedMajorNode(null)}
          onBack={() => setSelectedMajorNode(null)}
          onSwitchNode={(n) => setSelectedMajorNode({ mw: selectedMajorNode.mw, node: n })}
          onJumpToMap={(lngLat, _year, label) => {
            setSelectedMajorNode(null)
            setSelectedMajorWar(null)
            const nodeIdx = selectedMajorNode.mw.nodes.findIndex(
              (n: MajorWarNode) => n.title === selectedMajorNode.node.title,
            )
            const mwKw = majorWarSearchKeywords[selectedMajorNode.mw.key] ?? selectedMajorNode.mw.title
            const firstSentence = (selectedMajorNode.node.detail ?? selectedMajorNode.node.description ?? '').split(/[。.!?！？]/)[0].trim()
            jumpToMap(lngLat, label, 5, {
              coverImageUrl: bingImage(mwKw, 400, 240),
              snippet: firstSentence.slice(0, 120),
              reopenLabel: label,
              mwKey: selectedMajorNode.mw.key,
              nodeIndex: nodeIdx >= 0 ? nodeIdx : 0,
            })
          }}
          onChat={() => {
            const adHocWar: HistoricalEvent = {
              id: `major-${selectedMajorNode.mw.key}-${selectedMajorNode.node.year}-${selectedMajorNode.node.title.slice(0, 4)}`,
              year: selectedMajorNode.node.year,
              title: selectedMajorNode.node.title,
              category: '军事',
              region: 'other',
              description: selectedMajorNode.node.description,
              importance: selectedMajorNode.node.importance,
            }
            // 不关闭弹窗 — 用户要对照内容提问
            handleChat(adHocWar)
          }}
        />
      )}
    </OverviewLayout>
  )
}

function WarDetailDialog({ war, onClose, onChat, onViewOnMap }: {
  war: HistoricalEvent
  onClose: () => void
  onChat: () => void
  onViewOnMap: () => void
}) {
  const yearLabel = war.year < 0 ? `BC ${-war.year}` : `${war.year}`
  const relatedEra = war.relatedEraId ? eras.find(e => e.id === war.relatedEraId) : null
  const warKw = warSearchKeywords[war.id] ?? `${war.title} battle`
  const warImg = bingImage(warKw, 800, 450)
  const jumpToMap = useJumpToMap()

  // 根据 importance 决定内容丰富度
  const isKey = war.importance === 3
  const isMajor = war.importance === 2

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-red-700/40 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="战争详情"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 战争图片 */}
        <div className="relative w-full bg-ink-900" style={{ aspectRatio: '16/9' }}>
          <img
            src={warImg}
            alt={war.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          {/* 标题+年份覆盖 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-900/95 to-transparent px-6 pt-8 pb-3">
            <div className="text-xs text-ink-300 mb-0.5 flex items-center gap-2">
              <span>⚔️ 战争</span>
              <span className="tabular-nums">{yearLabel}</span>
              {isKey && <span className="text-amber-400">⭐ 关键</span>}
              {isMajor && <span className="text-amber-400/60">⭐ 重要</span>}
              {war.region === 'china'
                ? <span className="px-1.5 py-0.5 rounded-lg bg-amber-900/30 text-amber-300 border border-amber-700/40">中国</span>
                : <span className="px-1.5 py-0.5 rounded-lg bg-blue-900/30 text-blue-300 border border-blue-700/40">世界</span>
              }
            </div>
            <h3 className="text-2xl font-serif text-red-200">{war.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-parchment-50/80 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg bg-ink-900/60 hover:bg-ink-900/80 backdrop-blur"
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* 朝代 / 时期 */}
          {relatedEra && (
            <div>
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🏛️ 所属朝代</div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-lg border"
                  style={{ background: relatedEra.color + '20', color: relatedEra.color, borderColor: relatedEra.color + '40' }}
                >
                  {relatedEra.name}
                </span>
                <span className="text-xs text-ink-500 tabular-nums">
                  {relatedEra.startYear < 0 ? `BC ${-relatedEra.startYear}` : relatedEra.startYear} ~ {relatedEra.endYear < 0 ? `BC ${-relatedEra.endYear}` : relatedEra.endYear}
                </span>
              </div>
            </div>
          )}

          {/* 地理位置 */}
          {war.country && (
            <div>
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">📍 地点</div>
              <div className="text-sm text-parchment-50">{war.country}</div>
              {war.coordinates && (
                <button
                  type="button"
                  onClick={() => jumpToMap(war.coordinates!, war.title, 4, {
                    coverImageUrl: bingImage(warKw, 400, 240),
                    snippet: summarizeEvent(war),
                    reopenLabel: war.title,
                    warId: war.id,
                  })}
                  className="text-xs text-ink-500 tabular-nums mt-0.5 hover:text-vermilion-300 transition-colors group inline-flex items-center gap-1"
                  title="在地图上定位"
                >
                  {war.coordinates[0].toFixed(2)}°E, {war.coordinates[1].toFixed(2)}°N
                  <span className="text-vermilion-300 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                </button>
              )}
            </div>
          )}

          {/* 背景 — 战前形势 */}
          {war.warBackground && (
            <div>
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">📜 战争背景</div>
              <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
                {war.warBackground}
              </div>
            </div>
          )}

          {/* 🗺️ 缩略地图 — 显示战争位置（直接用 war.coordinates 经纬度） */}
          {war.coordinates && (
            <div>
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🗺️ 位置</div>
              <MiniMap
                focusNode={{
                  title: war.title,
                  year: war.year,
                  location: war.country || `${war.coordinates[0].toFixed(1)}, ${war.coordinates[1].toFixed(1)}`,
                  importance: war.importance,
                  coordinates: war.coordinates,
                }}
                allNodes={[{
                  title: war.title,
                  year: war.year,
                  location: war.country || `${war.coordinates[0].toFixed(1)}, ${war.coordinates[1].toFixed(1)}`,
                  importance: war.importance,
                  coordinates: war.coordinates,
                }]}
                onJumpToMap={() => {
                  onViewOnMap()
                }}
              />
            </div>
          )}

          {/* 经过 — 主描述（必显示） */}
          <div>
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">⚔️ 战争经过</div>
            <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
              {war.description ?? '（暂无描述）'}
            </div>
          </div>

          {/* 结果 — 胜负/签约 */}
          {war.warResult && (
            <div>
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🏁 战争结果</div>
              <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
                {war.warResult}
              </div>
            </div>
          )}

          {/* 影响 — 后世格局变化（如果有） */}
          {war.warImpact && (
            <div className="p-3 rounded-lg bg-amber-900/15 border border-amber-700/40">
              <div className="text-xs text-amber-400 uppercase tracking-wider mb-1.5">🎯 历史影响</div>
              <div className="text-sm text-parchment-100 leading-relaxed">
                {war.warImpact}
              </div>
            </div>
          )}

          {/* 关联事件（同一战争的后续/前奏） */}
          {war.relatedEventIds && war.relatedEventIds.length > 0 && (
            <div>
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🔗 关联事件</div>
              <div className="flex flex-wrap gap-1.5">
                {war.relatedEventIds.map(eid => {
                  const related = events.find(e => e.id === eid)
                  if (!related) return null
                  return (
                    <span
                      key={eid}
                      className="text-xs px-2 py-0.5 rounded-lg bg-ink-700/60 text-ink-300 border border-ink-600"
                      title={`${related.year < 0 ? `BC ${-related.year}` : related.year} · ${related.title}`}
                    >
                      {related.title}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* 重要度提示（无 warImpact 时 fallback） */}
          {isKey && !war.warImpact && (
            <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-700/40">
              <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">🎯 历史意义</div>
              <div className="text-xs text-parchment-100 leading-relaxed">
                这场战争被史学界视为<strong className="text-amber-300">改写历史进程</strong>的关键事件。
                {relatedEra && <>它直接影响了<strong style={{ color: relatedEra.color }}>{relatedEra.name}</strong>的走向。 </>}
                建议从其所属朝代/时期的"朝代时间线"路径了解更完整的上下文。
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t border-ink-700">
            {war.coordinates && (
              <button
                onClick={onViewOnMap}
                className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-600/50 text-emerald-200 text-sm transition-colors"
              >
                🗺️ 在地图看位置
              </button>
            )}
            <button
              onClick={onChat}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-900/40 hover:bg-red-800/60 border border-red-600/50 text-red-200 text-sm transition-colors"
            >
              💬 询问这场战争
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 text-sm transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * MajorWarNodeDetailDialog — 大型战争节点详情（4 段结构化）
 * 风格与 WarDetailDialog 一致：背景 / 经过 / 结果 / 影响
 * 没补 4 段详细内容的节点用通用模板回退
 */
function MajorWarNodeDetailDialog({ mw, node, onClose, onBack, onChat, onSwitchNode, onJumpToMap }: {
  mw: MajorWar
  node: MajorWarNode
  onClose: () => void
  onBack: () => void
  onChat: () => void
  /** 切换到其他节点（从缩略图点击其他节点触发） */
  onSwitchNode: (node: MajorWarNode) => void
  /** 跳到主地图（从缩略图跳到主地图按钮触发） */
  onJumpToMap: (lngLat: [number, number], year: number, label: string) => void
}) {
  const yearLabel = node.year < 0 ? `BC ${-node.year}` : `${node.year}`

  // 计算"之前/之后"节点（用于上下文）
  const idx = mw.nodes.findIndex(n => n.title === node.title && n.year === node.year)
  const prevNode = idx > 0 ? mw.nodes[idx - 1] : null
  const nextNode = idx >= 0 && idx < mw.nodes.length - 1 ? mw.nodes[idx + 1] : null

  // 是否有详细 4 段
  const hasDetail = node.background || node.detail || node.result || node.impact

  // 节点坐标：优先用 node.coordinates（精确），否则查 DICT
  const nodePos = node.coordinates || lookupLocationStrict(node.location)
  const handleJump = () => {
    if (!nodePos) return
    // 走 props.onJumpToMap（父组件统一处理 setSelectedMajorNode(null) + jumpToMap）
    onJumpToMap(nodePos, node.year, `${node.title}（${node.location}）`)
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-red-700/40 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="战争详情"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-red-700/30 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-ink-500 mb-1">
            <button
              onClick={onBack}
              className="text-red-300 hover:text-red-200 transition-colors"
              title="返回专题列表"
              aria-label="返回专题列表"
            >
              ← {mw.title}
            </button>
            <span>·</span>
            <span>关键节点</span>
            {node.importance === 3 && <span className="text-amber-400">⭐ 关键</span>}
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-ink-500 mb-1 tabular-nums flex items-center gap-2">
                <span>{yearLabel}</span>
                {node.location && nodePos && (
                  <button
                    type="button"
                    onClick={handleJump}
                    className="inline-flex items-center gap-1 text-ink-500 hover:text-vermilion-300 transition-colors group"
                    title="在地图上定位"
                  >
                    📍 {node.location}
                    <span className="text-vermilion-300 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                  </button>
                )}
                {node.location && !nodePos && (
                  <span className="text-ink-500" title="暂无该地点坐标">📍 {node.location}</span>
                )}
              </div>
              <h3 className="text-xl font-serif text-red-200">{node.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700"
              title="关闭 (ESC)"
              aria-label="关闭"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* 🗺️ 缩略地图 — 显示节点位置 + 同大战争其他节点 */}
          <div>
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🗺️ 位置</div>
            <MiniMap
              focusNode={node}
              allNodes={mw.nodes}
              onSwitchNode={(n) => onSwitchNode(n as MajorWarNode)}
              onJumpToMap={onJumpToMap}
            />
          </div>

          {/* 概述 — 必有 */}
          <div>
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">📜 节点概述</div>
            <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
              {node.description}
            </div>
          </div>

          {hasDetail ? (
            <>
              {/* 背景 */}
              {node.background && (
                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🌐 背景</div>
                  <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
                    {node.background}
                  </div>
                </div>
              )}

              {/* 经过 */}
              {node.detail && (
                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">⚔️ 详细经过</div>
                  <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
                    {node.detail}
                  </div>
                </div>
              )}

              {/* 结果 */}
              {node.result && (
                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🏁 结果</div>
                  <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
                    {node.result}
                  </div>
                </div>
              )}

              {/* 影响 */}
              {node.impact && (
                <div className="p-3 rounded-lg bg-amber-900/15 border border-amber-700/40">
                  <div className="text-xs text-amber-400 uppercase tracking-wider mb-1.5">🎯 历史影响</div>
                  <div className="text-sm text-parchment-100 leading-relaxed">
                    {node.impact}
                  </div>
                </div>
              )}
            </>
          ) : (
            // 没补详细内容的节点：通用回退
            <div className="p-3 rounded-lg bg-amber-900/15 border border-amber-700/40">
              <div className="text-xs text-amber-400 uppercase tracking-wider mb-1.5">💡 上下文</div>
              <div className="text-sm text-parchment-100 leading-relaxed">
                {prevNode && (
                  <>这是 <span className="text-red-300">{prevNode.title}</span>（{prevNode.year < 0 ? `BC ${-prevNode.year}` : prevNode.year}）之后的关键节点。 </>
                )}
                {nextNode && (
                  <>之后是 <span className="text-red-300">{nextNode.title}</span>（{nextNode.year < 0 ? `BC ${-nextNode.year}` : nextNode.year}）。</>
                )}
                {!prevNode && !nextNode && (
                  <span className="text-ink-400 italic">（暂无前后节点信息）</span>
                )}
              </div>
            </div>
          )}

          {/* 底部按钮 */}
          <div className="flex gap-2 pt-3 border-t border-ink-700">
            <button
              onClick={onChat}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-900/40 hover:bg-red-800/60 border border-red-600/50 text-red-200 text-sm transition-colors"
            >
              💬 询问此节点
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2.5 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 text-sm transition-colors"
            >
              返回专题
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
