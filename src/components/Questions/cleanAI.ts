/**
 * cleanAI.ts — 清理 LLM 输出中的杂质（防御 MiniMax / DeepSeek 等模型泄漏思考块）
 *
 *  - 去掉 <thinking>/<reasoning>/<thought>/<analysis>/<reflection>/<think> 等块
 *    - 整块（带闭合）也一并去除
 *    - 残破的单边标签（如 `{/think}`）也清掉
 *  - 去掉特殊分隔符 <|...|>
 *  - 返回 trim 后的纯文本
 *
 * 增量语义（流式）：
 *  - stripThinkingLive(buffer, delta) 会把"已确定可见"的内容从 buffer 中切出
 *  - 这样上游可以拿到完整 delta 但仍能保持残破块内部的字符不被显示
 */
const TAG_NAMES = 'thinking|thought|reasoning|analysis|reflection|think'
// 整块：起始标签 + 内容 + 可选闭合
const FULL_BLOCK_RE = new RegExp(`<\\s*(?:${TAG_NAMES})\\s*>[\\s\\S]*?(?:<\\s*\\/\\s*(?:${TAG_NAMES})\\s*>|$)`, 'gi')
// 单边标签（用于兜底上一行没匹配上的）
const SINGLE_TAG_RE = new RegExp(`<\\/?\\s*(?:${TAG_NAMES})\\b[^>]*>`, 'gi')

export function cleanAI(text: string): string {
  if (!text) return ''
  let t = text.replace(FULL_BLOCK_RE, '')
  t = t.replace(SINGLE_TAG_RE, '')
  t = t.replace(/<\|.*?\|>/gs, '')
  return t.trim()
}

/**
 * 增量版：把 buffer 中"已经确认安全可显示"的部分切出来（不含思考块内部字符）。
 * 用法：safe = stripThinkingLive(buffer)
 *
 * 策略：
 *  - 先尝试将 buffer 匹配 FULL_BLOCK_RE 整块；命中则把"整块替换为空字符串"，并试着再从下一个开始位置看是否还有第二块
 *  - 如果碰到只开了 <thinking> 没闭合的情况（流式还没拿到 /thinking）：则 visible = buffer 起点到首个开标签为止
 *  - 兜底再过一遍 SINGLE_TAG_RE
 */
export function stripThinkingLive(raw: string): string {
  if (!raw) return ''
  // 命中整块的：定位全部块，统一切掉
  const fullRe = new RegExp(`<\\s*(?:${TAG_NAMES})\\s*>[\\s\\S]*?(?:<\\s*\\/\\s*(?:${TAG_NAMES})\\s*>|$)`, 'gi')
  let visible = raw.replace(fullRe, '')
  // 还得检查"有开标签但没闭合"：这种情况下，上一步把从开标签往后的所有内容都删掉了，这里把它当作"还没切"做一次细节处理
  if (visible === raw) {
    // 没有整块匹配：检查是否有裸开标签 + 之后的"未确认"内容
    const openRe = new RegExp(`<\\s*(?:${TAG_NAMES})\\s*>`, 'i')
    const idx = raw.search(openRe)
    if (idx >= 0) visible = raw.slice(0, idx)
    else visible = raw
  }
  // 兜底：去掉所有残破的单边标签
  visible = visible.replace(SINGLE_TAG_RE, '')
  return visible
}