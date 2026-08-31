/**
 * ReligionOverview — 全宗教板块
 *
 * 详细整理从古至今的重要宗教
 *
 * 使用统一的 OverviewLayout + OverviewSearch + OverviewRichContent
 * 与其他板块（全思想/全科技/全神话...）保持一致的风格。
 */
import { useMemo, useState } from 'react'
import OverviewLayout from '@/components/ui/OverviewLayout'
import OverviewSearch from '@/components/ui/OverviewSearch'
import EmptyState from '@/components/ui/EmptyState'
import { RELIGIONS, RELIGION_CATEGORIES, type Religion } from '@/data/allReligion'
import { bingImage } from '@/utils/geoImage'
import { audioEngine } from '@/utils/audioEngine'
import ModalShell from '@/components/ui/Modal'
import { OverviewRichContent } from '@/components/ui/OverviewRichContent'

interface Props {
  isActive: boolean
  onClose: () => void
}

const CATEGORY_MAP: Record<string, string> = {
  '亚伯拉罕一神教': 'abrahamic',
  '印度本土宗教': 'indian',
  '中国本土宗教': 'chinese',
  '东亚宗教': 'east-asian',
  '新兴宗教': 'emerging',
}

export default function ReligionOverview({ isActive, onClose }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return RELIGIONS.filter(r => {
      const catId = CATEGORY_MAP[r.category] ?? r.category
      const matchCategory = categoryFilter === 'all' || catId === categoryFilter
      const matchQuery = !q || r.name.toLowerCase().includes(q) || (r.westernName?.toLowerCase().includes(q) ?? false) || r.summary.includes(q) || r.category.includes(q)
      return matchCategory && matchQuery
    })
  }, [categoryFilter, query])

  const selected = selectedId ? RELIGIONS.find(r => r.id === selectedId) ?? null : null

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
        全部 ({RELIGIONS.length})
      </button>
      {RELIGION_CATEGORIES.map(c => {
        const cnt = RELIGIONS.filter(r => (CATEGORY_MAP[r.category] ?? r.category) === c.id).length
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
        placeholder="搜索宗教名..."
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
      ariaLabel="全宗教"
    >
      <OverviewLayout
        emoji="🛕"
        title="全宗教"
        subtitle={`详细整理从古至今的重要宗教 · 共 ${RELIGIONS.length} 个宗教 · 5 大体系`}
        onClose={onClose}
        suppressEsc={!!selectedId}
        toolbar={toolbar}
        headerBorderClass="border-vermilion-500/40"
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="没有匹配的宗教"
            hint="试试清空筛选条件，或切换到「全部」"
            emoji="🔍"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(r => (
              <ReligionCard
                key={r.id}
                religion={r}
                onClick={() => {
                  audioEngine.playModalOpen()
                  setSelectedId(r.id)
                }}
              />
            ))}
          </div>
        )}

        <footer className="mt-8 pt-4 border-t border-ink-700/40 text-center text-xs text-ink-500">
          🛕 全宗教 · 当前数据：{RELIGIONS.length} 个宗教 · 后续将扩展到 20+ 个
        </footer>
      </OverviewLayout>

      {selected && (
        <ReligionDetail
          religion={selected}
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

function ReligionCard({ religion, onClick }: { religion: Religion; onClick: () => void }) {
  const coverKw = `${religion.name} ${religion.westernName ?? ''} temple worship`
  const cover = bingImage(coverKw, 400, 400)
  const totalModules = religion.facts.length + religion.sections.length + religion.timeline.length + religion.related.length
  const color = RELIGION_CATEGORIES.find(c => (CATEGORY_MAP[religion.category] ?? religion.category) === c.id)?.color ?? '#9b7eb6'

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl bg-ink-700/30 border border-ink-600/40 hover:border-vermilion-500/60 transition-all hover:scale-[1.01] text-left flex flex-col"
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
          <h3 className="font-serif text-lg text-bone leading-tight">{religion.name}</h3>
          {religion.westernName && (
            <span className="text-[10px] text-ink-300 italic truncate">{religion.westernName}</span>
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
            {religion.category}
          </span>
          <span className="text-[10px] text-vermilion-300">📅 {religion.era}</span>
        </div>
        {religion.founder && (
          <div className="text-xs text-bronze-400 mb-2">👤 {religion.founder}</div>
        )}
        <div className="text-sm text-parchment-50 leading-relaxed line-clamp-2 mb-2">{religion.summary}</div>
        <div className="text-xs text-ink-300 line-clamp-2 mb-3 flex-1">{religion.region}</div>
        <div className="pt-2 border-t border-ink-600/30 flex items-center justify-between">
          <span className="text-[10px] text-ink-400">富内容 {totalModules} 模块</span>
          <span className="text-xs text-vermilion-300 group-hover:text-vermilion-200">查看详情 →</span>
        </div>
      </div>
    </button>
  )
}

function ReligionDetail({ religion, onClose, onSelect }: { religion: Religion; onClose: () => void; onSelect: (id: string) => void }) {
  const imgKw = `${religion.name} ${religion.westernName ?? ''} temple sacred`
  const eventImg = bingImage(imgKw, 800, 450)
  const color = RELIGION_CATEGORIES.find(c => (CATEGORY_MAP[religion.category] ?? religion.category) === c.id)?.color ?? '#9b7eb6'

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
              {religion.category} · {religion.era}
            </div>
            <h2 className="text-3xl font-serif leading-tight text-bone">
              {religion.name}
              {religion.westernName && <span className="text-lg text-ink-400 ml-2">{religion.westernName}</span>}
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
            <div className="text-sm text-parchment-50 leading-relaxed">{religion.summary}</div>
          </div>

          <OverviewRichContent item={religion as any} />

          {religion.related && religion.related.length > 0 && (
            <div>
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-2">🔗 相关宗教</div>
              <div className="flex flex-wrap gap-2">
                {religion.related.map((r: any, i: number) => (
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
