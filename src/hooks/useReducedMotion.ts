/**
 * useReducedMotion — 全局响应 prefers-reduced-motion
 *
 * 用 gsap.globalTimeline.timeScale() 把所有动画秒过 (1 秒变 0.01 秒)
 * 比逐个 useEffect 检查更可靠（用户加新 GSAP 不会忘记）
 *
 * 用法：在 App 顶层调用一次
 */
import { useEffect } from 'react'
import gsap from 'gsap'

export function useReducedMotionGlobal() {
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return

    let savedTimeScale: number | null = null

    const apply = () => {
      if (mq.matches) {
        // 接近禁止：把整个全局时间轴压缩到几乎瞬时
        if (savedTimeScale === null) {
          savedTimeScale = gsap.globalTimeline.timeScale()
        }
        gsap.globalTimeline.timeScale(0.01)
      } else {
        // 恢复正常
        if (savedTimeScale !== null) {
          gsap.globalTimeline.timeScale(savedTimeScale)
          savedTimeScale = null
        }
      }
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
}
