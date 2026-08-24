/**
 * InkFlowField —— 全屏墨流场背景
 *
 * 灵感：originkit.dev 的 ink-flow-field（基于 Navier-Stokes 流体力学）
 * 简化实现：粒子 + curl noise 流场，鼠标移动时喷射墨滴
 *
 * 视觉：暗色系下鼠标拖动留下墨色轨迹，缓缓晕染消散（参考宣纸水墨）
 * 主题契合：墨·朱砂 v2 → 「墨」的部分
 *
 * 性能：
 * - requestAnimationFrame 循环
 * - 最多 600 粒子（环形缓冲）
 * - 只在 mouse 移动时添加粒子
 * - pointer-events: none 不挡 UI
 */
import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  maxAge: number
  size: number
}

const MAX_PARTICLES = 600
const MAX_AGE_BASE = 80  // 帧

export default function InkFlowField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999, lastMoveTime: 0, active: false })
  const rafRef = useRef<number | null>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // 鼠标交互
    const onMove = (e: MouseEvent | TouchEvent) => {
      let cx = 0, cy = 0
      if ('touches' in e) {
        cx = e.touches[0]?.clientX ?? 0
        cy = e.touches[0]?.clientY ?? 0
      } else {
        cx = (e as MouseEvent).clientX
        cy = (e as MouseEvent).clientY
      }
      const now = performance.now()
      mouseRef.current.x = cx
      mouseRef.current.y = cy
      mouseRef.current.lastMoveTime = now
      mouseRef.current.active = true
      // 添加粒子（每次 mousemove 加 3 个）
      const ps = particlesRef.current
      for (let i = 0; i < 3; i++) {
        if (ps.length >= MAX_PARTICLES) break
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 0.4
        ps.push({
          x: cx + Math.cos(angle) * 4,
          y: cy + Math.sin(angle) * 4,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          age: 0,
          maxAge: MAX_AGE_BASE + Math.random() * 40,
          size: 1.5 + Math.random() * 1.5,
        })
      }
    }

    const onLeave = () => {
      mouseRef.current.active = false
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('mouseout', onLeave)
    document.addEventListener('mouseleave', onLeave)

    // 简单的 curl noise（用 sin/cos 模拟）
    const flowAt = (x: number, y: number, t: number) => {
      const s1 = Math.sin(x * 0.008 + t * 0.0003) * 0.5
      const c1 = Math.cos(y * 0.008 + t * 0.0004) * 0.5
      const s2 = Math.sin((x + y) * 0.005 + t * 0.0005) * 0.3
      return { vx: s1 + c1 * 0.5, vy: c1 - s2 * 0.5 }
    }

    // 主循环
    const tick = () => {
      frameRef.current++
      const t = frameRef.current
      const w = window.innerWidth
      const h = window.innerHeight

      // 用半透明黑覆盖 = 旧轨迹淡出
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.025)'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'

      const ps = particlesRef.current
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        // 流场速度
        const flow = flowAt(p.x, p.y, t)
        p.vx = p.vx * 0.94 + flow.vx * 0.08
        p.vy = p.vy * 0.94 + flow.vy * 0.08
        p.x += p.vx
        p.y += p.vy
        p.age++

        // 透明度按年龄衰减（早期浓，后期淡）
        const lifeRatio = 1 - p.age / p.maxAge
        const alpha = lifeRatio * 0.18

        if (alpha <= 0.01 || p.x < -50 || p.x > w + 50 || p.y < -50 || p.y > h + 50) {
          ps.splice(i, 1)
          continue
        }

        // 墨滴：用径向渐变模拟水墨晕染
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6)
        grd.addColorStop(0, `rgba(26, 23, 20, ${alpha})`)
        grd.addColorStop(0.4, `rgba(26, 23, 20, ${alpha * 0.6})`)
        grd.addColorStop(1, 'rgba(26, 23, 20, 0)')
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2)
        ctx.fill()
      }

      // 自动添加闲置粒子（无鼠标时缓慢呼吸）
      if (!mouseRef.current.active && t % 30 === 0) {
        if (ps.length < 30) {
          ps.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            age: Math.random() * 30,
            maxAge: 120,
            size: 0.8 + Math.random() * 0.8,
          })
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseout', onLeave)
      document.removeEventListener('mouseleave', onLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  )
}