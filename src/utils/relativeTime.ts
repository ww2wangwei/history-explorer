/**
 * 相对时间格式化
 * 把时间戳转为"刚刚"/"X 分钟前"/"X 小时前"/"X 天前"等本地化文案
 */

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

/** 简单中文本地化文案 */
export function formatRelativeTime(ts: number, now: number = Date.now()): string {
  const diff = now - ts
  if (diff < 0) return '刚刚' // 防御性：未来时间戳
  if (diff < 30 * SECOND) return '刚刚'
  if (diff < HOUR) {
    const m = Math.floor(diff / MINUTE)
    return `${m} 分钟前`
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR)
    return `${h} 小时前`
  }
  if (diff < WEEK) {
    const d = Math.floor(diff / DAY)
    return `${d} 天前`
  }
  if (diff < MONTH) {
    const w = Math.floor(diff / WEEK)
    return `${w} 周前`
  }
  if (diff < YEAR) {
    const mo = Math.floor(diff / MONTH)
    return `${mo} 个月前`
  }
  const y = Math.floor(diff / YEAR)
  return `${y} 年前`
}

/** 取笔记显示标题：用户标题为空时取正文前 N 字 */
export function getNoteDisplayTitle(title: string, content: string, maxLen = 24): string {
  const t = title.trim()
  if (t) return t
  const c = content.replace(/^#+\s*/gm, '').replace(/[*_`>]/g, '').trim()
  if (!c) return '（无标题）'
  return c.slice(0, maxLen) + (c.length > maxLen ? '…' : '')
}

/** 取笔记摘要：取正文前 N 字（去除 markdown 标记） */
export function getNoteExcerpt(content: string, maxLen = 60): string {
  const c = content
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*?(.+?)\*\*?/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim()
  if (!c) return '（空笔记）'
  return c.slice(0, maxLen) + (c.length > maxLen ? '…' : '')
}