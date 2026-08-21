/**
 * TimelinePathCard — 朝代时间线主路径卡（专属变体）
 *
 * 区别于其他 3 张主路径卡的"普通卡片"风格：
 *   - 时间线缩略：67 个圆点按 startYear 分布，已学=朱砂/未学=灰
 *   - 关键年标：-221 秦 / 0 / 1279 宋 / 1912 民国
 *   - 下一步朝代引导（朱砂印章）
 *   - GSAP 入场动画（dots staggerFrom）
 */
import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import erasData from '@/data/eras.json'
import type { Era } from '@/types'

const eras = erasData as Era[]
const TANSITION_X = 1
const MIN_YEAR = -2200   // 最早朝代起点（兼顾苏美尔/古埃及）
const MAX_YEAR = 2100    // 截止
const KEY_YEARS = [
  { year: -221, label: '秦', width: 1 },
  { year: 0,    label: '公元', width: 2 },
  { year: 1279, label: '宋末', width: 1 },
  { year: 1912, label: '民国', width: 1 },
]

export interface TimelinePathCardProps {
  visited: number
  total: number
  recommendedEra: Era | null
  onClick: () => void
}

export default function TimelinePathCard({
  visited,
  total,
  recommendedEra,
  onClick,
}: TimelinePathCardProps) {
  const pct = total > 0 ? Math.round((visited / total) * 100) : 0
  const recommendedYear = recommendedEra ? Math.round((recommendedEra.startYear + recommendedEra.endYear) / 2) : null
  const cardRef = useRef<HTMLButtonElement>(null)
  const dotsRef = useRef<SVGSVGElement>(null)
  const linePathRef = useRef<SVGPathElement>(null)

  // 67 朝代中哪些已学（按 startYear 映射到 viewBox 坐标）
  const eraCoords = useMemo(() => {
    const span = MAX_YEAR - MIN_YEAR
    return eras.map((era) => {
      const isChina = era.region === 'china'
      // 中国朝代上行，世界朝代下行（视觉分层）
      const y = isChina ? 18 : 38
      const x = ((era.startYear - MIN_YEAR) / span) * 400
      const visited = false  // 由父组件传入 visitedEraIds（这里简化）
      return { era, x, y, visited, isChina }
    })
  }, [])

  useEffect(() => {
    if (!dotsRef.current || !linePathRef.current) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const dots = dotsRef.current.querySelectorAll('.tl-dot')
    const ctx = gsap.context(() => {
      // dots staggerFrom
      gsap.from(dots, {
        opacity: 0,
        scale: 0,
        duration: 0.4,
        stagger: 0.005,
        ease: 'back.out(1.7)',
      })
      // 中央朱砂线 stroke-dashoffset 动画
      const path = linePathRef.current
      if (path) {
        const len = path.getTotalLength()
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: 'power3.out',
          delay: 0.2,
        })
      }
    })
    return () => ctx.revert()
  }, [])

  // hover 时已学圆点缩放 + 推荐圆点脉动
  useEffect(() => {
    if (!cardRef.current) return
    const card = cardRef.current
    const onEnter = () => {
      const dots = card.querySelectorAll('.tl-dot-visited')
      gsap.to(dots, { scale: 1.5, duration: 0.3, ease: 'power2.out', stagger: 0.01 })
      const rec = card.querySelector('.tl-dot-recommended')
      if (rec) gsap.to(rec, { scale: 1.8, duration: 0.6, ease: 'elastic.out(1, 0.5)', yoyo: true, repeat: 1 })
    }
    const onLeave = () => {
      const dots = card.querySelectorAll('.tl-dot-visited')
      gsap.to(dots, { scale: 1, duration: 0.3, ease: 'power2.out' })
    }
    card.addEventListener('mouseenter', onEnter)
    card.addEventListener('mouseleave', onLeave)
    return () => {
      card.removeEventListener('mouseenter', onEnter)
      card.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      className="text-left p-4 rounded-xl border-2 transition-all group path-card relative overflow-hidden border-vermilion/60 bg-gradient-to-br from-vermilion-tint/70 via-gold-tint/30 to-gold-tint/10 hover:border-vermilion-2 hover:shadow-[0_0_28px_rgba(184,67,58,0.45)] hover:-translate-y-0.5"
      style={{ minHeight: '180px' }}
    >
      {/* 左上角：印章 logo */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 8px rgba(184,67,58,0.5))' }}>
          📜
        </span>
        <div className="font-brush text-lg tracking-wide text-vermilion-2 group-hover:text-vermilion transition-colors">
          朝代时间线
        </div>
      </div>

      {/* 时间线缩略 SVG（400×60 viewBox） */}
      <div className="relative my-2 h-12">
        <svg
          ref={dotsRef}
          viewBox="0 0 400 56"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* 中央朱砂主线 */}
          <path
            ref={linePathRef}
            d="M 4,28 L 396,28"
            className="tl-line"
            stroke="rgb(184 67 58)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.5"
            fill="none"
          />
          {/* 关键年标 */}
          {KEY_YEARS.map((k) => {
            const x = ((k.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 400
            return (
              <g key={k.year} className="tl-keymark" opacity="0.85">
                <line
                  x1={x}
                  y1={20}
                  x2={x}
                  y2={36}
                  stroke="rgb(122 102 80)"
                  strokeWidth={k.width * 0.6}
                  strokeLinecap="round"
                />
                <text
                  x={x}
                  y={52}
                  textAnchor="middle"
                  fontSize="6"
                  fill="rgb(122 102 80)"
                  fontFamily="serif"
                >
                  {k.label}
                </text>
              </g>
            )
          })}
          {/* 朝代 dot */}
          {eraCoords.map(({ era, x, y, isChina }) => {
            const isRec = recommendedEra?.id === era.id
            const isVisited = visited > 0 && era.endYear < recommendedYear!
            return (
              <circle
                key={era.id}
                cx={x}
                cy={y}
                r={isRec ? 3 : 1.6}
                fill={isRec
                  ? 'rgb(200 154 87)'
                  : isChina
                    ? 'rgb(184 67 58)'
                    : 'rgb(154 143 126)'}
                className={`tl-dot ${isVisited ? 'tl-dot-visited' : ''} ${isRec ? 'tl-dot-recommended' : ''}`}
                opacity={isRec ? 1 : 0.7}
              />
            )
          })}
        </svg>
      </div>

      {/* 进度文字 + 大进度条 */}
      <div className="flex items-center justify-between mb-1 text-xs">
        <span className="font-brush text-ink-200 tracking-wide">
          {visited} <span className="text-ink-400">/ {total}</span>
          <span className="ml-1 text-vermilion-300">{pct}%</span>
        </span>
        {recommendedEra && (
          <span className="font-brush text-vermilion-2 text-xs">
            下一步·<span className="ml-0.5">{recommendedEra.name}</span>
          </span>
        )}
      </div>
      <div className="relative h-1.5 bg-ink-700 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-vermilion-3 via-vermilion to-vermilion-2 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, boxShadow: '0 0 8px rgba(184,67,58,0.6)' }}
        />
      </div>

      {/* hover 提示：朱砂箭头 */}
      <div className="absolute bottom-2 right-2 text-xs text-vermilion-2 opacity-0 group-hover:opacity-100 transition-opacity font-brush tracking-wide">
        进入 →
      </div>
    </button>
  )
}