/**
 * CloseButton — 统一"×关闭"按钮
 *
 * 用法：
 *   <CloseButton onClick={handleClose} />
 *   <CloseButton variant="danger" onClick={handleClose} title="关闭 (ESC)" />
 *
 * variant:
 *   - default: 默认 ink 配色（hover:bg-ink-700，text 变亮）
 *   - danger:  红色配色（hover:bg-red-900/30）
 *
 * 大小固定 8×8 = 32×32px
 */
import type { MouseEvent } from 'react'

interface Props {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
  variant?: 'default' | 'danger'
  title?: string
  className?: string
  /** "absolute top-3 right-3 ..." 之类的位置定位 className 可注入 */
}

export default function CloseButton({
  onClick,
  variant = 'default',
  title = '关闭 (ESC)',
  className = '',
}: Props) {
  const variantCls =
    variant === 'danger'
      ? 'text-parchment-50/80 hover:text-parchment-50 bg-ink-900/60 hover:bg-red-900/30 backdrop-blur'
      : 'text-ink-500 hover:text-parchment-50 bg-ink-900/60 hover:bg-ink-900/80 backdrop-blur'

  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${variantCls} ${className}`}
    >
      ×
    </button>
  )
}
