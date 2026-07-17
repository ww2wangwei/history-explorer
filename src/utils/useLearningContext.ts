/**
 * useLearningContext — 收集"用户已学过的相关上下文"作为 AI 对话的补充 system prompt
 *
 * 用法：
 *   const { contextString, summary } = useLearningContext(person.eraIds)
 *   setPersonaPrompt(persona + contextString)
 *
 * 数据来源：
 *   - 该人物关联的朝代（输入参数）
 *   - 用户在这些朝代上写的笔记（最近 3 条）
 *   - 用户对这些朝代的复习卡（已掌握 / 待复习 数量）
 *   - 用户的学习路径进度（已访问/未访问）
 *   - 用户已了解的相关人物
 */
import { useMemo } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { useCardsStore } from '@/store/useCardsStore'
import { useLearningPathStore } from '@/store/useLearningPathStore'
import { isDue } from '@/utils/sm2'
import peopleData from '@/data/people.json'
import erasData from '@/data/eras.json'
import type { Era, HistoricalFigure } from '@/types'

const people = peopleData as HistoricalFigure[]
const eras = erasData as Era[]

export interface LearningContext {
  /** 拼到 personaPrompt 后的中文段落 */
  contextString: string
  /** 人读简短摘要（用于 UI 徽章） */
  summary: string
  /** 调试用：原始数据 */
  debug: {
    eras: Era[]
    relatedNotes: number
    masteredEras: number
    dueCards: number
    relatedFiguresKnown: number
  }
}

/**
 * @param eraIds 焦点人物所关联的朝代 id 列表
 * @param focusFigureId 可选：焦点人物 id，用于排除"自己"以及找"已了解的相关人物"
 */
export function useLearningContext(eraIds: string[], focusFigureId?: string): LearningContext {
  const notes = useNotesStore(s => s.notes)
  const cards = useCardsStore(s => s.cards)
  const visitedEraIds = useLearningPathStore(s => s.progressByPath.timeline.visitedEraIds)
  const visitedFigureIds = useLearningPathStore(s => s.progressByPath.allFigures.visitedFigureIds ?? [])

  return useMemo(() => {
    // 1. 找到相关朝代
    const relatedEras = eraIds
      .map(id => eras.find(e => e.id === id))
      .filter((e): e is Era => Boolean(e))

    // 2. 这些朝代上的笔记（按时间倒序取 3 条）
    const relatedNotes = Object.values(notes)
      .filter(n => n.target.kind === 'era' && eraIds.includes(n.target.id))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 3)

    // 3. 这些朝代上的复习卡（按 SM-2 状态统计）
    const now = Date.now()
    const relatedCards = Object.values(cards).filter(
      c => c.target.kind === 'era' && eraIds.includes(c.target.id),
    )
    // 掌握判定：interval >= 21 天（粗略阈值）
    const masteredEras = new Set(
      relatedCards.filter(c => c.interval >= 21).map(c => c.target.id),
    )
    const dueCards = relatedCards.filter(c => isDue(c, now)).length

    // 4. 同一朝代里已了解的其他人物
    const relatedFiguresKnown = people.filter(p =>
      p.id !== focusFigureId &&
      p.eraIds.some(eid => eraIds.includes(eid)) &&
      visitedFigureIds.includes(p.id),
    )

    // 5. 拼装 system prompt 片段
    const lines: string[] = []
    if (relatedEras.length > 0) {
      const eraNames = relatedEras.map(e => e.name).join('、')
      const visited = relatedEras.filter(e => visitedEraIds.includes(e.id))
      if (visited.length > 0) {
        lines.push(`【用户已学过】${visited.map(e => e.name).join('、')}`)
      }
      const notVisited = relatedEras.filter(e => !visitedEraIds.includes(e.id))
      if (notVisited.length > 0) {
        lines.push(`【用户尚未学习】${notVisited.map(e => e.name).join('、')}`)
      }
    }

    if (masteredEras.size > 0) {
      const masteredEraNames = relatedEras
        .filter(e => masteredEras.has(e.id))
        .map(e => e.name)
      lines.push(`【已掌握复习卡】${masteredEraNames.join('、')}（SM-2 间隔 ≥ 21 天）`)
    }

    if (dueCards > 0) {
      lines.push(`【有 ${dueCards} 张相关朝代的卡片待复习】`)
    }

    if (relatedNotes.length > 0) {
      const noteLines = relatedNotes.map(n => {
        const eraName = eras.find(e => e.id === n.target.id)?.name ?? n.target.id
        const preview = (n.content || n.title || '').slice(0, 80).replace(/\n/g, ' ')
        return `  - [${eraName}] ${n.title || '(无标题)'}：${preview}${(n.content || '').length > 80 ? '…' : ''}`
      })
      lines.push(`【用户最近的笔记】\n${noteLines.join('\n')}`)
    }

    if (relatedFiguresKnown.length > 0) {
      const names = relatedFiguresKnown.slice(0, 5).map(p => `${p.name}（${p.role.split(' / ')[0]}）`).join('、')
      lines.push(`【用户已了解的相关人物】${names}${relatedFiguresKnown.length > 5 ? ` 等 ${relatedFiguresKnown.length} 人` : ''}`)
    }

    if (lines.length === 0) {
      return {
        contextString: '',
        summary: '暂无学习上下文',
        debug: { eras: relatedEras, relatedNotes: 0, masteredEras: 0, dueCards: 0, relatedFiguresKnown: 0 },
      }
    }

    const contextString = '\n\n【关于用户的学习状态 — 请在回答中适当引用，让对话更个性化】\n' + lines.join('\n')

    // 摘要：给 UI 显示（不超过 80 字）
    const summaryParts: string[] = []
    if (relatedEras.length > 0) summaryParts.push(`涵盖 ${relatedEras.length} 个朝代`)
    if (relatedNotes.length > 0) summaryParts.push(`${relatedNotes.length} 条笔记`)
    if (dueCards > 0) summaryParts.push(`${dueCards} 张待复习`)
    if (relatedFiguresKnown.length > 0) summaryParts.push(`${relatedFiguresKnown.length} 位已了解人物`)
    const summary = summaryParts.join(' · ') || '上下文已加载'

    return {
      contextString,
      summary,
      debug: {
        eras: relatedEras,
        relatedNotes: relatedNotes.length,
        masteredEras: masteredEras.size,
        dueCards,
        relatedFiguresKnown: relatedFiguresKnown.length,
      },
    }
  }, [eraIds, focusFigureId, notes, cards, visitedEraIds, visitedFigureIds])
}

/**
 * useAllLearningContexts — 一次性为所有人物建好 context map
 *
 * 用在 FiguresOverview：避免在卡片点击回调里调用 hook（违反 rules of hooks）
 * 返回 { [figureId]: LearningContext }
 */
export function useAllLearningContexts(): Record<string, LearningContext> {
  const notes = useNotesStore(s => s.notes)
  const cards = useCardsStore(s => s.cards)
  const visitedEraIds = useLearningPathStore(s => s.progressByPath.timeline.visitedEraIds)
  const visitedFigureIds = useLearningPathStore(s => s.progressByPath.allFigures.visitedFigureIds ?? [])

  return useMemo(() => {
    const map: Record<string, LearningContext> = {}
    people.forEach(person => {
      // 直接复用上面 useLearningContext 的逻辑（内联避免循环依赖）
      const eraIds = person.eraIds
      const relatedEras = eraIds
        .map(id => eras.find(e => e.id === id))
        .filter((e): e is Era => Boolean(e))
      const relatedNotes = Object.values(notes)
        .filter(n => n.target.kind === 'era' && eraIds.includes(n.target.id))
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 3)
      const now = Date.now()
      const relatedCards = Object.values(cards).filter(
        c => c.target.kind === 'era' && eraIds.includes(c.target.id),
      )
      const masteredEras = new Set(relatedCards.filter(c => c.interval >= 21).map(c => c.target.id))
      const dueCards = relatedCards.filter(c => isDue(c, now)).length
      const relatedFiguresKnown = people.filter(p =>
        p.id !== person.id &&
        p.eraIds.some(eid => eraIds.includes(eid)) &&
        visitedFigureIds.includes(p.id),
      )

      const lines: string[] = []
      if (relatedEras.length > 0) {
        const visited = relatedEras.filter(e => visitedEraIds.includes(e.id))
        if (visited.length > 0) lines.push(`【用户已学过】${visited.map(e => e.name).join('、')}`)
        const notVisited = relatedEras.filter(e => !visitedEraIds.includes(e.id))
        if (notVisited.length > 0) lines.push(`【用户尚未学习】${notVisited.map(e => e.name).join('、')}`)
      }
      if (masteredEras.size > 0) {
        const names = relatedEras.filter(e => masteredEras.has(e.id)).map(e => e.name)
        lines.push(`【已掌握复习卡】${names.join('、')}（SM-2 间隔 ≥ 21 天）`)
      }
      if (dueCards > 0) lines.push(`【有 ${dueCards} 张相关朝代的卡片待复习】`)
      if (relatedNotes.length > 0) {
        const noteLines = relatedNotes.map(n => {
          const eraName = eras.find(e => e.id === n.target.id)?.name ?? n.target.id
          const preview = (n.content || n.title || '').slice(0, 80).replace(/\n/g, ' ')
          return `  - [${eraName}] ${n.title || '(无标题)'}：${preview}${(n.content || '').length > 80 ? '…' : ''}`
        })
        lines.push(`【用户最近的笔记】\n${noteLines.join('\n')}`)
      }
      if (relatedFiguresKnown.length > 0) {
        const names = relatedFiguresKnown.slice(0, 5).map(p => `${p.name}（${p.role.split(' / ')[0]}）`).join('、')
        lines.push(`【用户已了解的相关人物】${names}${relatedFiguresKnown.length > 5 ? ` 等 ${relatedFiguresKnown.length} 人` : ''}`)
      }

      const contextString = lines.length === 0
        ? ''
        : '\n\n【关于用户的学习状态 — 请在回答中适当引用，让对话更个性化】\n' + lines.join('\n')

      const summaryParts: string[] = []
      if (relatedEras.length > 0) summaryParts.push(`涵盖 ${relatedEras.length} 个朝代`)
      if (relatedNotes.length > 0) summaryParts.push(`${relatedNotes.length} 条笔记`)
      if (dueCards > 0) summaryParts.push(`${dueCards} 张待复习`)
      if (relatedFiguresKnown.length > 0) summaryParts.push(`${relatedFiguresKnown.length} 位已了解人物`)
      const summary = summaryParts.join(' · ') || '上下文已加载'

      map[person.id] = {
        contextString,
        summary,
        debug: {
          eras: relatedEras,
          relatedNotes: relatedNotes.length,
          masteredEras: masteredEras.size,
          dueCards,
          relatedFiguresKnown: relatedFiguresKnown.length,
        },
      }
    })
    return map
  }, [notes, cards, visitedEraIds, visitedFigureIds])
}
