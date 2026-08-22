import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { scaleLinear } from 'd3-scale'
import { useHistoryStore, MIN_ZOOM, MAX_ZOOM, visibleYearSpan } from '@/store/useHistoryStore'
import { TIME_RANGE, CATEGORY_COLORS, type HistoricalEvent } from '@/types'
import { formatYearShort } from '@/utils/time'
import eventsData from '@/data/events.json'
import erasData from '@/data/eras.json'
import type { Era } from '@/types'

const events = eventsData as HistoricalEvent[]
const eras = erasData as Era[]

const TIMELINE_HEIGHT = 150
const PADDING_X = 40
const RULER_HEIGHT = 24
// 朝代色带（中国朝代）区域 — 第 1 行
const ERA_BAND_TOP = RULER_HEIGHT + 22
const ERA_BAND_HEIGHT = 14
// 世界文明色带 — 最多 WORLD_BAND_ROWS 行（甘特式分层）
const WORLD_BAND_ROWS = 4
const WORLD_BAND_ROW_GAP = 3
const WORLD_BAND_HEIGHT = 11
const WORLD_BAND_TOP = ERA_BAND_TOP + ERA_BAND_HEIGHT + 8
// 事件区域（在世界色带之后）
const EVENTS_AREA_TOP = WORLD_BAND_TOP + WORLD_BAND_ROWS * (WORLD_BAND_HEIGHT + WORLD_BAND_ROW_GAP) + 10
const EVENTS_CY = EVENTS_AREA_TOP + 20

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(800)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; year: number; centerYear: number } | null>(null)

  const {
    currentYear,
    timelineCenterYear,
    timelineZoom,
    setYear,
    setTimelineView,
    selectEvent,
    filters,
  } = useHistoryStore()

  // 监听容器宽度变化
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width
      if (w) setWidth(w)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // 当前可见的年份范围
  const yearSpan = visibleYearSpan(timelineZoom)
  const viewMin = timelineCenterYear - yearSpan / 2
  const viewMax = timelineCenterYear + yearSpan / 2

  // 年份 → x 坐标的映射
  const xScale = useMemo(
    () =>
      scaleLinear()
        .domain([viewMin, viewMax])
        .range([PADDING_X, width - PADDING_X])
        .clamp(true),
    [viewMin, viewMax, width]
  )

  // 计算主刻度（基于当前 zoom 级别智能选择步长）
  const majorStep = useMemo(() => {
    const totalSpan = yearSpan
    if (totalSpan > 3000) return 500
    if (totalSpan > 1500) return 250
    if (totalSpan > 800) return 100
    if (totalSpan > 400) return 50
    if (totalSpan > 150) return 20
    if (totalSpan > 60) return 10
    if (totalSpan > 25) return 5
    return 2
  }, [yearSpan])

  const minorStep = majorStep / 5

  // 主刻度（仅在视图范围内的）
  const majorTicks = useMemo(() => {
    const startTick = Math.ceil(viewMin / majorStep) * majorStep
    const ticks: number[] = []
    for (let y = startTick; y <= viewMax; y += majorStep) {
      if (y >= TIME_RANGE.MIN_YEAR && y <= TIME_RANGE.MAX_YEAR) {
        ticks.push(y)
      }
    }
    return ticks
  }, [viewMin, viewMax, majorStep])

  // 次刻度
  const minorTicks = useMemo(() => {
    if (minorStep < 1) return []
    const startTick = Math.ceil(viewMin / minorStep) * minorStep
    const ticks: number[] = []
    for (let y = startTick; y <= viewMax; y += minorStep) {
      if (y % majorStep !== 0 && y >= TIME_RANGE.MIN_YEAR && y <= TIME_RANGE.MAX_YEAR) {
        ticks.push(y)
      }
    }
    return ticks
  }, [viewMin, viewMax, majorStep, minorStep])

  // 当前年份 x 坐标
  const currentX = xScale(currentYear)

  // 可见事件：根据缩放级别智能过滤 + 用户筛选
  // - zoom 小（视野广）：只显示高重要度事件
  // - zoom 大（视野窄）：显示所有事件
  // - 应用用户筛选条件（分类、地区、重要度）
  const visibleEvents = useMemo(() => {
    const tolerance = Math.min(yearSpan * 0.3, 1500)
    let filtered = events.filter(
      e => e.year >= viewMin - tolerance && e.year <= viewMax + tolerance
    )

    // 应用用户筛选
    if (filters.categories.length > 0) {
      filtered = filtered.filter(e => filters.categories.includes(e.category))
    }
    if (filters.regions.length > 0) {
      filtered = filtered.filter(e => filters.regions.includes(e.region))
    }
    if (filters.minImportance > 1) {
      filtered = filtered.filter(e => e.importance >= filters.minImportance)
    }

    // 视野越广，越只显示重要事件（自动筛选）
    if (timelineZoom < 1) {
      filtered = filtered.filter(e => e.importance === 3)
    } else if (timelineZoom < 2) {
      filtered = filtered.filter(e => e.importance >= 2)
    }

    return filtered.slice().sort((a, b) => a.year - b.year)
  }, [viewMin, viewMax, yearSpan, timelineZoom, filters])

  // 中国朝代色带：当前视野内的朝代（按起止年切割，只画视野部分）
  const visibleChinaEras = useMemo(() => {
    return eras
      .filter(e => e.region === 'china' && e.endYear >= viewMin && e.startYear <= viewMax)
      .sort((a, b) => a.startYear - b.startYear)
  }, [viewMin, viewMax])

  // 世界文明色带（甘特式分层）
  // 1) 视野过宽时只保留持续时间最长的文明（避免几十个重叠爆炸）
  // 2) 按 startYear 排序后贪心分层：每个文明放到第一个不重叠的行
  const worldBands = useMemo(() => {
    const candidates = eras.filter(
      e => e.region !== 'china' && e.endYear >= viewMin && e.startYear <= viewMax
    )
    if (candidates.length === 0) return []
    // 视野越宽，保留的候选越少
    const maxCandidates = yearSpan > 3000 ? 14 : yearSpan > 1500 ? 18 : yearSpan > 700 ? 24 : 40
    const ranked = candidates
      .slice()
      .sort((a, b) => (b.endYear - b.startYear) - (a.endYear - a.startYear))
      .slice(0, maxCandidates)
      .sort((a, b) => a.startYear - b.startYear)

    const rows: { era: Era; x0: number; x1: number }[][] = []
    for (const era of ranked) {
      const x0 = xScale(era.startYear)
      const x1 = xScale(era.endYear)
      if (x1 <= PADDING_X || x0 >= width - PADDING_X) continue
      let placed = false
      for (let r = 0; r < rows.length && r < WORLD_BAND_ROWS; r++) {
        const last = rows[r][rows[r].length - 1]
        if (x0 >= last.x1 + 1) {
          rows[r].push({ era, x0, x1 })
          placed = true
          break
        }
      }
      if (!placed && rows.length < WORLD_BAND_ROWS) {
        rows.push([{ era, x0, x1 }])
      }
    }
    // 压平并附上行号
    const result: { era: Era; row: number; x0: number; x1: number }[] = []
    rows.forEach((row, r) => row.forEach(b => result.push({ era: b.era, row: r, x0: b.x0, x1: b.x1 })))
    return result
  }, [viewMin, viewMax, xScale, width, yearSpan])

  // 高缩放时给重要事件显示标题标签（避免重叠：至少隔 64px）
  const labeledEvents = useMemo(() => {
    if (yearSpan > 100) return []
    const labels: HistoricalEvent[] = []
    let lastX = -Infinity
    for (const ev of visibleEvents) {
      if (ev.importance < 2) continue
      const ex = xScale(ev.year)
      if (ex < PADDING_X || ex > width - PADDING_X) continue
      if (ex - lastX < 64) continue
      labels.push(ev)
      lastX = ex
    }
    return labels
  }, [visibleEvents, xScale, width, yearSpan])

  // P0: 附近事件浮窗
  // 窗口大小 = max(yearSpan * 0.15, 8)，约「视野 15%」或最少 ±8 年
  // 这样缩放越小窗口越大（看不到细节时给更多 context），缩放越大窗口越小（聚焦当前年）
  const nearbyWindow = Math.max(Math.round(yearSpan * 0.15), 8)
  const nearbyEvents = useMemo(() => {
    const y = currentYear
    let list = events.filter(
      e => e.year >= y - nearbyWindow && e.year <= y + nearbyWindow
    )
    if (filters.categories.length > 0) {
      list = list.filter(e => filters.categories.includes(e.category))
    }
    if (filters.regions.length > 0) {
      list = list.filter(e => filters.regions.includes(e.region))
    }
    if (filters.minImportance > 1) {
      list = list.filter(e => e.importance >= filters.minImportance)
    }
    return list
      .slice()
      .sort((a, b) => Math.abs(a.year - y) - Math.abs(b.year - y) || b.importance - a.importance)
  }, [currentYear, nearbyWindow, filters])

  // 浮窗显示：拖动时 + 释放后 1.2s（让用户看到落点附近事件）
  const [showPanel, setShowPanel] = useState(false)
  useEffect(() => {
    if (isDragging) {
      setShowPanel(true)
      return
    }
    if (!showPanel) return
    const t = setTimeout(() => setShowPanel(false), 1200)
    return () => clearTimeout(t)
  }, [isDragging, showPanel])

  // 鼠标坐标 → 年份的转换
  const clientXToYear = useCallback(
    (clientX: number): number => {
      if (!svgRef.current) return currentYear
      const rect = svgRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      return xScale.invert(x)
    },
    [xScale, currentYear]
  )

  // 鼠标按下开始拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    // 不响应来自事件圆点的点击
    const target = e.target as SVGElement
    if (target.dataset?.role === 'event-marker') return

    setIsDragging(true)
    const year = clientXToYear(e.clientX)
    dragStartRef.current = { x: e.clientX, year, centerYear: timelineCenterYear }
    // 立即把当前年份设置到点击位置
    setYear(Math.round(year))
  }

  // 全局 mousemove / mouseup（拖拽期间）
  useEffect(() => {
    if (!isDragging || !dragStartRef.current) return
    const handleMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return
      const dx = e.clientX - dragStartRef.current.x
      // 计算年份偏移
      const yearDelta = -dx * (yearSpan / (width - 2 * PADDING_X))
      const newCenter = dragStartRef.current.centerYear + yearDelta
      const newYear = dragStartRef.current.year + yearDelta

      // 平移视口
      setTimelineView(newCenter, timelineZoom)
      // 跟随移动当前年份（保持点击点不动）
      setYear(Math.round(newYear))
    }
    const handleUp = () => {
      setIsDragging(false)
      dragStartRef.current = null
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [isDragging, yearSpan, width, setYear, setTimelineView, timelineZoom])

  // 滚轮缩放（以鼠标位置为中心）
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!svgRef.current) return
      e.preventDefault()
      // 计算缩放因子（向上滚放大、向下滚缩小）
      const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, timelineZoom * factor))
      if (newZoom === timelineZoom) return

      // 以鼠标位置为中心缩放
      const mouseYear = clientXToYear(e.clientX)
      // 缩放后鼠标下的年份仍应在鼠标下：
      // mouseYear = newCenter + (mouseX - centerX) / scale
      const mouseX = e.clientX - svgRef.current.getBoundingClientRect().left
      const centerX = width / 2
      const fraction = (mouseX - centerX) / (width - 2 * PADDING_X)
      const newCenter = mouseYear - fraction * (visibleYearSpan(newZoom) / 2) * 2
      // 上面计算有问题，简化：以鼠标位置为中心
      const visibleAtNewZoom = visibleYearSpan(newZoom)
      const viewMinAtNewZoom = mouseYear - (1 + fraction) * visibleAtNewZoom / 2
      const correctedCenter = viewMinAtNewZoom + visibleAtNewZoom / 2

      setTimelineView(correctedCenter, newZoom)
    },
    [timelineZoom, width, clientXToYear, setTimelineView]
  )

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => svg.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // 缩放控制按钮
  const zoomIn = () => {
    const newZoom = Math.min(MAX_ZOOM, timelineZoom * 1.5)
    setTimelineView(currentYear, newZoom)
  }
  const zoomOut = () => {
    const newZoom = Math.max(MIN_ZOOM, timelineZoom / 1.5)
    setTimelineView(currentYear, newZoom)
  }
  const resetZoom = () => {
    setTimelineView(currentYear, 1)
  }

  return (
    <div
      ref={containerRef}
      className="w-full bg-ink-800/95 backdrop-blur border-t border-ink-600 select-none relative"
      style={{ height: TIMELINE_HEIGHT }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={TIMELINE_HEIGHT}
        onMouseDown={handleMouseDown}
        className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      >
        {/* 当前年份大字号标注（朱砂） */}
        <text
          x={currentX}
          y={16}
          textAnchor="middle"
          className="font-serif"
          fontSize="18"
          fontWeight="bold"
          fill="rgb(var(--vermilion-2-rgb) / 1)"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {formatYearShort(currentYear)}
        </text>
        <text
          x={currentX}
          y={0}
          textAnchor="middle"
          fontSize="0"
          style={{ pointerEvents: 'none' }}
        >
          {''}
        </text>

        {/* 主轴线（柔和） */}
        <line
          x1={PADDING_X}
          y1={RULER_HEIGHT}
          x2={width - PADDING_X}
          y2={RULER_HEIGHT}
          stroke="rgb(var(--text-faint-rgb) / 1)"
          strokeWidth={1}
          opacity={0.7}
        />

        {/* 次刻度 */}
        {minorTicks.map(year => (
          <line
            key={`minor-${year}`}
            x1={xScale(year)}
            y1={RULER_HEIGHT - 4}
            x2={xScale(year)}
            y2={RULER_HEIGHT}
            stroke="rgb(var(--bg-elevated-rgb) / 1)"
            strokeWidth={0.5}
          />
        ))}

        {/* 主刻度 + 标签 */}
        {majorTicks.map(year => (
          <g key={`major-${year}`}>
            <line
              x1={xScale(year)}
              y1={RULER_HEIGHT - 10}
              x2={xScale(year)}
              y2={RULER_HEIGHT}
              stroke="rgb(var(--text-faint-rgb) / 1)"
              strokeWidth={1}
              opacity={0.8}
            />
            <text
              x={xScale(year)}
              y={RULER_HEIGHT + 13}
              textAnchor="middle"
              fontSize="10"
              fill="rgb(var(--text-secondary-rgb) / 1)"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {year < 0 ? `前${Math.abs(year)}` : year}
            </text>
          </g>
        ))}

        {/* 中国朝代色带（半透明，标朝代名） */}
        {visibleChinaEras.map(era => {
          const x0 = Math.max(xScale(era.startYear), PADDING_X)
          const x1 = Math.min(xScale(era.endYear), width - PADDING_X)
          if (x1 - x0 < 3) return null
          const showName = x1 - x0 >= 44
          return (
            <g key={`era-${era.id}`}>
              <rect
                x={x0}
                y={ERA_BAND_TOP}
                width={x1 - x0}
                height={ERA_BAND_HEIGHT}
                rx={3}
                fill={era.color}
                fillOpacity={0.45}
                stroke={era.color}
                strokeOpacity={0.85}
                strokeWidth={0.75}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              />
              {showName && (
                <text
                  x={x0 + 5}
                  y={ERA_BAND_TOP + ERA_BAND_HEIGHT - 3.5}
                  fontSize="9"
                  fill="rgb(var(--text-primary-rgb) / 1)"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {era.name}
                </text>
              )}
            </g>
          )
        })}

        {/* 世界文明色带（甘特式分层，最多 4 行，半透明） */}
        {worldBands.map(({ era, row, x0, x1 }) => {
          const cy = WORLD_BAND_TOP + row * (WORLD_BAND_HEIGHT + WORLD_BAND_ROW_GAP)
          const clampedX0 = Math.max(x0, PADDING_X)
          const clampedX1 = Math.min(x1, width - PADDING_X)
          if (clampedX1 - clampedX0 < 3) return null
          const showName = clampedX1 - clampedX0 >= 38
          return (
            <g key={`world-${era.id}-${row}`}>
              <rect
                x={clampedX0}
                y={cy}
                width={clampedX1 - clampedX0}
                height={WORLD_BAND_HEIGHT}
                rx={2}
                fill={era.color}
                fillOpacity={0.22}
                stroke={era.color}
                strokeOpacity={0.55}
                strokeWidth={0.6}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              />
              {showName && (
                <text
                  x={clampedX0 + 3}
                  y={cy + WORLD_BAND_HEIGHT - 3}
                  fontSize="8"
                  fill="rgb(var(--text-secondary-rgb) / 1)"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {era.name}
                </text>
              )}
            </g>
          )
        })}

        {/* 事件引线（从世界色带下方延伸到事件点） */}
        {visibleEvents.map(event => {
          const ex = xScale(event.year)
          if (ex < PADDING_X - 10 || ex > width - PADDING_X + 10) return null
          const lineStart = WORLD_BAND_TOP + WORLD_BAND_ROWS * (WORLD_BAND_HEIGHT + WORLD_BAND_ROW_GAP) + 2
          return (
            <line
              key={`ev-line-${event.id}`}
              x1={ex}
              y1={lineStart}
              x2={ex}
              y2={EVENTS_CY - 4}
              stroke={CATEGORY_COLORS[event.category]}
              strokeWidth={0.7}
              strokeOpacity={0.35}
              style={{ pointerEvents: 'none' }}
            />
          )
        })}

        {/* 事件标题标签（高缩放时） */}
        {labeledEvents.map(event => {
          const ex = xScale(event.year)
          return (
            <text
              key={`ev-label-${event.id}`}
              x={ex}
              y={EVENTS_CY - 7}
              textAnchor="middle"
              fontSize="9"
              fill={CATEGORY_COLORS[event.category]}
              opacity={0.9}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {event.title.length > 12 ? event.title.slice(0, 12) + '…' : event.title}
            </text>
          )
        })}

        {/* 事件标记点（按 importance 大小，hover 放大） */}
        {visibleEvents.map(event => {
          const ex = xScale(event.year)
          if (ex < PADDING_X - 10 || ex > width - PADDING_X + 10) return null
          const r = event.importance === 3 ? 5 : event.importance === 2 ? 4 : 3
          const cy = EVENTS_CY
          return (
            <g key={event.id}>
              <circle
                data-role="event-marker"
                cx={ex}
                cy={cy}
                r={r}
                fill={CATEGORY_COLORS[event.category]}
                stroke="rgb(var(--text-parchment-rgb) / 1)"
                strokeWidth={1}
                className="cursor-pointer transition-transform hover:scale-150"
                style={{ transformOrigin: `${ex}px ${cy}px` }}
                onClick={(e) => {
                  e.stopPropagation()
                  selectEvent(event.id)
                  setYear(event.year)
                }}
              >
                <title>{event.title}（{event.year < 0 ? '公元前' + Math.abs(event.year) : event.year}）</title>
              </circle>
            </g>
          )
        })}

        {/* 当前年份指示线（朱砂） */}
        <line
          x1={currentX}
          y1={RULER_HEIGHT - 14}
          x2={currentX}
          y2={EVENTS_CY + 12}
          stroke="rgb(var(--vermilion-2-rgb) / 1)"
          strokeWidth={1.6}
          strokeDasharray="1 0"
          style={{ pointerEvents: 'none' }}
        />
        <circle
          cx={currentX}
          cy={RULER_HEIGHT - 14}
          r={3.5}
          fill="rgb(var(--vermilion-2-rgb) / 1)"
          style={{ pointerEvents: 'none' }}
        />
        <circle
          cx={currentX}
          cy={EVENTS_CY + 12}
          r={3.5}
          fill="rgb(var(--vermilion-2-rgb) / 1)"
          style={{ pointerEvents: 'none' }}
        />
      </svg>

      {/* P0: 拖动时附近事件浮窗（绝对定位在 currentYear 上方） */}
      {nearbyEvents.length > 0 && (
        <div
          className={`absolute z-20 pointer-events-none transition-opacity duration-200 ${
            showPanel ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            // 锚到 currentX，左侧不超出 4px，右侧保留 4px
            left: Math.max(4, Math.min(width - 284, currentX - 140)),
            // 浮在时间轴上方（容器高 150）
            bottom: 156,
            width: 280,
          }}
        >
          <div
            className="bg-ink-800/97 backdrop-blur border border-ink-600 rounded-md shadow-xl pointer-events-auto"
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
          >
            {/* 头部 */}
            <div className="px-3 py-1.5 border-b border-ink-700 flex items-center justify-between">
              <div className="text-[10px] text-faint font-serif tracking-wide">
                {formatYearShort(currentYear)} 附近 · {nearbyWindow} 年
              </div>
              <div className="text-[10px] text-vermilion-300 font-bold">
                {nearbyEvents.length} 事件
              </div>
            </div>

            {/* 事件列表（按距离排序，最多 5 个） */}
            <div className="py-1 max-h-[160px] overflow-y-auto">
              {nearbyEvents.slice(0, 5).map(ev => {
                const yearDelta = ev.year - currentYear
                const deltaStr =
                  yearDelta === 0
                    ? '本年'
                    : yearDelta > 0
                    ? `+${yearDelta}年`
                    : `${yearDelta}年`
                return (
                  <button
                    key={ev.id}
                    onClick={() => {
                      selectEvent(ev.id)
                      setYear(ev.year)
                    }}
                    className="w-full px-2.5 py-1 flex items-center gap-2 hover:bg-vermilion-500/15 transition-colors text-left group"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[ev.category] }}
                    />
                    <span className="text-[11px] text-parchment flex-1 truncate group-hover:text-vermilion-200">
                      {ev.title}
                    </span>
                    <span className="text-[10px] text-faint tabular-nums shrink-0">
                      {formatYearShort(ev.year)}
                    </span>
                    <span
                      className={`text-[9px] tabular-nums shrink-0 ${
                        yearDelta === 0
                          ? 'text-vermilion-300 font-bold'
                          : 'text-faint'
                      }`}
                    >
                      {deltaStr}
                    </span>
                    {ev.importance === 3 && (
                      <span className="text-vermilion-400 text-[9px] shrink-0">★</span>
                    )}
                  </button>
                )
              })}
              {nearbyEvents.length > 5 && (
                <div className="px-2.5 py-1 text-[9px] text-faint text-center">
                  还有 {nearbyEvents.length - 5} 个事件未显示…
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 缩放控制按钮（右上角） */}
      <div className="absolute right-2 top-2 flex items-center gap-1 z-10">
        <button
          className="w-6 h-6 rounded-md bg-ink-700/90 hover:bg-vermilion-500/30 border border-ink-600 text-vermilion-300 text-sm font-bold leading-none transition-colors"
          onClick={zoomOut}
          title="缩小时间轴"
          aria-label="缩小时间轴"
        >
          −
        </button>
        <button
          className="w-6 h-6 rounded-md bg-ink-700/90 hover:bg-vermilion-500/30 border border-ink-600 text-vermilion-300 text-[9px] font-bold leading-none transition-colors"
          onClick={resetZoom}
          title="重置缩放"
          aria-label="重置时间轴缩放"
        >
          ⟲
        </button>
        <button
          className="w-6 h-6 rounded-md bg-ink-700/90 hover:bg-vermilion-500/30 border border-ink-600 text-vermilion-300 text-sm font-bold leading-none transition-colors"
          onClick={zoomIn}
          title="放大时间轴"
          aria-label="放大时间轴"
        >
          +
        </button>
      </div>

      {/* 操作提示 */}
      <div className="absolute right-16 top-2.5 text-[9px] text-faint z-10 pointer-events-none">
        滚轮缩放 · 拖拽平移
      </div>
    </div>
  )
}