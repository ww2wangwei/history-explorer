/**
 * parseAI.ts — 解析「全问题」板块 AI 的结构化输出
 *
 *  - parseScore：解析评分提示词的固定标记行
 *  - parseGeneratedQuestion：解析 AI 生成题的 JSON
 */
import type { Question } from '@/types/questions'
import { roundsForDifficulty } from '@/types/questions'

/** 解析 AI 评分输出 */
export function parseScore(text: string): {
  total: number
  dims: Record<string, number>
  summary: string
} | null {
  const get = (key: string): number | null => {
    const m = text.match(new RegExp(`【${key}】\\s*(\\d{1,3})`))
    if (!m) return null
    const n = Number(m[1])
    return n >= 0 && n <= 100 ? n : null
  }

  const total = get('总分')
  const summaryMatch = text.match(/【总评】\s*([\s\S]+)$/)
  if (total === null) return null

  const dims: Record<string, number> = {}
  for (const dim of ['史实准确', '思考深度', '论证逻辑', '发散视角']) {
    const v = get(dim)
    if (v !== null) dims[dim] = v
  }
  return {
    total,
    dims,
    summary: summaryMatch ? summaryMatch[1].trim() : '',
  }
}

interface RawGenerated {
  title?: string
  style?: string
  region?: string
  difficulty?: number | string
  opening?: string
  hints?: string[]
}

export function parseGeneratedQuestion(text: string): Question | null {
  // 找到第一个 { 到最后一个 }，去掉可能的 markdown 代码块前缀
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null

  let raw: RawGenerated
  try {
    raw = JSON.parse(text.slice(start, end + 1)) as RawGenerated
  } catch {
    // 尝试去掉 ```json 包裹 / 尾随逗号等常见问题后再解析一次
    const cleaned = text
      .replace(/```(?:json)?/gi, '')
      .replace(/^```|```$/gm, '')
      .replace(/,\s*}/g, '}')
      .trim()
    const s2 = cleaned.indexOf('{')
    const e2 = cleaned.lastIndexOf('}')
    if (s2 === -1 || e2 === -1) return null
    try {
      raw = JSON.parse(cleaned.slice(s2, e2 + 1)) as RawGenerated
    } catch {
      return null
    }
  }

  if (!raw.title || !raw.opening || !raw.style || !raw.region) return null

  const difficultyVal =
    typeof raw.difficulty === 'number'
      ? raw.difficulty
      : Number(String(raw.difficulty ?? '2').replace(/[^\d]/g, '')) || 2
  const difficulty = (Math.min(3, Math.max(1, difficultyVal)) || 2) as 1 | 2 | 3

  return {
    id: '__temp__',
    title: String(raw.title).trim(),
    style: normalizeStyle(raw.style),
    icon: iconForStyle(normalizeStyle(raw.style)),
    region: normalizeRegion(raw.region),
    difficulty,
    opening: String(raw.opening).trim(),
    hints: Array.isArray(raw.hints)
      ? raw.hints.map(h => String(h)).filter(Boolean).slice(0, 4)
      : [],
    maxRounds: roundsForDifficulty(difficulty),
    aiGenerated: true,
  }
}

function normalizeStyle(s: string): Question['style'] {
  if (s.includes('趣味')) return '趣味性'
  if (s.includes('启发')) return '启发性'
  return '思考性'
}

function normalizeRegion(s: string): Question['region'] {
  return s.includes('chi') ? 'china' : 'world'
}

export function iconForStyle(style: Question['style']): string {
  if (style === '趣味性') return '🎭'
  if (style === '启发性') return '💡'
  return '🧭'
}