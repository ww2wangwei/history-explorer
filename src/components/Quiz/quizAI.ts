/**
 * Quiz AI 出题工具
 *
 * 复用 useAIStore 的 apiKey + apiConfig（Anthropic / OpenAI 兼容如 Minimax）
 * 不需要重新写 streaming fetch
 */
import type { AIApiConfig } from '@/store/useAIStore'
import erasData from '@/data/eras.json'
import type { Difficulty } from '@/types/quiz'

type Era = (typeof erasData)[number]
const eras = erasData as Era[]

/** 构造 AI 出题 prompt */
export function buildQuizGenPrompt(era: Era, difficulty: Difficulty, count: number): string {
  return `你是一个中国古代和世界历史出题专家。

任务：为朝代「${era.name}（${era.startYear < 0 ? `BC ${-era.startYear}` : era.startYear} ~ ${era.endYear < 0 ? `BC ${-era.endYear}` : era.endYear}）」出 ${count} 道选择题。

要求：
- 难度：${difficulty}★（${difficulty}★ = ${
    difficulty === 1 ? '基础事实（年代/人物/地点）' :
    difficulty === 2 ? '多事实（多选项/多时段）' :
    difficulty === 3 ? '时间轴（按顺序）' :
    difficulty === 4 ? '因果分析（为什么）' :
    '跨朝代综合（关联）'
  }）
- 每道题 4 个选项
- 答案用 0-3 索引
- 给出一句话解释（中文）
- 题目和选项都用中文
- 如果有重要事件/人物请覆盖

朝代背景信息：
- 简介：${era.shortDesc || era.description?.slice(0, 200) || ''}
- 都城：${era.capital ? `${era.capital[0]}°E, ${era.capital[1]}°N` : '未知'}
- 区域：${era.region}

输出格式（严格按此 JSON 数组，不要其他文字）：
[
  {
    "prompt": "题目正文（中文）",
    "options": ["A 选项", "B 选项", "C 选项", "D 选项"],
    "answer": 0,
    "explanation": "解释（中文一句话）",
    "category": "memory 或 analysis 或 comparison"
  },
  ...
]`
}

/** 调用 LLM 流式，拼接完整字符串 */
export async function callAIStream(
  apiKey: string,
  apiConfig: AIApiConfig,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  onDelta: (text: string) => void,
): Promise<void> {
  const stripSlash = (s: string) => s.replace(/\/$/, '')
  const stripV1 = (s: string) => s.replace(/\/v1$/, '')
  const baseClean = stripV1(stripSlash(apiConfig.baseUrl))
  const MAX_TOKENS = 4096

  let url: string, headers: Headers, body: any
  if (apiConfig.protocol === 'anthropic') {
    url = `${baseClean}/v1/messages`
    headers = new Headers({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    })
    const sysMsg = messages.find(m => m.role === 'system')
    const userMsgs = messages.filter(m => m.role !== 'system')
    body = {
      model: apiConfig.model,
      max_tokens: MAX_TOKENS,
      system: sysMsg?.content ?? '你是一个历史出题专家。',
      messages: userMsgs,
      stream: true,
    }
  } else {
    url = `${baseClean}/v1/chat/completions`
    headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    })
    body = {
      model: apiConfig.model,
      max_tokens: MAX_TOKENS,
      messages,
      stream: true,
    }
  }

  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`API ${response.status}: ${errText || response.statusText}`)
  }
  if (!response.body) throw new Error('无响应内容')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') return
      try {
        const json = JSON.parse(data)
        if (apiConfig.protocol === 'anthropic') {
          if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
            onDelta(json.delta.text)
          }
        } else {
          const delta = json.choices?.[0]?.delta?.content
          if (typeof delta === 'string' && delta.length > 0) onDelta(delta)
        }
      } catch { /* 忽略解析错误 */ }
    }
  }
}
