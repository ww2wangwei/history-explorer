/**
 * 笔记 Markdown 预览
 *
 * 使用 react-markdown + remark-gfm，支持：
 * - 标题（# / ## / ###）
 * - 段落、加粗、斜体、行内代码
 * - 列表、任务列表（GFM）
 * - 引用
 * - 表格（GFM）
 * - 代码块
 * - 链接（自动 target=_blank）
 *
 * 自定义渲染组件采用项目配色（ink / bronze / parchment）
 */
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
}

export default function NotePreview({ content }: Props) {
  if (!content.trim()) {
    return (
      <div className="text-ink-500 italic text-sm py-4 text-center">
        （无内容）
      </div>
    )
  }

  return (
    <div className="note-preview text-parchment-100 text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node: _node, ...props }) => (
            <h1
              {...props}
              className="font-serif text-lg text-bronze-400 mt-3 mb-1.5 border-b border-ink-600 pb-1"
            />
          ),
          h2: ({ node: _node, ...props }) => (
            <h2
              {...props}
              className="font-serif text-base text-bronze-400 mt-2.5 mb-1"
            />
          ),
          h3: ({ node: _node, ...props }) => (
            <h3
              {...props}
              className="font-serif text-sm text-bronze-400 mt-2 mb-1"
            />
          ),
          h4: ({ node: _node, ...props }) => (
            <h4
              {...props}
              className="font-serif text-sm text-bronze-500 mt-2 mb-1"
            />
          ),
          p: ({ node: _node, ...props }) => (
            <p {...props} className="my-1.5 leading-relaxed" />
          ),
          a: ({ node: _node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-bronze-400 hover:underline"
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
          // GFM 任务列表 checkbox
          input: ({ node: _node, type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  {...props}
                  type="checkbox"
                  checked={checked}
                  readOnly
                  disabled
                  className="mr-1.5 accent-bronze-500 align-middle"
                />
              )
            }
            return <input {...props} type={type} />
          },
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-2 border-bronze-500/60 pl-3 my-2 italic text-ink-300"
            />
          ),
          code: ({ node: _node, ...props }) => (
            <code
              {...props}
              className="bg-ink-700 px-1 py-0.5 rounded-lg text-bronze-400 text-xs font-mono"
            />
          ),
          pre: ({ node: _node, ...props }) => (
            <pre
              {...props}
              className="bg-ink-800 border border-ink-600 rounded-lg p-2 my-2 overflow-x-auto text-xs"
            />
          ),
          table: ({ node: _node, ...props }) => (
            <table
              {...props}
              className="border-collapse border border-ink-600 my-2 text-xs w-full"
            />
          ),
          th: ({ node: _node, ...props }) => (
            <th
              {...props}
              className="border border-ink-600 px-2 py-1 bg-ink-700 text-bronze-400 font-medium"
            />
          ),
          td: ({ node: _node, ...props }) => (
            <td
              {...props}
              className="border border-ink-600 px-2 py-1 text-parchment-100"
            />
          ),
          hr: ({ node: _node, ...props }) => (
            <hr {...props} className="border-ink-600 my-3" />
          ),
          strong: ({ node: _node, ...props }) => (
            <strong {...props} className="font-semibold text-bronze-400" />
          ),
          em: ({ node: _node, ...props }) => (
            <em {...props} className="italic text-parchment-200" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}