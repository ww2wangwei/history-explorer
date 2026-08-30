/**
 * inlineMd.tsx — 内联 Markdown 解析（极简子集）
 *
 * 支持：
 *   **bold**   → <strong>
 *   *italic*   → <em>
 *   `code`     → <code>
 *   [text](url) → <a href>
 *   \n         → 换行符（保留空白）
 *
 * 不支持：标题、列表、表格（这些是块级的，由 RichSection 类型分别处理）
 * 用途：让 traditions.ts 的 summary / fullContent / list items 可以加粗 / 行内 code / 链接
 */
import { type ReactNode } from 'react'

interface LinkInfo {
  index: number
  href: string
  text: string
  length: number
}

/**
 * 把 markdown 文本切成 token 流，然后渲染成 React 节点
 * 简化版的 AST：text / strong / em / code / link
 */
export function renderInline(text: string): ReactNode {
  if (!text) return null

  // 先抽出 [text](url) 链接成占位符，避免被 **/*/` 破坏
  const links: LinkInfo[] = []
  const placeholderText = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, t, h, idx) => {
    const token = `\u0001LINK${idx}\u0001`
    links.push({ index: idx, href: h, text: t, length: token.length })
    return token
  })

  // 用 split 拆 bold / italic / code：
  // 双星 **...**  > 单星 *...*  > 行内 `code`
  const result: ReactNode[] = []

  // 拆 **bold**
  const parts: Array<{ type: 'text' | 'bold' | 'em' | 'code' | 'link'; text: string; href?: string }> = []
  const boldRe = /\*\*([^\*\n]+?)\*\*/
  let rest = placeholderText
  while (true) {
    const m = boldRe.exec(rest)
    if (!m) {
      parts.push({ type: 'text', text: rest })
      break
    }
    if (m.index > 0) parts.push({ type: 'text', text: rest.slice(0, m.index) })
    parts.push({ type: 'bold', text: m[1] })
    rest = rest.slice(m.index + m[0].length)
  }

  // 在每个 part 内再拆 *em* 和 `code`
  const expanded: typeof parts = []
  for (const p of parts) {
    if (p.type !== 'text') {
      expanded.push(p)
      continue
    }
    let s = p.text
    const emRe = /\*([^\*\n]+?)\*/
    const codeRe = /`([^`\n]+?)`/
    while (true) {
      // 找最近的 em / code
      const emM = emRe.exec(s)
      const codeM = codeRe.exec(s)
      const nextM = pickEarliest(emM, codeM)
      if (!nextM) {
        if (s) expanded.push({ type: 'text', text: s })
        break
      }
      if (nextM.start > 0) expanded.push({ type: 'text', text: s.slice(0, nextM.start) })
      if (nextM.kind === 'em') {
        expanded.push({ type: 'em', text: nextM.text })
      } else {
        expanded.push({ type: 'code', text: nextM.text })
      }
      s = s.slice(nextM.start + nextM.length)
    }
  }

  // 替换 LINK 占位符为 link 节点
  let linkIdx = 0
  for (const p of expanded) {
    if (p.type === 'text') {
      // 拆分 LINK 占位符
      const text = p.text
      let buf = ''
      let i = 0
      while (i < text.length) {
        if (text.charCodeAt(i) === 0x01) {
          // 占位符开始
          const linkMatch = /\u0001LINK(\d+)\u0001/.exec(text.slice(i))
          if (linkMatch) {
            if (buf) {
              result.push(buf)
              buf = ''
            }
            const idx = parseInt(linkMatch[1], 10)
            const link = links.find(l => l.index === idx)
            if (link) {
              result.push(
                <a
                  key={`l${linkIdx++}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-200 underline decoration-dotted hover:text-amber-100"
                >
                  {link.text}
                </a>
              )
            }
            i += linkMatch[0].length
            continue
          }
        }
        buf += text[i]
        i++
      }
      if (buf) result.push(buf)
      continue
    }
    if (p.type === 'bold') {
      result.push(<strong key={`b${result.length}`} className="font-semibold text-parchment-50">{p.text}</strong>)
    } else if (p.type === 'em') {
      result.push(<em key={`e${result.length}`} className="italic text-parchment-50/95">{p.text}</em>)
    } else if (p.type === 'code') {
      result.push(
        <code key={`c${result.length}`} className="px-1 py-0.5 mx-0.5 rounded bg-ink-900/80 border border-ink-700/50 text-amber-200 font-mono text-[0.9em]">
          {p.text}
        </code>
      )
    }
  }

  return result
}

function pickEarliest(emM: RegExpExecArray | null, codeM: RegExpExecArray | null): null | {
  kind: 'em' | 'code'
  start: number
  length: number
  text: string
} {
  if (!emM && !codeM) return null
  if (!emM) return codeM ? { kind: 'code', start: codeM.index, length: codeM[0].length, text: codeM[1] } : null
  if (!codeM) return { kind: 'em', start: emM.index, length: emM[0].length, text: emM[1] }
  return emM.index <= codeM.index
    ? { kind: 'em', start: emM.index, length: emM[0].length, text: emM[1] }
    : { kind: 'code', start: codeM.index, length: codeM[0].length, text: codeM[1] }
}
