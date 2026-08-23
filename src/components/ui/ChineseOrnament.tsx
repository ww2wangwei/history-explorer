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

/* ========== 卷轴装裱 (elegant hanging scroll dowel) ========== */
// 视觉：上下两根细木杆（装裱天杆/地杆），中央是卷起的纸卷，质感如真宣纸 + 细木纹
// 抛弃之前"木桶"风格（粗椭圆+三道圈）——参考实物立轴：扁薄 + 纸卷叠层感
export function ScrollEdge({ side = 'left', className = '' }: { side?: 'left' | 'right'; className?: string }) {
  const id = useId()
  // 镜像翻转：右侧卷轴上下颠倒（视觉对称美）
  const transform = side === 'right' ? 'scale(1, -1) translate(0, -200)' : ''
  return (
    <svg
      viewBox="0 0 24 200"
      preserveAspectRatio="none"
      className={`shrink-0 ${className}`}
      aria-hidden
      style={{ transform }}
    >
      <defs>
        {/* 纸卷叠层（垂直细条模拟纸纹） */}
        <linearGradient id={`${id}-paper`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="rgb(var(--gold-deep-rgb) / 0.85)" />
          <stop offset="50%" stopColor="rgb(var(--gold-rgb) / 1)" />
          <stop offset="100%" stopColor="rgb(var(--gold-deep-rgb) / 0.85)" />
        </linearGradient>
        {/* 装裱木杆（细窄，比纸卷略深） */}
        <linearGradient id={`${id}-rod`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="rgb(var(--gold-deep-rgb) / 0.6)" />
          <stop offset="50%" stopColor="rgb(var(--border-strong-rgb) / 0.85)" />
          <stop offset="100%" stopColor="rgb(var(--gold-deep-rgb) / 0.6)" />
        </linearGradient>
        {/* 纸卷端面（柔和椭圆，比之前薄 60%） */}
        <radialGradient id={`${id}-cap`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgb(var(--gold-rgb) / 1)" />
          <stop offset="80%" stopColor="rgb(var(--gold-deep-rgb) / 0.9)" />
          <stop offset="100%" stopColor="rgb(var(--border-strong-rgb) / 0.7)" />
        </radialGradient>
      </defs>

      {/* 上装裱杆（细窄长条） */}
      <rect x="2" y="2" width="20" height="6" rx="3" fill={`url(#${id}-rod)`} />
      {/* 下装裱杆 */}
      <rect x="2" y="192" width="20" height="6" rx="3" fill={`url(#${id}-rod)`} />

      {/* 中央纸卷（扁宽 + 上下两端纸卷叠层） */}
      <rect x="6" y="10" width="12" height="180" fill={`url(#${id}-paper)`} />
      {/* 纸卷叠层细线（每 18px 一道，模拟卷起的纸张层） */}
      <g opacity="0.7">
        {[28, 46, 64, 82, 100, 118, 136, 154, 172].map(y => (
          <line key={y} x1="6" x2="18" y1={y} y2={y} stroke="rgb(var(--gold-deep-rgb) / 0.5)" strokeWidth="0.4" />
        ))}
      </g>

      {/* 上下两端纸卷截面（薄椭圆，端面卷起感） */}
      <ellipse cx="12" cy="10" rx="6" ry="3" fill={`url(#${id}-cap)`} />
      <ellipse cx="12" cy="190" rx="6" ry="3" fill={`url(#${id}-cap)`} />
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