/**
 * ThoughtsOverview — 全思想板块
 * 集中收集整理全人类的思想精华
 * 卡片网格 + 详情弹窗（复用 OverviewRichContent 渲染富内容）
 */
import { useMemo, useState } from 'react'
import { THINKERS, THINKER_REGIONS, type Thinker, type ThinkerRegion } from '@/data/allThoughts'
import { bingImage } from '@/utils/geoImage'
import { audioEngine } from '@/utils/audioEngine'
import ModalShell from '@/components/ui/Modal'
import { OverviewRichContent } from '@/components/ui/OverviewRichContent'

interface Props {
  isActive: boolean
  onClose: () => void
}

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
      const matchQuery = !q || t.name.toLowerCase().includes(q) || (t.westernName?.toLowerCase().includes(q) ?? false) || t.school.includes(q) || t.title.includes(q)
      return matchRegion && matchQuery
    })
  }, [regionFilter, query])

  const selected = selectedId ? THINKERS.find(t => t.id === selectedId) ?? null : null

  return (
    <ModalShell isOpen={isActive} onClose={onClose} innerStyle={{ borderColor: '#9b7eb6' + '60' }}>
      <div className="w-full h-full bg-ink-900 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-ink-900/95 backdrop-blur border-b border-ink-700 px-6 py-4 flex items-center justify-between">
          <div>
            <button onClick={() => { audioEngine.playModalClose(); onClose() }} className="text-xs text-ink-400 hover:text-vermilion-300 mb-1">← 返回 Dashboard</button>
            <h1 className="font-serif text-2xl text-vermilion-300">💡 全思想</h1>
            <p className="text-xs text-ink-300 mt-0.5">集中收集整理全人类的思想精华 · {THINKERS.length} 位思想家</p>
          </div>
          <button onClick={() => { audioEngine.playModalClose(); onClose() }} className="px-3 py-1.5 rounded-lg bg-ink-700 hover:bg-ink-600 text-parchment-50 text-sm" title="关闭 (Esc)" aria-label="关闭">关闭</button>
        </header>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-ink-700/40">
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setRegionFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs ${regionFilter === 'all' ? 'bg-vermilion-700/40 text-vermilion-300 border border-bronze-600/40' : 'bg-ink-700/40 text-ink-300'}`}
            >全部 ({THINKERS.length})</button>
            {THINKER_REGIONS.map(r => {
              const cnt = THINKERS.filter(t => t.region === r.id).length
              if (cnt === 0) return null
              return (
                <button
                  key={r.id}
                  onClick={() => setRegionFilter(r.id as ThinkerRegion)}
                  className={`px-3 py-1.5 rounded-full text-xs ${regionFilter === r.id ? 'border' : ''}`}
                  style={{
                    background: regionFilter === r.id ? r.color + '30' : undefined,
                    color: regionFilter === r.id ? r.color : '#9ca3af',
                    borderColor: regionFilter === r.id ? r.color : 'transparent',
                  }}
                >{r.label} ({cnt})</button>
              )
            })}
            <input
              type="text"
              placeholder="搜索姓名/流派..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="ml-auto px-3 py-1.5 bg-ink-700/60 border border-ink-600 rounded-lg text-sm text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-vermilion-500/40"
            />
          </div>
        </div>

        {/* Card Grid */}
        <main className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(t => (
              <button
                key={t.id}
                onClick={() => { audioEngine.playModalOpen(); setSelectedId(t.id) }}
                className="group relative overflow-hidden rounded-xl bg-ink-700/30 border border-ink-600/40 hover:border-vermilion-500/60 transition-all hover:scale-[1.02] text-left"
              >
                {/* 顶部色块 */}
                <div className="h-2" style={{ background: REGION_COLORS[t.region] }} />
                {/* 头部 */}
                <div className="p-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-serif text-lg text-bone">{t.name}</h3>
                    <span className="text-[10px] text-ink-400 px-1.5 py-0.5 rounded bg-ink-800">{REGION_LABELS[t.region]}</span>
                  </div>
                  {t.westernName && (
                    <div className="text-xs text-ink-400 italic mb-1">{t.westernName}</div>
                  )}
                  <div className="text-xs text-vermilion-300 mb-2">📅 {t.era}</div>
                  <div className="text-xs text-bronze-400 mb-2">🏛 {t.school}</div>
                  <div className="text-sm text-parchment-50 leading-relaxed line-clamp-3">{t.title}</div>
                  <div className="text-xs text-ink-300 mt-2 line-clamp-2">{t.summary}</div>
                  <div className="mt-3 pt-3 border-t border-ink-600/30 flex items-center justify-between">
                    <span className="text-[10px] text-ink-400">富内容 {t.facts.length + t.sections.length + t.timeline.length + t.related.length} 模块</span>
                    <span className="text-xs text-vermilion-300 group-hover:text-vermilion-200">查看详情 →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center text-ink-400 py-12">
              没有匹配的思想家。试试其他筛选条件。
            </div>
          )}
        </main>

        <footer className="max-w-7xl mx-auto px-6 py-6 text-xs text-ink-500 text-center">
          💡 全思想 · 集中收集整理全人类的思想精华
          <br />
          当前数据：{THINKERS.length} 位思想家。后续将扩展到 50+ 位主流思想家。
        </footer>
      </div>

      {/* 详情弹窗 */}
      {selected && (
        <ThinkerDetail
          thinker={selected}
          onClose={() => { audioEngine.playModalClose(); setSelectedId(null) }}
          onSelect={(id) => setSelectedId(id)}
        />
      )}
    </ModalShell>
  )
}

// ===== 详情弹窗 =====
function ThinkerDetail({ thinker, onClose, onSelect }: { thinker: Thinker; onClose: () => void; onSelect: (id: string) => void }) {
  const yearLabel = thinker.era
  const imgKw = `${thinker.name} ${thinker.westernName ?? ''} portrait`
  const eventImg = bingImage(imgKw, 800, 450)

  return (
    <ModalShell isOpen onClose={onClose} innerStyle={{ borderColor: REGION_COLORS[thinker.region] + '60' }}>
      <div className="relative w-full bg-ink-900 max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="relative">
          <div
            className="w-full h-64 bg-cover bg-center"
            style={{
              backgroundColor: REGION_COLORS[thinker.region] + '60',
              backgroundImage: `url(${eventImg})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pt-8 pb-4">
            <div className="text-xs text-vermilion-300 mb-1 tracking-wider uppercase">
              {REGION_LABELS[thinker.region]} · {thinker.school} · {yearLabel}
            </div>
            <h2 className="text-3xl font-serif leading-tight text-bone">
              {thinker.name}{thinker.westernName && <span className="text-lg text-ink-400 ml-2">{thinker.westernName}</span>}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 text-parchment-50/80 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg bg-ink-900/60 hover:bg-ink-900/80 backdrop-blur"
            title="关闭 (ESC)"
            aria-label="关闭"
          >×</button>
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
                  >→ {r.title}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  )
}