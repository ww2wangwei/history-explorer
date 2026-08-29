/**
 * OverviewLayout — 各"总览页"(全人物 / 全战争 / 全文化 / 全地理 / 笔记)的统一外壳
 *
 * 统一了此前各 Overview 各写一遍、且互不一致的部分：
 *   - 外层滚动容器
 *   - sticky 头部（标题 emoji + 标题 + 副标题 + 右上关闭按钮）
 *   - 头部 z-index / backdrop / 边框 / max-w-6xl 内容宽度
 *   - 关闭按钮尺寸与字形（统一 32x32、`×`、title="返回 (ESC)"）
 *   - ESC 关闭（可被 hasOverlay 抑制：当页面内部还有弹窗打开时，ESC 先交给内部处理）
 *
 * 筛选/搜索栏通过 `toolbar` slot 传入，渲染在标题下方、同一 max-w-6xl 容器内。
 */
import { useEffect, type ReactNode } from 'react'

interface Props {
  /** 标题前的 emoji，如 "📚" */
  emoji?: string
  /** 页面标题，如 "全文化" */
  title: string
  /** 副标题/统计行 */
  subtitle?: ReactNode
  /** 关闭回调（点击 × 或按 ESC） */
  onClose: () => void
  /**
   * 若为 true，则本组件不处理 ESC（说明页面内部有更高优先级的弹窗需要先关闭）。
   * 页面自行在关闭内部弹窗后再允许 ESC 冒泡到这里。
   */
  suppressEsc?: boolean
  /** 头部标题下方的筛选/搜索栏 */
  toolbar?: ReactNode
  /** 主体内容 */
  children: ReactNode
  /** 额外的头部主题色边框（默认 bronze），传入 tailwind border 类可覆盖，用于页面主题色（如地理绿） */
  headerBorderClass?: string
}

export default function OverviewLayout({
  emoji,
  title,
  subtitle,
  onClose,
  suppressEsc = false,
  toolbar,
  children,
  headerBorderClass = 'border-vermilion-500/40',
}: Props) {
  useEffect(() => {
    if (suppressEsc) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [suppressEsc, onClose])

  return (
    <div className="w-full h-full bg-ink-900 overflow-y-auto scrollbar-thin">
      <div className={`sticky top-0 z-30 bg-ink-800 border-b shadow-md ${headerBorderClass}`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h2 className="text-2xl font-serif text-vermilion-300">
                {emoji && <span className="mr-1.5">{emoji}</span>}
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-ink-300 mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 text-ink-300 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700 transition-colors"
              title="返回 (ESC)"
              aria-label="关闭"
            >
              ×
            </button>
          </div>
          {toolbar}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-4">
        {children}
      </div>
    </div>
  )
}
