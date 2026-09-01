/**
 * TraditionDetailDialog — 全传统条目详情弹窗（v3 视觉增强终极版）
 *
 * v3 新增：
 *  ⑩ Markdown 子集：在 summary / fullContent / sections.body / list items 中支持
 *      - **bold** *italic* `code` [link](url) inline 渲染
 *      - 由 lib/inlineMd.tsx 集中解析，无第三方依赖
 *  ⑪ 关键事实过滤：facts ≥ 6 时显示搜索框，filter 后只显示匹配的
 *  ⑫ 暗色/浅色主题：顶 bar ☀️/🌙 切换，localStorage 记忆；浅色用 parchment + ink 配色
 *  ⑬ 全屏模式：顶图双击或按 F → 弹窗铺满视窗，去掉蒙板背景，只保留内容
 *  ⑭ Lightbox 缩略图条：底部缩略图横排 + 当前页高亮 + 反向循环
 *  ⑮ 打印按钮：顶 bar 🖨；打印 CSS 隐藏背景/蒙板/CTA，只保留可打印内容
 *
 * 老版本 9 项（保留）：
 *  ① 目录 / 锚点  ② 表格 section  ③ 横向时间线  ④ Lightbox 翻图缩放  ⑤ facts hover+复制
 *  ⑥ callout 长内容折叠  ⑦ 朗读按钮  ⑧ 上一条/下一条  ⑨ 收藏 ♥
 */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import ModalShell from '@/components/ui/Modal'
import { bingImage } from '@/utils/geoImage'
import { renderInline } from '@/lib/inlineMd'
import type {
  TraditionItem,
  TraditionCategory,
  RichSection,
  TraditionImage,
  TimelineEvent,
  KeyFact,
  RelatedItem,
} from '@/data/traditions'

interface Props {
  tradition: TraditionItem | null
  onClose: () => void
  /** 点击 related/上一条/下一条时切换当前 tradition */
  onSelect?: (id: string) => void
  /** 同子分类下的所有条目 — 用于上一条/下一条 */
  neighbours?: TraditionItem[]
}

const CATEGORY_META: Record<TraditionCategory, { icon: string; label: string; color: string }> = {
  history:    { icon: '📜', label: '历史',     color: '#c89a5b' },
  'geography-regional': { icon: '🏔️', label: '地域文化', color: '#5b9bc8' },
  myth:       { icon: '🐉', label: '神话',     color: '#a07050' },
  philosophy: { icon: '☯️', label: '哲学',     color: '#9b7eb6' },
  script:     { icon: '✒️', label: '文字',     color: '#5b9bc8' },
  literature: { icon: '📖', label: '文学',     color: '#c89a8a' },
  art:        { icon: '🎨', label: '艺术',     color: '#e879b9' },
  calendar:   { icon: '🌾', label: '历法节气', color: '#9bc89a' },
  ritual:     { icon: '⚖️', label: '礼仪制度', color: '#d4a85b' },
  food:       { icon: '🍚', label: '衣食',     color: '#b85450' },
  housing:    { icon: '🏯', label: '住行',     color: '#5bc89a' },
  tech:       { icon: '🔧', label: '科技',     color: '#5b9bc8' },
}

function calloutStyle(variant: 'info' | 'success' | 'warning' | 'quote' | undefined) {
  switch (variant) {
    case 'success': return { bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.45)', icon: '✓' }
    case 'warning': return { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.45)',  icon: '!' }
    case 'quote':   return { bg: 'rgba(168,144,118,0.10)',border: 'rgba(168,144,118,0.35)',icon: '「' }
    case 'info':
    default:        return { bg: 'rgba(96,165,250,0.10)', border: 'rgba(96,165,250,0.45)', icon: 'ℹ' }
  }
}

/* 收藏管理 */
const FAVORITES_KEY = 'traditions.favorites'
const THEME_KEY = 'traditions.theme'
function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}
function saveFavorites(set: Set<string>) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(set))) } catch {}
}

function useFavorite(eid: string | null): [boolean, () => void] {
  const [favs, setFavs] = useState<Set<string>>(() => loadFavorites())
  useEffect(() => { saveFavorites(favs) }, [favs])
  const isFav = eid ? favs.has(eid) : false
  const toggle = useCallback(() => {
    if (!eid) return
    setFavs(s => {
      const next = new Set(s)
      if (next.has(eid)) next.delete(eid)
      else next.add(eid)
      return next
    })
  }, [eid])
  return [isFav, toggle]
}

function useTheme(): [boolean, () => void] {
  const [light, setLight] = useState<boolean>(() => {
    try { return localStorage.getItem(THEME_KEY) === 'light' } catch { return false }
  })
  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, light ? 'light' : 'dark') } catch {}
  }, [light])
  return [light, () => setLight(l => !l)]
}

/* ============ 小部件：section 渲染（v3：full Markdown） ============ */
function SectionBlock({ s, color, anchorId }: { s: RichSection; color: string; anchorId: string }) {
  switch (s.type) {
    case 'paragraph':
      return (
        <section id={anchorId} className="scroll-mt-4">
          {s.heading && (
            <h3
              className="text-[11px] font-semibold uppercase tracking-wider mb-2"
              style={{ color }}
            >
              {s.heading}
            </h3>
          )}
          <p className="text-[15px] text-parchment-50/95 leading-loose whitespace-pre-wrap">
            {renderInline(s.body)}
          </p>
        </section>
      )
    case 'callout': {
      const st = calloutStyle(s.variant ?? 'info')
      const isLong = s.body.length > 250
      const [open, setOpen] = useState(!isLong)
      return (
        <section id={anchorId} className="scroll-mt-4">
          <div
            className="rounded-lg border-l-4 flex gap-3 overflow-hidden"
            style={{ background: st.bg, borderLeftColor: st.border, border: `1px solid ${st.border}` }}
          >
            <div className="text-xl shrink-0 mt-3 pl-3 text-2xl" style={{ color: st.border }}>{st.icon}</div>
            <div className="flex-1 min-w-0 p-3">
              {s.heading && (
                <div className="text-sm font-semibold text-parchment-50 mb-1.5">{s.heading}</div>
              )}
              <p
                className="text-sm text-parchment-50/90 leading-relaxed whitespace-pre-wrap"
                style={{ display: '-webkit-box', WebkitLineClamp: open ? undefined : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {renderInline(s.body)}
              </p>
              {isLong && (
                <button
                  onClick={() => setOpen(o => !o)}
                  className="text-xs mt-1.5 px-2 py-0.5 rounded bg-ink-900/60 hover:bg-ink-700 transition-colors text-ink-300 hover:text-parchment-50"
                >
                  {open ? '收起 ⌃' : '展开更多 ⌄'}
                </button>
              )}
            </div>
          </div>
        </section>
      )
    }
    case 'list':
      return (
        <section id={anchorId} className="scroll-mt-4">
          {s.heading && (
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color }}>
              {s.heading}
            </h3>
          )}
          <ul className="space-y-1.5">
            {s.items.map((it, i) => (
              <li key={i} className="text-[15px] text-parchment-50/95 leading-relaxed flex gap-2">
                <span className="shrink-0 mt-2 inline-block w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <span className="flex-1 whitespace-pre-wrap">{renderInline(it)}</span>
              </li>
            ))}
          </ul>
        </section>
      )
    case 'quote':
      return (
        <section id={anchorId} className="scroll-mt-4 border-l-4 pl-4 py-2" style={{ borderLeftColor: color }}>
          {s.heading && (
            <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-2">{s.heading}</div>
          )}
          <blockquote className="text-base font-serif italic text-parchment-50/90 leading-relaxed whitespace-pre-wrap">
            {renderInline(s.text)}
          </blockquote>
          {s.cite && (
            <div className="text-xs text-ink-300 mt-2">— {s.cite}</div>
          )}
        </section>
      )
    case 'table':
      return (
        <section id={anchorId} className="scroll-mt-4">
          {s.heading && (
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color }}>
              {s.heading}
            </h3>
          )}
          <div className="rounded-lg border border-ink-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
                <tr>
                  {s.headers.map((h, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 text-left font-semibold text-parchment-50 border-b border-ink-700"
                      style={i === 0 ? { width: '24%' } : {}}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-ink-700/40 last:border-b-0 hover:bg-ink-700/20 transition-colors"
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`px-3 py-2 align-top text-parchment-50/90 leading-relaxed whitespace-pre-wrap ${ci === 0 ? 'font-medium text-parchment-50' : ''}`}
                      >
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )
    default:
      return null
  }
}

/* ============ 关键事实卡 + 搜索过滤 ============ */
function FactsGrid({ facts, color }: { facts: KeyFact[]; color: string }) {
  const [filter, setFilter] = useState('')
  const [copied, setCopied] = useState<number | null>(null)
  const handleCopy = (i: number, val: string) => {
    try {
      navigator.clipboard.writeText(val)
      setCopied(i)
      setTimeout(() => setCopied(null), 1200)
    } catch {}
  }
  const filtered = useMemo(() => {
    if (!filter.trim()) return facts.map((f, i) => ({ f, i }))
    const q = filter.toLowerCase()
    return facts
      .map((f, i) => ({ f, i }))
      .filter(({ f }) => (f.label + f.value).toLowerCase().includes(q))
  }, [facts, filter])

  return (
    <div>
      {facts.length >= 6 && (
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`过滤事实（${facts.length} → ${filtered.length}）`}
          className="w-full mb-2 px-3 py-1.5 text-xs rounded-lg bg-ink-900/60 border border-ink-700 text-parchment-50 placeholder-ink-300 focus:outline-none focus:border-amber-500/60"
        />
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {filtered.map(({ f, i }) => (
          <button
            key={i}
            type="button"
            onClick={() => handleCopy(i, f.value)}
            className="text-left rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2 hover:scale-[1.03] hover:shadow-lg transition-all"
            style={{ borderColor: 'rgba(255,255,255,0.10)', transitionProperty: 'transform, box-shadow, border-color' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = color + '80' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)' }}
            title="点击复制"
          >
            <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-0.5">{renderInline(f.label)}</div>
            <div className="text-sm font-medium text-parchment-50 whitespace-pre-wrap">
              {renderInline(f.value)}
              {copied === i && <span className="ml-1 text-[10px] text-emerald-400">已复制</span>}
            </div>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-xs text-ink-300 italic">没有匹配的事实</div>
      )}
    </div>
  )
}

/* ============ 横向时间轴 ============ */
function TimelineHorizontal({ events, color }: { events: TimelineEvent[]; color: string }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  return (
    <div>
      <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-3">时间线（{events.length}）</div>
      <div
        className="overflow-x-auto pb-3 scrollbar-thin"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <div className="flex gap-4 min-w-max pt-3 pb-3 px-2 relative">
          <div
            className="absolute left-0 right-0 top-[18px] h-0.5"
            style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)' }}
          />
          {events.map((e, i) => {
            const isHover = hoverIdx === i
            return (
              <div
                key={i}
                className="relative shrink-0 w-44 cursor-default"
                onMouseEnter={() => setHoverIdx(i)}
              >
                <div
                  className="absolute -top-1 left-2 w-4 h-4 rounded-full border-2 transition-all"
                  style={{
                    background: isHover ? color : 'rgba(234,179,8,0.85)',
                    borderColor: 'rgb(15,14,12)',
                    transform: isHover ? 'scale(1.4)' : 'scale(1)',
                  }}
                />
                <div className="text-xs font-semibold mt-6" style={{ color: isHover ? '#f5deb3' : '#fbbf24' }}>
                  {e.year}
                </div>
                {e.era && <div className="text-[10px] text-ink-300">· {e.era}</div>}
                <div
                  className="mt-1 p-2 rounded border text-xs leading-snug transition-all"
                  style={{
                    background: isHover ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                    borderColor: isHover ? color + '60' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  {e.event}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ============ 图集 ============ */
function ImageGallery({ images, caption, color, onOpen }: {
  images: TraditionImage[]
  caption: string
  color: string
  onOpen: (idx: number) => void
}) {
  return (
    <div>
      <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-2">
        {caption}（{images.length}）· 点击放大
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {images.map((img, i) => (
          <figure
            key={i}
            className="shrink-0 w-64 rounded-lg overflow-hidden border border-ink-700 bg-ink-900 cursor-zoom-in hover:shadow-lg hover:scale-[1.02] transition-all"
            onClick={() => onOpen(i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(i) }}
            aria-label={`放大查看 ${img.caption}`}
          >
            <img
              src={img.url ?? bingImage(img.imageKeyword, 800, 600)}
              alt={img.caption}
              className="w-full h-40 object-cover"
              loading="lazy"
            />
            <figcaption className="p-2 text-xs text-parchment-50/85 leading-snug">
              {img.caption}
              {img.credit && (
                <div className="text-[10px] text-ink-300 mt-0.5">{img.credit}</div>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

/* ============ 相关条目 ============ */
function RelatedBlock({ items, color, onSelect }: { items: RelatedItem[]; color: string; onSelect?: (id: string) => void }) {
  return (
    <div>
      <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-2">相关条目（{items.length}）</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((r, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect?.(r.id)}
            className="text-left rounded-lg border border-ink-700 bg-ink-900/40 hover:bg-ink-700/60 hover:shadow-lg hover:scale-[1.01] transition-all p-2.5 group"
            style={{ borderColor: 'rgba(255,255,255,0.10)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = color + '80' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)' }}
          >
            <div className="text-sm font-medium text-parchment-50 mb-0.5 group-hover:text-emerald-300 transition-colors">
              → {r.title}
            </div>
            <div className="text-xs text-ink-300 leading-snug">{r.reason}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ============ Lightbox（v3：缩略图条） ============ */
function ImageLightbox({
  images, index, onClose, onPrev, onNext, onJump, cardColor,
}: {
  images: TraditionImage[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onJump: (idx: number) => void
  cardColor: string
}) {
  const [zoom, setZoom] = useState(false)
  if (index < 0 || index >= images.length) return null
  const img = images[index]
  const url = img.url ?? bingImage(img.imageKeyword, 1600, 1200)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
      else if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === 'ArrowRight') onNext()
      else if (e.key === '+' || e.key === '=') setZoom(z => !z)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose, onPrev, onNext])

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-ink-900/95 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="relative flex-1 flex flex-col max-w-5xl mx-auto w-full"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${img.caption} · 放大图`}
      >
        <div className="flex items-center justify-between mb-2 text-parchment-50 shrink-0">
          <div className="text-xs text-ink-300">{index + 1} / {images.length}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(z => !z)}
              className="px-2 py-1 rounded bg-ink-800 hover:bg-ink-700 text-xs"
              title="缩放"
            >
              {zoom ? '100%' : '200%'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-ink-800 hover:bg-ink-700 text-base flex items-center justify-center"
              aria-label="关闭"
            >
              ×
            </button>
          </div>
        </div>
        <div
          className="rounded overflow-auto flex-1 flex items-center justify-center bg-black"
          onClick={() => setZoom(z => !z)}
        >
          <img
            src={url}
            alt={img.caption}
            className={`transition-transform ${zoom ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
            style={{ transformOrigin: 'center', maxWidth: '100%', maxHeight: '70vh' }}
            draggable={false}
          />
        </div>
        {/* v3 新增：缩略图条 */}
        {images.length > 1 && (
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin shrink-0">
            {images.map((it, i) => (
              <button
                key={i}
                onClick={() => onJump(i)}
                className="shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-all"
                style={{
                  borderColor: i === index ? cardColor : 'rgba(255,255,255,0.10)',
                  opacity: i === index ? 1 : 0.6,
                }}
                title={it.caption}
                aria-label={`跳到第 ${i + 1} 张`}
              >
                <img src={it.url ?? bingImage(it.imageKeyword, 200, 150)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
        {/* Caption */}
        <div className="mt-2 text-center shrink-0">
          <div className="text-sm text-parchment-50/90">{img.caption}</div>
          {img.credit && <div className="text-xs text-ink-300 mt-1">来源：{img.credit}</div>}
        </div>
        {/* 左右翻图按钮 */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 rounded-full bg-ink-800/80 hover:bg-ink-700 text-xl flex items-center justify-center backdrop-blur"
              aria-label="上一张"
            >
              ‹
            </button>
            <button
              onClick={onNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 rounded-full bg-ink-800/80 hover:bg-ink-700 text-xl flex items-center justify-center backdrop-blur"
              aria-label="下一张"
            >
              ›
            </button>
          </>
        )}
        <div
          className="absolute -top-1 left-0 w-2 h-12 rounded-r"
          style={{ background: cardColor }}
        />
      </div>
    </div>
  )
}

/* ============ 朗读按钮 ============ */
function SpeakButton({ text, cardColor }: { text: string; cardColor: string }) {
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const toggle = () => {
    if (!supported) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-CN'
    u.rate = 1.0
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
    setSpeaking(true)
  }

  useEffect(() => () => {
    if (supported && speaking) window.speechSynthesis.cancel()
  }, [supported, speaking])

  if (!supported) return null
  return (
    <button
      onClick={toggle}
      className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors"
      style={{
        background: speaking ? cardColor + '20' : 'rgba(255,255,255,0.04)',
        borderColor: speaking ? cardColor + '80' : 'rgba(255,255,255,0.10)',
        color: speaking ? cardColor : '#fdf8f0',
      }}
      title={speaking ? '停止朗读' : '朗读正文'}
    >
      {speaking ? '■ 停止' : '▶ 朗读'}
    </button>
  )
}

/* ============ 目录（TOC） ============ */
function SectionTOC({
  items, onJump, color,
}: {
  items: { id: string; heading?: string }[]
  onJump: (id: string) => void
  color: string
}) {
  const [open, setOpen] = useState(true)
  return (
    <details open={open} className="rounded-lg border border-ink-700 bg-ink-900/40 overflow-hidden">
      <summary
        className="cursor-pointer px-3 py-2 text-xs uppercase tracking-wider font-semibold flex items-center gap-2 select-none"
        style={{ color }}
        onClick={(e) => { e.preventDefault(); setOpen(o => !o) }}
      >
        <span className="text-base leading-none">{open ? '⌄' : '›'}</span>
        <span>目录（{items.length}）</span>
      </summary>
      <ol className="px-3 py-2 space-y-1 text-sm">
        {items.map((it, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onJump(it.id)}
              className="text-left text-parchment-50/85 hover:text-emerald-300 transition-colors w-full px-1 py-0.5 rounded hover:bg-ink-700/40"
            >
              <span className="text-ink-300 text-xs tabular-nums mr-2">{String(i + 1).padStart(2, '0')}</span>
              {it.heading ?? `第 ${i + 1} 段`}
            </button>
          </li>
        ))}
      </ol>
    </details>
  )
}

/* ============ 主组件 ============ */

export default function TraditionDetailDialog({ tradition, onClose, onSelect, neighbours }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [lightboxIdx, setLightboxIdx] = useState<number>(-1)
  const [isFav, toggleFav] = useFavorite(tradition?.id ?? null)
  const [light, toggleTheme] = useTheme()
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0
    setLightboxIdx(-1)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }
  }, [tradition?.id])

  // ⚠️ Hooks 必须在 early return 之前无条件调用 —— 移到前面
  const sectionAnchors = useMemo(() => {
    if (!tradition) return []
    return (tradition.sections ?? []).map((s, i) => ({
      id: `sec-${tradition.id}-${i}`,
      heading: s.heading ?? `第 ${i + 1} 段`,
    }))
  }, [tradition])

  // v3 增：键盘 F → 全屏（也必须在 early return 之前）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return
        setFullscreen(f => !f)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  // 👇 early return 在所有 hooks 之后
  if (!tradition) return null
  const meta = CATEGORY_META[tradition.category]
  const bgUrl = tradition.imageUrl ?? bingImage(
    tradition.imageKeyword ?? `${tradition.title} ${tradition.era ?? ''} Chinese tradition`,
    1200, 600
  )

  const jumpTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const flatNeighbours = neighbours ?? []
  const idx = flatNeighbours.findIndex(n => n.id === tradition.id)
  const prev = idx > 0 ? flatNeighbours[idx - 1] : null
  const next = idx >= 0 && idx < flatNeighbours.length - 1 ? flatNeighbours[idx + 1] : null

  const imagesArr = tradition.images ?? []
  const heroImg: TraditionImage = {
    imageKeyword: tradition.imageKeyword ?? tradition.title,
    caption: tradition.title,
    credit: tradition.source,
    url: tradition.imageUrl,
  }
  const allImages = [heroImg, ...imagesArr]
  const openLightboxAt = (i: number) => setLightboxIdx(i)
  const lbPrev = () => setLightboxIdx(i => (i - 1 + allImages.length) % allImages.length)
  const lbNext = () => setLightboxIdx(i => (i + 1) % allImages.length)
  const lbJump = (idx: number) => setLightboxIdx(idx)

  // (上面的 keyboard-F useEffect 已前移)

  const printPage = () => {
    if (typeof window !== 'undefined') window.print()
  }

  // 主题色板
  const themeBg = light ? '#fdf8f0' : 'rgb(15,14,12)'
  const themeFg = light ? '#1a1714' : '#fdf8f0'
  const innerStyle: React.CSSProperties = {
    background: themeBg,
    color: themeFg,
  }

  return (
    <ModalShell
      isOpen={!!tradition}
      onClose={onClose}
      className={`p-2 sm:p-4 ${fullscreen ? '' : ''}`}
      innerClassName={`max-w-3xl ${fullscreen ? 'max-w-none w-[95vw] h-[95vh]' : 'max-h-[90vh]'} overflow-hidden flex flex-col`}
      innerStyle={innerStyle}
      ariaLabel={`${tradition.title} · ${meta.label}详情`}
    >
      <style>{`
        @media print {
          .tradition-modal-bg, .tradition-modal-bg * { background: white !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          /* Lightbox / select / 全屏不打印 */
        }
        .print-only { display: none; }
      `}</style>
      <div className={light ? 'light' : 'dark'} style={{ background: 'transparent', color: themeFg }}>
        {/* === 顶部固定 bar（不打印） === */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-ink-700 shrink-0 no-print">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">{meta.icon}</span>
            <span className="text-xs text-ink-300 truncate">{meta.label} / {tradition.era}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <button
              onClick={toggleTheme}
              className="text-xs px-2.5 py-1.5 rounded-lg border bg-ink-700/60 hover:bg-ink-700 border-ink-600 text-parchment-50"
              title="切换主题（浅色/暗色）"
              aria-label="切换主题"
            >
              {light ? '🌙 暗' : '☀️ 浅'}
            </button>
            <button
              onClick={() => setFullscreen(f => !f)}
              className="text-xs px-2.5 py-1.5 rounded-lg border bg-ink-700/60 hover:bg-ink-700 border-ink-600 text-parchment-50"
              title="全屏模式 (F)"
            >
              {fullscreen ? '⤡ 退出全屏' : '⤢ 全屏'}
            </button>
            {tradition.fullContent && <SpeakButton text={tradition.fullContent} cardColor={meta.color} />}
            <button
              onClick={printPage}
              className="text-xs px-2.5 py-1.5 rounded-lg border bg-ink-700/60 hover:bg-ink-700 border-ink-600 text-parchment-50"
              title="打印 / 导出 PDF"
            >
              🖨
            </button>
            <button
              onClick={toggleFav}
              className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors"
              style={{
                background: isFav ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                borderColor: isFav ? 'rgba(239,68,68,0.55)' : 'rgba(255,255,255,0.10)',
                color: isFav ? '#fb7185' : '#fdf8f0',
              }}
              title={isFav ? '取消收藏' : '收藏这条'}
              aria-pressed={isFav}
            >
              {isFav ? '♥ 已收藏' : '♡ 收藏'}
            </button>
            <button
              onClick={onClose}
              className="text-xs px-2.5 py-1.5 rounded-lg border bg-ink-700/60 hover:bg-ink-700 border-ink-600 text-parchment-50"
              title="关闭 (ESC)"
              aria-label="关闭"
            >
              × 关闭
            </button>
          </div>
        </div>

        {/* 可滚动主体 */}
        <div ref={contentRef} className="relative overflow-y-auto scrollbar-thin flex-1 tradition-modal-bg" style={{ background: themeBg }}>
          {/* === 顶部封面图 === */}
          <div
            className="relative h-64 sm:h-72 bg-cover bg-center cursor-zoom-in"
            style={{ backgroundImage: `url(${bgUrl})` }}
            onClick={() => openLightboxAt(0)}
            onDoubleClick={() => setFullscreen(f => !f)}
            role="button"
            tabIndex={0}
            aria-label="放大查看封面图 · 双击全屏"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') openLightboxAt(0)
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.45) 50%, rgba(15,14,12,0.95) 100%)',
              }}
            />
            <div className="absolute top-4 left-5 right-5 flex items-start gap-3">
              <div className="text-4xl drop-shadow-lg shrink-0">{meta.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: meta.color }}>
                  {meta.label}
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif text-white drop-shadow-lg mb-1">
                  {tradition.title}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[11px] px-2 py-0.5 rounded border backdrop-blur"
                    style={{
                      background: meta.color + '20',
                      color: '#fdf8f0',
                      borderColor: meta.color + '80',
                    }}
                  >
                    {meta.icon} {meta.label}
                  </span>
                  {tradition.era && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-ink-900/60 text-parchment-50/85 border border-ink-700/50">
                      {tradition.era}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute bottom-3 right-4 text-[10px] text-ink-300/80">🔍 点击放大 · 双击全屏</div>
          </div>

          {/* === 正文 === */}
          <div className="px-6 pb-6 pt-4 space-y-5" style={{ color: themeFg }}>
            {sectionAnchors.length >= 3 && (
              <SectionTOC
                items={sectionAnchors}
                onJump={jumpTo}
                color={meta.color}
              />
            )}

            {tradition.summary && (
              <section>
                <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-2">摘要</div>
                <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: themeFg }}>
                  {renderInline(tradition.summary)}
                </p>
              </section>
            )}

            {tradition.facts && tradition.facts.length > 0 && (
              <FactsGrid facts={tradition.facts} color={meta.color} />
            )}

            {tradition.fullContent && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-[10px] text-ink-300 uppercase tracking-wider">详版</div>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${meta.color}40, transparent)` }} />
                </div>
                <p className="text-[15px] leading-loose whitespace-pre-wrap" style={{ color: themeFg }}>
                  {renderInline(tradition.fullContent)}
                </p>
              </section>
            )}

            {tradition.sections && tradition.sections.length > 0 && (
              <div className="space-y-4">
                {tradition.sections.map((s, i) => (
                  <SectionBlock
                    key={i}
                    s={s}
                    color={meta.color}
                    anchorId={sectionAnchors[i]?.id ?? `sec-${i}`}
                  />
                ))}
              </div>
            )}

            {tradition.timeline && tradition.timeline.length > 0 && (
              <TimelineHorizontal events={tradition.timeline} color={meta.color} />
            )}

            {tradition.figure && (
              <div className="flex items-start gap-2">
                <div className="text-[10px] text-ink-300 uppercase tracking-wider shrink-0 pt-1">
                  关键人物
                </div>
                <div className="text-sm text-amber-100/90">{tradition.figure}</div>
              </div>
            )}

            {tradition.images && tradition.images.length > 0 && (
              <ImageGallery
                images={tradition.images}
                caption="配图"
                color={meta.color}
                onOpen={(idx) => openLightboxAt(idx + 1)}
              />
            )}

            {tradition.related && tradition.related.length > 0 && (
              <RelatedBlock
                items={tradition.related}
                color={meta.color}
                onSelect={onSelect}
              />
            )}

            {tradition.source && (
              <div className="text-[11px] text-ink-300 border-l-2 border-ink-700 pl-3 italic">
                <span className="text-ink-300/80">资料来源：</span>
                {tradition.source}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap text-xs text-ink-300">
              <span>分类：</span>
              <span
                className="px-2 py-0.5 rounded border"
                style={{
                  background: meta.color + '20',
                  color: meta.color,
                  borderColor: meta.color + '60',
                }}
              >
                {meta.icon} {meta.label}
              </span>
              {tradition.era && (
                <>
                  <span>·</span>
                  <span>{tradition.era}</span>
                </>
              )}
            </div>

            {(prev || next) && (
              <div className="pt-3 border-t border-ink-700 flex items-center justify-between gap-2 no-print">
                {prev ? (
                  <button
                    onClick={() => onSelect?.(prev.id)}
                    className="flex-1 text-left rounded-lg border border-ink-700 bg-ink-900/40 hover:bg-ink-700/60 p-2.5 min-w-0"
                  >
                    <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-0.5">← 上一条</div>
                    <div className="text-sm text-parchment-50 truncate">{prev.title}</div>
                  </button>
                ) : <div className="flex-1" />}
                {next ? (
                  <button
                    onClick={() => onSelect?.(next.id)}
                    className="flex-1 text-right rounded-lg border border-ink-700 bg-ink-900/40 hover:bg-ink-700/60 p-2.5 min-w-0"
                  >
                    <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-0.5">下一条 →</div>
                    <div className="text-sm text-parchment-50 truncate">{next.title}</div>
                  </button>
                ) : <div className="flex-1" />}
              </div>
            )}

            <div className="pt-3 border-t border-ink-700 flex items-center justify-between gap-2 flex-wrap">
              <div className="text-[11px] text-ink-300">
                ID: <code className="text-ink-300 bg-ink-700/40 px-1.5 py-0.5 rounded">{tradition.id}</code>
              </div>
              <div className="text-[11px] text-ink-300/70 italic no-print">
                ESC 关闭 · ← → 翻图 · ± 缩放 · F 全屏
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxIdx >= 0 && (
        <ImageLightbox
          images={allImages}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(-1)}
          onPrev={lbPrev}
          onNext={lbNext}
          onJump={lbJump}
          cardColor={meta.color}
        />
      )}
    </ModalShell>
  )
}
