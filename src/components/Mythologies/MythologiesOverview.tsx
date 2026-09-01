/**
 * MythologiesOverview — 全神话全屏浏览页
 *
 * 列表视图（默认）：卡片网格 + 筛选条（文明 + 分类 + 搜索）
 * 点击某条 → 弹出 MythologyDetailDialog 全屏 Modal
 *
 * 图谱视图：MythologyCharacterGraph（覆盖列表）
 */
import { useEffect, useMemo, useState } from 'react'
import OverviewLayout from '@/components/ui/OverviewLayout'
import OverviewSearch from '@/components/ui/OverviewSearch'
import EmptyState from '@/components/ui/EmptyState'
import {
  MYTHOLOGIES,
  CIVILIZATIONS,
  CATEGORIES,
  type Civilization,
  type MythCategory,
} from '@/data/mythologies'
import { MYTH_CHARACTERS } from '@/data/myth-characters'
import { bingImage } from '@/utils/geoImage'
import { useLearningPathStore } from '@/store/useLearningPathStore'
import MythologyCharacterGraph from './MythologyCharacterGraph'
import MythologyDetailDialog from './MythologyDetailDialog'

interface Props {
  isActive: boolean
  onClose: () => void
}

type View = 'list' | 'graph'

export default function MythologiesOverview({ isActive, onClose }: Props) {
  const [view, setView] = useState<View>('list')
  const [selectedCivs, setSelectedCivs] = useState<Set<Civilization>>(new Set())
  const [selectedCats, setSelectedCats] = useState<Set<MythCategory>>(new Set())
  const [query, setQuery] = useState('')
  // 弹窗状态：当前展示的神话 id（null = 关闭）
  const [dialogMythId, setDialogMythId] = useState<string | null>(null)
  // 是否希望从图谱回跳时聚焦特定角色
  const [focusCharId, setFocusCharId] = useState<string | null>(null)

  const visitedIds = useLearningPathStore(s => s.progressByPath.allMythologies.visitedMythIds) ?? []
  const markVisited = useLearningPathStore(s => s.markMythVisited)

  // 筛选
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MYTHOLOGIES.filter(m => {
        if (selectedCivs.size > 0 && !selectedCivs.has(m.civilization)) return false
        if (selectedCats.size > 0 && !selectedCats.has(m.category)) return false
        if (q) {
          if (
            !m.title.toLowerCase().includes(q) &&
            !m.summary.toLowerCase().includes(q) &&
            !m.characters.some(c => c.toLowerCase().includes(q))
          ) return false
        }
        return true
      })
  }, [selectedCivs, selectedCats, query])

  // 弹窗打开时标记已读
  const dialogMyth = dialogMythId ? MYTHOLOGIES.find(m => m.id === dialogMythId) ?? null : null
  useEffect(() => {
    if (dialogMyth && isActive) markVisited(dialogMyth.id)
  }, [dialogMyth?.id, isActive, markVisited])

  // ESC 关闭：弹窗打开时优先关闭弹窗，再关闭外层
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        if (dialogMythId) setDialogMythId(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, onClose, dialogMythId])

  function toggleCiv(civ: Civilization) {
    setSelectedCivs(prev => {
      const next = new Set(prev)
      if (next.has(civ)) next.delete(civ)
      else next.add(civ)
      return next
    })
  }
  function toggleCat(cat: MythCategory) {
    setSelectedCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const visitedSet = new Set(visitedIds)
  const visitedCount = visitedSet.size

  // 跳转：从弹窗"看角色图谱"按钮 → 切到图谱视图
  function handleJumpToGraph(charId?: string) {
    setFocusCharId(charId ?? null)
    setDialogMythId(null)
    setView('graph')
  }

  // 弹窗组件（无论 list / graph 都可弹出）
  const dialogEl = (
    <MythologyDetailDialog
      myth={dialogMyth}
      onClose={() => setDialogMythId(null)}
      onJumpToGraph={handleJumpToGraph}
    />
  )

  // ============ 图谱视图 ============
  if (view === 'graph') {
    return (
      <OverviewLayout
        emoji="🔱"
        title="全神话 · 角色网络"
        subtitle={
          <>
            <span>{MYTHOLOGIES.length} 篇神话 · </span>
            <span>{MYTH_CHARACTERS.length} 位角色 · 7 大文明</span>
          </>
        }
        onClose={onClose}
        headerBorderClass="border-amber-500/40"
        toolbar={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('list')}
              className="text-xs px-3 py-1.5 rounded-lg bg-ink-700/60 hover:bg-ink-700 text-parchment-50 border border-ink-600 transition-colors"
            >
              ← 返回列表
            </button>
          </div>
        }
      >
        <MythologyCharacterGraph
          selectedCivilization={selectedCivs.size > 0 ? selectedCivs : null}
          focusCharId={focusCharId}
          onCharacterFocused={() => setFocusCharId(null)}
        />
      </OverviewLayout>
    )
  }

  // ============ 列表视图 ============
  return (
    <OverviewLayout
      emoji="🔱"
      title="全神话"
      subtitle={
        <span>{MYTHOLOGIES.length} 篇神话 · 7 大文明 · {visitedCount} / {MYTHOLOGIES.length} 已读</span>
      }
      onClose={onClose}
      headerBorderClass="border-amber-500/40"
      toolbar={
        <div className="flex items-center gap-2 flex-wrap">
          <OverviewSearch
            value={query}
            onChange={setQuery}
            placeholder="搜索神话名/角色/关键词"
            minWidth={220}
          />
          <button
            onClick={() => setView('graph')}
            className="text-xs px-3 py-1.5 rounded-lg bg-amber-700/40 hover:bg-amber-600/60 text-amber-100 border border-amber-500/40 transition-colors"
          >
            🔗 角色网络图谱
          </button>
        </div>
      }
    >
      {/* 筛选条 */}
      <div className="mb-4 space-y-3">
        {/* 文明 */}
        <div>
          <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-1.5">文明</div>
          <div className="flex flex-wrap gap-1.5">
            {CIVILIZATIONS.map(c => {
              const active = selectedCivs.has(c.id)
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCiv(c.id)}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                    active
                      ? 'border-vermilion-500/60 bg-vermilion-700/40 text-vermilion-200'
                      : 'border-ink-600 bg-ink-800/60 text-ink-300 hover:bg-ink-700'
                  }`}
                >
                  <span className="mr-0.5">{c.emoji}</span>
                  {c.name}
                </button>
              )
            })}
          </div>
        </div>
        {/* 分类 */}
        <div>
          <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-1.5">分类</div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(c => {
              const active = selectedCats.has(c.id)
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCat(c.id)}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                    active
                      ? 'border-amber-500/60 bg-amber-700/40 text-amber-200'
                      : 'border-ink-600 bg-ink-800/60 text-ink-300 hover:bg-ink-700'
                  }`}
                >
                  <span className="mr-0.5">{c.emoji}</span>
                  {c.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 卡片网格 */}
      <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-2">
        神话列表 <span className="text-ink-300">({filtered.length})</span>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="没有匹配的神话" hint="尝试调整筛选/搜索" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(m => {
            const civ = CIVILIZATIONS.find(c => c.id === m.civilization)
            const cat = CATEGORIES.find(c => c.id === m.category)
            const visited = visitedSet.has(m.id)
            const bgUrl = bingImage(m.imageKeyword, 600, 340)
            return (
              <button
                key={m.id}
                onClick={() => setDialogMythId(m.id)}
                className="card-hover text-left bg-ink-800/60 hover:bg-ink-700 rounded-xl border border-ink-700 hover:border-amber-500/50 overflow-hidden transition-all hover:-translate-y-0.5 group"
              >
                <div
                  className="relative h-32 bg-cover bg-center"
                  style={{ backgroundImage: `url(${bgUrl})` }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.75) 100%)' }}
                  />
                  <div className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-ink-900/70 text-amber-100 border border-amber-500/30">
                    {civ?.emoji} {civ?.name.replace('神话', '')}
                  </div>
                  <div className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-ink-900/70 text-amber-100/80">
                    {cat?.emoji} {cat?.name}
                  </div>
                  {visited && (
                    <div className="absolute bottom-1 right-2 text-[10px] text-green-400">✓</div>
                  )}
                  <div className="absolute bottom-1 left-2 right-10 text-xs font-serif text-white drop-shadow truncate">
                    {m.title}
                  </div>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[11px] text-ink-300 leading-relaxed line-clamp-2">
                    {m.summary.slice(0, 60)}...
                  </p>
                  <div className="mt-1.5 text-[10px] text-ink-300">{m.eraRange}</div>
                </div>
              </button>
            )
          })}
      </div>
      )}
      {dialogEl}
    </OverviewLayout>
  )
}