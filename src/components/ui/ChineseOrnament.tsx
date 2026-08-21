/**
 * ChineseOrnament — 中国传统装饰元素（SVG-only，零依赖）
 *
 * 提供可在 React 中直接复用的中国风视觉元素：
 *   - ScrollEdge  ：卷轴两端装裱（圆形+弧线）
 *   - CloudDivider：流云纹分割线
 *   - GreekKeyDivider：回纹分割线（雷纹/万字不到头）
 *   - Seal        ：朱红印章（方框+文字）
 *
 * 所有元素都用 currentColor / CSS 变量驱动，可主题感知。
 */
import { useId } from 'react'

/* ========== 卷轴两端 (rolled scroll caps) ========== */
export function ScrollEdge({ side = 'left', className = '' }: { side?: 'left' | 'right'; className?: string }) {
  const id = useId()
  return (
    <svg
      viewBox="0 0 36 200"
      preserveAspectRatio="none"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-scroll`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--gold-deep-rgb) / 1)" />
          <stop offset="50%" stopColor="rgb(var(--gold-rgb) / 1)" />
          <stop offset="100%" stopColor="rgb(var(--gold-deep-rgb) / 1)" />
        </linearGradient>
        <radialGradient id={`${id}-cap`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgb(var(--gold-rgb) / 1)" />
          <stop offset="70%" stopColor="rgb(var(--gold-deep-rgb) / 1)" />
          <stop offset="100%" stopColor="rgb(var(--border-strong-rgb) / 1)" />
        </radialGradient>
      </defs>
      {/* 上下端头圆盖 */}
      <ellipse cx="18" cy="18" rx="16" ry="10" fill={`url(#${id}-cap)`} stroke="rgb(var(--border-strong-rgb) / 0.6)" strokeWidth="1" />
      <ellipse cx="18" cy="182" rx="16" ry="10" fill={`url(#${id}-cap)`} stroke="rgb(var(--border-strong-rgb) / 0.6)" strokeWidth="1" />
      {/* 中间装裱杆（卷轴） */}
      <rect x="14" y="20" width="8" height="160" fill={`url(#${id}-scroll)`} stroke="rgb(var(--border-strong-rgb) / 0.6)" strokeWidth="0.5" />
      {/* 杆上 3 道圈 */}
      <line x1="14" x2="22" y1="50" y2="50" stroke="rgb(var(--border-strong-rgb) / 0.4)" strokeWidth="0.5" />
      <line x1="14" x2="22" y1="100" y2="100" stroke="rgb(var(--border-strong-rgb) / 0.4)" strokeWidth="0.5" />
      <line x1="14" x2="22" y1="150" y2="150" stroke="rgb(var(--border-strong-rgb) / 0.4)" strokeWidth="0.5" />
    </svg>
  )
}

/* ========== 流云分割线 (cloud pattern) — 用纯 CSS 避免 SVG 拉伸变形 ========== */
export function CloudDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-hidden>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgb(var(--gold-rgb) / 0.5) 50%, rgb(var(--gold-rgb) / 0.5) 100%)' }} />
      {/* 中央如意结 (diamond + circles) */}
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
        <path d="M 12 3 L 21 12 L 12 21 L 3 12 Z" fill="none" stroke="rgb(var(--gold-rgb) / 0.85)" strokeWidth="1" />
        <path d="M 12 7 L 17 12 L 12 17 L 7 12 Z" fill="rgb(var(--gold-rgb) / 0.6)" />
        <circle cx="12" cy="12" r="2" fill="rgb(var(--bg-card-rgb) / 1)" />
      </svg>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgb(var(--gold-rgb) / 0.5) 0%, rgb(var(--gold-rgb) / 0.5) 50%, transparent 100%)' }} />
    </div>
  )
}

/* ========== 回纹分割线 (meander / Greek key) — 用重复 ◈ 字符避免 SVG 变形 ========== */
export function GreekKeyDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-hidden>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgb(var(--gold-rgb) / 0.4) 100%)' }} />
      {/* 中央装饰：方框 + 内嵌文字 */}
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
        <rect x="2" y="2" width="20" height="20" fill="none" stroke="rgb(var(--gold-rgb) / 0.85)" strokeWidth="1" />
        <rect x="6" y="6" width="12" height="12" fill="rgb(var(--gold-rgb) / 0.6)" />
        <path d="M 9 12 L 11 9 L 13 12 L 11 15 Z" fill="rgb(var(--bg-card-rgb) / 1)" />
      </svg>
      <span
        className="text-xs tracking-[0.4em] font-serif select-none"
        style={{ color: 'rgb(var(--gold-rgb) / 0.6)' }}
      >
        卐
      </span>
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
        <rect x="2" y="2" width="20" height="20" fill="none" stroke="rgb(var(--gold-rgb) / 0.85)" strokeWidth="1" />
        <rect x="6" y="6" width="12" height="12" fill="rgb(var(--gold-rgb) / 0.6)" />
        <path d="M 9 12 L 11 9 L 13 12 L 11 15 Z" fill="rgb(var(--bg-card-rgb) / 1)" />
      </svg>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgb(var(--gold-rgb) / 0.4) 0%, transparent 100%)' }} />
    </div>
  )
}

/* ========== 朱红印章 ========== */
export function Seal({
  text,
  className = '',
  size = 48,
  rotated = false,
}: { text: string; className?: string; size?: number; rotated?: boolean }) {
  return (
    <div
      className={`inline-flex items-center justify-center font-brush select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: 'rgb(var(--vermilion-rgb) / 0.92)',
        color: 'rgb(var(--text-parchment-rgb))',
        border: '2px solid rgb(var(--vermilion-3-rgb) / 1)',
        borderRadius: 4,
        fontSize: size * 0.5,
        lineHeight: 1,
        transform: rotated ? 'rotate(-8deg)' : undefined,
        boxShadow: '0 0 0 2px rgb(var(--vermilion-rgb) / 0.18), 0 2px 6px rgba(0,0,0,0.4)',
        letterSpacing: '-0.05em',
      }}
      aria-label={`印章：${text}`}
    >
      {text}
    </div>
  )
}

/* ========== 屏风边框（屏风式装饰，可包裹任意 children） ========== */
export function ScreenFrame({
  children,
  className = '',
  borderColor,
  cornerSeal = false,
}: {
  children: React.ReactNode
  className?: string
  /** 边框颜色，缺省用金色 */
  borderColor?: string
  /** 四角加小方印装饰 */
  cornerSeal?: boolean
}) {
  const id = useId()
  const color = borderColor ?? 'rgb(var(--gold-rgb) / 0.6)'
  return (
    <div className={`relative ${className}`}>
      {/* 四角小印 */}
      {cornerSeal && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: color }} />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: color }} />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: color }} />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: color }} />
        </>
      )}
      {/* 顶部横额 */}
      <div
        className="absolute top-0 left-2 right-2 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${color} 20%, ${color} 80%, transparent 100%)` }}
      />
      {/* 底部横额 */}
      <div
        className="absolute bottom-0 left-2 right-2 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${color} 20%, ${color} 80%, transparent 100%)` }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}