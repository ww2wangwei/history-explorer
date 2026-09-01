/**
 * TechnologyOverview — 全科技板块
 *
 * 整理人类发展至今最具影响力的科技创新
 *
 * 使用统一的 OverviewLayout + OverviewSearch + OverviewRichContent
 * 与其他板块（全思想、全神话、全人物...）保持一致的风格。
 */
import { useMemo, useState } from 'react'
import OverviewLayout from '@/components/ui/OverviewLayout'
import OverviewSearch from '@/components/ui/OverviewSearch'
import EmptyState from '@/components/ui/EmptyState'
import { TECHNOLOGIES, TECH_CATEGORIES, type Technology } from '@/data/allTechnology'
import { bingImage } from '@/utils/geoImage'
import { audioEngine } from '@/utils/audioEngine'
import ModalShell from '@/components/ui/Modal'
import { OverviewRichContent } from '@/components/ui/OverviewRichContent'

interface Props {
  isActive: boolean
  onClose: () => void
}

// 类别映射（中文到 id）
const CATEGORY_KEYWORDS: Record<string, string> = {
  '能源': 'energy',
  '农业': 'agriculture',
  '通信': 'communication',
  '材料': 'material',
  '军事': 'military',
  '导航': 'navigation',
  '动力': 'power',
  '计算': 'calculation',
  '医学': 'medicine',
}

export default function TechnologyOverview({ isActive, onClose }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return TECHNOLOGIES.filter(t => {
      const catId = CATEGORY_KEYWORDS[t.category] ?? t.category
      const matchCategory = categoryFilter === 'all' || catId === categoryFilter
      const matchQuery = !q || t.name.toLowerCase().includes(q) || (t.westernName?.toLowerCase().includes(q) ?? false) || t.summary.includes(q) || t.category.includes(q)
      return matchCategory && matchQuery
    })
  }, [categoryFilter, query])

  const selected = selectedId ? TECHNOLOGIES.find(t => t.id === selectedId) ?? null : null

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => setCategoryFilter('all')}
        className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
          categoryFilter === 'all'
            ? 'bg-vermilion-700/40 text-vermilion-300 border border-bronze-600/40'
            : 'bg-ink-700/40 text-ink-300 hover:bg-ink-600/60'
        }`}
      >
        全部 ({TECHNOLOGIES.length})
      </button>
      {TECH_CATEGORIES.map(c => {
        const cnt = TECHNOLOGIES.filter(t => (CATEGORY_KEYWORDS[t.category] ?? t.category) === c.id).length
        if (cnt === 0) return null
        const isSelected = categoryFilter === c.id
        return (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className="px-3 py-1.5 rounded-full text-xs transition-colors border"
            style={{
              background: isSelected ? c.color + '30' : undefined,
              color: isSelected ? c.color : '#9ca3af',
              borderColor: isSelected ? c.color : 'transparent',
            }}
          >
            {c.label} ({cnt})
          </button>
        )
      })}
      <OverviewSearch
        value={query}
        onChange={setQuery}
        placeholder="搜索科技名/类别..."
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
      ariaLabel="全科技"
    >
      <OverviewLayout
        emoji="⚙️"
        title="全科技"
        subtitle={`整理人类发展至今最具影响力的科技创新 · 共 ${TECHNOLOGIES.length} 项科技 · 9 大领域`}
        onClose={onClose}
        suppressEsc={!!selectedId}
        toolbar={toolbar}
        headerBorderClass="border-vermilion-500/40"
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="没有匹配的科技"
            hint="试试清空筛选条件，或切换到「全部」"
            emoji="🔍"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(t => (
              <TechCard
                key={t.id}
                tech={t}
                onClick={() => {
                  audioEngine.playModalOpen()
                  setSelectedId(t.id)
                }}
              />
            ))}
          </div>
        )}

        <footer className="mt-8 pt-4 border-t border-ink-700/40 text-center text-xs text-ink-500">
          ⚙️ 全科技 · 当前数据：{TECHNOLOGIES.length} 项科技 · 后续将扩展到 30+ 项
        </footer>
      </OverviewLayout>

      {selected && (
        <TechDetail
          tech={selected}
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

function TechCard({ tech, onClick }: { tech: Technology; onClick: () => void }) {
  const coverKw = `${tech.name} ${tech.westernName ?? ''} innovation`
  const cover = bingImage(coverKw, 400, 400)
  const totalModules = tech.facts.length + tech.sections.length + tech.timeline.length + tech.related.length
  const color = TECH_CATEGORIES.find(c => (CATEGORY_KEYWORDS[tech.category] ?? tech.category) === c.id)?.color ?? '#9b7eb6'

  return (
    <button
      onClick={onClick}
      className="card-hover group relative overflow-hidden rounded-xl bg-ink-700/30 border border-ink-600/40 hover:border-vermilion-500/60 transition-all hover:scale-[1.01] text-left flex flex-col"
    >
      <div
        aria-hidden
        className="relative w-full h-28 bg-cover bg-center"
        style={{
          backgroundColor: color + '60',
          backgroundImage: `url(${cover})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-baseline justify-between">
          <h3 className="font-serif text-lg text-bone leading-tight">{tech.name}</h3>
          {tech.westernName && (
            <span className="text-[10px] text-ink-300 italic truncate">{tech.westernName}</span>
          )}
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded border"
            style={{
              color: color,
              borderColor: color + '60',
              background: color + '10',
            }}
          >
            {tech.category}
          </span>
          <span className="text-[10px] text-vermilion-300">📅 {tech.era}</span>
        </div>
        {tech.inventor && (
          <div className="text-xs text-bronze-400 mb-2">👤 {tech.inventor}</div>
        )}
        <div className="text-sm text-parchment-50 leading-relaxed line-clamp-2 mb-2">{tech.summary}</div>
        <div className="text-xs text-ink-300 line-clamp-2 mb-3 flex-1">{tech.region}</div>
        <div className="pt-2 border-t border-ink-600/30 flex items-center justify-between">
          <span className="text-[10px] text-ink-400">富内容 {totalModules} 模块</span>
          <span className="text-xs text-vermilion-300 group-hover:text-vermilion-200">查看详情 →</span>
        </div>
      </div>
    </button>
  )
}

function TechDetail({ tech, onClose, onSelect }: { tech: Technology; onClose: () => void; onSelect: (id: string) => void }) {
  const imgKw = `${tech.name} ${tech.westernName ?? ''} innovation history`
  const eventImg = bingImage(imgKw, 800, 450)
  const color = TECH_CATEGORIES.find(c => (CATEGORY_KEYWORDS[tech.category] ?? tech.category) === c.id)?.color ?? '#9b7eb6'

  return (
    <ModalShell isOpen onClose={onClose} innerStyle={{ borderColor: color + '60' }}>
      <div className="relative w-full bg-ink-900 max-w-4xl max-h-[90vh] overflow-y-auto">
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
              {tech.category} · {tech.era}
            </div>
            <h2 className="text-3xl font-serif leading-tight text-bone">
              {tech.name}
              {tech.westernName && <span className="text-lg text-ink-400 ml-2">{tech.westernName}</span>}
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
          <div>
            <div className="text-xs text-ink-300 uppercase tracking-wider mb-2">📋 简介</div>
            <div className="text-sm text-parchment-50 leading-relaxed">{tech.summary}</div>
          </div>

          <OverviewRichContent item={tech as any} />

          {tech.related && tech.related.length > 0 && (
            <div>
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-2">🔗 相关科技</div>
              <div className="flex flex-wrap gap-2">
                {tech.related.map((r: any, i: number) => (
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
