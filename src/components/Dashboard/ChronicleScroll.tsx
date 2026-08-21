/**
 * ChronicleScroll — 朝代选择模态 v2
 *
 * 设计目标：使用 animation-playground 网站的 17 种动效，
 *           打造「古卷长轴 + 现代动效」融合的视觉体验。
 *
 * 动效清单（按出现顺序）：
 *   入场：
 *     · Circle Reveal (0.0-0.4s) — 点击位置圆形展开遮罩
 *     · Wipe top→down (0.3-0.7s) — 主体 clip-path 扫描入场
 *     · Typewriter (0.5-1.1s) — 标题逐字出现
 *     · Counter (0.5-1.3s) — 67/6/9% 数字递增
 *     · SVG Morph (0.6-1.0s) — 卷轴上下轴头形变
 *     · 主线 Wipe (0.8-1.8s) — 朱砂线 stroke-dashoffset
 *     · 朝代卡 Physics Bounce stagger (1.0s+)
 *     · 推荐朝代呼吸浮动 + Variable Font 循环
 *   交互：
 *     · 朝代卡 hover: 3D Tilt + 朝代名 Split Text Wave
 *     · 推荐朝代: Magnetic + Floating + Variable Font
 *     · 点击朝代: Ripple + 卡向上 Wipe 飞出
 *     · 已学朝代: Success Checkmark 画线动画（首次入场时）
 *     · 背景: Gradient Mesh 流动 + Film Grain 颗粒
 *   出场：
 *     · 朝代卡 stagger 上滑
 *     · 主线收起
 *     · SVG Morph 反向
 *     · Wipe bottom→top
 *     · 圆形遮罩从外向内关闭
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import erasData from '@/data/eras.json'
import type { Era } from '@/types'

const eras = erasData as Era[]

// ============================================
// 常量
// ============================================
const TOTAL_ERAS = eras.length
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

// ============================================
// 子组件：单张朝代卡
// ============================================
interface EraCardProps {
  era: Era
  index: number
  isVisited: boolean
  isRecommended: boolean
  hasNext: boolean
  onSelect: (eraId: string) => void
  isFirstReveal: boolean  // 首次入场时画已学 ✓
}

function EraCard({ era, index, isVisited, isRecommended, hasNext, onSelect, isFirstReveal }: EraCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const rippleRef = useRef<HTMLSpanElement>(null)
  const checkmarkRef = useRef<SVGSVGElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [magnet, setMagnet] = useState({ x: 0, y: 0 })

  // 已学 ✓ 画线动画（入场完成后）
  useEffect(() => {
    if (!isVisited || !isFirstReveal || !checkmarkRef.current) return
    const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches
    if (reduce) return
    const path = checkmarkRef.current.querySelector('.check-path') as SVGPathElement
    if (!path) return
    const len = path.getTotalLength()
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: 1.5 + index * 0.04,  // 等 stagger 完
    })
  }, [isVisited, isFirstReveal, index])

  // 3D Tilt 跟随鼠标
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    // 最大 ±10°
    const maxTilt = 8
    const x = (dy / rect.height) * -maxTilt
    const y = (dx / rect.width) * maxTilt
    setTilt({ x, y })
  }, [])

  const onMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
    setMagnet({ x: 0, y: 0 })
  }, [])

  // 推荐朝代 Magnetic
  const onMouseMoveCard = useCallback((e: React.MouseEvent) => {
    onMouseMove(e)
    if (!isRecommended || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const radius = 80
    if (dist < radius) {
      const factor = (1 - dist / radius) * 6  // 最大 6px 磁吸
      setMagnet({ x: dx * factor / dist, y: dy * factor / dist })
    } else {
      setMagnet({ x: 0, y: 0 })
    }
  }, [isRecommended, onMouseMove])

  // 朝代名 hover 字母波浪
  const onNameHover = useCallback(() => {
    if (!nameRef.current) return
    const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches
    if (reduce) return
    const chars = nameRef.current.querySelectorAll('span')
    gsap.fromTo(
      chars,
      { y: 0 },
      {
        y: -6,
        duration: 0.3,
        stagger: 0.04,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      }
    )
  }, [])

  // 点击：Ripple + 向上 Wipe
  const handleClick = (e: React.MouseEvent) => {
    const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches
    if (!reduce && rippleRef.current && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      rippleRef.current.style.left = `${x}px`
      rippleRef.current.style.top = `${y}px`
      gsap.fromTo(
        rippleRef.current,
        { scale: 0, opacity: 0.6 },
        { scale: 4, opacity: 0, duration: 0.6, ease: 'power2.out' }
      )
    }
    onSelect(era.id)
  }

  // 朝代名按字拆
  const nameChars = useMemo(() => era.name.split(''), [era.name])
  const keyPoints = era.keyPoints?.slice(0, 3) ?? []

  return (
    <div
      className="relative"
      style={{
        transform: isRecommended ? `translate(${magnet.x}px, ${magnet.y}px)` : undefined,
        transition: 'transform 0.2s ease-out',
      }}
    >
      {/* 时间线节点圆 */}
      <div
        className={`absolute -left-[34px] top-3 rounded-full border-2 transition-shadow ${
          isVisited
            ? 'bg-green-500 border-green-300'
            : isRecommended
              ? 'bg-vermilion border-vermilion-200'
              : 'bg-paper-card border-vermilion-500'
        }`}
        style={{
          width: isRecommended ? 14 : 10,
          height: isRecommended ? 14 : 10,
          boxShadow: isRecommended
            ? '0 0 16px rgba(184,67,58,0.7)'
            : isVisited
              ? '0 0 12px rgba(74,222,128,0.5)'
              : 'none',
        }}
      />

      {/* Flip Card */}
      <div
        className="era-card-flip relative w-full"
        style={{
          perspective: '1000px',
        }}
      >
        <button
          ref={cardRef}
          onClick={handleClick}
          onMouseMove={onMouseMoveCard}
          onMouseLeave={onMouseLeave}
          className={`era-card-inner relative w-full text-left rounded-xl border-2 p-4 overflow-hidden era-card-backface-hidden ${
            isRecommended
              ? 'border-vermilion-500/70 bg-gradient-to-br from-vermilion-tint/40 to-gold-tint/30 era-card-recommended'
              : isVisited
                ? 'border-green-700/60 bg-paper-card/60'
                : 'border-vermilion-500/30 bg-paper-card/40 hover:bg-paper-card/80'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: 'transform 0.18s ease-out',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* 推荐印章 + Floating + Variable Font */}
          {isRecommended && (
            <>
              <div
                className="absolute -top-1 -right-1 px-2 py-0.5 rounded-md font-brush tracking-wide rec-badge z-10"
                style={{
                  background: 'rgb(var(--vermilion-rgb))',
                  color: 'rgb(var(--text-parchment-rgb))',
                  boxShadow: '0 0 14px rgba(184,67,58,0.7)',
                  fontVariationSettings: '"wght" 700',
                }}
              >
                ⭐ 推荐
              </div>
              {/* Variable Font 呼吸光晕 */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none rec-glow"
                style={{
                  background: 'radial-gradient(circle at center, rgba(184,67,58,0.15), transparent 70%)',
                }}
              />
            </>
          )}

          {/* 已学印章 — SVG Checkmark 画线 */}
          {isVisited && !isRecommended && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-700/80 text-green-100 z-10">
              <svg
                ref={checkmarkRef}
                width="14"
                height="14"
                viewBox="0 0 14 14"
                style={{ flexShrink: 0 }}
              >
                <path
                  className="check-path"
                  d="M 2,7 L 6,11 L 12,3"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs font-brush tracking-wide">已学</span>
            </div>
          )}

          {/* 朝代名 + Split Text */}
          <div className="flex items-baseline gap-3 mb-1.5">
            <div
              ref={nameRef}
              onMouseEnter={onNameHover}
              className="font-brush text-xl tracking-wide era-name"
              style={{
                color: era.color || 'rgb(var(--vermilion-2-rgb))',
              }}
            >
              {nameChars.map((c, i) => (
                <span key={i} style={{ display: 'inline-block' }}>{c}</span>
              ))}
            </div>
            <div className="text-xs font-serif tabular-nums text-ink-300">
              {era.startYear < 0 ? `BC ${-era.startYear}` : era.startYear}
              <span className="mx-1 text-ink-500">~</span>
              {era.endYear < 0 ? `BC ${-era.endYear}` : era.endYear}
            </div>
            {era.region !== 'china' && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-ink-700/40 text-ink-300">
                🌍 {era.region}
              </span>
            )}
          </div>

          {era.shortDesc && (
            <div className="text-sm text-ink-200 mb-2 font-serif leading-relaxed">
              {era.shortDesc}
            </div>
          )}

          {/* 关键点 */}
          {keyPoints.length > 0 && (
            <div className="space-y-1 mb-2">
              {keyPoints.map((kp, i) => (
                <div key={i} className="text-xs text-ink-300 flex items-start gap-1.5 font-serif">
                  <span className="text-vermilion-2 mt-0.5">•</span>
                  <span className="line-clamp-1">{kp}</span>
                </div>
              ))}
            </div>
          )}

          {/* 进度条 */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 rounded-full overflow-hidden bg-ink-700/50">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${isVisited ? 100 : 0}%`,
                  background: isRecommended
                    ? 'linear-gradient(90deg, rgb(var(--vermilion-rgb)), rgb(var(--gold-rgb)))'
                    : 'rgb(var(--gold-rgb))',
                }}
              />
            </div>
            <span className="text-xs tabular-nums text-ink-400 font-serif">
              {isVisited ? '100%' : '0%'}
            </span>
          </div>

          {/* Ripple 容器 */}
          <span
            ref={rippleRef}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 60,
              height: 60,
              background: 'radial-gradient(circle, rgba(184,67,58,0.5), transparent)',
              transform: 'translate(-50%, -50%)',
              opacity: 0,
            }}
          />

          {/* hover 提示 */}
          <div className="absolute bottom-2 right-3 text-xs font-brush tracking-wide text-vermilion-2 opacity-0 group-hover:opacity-100 transition-opacity">
            进入 →
          </div>
        </button>
      </div>
    </div>
  )
}

// ============================================
// 主组件
// ============================================
interface ChronicleScrollProps {
  open: boolean
  onClose: () => void
  visitedEraIds: string[]
  recommendedEraId: string | null
  onSelect: (eraId: string) => void
}

export default function ChronicleScroll({
  open,
  onClose,
  visitedEraIds,
  recommendedEraId,
  onSelect,
}: ChronicleScrollProps) {
  const [mounted, setMounted] = useState(false)
  const [firstReveal, setFirstReveal] = useState(true)
  const overlayRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const topCapRef = useRef<SVGSVGElement>(null)
  const bottomCapRef = useRef<SVGSVGElement>(null)
  const spineRef = useRef<SVGPathElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const counterRefs = useRef<Map<string, HTMLSpanElement>>(new Map())
  const eraListRef = useRef<HTMLDivElement>(null)
  const blobRefs = useRef<(HTMLDivElement | null)[]>([])
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const exitTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const counterTweenRef = useRef<gsap.core.Timeline | null>(null)

  // 数据：按 startYear 升序
  const sortedEras = useMemo(() => [...eras].sort((a, b) => a.startYear - b.startYear), [])

  const reduce = useRef(typeof window !== 'undefined' && window.matchMedia?.(REDUCED_MOTION_QUERY).matches)

  // 主时间线
  useEffect(() => {
    if (!open) {
      setMounted(false)
      setFirstReveal(true)
      masterTimelineRef.current?.kill()
      exitTimelineRef.current?.kill()
      counterTweenRef.current?.kill()
      return
    }

    setMounted(true)

    // 等下一帧拿到 DOM
    requestAnimationFrame(() => {
      if (reduce.current) {
        // 减少动画：直接显示，跳过所有入场动画
        return
      }

      // ========== Circle Reveal 遮罩 ==========
      const overlay = overlayRef.current
      const scroll = scrollRef.current
      const spine = spineRef.current
      const topCap = topCapRef.current
      const bottomCap = bottomCapRef.current
      const titleEl = titleRef.current
      const eraCards = eraListRef.current?.querySelectorAll('.era-card-inner') ?? []

      const tl = gsap.timeline()
      masterTimelineRef.current = tl

      // 1. Circle Reveal：从点击位置圆形展开
      if (overlay) {
        gsap.set(overlay, {
          clipPath: 'circle(0% at 50% 50%)',
        })
        tl.to(overlay, {
          clipPath: 'circle(150% at 50% 50%)',
          duration: 0.5,
          ease: 'power3.out',
        }, 0)
      }

      // 2. Wipe top→down：卷轴主体 clip-path 扫描
      if (scroll) {
        gsap.set(scroll, {
          clipPath: 'inset(0 0 100% 0)',
          opacity: 0.5,
        })
        tl.to(scroll, {
          clipPath: 'inset(0 0 0% 0)',
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
        }, 0.3)
      }

      // 3. SVG Morph：卷轴上下轴头（scale 形变）
      if (topCap) {
        gsap.set(topCap, { scaleY: 0, transformOrigin: 'center bottom', opacity: 0 })
        tl.to(topCap, {
          scaleY: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(1.4)',
        }, 0.6)
      }
      if (bottomCap) {
        gsap.set(bottomCap, { scaleY: 0, transformOrigin: 'center top', opacity: 0 })
        tl.to(bottomCap, {
          scaleY: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(1.4)',
        }, 0.6)
      }

      // 4. 主线 Wipe：朱砂线 stroke-dashoffset
      if (spine) {
        const len = spine.getTotalLength()
        gsap.set(spine, { strokeDasharray: len, strokeDashoffset: len })
        tl.to(spine, {
          strokeDashoffset: 0,
          duration: 1.0,
          ease: 'power3.inOut',
        }, 0.8)
      }

      // 5. Typewriter 标题逐字
      if (titleEl) {
        const text = titleEl.textContent || ''
        titleEl.textContent = ''
        const chars = text.split('')
        chars.forEach((c) => {
          const span = document.createElement('span')
          span.textContent = c
          span.style.opacity = '0'
          titleEl.appendChild(span)
        })
        tl.to(titleEl.querySelectorAll('span'), {
          opacity: 1,
          duration: 0.04,
          stagger: 0.05,
          ease: 'none',
        }, 0.5)
      }

      // 6. Counter 数字递增
      counterTweenRef.current = gsap.timeline()
      const visitedCount = visitedEraIds.length
      const pct = TOTAL_ERAS > 0 ? Math.round((visitedCount / TOTAL_ERAS) * 100) : 0
      const totalCounter = counterRefs.current.get('total')
      const visitedCounter = counterRefs.current.get('visited')
      const pctCounter = counterRefs.current.get('pct')
      const counterProxy = { v: 0 }
      counterTweenRef.current.to(counterProxy, {
        v: TOTAL_ERAS,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.6,
        onUpdate: () => {
          if (totalCounter) totalCounter.textContent = Math.round(counterProxy.v).toString()
        },
      }, 0)
      const visitedProxy = { v: 0 }
      counterTweenRef.current.to(visitedProxy, {
        v: visitedCount,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.7,
        onUpdate: () => {
          if (visitedCounter) visitedCounter.textContent = Math.round(visitedProxy.v).toString()
        },
      }, 0)
      const pctProxy = { v: 0 }
      counterTweenRef.current.to(pctProxy, {
        v: pct,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.8,
        onUpdate: () => {
          if (pctCounter) pctCounter.textContent = Math.round(pctProxy.v).toString()
        },
      }, 0)

      // 7. 朝代卡 Physics Bounce stagger
      if (eraCards.length > 0) {
        gsap.set(eraCards, { y: 40, opacity: 0, scale: 0.96, rotateX: -10 })
        tl.to(
          eraCards,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            duration: 0.7,
            stagger: 0.04,
            ease: 'elastic.out(1, 0.6)',  // Physics Bounce
          },
          1.0
        )
      }

      // 8. 推荐朝代 Floating + Variable Font 循环
      const recCards = eraListRef.current?.querySelectorAll('.era-card-recommended') ?? []
      recCards.forEach((card) => {
        gsap.to(card, {
          y: -4,
          duration: 1.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1.8,
        })
        // Variable Font 字重呼吸
        const badge = card.querySelector('.rec-badge')
        if (badge) {
          gsap.to(badge, {
            duration: 1.2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: 1.8,
            onUpdate: function () {
              const t = this.progress()
              const w = 500 + (900 - 500) * (0.5 + 0.5 * Math.sin(t * Math.PI * 2))
              ;(badge as HTMLElement).style.fontVariationSettings = `"wght" ${Math.round(w)}`
            },
          })
        }
      })

      // 9. 背景 Gradient Mesh 流动
      blobRefs.current.forEach((blob, i) => {
        if (!blob) return
        gsap.to(blob, {
          x: 'random(-100, 100)',
          y: 'random(-80, 80)',
          duration: 'random(8, 14)',
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.5,
        })
      })

      // ESC 关闭
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose()
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    })
  }, [open, visitedEraIds])

  // ===== 出场时间线（必须在 early return 之前，遵守 hooks 规则） =====
  const handleClose = useCallback(() => {
    if (exitTimelineRef.current) return  // 已在播
    if (reduce.current) {
      onClose()
      return
    }
    const overlay = overlayRef.current
    const scroll = scrollRef.current
    const spine = spineRef.current
    const topCap = topCapRef.current
    const bottomCap = bottomCapRef.current
    const eraCards = eraListRef.current?.querySelectorAll('.era-card-inner') ?? []

    const tl = gsap.timeline({
      onComplete: () => {
        setFirstReveal(false)  // 重新打开后不做已学画线动画
        onClose()
      },
    })
    exitTimelineRef.current = tl

    // 朝代卡向上 Wipe 飞出
    if (eraCards.length > 0) {
      tl.to(
        eraCards,
        {
          y: -30,
          opacity: 0,
          scale: 0.95,
          duration: 0.35,
          stagger: 0.015,
          ease: 'power2.in',
        },
        0
      )
    }

    // 主线收起
    if (spine) {
      tl.to(spine, {
        strokeDashoffset: spine.getTotalLength(),
        duration: 0.5,
        ease: 'power2.in',
      }, 0.15)
    }

    // SVG Morph 反向（scaleY）
    if (topCap) {
      tl.to(topCap, { scaleY: 0, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.3)
    }
    if (bottomCap) {
      tl.to(bottomCap, { scaleY: 0, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.3)
    }

    // Wipe bottom→top
    if (scroll) {
      tl.to(scroll, {
        clipPath: 'inset(100% 0 0 0)',
        duration: 0.5,
        ease: 'power2.in',
      }, 0.3)
    }

    // Circle Reveal 反向：从外向内关闭
    if (overlay) {
      tl.to(overlay, {
        clipPath: 'circle(0% at 50% 50%)',
        duration: 0.4,
        ease: 'power3.in',
      }, 0.5)
    }
  }, [onClose])

  if (!mounted) return null

  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose()
  }

  const onCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleClose()
  }

  const handleSelect = (eraId: string) => {
    onSelect(eraId)
    handleClose()
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 chronicle-overlay"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="朝代时间线"
    >
      {/* Gradient Mesh 背景（3 个 blob） */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          ref={(el) => { blobRefs.current[0] = el; }}
          className="absolute w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgb(var(--vermilion-rgb)) 0%, transparent 70%)',
            filter: 'blur(80px)',
            top: '10%',
            left: '20%',
          }}
        />
        <div
          ref={(el) => { blobRefs.current[1] = el; }}
          className="absolute w-[500px] h-[500px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgb(var(--gold-rgb)) 0%, transparent 70%)',
            filter: 'blur(80px)',
            top: '40%',
            right: '15%',
          }}
        />
        <div
          ref={(el) => { blobRefs.current[2] = el; }}
          className="absolute w-[700px] h-[700px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgb(var(--vermilion-2-rgb)) 0%, transparent 70%)',
            filter: 'blur(80px)',
            bottom: '5%',
            left: '40%',
          }}
        />
        {/* Film Grain 颗粒 */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /></filter><rect width='100%' height='100%' filter='url(%23n)' /></svg>")`,
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      <div
        ref={scrollRef}
        className="relative w-full max-w-3xl h-[90vh] flex flex-col rounded-2xl overflow-hidden border-2 border-vermilion-500/40 shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, rgb(var(--paper-card-rgb) / 0.94), rgb(var(--ink-800-rgb) / 0.92))',
          backdropFilter: 'blur(2px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* sticky header */}
        <div
          className="sticky top-0 z-10 border-b border-vermilion-500/30 px-6 py-4 flex items-center justify-between"
          style={{
            background: 'rgb(var(--paper-card-rgb) / 0.85)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div>
            <h2
              ref={titleRef}
              className="text-xl font-brush tracking-wide text-vermilion-2"
              style={{ display: 'inline-block' }}
            >
              📜 朝代时间线
            </h2>
            <div className="text-xs mt-1 font-serif flex items-center gap-2">
              <span className="text-ink-300">
                共 <span ref={(el) => { if (el) counterRefs.current.set('total', el); }} className="tabular-nums font-brush text-vermilion-2 text-base">0</span> 个朝代
              </span>
              <span className="text-ink-500">·</span>
              <span className="text-green-400">
                已学 <span ref={(el) => { if (el) counterRefs.current.set('visited', el); }} className="tabular-nums font-brush text-base">0</span>
              </span>
              <span className="text-ink-500">·</span>
              <span className="text-gold-300">
                进度 <span ref={(el) => { if (el) counterRefs.current.set('pct', el); }} className="tabular-nums font-brush text-base">0</span>%
              </span>
            </div>
          </div>
          <button
            onClick={onCloseClick}
            className="w-10 h-10 rounded-full flex items-center justify-center text-2xl leading-none close-btn"
            style={{
              color: 'rgb(var(--text-secondary-rgb))',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            title="关闭 (Esc)"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {/* 主体 */}
        <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin relative">
          {/* 上轴头 SVG Morph */}
          <div className="flex justify-center mb-4">
            <svg
              ref={topCapRef}
              width="280"
              height="32"
              viewBox="0 0 280 32"
              className="overflow-visible"
            >
              <defs>
                <linearGradient id="capGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--gold-rgb))" />
                  <stop offset="100%" stopColor="rgb(var(--gold-deep-rgb))" />
                </linearGradient>
                <linearGradient id="capVer" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--vermilion-rgb))" />
                  <stop offset="100%" stopColor="rgb(var(--vermilion-3-rgb))" />
                </linearGradient>
              </defs>
              <rect x="20" y="6" width="240" height="20" rx="10"
                fill="url(#capGold)" stroke="rgb(var(--gold-deep-rgb))" strokeWidth="1.5" />
              <rect x="10" y="2" width="20" height="28" rx="4"
                fill="url(#capVer)" stroke="rgb(var(--vermilion-3-rgb))" strokeWidth="1.2" />
              <rect x="250" y="2" width="20" height="28" rx="4"
                fill="url(#capVer)" stroke="rgb(var(--vermilion-3-rgb))" strokeWidth="1.2" />
              <circle cx="140" cy="16" r="3" fill="rgb(var(--vermilion-rgb))" />
              <line x1="140" y1="32" x2="140" y2="42" stroke="rgb(var(--gold-rgb))" strokeWidth="1.5" />
              <circle cx="140" cy="44" r="3" fill="rgb(var(--vermilion-rgb))" />
            </svg>
          </div>

          {/* 时间线主体 */}
          <div className="relative">
            {/* 左侧主线 SVG */}
            <svg
              className="absolute left-[22px] top-0 bottom-0 pointer-events-none"
              width="40"
              height="100%"
              preserveAspectRatio="none"
            >
              <path
                ref={spineRef}
                d="M 20,0 L 20,100%"
                stroke="rgb(var(--vermilion-rgb))"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 20,0 L 20,100%"
                stroke="rgb(var(--vermilion-rgb))"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                opacity="0.18"
              />
            </svg>

            {/* 朝代卡列表 */}
            <div ref={eraListRef} className="space-y-3 ml-12">
              {sortedEras.map((era, idx) => (
                <EraCard
                  key={era.id}
                  era={era}
                  index={idx}
                  isVisited={visitedEraIds.includes(era.id)}
                  isRecommended={era.id === recommendedEraId}
                  hasNext={idx < sortedEras.length - 1}
                  onSelect={handleSelect}
                  isFirstReveal={firstReveal}
                />
              ))}
            </div>
          </div>

          {/* 下轴头 */}
          <div className="flex justify-center mt-4">
            <svg
              ref={bottomCapRef}
              width="280"
              height="32"
              viewBox="0 0 280 32"
              className="overflow-visible"
            >
              <defs>
                <linearGradient id="capGold2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--gold-rgb))" />
                  <stop offset="100%" stopColor="rgb(var(--gold-deep-rgb))" />
                </linearGradient>
                <linearGradient id="capVer2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--vermilion-rgb))" />
                  <stop offset="100%" stopColor="rgb(var(--vermilion-3-rgb))" />
                </linearGradient>
              </defs>
              <rect x="20" y="6" width="240" height="20" rx="10"
                fill="url(#capGold2)" stroke="rgb(var(--gold-deep-rgb))" strokeWidth="1.5" />
              <rect x="10" y="2" width="20" height="28" rx="4"
                fill="url(#capVer2)" stroke="rgb(var(--vermilion-3-rgb))" strokeWidth="1.2" />
              <rect x="250" y="2" width="20" height="28" rx="4"
                fill="url(#capVer2)" stroke="rgb(var(--vermilion-3-rgb))" strokeWidth="1.2" />
              <circle cx="140" cy="16" r="3" fill="rgb(var(--vermilion-rgb))" />
              <line x1="140" y1="0" x2="140" y2="-10" stroke="rgb(var(--gold-rgb))" strokeWidth="1.5" />
              <circle cx="140" cy="-12" r="3" fill="rgb(var(--vermilion-rgb))" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}