/**
 * EraQuickLearnModal — 朝代快速学习 Modal + 关键大事详情 Modal
 *
 * 从 Dashboard.tsx 抽出。两个 Modal 共享 state：
 *   - era !== null           → 显示快速学习 Modal
 *   - quickEvent !== null    → 在快速学习之上叠加大事详情 Modal
 *
 * 关键：selectedQuickEvent 必须由父组件持有（Dashboard 里），
 * 这样 pendingReopen / 浮层 ← 按钮才能正确触发"打开快速学习 + 选中大事"。
 */
import { useMemo } from 'react'
import { useAIStore } from '@/store/useAIStore'
import { useNotesStore } from '@/store/useNotesStore'
import { useCardsStore } from '@/store/useCardsStore'
import { getTargetTitle } from '@/utils/lookups'
import { bingImage } from '@/utils/geoImage'
import { useJumpToMap } from '@/hooks/useJumpToMap'
import ModalShell from '@/components/ui/Modal'
import type { Era } from '@/types'
import erasData from '@/data/eras.json'
import eventsData from '@/data/events.json'
import type { HistoricalEvent } from '@/types'

const eras = erasData as Era[]
const events = eventsData as HistoricalEvent[]

export interface QuickEventState {
  year: number
  title: string
  desc?: string
  longDesc?: string
}

interface Props {
  era: Era | null
  quickEvent: QuickEventState | null
  onClose: () => void
  onCloseQuickEvent: () => void
  onOpenQuickEvent: (ev: QuickEventState) => void
  onPrev: () => void
  onNext: () => void
  onMarkLearned: () => void
  prevEra: Era | null
  nextEra: Era | null
}

export default function EraQuickLearnModal({
  era,
  quickEvent,
  onClose,
  onCloseQuickEvent,
  onOpenQuickEvent,
  onPrev,
  onNext,
  onMarkLearned,
  prevEra,
  nextEra,
}: Props) {
  if (!era) return null

  return (
    <>
      {/* 🚀 快速学习 Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-bronze-500/40 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="详情"
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-ink-600 px-6 py-4 flex items-start justify-between">
            <div>
              <div className="text-xs text-ink-500 mb-1">
                {era.region === 'china' ? '中国朝代' : '世界文明'} ·{' '}
                {era.startYear < 0 ? `BC ${-era.startYear}` : era.startYear} ~ {era.endYear}
              </div>
              <h2 className="text-2xl font-serif" style={{ color: era.color }}>
                {era.name}
              </h2>
              {era.shortDesc && (
                <div className="text-sm text-ink-400 mt-1 italic">{era.shortDesc}</div>
              )}
            </div>
            <button
              className="text-ink-500 hover:text-parchment-50 text-2xl leading-none"
              onClick={onClose}
              title="关闭 (Esc)"
              aria-label="关闭"
            >×</button>
          </div>

          <div className="p-6 space-y-5">
            {/* 5 个核心要点 */}
            {era.keyPoints && era.keyPoints.length > 0 && (
              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📚 核心要点（5 条）</div>
                <ol className="text-sm text-parchment-50 space-y-1.5 list-decimal pl-5 marker:text-bronze-500">
                  {era.keyPoints.map((pt, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: renderMarkdownBold(pt) }} />
                  ))}
                </ol>
              </div>
            )}

            {/* 5 件大事 */}
            {era.quickEvents && era.quickEvents.length > 0 && (
              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📜 5 件关键大事</div>
                <div className="relative pl-5">
                  <div className="absolute left-1.5 top-1 bottom-1 w-px bg-bronze-600/40" />
                  {era.quickEvents.map((ev, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenQuickEvent({
                          year: ev.year,
                          title: ev.title,
                          desc: ev.desc,
                          longDesc: ev.longDesc,
                        })
                      }}
                      className="w-full text-left relative pb-3 mb-1 last:pb-0 cursor-pointer rounded-lg border border-transparent hover:border-bronze-500/60 hover:bg-bronze-900/30 transition-colors group p-2 -ml-2"
                      title="点击查看详情"
                      style={{ zIndex: 10 }}
                    >
                      <div className="absolute -left-3.5 top-2.5 w-2 h-2 rounded-full bg-bronze-500 ring-2 ring-ink-900 group-hover:scale-150 transition-transform pointer-events-none" />
                      <div className="text-xs text-bronze-400 tabular-nums">
                        {ev.year < 0 ? `BC ${-ev.year}` : ev.year}
                      </div>
                      <div className="text-sm font-serif text-parchment-50 group-hover:text-bronze-200 transition-colors mt-0.5">{ev.title}</div>
                      {ev.desc && <div className="text-xs text-ink-500 mt-0.5 line-clamp-2">{ev.desc}</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 历史意义 */}
            {era.legacy && (
              <div className="p-3 rounded-lg bg-bronze-900/20 border border-bronze-700/40">
                <div className="text-xs text-bronze-400 uppercase tracking-wider mb-1.5">🎯 历史意义 / 对后世影响</div>
                <div
                  className="text-sm text-parchment-50 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownBold(era.legacy) }}
                />
              </div>
            )}

            {/* 朝代连续性 */}
            {era.succession && (era.succession.predecessor || era.succession.successor) && (
              <div className="p-3 rounded-lg bg-ink-700/40 border border-ink-600/60">
                <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🔗 朝代连续性</div>
                {era.succession.predecessor && (
                  <div className="text-xs text-ink-300 mb-1">
                    <span className="text-ink-500">← 前承：</span>{era.succession.predecessor}
                  </div>
                )}
                {era.succession.successor && (
                  <div className="text-xs text-ink-300">
                    <span className="text-ink-500">后继：</span>{era.succession.successor} →
                  </div>
                )}
              </div>
            )}

            {/* 描述 fallback */}
            {!era.keyPoints && era.description && (
              <p className="text-sm text-parchment-50 leading-relaxed whitespace-pre-line">
                {era.description}
              </p>
            )}

            {/* 同时期事件 fallback */}
            {!era.quickEvents && <AutoEventsInRange eraId={era.id} startYear={era.startYear} endYear={era.endYear} />}

            {/* 同时期其他朝代 fallback */}
            {!era.succession && <AutoContemporaries era={era} allEras={eras} />}

            <RelatedNotes eraId={era.id} />
            <RelatedCards eraId={era.id} />
          </div>

          {/* footer */}
          <div className="sticky bottom-0 z-10 bg-ink-800/95 backdrop-blur border-t border-ink-600 px-6 py-3 flex items-center justify-between">
            <button
              className="px-3 py-1.5 rounded-lg text-xs text-ink-300 hover:text-bronze-300 border border-ink-600 transition-colors"
              onClick={onPrev}
              disabled={!prevEra}
              title={prevEra ? `上一朝代：${prevEra.name}` : '已是第一朝代'}
            >
              ← {prevEra?.name ?? '最早'}
            </button>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg text-xs bg-bronze-600/30 text-bronze-300 hover:bg-bronze-600/50 border border-bronze-500/60 transition-colors"
                onClick={onMarkLearned}
              >
                ✓ 标记已学
              </button>
            </div>
            <button
              className="px-3 py-1.5 rounded-lg text-xs text-ink-300 hover:text-bronze-300 border border-ink-600 transition-colors"
              onClick={onNext}
              disabled={!nextEra}
              title={nextEra ? `下一朝代：${nextEra.name}` : '已是最后朝代'}
            >
              {nextEra?.name ?? '最晚'} →
            </button>
          </div>
        </div>
      </div>

      {/* 关键大事详情 Modal（叠在快速学习之上） */}
      <QuickEventDetail
        era={era}
        event={quickEvent}
        onClose={onCloseQuickEvent}
      />
    </>
  )
}

// ===== 子组件：关键大事详情 =====

interface QuickEventDetailProps {
  era: Era
  event: QuickEventState | null
  onClose: () => void
}

function QuickEventDetail({ era, event, onClose }: QuickEventDetailProps) {
  const aiSetPersona = useAIStore(s => s.setPersonaPrompt)
  const aiNewThread = useAIStore(s => s.newThread)
  const aiOpenPanel = useAIStore(s => s.openPanel)
  const jumpToMap = useJumpToMap()

  if (!event) return null

  const yearLabel = event.year < 0 ? `公元前 ${-event.year} 年` : `${event.year} 年`
  const eventType = inferEventType(event.title)
  const imgKw = `${event.title} ${era.name} historical`
  const eventImg = bingImage(imgKw, 800, 450)

  return (
    <ModalShell
      isOpen
      onClose={onClose}
      innerStyle={{ borderColor: era.color + '60' }}
    >
      {/* 顶部：16:9 图片头 */}
      <div className="relative w-full bg-ink-900" style={{ aspectRatio: '16/9' }}>
        <div
          className="absolute inset-0 flex items-center justify-center select-none"
          style={{ background: `linear-gradient(135deg, ${era.color}55 0%, ${era.color}22 100%)` }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-serif font-bold shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${era.color} 0%, ${era.color}aa 100%)`,
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            {event.title.charAt(0)}
          </div>
        </div>
        <img
          src={eventImg}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-10"
          style={{ opacity: 0 }}
          loading="eager"
          onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/30 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pt-8 pb-4 z-20">
          <div className="text-xs text-bronze-300 mb-1 tracking-wider uppercase">
            {era.name} · {eventType} · {yearLabel}
          </div>
          <h2 className="text-2xl font-serif leading-snug" style={{ color: era.color }}>
            {event.title}
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
        {event.longDesc ? (
          <div>
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📖 事件详情</div>
            <div
              className="text-sm text-parchment-100 leading-relaxed space-y-2"
              dangerouslySetInnerHTML={{ __html: renderMarkdownBold(event.longDesc) }}
            />
          </div>
        ) : event.desc ? (
          <div>
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📖 事件详情</div>
            <div className="text-sm text-parchment-100 leading-relaxed">{event.desc}</div>
          </div>
        ) : null}

        {event.longDesc && event.desc && (
          <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">📋 一句话简介</div>
            <div className="text-sm text-bronze-300 font-serif italic">{event.desc}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">🏛️ 所属文明</div>
            <div className="text-sm font-serif" style={{ color: era.color }}>{era.name}</div>
          </div>
          <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">📅 时间</div>
            <div className="text-sm text-bronze-300 font-serif">{yearLabel}</div>
          </div>
          <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">📂 分类</div>
            <div className="text-sm text-parchment-50">{eventType}</div>
          </div>
          <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">⭐ 重要程度</div>
            <div className="text-sm text-parchment-50">⭐⭐⭐ 关键</div>
          </div>
        </div>
      </div>

      {era.capital && (
        <div className="px-6 pb-3">
          <button
            onClick={() => {
              const eventSnipped = event.desc ?? event.longDesc?.slice(0, 120) ?? ''
              jumpToMap(
                era.capital!,
                `${event.title} · ${era.name}`,
                4,
                {
                  coverImageUrl: eventImg,
                  snippet: eventSnipped,
                  reopenLabel: 'BACK',
                  eraId: era.id,
                  eventYear: event.year,
                }
              )
              onClose()
            }}
            className="w-full px-4 py-2.5 rounded-lg bg-emerald-700/40 hover:bg-emerald-600/60 border border-emerald-500/50 text-emerald-200 text-sm font-serif transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-base">📍</span>
            <span>在地图上定位（{era.name} 都城）</span>
          </button>
          <div className="text-[10px] text-ink-500 text-center mt-1.5">
            跳转至 {era.capital[0].toFixed(2)}°, {era.capital[1].toFixed(2)}° 查看坐标
          </div>
        </div>
      )}

      <div className="px-6 pb-6">
        <button
          onClick={() => {
            const longDescText = event.longDesc ?? event.desc ?? ''
            const persona = `你是历史学家，专精 ${era.name} 时期的历史。用户询问关键事件「${event.title}」(${yearLabel})：${longDescText}。请详细解释：1.背景 2.经过 3.影响 4.关键人物 5.历史评价。2-4 段话。`
            aiSetPersona(persona)
            aiNewThread(`关于 ${event.title}`)
            aiOpenPanel()
            onClose()
          }}
          className="w-full px-4 py-3 rounded-lg bg-purple-700/40 hover:bg-purple-600/60 border border-purple-500/50 text-purple-200 text-sm font-serif transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-base">🤖</span>
          <span>让 AI 详细讲解这个事件</span>
        </button>
        <div className="text-xs text-ink-500 text-center mt-2">
          AI 将解释：背景 / 经过 / 影响 / 关键人物 / 历史评价
        </div>
      </div>
    </ModalShell>
  )
}

// ===== 辅助函数 / 子组件 =====

function renderMarkdownBold(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-bronze-300">$1</strong>')
  return escaped
    .split(/\n+|(?<=[。！？!?])\s+/)
    .filter(p => p.trim())
    .map(p => `<p class="leading-relaxed">${p.trim()}</p>`)
    .join('')
}

function inferEventType(title: string): string {
  if (/(建立|建国|创建|立国|开国)/.test(title)) return '建国'
  if (/(战争|战役|征服|入侵|起义|兵变|平定|伐|攻陷|击败|大捷)/.test(title)) return '战争'
  if (/(即位|继位|登基|加冕|称帝|称王)/.test(title)) return '即位'
  if (/(改革|变法|维新|改制)/.test(title)) return '改革'
  if (/(鼎盛|繁荣|黄金时代|盛世|崛起)/.test(title)) return '鼎盛'
  if (/(衰|亡|灭|覆灭|终结|陷落|灭亡)/.test(title)) return '衰亡'
  if (/(迁|迁都|移民)/.test(title)) return '迁都'
  if (/(建|修|筑|造|成)/.test(title)) return '建设'
  return '关键事件'
}

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
      <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📝 已关联笔记（{notes.length}）</div>
      <div className="space-y-1.5">
        {notes.map(n => (
          <div key={n.id} className="p-2 rounded-lg bg-ink-700/30 border border-ink-600/40 text-xs">
            <div className="text-parchment-50 truncate">{n.title || '(无标题)'}</div>
            <div className="text-ink-500 text-xs truncate mt-0.5">
              {n.content.split('\n').find(l => l.trim()) || '(空)'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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
      <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">🃏 已关联复习卡（{cards.length}）</div>
      <div className="grid grid-cols-2 gap-1.5">
        {cards.map(c => (
          <div key={c.id} className="p-2 rounded-lg bg-ink-700/30 border border-ink-600/40 text-xs">
            <div className="text-ink-400 text-xs">到期：{new Date(c.nextReviewAt).toLocaleDateString()}</div>
            <div className="text-parchment-50 truncate mt-0.5">{getTargetTitle(c.target.kind, c.target.id) || '(空)'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AutoEventsInRange({ eraId: _eraId, startYear, endYear }: { eraId: string; startYear: number; endYear: number }) {
  const eraEvents = events
    .filter(e => e.year >= startYear && e.year <= endYear)
    .sort((a, b) => a.year - b.year)
    .slice(0, 5)
  if (eraEvents.length === 0) return null
  return (
    <div>
      <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📜 同时期关键事件（自动聚合）</div>
      <div className="relative pl-5">
        <div className="absolute left-1.5 top-1 bottom-1 w-px bg-bronze-600/40" />
        {eraEvents.map((ev, i) => (
          <div key={i} className="relative pb-3 last:pb-0">
            <div className="absolute -left-3.5 top-1 w-2 h-2 rounded-full bg-bronze-500 ring-2 ring-ink-900" />
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-xs text-bronze-400 tabular-nums">
                {ev.year < 0 ? `BC ${-ev.year}` : ev.year}
              </span>
              {ev.importance === 3 && <span className="text-xs text-amber-400">⭐ 关键</span>}
              <span className="text-xs text-ink-500">· {ev.category}</span>
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

function AutoContemporaries({ era, allEras }: { era: Era; allEras: Era[] }) {
  const contemporaries = allEras
    .filter(e => e.id !== era.id && e.startYear <= era.endYear && e.endYear >= era.startYear)
    .sort((a, b) => a.startYear - b.startYear)
    .slice(0, 8)
  if (contemporaries.length === 0) return null
  return (
    <div>
      <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">🌍 同时期其他文明</div>
      <div className="text-xs text-ink-400 mb-2">
        同期 <span className="text-parchment-50">{contemporaries.length}</span> 个朝代与你选的朝代时间重叠：
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {contemporaries.map(e => (
          <div
            key={e.id}
            className="text-xs px-2 py-1 rounded-lg bg-ink-700/40 border border-ink-600/40 flex items-center gap-1"
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