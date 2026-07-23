import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { scaleLinear } from 'd3-scale'
import { useHistoryStore, MIN_ZOOM, MAX_ZOOM, visibleYearSpan } from '@/store/useHistoryStore'
import { TIME_RANGE, CATEGORY_COLORS, type HistoricalEvent } from '@/types'
import { formatYearShort } from '@/utils/time'
import eventsData from '@/data/events.json'

const events = eventsData as HistoricalEvent[]

const TIMELINE_HEIGHT = 110
const PADDING_X = 40
const RULER_HEIGHT = 32
const EVENTS_AREA_TOP = RULER_HEIGHT + 28
const EVENTS_AREA_HEIGHT = 50

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
        {/* 缩放信息 */}
        <text
          x={PADDING_X}
          y={14}
          fontSize="10"
          fill="#5a5142"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          视图: {Math.round(viewMin)} ~ {Math.round(viewMax)} ({Math.round(yearSpan)} 年) · 缩放 {timelineZoom.toFixed(1)}×
        </text>

        {/* 当前年份大字号标注 */}
        <text
          x={currentX}
          y={20}
          textAnchor="middle"
          className="font-serif"
          fontSize="16"
          fill="#c89a5b"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {formatYearShort(currentYear)}
        </text>

        {/* 主轴线 */}
        <line
          x1={PADDING_X}
          y1={RULER_HEIGHT}
          x2={width - PADDING_X}
          y2={RULER_HEIGHT}
          stroke="#5a5142"
          strokeWidth={1}
        />

        {/* 次刻度 */}
        {minorTicks.map(year => (
          <line
            key={`minor-${year}`}
            x1={xScale(year)}
            y1={RULER_HEIGHT - 4}
            x2={xScale(year)}
            y2={RULER_HEIGHT}
            stroke="#3a342a"
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
              stroke="#5a5142"
              strokeWidth={1}
            />
            <text
              x={xScale(year)}
              y={RULER_HEIGHT + 14}
              textAnchor="middle"
              fontSize="10"
              fill="#5a5142"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {year < 0 ? `前${Math.abs(year)}` : year}
            </text>
          </g>
        ))}

        {/* 事件连接线（从刻度到事件点的引线） */}
        {visibleEvents.map(event => {
          const ex = xScale(event.year)
          if (ex < PADDING_X - 10 || ex > width - PADDING_X + 10) return null
          return (
            <line
              key={`ev-line-${event.id}`}
              x1={ex}
              y1={RULER_HEIGHT + 18}
              x2={ex}
              y2={EVENTS_AREA_TOP + 30}
              stroke={CATEGORY_COLORS[event.category]}
              strokeWidth={0.6}
              strokeOpacity={0.3}
              style={{ pointerEvents: 'none' }}
            />
          )
        })}

        {/* 事件标记点（按 importance 大小） */}
        {visibleEvents.map(event => {
          const ex = xScale(event.year)
          if (ex < PADDING_X - 10 || ex > width - PADDING_X + 10) return null
          const r = event.importance === 3 ? 5 : event.importance === 2 ? 4 : 3
          return (
            <g key={event.id}>
              <circle
                data-role="event-marker"
                cx={ex}
                cy={EVENTS_AREA_TOP + 30}
                r={r}
                fill={CATEGORY_COLORS[event.category]}
                stroke="#fdf8f0"
                strokeWidth={1}
                className="cursor-pointer transition-transform hover:scale-150"
                style={{ transformOrigin: `${ex}px ${EVENTS_AREA_TOP + 30}px` }}
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

        {/* 当前年份指示线 */}
        <line
          x1={currentX}
          y1={RULER_HEIGHT - 18}
          x2={currentX}
          y2={EVENTS_AREA_TOP + 36}
          stroke="#c89a5b"
          strokeWidth={2}
          style={{ pointerEvents: 'none' }}
        />
        <circle
          cx={currentX}
          cy={RULER_HEIGHT}
          r={4}
          fill="#c89a5b"
          style={{ pointerEvents: 'none' }}
        />
      </svg>

      {/* 缩放控制按钮（右下角） */}
      <div className="absolute right-2 top-1.5 flex gap-1 z-10">
        <button
          className="w-6 h-6 rounded-lg bg-ink-700/90 hover:bg-ink-600 border border-ink-600 text-bronze-400 text-sm font-bold leading-none"
          onClick={zoomOut}
          title="缩小时间轴"
          aria-label="缩小时间轴"
        >
          −
        </button>
        <button
          className="w-6 h-6 rounded-lg bg-ink-700/90 hover:bg-ink-600 border border-ink-600 text-bronze-400 text-[9px] font-bold leading-none"
          onClick={resetZoom}
          title="重置缩放"
          aria-label="重置时间轴缩放"
        >
          ⟲
        </button>
        <button
          className="w-6 h-6 rounded-lg bg-ink-700/90 hover:bg-ink-600 border border-ink-600 text-bronze-400 text-sm font-bold leading-none"
          onClick={zoomIn}
          title="放大时间轴"
          aria-label="放大时间轴"
        >
          +
        </button>
      </div>

      {/* 操作提示 */}
      <div className="absolute right-16 top-2.5 text-[9px] text-ink-500 z-10">
        滚轮缩放 · 拖拽平移
      </div>
    </div>
  )
}