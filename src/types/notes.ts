/**
 * 个人笔记系统类型定义
 */

/** 笔记关联的目标类型 */
export type NoteTargetKind = 'era' | 'event'

/** 一条笔记 */
export interface Note {
  /** 唯一 ID（crypto.randomUUID） */
  id: string
  /** 关联的目标 */
  target: {
    kind: NoteTargetKind
    id: string
  }
  /** 用户起的标题（可空：自动取内容前 30 字） */
  title: string
  /** Markdown 正文 */
  content: string
  /** 创建时间戳（ms） */
  createdAt: number
  /** 最后更新时间戳（ms） */
  updatedAt: number
}