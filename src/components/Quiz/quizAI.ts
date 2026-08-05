/**
 * Quiz AI 出题工具
 *
 * 复用 useAIStore 的 apiKey + apiConfig（Anthropic / OpenAI 兼容如 Minimax）
 * 通过 utils/aiStream 统一处理协议与流式解析。
 */
import type { AIApiConfig } from '@/store/useAIStore'
import { streamAI } from '@/utils/aiStream'
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

export const QUIZ_AI_MAX_TOKENS = 4096

/** 调用 LLM 流式，拼接完整字符串（向后兼容：不支持 signal） */
export function callAIStream(
  apiKey: string,
  apiConfig: AIApiConfig,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  onDelta: (text: string) => void,
): Promise<void> {
  return streamAI({
    protocol: apiConfig.protocol,
    apiKey,
    baseUrl: apiConfig.baseUrl,
    model: apiConfig.model,
    messages,
    maxTokens: QUIZ_AI_MAX_TOKENS,
    disableThinking: apiConfig.disableThinking,
    onDelta,
  }).promise.then(() => undefined)
}

/**
 * 调用 LLM 流式,支持外部 AbortSignal(组件卸载/切页/重新点击前中止)。
 * 取消时不调用方区分 AbortError(由调用方处理,不显示红色失败提示)。
 */
export function callAIStreamWithSignal(
  apiKey: string,
  apiConfig: AIApiConfig,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamAI({
    protocol: apiConfig.protocol,
    apiKey,
    baseUrl: apiConfig.baseUrl,
    model: apiConfig.model,
    messages,
    maxTokens: QUIZ_AI_MAX_TOKENS,
    signal,
    disableThinking: apiConfig.disableThinking,
    onDelta,
  }).promise.then(() => undefined)
}
