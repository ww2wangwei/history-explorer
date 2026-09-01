/**
 * useCountUp — 数字滚动动画 hook
 *
 * 用法:
 *   const displayValue = useCountUp(targetValue, { duration: 1.2, decimals: 0 })
 *   <span>{displayValue.toFixed(0)}</span>
 *
 * 特性:
 * - 自动尊重 prefers-reduced-motion
 * - 支持小数位
 * - easeOutCubic 缓动函数
 * - targetValue 变化时自动重新动画
 */
import { useEffect, useRef, useState } from 'react'

interface Options {
  /** 动画时长（秒）默认 1.2 */
  duration?: number
  /** 小数位数 默认 0 */
  decimals?: number
  /** 起始值，默认 0 */
  from?: number
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export function useCountUp(target: number, options: Options = {}) {
  const { duration = 1.2, decimals = 0, from = 0 } = options
  const [value, setValue] = useState(from)
  const prevTarget = useRef(target)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setValue(target)
      return
    }
    const start = performance.now()
    const startValue = prevTarget.current
    const delta = target - startValue
    if (delta === 0) return

    let rafId: number
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000
      const t = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(t)
      const current = startValue + delta * eased
      setValue(Number(current.toFixed(decimals)))
      if (t < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        prevTarget.current = target
      }
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration, decimals])

  return value
}