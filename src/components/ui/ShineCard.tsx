/**
 * ShineCard —— 带 hover shine（扫光）效果的卡片容器
 *
 * 用法:
 *   <ShineCard>... 卡片内容 ...</ShineCard>
 *
 * 鼠标悬停时，从左上到右下一道扫光。CSS-driven, GPU 加速。
 */
import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export default function ShineCard({ children, className = '' }: Props) {
  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <style>{`
        .shine-sweep::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
          transform: translateX(-120%);
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
          z-index: 1;
        }
        .group:hover .shine-sweep::before {
          transform: translateX(120%);
        }
      `}</style>
      <div className="shine-sweep absolute inset-0 pointer-events-none" aria-hidden />
      {children}
    </div>
  )
}
