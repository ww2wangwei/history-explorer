/**
 * 关键词高亮工具
 *
 * 把文本按搜索关键词拆分成 React 节点数组，匹配部分用 <mark> 包裹
 *
 * 特性：
 * - 按空格拆分多关键词（AND 语义）
 * - 不区分大小写
 * - 转义正则特殊字符
 * - 长关键词优先（避免短词截断长词）
 * - 多关键词独立高亮（不重叠）
 */
import type { ReactNode } from 'react'

/**
 * 从搜索 query 中提取非空关键词（小写、去重）
 */
export function extractKeywords(query: string): string[] {
  if (!query) return []
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/\s+/)
        .filter(k => k.length > 0),
    ),
  )
}

/**
 * 转义正则特殊字符
 */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 把文本按关键词拆分，匹配部分用 <mark> 包裹
 *
 * @param text 原文
 * @param query 搜索关键词（按空格拆分多关键词）
 * @returns React 节点数组（text 节点 + <mark> 节点交替）
 */
export function highlightText(text: string, query: string): ReactNode {
  const keywords = extractKeywords(query)
  if (keywords.length === 0 || !text) return text

  // 按长度 desc 排序，避免短词截断长词（如搜"尚书省"不应被"尚"截断）
  const sorted = [...keywords].sort((a, b) => b.length - a.length)
  const escaped = sorted.map(escapeRegExp)

  // 用捕获组 split：奇数索引是匹配项
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(pattern)

  return parts.map((part, i) => {
    // 偶数索引是非匹配（text node），奇数索引是匹配（<mark>）
    if (i % 2 === 1) {
      return (
        <mark
          key={i}
          className="bg-bronze-600/40 text-parchment-50 rounded px-0.5"
        >
          {part}
        </mark>
      )
    }
    return part
  })
}