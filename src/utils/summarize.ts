/**
 * 智能摘要：根据实体类型抽取最贴合"百科卡片"的 1 句话
 * - 朝代 Era:        keyPoints[0] (剥离 **markdown**) → shortDesc → description 第一句
 * - 事件 HistoricalEvent: description 第一句（按句号/。拆）
 * - 战争 (HistoricalEvent with war fields): warBackground 第一句
 *
 * 长度上限默认 60 字，超出则按标点截断。
 */
import type { Era, HistoricalEvent } from '@/types'

const MAX_LEN = 60

function firstSentence(text: string, max = MAX_LEN): string {
  if (!text) return ''
  const stripped = text
    .replace(/\*\*/g, '')            // 去 markdown 加粗
    .replace(/^[「【\(（]/, '')        // 去前导标点
    .trim()
  // 在 max 范围内找最近的句号/。/！/？/!/? 截断
  const softBreaks = ['。', '！', '？', '.', '!', '?', '；', ';']
  for (const br of softBreaks) {
    const idx = stripped.indexOf(br)
    if (idx > 0 && idx <= max) return stripped.slice(0, idx + 1)
  }
  // 否则按 max 截断 + 省略号
  if (stripped.length > max) return stripped.slice(0, max) + '…'
  return stripped
}

export function summarizeEra(era: Pick<Era, 'keyPoints' | 'quickEvents' | 'shortDesc' | 'description'>): string {
  if (era.keyPoints?.length) {
    const first = firstSentence(era.keyPoints[0])
    if (first) return first
  }
  if (era.quickEvents?.length) {
    const first = firstSentence(era.quickEvents[0].desc ?? era.quickEvents[0].title)
    if (first) return first
  }
  if (era.shortDesc) return era.shortDesc
  return firstSentence(era.description)
}

export function summarizeEvent(event: Pick<HistoricalEvent, 'description' | 'warBackground'>): string {
  if (event.warBackground) {
    const first = firstSentence(event.warBackground)
    if (first) return first
  }
  return firstSentence(event.description)
}