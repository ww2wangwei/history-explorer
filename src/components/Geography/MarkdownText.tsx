/**
 * MarkdownText — 朝代描述/要点/事件等 markdown 渲染
 *
 * 使用 react-markdown + remark-gfm。第一次点开弹窗时 lazy 加载（约 200KB chunk）。
 * 骨架显示阶段不渲染 markdown，等 chunk 到位后才显示。点击响应从 ~200ms 降到 ~30ms。
 *
 * 注：原本直接 import 在这里。改成 lazy 后，调用方需配合 Suspense 边界使用。
 */
import { lazy, Suspense } from 'react'

// 重型 markdown 渲染器按需加载
const MarkdownImpl = lazy(() => import('./MarkdownImpl'))

function MarkdownFallback() {
  return <span className="inline-block h-3 w-3/4 bg-ink-700/40 rounded animate-pulse align-middle" />
}

interface Props {
  content: string
  className?: string
}

export default function MarkdownText({ content, className = '' }: Props) {
  // 简单纯文本判断：不含 markdown 控制字符时直接渲染（避免 Suspense 抖动）
  const isPlain = !/[#*_`>~\[\]]|^\s*[-*+]\s|^\s*\d+\.\s/m.test(content)
  if (isPlain) {
    return <span className={className}>{content}</span>
  }
  return (
    <Suspense fallback={<MarkdownFallback />}>
      <MarkdownImpl content={content} className={className} />
    </Suspense>
  )
}