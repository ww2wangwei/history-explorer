/**
 * useCountUp — 数字计数动画 hook
 *
 * 用 GSAP 把数字从 0 平滑滚到目标值。
 * 用于 Dashboard 统计数字（今日目标、已学朝代等）。
 *
 * 用法:
 *   const ref = useCountUp(42)   // 数字会从 0 滚到 42
 *   <span ref={ref} className="text-xl">0</span>
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function useCountUp(target: number, options?: { duration?: number; delay?: number; suffix?: string }) {
  const elRef = useRef<HTMLSpanElement | null>(null)
  const objRef = useRef({ val: 0 })

  useEffect(() => {
    if (!elRef.current) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      elRef.current.textContent = `${target}${options?.suffix ?? ''}`
      objRef.current.val = target
      return
    }
    const dur = options?.duration ?? 1.2
    const delay = options?.delay ?? 0
    objRef.current.val = 0
    elRef.current.textContent = `0${options?.suffix ?? ''}`
    const tween = gsap.to(objRef.current, {
      val: target,
      duration: dur,
      delay,
      ease: 'power2.out',
      onUpdate: () => {
        if (elRef.current) {
          elRef.current.textContent = `${Math.round(objRef.current.val)}${options?.suffix ?? ''}`
        }
      },
    })
    return () => { tween.kill() }
  }, [target, options?.duration, options?.delay, options?.suffix])

  return elRef
}
