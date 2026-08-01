/**
 * ToastHost —— 渲染所有当前 toast
 *
 * 放在 Layout 末尾。每个 toast 自动加 GSAP 进场 + 退场动画。
 */
import { useEffect, useRef } from 'react'
import { useToastStore } from '@/hooks/useToast'
import gsap from 'gsap'
import { audioEngine } from '@/utils/audioEngine'

const VARIANT_STYLES = {
  success: { bg: 'bg-emerald-900/90', border: 'border-emerald-500/60', text: 'text-emerald-200', icon: '✅' },
  error:   { bg: 'bg-red-950/90',    border: 'border-danger/60',       text: 'text-red-200',    icon: '❌' },
  warn:    { bg: 'bg-amber-950/90',  border: 'border-warning/60',      text: 'text-amber-200',  icon: '⚠️' },
  info:    { bg: 'bg-ink-800/95',    border: 'border-info/60',        text: 'text-blue-200',   icon: 'ℹ️' },
} as const

export default function ToastHost() {
  const toasts = useToastStore(s => s.toasts)
  const dismiss = useToastStore(s => s.dismiss)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const lastLenRef = useRef(0)

  // 新 toast 进入时给它加 GSAP 进场动画
  useEffect(() => {
    if (!containerRef.current) return
    if (toasts.length <= lastLenRef.current) {
      lastLenRef.current = toasts.length
      return
    }
    // 找到刚加入的 items（未动画过的）
    const newItems = containerRef.current.querySelectorAll<HTMLElement>(':scope > div[data-not-animated]')
    if (newItems.length) {
      // 按 variant 播对应音效
      newItems.forEach(el => {
        const variant = el.getAttribute('data-variant') as 'success' | 'error' | 'warn' | 'info' | null
        if (variant) audioEngine.playToast(variant)
      })
      gsap.from(newItems, {
        opacity: 0, y: -16, scale: 0.92, duration: 0.35, ease: 'back.out(1.4)', stagger: 0.08,
        onStart: function () { this.targets()[0]?.removeAttribute('data-not-animated') }
      })
    }
    lastLenRef.current = toasts.length
  }, [toasts.length])

  if (!toasts.length) return null

  return (
    <div
      ref={containerRef}
      className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm"
    >
      {toasts.map(t => {
        const style = VARIANT_STYLES[t.variant]
        return (
          <div
            key={t.id}
            data-not-animated
            data-variant={t.variant}
            className={`flex items-start gap-2 px-4 py-3 rounded-lg border ${style.bg} ${style.border} ${style.text} shadow-lg backdrop-blur cursor-pointer`}
            onClick={() => dismiss(t.id)}
          >
            <span className="text-base shrink-0">{style.icon}</span>
            <span className="text-sm leading-relaxed flex-1">{t.message}</span>
            <button
              onClick={(e) => { e.stopPropagation(); dismiss(t.id) }}
              className="text-base text-current/50 hover:text-current shrink-0 leading-none px-1"
            >×</button>
          </div>
        )
      })}
    </div>
  )
}
