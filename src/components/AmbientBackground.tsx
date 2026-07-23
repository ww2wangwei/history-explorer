/**
 * AmbientBackground —— 主页动态背景层
 *
 * 用 GSAP 让几个彩色 blob 缓慢漂移 + 缩放。
 * 永远在最底层 (z-[-1], position fixed) —— 不影响交互。
 *
 * 进入任一页面都能看到这个动效。
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const BLOBS = [
  { color: 'rgba(91, 155, 200, 0.18)', x: 0.15, y: 0.20, size: 600 }, // 蓝
  { color: 'rgba(155, 126, 182, 0.16)', x: 0.75, y: 0.30, size: 500 }, // 紫
  { color: 'rgba(200, 154, 91, 0.14)', x: 0.50, y: 0.75, size: 700 }, // 铜
  { color: 'rgba(91, 200, 154, 0.10)', x: 0.10, y: 0.80, size: 450 }, // 绿
  { color: 'rgba(184, 84, 80, 0.10)', x: 0.85, y: 0.65, size: 400 },  // 红
]

export default function AmbientBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const blobs = containerRef.current.querySelectorAll<HTMLDivElement>('.ambient-blob')

    // 给每个 blob 一个独立的浮动循环（18 秒一个周期）
    blobs.forEach((blob, i) => {
      const initialX = parseFloat(blob.style.left)
      const initialY = parseFloat(blob.style.top)
      gsap.to(blob, {
        x: `+=${(Math.random() - 0.5) * 250}`,
        y: `+=${(Math.random() - 0.5) * 250}`,
        scale: 0.9 + Math.random() * 0.2,
        duration: 15 + i * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    })

    // cleanup
    return () => {
      blobs.forEach(b => gsap.killTweensOf(b))
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* 基础渐变背景 —— 让整体偏深铜色 + 顶部带蓝调 */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at top, rgba(91, 155, 200, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(200, 154, 91, 0.04) 0%, transparent 50%),
            linear-gradient(135deg, #0f0e0c 0%, #1a1814 100%)
          `,
        }}
      />
      {/* 5 个浮动 blob */}
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          className="ambient-blob absolute rounded-full blur-3xl"
          style={{
            left: `${blob.x * 100}%`,
            top: `${blob.y * 100}%`,
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  )
}
