/**
 * GeographyOverview — 全地理全屏浏览页
 * 2 个子 tab：
 *   - 🌍 自然地理：来自 geographic-features.ts（11 大类）
 *   - 🏛️ 疆域变迁：来自 public/geo/world/eras/*.geojson + public/geo/china/*.geojson
 *     + 顶部全史时间轴 + 每张卡 SVG 缩略图
 */
import { useEffect, useMemo, useRef, useState, memo, Suspense, lazy, useCallback } from 'react'
import gsap from 'gsap'
import { ALL_GEO_FEATURES, type GeoFeature, type GeoFeatureType } from '@/data/geographic-features'
import { OCEAN_LABELS } from '@/data/oceans'
import erasData from '@/data/eras.json'
import MiniMap from '@/components/Figures/MiniMap'
import TerritoryMapThumb from './TerritoryMapThumb'
import MarkdownText from './MarkdownText'
import OverviewLayout from '@/components/ui/OverviewLayout'
import { TERRITORY_FILES, type TerritoryFile } from '@/data/territory-files'
import { PROVINCES_BY_ID, COUNTRIES_BY_ID, ERA_CENTERS } from '@/data/era-centers'
import { useStaggerEntrance } from '@/hooks/useStaggerEntrance'
import { useJumpToMap } from '@/hooks/useJumpToMap'
import { useHistoryStore } from '@/store/useHistoryStore'
import type { Era } from '@/types'

/**
 * 🪶 详情弹窗按需加载：把整个 TerritoryDetailModal（含 react-simple-maps,
 * react-markdown, remark-gfm 等重依赖）打成独立 chunk。
 * 点击瞬间：先显示外壳（带骨架内容），下一帧 chunk 加载完替换为完整弹窗。
 * 用户感知：弹窗"立刻打开"，重内容稍后到位。
 */
const TerritoryDetailModal = lazy(() => import('./TerritoryDetailModal'))

const eras = erasData as Era[]

/**
 * ⚡ 模块级查找表 — 让 TerritoryCard 的 props 完全稳定。
 *
 * 之前每次点击朝代触发 selectedTerritory 变化时，GeographyOverview 整树 reconcile，
 * 24 张卡的 memo 因 props 引用变化而失效，全部重新执行 TerritoryMapThumb 的 useMemo。
 * 即使 path 缓存让 d3-geo 计算 = 0ms，浏览器还是要 reconcile 6500+ 个 <path> 的 d 属性。
 *
 * 现在把 f / era 派生数据放到模块级 Map，TerritoryCard 只接收 territoryId + onClick 两个
 * 稳定 props。点击瞬间其他 23 张卡完全跳过 React 渲染。
 */
const TERRITORY_FILES_BY_ID: Record<string, TerritoryFile> = {}
const ERA_BY_ID: Record<string, Era | undefined> = {}
for (const f of TERRITORY_FILES) {
  TERRITORY_FILES_BY_ID[f.id] = f
  ERA_BY_ID[f.id] = eras.find(e => e.id === f.id)
}

const ALL_FEATURES: GeoFeature[] = [
  ...ALL_GEO_FEATURES.seas,
  ...ALL_GEO_FEATURES.lakes,
  ...ALL_GEO_FEATURES.rivers,
  ...ALL_GEO_FEATURES.mountains,
  ...ALL_GEO_FEATURES.deserts,
  ...ALL_GEO_FEATURES.plains,
  ...ALL_GEO_FEATURES.peninsulas,
  ...ALL_GEO_FEATURES.straits,
]

interface Props {
  isActive: boolean
  onClose: () => void
}

type Tab = 'nature' | 'territory'

const FEATURE_LABELS: Record<GeoFeatureType, { icon: string; label: string; color: string }> = {
  sea: { icon: '🌊', label: '海洋/海湾', color: '#5b9bc8' },
  lake: { icon: '🪞', label: '湖泊', color: '#6abab6' },
  river: { icon: '🏞️', label: '河流', color: '#5bc8c8' },
  mountain: { icon: '⛰️', label: '山脉', color: '#a89070' },
  desert: { icon: '🏜️', label: '沙漠', color: '#c8a85b' },
  plain: { icon: '🌾', label: '平原', color: '#9bc89a' },
  peninsula: { icon: '🔻', label: '半岛', color: '#b88a6a' },
  strait: { icon: '↔️', label: '海峡', color: '#8a9aba' },
}

const FEATURE_LABELS_BY_ID: Record<GeoFeatureType, { icon: string; label: string; color: string }> = FEATURE_LABELS

export default function GeographyOverview({ isActive, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('nature')
  const [featureType, setFeatureType] = useState<GeoFeatureType | 'all'>('all')
  const [territoryRegion, setTerritoryRegion] = useState<'all' | 'china' | 'world'>('all')
  const [timelineCollapsed, setTimelineCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return localStorage.getItem('geo-timeline-collapsed') === '1' } catch {}
    }
    return false
  })

  // 🔍 全局调试日志：组件挂载时打日志（必须在最早期）
  useEffect(() => {
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      console.log(
        '%c[GSAP] GeographyOverview 挂载 %c tab=' + tab + ' featureType=' + featureType,
        'color:#5bc8c8;font-weight:bold',
        'color:inherit'
      )
    }
  }, [])
  const [selectedFeature, setSelectedFeature] = useState<GeoFeature | null>(null)
  const [selectedTerritory, setSelectedTerritory] = useState<{ id: string; region: 'china' | 'world'; era?: Era } | null>(null)
  

  // 🎯 pendingReopen → 从地图 Back 恢复详情
  // 用 setTimeout 推迟消费，避免 Strict Mode 双挂载 race
  useEffect(() => {
    if (!isActive) return
    const timer = setTimeout(() => {
      const pending = useHistoryStore.getState().pendingReopen
      if (!pending) return
      if (pending.kind === 'geoFeature') {
        const feature = ALL_FEATURES.find(f => f.id === pending.featureId)
        if (feature) {
          setTab('nature')
          setSelectedFeature(feature)
        }
        useHistoryStore.getState().setPendingReopen(null)
        return
      }
      if (pending.kind === 'territory') {
        const t = TERRITORY_FILES.find(
          item => item.id === pending.territoryId && item.region === pending.region,
        )
        if (t) {
          setTab('territory')
          setTerritoryRegion(t.region)
          const eraMatch = eras.find(e => e.id === t.id)
          setSelectedTerritory({
            id: t.id,
            region: t.region,
            era: eraMatch,
          })
        }
        useHistoryStore.getState().setPendingReopen(null)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [isActive])
  // 各朝代加载的 GeoJSON（key = `${id}`，value = FeatureCollection）— 移到 store
  // 让每张卡用 selector 单独订阅该 id，未变化的 23 张卡完全跳过 React 渲染。
  // 之前用 React useState 时，所有卡片都共享一个 state，每次 setState 触发 24 张卡 memo 失效。
  const setTerritoryGeojson = useHistoryStore(s => s.setTerritoryGeojson)
  const territoryGeojsons = useHistoryStore(s => s.territoryGeojsons)

  const setYear = useHistoryStore(s => s.setYear)
  const jumpToMap = useJumpToMap()

  // 📌 ref 保存最新 selectedTerritory — 让 useCallback 内能读最新值
  const lastSelectedTerritoryRef = useRef<{ id: string; region: 'china' | 'world'; era?: Era } | null>(null)
  useEffect(() => { lastSelectedTerritoryRef.current = selectedTerritory }, [selectedTerritory])

  // ⚡ 稳定引用 — 让所有 TerritoryCard 的 onClick prop 引用不变化
  const handleCardClick = useCallback((id: string) => {
    const f = TERRITORY_FILES_BY_ID[id]
    if (!f) return
    setSelectedTerritory({ id: f.id, region: f.region, era: ERA_BY_ID[id] })
  }, [])

  // ⚡ 稳定引用 — 让弹窗 props 不变化，避免 memo 失效触发 1.7MB SVG 重渲
  const handleCloseModal = useCallback(() => setSelectedTerritory(null), [])
  const handleJumpFromModal = useCallback((center: [number, number], year: number, label: string) => {
    const last = lastSelectedTerritoryRef.current
    if (last) {
      jumpToMap(center, label, 4, {
        reopenLabel: label,
        territoryId: last.id,
        territoryRegion: last.region,
      })
    } else {
      jumpToMap(center, label, 4)
    }
    setYear(year)
    setSelectedTerritory(null)
  }, [jumpToMap, setYear])

// 朝代/文明的近似中心坐标（用于疆域弹窗的缩略图）—— 模块级常量，避免每次渲染重建
// （已抽到 @/data/era-centers 共享给 TerritoryDetailModal）

/**
 * 🪶 TerritoryModalShell — 弹窗外壳（Suspense fallback）
 *
 * 性能考量：点击朝代卡时，TerritoryDetailModal 是 lazy 加载（独立 chunk）。
 * 在 chunk 下载 + 解析完成前，Suspense 会显示这个 fallback。
 * 它只渲染一个浅骨架（标题+关闭按钮+一个色带），整树只有几十个节点，
 * 渲染耗时 < 5ms。用户感知"弹窗立刻打开"，重内容随后到位。
 */
interface TerritoryModalShellProps {
  territoryId: string
  era?: Era
  onClose: () => void
}
function TerritoryModalShell({ territoryId, era, onClose }: TerritoryModalShellProps) {
  const tf = TERRITORY_FILES.find(f => f.id === territoryId)
  const fallbackColor = tf?.fallbackColor ?? era?.color ?? '#5b9bc8'
  const title = era?.name ?? territoryId
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-ink-800 rounded-lg border border-emerald-700/40 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="疆域详情（加载中）"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-2 rounded-t-lg" style={{ background: fallbackColor }} />
        <div className="px-6 py-4 border-b border-emerald-700/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-ink-300 mb-1">🏛️ 疆域变迁 · 加载中…</div>
            <h3 className="text-xl font-serif text-emerald-300">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-300 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700"
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-3 animate-pulse">
          <div className="h-4 bg-ink-700/50 rounded w-full" />
          <div className="h-4 bg-ink-700/50 rounded w-5/6" />
          <div className="h-4 bg-ink-700/50 rounded w-3/4" />
        </div>
      </div>
    </div>
  )
}

// 单张朝代卡片，React.memo 包裹：上层 state（如 timelineCollapsed）变化时不重渲染整张卡
//
// ⚡ 性能关键：所有 props 必须是稳定引用！
// - territoryId: string（父组件 map 时模板字符串，稳定）
// - onClick: useCallback 包装的稳定函数
// 卡片内部从模块级 Map + zustand selector 取数据，selectedTerritory 变化时其他 23 张卡完全跳过。
interface TerritoryCardProps {
  territoryId: string
  onClick: (id: string) => void
}
function TerritoryCardInner({ territoryId, onClick }: TerritoryCardProps) {
  // ⚡ 闭包内派生所有需要的数据（避免 props 引用变化）
  const f = TERRITORY_FILES_BY_ID[territoryId]
  const era = ERA_BY_ID[territoryId]
  // ⚡ selector 只订阅该 id 的 geojson；其他卡片的 geojson 变化不会触发本卡 re-render
  const geojson = useHistoryStore((s) => s.territoryGeojsons[territoryId])
  const eraColor = f.fallbackColor ?? era?.color ?? '#888'
  const peakLabel = f.peakYear != null
    ? (f.peakYear < 0 ? `BC ${-f.peakYear}` : `${f.peakYear}`)
    : null
  return (
    <div
      id={`territory-card-${territoryId}`}
      className="card-hover text-left rounded-lg overflow-hidden border border-ink-600 bg-ink-800/60 hover:border-emerald-500/60 hover:bg-ink-700/60 transition-all group cursor-pointer"
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: eraColor,
        scrollMarginTop: '320px',
      }}
      onClick={() => onClick(territoryId)}
    >
      <div className="relative w-full bg-ink-900/40" style={{ aspectRatio: '16/9' }}>
        {geojson ? (
          <TerritoryMapThumb
            geojson={geojson}
            fallbackColor={eraColor}
            className="w-full h-full"
            alt={`${f.id} 疆域图`}
            center={ERA_CENTERS[f.id]}
            label={era?.name ?? f.id}
            provinces={f.region === 'china' ? PROVINCES_BY_ID[f.id] : COUNTRIES_BY_ID[f.id]}
            cacheId={`${f.id}-thumb`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-300 text-xs">
            <span className="opacity-60">暂无边界数据</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-transparent to-ink-900/40 pointer-events-none" />
        <div
          className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-lg z-10 backdrop-blur"
          style={{ background: eraColor + '30', color: eraColor, border: `1px solid ${eraColor}80` }}
        >
          {f.region === 'china' ? '🇨🇳 中国' : '🌍 世界'}
        </div>
        {peakLabel && (
          <div className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-lg bg-ink-900/80 backdrop-blur z-10">
            <span className="text-ink-400">鼎盛期 </span>
            <span className="text-amber-200 font-bold tabular-nums">{peakLabel}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="text-base font-serif group-hover:text-emerald-300 transition-colors">
            {era?.name ?? f.id}
          </span>
          {era && (
            <span className="text-xs text-ink-300 tabular-nums shrink-0">
              {era.startYear < 0 ? `BC ${-era.startYear}` : era.startYear} ~ {era.endYear < 0 ? `BC ${-era.endYear}` : era.endYear}
            </span>
          )}
        </div>
        {f.shortDesc && (
          <div className="text-xs text-ink-300 leading-relaxed line-clamp-2">{f.shortDesc}</div>
        )}
      </div>
    </div>
  )
}
const TerritoryCard = memo(TerritoryCardInner)

// 单张自然地理特征卡片，React.memo 包裹
interface NatureCardProps {
  f: GeoFeature
  onClick: () => void
}
function NatureCardInner({ f, onClick }: NatureCardProps) {
  const meta = FEATURE_LABELS[f.type]
  return (
    <button
      onClick={onClick}
      className="card-hover geo-card text-left rounded-lg overflow-hidden border border-ink-600 bg-ink-800/60 hover:border-emerald-500/60 hover:bg-ink-700/60 transition-all group"
    >
      <div
        className="relative w-full bg-ink-900 overflow-hidden"
        style={{
          aspectRatio: '16/9',
          background: `linear-gradient(135deg, ${meta.color}55 0%, ${meta.color}22 100%)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center select-none">
          <span className="text-6xl opacity-90 group-hover:scale-110 transition-transform duration-300">
            {meta.icon}
          </span>
        </div>
        {f.imageUrl && (
          <img
            src={f.imageUrl}
            alt={f.name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-10"
            style={{ opacity: 0 }}
            loading="lazy"
            onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-ink-900/95 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-lg z-20"
          style={{ background: meta.color + '40', color: '#fff', border: `1px solid ${meta.color}80` }}>
          {meta.label}
        </div>
        {f.importance === 3 && (
          <div className="absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded-lg z-20 bg-amber-500/40 text-amber-200 border border-amber-500/60">
            ⭐ 重要
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="text-base font-serif text-parchment-50 group-hover:text-emerald-300 transition-colors">{f.name}</span>
          <span className="text-xs text-ink-300 tabular-nums shrink-0">
            {f.labelPos[0].toFixed(1)}°, {f.labelPos[1].toFixed(1)}°
          </span>
        </div>
        {f.description && (
          <div className="text-xs text-ink-300 leading-relaxed line-clamp-2">
            {f.description}
          </div>
        )}
      </div>
    </button>
  )
}
const NatureCard = memo(NatureCardInner)

  // 朝代对应现代省份/地区（中国朝代）—— 见 src/data/china-provinces.ts 的 getProvincesForForTerritory

  // 时间轴色块容器 — 用于 GSAP stagger 进场
  const timelineBarsRef = useRef<HTMLDivElement | null>(null)
  const tabsUsedRef = useRef(false)
  // 自然地理卡片容器 — 用于 GSAP stagger 进场（按 featureType 分组）
  const natureCardsRef = useRef<HTMLDivElement | null>(null)

  // 切换到疆域变迁 tab 时，时间轴色块 stagger 进场
  useEffect(() => {
    if (tab !== 'territory' || !timelineBarsRef.current) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) { tabsUsedRef.current = true; return }
    const bars = timelineBarsRef.current.querySelectorAll<HTMLElement>('button')
    if (!bars.length) return
    // 先 kill 之前残留的 GSAP tween，避免多次切换 tab 时动画堆积
    gsap.killTweensOf(bars)
    // 按 startYear 排序（按朝代时间从早到晚进场）
    const sortedBars = Array.from(bars).sort((a, b) => {
      const aLeft = parseFloat((a as HTMLElement).style.left)
      const bLeft = parseFloat((b as HTMLElement).style.left)
      return aLeft - bLeft
    })
    // 缩短动画时长：stagger 从 0.08 → 0.03，总动画时间从 ~1.9s 降到 ~0.7s
    gsap.from(sortedBars, {
      opacity: 0, y: 4, scaleY: 0,
      duration: 0.35, stagger: 0.03, ease: 'power2.out',
      transformOrigin: '50% 50%',
    })
    tabsUsedRef.current = true
    return () => { gsap.killTweensOf(bars) }
  }, [tab])

  // 切换到疆域变迁 tab 时，批量加载所有 GeoJSON（写入 store，让单卡片订阅）
  useEffect(() => {
    if (tab !== 'territory') return
    const toLoad = TERRITORY_FILES.filter(f => !territoryGeojsons[f.id])
    if (toLoad.length === 0) return
    let cancelled = false
    Promise.all(
      toLoad.map(async f => {
        // 用 f.geoFile ?? f.id 兼容 id 与文件名不一致的情况（如 han-west → han.geojson）
        const fileStem = f.geoFile ?? f.id
        // 注意：base 是 /history/，public/ 下的资源要用 import.meta.env.BASE_URL 前缀
        const path = `${import.meta.env.BASE_URL}geo/${f.region === 'china' ? 'china' : 'world/eras'}/${fileStem}.geojson`
        try {
          const res = await fetch(path)
          if (!res.ok) return { id: f.id, data: null }
          const data = await res.json()
          return { id: f.id, data }
        } catch {
          return { id: f.id, data: null }
        }
      })
    ).then(results => {
      if (cancelled) return
      // ⚡ 写入 store，每个 id 单独 setState，只有订阅该 id 的卡片 re-render
      for (const r of results) if (r.data) setTerritoryGeojson(r.id, r.data)
    })
    return () => { cancelled = true }
  }, [tab])

  // 🌍 预加载世界底图（world-atlas 50m）— 切到 territory tab 就启动，避免点开弹窗时
  // 才下载 + 解析 + 触发几十次 d3-geo projection 导致首帧卡顿。
  // 注意：TerritoryMapThumb 模块内已缓存 promise，这里只是提前发起 import。
  // 导入动态 chunk 会在浏览器空闲时执行，本身不阻塞渲染。
  useEffect(() => {
    if (tab !== 'territory') return
    // 触发 promise，不 await；保留返回值引用让浏览器能继续调度微任务
    import('world-atlas/countries-50m.json').catch(() => {
      /* 静默失败：TerritoryMapThumb 内部有兜底逻辑 */
    })
  }, [tab])

  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedFeature || selectedTerritory) {
          setSelectedFeature(null)
          setSelectedTerritory(null)
        } else {
          onClose()
        }
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, selectedFeature, selectedTerritory, onClose])

  const allFeatures = ALL_FEATURES

  const filteredFeatures = useMemo(() => {
    return allFeatures
      .filter(f => featureType === 'all' || f.type === featureType)
      .sort((a, b) => (b.importance ?? 1) - (a.importance ?? 1))
  }, [allFeatures, featureType])

  // 自然地理卡片 stagger 进场（tab 切到 nature 或 featureType 筛选变化时重跑）
  useStaggerEntrance(natureCardsRef, '.geo-card', [tab, featureType, filteredFeatures.length], { y: 16, scale: 0.96, duration: 0.45, each: 0.04 })

  if (!isActive) return null

  /** 全史时间轴范围（BC 1500 — AD 2100，含所有朝代/帝国） */
  const TIMELINE_MIN = -1500
  const TIMELINE_MAX = 2100
  const TIMELINE_RANGE = TIMELINE_MAX - TIMELINE_MIN

  // 按文明分组：每行一个文明，行内按朝代/时期分色块
  const civGroups = useMemo(() => {
    const map = new Map<string, { key: string; label: string; flag: string; items: TerritoryFile[] }>()
    const startOf = (f: TerritoryFile) => eras.find(e => e.id === f.id)?.startYear ?? 0
    TERRITORY_FILES.forEach(f => {
      const era = eras.find(e => e.id === f.id)
      let key: string, label: string, flag: string
      if (f.region === 'china') { key = 'china'; label = '中国'; flag = '🇨🇳' }
      else if (f.id === 'rome-republic' || f.id === 'rome-empire') { key = 'rome'; label = '罗马'; flag = '🏛️' }
      else { key = f.id; label = era?.name ?? f.id; flag = '🌍' }
      if (!map.has(key)) map.set(key, { key, label, flag, items: [] })
      map.get(key)!.items.push(f)
    })
    const groups = Array.from(map.values())
    groups.forEach(g => g.items.sort((a, b) => startOf(a) - startOf(b)))
    groups.sort((a, b) => {
      if (a.key === 'china') return -1
      if (b.key === 'china') return 1
      return Math.min(...a.items.map(startOf)) - Math.min(...b.items.map(startOf))
    })
    return groups
  }, [])

  /** 滚动到指定朝代卡片 — 用 'start' 让目标卡片滚到 sticky header 下方，避免被遮挡 */
  const scrollToTerritory = (id: string) => {
    const el = document.getElementById(`territory-card-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <OverviewLayout
      emoji="🗺️"
      title="全地理"
      subtitle={
        tab === 'nature'
          ? `${filteredFeatures.length} 项自然地理特征`
          : `${TERRITORY_FILES.length} 个朝代/文明的疆域变迁`
      }
      onClose={onClose}
      suppressEsc
      headerBorderClass="border-emerald-700/40"
      toolbar={
        <>
          {/* Tab 切换 */}
          <div className="flex rounded-lg bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
            <button
              onClick={() => setTab('nature')}
              className={`px-4 py-1.5 transition-colors ${
                tab === 'nature' ? 'bg-emerald-700/40 text-emerald-300' : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
              }`}
            >
              🌍 自然地理
            </button>
            <button
              onClick={() => setTab('territory')}
              className={`px-4 py-1.5 transition-colors ${
                tab === 'territory' ? 'bg-emerald-700/40 text-emerald-300' : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
              }`}
            >
              🏛️ 疆域变迁
            </button>
          </div>

          {/* 全史时间轴 — 仅在疆域 tab 显示 */}
          {tab === 'territory' && (
            <div className="mt-4">
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTimelineCollapsed(c => {
                      const next = !c
                      try { localStorage.setItem('geo-timeline-collapsed', next ? '1' : '0') } catch {}
                      return next
                    })
                  }}
                  className="flex items-center gap-2 px-2 py-1 -ml-2 rounded hover:bg-ink-700/60 hover:text-emerald-300 transition-colors"
                  title={timelineCollapsed ? '展开时间轴' : '收起时间轴'}
                  aria-expanded={!timelineCollapsed}
                >
                  <span>📅 疆域变迁时间轴</span>
                  <span className="text-ink-400 normal-case">（BC 1500 ~ AD 2100，共 {TERRITORY_FILES.length} 个朝代/帝国）</span>
                  <span className="text-ink-400 ml-1 inline-block transition-transform" style={{ transform: timelineCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span>
                </button>
                <span className="text-ink-400 ml-auto">点击色块 ⬇ 跳转</span>
              </div>
              {!timelineCollapsed && (
              <div ref={timelineBarsRef} className="space-y-1">
                {/* 年份刻度行 */}
                <div className="relative w-full h-4">
                  {[-1500, -1000, -500, 0, 500, 1000, 1500, 2000].map(y => {
                    const x = ((y - TIMELINE_MIN) / TIMELINE_RANGE) * 100
                    return (
                      <div key={y} className="absolute top-0 -translate-x-1/2 text-[9px] text-ink-400 tabular-nums pointer-events-none" style={{ left: `${x}%` }}>
                        {y < 0 ? `${-y} BC` : y}
                      </div>
                    )
                  })}
                </div>
                {/* 每个文明一行，行内按朝代/时期分色块 */}
                {civGroups.map(g => (
                  <div key={g.key} className="flex items-center gap-2">
                    <div className="w-24 shrink-0 flex items-center gap-1 text-[11px] text-ink-300 truncate" title={g.label}>
                      <span className="shrink-0">{g.flag}</span>
                      <span className="truncate">{g.label}</span>
                    </div>
                    <div className="relative flex-1 h-6 bg-ink-900/40 rounded border border-ink-700">
                      {g.items.map(f => {
                        const era = eras.find(e => e.id === f.id)
                        const sy = era?.startYear ?? 0
                        const ey = era?.endYear ?? 0
                        const s = Math.max(0, (sy - TIMELINE_MIN) / TIMELINE_RANGE * 100)
                        const e = Math.min(100, (ey - TIMELINE_MIN) / TIMELINE_RANGE * 100)
                        const w = Math.max(e - s, 0.5)
                        const color = f.fallbackColor || era?.color || '#888'
                        const wide = w >= 4
                        return (
                          <button key={f.id} onClick={() => scrollToTerritory(f.id)}
                            title={`${era?.name ?? f.id}（${sy < 0 ? -sy + ' BC' : sy} ~ ${ey < 0 ? -ey + ' BC' : ey}）`}
                            className="absolute top-1/2 -translate-y-1/2 h-3.5 rounded-sm opacity-90 hover:opacity-100 hover:ring-2 hover:ring-white/70 hover:z-10 transition-all group"
                            style={{ left: `${s}%`, width: `${w}%`, minWidth: '10px', background: color, borderTop: `1px solid ${color}` }}>
                            {wide && (
                              <span className="absolute inset-0 flex items-center justify-center text-[8px] leading-none text-white/90 font-medium truncate px-0.5 pointer-events-none">{era?.name ?? f.id}</span>
                            )}
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] whitespace-nowrap text-ink-200 opacity-0 group-hover:opacity-100 pointer-events-none">{era?.name ?? f.id}</span>
                          </button>
                        )
})}
                     </div>
                   </div>
                 ))}
               </div>
)}
              {!timelineCollapsed && (
                <div className="text-xs text-ink-300 mt-1 flex items-center gap-3">
                  <span>每行一个文明 · 行内色块 = 不同时期的疆域</span>
                  <span className="ml-auto">点击色块 ⬇ 跳转</span>
                </div>
              )}
            </div>
          )}
        </>
      }
    >
      <>
        {tab === 'nature' ? (
          <>
            {/* 特征类型 chips 筛选 */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              <button
                onClick={() => setFeatureType('all')}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  featureType === 'all'
                    ? 'bg-emerald-700/40 text-emerald-200 border-emerald-500/60'
                    : 'bg-ink-700/60 text-ink-400 border-ink-600 hover:text-parchment-50'
                }`}
              >
                全部 <span className="text-ink-300 ml-1">({allFeatures.length})</span>
              </button>
              {(Object.keys(FEATURE_LABELS) as GeoFeatureType[]).map(t => {
                const count = allFeatures.filter(f => f.type === t).length
                if (count === 0) return null
                const meta = FEATURE_LABELS[t]
                return (
                  <button
                    key={t}
                    onClick={() => setFeatureType(t)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      featureType === t ? 'border-emerald-500/60' : 'bg-ink-700/60 text-ink-400 border-ink-600 hover:text-parchment-50'
                    }`}
                    style={featureType === t ? { background: meta.color + '30', color: meta.color } : undefined}
                  >
                    {meta.icon} {meta.label} <span className="text-ink-300 ml-1">({count})</span>
                  </button>
                )
              })}
            </div>
            {/* 大洋文字标签 */}
            <div className="mb-4 p-3 rounded-lg bg-ink-800/40 border border-ink-700">
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-2">五大洋</div>
              <div className="flex flex-wrap gap-2">
                {OCEAN_LABELS.map(o => (
                  <span key={o.id} className="text-xs px-2 py-0.5 rounded-lg bg-blue-900/30 text-blue-200 border border-blue-700/40">
                    {o.name}
                  </span>
                ))}
              </div>
            </div>
            {/* 特征卡片 — 含 16:9 缩略图（双层兜底）+ 简介摘要 */}
            <div ref={natureCardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFeatures.map(f => (
                <NatureCard key={f.id} f={f} onClick={() => setSelectedFeature(f)} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex rounded-lg bg-ink-700/60 border border-ink-600 overflow-hidden text-xs mb-4 w-fit">
              {(['all', 'china', 'world'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setTerritoryRegion(r)}
                  className={`px-3 py-1.5 transition-colors ${
                    territoryRegion === r
                      ? 'bg-emerald-700/40 text-emerald-300'
                      : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
                  }`}
                >
                  {r === 'all' ? '全部' : r === 'china' ? '🇨🇳 中国' : '🌍 世界'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
              {TERRITORY_FILES.filter(f => territoryRegion === 'all' || f.region === territoryRegion).map(f => (
                // ⚡ TerritoryCard 只接 territoryId + onClick 两个稳定 props。
                // 卡片内部用 selector 订阅自己的 geojson，未变化的 23 张卡完全跳过渲染。
                <TerritoryCard
                  key={f.id}
                  territoryId={f.id}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          </>
        )}

      {/* 自然地理详情弹窗 */}
      {selectedFeature && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
          onClick={() => setSelectedFeature(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-emerald-700/40 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="地理详情"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 图片区 — 双层兜底：渐变+emoji 始终可见，Bing 真实图加载成功后淡入覆盖 */}
            <div className="relative w-full bg-ink-900" style={{ aspectRatio: '16/9' }}>
              {/* 兜底：渐变 + 大字 emoji（即使没图或图加载失败也始终显示） */}
              <div
                className="absolute inset-0 flex items-center justify-center select-none"
                style={{
                  background: `linear-gradient(135deg, ${FEATURE_LABELS[selectedFeature.type].color}55 0%, ${FEATURE_LABELS[selectedFeature.type].color}22 100%)`,
                }}
              >
                <span className="text-7xl opacity-80">
                  {FEATURE_LABELS[selectedFeature.type].icon}
                </span>
              </div>
              {/* 真实 Bing 图：透明起，加载成功淡入；加载失败保持透明（兜底继续显示） */}
              {selectedFeature.imageUrl && (
                <img
                  src={selectedFeature.imageUrl}
                  alt={selectedFeature.name}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-10"
                  style={{ opacity: 0 }}
                  loading="lazy"
                  onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
                />
              )}
              {/* 标题层覆盖 */}
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-ink-900/95 via-ink-900/40 to-transparent z-20 pointer-events-none">
                <div className="text-xs text-emerald-300 uppercase tracking-wider mb-1">
                  {FEATURE_LABELS[selectedFeature.type].icon} {FEATURE_LABELS[selectedFeature.type].label}
                  {selectedFeature.importance === 3 ? ' · ⭐⭐⭐' : selectedFeature.importance === 2 ? ' · ⭐⭐' : ''}
                </div>
                <h3 className="text-2xl font-serif text-parchment-50">{selectedFeature.name}</h3>
              </div>
              {selectedFeature.imageCredit && (
                <div className="absolute top-3 right-3 text-[9px] text-parchment-50/70 bg-ink-900/70 px-1.5 py-0.5 rounded-lg z-20">
                  📷 {selectedFeature.imageCredit}
                </div>
              )}
              <button
                onClick={() => setSelectedFeature(null)}
                className="absolute top-3 left-3 z-20 text-parchment-50/80 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg bg-ink-900/60 hover:bg-ink-900/80 backdrop-blur"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              {/* 文字介绍 */}
              {selectedFeature.description && (
                <div>
                  <div className="text-xs text-ink-300 uppercase tracking-wider mb-1.5">📜 介绍</div>
                  <div className="text-parchment-50 leading-relaxed">
                    {selectedFeature.description}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-ink-300 uppercase tracking-wider mb-1.5">🗺️ 位置</div>
                <MiniMap
                  focusNode={{
                    title: selectedFeature.name,
                    year: 0,
                    location: selectedFeature.name,
                    importance: (selectedFeature.importance ?? 1) as 1 | 2 | 3,
                    coordinates: selectedFeature.labelPos,
                  }}
                  allNodes={[{
                    title: selectedFeature.name,
                    year: 0,
                    location: selectedFeature.name,
                    importance: (selectedFeature.importance ?? 1) as 1 | 2 | 3,
                    coordinates: selectedFeature.labelPos,
                  }]}
                  onJumpToMap={() => {
                    jumpToMap(selectedFeature.labelPos, selectedFeature.name, 4, {
                      reopenLabel: selectedFeature.name,
                      featureId: selectedFeature.id,
                    })
                    setYear(0)
                    setSelectedFeature(null)
                  }}
                />
                <div className="text-xs text-ink-400 tabular-nums mt-2">
                  经度 {selectedFeature.labelPos[0].toFixed(2)}°, 纬度 {selectedFeature.labelPos[1].toFixed(2)}°
                </div>
              </div>

              <div className="text-xs text-ink-300 italic pt-2 border-t border-ink-700">
                💡 在主地图视图（顶栏"🗺️ 地图"）拖动时间轴可看到该特征
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 疆域详情弹窗 — lazy 加载，点击瞬间先显示外壳骨架，chunk 到位后替换 */}
      {selectedTerritory && (
        <Suspense fallback={<TerritoryModalShell
          territoryId={selectedTerritory.id}
          era={selectedTerritory.era}
          onClose={handleCloseModal}
        />}>
          <TerritoryDetailModal
            territoryId={selectedTerritory.id}
            region={selectedTerritory.region}
            era={selectedTerritory.era}
            geojson={territoryGeojsons[selectedTerritory.id]}
            onClose={handleCloseModal}
            onJumpToMap={handleJumpFromModal}
          />
        </Suspense>
      )}

      </>
    </OverviewLayout>
  )
}
