/**
 * ModalShell — 带 GSAP 入场动画的弹窗外壳
 *
 * 动效:
 *   - 入场: fade + scale (0.92 → 1) + y (20 → 0), 0.28s ease-out
 *   - 退场: fade + scale (1 → 0.95), 0.2s ease-in
 *   - 尊重 prefers-reduced-motion
 *
 * 可访问性:
 *   - role="dialog" + aria-modal="true"
 *   - 支持 ariaLabel
 *   - Escape 关闭
 *   - 打开时把焦点移入弹窗，关闭后恢复到触发元素
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'

interface Props {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  innerClassName?: string
  innerStyle?: React.CSSProperties
  scopeRef?: React.RefObject<HTMLElement | null>
  /** 无障碍标签（读屏软件朗读的弹窗名称） */
  ariaLabel?: string
}

export default function ModalShell({
  isOpen,
  onClose,
  children,
  className = '',
  innerClassName = '',
  innerStyle,
  scopeRef, // 保留参数兼容性
  ariaLabel = '对话框',
}: Props) {
  const innerRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  // 在关闭动画播放期间继续渲染 DOM
  const [rendered, setRendered] = useState(isOpen)

  // Escape 关闭 + 焦点管理
  useEffect(() => {
    if (!isOpen) return
    const prevActive = document.activeElement as HTMLElement | null
    // 把焦点移入弹窗
    innerRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      // 关闭后把焦点还给触发元素
      prevActive?.focus?.()
    }
  }, [isOpen, onClose])

  // 入场动画
  useEffect(() => {
    if (!isOpen || !rendered) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const backdrop = backdropRef.current
    const inner = innerRef.current
    if (!backdrop || !inner) return

    // 起始状态
    gsap.set(backdrop, { opacity: 0 })
    gsap.set(inner, { opacity: 0, scale: 0.92, y: 20 })

    // 入场: 背景 fade + 内容 fade+scale+y
    const tl = gsap.timeline()
    tl.to(backdrop, { opacity: 1, duration: 0.2, ease: 'power2.out' })
      .to(
        inner,
        { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: 'back.out(1.2)' },
        '-=0.15'
      )

    return () => { tl.kill() }
  }, [isOpen, rendered])

  // isOpen 变化 → 控制渲染状态 + 退场动画
  useEffect(() => {
    if (isOpen) {
      setRendered(true)
    } else if (rendered) {
      // 退场动画
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      const backdrop = backdropRef.current
      const inner = innerRef.current
      if (!reduce && backdrop && inner) {
        gsap.to(backdrop, { opacity: 0, duration: 0.18, ease: 'power2.in' })
        gsap.to(inner, {
          opacity: 0,
          scale: 0.95,
          y: 10,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => setRendered(false),
        })
      } else {
        setRendered(false)
      }
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!rendered) return null

  return (
    <div
      ref={backdropRef}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4 ${className}`}
      onClick={onClose}
    >
      <div
        ref={innerRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-vermilion-500/40 shadow-2xl focus:outline-none ${innerClassName}`}
        style={innerStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}