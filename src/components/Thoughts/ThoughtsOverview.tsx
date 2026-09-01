/**
 * ThoughtsOverview — 全思想板块
 *
 * 集中收集整理全人类的思想精华
 *
 * 使用统一的 OverviewLayout + OverviewSearch + OverviewRichContent
 * 与其他板块（人物/战争/神话/诗词/文化/地理/文明/传统）保持一致的风格。
 */
import { useEffect, useMemo, useState, useRef } from 'react'
import OverviewLayout from '@/components/ui/OverviewLayout'
import OverviewSearch from '@/components/ui/OverviewSearch'
import EmptyState from '@/components/ui/EmptyState'
import { THINKERS, THINKER_REGIONS, type Thinker, type ThinkerRegion } from '@/data/allThoughts'
import { bingImage } from '@/utils/geoImage'
import { audioEngine } from '@/utils/audioEngine'
import ModalShell from '@/components/ui/Modal'
import { OverviewRichContent } from '@/components/ui/OverviewRichContent'
import { useRevealStagger } from '@/hooks/useReveal'

interface Props {
  isActive: boolean
  onClose: () => void
}

// 区域标签 & 颜色（用于过滤按钮 + 卡片顶条）
const REGION_LABELS: Record<string, string> = {
  china: '中国',
  greece: '古希腊',
  india: '古印度',
  europe: '欧洲',
  'middle-east': '中东',
  modern: '现代',
}

const REGION_COLORS: Record<string, string> = {
  china: '#c89a5b',
  greece: '#5b9bc8',
  india: '#b85450',
  europe: '#9b7eb6',
  'middle-east': '#d4a85b',
  modern: '#5bc89a',
}

export default function ThoughtsOverview({ isActive, onClose }: Props) {
  const [regionFilter, setRegionFilter] = useState<ThinkerRegion | 'all'>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return THINKERS.filter(t => {
      const matchRegion = regionFilter === 'all' || t.region === regionFilter
      const q = query.toLowerCase().trim()
      const matchQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.westernName?.toLowerCase().includes(q) ?? false) ||
        t.school.includes(q) ||
        t.title.includes(q)
      return matchRegion && matchQuery
    })
  }, [regionFilter, query])

  const selected = selectedId ? THINKERS.find(t => t.id === selectedId) ?? null : null

  // ESC 优先关闭详情弹窗，再关闭外层
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        if (selectedId) setSelectedId(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, selectedId, onClose])

  // P1.2 卡片网格滚动入场
  const cardsGridRef = useRef<HTMLDivElement>(null)
  useRevealStagger(cardsGridRef, '[data-thinker-card]', {
    y: 18,
    duration: 0.45,
    each: 0.04,
    delay: 0.05,
    scale: 0.96,
  })

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => setRegionFilter('all')}
        className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
          regionFilter === 'all'
            ? 'bg-vermilion-700/40 text-vermilion-300 border border-bronze-600/40'
            : 'bg-ink-700/40 text-ink-300 hover:bg-ink-600/60'
        }`}
      >
        全部 ({THINKERS.length})
      </button>
      {THINKER_REGIONS.map(r => {
        const cnt = THINKERS.filter(t => t.region === r.id).length
        if (cnt === 0) return null
        const isSelected = regionFilter === r.id
        return (
          <button
            key={r.id}
            onClick={() => setRegionFilter(r.id as ThinkerRegion)}
            className="px-3 py-1.5 rounded-full text-xs transition-colors border"
            style={{
              background: isSelected ? r.color + '30' : undefined,
              color: isSelected ? r.color : '#9ca3af',
              borderColor: isSelected ? r.color : 'transparent',
            }}
          >
            {r.label} ({cnt})
          </button>
        )
      })}
      <OverviewSearch
        value={query}
        onChange={setQuery}
        placeholder="搜索姓名/流派..."
        minWidth={200}
        className="ml-auto max-w-xs"
      />
    </div>
  )

  return (
    <ModalShell
      isOpen={isActive}
      onClose={onClose}
      innerClassName="!max-w-6xl !w-full !bg-ink-900 !border-vermilion-500/40"
      ariaLabel="全思想"
    >
      <OverviewLayout
        emoji="💡"
        title="全思想"
        subtitle={`集中收集整理全人类的思想精华 · 共 ${THINKERS.length} 位思想家 · ${THINKER_REGIONS.filter(r => THINKERS.some(t => t.region === r.id)).length} 个区域`}
        onClose={onClose}
        suppressEsc={!!selectedId}
        toolbar={toolbar}
        headerBorderClass="border-vermilion-500/40"
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="没有匹配的思想家"
            hint="试试清空筛选条件，或切换到「全部」"
            emoji="🔍"
          />
        ) : (
          <div ref={cardsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 thinker-grid">
            {filtered.map(t => (
              <div data-thinker-card="">
              <ThinkerCard
                thinker={t}
                onClick={() => {
                  audioEngine.playModalOpen()
                  setSelectedId(t.id)
                }}
              />
              </div>
            ))}
          </div>
        )}

        <footer className="mt-8 pt-4 border-t border-ink-700/40 text-center text-xs text-ink-500">
          💡 全思想 · 当前数据：{THINKERS.length} 位思想家 · 后续将扩展到 50+ 位主流思想家
        </footer>
      </OverviewLayout>

      {/* 详情弹窗（独立 modal 层） */}
      {selected && (
        <ThinkerDetail
          thinker={selected}
          onClose={() => {
            audioEngine.playModalClose()
            setSelectedId(null)
          }}
          onSelect={(id) => {
            audioEngine.playModalOpen()
            setSelectedId(id)
          }}
        />
      )}
    </ModalShell>
  )
}

// ===== 卡片 =====
function ThinkerCard({ thinker, onClick }: { thinker: Thinker; onClick: () => void }) {
  const coverKw = `${thinker.name} ${thinker.westernName ?? ''} philosopher portrait`
  const cover = bingImage(coverKw, 400, 400)
  const totalModules = thinker.facts.length + thinker.sections.length + thinker.timeline.length + thinker.related.length

  return (
    <button
      onClick={onClick}
      className="card-hover group relative overflow-hidden rounded-xl bg-ink-700/30 border border-ink-600/40 hover:border-vermilion-500/60 transition-all hover:scale-[1.01] text-left flex flex-col"
    >
      {/* 顶部封面图（区域主色作为网络失败占位） */}
      <div
        aria-hidden
        className="relative w-full h-28 bg-cover bg-center"
        style={{
          backgroundColor: REGION_COLORS[thinker.region] + '60',
          backgroundImage: `url(${cover})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-baseline justify-between">
          <h3 className="font-serif text-lg text-bone leading-tight">{thinker.name}</h3>
          {thinker.westernName && (
            <span className="text-[10px] text-ink-300 italic truncate">{thinker.westernName}</span>
          )}
        </div>
      </div>

      {/* 主体 */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded border"
            style={{
              color: REGION_COLORS[thinker.region],
              borderColor: REGION_COLORS[thinker.region] + '60',
              background: REGION_COLORS[thinker.region] + '10',
            }}
          >
            {REGION_LABELS[thinker.region]}
          </span>
          <span className="text-[10px] text-vermilion-300">📅 {thinker.era}</span>
        </div>
        <div className="text-xs text-bronze-400 mb-2">🏛 {thinker.school}</div>
        <div className="text-sm text-parchment-50 leading-relaxed line-clamp-2 mb-2">{thinker.title}</div>
        <div className="text-xs text-ink-300 line-clamp-2 mb-3 flex-1">{thinker.summary}</div>
        <div className="pt-2 border-t border-ink-600/30 flex items-center justify-between">
          <span className="text-[10px] text-ink-400">富内容 {totalModules} 模块</span>
          <span className="text-xs text-vermilion-300 group-hover:text-vermilion-200">查看详情 →</span>
        </div>
      </div>
    </button>
  )
}

// ===== 详情弹窗 =====
function ThinkerDetail({ thinker, onClose, onSelect }: { thinker: Thinker; onClose: () => void; onSelect: (id: string) => void }) {
  const yearLabel = thinker.era
  const imgKw = `${thinker.name} ${thinker.westernName ?? ''} portrait bust`
  const eventImg = bingImage(imgKw, 800, 450)
  const color = REGION_COLORS[thinker.region] ?? '#9b7eb6'

  return (
    <ModalShell isOpen onClose={onClose} innerStyle={{ borderColor: color + '60' }}>
      <div className="relative w-full bg-ink-900 max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="relative">
          <div
            className="w-full h-64 bg-cover bg-center"
            style={{
              backgroundColor: color + '60',
              backgroundImage: `url(${eventImg})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pt-8 pb-4">
            <div className="text-xs text-vermilion-300 mb-1 tracking-wider uppercase">
              {REGION_LABELS[thinker.region]} · {thinker.school} · {yearLabel}
            </div>
            <h2 className="text-3xl font-serif leading-tight text-bone">
              {thinker.name}
              {thinker.westernName && <span className="text-lg text-ink-400 ml-2">{thinker.westernName}</span>}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 text-parchment-50/80 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg bg-ink-900/60 hover:bg-ink-900/80 backdrop-blur"
            title="关闭 (ESC)"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* 简介 */}
          <div>
            <div className="text-xs text-ink-300 uppercase tracking-wider mb-2">📋 简介</div>
            <div className="text-sm text-parchment-50 leading-relaxed">{thinker.summary}</div>
          </div>

          {/* 富内容（复用 OverviewRichContent） */}
          <OverviewRichContent item={thinker as any} />

          {/* 跳转其他思想家 */}
          {thinker.related && thinker.related.length > 0 && (
            <div>
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-2">🔗 相关思想家</div>
              <div className="flex flex-wrap gap-2">
                {thinker.related.map((r: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => onSelect(r.id)}
                    className="px-3 py-1.5 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-xs text-bone hover:text-vermilion-300 transition-colors"
                  >
                    → {r.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  )
}
