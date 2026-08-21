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

/* ========== 云纹分割线 (cloud pattern) ========== */
export function CloudDivider({ className = '' }: { className?: string }) {
  const id = useId()
  return (
    <svg
      viewBox="0 0 120 20"
      preserveAspectRatio="none"
      className={`w-full h-3 ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-cloud`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="rgb(var(--gold-rgb) / 0)" />
          <stop offset="20%" stopColor="rgb(var(--gold-rgb) / 0.5)" />
          <stop offset="50%" stopColor="rgb(var(--gold-rgb) / 0.8)" />
          <stop offset="80%" stopColor="rgb(var(--gold-rgb) / 0.5)" />
          <stop offset="100%" stopColor="rgb(var(--gold-rgb) / 0)" />
        </linearGradient>
      </defs>
      {/* 中线 */}
      <line x1="0" y1="10" x2="120" y2="10" stroke={`url(#${id}-cloud)`} strokeWidth="0.5" />
      {/* 左侧卷云 */}
      <path
        d="M 8 10 Q 6 6 10 5 Q 13 4 12 8 Q 15 6 17 9 Q 19 7 21 10"
        fill="none" stroke={`url(#${id}-cloud)`} strokeWidth="1" strokeLinecap="round"
      />
      {/* 右侧卷云 */}
      <path
        d="M 99 10 Q 101 14 105 15 Q 108 16 107 12 Q 110 14 112 11 Q 113 13 115 10"
        fill="none" stroke={`url(#${id}-cloud)`} strokeWidth="1" strokeLinecap="round"
      />
      {/* 中央如意结 */}
      <path
        d="M 60 4 Q 55 4 55 10 Q 55 16 60 16 Q 65 16 65 10 Q 65 4 60  4 Z M 60 7 Q 62 7 62 10 Q 62 13 60 13 Q 58 13 58 10 Q 58 7 60 7 Z"
        fill="rgb(var(--gold-rgb) / 0.85)"
      />
    </svg>
  )
}

/* ========== 回纹分割线 (meander / Greek key) ========== */
export function GreekKeyDivider({ className = '' }: { className?: string }) {
  // 回纹：以 12 为基本周期，水平延展
  const pattern = (
    <pattern id="greek-key-pattern" x="0" y="0" width="24" height="12" patternUnits="userSpaceOnUse">
      <path
        d="M 0 11 L 0 1 L 6 1 L 6 5 L 3 5 L 3 8 L 6 8 L 6 11 Z M 12 1 L 18 1 L 18 5 L 21 5 L 21 8 L 18 8 L 18 11 L 12 11 Z M 9 8 L 15 8 L 15 11 L 9 11 Z"
        fill="rgb(var(--gold-rgb) / 0.7)"
      />
    </pattern>
  )
  return (
    <svg
      className={`w-full h-3 ${className}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>{pattern}</defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#greek-key-pattern)" />
    </svg>
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