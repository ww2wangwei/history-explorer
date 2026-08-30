/**
 * TraditionsOverview — 全传统全屏浏览页
 *
 * 12 个子分类 chip + 全部卡片网格。子分类筛选 + 关键词搜索。
 * 一期只做"浏览入口"，不做详情弹窗（与 ArtsOverview 一致风格）。
 *
 * 数据：src/data/traditions.ts（TRADITIONS, TRADITION_CATEGORIES, TraditionCategory）
 */
import { bingImage } from '@/utils/geoImage'
import { useEffect, useMemo, useState } from 'react'
import OverviewLayout from '@/components/ui/OverviewLayout'
import OverviewSearch from '@/components/ui/OverviewSearch'
import EmptyState from '@/components/ui/EmptyState'
import {
  TRADITIONS,
  TRADITION_CATEGORIES,
  type TraditionCategory,
} from '@/data/traditions'

interface Props {
  isActive: boolean
  onClose: () => void
}

const CATEGORY_META: Record<TraditionCategory, { icon: string; label: string; color: string }> = {
  history:    { icon: '📜', label: '历史',     color: '#c89a5b' },
  family:     { icon: '👪', label: '家',       color: '#d4856a' },
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

export default function TraditionsOverview({ isActive, onClose }: Props) {
  const [activeCat, setActiveCat] = useState<TraditionCategory | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TRADITIONS.filter(t => {
      if (activeCat !== 'all' && t.category !== activeCat) return false
      if (q) {
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.summary.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [activeCat, query])

  // ESC 关闭
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, onClose])

  return (
    <OverviewLayout
      emoji="🪷"
      title="全传统"
      subtitle={`${TRADITIONS.length} 项中国传统 · 12 个子分类`}
      onClose={onClose}
      toolbar={
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCat('all')}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              activeCat === 'all'
                ? 'bg-emerald-700/40 text-emerald-200 border-emerald-500/60'
                : 'bg-ink-700/60 text-ink-400 border-ink-600 hover:text-parchment-50'
            }`}
          >
            全部 <span className="text-ink-300 ml-1">({TRADITIONS.length})</span>
          </button>
          {TRADITION_CATEGORIES.map(cat => {
            const count = TRADITIONS.filter(t => t.category === cat).length
            if (count === 0) return null
            const meta = CATEGORY_META[cat]
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  activeCat === cat ? 'border-emerald-500/60' : 'bg-ink-700/60 text-ink-400 border-ink-600 hover:text-parchment-50'
                }`}
                style={activeCat === cat ? { background: meta.color + '30', color: meta.color } : undefined}
              >
                {meta.icon} {meta.label} <span className="text-ink-300 ml-1">({count})</span>
              </button>
            )
          })}
        </div>
      }
    >
      <OverviewSearch value={query} onChange={setQuery} placeholder="搜索传统条目..." />
      {filtered.length === 0 ? (
        <EmptyState emoji="🔍" title="暂无符合条件的条目" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(t => {
            const meta = CATEGORY_META[t.category]
            return (
              <div
                key={t.id}
                className="relative rounded-lg overflow-hidden border border-ink-600 bg-ink-800/60 hover:border-emerald-500/60 transition-all group min-h-[180px]"
                style={{ borderLeftWidth: '3px', borderLeftColor: meta.color }}
              >
                {/* 背景图：优先 imageUrl，否则用 bingImage(imageKeyword ?? title) */}
                <img
                  src={t.imageUrl ?? bingImage(t.imageKeyword ?? `${t.title} ${t.era ?? ''} Chinese tradition`, 800, 450)}
                  alt={t.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                {/* 暗色蒙版：顶部轻、底部重，保证文字可读 */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.85) 100%)',
                  }}
                />
                {/* 顶部子分类徽章 */}
                <div className="absolute top-2 left-2 z-10">
                  <span
                    className="text-xs px-2 py-0.5 rounded font-medium backdrop-blur"
                    style={{ background: meta.color + '30', color: '#fdf8f0', border: `1px solid ${meta.color}80` }}
                  >
                    {meta.icon} {meta.label}
                  </span>
                </div>
                {/* 底部文字：叠加在背景渐变上 */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10 text-bone">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-base font-serif group-hover:text-emerald-300 transition-colors drop-shadow">
                      {t.title}
                    </span>
                    {t.era && (
                      <span className="text-xs text-bone/80 tabular-nums shrink-0 drop-shadow">{t.era}</span>
                    )}
                  </div>
                  <div className="text-xs text-bone/85 leading-relaxed line-clamp-2 drop-shadow">{t.summary}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </OverviewLayout>
  )
}