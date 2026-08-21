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
import type { Era, HistoricalFigure } from '@/types'

// 🎯 性能优化：people.json (58KB) + eras.json (356KB) 改动态 import，
//   拆出独立 chunk，只在用户首次进入需要 AI 上下文时才下载（不进主 bundle）。
//   数据未到位前 hook 返回"空上下文"，AI 第一次对话无个性化，几毫秒后正常。
interface LearningData {
  people: HistoricalFigure[]
  eras: Era[]
}

let _data: LearningData | null = null
let _dataPromise: Promise<LearningData> | null = null

function ensureData(): LearningData | null {
  if (_data) return _data
  if (!_dataPromise) {
    _dataPromise = Promise.all([
      import('@/data/people.json'),
      import('@/data/eras.json'),
    ]).then(([p, e]) => {
      _data = {
        people: p.default as HistoricalFigure[],
        eras: e.default as Era[],
      }
      return _data
    })
  }
  return null
}

// 模块加载即触发加载（不阻塞主线程）
ensureData()

const EMPTY: LearningData = { people: [], eras: [] }
function getData(): LearningData {
  return _data ?? EMPTY
}

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

const EMPTY_CONTEXT: LearningContext = {
  contextString: '',
  summary: '加载中…',
  debug: { eras: [], relatedNotes: 0, masteredEras: 0, dueCards: 0, relatedFiguresKnown: 0 },
}
const EMPTY_CONTEXT_MAP: Record<string, LearningContext> = {}

/**
 * @param eraIds 焦点人物所关联的朝代 id 列表
 * @param focusFigureId 可选：焦点人物 id，用于排除"自己"以及找"已了解的相关人物"
 */
export function useLearningContext(eraIds: string[], focusFigureId?: string): LearningContext {
  const notes = useNotesStore(s => s.notes)
  const cards = useCardsStore(s => s.cards)
  const visitedEraIds = useLearningPathStore(s => s.progressByPath.timeline.visitedEraIds)
  const visitedFigureIds = useLearningPathStore(s => s.progressByPath.allFigures.visitedFigureIds ?? [])

  // 数据未加载完时返回空 context（首次几毫秒）
  if (!_data) return EMPTY_CONTEXT

  const { people, eras } = _data

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
 * enhancePersonaPrompt — 给人物的 personaPrompt 追加"角色扮演守则"
 *
 * 解决的问题：原始 personaPrompt 没有知识截止声明、不明确"不知道就说不知道"、
 * 没有强调第一人称，导致 AI 容易"出戏"（说现代话、编造历史、用第三人称谈自己）。
 *
 * 用法：setPersonaPrompt(enhancePersonaPrompt(person.personaPrompt, person.name))
 */
const PERSONA_GUARDRAIL_ZH = `

【角色扮演守则 — 严格遵守】
1. **第一人称**：始终以"我"自称，谈及自己时用"我"而非"他"或名字。
2. **知识范围**：基于公认的历史记载回答。我**只**了解我所处时代及之前的知识。
   - 问我身后 100 年以上的事（如"你对 X 怎么看"），我可能不知道或只能猜测。
   - 明确说"我生于 / 死于 X 年"，"我所处的时代是 X"。
3. **不知道就说不知道**：如果用户问到我不了解的具体细节（后世评价、考据争议、未记载的小事），请明确说"这个我不清楚"或"史书未载"，**不要编造**。
4. **语言匹配**：用户用中文问，用中文答；用户用英文问，用英文答。
5. **不要元叙述**：不要解释"我是 AI"或"我在角色扮演"——我就是这个人。`

const PERSONA_GUARDRAIL_EN = `

[Roleplay rules — strictly follow]
1. First person: always refer to yourself as "I". When talking about yourself, use "I" not "he/she" or your name.
2. Knowledge scope: answer based on historically attested facts. I ONLY know things from my era and before.
   - For events 100+ years after my death, I likely don't know or can only guess.
   - State clearly "I was born in / died in X year", "I lived during X era".
3. If you don't know, say so: when asked about specific details I don't know (later historiography, scholarly debates, undocumented small events), say "I don't know" or "the records do not mention this" — DO NOT fabricate.
4. Language: match the user's language.
5. No meta-narration: don't say "I'm an AI" or "I'm roleplaying" — I am this person.`

export function enhancePersonaPrompt(persona: string, _personName: string): string {
  // 自动判断中英文 — 检测是否含中文字符
  const isChinese = /[一-龥]/.test(persona)
  const guardrail = isChinese ? PERSONA_GUARDRAIL_ZH : PERSONA_GUARDRAIL_EN
  return persona + guardrail
}

/**
 * generateSuggestedQuestions — 根据人物生成 3 个针对性提问建议
 *
 * 基于人物的 role、category、eraIds 动态生成：
 * - 政治/军事人物 → "你最大的成就是什么" / "你怎么评价你的对手"
 * - 思想家 → "你的核心思想是什么" / "你的思想对后世有什么影响"
 * - 科学家 → "你最重要的发明/发现是什么" / "你怎么发现它的"
 * - 文人 → "你最满意的作品是" / "你的创作灵感来自"
 * - 宗教人物 → "你的核心教义是什么" / "你怎么看待其他宗教"
 * - 探险家 → "你为什么去 X" / "你途中遇到的最大困难是"
 */
export function generateSuggestedQuestions(person: { name: string; role: string; category?: string; eraIds: string[] }): string[] {
  const role = person.role || ''
  const cat = person.category || ''
  const isChinese = /[一-龥]/.test(person.name)

  if (!isChinese) {
    // English / non-Chinese figure — generate English questions
    return [
      `What do you consider your greatest achievement, ${person.name}?`,
      `How do you think history will remember you?`,
      `What was the most difficult decision you ever made?`,
    ]
  }

  // 中文人物 — 根据 role 关键词选模板
  const isRuler = /皇帝|国王|女王|法老|哈里发|苏丹|始皇帝|总统|丞相|宰相|太守/.test(role)
  const isMilitary = /将军|统帅|征服|军事|武将|骑士/.test(role) || cat === 'military'
  const isThinker = cat === 'thinker'
  const isLiterati = cat === 'literati'
  const isScientist = cat === 'scientist'
  const isReligious = cat === 'religious'
  const isExplorer = cat === 'explorer'
  const isReformer = cat === 'reformer'

  if (isRuler) {
    return [
      `你最引以为豪的政绩是什么？`,
      `你怎么评价你最大的对手或威胁？`,
      `如果你能重来一次，会改变什么决定？`,
    ]
  }
  if (isMilitary) {
    return [
      `你最得意的一场战役是哪次？为什么？`,
      `你麾下最信任的将领/谋士是谁？`,
      `战争给你最大的感悟是什么？`,
    ]
  }
  if (isThinker) {
    return [
      `你思想的核心理念是什么？用一句话概括。`,
      `你的思想对后世 1000 年有什么影响？`,
      `你被误解最深的一个观点是什么？`,
    ]
  }
  if (isLiterati) {
    return [
      `你最满意的一部作品/一首诗是哪篇？`,
      `你的创作灵感来自哪里？`,
      `你怎么看同时代的其他文人？`,
    ]
  }
  if (isScientist) {
    return [
      `你最重要的发明/发现是什么？用通俗的话解释一下。`,
      `你是怎么想到研究这个问题的？`,
      `你的研究在当时的时代背景下，遇到了什么阻力？`,
    ]
  }
  if (isReligious) {
    return [
      `你创立的教义，核心是什么？用最朴素的话讲。`,
      `你怎么看待其他宗教/学派？`,
      `你传道过程中遇到的最大困难是什么？`,
    ]
  }
  if (isExplorer) {
    return [
      `你为什么要去探索 X？最初的动力是什么？`,
      `途中遇到的最大困难是什么？你怎么克服的？`,
      `你最大的发现/收获是什么？`,
    ]
  }
  if (isReformer) {
    return [
      `你推动的改革，核心思想是什么？`,
      `改革过程中遇到的最大阻力来自哪里？`,
      `你个人为改革付出了什么代价？`,
    ]
  }
  // 默认（兜底）
  return [
    `${person.name}，你最想让后人记住你哪一件事？`,
    `你一生中最大的遗憾是什么？`,
    `你怎么看自己所处的时代？`,
  ]
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

  // 数据未加载完时返回空 map（避免 30+ 人物 hooks 第一次渲染时拿不到数据）
  if (!_data) return EMPTY_CONTEXT_MAP

  const { people, eras } = _data

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
