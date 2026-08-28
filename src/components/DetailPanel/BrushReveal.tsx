/**
 * BrushReveal —— 笔刷揭示动画
 *
 * 灵感：originkit.dev 的 brush-reveal
 * 设计：内容出现时像被毛笔从左到右涂抹揭示（不平整的笔锋边缘）
 *
 * 实现：CSS clip-path 动画 + SVG mask 形成笔锋不规则边缘
 * 主题契合：墨·朱砂 → 「笔」的概念
 */
import { useEffect, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** 笔刷方向（默认 left-to-right） */
  direction?: 'left' | 'right' | 'top' | 'bottom' | 'up' | 'down'
  /** 动画时长（ms）默认 700 */
  duration?: number
  /** 延迟（ms），用于多个元素顺序揭示 */
  delay?: number
  className?: string
}

export default function BrushReveal({
  children,
  direction = 'right',
  duration = 700,
  delay = 0,
  className = '',
}: Props) {
  const [animating, setAnimating] = useState(true)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDone(true), duration + delay)
    return () => clearTimeout(t)
  }, [duration, delay])

  // inset 控制从哪边开始
  // direction='right' → 从右往左揭示（先露出左边）
  // direction='left' → 从左往右揭示（先露出右边）
  // direction='down' → 从上往下揭示（先露出顶部）
  // direction='up' → 从下往上揭示（先露出底部）
  const initialClip = (() => {
    switch (direction) {
      case 'right': return 'inset(0 100% 0 0)'
      case 'left':  return 'inset(0 0 0 100%)'
      case 'down':  return 'inset(100% 0 0 0)'
      case 'up':    return 'inset(0 0 100% 0)'
    }
  })()

  return (
    <div
      className={`relative ${className}`}
      style={{
        clipPath: animating ? initialClip : 'inset(0)',
        WebkitClipPath: animating ? initialClip : 'inset(0)',
        animation: `brush-reveal-${direction} ${duration}ms cubic-bezier(0.65, 0, 0.25, 1) ${delay}ms forwards`,
      }}
      onAnimationEnd={() => setAnimating(false)}
    >
      <style>{`
        @keyframes brush-reveal-right {
          from { clip-path: inset(0 100% 0 0); -webkit-clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0 0 0);      -webkit-clip-path: inset(0 0 0 0); }
        }
        @keyframes brush-reveal-left {
          from { clip-path: inset(0 0 0 100%); -webkit-clip-path: inset(0 0 0 100%); }
          to   { clip-path: inset(0 0 0 0);    -webkit-clip-path: inset(0 0 0 0); }
        }
        @keyframes brush-reveal-down {
          from { clip-path: inset(100% 0 0 0); -webkit-clip-path: inset(100% 0 0 0); }
          to   { clip-path: inset(0 0 0 0);     -webkit-clip-path: inset(0 0 0 0); }
        }
        @keyframes brush-reveal-up {
          from { clip-path: inset(0 0 100% 0); -webkit-clip-path: inset(0 0 100% 0); }
          to   { clip-path: inset(0 0 0 0);    -webkit-clip-path: inset(0 0 0 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .brush-reveal-content { clip-path: none !important; -webkit-clip-path: none !important; }
        }
      `}</style>
      <div className={done ? '' : 'brush-reveal-content'}>
        {children}
      </div>
    </div>
  )
}