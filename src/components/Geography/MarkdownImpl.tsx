/**
 * MarkdownImpl — 重型 markdown 渲染器（按需 chunk）
 *
 * 仅在 MarkdownText 检测到内容含 markdown 控制字符时才会触发 lazy import。
 * 把 react-markdown + remark-gfm 隔离到独立 chunk，让 24 张卡网格的初次渲染
 * 完全不下载这一坨 ~200KB 的依赖。
 */
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
  className?: string
}

export default function MarkdownImpl({ content, className = '' }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node: _node, ...props }) => (
            <p {...props} className="leading-relaxed [&:not(:first-child)]:mt-1.5" />
          ),
          strong: ({ node: _node, ...props }) => (
            <strong {...props} className="font-semibold text-vermilion-300" />
          ),
          em: ({ node: _node, ...props }) => (
            <em {...props} className="italic text-parchment-200" />
          ),
          code: ({ node: _node, ...props }) => (
            <code
              {...props}
              className="bg-ink-700 px-1 py-0.5 rounded text-vermilion-300 text-xs font-mono"
            />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul {...props} className="list-disc list-inside my-1 space-y-0.5" />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol {...props} className="list-decimal list-inside my-1 space-y-0.5" />
          ),
          li: ({ node: _node, ...props }) => (
            <li {...props} className="leading-relaxed" />
          ),
          a: ({ node: _node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-vermilion-300 hover:underline"
            />
          ),
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-2 border-vermilion-500/60 pl-3 my-2 italic text-ink-300"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}