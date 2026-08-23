/**
 * FallbackImage — 统一处理 Bing 图片 + 兜底
 *
 * 设计：
 * - 始终显示渐变背景 + 关键字首字符（兜底，永不空白）
 * - 图片加载成功后叠在背景上
 * - 图片加载失败/超时不动（不影响兜底）
 *
 * 用法：
 *   <FallbackImage
 *     src={bingImage(kw, 800, 450)}
 *     keyword="罗马帝国"
 *     color="#c89a5b"
 *     aspectRatio="16/9"
 *   />
 */
import { useState } from 'react'

interface Props {
  src: string
  /** 用于兜底显示首字符 + 渐变背景色 */
  keyword: string
  /** 朝代/事件的主色 */
  color?: string
  /** 宽高比 (默认 16/9) */
  aspectRatio?: string
  /** alt 文本（默认 = keyword） */
  alt?: string
  /** 额外 className */
  className?: string
}

export default function FallbackImage({
  src,
  keyword,
  color = '#8a6a3a',
  aspectRatio = '16/9',
  alt,
  className = '',
}: Props) {
  const [loaded, setLoaded] = useState(false)
  const firstChar = (keyword || '?').trim().charAt(0) || '?'
  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{ aspectRatio, background: `linear-gradient(135deg, ${color}66 0%, ${color}22 100%)` }}
    >
      {/* 兜底层：渐变 + 首字符（永远可见） */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden={loaded}
      >
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl md:text-4xl font-serif font-bold shadow-lg"
        style={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`,
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
        >
          {firstChar}
        </div>
      </div>
      {/* 图片层（可选，叠在兜底之上） */}
      {src && (
        <img
          src={src}
          alt={alt || keyword}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}