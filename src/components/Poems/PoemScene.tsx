/**
 * 主题画面 — 列表卡片和详情头图共用
 *
 * 渲染优先级：
 *   1. 真实水墨图（poem.image.url）—— 运行时 lazy + onError 降级
 *   2. fallback：CSS 渐变 + 主题意象 emoji + 文字
 *
 * 与旧版区别：list 用 compact 4D 比 / detail 用 21:9，加了 <img> 加载层和 attribution。
 *
 * @example
 *   <PoemScene palette={poem.palette} motif={poem.motif} />
 *   <PoemScene palette={poem.palette} motif={poem.motif} title={poem.title} subtitle={poem.author} image={poem.image} compact />
 */
import { useState } from 'react'
import type { PoemPalette, PoemImage } from '@/types/poems'

interface Props {
  palette: PoemPalette
  motif: string
  /** 标题文字（详情头图用） */
  title?: string
  /** 副标题（作者 / 朝代），详情头图用 */
  subtitle?: string
  /** true = 列表卡片用的小尺寸；false = 详情头图用的大尺寸 */
  compact?: boolean
  /** 圆角 override */
  rounded?: string
  /** 可选图片（priority 1） */
  image?: PoemImage
}

export default function PoemScene({ palette, motif, title, subtitle, compact, rounded, image }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = !!image?.url && !imgFailed

  const bgStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
    color: palette.accent,
    borderRadius: rounded,
  }
  const aspect = compact ? 'aspect-[5/2]' : 'aspect-[21/9]'
  const motifSize = compact ? 'text-5xl' : 'text-8xl lg:text-9xl'
  const titleSize = compact ? 'text-base' : 'text-3xl lg:text-4xl'
  const subtleBar = palette.accent + '30'

  return (
    <div
      className={`relative w-full ${aspect} overflow-hidden ${rounded ?? 'rounded-lg'} shrink-0 bg-ink-900`}
      style={bgStyle}
    >
      {/* 优先级 1：真实水墨图（含暗化叠层便于文字可读） */}
      {showImage && (
        <img
          src={image!.url}
          alt={image!.artworkName ?? title ?? motif}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover select-none"
          style={{ filter: 'saturate(0.85) contrast(1.02)' }}
        />
      )}
      {/* 暗化遮罩（无论图或 fallback，都让白色文字更清晰） */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: showImage
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)'
            : 'transparent',
        }}
      />

      {/* 装饰线 + motif（fallback 时显示；图模式下 motif 半透叠加） */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${palette.accent}60 50%, transparent 100%)` }}
      />
      <div
        className={`absolute top-1/2 right-4 lg:right-8 -translate-y-1/2 select-none ${motifSize} ${
          showImage ? 'opacity-0 group-hover:opacity-90' : 'opacity-90'
        } drop-shadow-md transition-opacity pointer-events-none`}
        aria-hidden
      >
        {motif}
      </div>
      {/* 左下文字 */}
      {(title || subtitle) && (
        <div className="absolute bottom-3 left-4 lg:left-5 max-w-[65%] z-10">
          {title && (
            <div
              className={`font-serif ${titleSize} truncate drop-shadow-md`}
              style={{ color: showImage ? '#f5e9d3' : palette.accent }}
            >
              {title}
            </div>
          )}
          {subtitle && (
            <div className="text-xs mt-0.5 opacity-85 truncate drop-shadow" style={{ color: showImage ? '#e8d8b8' : palette.accent }}>
              {subtitle}
            </div>
          )}
        </div>
      )}
      {/* 装饰短横线（fallback 用） */}
      <div
        className={`absolute bottom-0 left-0 h-1 w-16 rounded-r ${showImage ? 'opacity-60' : 'opacity-100'}`}
        style={{ background: subtleBar }}
      />
    </div>
  )
}
