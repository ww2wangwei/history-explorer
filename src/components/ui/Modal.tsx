/**
 * ModalShell — 纯 CSS 弹窗外壳（无 GSAP 动画，立即显示）
 *
 * 可访问性：
 *   - role="dialog" + aria-modal="true"
 *   - 支持 ariaLabel
 *   - Escape 关闭
 *   - 打开时把焦点移入弹窗，关闭后恢复到触发元素
 */
import { useEffect, useRef, type ReactNode } from 'react'

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

  if (!isOpen) return null

  return (
    <div
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
