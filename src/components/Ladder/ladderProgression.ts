/**
 * 文史天梯 — 等级/称号/经验梯度
 *
 * 7 级 名号梯度（学徒 → 学子 → 学者 → 儒生 → 大儒 → 通儒 → 一代宗师）
 *
 * XP 计算策略：
 *   - 总 XP = 三条天梯 × 各 cycle 1 的 xp 之和
 *   - 阈值设计：每关 ~15 XP × 173 关 ≈ ~2600 XP 上限；Lv6 = 2500 是绝大多数能达的天花板
 */

export interface LadderLevelBracket {
  level: number
  name: string
  minXp: number
  /** 该级文字色（与 LadderPanel 主题色对齐） */
  color: string
}

export const LADDER_LEVELS: LadderLevelBracket[] = [
  { level: 0, name: '学徒',   minXp: 0,    color: '#7a7264' },
  { level: 1, name: '学子',   minXp: 60,   color: '#5b9bc8' },
  { level: 2, name: '学者',   minXp: 180,  color: '#9bc89a' },
  { level: 3, name: '儒生',   minXp: 400,  color: '#5bc8c8' },
  { level: 4, name: '大儒',   minXp: 800,  color: '#9b7eb6' },
  { level: 5, name: '通儒',   minXp: 1500, color: '#c89a5b' },
  { level: 6, name: '一代宗师', minXp: 2500, color: '#b85450' },
]

/** 当前 XP → 等级档位 */
export function bracketFor(totalXp: number): LadderLevelBracket {
  let cur = LADDER_LEVELS[0]
  for (const b of LADDER_LEVELS) {
    if (totalXp >= b.minXp) cur = b
  }
  return cur
}

/** 当前档位 + 下一档 + 进度比 */
export function progression(totalXp: number) {
  const cur = bracketFor(totalXp)
  const idx = LADDER_LEVELS.indexOf(cur)
  const next = LADDER_LEVELS[idx + 1] ?? null
  if (!next) {
    return { cur, next: null, progressPct: 100, xpToNext: 0 }
  }
  const span = next.minXp - cur.minXp
  const inSpan = totalXp - cur.minXp
  return {
    cur,
    next,
    progressPct: Math.min(100, Math.max(0, Math.round((inSpan / span) * 100))),
    xpToNext: Math.max(0, next.minXp - totalXp),
  }
}
