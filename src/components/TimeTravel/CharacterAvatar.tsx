/**
 * CharacterAvatar — 人物头像组件
 *
 * 优先级：
 * 1. Bing 搜索（人物名 + "portrait"）→ 真实肖像
 * 2. 失败 → 文字头像（首字 + 渐变色，hash 生成）
 * 3. 完全加载失败 → emoji 兜底
 */
import { useState } from 'react'
import { bingImage } from '@/utils/geoImage'

interface Props {
  name: string
  size?: number  // 像素
  /** 自定义搜索关键词（默认 name + "portrait"） */
  searchKeyword?: string
  /** 自定义 emoji 兜底（默认从名字生成） */
  fallbackEmoji?: string
  /** 额外 class */
  className?: string
  /** 圆角 (默认 50%) */
  rounded?: string
}

/** 从名字生成稳定的渐变色（hash） */
function colorFromName(name: string): [string, string] {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h1 = Math.abs(hash) % 360
  const h2 = (h1 + 60) % 360
  return [
    `hsl(${h1}, 60%, 45%)`,
    `hsl(${h2}, 70%, 30%)`,
  ]
}

function getEmojiFromName(name: string): string {
  // 简单映射
  if (/李|孔|孟|荀|庄/.test(name)) return '👤'
  if (/曹|刘|孙|诸葛|关|张/.test(name)) return '⚔️'
  if (/王|皇|帝|公|侯/.test(name)) return '👑'
  if (/波拿巴|拿破仑|法国/.test(name)) return '🎖️'
  if (/女|后|妃|夫/.test(name)) return '👸'
  if (/文|诗|书/.test(name)) return '📜'
  return '👤'
}

export default function CharacterAvatar({ name, size = 64, searchKeyword, fallbackEmoji, className = '', rounded = '50%' }: Props) {
  const [imgError, setImgError] = useState(false)
  const imgUrl = bingImage(searchKeyword ?? `${name} portrait historical`, 200, 200)
  const [c1, c2] = colorFromName(name)
  const firstChar = name.trim().charAt(0) || '?'

  if (imgError) {
    // 文字头像
    return (
      <div
        className={`flex items-center justify-center font-serif text-parchment-50 select-none ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: rounded,
          background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
          fontSize: size * 0.45,
          fontWeight: 600,
          boxShadow: '0 0 0 1.5px rgba(255,255,255,0.2) inset',
        }}
        title={name}
      >
        {firstChar}
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size, borderRadius: rounded }}
    >
      <img
        src={imgUrl}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
        loading="lazy"
      />
      {/* 加载失败时叠加文字头像（onError 触发后 img 不显示） */}
      <div
        className="absolute inset-0 flex items-center justify-center font-serif text-parchment-50 -z-10"
        style={{
          background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
          fontSize: size * 0.45,
          fontWeight: 600,
        }}
      >
        {firstChar}
      </div>
    </div>
  )
}

/** 纯文字头像（不尝试加载图片）—— 用于 NPC 名字等 */
export function TextAvatar({ name, size = 48, className = '', rounded = '50%' }: { name: string; size?: number; className?: string; rounded?: string }) {
  const [c1, c2] = colorFromName(name)
  return (
    <div
      className={`flex items-center justify-center font-serif text-parchment-50 select-none flex-shrink-0 ${className}`}
      style={{
        width: size, height: size, borderRadius: rounded,
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        fontSize: size * 0.45, fontWeight: 600,
        boxShadow: '0 0 0 1.5px rgba(255,255,255,0.2) inset',
      }}
      title={name}
    >
      {name.trim().charAt(0) || '?'}
    </div>
  )
}

/** 玩家自己的头像（用首字 + 主色） */
export function PlayerAvatar({ name, size = 64, color = '#c89a5b', className = '' }: { name: string; size?: number; color?: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center font-serif text-ink-900 select-none flex-shrink-0 ${className}`}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
        fontSize: size * 0.45, fontWeight: 700,
        boxShadow: `0 0 0 2px ${color}80, 0 0 0 4px ${color}40`,
      }}
      title={name}
    >
      {name.trim().charAt(0) || '?'}
    </div>
  )
}

export { getEmojiFromName }
