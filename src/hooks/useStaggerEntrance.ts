/**
 * useStaggerEntrance — 卡片网格 GSAP stagger 入场动画
 *
 * 抽自 Figures/Wars/Geography 各自重复的 useEffect：
 *   - 统一尊重 prefers-reduced-motion（reduce 时跳过动画）
 *   - grid-aware stagger（power2.out）
 *
 * 用法：
 *   const ref = useRef<HTMLDivElement>(null)
 *   useStaggerEntrance(ref, '.person-card', [region, category, query, filtered.length])
 *   ...
 *   <div ref={ref} className="grid ...">{items.map(...)}</div>
 */
import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'

interface Options {
  /** 起始 y 位移，默认 14 */
  y?: number
  /** 起始 scale，默认 0.96 */
  scale?: number
  /** 动画时长（秒），默认 0.4 */
  duration?: number
  /** 每张卡片间隔（秒），默认 0.025 */
  each?: number
}

export function useStaggerEntrance(
  containerRef: RefObject<HTMLElement | null>,
  cardSelector: string,
  deps: unknown[],
  options: Options = {},
) {
  const { y = 14, scale = 0.96, duration = 0.4, each = 0.025 } = options

  useEffect(() => {
    if (!containerRef.current) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const cards = containerRef.current.querySelectorAll<HTMLElement>(cardSelector)
    if (!cards.length) return
    gsap.from(cards, {
      opacity: 0,
      y,
      scale,
      duration,
      stagger: { each, grid: 'auto', from: 'start' },
      ease: 'power2.out',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
