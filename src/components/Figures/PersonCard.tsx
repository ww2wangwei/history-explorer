/**
 * PersonCard — 共享人物卡片组件
 *
 * 全人物页（FiguresOverview）和 Dashboard 选人物弹窗 共用此组件。
 * 这样保证两个页面的视觉、行为、信息展示 100% 一致。
 *
 * 视觉结构：
 *   ┌────────┬──────────────────┐
 *   │ 头像    │ 名字 [分类图标]   │
 *   │ (方形)  │ 生卒年 · 角色    │
 *   │        │ 简介             │
 *   │        │ [时代] [+n]      │
 *   └────────┴──────────────────┘
 *
 * 头像逻辑（双层）：
 *   1. 兜底层：程序化头像（渐变 + 姓氏首字）— 永远可见
 *   2. 上层：Bing 真实图 — 加载成功后淡入覆盖
 */
import type { HistoricalFigure } from '@/types'
import erasData from '@/data/eras.json'
import type { Era, FigureCategory } from '@/types'
import { bingImage, personSearchKeywords, fallbackKeyword } from '@/utils/geoImage'

const eras = erasData as Era[]

/** 人物分类标签（与 FiguresOverview 保持一致） */
export const PERSON_CATEGORY_LABEL: Record<FigureCategory, { icon: string; label: string; color: string }> = {
  politician: { icon: '👑', label: '政治家', color: '#c89a5b' },
  military:   { icon: '⚔️', label: '军事家', color: '#b85450' },
  thinker:    { icon: '📚', label: '思想家', color: '#9b7eb6' },
  literati:   { icon: '✒️', label: '文人/艺术家', color: '#5b9bc8' },
  scientist:  { icon: '🔬', label: '科学家', color: '#5bc89a' },
  reformer:   { icon: '⚖️', label: '改革家', color: '#c8a85b' },
  explorer:   { icon: '🚢', label: '探险家', color: '#5b8fc8' },
  religious:  { icon: '☸️', label: '宗教人物', color: '#c89a8a' },
}

export interface PersonCardProps {
  person: HistoricalFigure
  visited: boolean
  onClick: () => void
  /** 额外 className（用于 GSAP 标识等） */
  className?: string
}

/**
 * 计算人物的生卒年字符串（如 "BC 259 ~ BC 210"）
 * 复用 helper，FiguresOverview / Dashboard modal 共用
 */
export function getPersonYears(person: HistoricalFigure): string | null {
  if (person.birthYear && person.deathYear) {
    const b = person.birthYear < 0 ? `BC ${-person.birthYear}` : `${person.birthYear}`
    const d = person.deathYear < 0 ? `BC ${-person.deathYear}` : `${person.deathYear}`
    return `${b} ~ ${d}`
  }
  return null
}

/**
 * 计算头像源（Bing URL + 程序化兜底用的色组合 + 首字）
 */
export function getPersonAvatar(person: HistoricalFigure) {
  const eraNames = person.eraIds
    .map(eid => eras.find(e => e.id === eid))
    .filter((e): e is Era => Boolean(e))
  const catMeta = PERSON_CATEGORY_LABEL[person.category]
  const kw = personSearchKeywords[person.id] ?? fallbackKeyword(person.name, person.category)
  const img = bingImage(kw, 400, 240)
  return {
    img,
    paletteA: catMeta.color,
    paletteB: eraNames[0]?.color ?? '#5b9bc8',
    initial: person.name.charAt(0),
  }
}

export default function PersonCard({ person, visited, onClick, className = '' }: PersonCardProps) {
  const eraNames = person.eraIds
    .map(eid => eras.find(e => e.id === eid))
    .filter((e): e is Era => Boolean(e))
  const catMeta = PERSON_CATEGORY_LABEL[person.category]
  const { img, paletteA, paletteB, initial } = getPersonAvatar(person)
  const years = getPersonYears(person)

  return (
    <button
      onClick={onClick}
      className={`person-card text-left rounded-lg bg-ink-800/60 border border-ink-700 hover:border-bronze-500/60 hover:bg-ink-700/60 transition-all relative group overflow-hidden flex w-full ${className}`}
    >
      {/* 左：人物头像（双层：程序化兜底 + Bing 真实图）— 紧凑 96px */}
      <div className="relative w-24 flex-shrink-0 bg-ink-900 overflow-hidden">
        {/* 兜底：程序化头像 — 永远渲染 */}
        <div
          className="absolute inset-0 flex items-center justify-center select-none"
          style={{
            background: `linear-gradient(135deg, ${paletteA}55 0%, ${paletteB}55 100%)`,
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-serif font-bold shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${paletteA} 0%, ${paletteB} 100%)`,
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              border: '1.5px solid rgba(255,255,255,0.3)',
            }}
          >
            {initial}
          </div>
        </div>
        {/* img：真实人物头像（加载成功后覆盖在程序化头像上） */}
        <img
          src={img}
          alt={person.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10"
          style={{ opacity: 0 }}
          loading="eager"
          onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1' }}
        />
        {/* 已了解对勾 */}
        {visited && (
          <span className="absolute top-1.5 right-1.5 text-green-400 text-sm bg-ink-900/70 backdrop-blur w-5 h-5 rounded-full flex items-center justify-center z-20" title="已了解">✓</span>
        )}
      </div>
      {/* 右：信息 — 紧凑布局，去掉 description 摘要（详情在 dialog 里看） */}
      <div className="flex-1 p-2 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span
            className="text-sm w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: catMeta.color + '25' }}
            title={catMeta.label}
          >
            {catMeta.icon}
          </span>
          <span className="text-sm font-serif text-parchment-50 truncate flex-1">{person.name}</span>
          {visited && <span className="text-[9px] text-green-400">✓</span>}
        </div>
        <div className="text-xs text-ink-500 truncate">
          {years ? years : person.role.slice(0, 30)}
        </div>
        <div className="flex flex-wrap gap-1 mt-0.5">
          {eraNames.slice(0, 2).map(e => (
            <span
              key={e.id}
              className="text-[9px] px-1 py-0.5 rounded-lg"
              style={{ background: e.color + '20', color: e.color }}
            >
              {e.name}
            </span>
          ))}
          {eraNames.length > 2 && (
            <span className="text-[9px] text-ink-500">+{eraNames.length - 2}</span>
          )}
        </div>
      </div>
    </button>
  )
}
