/**
 * 笔记导入/导出工具
 *
 * 导出：把笔记数组序列化为带 schema 头的 JSON 文件，浏览器下载
 * 导入：解析 JSON 文件，校验 schema，合并到现有 store
 *
 * 文件格式：
 * {
 *   schema: 'history-explorer-notes',
 *   version: 1,
 *   exportedAt: ISO 时间字符串,
 *   appVersion: '0.1.0',
 *   noteCount: 笔记条数,
 *   notes: Note[]
 * }
 */
import type { Note } from '@/types/notes'

interface ExportFile {
  schema: 'history-explorer-notes'
  version: 1
  exportedAt: string
  appVersion: string
  noteCount: number
  notes: Note[]
}

/** 生成文件名：history-explorer-notes-YYYYMMDD-HHmm.json */
function generateFilename(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `history-explorer-notes-${y}${m}${d}-${hh}${mm}.json`
}

/** 把笔记数组序列化为 Blob */
export function exportNotesToJson(notes: Note[]): Blob {
  const data: ExportFile = {
    schema: 'history-explorer-notes',
    version: 1,
    exportedAt: new Date().toISOString(),
    appVersion: '0.1.0',
    noteCount: notes.length,
    notes,
  }
  const json = JSON.stringify(data, null, 2)
  return new Blob([json], { type: 'application/json' })
}

/** 触发浏览器下载笔记 JSON 文件 */
export function downloadNotesJson(notes: Note[], filename?: string): string {
  const blob = exportNotesToJson(notes)
  const url = URL.createObjectURL(blob)
  const finalName = filename ?? generateFilename()
  const a = document.createElement('a')
  a.href = url
  a.download = finalName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // 延迟 revoke，让浏览器有足够时间完成下载
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return finalName
}

/** 解析结果：成功返回 notes 数组；失败返回错误信息 */
export type ParseResult =
  | { ok: true; notes: Note[]; meta: { exportedAt: string; noteCount: number } }
  | { ok: false; error: string }

/** 解析 JSON 字符串为笔记数组 */
export function parseNotesJson(jsonText: string): ParseResult {
  let data: any
  try {
    data = JSON.parse(jsonText)
  } catch (e) {
    return { ok: false, error: `JSON 解析失败：${(e as Error).message}` }
  }

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: '文件格式错误：根对象不是对象' }
  }
  if (data.schema !== 'history-explorer-notes') {
    return { ok: false, error: 'schema 不匹配，期望 "history-explorer-notes"' }
  }
  if (data.version !== 1) {
    return { ok: false, error: `不支持的版本：${data.version}` }
  }
  if (!Array.isArray(data.notes)) {
    return { ok: false, error: 'notes 字段不是数组' }
  }

  const validNotes: Note[] = []
  let failedCount = 0
  for (const n of data.notes) {
    if (isValidNote(n)) {
      validNotes.push(n)
    } else {
      failedCount++
    }
  }

  return {
    ok: true,
    notes: validNotes,
    meta: {
      exportedAt: data.exportedAt ?? '',
      noteCount: data.noteCount ?? validNotes.length,
    },
  }
}

/** 校验单条笔记数据合法性 */
function isValidNote(n: any): n is Note {
  return (
    typeof n?.id === 'string' &&
    n.id.length > 0 &&
    (n?.target?.kind === 'era' || n?.target?.kind === 'event') &&
    typeof n?.target?.id === 'string' &&
    n.target.id.length > 0 &&
    typeof n?.title === 'string' &&
    typeof n?.content === 'string' &&
    typeof n?.createdAt === 'number' &&
    typeof n?.updatedAt === 'number'
  )
}

/** 冲突策略 */
export type ConflictStrategy = 'overwrite' | 'skip'

export interface ImportResult {
  imported: number   // 新建条数
  overwritten: number // 同 ID 覆盖条数
  skipped: number    // 同 ID 跳过条数
  invalid: number    // 数据不合法条数
}

/**
 * 应用导入策略到现有 notes，返回新的 notes 字典和结果统计
 * 不操作 store，由调用方决定如何更新 store
 */
export function applyImport(
  existingNotes: Record<string, Note>,
  parsedNotes: Note[],
  strategy: ConflictStrategy,
): { notes: Record<string, Note>; result: ImportResult } {
  const result: ImportResult = { imported: 0, overwritten: 0, skipped: 0, invalid: 0 }
  const newNotes = { ...existingNotes }

  for (const inc of parsedNotes) {
    if (!isValidNote(inc)) {
      result.invalid++
      continue
    }
    if (newNotes[inc.id]) {
      // 冲突
      if (strategy === 'overwrite') {
        newNotes[inc.id] = inc
        result.overwritten++
      } else {
        result.skipped++
      }
    } else {
      newNotes[inc.id] = inc
      result.imported++
    }
  }

  return { notes: newNotes, result }
}

/** 检查导入数据的冲突数（不修改任何状态） */
export function countConflicts(
  existingNotes: Record<string, Note>,
  parsedNotes: Note[],
): number {
  let count = 0
  for (const inc of parsedNotes) {
    if (existingNotes[inc.id]) count++
  }
  return count
}