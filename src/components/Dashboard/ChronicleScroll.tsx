/**
 * ChronicleScroll — 朝代选择模态（古卷长轴版）
 *
 * 设计目标：替代原 "67 张 Bing 图片网格"，打造"古卷长轴"风格的
 *           竖向时间线 + 强烈入场/出场动效。
 *
 * 布局：
 *   ┌──────────────────────────────────────────┐
 *   │  📜 朝代时间线    67 朝代 · 已学 6   [×]  │  ← sticky header
 *   ├──────────────────────────────────────────┤
 *   │ ╔═══卷轴上轴头═══╗                        │
 *   │ ║  ━━BC  ┃  ━━AD ┃ ← 时代分隔             │
 *   │ ║  ┌────────┐                          ║  │
 *   │ ║ ●│ 秦朝  │                          ║  │  ← 朝代卡 + 左侧时间轴点
 *   │ ║  │ -221  │  ⚔ 焚书坑儒              ║  │
 *   │ ║  └────────┘                          ║  │
 *   │ ║  ⋮                                  ║  │
 *   │ ║  ┌────────┐  ⭐ 推荐               ║  │
 *   │ ║ ●│ 唐朝  │  推荐光晕 + 脉冲         ║  │
 *   │ ║  └────────┘                          ║  │
 *   │ ║  ⋮                                  ║  │
 *   │ ╚═══卷轴下轴头═══╝                        │
 *   └──────────────────────────────────────────┘
 *
 * 动效（GSAP timeline）：
 *   入场:
 *     1. 背景渐入(0.3s)
 *     2. 上轴头 y:-100% 滑入(0.5s power3.out)
 *     3. 下轴头 y:+100% 滑入(0.5s power3.out)
 *     4. 朱砂主线 stroke-dashoffset 0→1(1.0s power3.inOut)
 *     5. 朝代卡 staggerFrom(y:40, alpha:0, 0.04s stagger)
 *     6. 推荐朝代额外呼吸光晕循环
 *   出场:
 *     1. 朝代卡 staggerTo(y:-20, alpha:0, 0.02s stagger)
 *     2. 主线 stroke-dashoffset 1→0(0.5s)
 *     3. 上/下轴头滑出(0.3s)
 *     4. 背景渐出(0.2s)
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import erasData from '@/data/eras.json'
import type { Era } from '@/types'

const eras = erasData as Era[]

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
  const overlayRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const topCapRef = useRef<SVGSVGElement>(null)
  const bottomCapRef = useRef<SVGSVGElement>(null)
  const spineRef = useRef<SVGPathElement>(null)
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const recommendedCardRef = useRef<HTMLButtonElement | null>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const exitTimelineRef = useRef<gsap.core.Timeline | null>(null)

  // 数据：按 startYear 升序
  const sortedEras = [...eras].sort((a, b) => a.startYear - b.startYear)

  // 打开/关闭时建立时间线
  useEffect(() => {
    if (!open) {
      // 卸载：清除 GSAP 上下文
      timelineRef.current?.kill()
      exitTimelineRef.current?.kill()
      timelineRef.current = null
      exitTimelineRef.current = null
      cardRefs.current.clear()
      setMounted(false)
      return
    }

    setMounted(true)

    // 等下一帧 DOM 才能拿到 ref
    requestAnimationFrame(() => {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      if (reduce) {
        // 减少动画偏好：直接显示，无动画
        return
      }

      // 1. 入场 master timeline
      const tl = gsap.timeline()
      timelineRef.current = tl

      const overlay = overlayRef.current
      const scroll = scrollRef.current
      const spine = spineRef.current
      const topCap = topCapRef.current
      const bottomCap = bottomCapRef.current

      if (overlay) {
        gsap.set(overlay, { autoAlpha: 0 })
        tl.to(overlay, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 0)
      }

      if (topCap) {
        gsap.set(topCap, { y: -120, opacity: 0, rotate: -8 })
        tl.to(topCap, { y: 0, opacity: 1, rotate: 0, duration: 0.6, ease: 'power3.out' }, 0.1)
      }

      if (bottomCap) {
        gsap.set(bottomCap, { y: 120, opacity: 0, rotate: 8 })
        tl.to(bottomCap, { y: 0, opacity: 1, rotate: 0, duration: 0.6, ease: 'power3.out' }, 0.1)
      }

      if (spine) {
        const len = spine.getTotalLength()
        gsap.set(spine, { strokeDasharray: len, strokeDashoffset: len })
        tl.to(spine, { strokeDashoffset: 0, duration: 1.0, ease: 'power3.inOut' }, 0.3)
      }

      // 朝代卡入场
      const cards = Array.from(cardRefs.current.values())
      if (cards.length > 0) {
        gsap.set(cards, { y: 40, opacity: 0, scale: 0.96 })
        tl.to(
          cards,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.55,
            stagger: 0.04,
            ease: 'power2.out',
          },
          0.5
        )
      }

      // 推荐朝代入场后开始呼吸光晕（独立循环动画）
      if (recommendedCardRef.current) {
        const rec = recommendedCardRef.current
        tl.to(rec, {
          scale: 1.02,
          duration: 1.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        }, 1.2)

        // 推荐徽章脉冲
        const badge = rec.querySelector('.rec-badge')
        if (badge) {
          tl.to(badge, {
            scale: 1.08,
            duration: 0.9,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          }, 1.2)
        }
      }

      // ESC 关闭
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    })
  }, [open, onClose])

  if (!mounted) return null

  // 是否 BC 时代（公元 0 年前）
  const isBC = (y: number) => y < 0

  // 处理出场
  const handleClose = () => {
    if (exitTimelineRef.current) {
      // 已经在播出场动画
      return
    }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      onClose()
      return
    }

    const overlay = overlayRef.current
    const spine = spineRef.current
    const topCap = topCapRef.current
    const bottomCap = bottomCapRef.current
    const cards = Array.from(cardRefs.current.values())

    const tl = gsap.timeline({
      onComplete: () => onClose(),
    })
    exitTimelineRef.current = tl

    if (cards.length > 0) {
      tl.to(
        cards,
        { y: -20, opacity: 0, scale: 0.96, duration: 0.3, stagger: 0.015, ease: 'power2.in' },
        0
      )
    }

    if (spine) {
      tl.to(spine, { strokeDashoffset: spine.getTotalLength(), duration: 0.5, ease: 'power2.in' }, 0.2)
    }

    if (topCap) {
      tl.to(topCap, { y: -100, opacity: 0, rotate: -8, duration: 0.4, ease: 'power2.in' }, 0.4)
    }
    if (bottomCap) {
      tl.to(bottomCap, { y: 100, opacity: 0, rotate: 8, duration: 0.4, ease: 'power2.in' }, 0.4)
    }

    if (overlay) {
      tl.to(overlay, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0.5)
    }
  }

  // 关闭按钮 hover 效果
  const onCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleClose()
  }

  // 背景点击关闭（带入场动画则不直接关，播出场）
  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose()
  }

  // 朝代点击（带 GSAP 点击反馈）
  const handleEraClick = (eraId: string) => {
    const card = cardRefs.current.get(eraId)
    if (card) {
      gsap.timeline({
        onComplete: () => {
          onSelect(eraId)
          handleClose()
        },
      })
        .to(card, { scale: 1.05, duration: 0.15, ease: 'power2.out' })
        .to(card, { scale: 1, duration: 0.2, ease: 'power2.in' })
    } else {
      onSelect(eraId)
      handleClose()
    }
  }

  // 卡 hover 缩放（推荐朝代已经有独立呼吸，跳过）
  const onCardHover = (eraId: string, entering: boolean) => {
    if (eraId === recommendedEraId) return
    const card = cardRefs.current.get(eraId)
    if (!card) return
    gsap.to(card, {
      scale: entering ? 1.03 : 1,
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="朝代时间线"
    >
      <div
        ref={scrollRef}
        className="relative w-full max-w-3xl h-[90vh] flex flex-col rounded-2xl overflow-hidden border-2 border-vermilion-500/40 shadow-2xl"
        style={{
          background:
            'linear-gradient(180deg, rgb(var(--paper-card-rgb) / 0.96), rgb(var(--ink-800-rgb) / 0.94))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* sticky header */}
        <div className="sticky top-0 z-10 border-b border-vermilion-500/30 px-6 py-4 flex items-center justify-between"
          style={{
            background: 'rgb(var(--paper-card-rgb) / 0.92)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div>
            <h2 className="text-xl font-brush tracking-wide text-vermilion-2">
              📜 朝代时间线
            </h2>
            <div className="text-xs mt-1 font-serif">
              <span className="text-ink-300">{sortedEras.length} 个朝代</span>
              <span className="mx-2 text-ink-500">·</span>
              <span className="text-green-400">已学 {visitedEraIds.length}</span>
              {recommendedEraId && (() => {
                const era = sortedEras.find(e => e.id === recommendedEraId)
                return era ? (
                  <>
                    <span className="mx-2 text-ink-500">·</span>
                    <span className="text-vermilion-300">推荐 "{era.name}"</span>
                  </>
                ) : null
              })()}
            </div>
          </div>
          <button
            onClick={onCloseClick}
            className="w-10 h-10 rounded-full flex items-center justify-center text-2xl leading-none transition-all hover:rotate-90 hover:bg-vermilion-tint/40 hover:text-vermilion-2"
            style={{
              color: 'rgb(var(--text-secondary-rgb))',
              transitionDuration: '0.4s',
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            title="关闭 (Esc)"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {/* 主体：竖向时间线 + 朝代卡 */}
        <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin">
          {/* 上轴头 SVG 装饰 */}
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
              {/* 轴头圆柱 */}
              <rect x="20" y="6" width="240" height="20" rx="10"
                fill="url(#capGold)" stroke="rgb(var(--gold-deep-rgb))" strokeWidth="1.5" />
              <rect x="10" y="2" width="20" height="28" rx="4"
                fill="url(#capVer)" stroke="rgb(var(--vermilion-3-rgb))" strokeWidth="1.2" />
              <rect x="250" y="2" width="20" height="28" rx="4"
                fill="url(#capVer)" stroke="rgb(var(--vermilion-3-rgb))" strokeWidth="1.2" />
              {/* 中点装饰 */}
              <circle cx="140" cy="16" r="3" fill="rgb(var(--vermilion-rgb))" />
              {/* 流苏 */}
              <line x1="140" y1="32" x2="140" y2="42" stroke="rgb(var(--gold-rgb))" strokeWidth="1.5" />
              <circle cx="140" cy="44" r="3" fill="rgb(var(--vermilion-rgb))" />
            </svg>
          </div>

          {/* 时间线主体（SVG 全高 + 朝代卡） */}
          <div className="relative">
            {/* 左侧时间线 SVG（绝对定位） */}
            <svg
              className="absolute left-[22px] top-0 bottom-0 pointer-events-none"
              width="40"
              height="100%"
              preserveAspectRatio="none"
            >
              {/* 中央朱砂主线 */}
              <path
                ref={spineRef}
                d="M 20,0 L 20,100%"
                stroke="rgb(var(--vermilion-rgb))"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* 渐变光晕 */}
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
            <div className="space-y-3 ml-12">
              {sortedEras.map((era, idx) => {
                const visited = visitedEraIds.includes(era.id)
                const isRecommended = era.id === recommendedEraId
                const isFirst = idx === 0
                const isLast = idx === sortedEras.length - 1
                const keyPoints = era.keyPoints?.slice(0, 2) ?? []

                // 朝代点在主线上
                const dotSize = isRecommended ? 14 : 10

                return (
                  <div key={era.id} className="relative">
                    {/* 节点圆 */}
                    <div
                      className={`absolute -left-[34px] top-3 rounded-full border-2 ${
                        visited
                          ? 'bg-green-500 border-green-300 shadow-[0_0_12px_rgba(74,222,128,0.6)]'
                          : isRecommended
                            ? 'bg-vermilion border-vermilion-200 shadow-[0_0_16px_rgba(184,67,58,0.8)]'
                            : 'bg-paper-card border-vermilion-500'
                      }`}
                      style={{
                        width: dotSize,
                        height: dotSize,
                      }}
                    />

                    <button
                      ref={(el) => {
                        if (el) {
                          cardRefs.current.set(era.id, el)
                          if (isRecommended) recommendedCardRef.current = el
                        } else {
                          cardRefs.current.delete(era.id)
                          if (isRecommended) recommendedCardRef.current = null
                        }
                      }}
                      onClick={() => handleEraClick(era.id)}
                      onMouseEnter={() => onCardHover(era.id, true)}
                      onMouseLeave={() => onCardHover(era.id, false)}
                      className={`w-full text-left rounded-xl border-2 transition-colors p-4 group relative overflow-hidden ${
                        isRecommended
                          ? 'border-vermilion-500/70 bg-gradient-to-br from-vermilion-tint/30 to-gold-tint/20'
                          : visited
                            ? 'border-green-700/60 bg-paper-card/60 hover:border-green-500'
                            : 'border-vermilion-500/30 bg-paper-card/40 hover:border-vermilion-400 hover:bg-paper-card/80'
                      }`}
                    >
                      {/* 推荐印章 */}
                      {isRecommended && (
                        <div className="rec-badge absolute top-2 right-2 text-xs px-2 py-0.5 rounded-md font-brush tracking-wide"
                          style={{
                            background: 'rgb(var(--vermilion-rgb))',
                            color: 'rgb(var(--text-parchment-rgb))',
                            boxShadow: '0 0 10px rgba(184,67,58,0.6)',
                          }}
                        >
                          ⭐ 推荐
                        </div>
                      )}
                      {/* 已学印章 */}
                      {visited && !isRecommended && (
                        <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-md font-brush tracking-wide bg-green-700/80 text-green-100">
                          ✓ 已学
                        </div>
                      )}

                      <div className="flex items-baseline gap-3 mb-1.5">
                        <div
                          className="font-brush text-xl tracking-wide"
                          style={{ color: era.color || 'rgb(var(--vermilion-2-rgb))' }}
                        >
                          {era.name}
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

                      {/* 关键点前 2 条 */}
                      {keyPoints.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {keyPoints.map((kp, i) => (
                            <div
                              key={i}
                              className="text-xs text-ink-300 flex items-start gap-1.5 font-serif"
                            >
                              <span className="text-vermilion-2 mt-0.5">•</span>
                              <span className="line-clamp-1">{kp}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 底部进度条 */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 rounded-full overflow-hidden bg-ink-700/50">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${visited ? 100 : 0}%`,
                              background: isRecommended
                                ? 'linear-gradient(90deg, rgb(var(--vermilion-rgb)), rgb(var(--vermilion-2-rgb)))'
                                : 'rgb(var(--gold-rgb))',
                            }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-ink-400 font-serif">
                          {visited ? '100%' : '0%'}
                        </span>
                      </div>

                      {/* hover 提示：进入 */}
                      <div className="absolute bottom-2 right-3 text-xs font-brush tracking-wide text-vermilion-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        进入 →
                      </div>
                    </button>
                  </div>
                )
              })}
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
              <use href="#capVer" />
              {/* 复用上轴头 defs */}
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
                fill="url(#vermilion-rgb)" stroke="rgb(var(--vermilion-3-rgb))" strokeWidth="1.2" />
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