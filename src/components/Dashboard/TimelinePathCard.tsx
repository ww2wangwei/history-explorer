/**
 * TimelinePathCard — 朝代时间线主路径卡（v2：朱砂印章 + 时间线缩略）
 *
 * 动效（来自 animation-playground）：
 *   - Magnetic hover：光标靠近时磁吸偏移
 *   - 3D Tilt：hover 时跟随鼠标 3D 倾斜
 *   - Stroke/Outline：朝代名 outline → 填充
 *   - 主线 Wipe：朱砂时间线 stroke-dashoffset 入场
 *   - 朝代 dot staggerFrom：弹性入场
 *   - 推荐朝代脉冲 + Variable Font 字重变化
 */
import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import erasData from '@/data/eras.json'
import type { Era } from '@/types'

const eras = erasData as Era[]
const MIN_YEAR = -2200
const MAX_YEAR = 2100
const KEY_YEARS = [
  { year: -221, label: '秦', width: 1 },
  { year: 0,    label: '公元', width: 2 },
  { year: 1279, label: '宋末', width: 1 },
  { year: 1912, label: '民国', width: 1 },
]
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

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
  const cardRef = useRef<HTMLButtonElement>(null)
  const dotsSvgRef = useRef<SVGSVGElement>(null)
  const linePathRef = useRef<SVGPathElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)
  const sealRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useStateSafe<{ x: number; y: number }>({ x: 0, y: 0 })
  const [magnet, setMagnet] = useStateSafe<{ x: number; y: number }>({ x: 0, y: 0 })

  const eraCoords = useMemo(() => {
    const span = MAX_YEAR - MIN_YEAR
    return eras.map((era) => {
      const isChina = era.region === 'china'
      const y = isChina ? 18 : 38
      const x = ((era.startYear - MIN_YEAR) / span) * 400
      return { era, x, y, isChina }
    })
  }, [])

  // 入场时间线
  useEffect(() => {
    if (!dotsSvgRef.current || !linePathRef.current) return
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return

    const dots = dotsSvgRef.current.querySelectorAll('.tl-dot')
    const ctx = gsap.context(() => {
      // 主线 Wipe
      const len = linePathRef.current!.getTotalLength()
      gsap.set(linePathRef.current!, { strokeDasharray: len, strokeDashoffset: len })
      gsap.to(linePathRef.current!, { strokeDashoffset: 0, duration: 1.2, ease: 'power3.out' })

      // 关键年标 staggerFrom
      gsap.from('.tl-keymark', {
        opacity: 0,
        y: -4,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
        delay: 0.5,
      })

      // 朝代 dot 弹性入场
      gsap.from(dots, {
        opacity: 0,
        scale: 0,
        duration: 0.5,
        stagger: 0.006,
        ease: 'back.out(1.7)',
        delay: 0.7,
      })

      // 印章下落
      if (sealRef.current) {
        gsap.from(sealRef.current, {
          scale: 0,
          rotate: -45,
          opacity: 0,
          duration: 0.6,
          ease: 'back.out(1.7)',
          delay: 0.2,
        })
      }

      // 推荐朝代 Variable Font + 浮动循环
      const recDot = dotsSvgRef.current?.querySelector('.tl-dot-recommended')
      if (recDot) {
        gsap.to(recDot, {
          scale: 1.4,
          duration: 1.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1.5,
        })
      }
      if (nameRef.current) {
        gsap.to(nameRef.current, {
          duration: 1.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1.6,
          onUpdate: function () {
            const t = this.progress()
            const w = 500 + (900 - 500) * (0.5 + 0.5 * Math.sin(t * Math.PI * 2))
            if (nameRef.current) nameRef.current.style.fontVariationSettings = `"wght" ${Math.round(w)}`
          },
        })
      }
    })
    return () => ctx.revert()
  }, [])

  // 3D Tilt + Magnetic hover
  const onMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const maxTilt = 5
    setTilt({ x: (dy / rect.height) * -maxTilt, y: (dx / rect.width) * maxTilt })
    // Magnetic
    const dist = Math.sqrt(dx * dx + dy * dy)
    const radius = 100
    if (dist < radius) {
      const factor = (1 - dist / radius) * 3
      setMagnet({ x: (dx / dist) * factor, y: (dy / dist) * factor })
    } else {
      setMagnet({ x: 0, y: 0 })
    }
  }
  const onMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setMagnet({ x: 0, y: 0 })
  }

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="text-left p-4 rounded-xl border-2 transition-all group path-card relative overflow-hidden border-vermilion-500/70 bg-gradient-to-br from-vermilion-tint/60 via-ink-800/70 to-ink-800/70 hover:border-vermilion-2 hover:shadow-[0_0_32px_rgba(184,67,58,0.5)]"
      style={{
        minHeight: '180px',
        transformStyle: 'preserve-3d',
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translate(${magnet.x}px, ${magnet.y}px)`,
        transition: 'transform 0.18s ease-out, border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* 朱砂印章 logo */}
      <div ref={sealRef} className="absolute top-3 right-3 seal" style={{ filter: 'drop-shadow(0 2px 6px rgba(184,67,58,0.6))' }}>
        <svg width="36" height="36" viewBox="0 0 36 36" className="overflow-visible">
          <defs>
            <mask id="sealMask">
              <rect width="36" height="36" fill="black" />
              <rect width="36" height="36" fill="white" rx="4" />
              <path d="M 0,0 L 36,0 L 36,36 L 0,36 Z M 6,6 L 30,6 L 30,30 L 6,30 Z" fill="black" fillRule="evenodd" />
              <rect x="2" y="8" width="2" height="6" fill="black" />
              <rect x="32" y="20" width="2" height="6" fill="black" />
            </mask>
          </defs>
          <rect width="36" height="36" rx="3" fill="rgb(var(--vermilion-rgb))" mask="url(#sealMask)" />
          <text x="18" y="24" textAnchor="middle" fontSize="20" fontFamily="Ma Shan Zheng, serif" fill="rgb(var(--paper-rgb))">时</text>
        </svg>
      </div>

      {/* 标题 */}
      <div className="flex items-center gap-2 mb-2">
        <div
          ref={nameRef}
          className="font-brush text-xl tracking-wide text-vermilion-2 group-hover:text-vermilion transition-colors"
          style={{ fontVariationSettings: '"wght" 700' }}
        >
          朝代时间线
        </div>
      </div>

      {/* 时间线缩略 SVG（400×60 viewBox） */}
      <div className="relative my-2 h-14">
        <svg
          ref={dotsSvgRef}
          viewBox="0 0 400 56"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* 中央朱砂主线 */}
          <path
            ref={linePathRef}
            d="M 4,28 L 396,28"
            stroke="rgb(var(--vermilion-rgb))"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.6"
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
                  stroke="rgb(var(--gold-rgb))"
                  strokeWidth={k.width * 0.6}
                  strokeLinecap="round"
                />
                <text
                  x={x}
                  y={52}
                  textAnchor="middle"
                  fontSize="6"
                  fill="rgb(var(--gold-rgb))"
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
            return (
              <circle
                key={era.id}
                cx={x}
                cy={y}
                r={isRec ? 3 : 1.6}
                fill={isRec
                  ? 'rgb(var(--gold-rgb))'
                  : isChina
                    ? 'rgb(var(--vermilion-rgb))'
                    : 'rgb(var(--text-faint-rgb))'}
                className={`tl-dot ${isRec ? 'tl-dot-recommended' : ''}`}
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
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-vermilion-3 via-vermilion to-gold rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, boxShadow: '0 0 10px rgba(184,67,58,0.7)' }}
        />
      </div>

      {/* hover 提示 */}
      <div className="absolute bottom-2 right-3 text-xs text-vermilion-2 opacity-0 group-hover:opacity-100 transition-opacity font-brush tracking-wide">
        进入 →
      </div>
    </button>
  )
}

// 小工具：useState 但不引入 React.useState 名字冲突
import { useState as useStateSafe } from 'react'