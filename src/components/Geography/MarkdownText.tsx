/**
 * MarkdownText — 轻量 markdown 文本渲染（朝代描述、要点、事件等）
 *
 * 项目内已用 react-markdown + remark-gfm（详见 NotesPanel/NotePreview）。
 * 这里提供简化的默认渲染：支持 **加粗**、*斜体*、`行内代码`、列表、段落、换行。
 * 不支持标题（h1-h6）—朝代描述里没有标题层级。
 */
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
  className?: string
}

export default function MarkdownText({ content, className = '' }: Props) {
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