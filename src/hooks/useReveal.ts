/**
 * useReveal — 滚动驱动的入场动画 hook
 *
 * 当元素进入视口时触发淡入 + 上移动画
 * 替代 GSAP ScrollTrigger（无需额外插件）
 *
 * 用法:
 *   const ref = useRef<HTMLDivElement>(null)
 *   useReveal(ref, { y: 24, duration: 0.5 })
 *   ...
 *   <div ref={ref}>{content}</div>
 *
 * 特性:
 * - 自动尊重 prefers-reduced-motion
 * - 只触发一次（threshold 默认 0.15）
 * - rootMargin 可调（默认 '0px 0px -50px 0px'）
 */
import { useEffect, type RefObject } from 'react'

interface Options {
  /** 起始 y 位移 (px)，默认 24 */
  y?: number
  /** 起始 opacity，默认 0 */
  fromOpacity?: number
  /** 动画时长 (s)，默认 0.5 */
  duration?: number
  /** 起始 scale，默认 1 */
  scale?: number
  /** 触发阈值 0-1，默认 0.15 */
  threshold?: number
  /** rootMargin，默认 '0px 0px -50px 0px' */
  rootMargin?: string
  /** 延迟 (s)，默认 0 */
  delay?: number
}

export function useReveal(
  ref: RefObject<HTMLElement | null>,
  options: Options = {},
) {
  const {
    y = 24,
    fromOpacity = 0,
    duration = 0.5,
    scale = 1,
    threshold = 0.15,
    rootMargin = '0px 0px -50px 0px',
    delay = 0,
  } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }

    // 初始状态
    el.style.opacity = String(fromOpacity)
    el.style.transform = `translateY(${y}px) scale(${scale})`
    el.style.transition = `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = '1'
            el.style.transform = 'translateY(0) scale(1)'
            observer.unobserve(el)
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, y, fromOpacity, duration, scale, threshold, rootMargin, delay])
}

/**
 * useRevealStagger — 多个元素错开延迟
 *
 * 用法:
 *   const ref = useRef<HTMLDivElement>(null)
 *   useRevealStagger(ref, '.my-card', { each: 0.06 })
 */
export function useRevealStagger(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  options: Options & { each?: number } = {},
) {
  const { y = 16, duration = 0.45, each = 0.05, delay = 0, scale = 1, threshold = 0.1, rootMargin = '0px 0px -40px 0px' } = options

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const items = container.querySelectorAll<HTMLElement>(selector)
    if (!items.length) return

    if (reduce) {
      items.forEach((it) => {
        it.style.opacity = '1'
        it.style.transform = 'none'
      })
      return
    }

    // 初始状态
    items.forEach((it) => {
      it.style.opacity = '0'
      it.style.transform = `translateY(${y}px) scale(${scale})`
      it.style.transition = `opacity ${duration}s ease-out, transform ${duration}s ease-out`
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            const index = Array.from(items).indexOf(target)
            target.style.transition += `, ${delay + index * each}s`
            target.style.opacity = '1'
            target.style.transform = 'translateY(0) scale(1)'
            observer.unobserve(target)
          }
        })
      },
      { threshold, rootMargin }
    )

    items.forEach((it) => observer.observe(it))
    return () => observer.disconnect()
  }, [containerRef, selector, y, duration, each, delay, scale, threshold, rootMargin])
}