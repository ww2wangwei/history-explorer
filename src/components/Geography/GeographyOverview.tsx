/**
 * GeographyOverview — 全地理全屏浏览页
 * 2 个子 tab：
 *   - 🌍 自然地理：来自 geographic-features.ts（11 大类）
 *   - 🏛️ 疆域变迁：来自 public/geo/world/eras/*.geojson + public/geo/china/*.geojson
 *     + 顶部全史时间轴 + 每张卡 SVG 缩略图
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ALL_GEO_FEATURES, type GeoFeature, type GeoFeatureType } from '@/data/geographic-features'
import { OCEAN_LABELS } from '@/data/oceans'
import erasData from '@/data/eras.json'
import MiniMap from '@/components/Figures/MiniMap'
import TerritoryMapThumb from './TerritoryMapThumb'
import OverviewLayout from '@/components/ui/OverviewLayout'
import { useStaggerEntrance } from '@/hooks/useStaggerEntrance'
import { useJumpToMap } from '@/hooks/useJumpToMap'
import { useHistoryStore } from '@/store/useHistoryStore'
import type { Era } from '@/types'

const eras = erasData as Era[]

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

interface TerritoryFile {
  id: string
  /** GeoJSON 文件名（与 id 不一定一致。例如 id='han-west' 但 GeoJSON 文件叫 'han.geojson'） */
  geoFile?: string
  region: 'china' | 'world'
  label: string
  /** 鼎盛期（用于卡片标题显示） */
  peakYear?: number
  /** 卡片显示的简短描述 */
  shortDesc?: string
  /** 疆域主色（高对比，避免 era.color 太暗看不见） */
  fallbackColor?: string
}

const TERRITORY_FILES: TerritoryFile[] = [
  // 中国朝代（按时间顺序）— 全部用 GeoJSON 渲染（见 public/geo/china/*.geojson）
  // 注意：eras.json 中只有 han-west（西汉）/han-east（东汉），但 GeoJSON 文件叫 han.geojson
  // 用 id='han-west' 触发中文显示（eras.find 会找到），用 geoFile='han' 找对的 GeoJSON
  { id: 'qin',          region: 'china', label: '中国', peakYear: -210, shortDesc: '首次大一统：统一文字、度量衡、车轨',            fallbackColor: '#d4a44a' },
  { id: 'han-west',     region: 'china', geoFile: 'han', label: '中国', peakYear: 1, shortDesc: '北击匈奴、通西域，丝绸之路开通',          fallbackColor: '#c69a5b' },
  { id: 'tang',         region: 'china', label: '中国', peakYear: 710,  shortDesc: '东亚文化中心版图达极盛',                       fallbackColor: '#e07a3a' },
  // song.geojson（北宋/南宋合并版图）— 用 song-north id + geoFile='song' 文件映射
  { id: 'song-north',   region: 'china', geoFile: 'song', label: '中国', peakYear: 1080, shortDesc: '北方收缩，但经济文化达到巅峰',         fallbackColor: '#7e8ec1' },
  { id: 'yuan',         region: 'china', geoFile: 'yuan', label: '中国', peakYear: 1280, shortDesc: '蒙古大帝国下的中国，行省制',                  fallbackColor: '#a04a8a' },
  { id: 'ming',         region: 'china', label: '中国', peakYear: 1420, shortDesc: '永乐迁都北京，七下西洋',                       fallbackColor: '#c8584a' },
  { id: 'qing',         region: 'china', label: '中国', peakYear: 1780, shortDesc: '极盛期版图北抵西伯利亚、南括中印半岛',         fallbackColor: '#3e9a76' },
  // 世界帝国（见 public/geo/world/eras/*.geojson）
  { id: 'rome-republic',region: 'world', label: '世界', peakYear: -50,  shortDesc: '罗马共和国击败迦太基，地中海西部霸主',          fallbackColor: '#a8473e' },
  { id: 'rome-empire',  region: 'world', label: '世界', peakYear: 117,  shortDesc: '图拉真鼎盛期：版图含达契亚、亚美尼亚',         fallbackColor: '#a8473e' },
  { id: 'byzantine',    region: 'world', label: '世界', peakYear: 555,  shortDesc: '查士丁尼复兴：收复意大利、北非西部',            fallbackColor: '#5d3a8a' },
  { id: 'arab-caliphate', region: 'world', label: '世界', peakYear: 850, shortDesc: '阿拔斯王朝：横跨伊比利亚至中亚',                fallbackColor: '#2c8a4a' },
  { id: 'persia-safavid', region: 'world', label: '世界', peakYear: 1620, shortDesc: '波斯黄金时代，萨法维中兴',                       fallbackColor: '#8a3a3a' },
  { id: 'ottoman',      region: 'world', label: '世界', peakYear: 1580, shortDesc: '横跨欧亚非三洲，苏莱曼大帝',                  fallbackColor: '#3a8a5a' },
  { id: 'mongol-empire',region: 'world', label: '世界', peakYear: 1290, shortDesc: '人类史上最大陆上帝国',                            fallbackColor: '#5a3a2a' },
  { id: 'british-empire', region: 'world', label: '世界', peakYear: 1900, shortDesc: '号称"日不落"，全球海洋霸主（示意边界）',            fallbackColor: '#b04838' },
]

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
  // 各朝代加载的 GeoJSON（key = `${id}`，value = FeatureCollection）
  const [territoryGeojsons, setTerritoryGeojsons] = useState<Record<string, any>>({})
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const setYear = useHistoryStore(s => s.setYear)
  const jumpToMap = useJumpToMap()

  // 朝代/文明的近似中心坐标（用于疆域弹窗的缩略图）
  const ERA_CENTERS: Record<string, [number, number]> = {
    'qin': [108.94, 34.34], 'han': [108.94, 34.34], 'tang': [108.94, 34.34],
    'song': [114.3, 30.6], 'yuan': [116.4, 39.9], 'ming': [116.4, 39.9], 'qing': [116.4, 39.9],
    'rome-republic': [12.5, 41.9], 'rome-empire': [12.5, 41.9],
    'byzantine': [28.98, 41.01], 'arab-caliphate': [44.42, 32.54],
    'ottoman': [28.98, 41.01], 'mongol-empire': [106.92, 47.92],
    'persia-safavid': [51.42, 35.69], 'british-empire': [-0.13, 51.51],
  }

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
    // 按 startYear 排序（按朝代时间从早到晚进场）
    const sortedBars = Array.from(bars).sort((a, b) => {
      const aLeft = parseFloat((a as HTMLElement).style.left)
      const bLeft = parseFloat((b as HTMLElement).style.left)
      return aLeft - bLeft
    })
    gsap.from(sortedBars, {
      opacity: 0, y: 6, scaleY: 0,
      duration: 0.5, stagger: 0.08, ease: 'power3.out',
      transformOrigin: '50% 50%',
    })
    tabsUsedRef.current = true
  }, [tab])

  // 切换到疆域变迁 tab 时，批量加载所有 GeoJSON
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
      setTerritoryGeojsons(prev => {
        const next = { ...prev }
        for (const r of results) if (r.data) next[r.id] = r.data
        return next
      })
    })
    return () => { cancelled = true }
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
    const el = cardRefs.current[id]
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
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                📅 疆域变迁时间轴
                <span className="text-ink-400">（BC 1500 ~ AD 2100，共 {TERRITORY_FILES.length} 个朝代/帝国）</span>
                <span className="text-ink-400 ml-auto">点击色块 ⬇ 跳转</span>
              </div>
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
              <div className="text-xs text-ink-500 mt-1 flex items-center gap-3">
                <span>每行一个文明 · 行内色块 = 不同时期的疆域</span>
                <span className="ml-auto">点击色块 ⬇ 跳转</span>
              </div>
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
                全部 <span className="text-ink-500 ml-1">({allFeatures.length})</span>
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
                    {meta.icon} {meta.label} <span className="text-ink-500 ml-1">({count})</span>
                  </button>
                )
              })}
            </div>
            {/* 大洋文字标签 */}
            <div className="mb-4 p-3 rounded-lg bg-ink-800/40 border border-ink-700">
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">五大洋</div>
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
              {filteredFeatures.map(f => {
                const meta = FEATURE_LABELS[f.type]
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFeature(f)}
                    className="geo-card text-left rounded-lg overflow-hidden border border-ink-600 bg-ink-800/60 hover:border-emerald-500/60 hover:bg-ink-700/60 transition-all group"
                  >
                    {/* 16:9 缩略图区 — 双层：渐变+emoji 兜底 + Bing 真实图（成功淡入覆盖） */}
                    <div
                      className="relative w-full bg-ink-900 overflow-hidden"
                      style={{
                        aspectRatio: '16/9',
                        background: `linear-gradient(135deg, ${meta.color}55 0%, ${meta.color}22 100%)`,
                      }}
                    >
                      {/* 大字 emoji 兜底（始终渲染） */}
                      <div className="absolute inset-0 flex items-center justify-center select-none">
                        <span className="text-6xl opacity-90 group-hover:scale-110 transition-transform duration-300">
                          {meta.icon}
                        </span>
                      </div>
                      {/* 真实 Bing 图：初始透明，加载成功后淡入；加载失败也保持透明（兜底继续可见） */}
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
                      {/* 底部渐变（确保标题清晰） */}
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-ink-900/95 to-transparent z-10 pointer-events-none" />
                      {/* 类别 chip */}
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
                    {/* 信息区 */}
                    <div className="p-3">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-base font-serif text-parchment-50 group-hover:text-emerald-300 transition-colors">{f.name}</span>
                        <span className="text-xs text-ink-500 tabular-nums shrink-0">
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
              })}
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
              {TERRITORY_FILES.filter(f => territoryRegion === 'all' || f.region === territoryRegion).map(f => {
                const era = eras.find(e => e.id === f.id)
                const geojson = territoryGeojsons[f.id]
                const peakLabel = f.peakYear != null
                  ? (f.peakYear < 0 ? `BC ${-f.peakYear}` : `${f.peakYear}`)
                  : null
                // 优先用人工精选的高对比 fallbackColor（如秦朝 era.color=#3a3a3a 太暗看不见），
                // 其次 era.color，最后兜底 #888
                const eraColor = f.fallbackColor ?? era?.color ?? '#888'
                return (
                  <div
                    key={f.id}
                    ref={(el) => { cardRefs.current[f.id] = el }}
                    className="text-left rounded-lg overflow-hidden border border-ink-600 bg-ink-800/60 hover:border-emerald-500/60 hover:bg-ink-700/60 transition-all group cursor-pointer"
                    style={{
                      borderLeftWidth: '3px',
                      borderLeftColor: eraColor,
                      // 给滚动留 sticky header 位置 ~ 280px（标题 + Tab + 时间轴 + 标签）
                      scrollMarginTop: '320px',
                    }}
                    onClick={() => setSelectedTerritory({ id: f.id, region: f.region, era })}
                  >
                    {/* 上下两层：上半部 SVG 全盛期地图 + 浮动信息，下半部简要介绍 */}
                    <div className="relative w-full bg-ink-900/40" style={{ aspectRatio: '16/9' }}>
                      {/* SVG 全盛期地图（基于 GeoJSON 渲染） */}
                      {geojson ? (
                        <TerritoryMapThumb
                          geojson={geojson}
                          fallbackColor={eraColor}
                          className="w-full h-full"
                          alt={`${f.id} 疆域图`}
                        />
                      ) : (
                        /* 占位：暂无边界数据（GeoJSON 加载失败或不存在） */
                        <div className="absolute inset-0 flex items-center justify-center text-ink-500 text-xs">
                          <span className="opacity-60">暂无边界数据</span>
                        </div>
                      )}
                      {/* 顶部渐变（保护标题）+ 顶部朝代色徽章 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-transparent to-ink-900/40 pointer-events-none" />
                      <div
                        className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-lg z-10 backdrop-blur"
                        style={{ background: eraColor + '30', color: eraColor, border: `1px solid ${eraColor}80` }}
                      >
                        {f.region === 'china' ? '🇨🇳 中国' : '🌍 世界'}
                      </div>
                      {/* 鼎盛期标签（左下） */}
                      {peakLabel && (
                        <div className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-lg bg-ink-900/80 backdrop-blur z-10">
                          <span className="text-ink-400">鼎盛期 </span>
                          <span className="text-amber-200 font-bold tabular-nums">{peakLabel}</span>
                        </div>
                      )}
                    </div>
                    {/* 文字信息 */}
                    <div className="p-3">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-base font-serif group-hover:text-emerald-300 transition-colors">
                          {era?.name ?? f.id}
                        </span>
                        {era && (
                          <span className="text-xs text-ink-500 tabular-nums shrink-0">
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
              })}
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
                  <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">📜 介绍</div>
                  <div className="text-parchment-100 leading-relaxed">
                    {selectedFeature.description}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🗺️ 位置</div>
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

              <div className="text-xs text-ink-500 italic pt-2 border-t border-ink-700">
                💡 在主地图视图（顶栏"🗺️ 地图"）拖动时间轴可看到该特征
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 疆域详情弹窗 */}
      {selectedTerritory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
          onClick={() => setSelectedTerritory(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-emerald-700/40 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="地理详情"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 朝代色带 */}
            {selectedTerritory.era && (
              <div
                className="h-2 rounded-t-lg"
                style={{
                  background: TERRITORY_FILES.find(f => f.id === selectedTerritory.id)?.fallbackColor ?? selectedTerritory.era.color,
                }}
              />
            )}

            <div className="px-6 py-4 border-b border-emerald-700/30 flex items-center justify-between">
              <div>
                <div className="text-xs text-ink-500 mb-1">
                  🏛️ 疆域变迁 · {selectedTerritory.region === 'china' ? '🇨🇳 中国' : '🌍 世界'}
                </div>
                <h3 className="text-xl font-serif text-emerald-300">
                  {selectedTerritory.era?.name ?? selectedTerritory.id}
                </h3>
                {selectedTerritory.era && (
                  <div className="text-xs text-ink-400 mt-0.5 tabular-nums">
                    {selectedTerritory.era.startYear < 0 ? `BC ${-selectedTerritory.era.startYear}` : selectedTerritory.era.startYear} ~ {selectedTerritory.era.endYear < 0 ? `BC ${-selectedTerritory.era.endYear}` : selectedTerritory.era.endYear}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedTerritory(null)}
                className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              {/* 🗺️ 大疆域地图（弹窗专用 — 用户实际最关心的视图） */}
              {territoryGeojsons[selectedTerritory.id] ? (
                <div className="rounded-lg overflow-hidden border border-emerald-700/40 bg-ink-900/40">
                  <TerritoryMapThumb
                    geojson={territoryGeojsons[selectedTerritory.id]}
                    fallbackColor={TERRITORY_FILES.find(f => f.id === selectedTerritory.id)?.fallbackColor ?? selectedTerritory.era?.color ?? '#5b9bc8'}
                    className="w-full h-auto"
                    alt={`${selectedTerritory.id} 详细疆域图`}
                  />
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-xs text-ink-500 bg-ink-900/30 rounded">
                  暂无边界数据
                </div>
              )}

              {/* 一句话概述 */}
              {selectedTerritory.era?.shortDesc && (
                <div className="text-parchment-100 leading-relaxed italic border-l-2 border-emerald-500/50 pl-3">
                  {selectedTerritory.era.shortDesc}
                </div>
              )}

              {/* 完整介绍 */}
              {selectedTerritory.era?.description && (
                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">📜 详细介绍</div>
                  <div className="text-parchment-100 leading-relaxed whitespace-pre-line">
                    {selectedTerritory.era.description}
                  </div>
                </div>
              )}

              {/* 核心要点 */}
              {selectedTerritory.era?.keyPoints && selectedTerritory.era.keyPoints.length > 0 && (
                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🎯 核心要点</div>
                  <ul className="space-y-1">
                    {selectedTerritory.era.keyPoints.map((kp, i) => (
                      <li key={i} className="flex items-start gap-2 text-parchment-100">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 关键事件 */}
              {selectedTerritory.era?.quickEvents && selectedTerritory.era.quickEvents.length > 0 && (
                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">⚡ 关键事件</div>
                  <div className="space-y-2">
                    {selectedTerritory.era.quickEvents.map((ev, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="text-xs text-emerald-300 tabular-nums whitespace-nowrap mt-0.5">
                          {ev.year < 0 ? `BC ${-ev.year}` : ev.year}
                        </div>
                        <div>
                          <div className="text-parchment-50">{ev.title}</div>
                          <div className="text-[11px] text-ink-300 mt-0.5">{ev.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 历史意义 */}
              {selectedTerritory.era?.legacy && (
                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🌟 历史意义</div>
                  <div className="text-parchment-100 leading-relaxed">
                    {selectedTerritory.era.legacy}
                  </div>
                </div>
              )}

              {/* 疆域缩略地图 */}
              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🗺️ 都城/中心位置</div>
                {(() => {
                  const center = ERA_CENTERS[selectedTerritory.id] ?? (
                    selectedTerritory.region === 'china' ? [108.94, 34.34] : [0, 30]
                  ) as [number, number]
                  const title = selectedTerritory.era?.name ?? selectedTerritory.id
                  const year = selectedTerritory.era
                    ? Math.round((selectedTerritory.era.startYear + selectedTerritory.era.endYear) / 2)
                    : 0
                  return (
                    <>
                      <MiniMap
                        focusNode={{
                          title,
                          year,
                          location: title,
                          importance: 3,
                          coordinates: center,
                        }}
                        allNodes={[{
                          title,
                          year,
                          location: title,
                          importance: 3,
                          coordinates: center,
                        }]}
                        onJumpToMap={() => {
                          jumpToMap(center, title, 4, {
                            reopenLabel: title,
                            territoryId: selectedTerritory.id,
                            territoryRegion: selectedTerritory.region,
                          })
                          setYear(year)
                          setSelectedTerritory(null)
                        }}
                      />
                      <div className="text-xs text-ink-400 tabular-nums mt-2">
                        经度 {center[0].toFixed(2)}°, 纬度 {center[1].toFixed(2)}°
                      </div>
                    </>
                  )
                })()}
              </div>

              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">🗺️ 数据源</div>
                <div className="text-xs text-ink-400 font-mono break-all">
                  geo/{selectedTerritory.region === 'china' ? 'china' : 'world/eras'}/{TERRITORY_FILES.find(f => f.id === selectedTerritory.id)?.geoFile ?? selectedTerritory.id}.geojson
                </div>
              </div>
              <div className="text-xs text-ink-500 italic pt-2 border-t border-ink-700">
                💡 在主地图视图（顶栏"🗺️ 地图"）点击该朝代查看疆域渲染
              </div>
            </div>
          </div>
        </div>
      )}

      </>
    </OverviewLayout>
  )
}
