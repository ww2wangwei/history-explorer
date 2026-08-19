/**
 * 全诗词总览页
 *
 * - 复用 OverviewLayout / OverviewSearch / EmptyState
 * - 朝代 / 主题筛选 + 标题/作者搜索
 * - 点击卡片 → 弹出 PoemDetailDialog
 *
 * 每个 component 单独 dynamic import — 由 Layout.tsx 用 lazy + Suspense 包裹。
 */
import { useEffect, useMemo, useState } from 'react'
import poemsData from '@/data/poems.json'
import type { Poem, PoemCategory, PoemDynasty } from '@/types/poems'
import { usePoemStore } from '@/store/usePoemStore'
import OverviewLayout from '@/components/ui/OverviewLayout'
import OverviewSearch from '@/components/ui/OverviewSearch'
import EmptyState from '@/components/ui/EmptyState'
import PoemScene from './PoemScene'
import PoemDetailDialog from './PoemDetailDialog'

const poems = poemsData.poems as Poem[]

// 按作者作品数排序（多在前），分别取唐/宋
const tangAuthorCounts = new Map<string, number>()
const songAuthorCounts = new Map<string, number>()
poems.forEach(p => {
  if (p.author) {
    if (p.dynasty === '唐') tangAuthorCounts.set(p.author, (tangAuthorCounts.get(p.author) ?? 0) + 1)
    if (p.dynasty === '宋') songAuthorCounts.set(p.author, (songAuthorCounts.get(p.author) ?? 0) + 1)
  }
})
const tangAuthors = Array.from(tangAuthorCounts.keys()).sort((a, b) => (tangAuthorCounts.get(b)! - tangAuthorCounts.get(a)!))
const songAuthors = Array.from(songAuthorCounts.keys()).sort((a, b) => (songAuthorCounts.get(b)! - songAuthorCounts.get(a)!))

interface Props {
  isActive: boolean
  onClose: () => void
}

// 主题 → 分类色（与 CulturesOverview 风格相近）
const CATEGORY_COLORS: Record<string, string> = {
  '山水': '#5b9bc8',
  '送别': '#c8a85b',
  '思乡': '#c89a5b',
  '边塞': '#b85450',
  '咏物': '#9bc89a',
  '爱情': '#c89a8a',
  '哲理': '#9b7eb6',
  '田园': '#5bc89a',
  '咏史': '#a08570',
  '闺怨': '#c878a0',
  '怀古': '#7a8a98',
  '节令': '#e8a23c',
  '爱国': '#b85450',
  '其他': '#5a5142',
}

type DynastyFilter = 'all' | PoemDynasty

const CATEGORY_OPTIONS: [PoemCategory | 'all', string][] = [
  ['all', '全部'],
  ['山水', '🏔 山水'],
  ['送别', '🛤 送别'],
  ['思乡', '🌙 思乡'],
  ['边塞', '🏹 边塞'],
  ['咏物', '🌺 咏物'],
  ['爱情', '💌 爱情'],
  ['哲理', '💡 哲理'],
  ['田园', '🌾 田园'],
  ['咏史', '📜 咏史'],
  ['怀古', '🏯 怀古'],
  ['节令', '🏮 节令'],
  ['爱国', '❤ 爱国'],
  ['其他', '✒ 其他'],
]

export default function PoemsOverview({ isActive, onClose }: Props) {
  const [dynasty, setDynasty] = useState<DynastyFilter>('all')
  const [category, setCategory] = useState<PoemCategory | 'all'>('all')
  const [author, setAuthor] = useState<'all' | string>('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Poem | null>(null)

  const markViewed = usePoemStore(s => s.markViewed)
  const favorites = usePoemStore(s => s.favorites)
  const toggleFavorite = usePoemStore(s => s.toggleFavorite)

  // 打开弹窗时标记已读（每次 mount 时最近阅读）
  useEffect(() => {
    if (selected) markViewed(selected.id)
  }, [selected, markViewed])

  // ESC：先关弹窗，再 ESC 关闭全页
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (selected) {
        setSelected(null)
        e.stopPropagation()
        return
      }
      // 未选诗时交给 OverviewLayout 自身
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, selected])

  // 过滤 + 排序（按朝代 + 作者姓名 -> 默认即为顺排）
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return poems.filter(p => {
      if (dynasty !== 'all' && p.dynasty !== dynasty) return false
      if (category !== 'all' && p.category !== category) return false
      if (author !== 'all' && p.author !== author) return false
      if (q) {
        const text = (p.title + ' ' + p.author + ' ' + p.lines.join(' ')).toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  }, [dynasty, category, author, query])

  if (!isActive) return null

  const totalCount = poems.length
  const tangCount = poems.filter(p => p.dynasty === '唐').length
  const songCount = poems.filter(p => p.dynasty === '宋').length

  return (
    <OverviewLayout
      emoji="📜"
      title="全诗词"
      subtitle={
        filtered.length === totalCount
          ? `共 ${totalCount} 首 · 唐 ${tangCount} · 宋 ${songCount}`
          : `${filtered.length} / ${totalCount} 首 · 唐 ${tangCount} · 宋 ${songCount}${
              author !== 'all' ? ` · 作者：${author}` : ''
            }${
              category !== 'all' ? ` · 主题：${category}` : ''
            }${
              dynasty !== 'all' ? ` · ${dynasty}` : ''
            }`
      }
      onClose={onClose}
      suppressEsc={!!selected}
      headerBorderClass="border-b-[#c89a8a]/40"
      toolbar={
        <>
          {/* 朝代 + 主题筛选 */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex rounded-lg bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
              {([
                ['all', '🌐 全部'],
                ['唐', '🇨🇳 唐诗'],
                ['宋', '🏮 宋词'],
              ] as const).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setDynasty(k as DynastyFilter)}
                  className={`px-3 py-1.5 transition-colors ${
                    dynasty === k ? 'bg-vermilion-500/40 text-vermilion-300' : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap rounded-lg bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
              {CATEGORY_OPTIONS.map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setCategory(k)}
                  className={`px-3 py-1.5 transition-colors ${
                    category === k ? 'bg-vermilion-500/40 text-vermilion-300' : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* 作者下拉 — 按作品数排序（46 位作者） */}
            <select
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-ink-700/60 border border-ink-600 text-xs text-parchment-50 focus:outline-none focus:border-vermilion-500/40 max-w-[180px]"
              title="按作者筛选"
            >
              <option value="all">👤 全部作者</option>
              {tangAuthors.length > 0 && (
                <optgroup label="── 唐 ──">
                  {tangAuthors.map(name => (
                    <option key={name} value={name}>{name} ({tangAuthorCounts.get(name)})</option>
                  ))}
                </optgroup>
              )}
              {songAuthors.length > 0 && (
                <optgroup label="── 宋 ──">
                  {songAuthors.map(name => (
                    <option key={name} value={name}>{name} ({songAuthorCounts.get(name)})</option>
                  ))}
                </optgroup>
              )}
            </select>
            <OverviewSearch
              value={query}
              onChange={setQuery}
              placeholder="搜索题目、作者、正文..."
              minWidth={200}
            />
            {/* 当前 favourite 统计 */}
            {favorites.length > 0 && (
              <span className="text-[10px] text-amber-400/80 ml-auto">⭐ 已收藏 {favorites.length}</span>
            )}
          </div>
        </>
      }
    >
      {filtered.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="未找到匹配的诗词"
          hint="试试切换筛选条件或清空搜索"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(poem => {
            const fav = favorites.includes(poem.id)
            return (
              <div
                key={poem.id}
                className="group rounded-lg overflow-hidden bg-ink-800/60 border border-ink-700 hover:border-vermilion-500/60 hover:bg-ink-800 transition-all flex flex-col"
              >
                <button
                  onClick={() => setSelected(poem)}
                  className="text-left flex-1 flex flex-col"
                  aria-label={`查看《${poem.title}》`}
                >
                  <PoemScene
                    palette={poem.palette}
                    motif={poem.motif}
                    compact
                    title={poem.title}
                    subtitle={poem.author}
                    image={poem.image}
                  />
                  <div className="p-3 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded"
                        style={{
                          background: (CATEGORY_COLORS[poem.category] ?? '#5a5142') + '20',
                          color: CATEGORY_COLORS[poem.category] ?? '#a8a8a8',
                        }}
                      >
                        {poem.category}
                      </span>
                      <span className="text-[9px] text-ink-500">{poem.dynasty}</span>
                      {fav && <span className="text-amber-400 text-xs" title="已收藏">⭐</span>}
                    </div>
                    <div className="text-sm text-parchment-100 line-clamp-2 leading-snug italic">
                      「{poem.lines[0]}」
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(poem.id) }}
                  className={`px-3 py-1.5 text-xs border-t border-ink-700 transition-colors ${
                    fav
                      ? 'bg-amber-600/20 text-amber-300 hover:bg-amber-600/30'
                      : 'bg-ink-700/40 text-ink-400 hover:bg-ink-700 hover:text-amber-300'
                  }`}
                  aria-label={fav ? '取消收藏' : '收藏'}
                >
                  {fav ? '⭐ 已收藏 · 点击取消' : '☆ 收藏'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* 详情弹窗 */}
      {selected && (
        <PoemDetailDialog
          poem={selected}
          isFavorite={favorites.includes(selected.id)}
          onToggleFavorite={() => toggleFavorite(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </OverviewLayout>
  )
}
