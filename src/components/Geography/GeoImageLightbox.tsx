/**
 * GeoImageLightbox — 全屏放大查看单张历史地图
 *
 * 用法：
 *   <GeoImageLightbox src={path} alt={...} onClose={() => setOpen(false)} open={open} />
 */
import { useEffect } from 'react'

interface Props {
  src?: string | null
  alt: string
  open: boolean
  onClose: () => void
  /** 下方附加文本（说明） */
  caption?: string
}

export default function GeoImageLightbox({ src, alt, open, onClose, caption }: Props) {
  // ESC 关闭
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !src) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/92 backdrop-blur-md p-6"
      onClick={onClose}
      role="dialog"
      aria-label={`放大查看 · ${alt}`}
      aria-modal="true"
    >
      <div
        className="relative max-w-[92vw] max-h-[88vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          aria-label="关闭 (ESC)"
          className="absolute -top-2 -right-2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-ink-800/95 hover:bg-ink-700 border border-ink-600 text-parchment-50 text-2xl leading-none shadow-2xl"
        >
          ×
        </button>
        {/* 放大的图 */}
        <img
          src={src}
          alt={alt}
          className="block max-w-full max-h-[80vh] object-contain bg-ink-900 rounded-lg shadow-2xl border border-ink-700"
          loading="lazy"
        />
        {/* caption */}
        {caption && (
          <div className="mt-3 text-sm text-parchment-50/85 text-center max-w-3xl leading-relaxed">
            {caption}
          </div>
        )}
        {/* 提示 */}
        <div className="mt-2 text-[10px] text-ink-500 tracking-wider uppercase">
          按 ESC 或点击空白处关闭
        </div>
      </div>
    </div>
  )
}
