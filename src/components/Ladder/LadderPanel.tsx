/**
 * 文史天梯 - MVP 全功能面板
 * 含 Dashboard 入口、关卡地图、关卡详情（4 步骤引导）
 *
 * 用法：通过 Layout 的 case 'ladder' 渲染，onClose → dispatch OPEN_HOME。
 * 不再是 modal — 与 Dashboard、Map、Overview 等并列。
 */
import { useState, useMemo, useEffect } from 'react'
import { useLadderStore, type LadderId, type LadderLevel } from '@/store/useLadderStore'
import { HISTORY_TIERS, POEM_TIERS, FIGURE_TIERS, TIERS_BY_LADDER, TIERS_BY_LADDER_ALL_CYCLES, type LadderIdCycle } from '@/data/ladders'
import { LADDER_GUIDES, type LadderGuide } from '@/data/ladderNpcs'
import { progression } from './ladderProgression'
import { useAIStore } from '@/store/useAIStore'
import { audioEngine } from '@/utils/audioEngine'

interface Props {
  onClose: () => void
}

const LADDER_LABEL: Record<LadderId, string> = {
  history: '史',
  poem: '诗',
  figure: '人',
}
const LADDER_DESC: Record<LadderId, string> = {
  history: '朝代为阶 · 学测记问',
  poem: '诗作为阶 · 学测记问',
  figure: '人物为阶 · 学测记问',
}

type Question = LadderLevel['quiz'][number]

export default function LadderPanel({ onClose }: Props) {
  // ── 所有 hooks 必须在条件 return 之前（Rules of Hooks）──
  const ladders = useLadderStore(s => s.ladders)
  const enterLevel = useLadderStore(s => s.enterLevel)
  const stepByLevelMap = useLadderStore(s => s.stepByLevel)
  const setStepAction = useLadderStore(s => s.setStep)
  const advanceStepAction = useLadderStore(s => s.advanceStep)
  const completeLevelAction = useLadderStore(s => s.completeLevel)
  const notesDraftMap = useLadderStore(s => s.notesDraftByLevel)
  const saveNoteDraftAction = useLadderStore(s => s.saveNoteDraft)
  const markAskCompletedAction = useLadderStore(s => s.markAskCompleted)
  const askCompletedMap = useLadderStore(s => s.askCompletedByLevel)
  const [activeLadder, setActiveLadder] = useState<LadderId | 'home'>('home')
  const [openLevelId, setOpenLevelId] = useState<string | null>(null)
  const [activeCycle, setActiveCycle] = useState<LadderIdCycle>(1)
  const [showAchievement, setShowAchievement] = useState(false)

  // 总 XP 与等级
  const totalXpFn = useLadderStore(s => s.totalXp)
  const totalXp = totalXpFn()
  const prog = progression(totalXp)

  // 当前 ladder/cycle 下的关卡
  const tiers = (ladder: LadderId, cycle: LadderIdCycle = activeCycle) => {
    const t = TIERS_BY_LADDER(ladder, cycle)
    return t.length > 0 ? t : TIERS_BY_LADDER(ladder, 1)  // 史 ladder cycle2/3 fallback 到 1
  }

  // 状态 setter
  const unlockNextCycleAction = useLadderStore(s => s.unlockNextCycle)
  const resetCycleAction = useLadderStore(s => s.resetCycle)

  // Esc 退出 → 返回 Dashboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (openLevelId) {
        audioEngine.playClick()
        setOpenLevelId(null)
        return
      }
      if (activeLadder !== 'home') {
        audioEngine.playClick()
        setActiveLadder('home')
        return
      }
      audioEngine.playModalClose()
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openLevelId, activeLadder, onClose])

  // ── conditional return（所有 hooks 已调完）──

  if (showAchievement) {
    return (
      <AchievementView
        ladders={ladders}
        prog={prog}
        totalXp={totalXp}
        onBack={() => { audioEngine.playModalClose(); setShowAchievement(false) }}
      />
    )
  }

  if (openLevelId) {
    const allTiers = activeLadder !== 'home' ? tiers(activeLadder) : HISTORY_TIERS
    const level = allTiers.find(t => t.id === openLevelId) ?? HISTORY_TIERS.find(t => t.id === openLevelId)!
    const step = stepByLevelMap[openLevelId] ?? 'study'
    const noteDraft = notesDraftMap[openLevelId] ?? ''
    const askDone = askCompletedMap[openLevelId] ?? false
    return (
      <LevelView
        level={level}
        step={step}
        setStep={(s) => { audioEngine.playClick(); setStepAction(openLevelId, s) }}
        onBack={() => { audioEngine.playClick(); setOpenLevelId(null) }}
        onAdvance={() => { audioEngine.playClick(); advanceStepAction(openLevelId) }}
        onComplete={() => {
          audioEngine.playSelect()
          completeLevelAction(openLevelId)
          setOpenLevelId(null)
        }}
        noteDraft={noteDraft}
        saveNoteDraft={(v) => saveNoteDraftAction(openLevelId, v)}
        markAskCompleted={() => markAskCompletedAction(openLevelId)}
        askDone={askDone}
      />
    )
  }

  if (activeLadder !== 'home') {
    const ladderTiers = tiers(activeLadder)
    const ladderCyc = ladders[activeLadder].cycles[activeCycle]
    const totalThisCycle = ladderTiers.length
    const doneThisCycle = ladderCyc.completedLevelIds.length
    const cycleUnlocked = ladderCyc.cycleUnlocked
    const nextCycle = (activeCycle < 3 ? (activeCycle + 1) as LadderIdCycle : null)
    const cycle2Unlocked = ladders[activeLadder].cycles[2].cycleUnlocked >= 2
    const cycle3Unlocked = ladders[activeLadder].cycles[3].cycleUnlocked >= 3
    return (
      <LadderMapView
        ladder={activeLadder}
        cycle={activeCycle}
        tiers={ladderTiers}
        completedIds={ladderCyc.completedLevelIds}
        currentId={ladderCyc.currentLevelId}
        xp={ladderCyc.xp}
        levelName={prog.cur.name}
        levelColor={prog.cur.color}
        levelProgressPct={prog.progressPct}
        levelXpToNext={prog.xpToNext}
        levelNextName={prog.next?.name ?? null}
        totalXp={totalXp}
        cycleUnlockedMax={Math.max(1, ...Object.values(ladders[activeLadder].cycles).map(c => c.cycleUnlocked)) as LadderIdCycle}
        canUnlockNext={doneThisCycle === totalThisCycle && nextCycle !== null}
        cycle2Unlocked={cycle2Unlocked}
        cycle3Unlocked={cycle3Unlocked}
        onSelectCycle={c => {
          if (c <= Math.max(1, ...Object.values(ladders[activeLadder].cycles).map(c2 => c2.cycleUnlocked))) {
            audioEngine.playClick()
            setActiveCycle(c)
          }
        }}
        onUnlockNext={() => {
          audioEngine.playSelect()
          unlockNextCycleAction(activeLadder)
          setActiveCycle((activeCycle + 1) as LadderIdCycle)
        }}
        onResetCycle={() => {
          if (!confirm(`重置 ${LADDER_LABEL[activeLadder]} 第 ${activeCycle} 难度？\n已通关 + 已学笔记都会清空。`)) return
          audioEngine.playModalClose()
          resetCycleAction(activeLadder, activeCycle)
        }}
        onBack={() => setActiveLadder('home')}
        onEnterLevel={(id) => { enterLevel(id); setOpenLevelId(id) }}
      />
    )
  }

  return (
    <div className="w-full h-full bg-ink-900 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-ink-900/95 backdrop-blur border-b border-ink-700 px-6 py-4 flex items-center justify-between">
        <div>
          <button
            onClick={() => { audioEngine.playClick(); onClose() }}
            className="text-xs text-ink-400 hover:text-bronze-300 mb-1"
          >← 返回 Dashboard</button>
          <h1 className="font-serif text-2xl text-bronze-300">🪜 文史天梯</h1>
          <p className="text-xs text-ink-500 mt-0.5">史 · 诗 · 人 三条天梯 · 学 / 测 / 记 / 问 四步闭环</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { audioEngine.playClick(); setShowAchievement(true) }}
            className="px-3 py-1.5 rounded-lg bg-bronze-700/40 hover:bg-bronze-700 text-bronze-300 text-sm border border-bronze-600/40"
            title="全景画卷：你走过的所有关卡"
          >🏆 全景画卷</button>
          <button
            onClick={() => { audioEngine.playModalClose(); onClose() }}
            className="px-3 py-1.5 rounded-lg bg-ink-700 hover:bg-ink-600 text-parchment-100 text-sm"
            title="Esc"
          >关闭</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* 等级/称号 HUD banner */}
        <section
          className="rounded-2xl border p-4 sm:p-5 flex items-center gap-4"
          style={{ background: `linear-gradient(135deg, ${prog.cur.color}22 0%, transparent 60%)`, borderColor: `${prog.cur.color}55` }}
        >
          <div className="flex items-baseline gap-3">
            <span
              className="font-serif text-3xl sm:text-4xl"
              style={{ color: prog.cur.color }}
            >Lv {prog.cur.level}</span>
            <span className="font-serif text-base sm:text-lg text-parchment-100">{prog.cur.name}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${prog.progressPct}%`, background: prog.cur.color }}
              />
            </div>
            <div className="mt-1 text-xs text-ink-400 flex justify-between">
              <span>累计 XP <span className="text-bronze-300">{totalXp}</span></span>
              {prog.next ? (
                <span>距 <span style={{ color: prog.next.color }}>{prog.next.name}</span> 还差 <span className="text-bronze-300">{prog.xpToNext}</span> XP</span>
              ) : (
                <span className="text-bronze-300">已至最高境界 ✦</span>
              )}
            </div>
          </div>
        </section>

        {/* 概览 */}
        <section className="rounded-2xl border border-ink-700 bg-ink-800/80 p-6">
          <h2 className="font-serif text-lg text-parchment-50 mb-3">机制概览</h2>
          <div className="grid sm:grid-cols-4 gap-3 text-sm">
            {['学', '测', '记', '问'].map((s, i) => (
              <div key={s} className="rounded-xl border border-ink-700 bg-ink-900/60 p-3">
                <div className="flex items-center gap-2 text-bronze-300">
                  <span className="w-6 h-6 rounded-full bg-bronze-700/40 flex items-center justify-center text-xs">{i + 1}</span>
                  <span className="font-medium">{s}</span>
                </div>
                <p className="text-xs text-ink-400 mt-1.5">
                  {i === 0 && '读一段史料 · 200 字'}
                  {i === 1 && '单选 + 配对 + 排年表 · 3-6 道'}
                  {i === 2 && '自动笔记骨架 · 你可改写保存'}
                  {i === 3 && 'AI 角色列表 · 任意召问'}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-ink-400 leading-relaxed">
            每关通过获得 <span className="text-bronze-300">+20 XP</span>。三关通完可解锁该天梯难度轮回（重开同一内容出更难题）。
          </div>
        </section>

        {/* 三条天梯选择 */}
        <section>
          <h2 className="font-serif text-lg text-parchment-50 mb-3">选择一条天梯</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {(['history', 'poem', 'figure'] as LadderId[]).map(lid => {
              const cyc = ladders[lid].cycles[1]
              const total = tiers(lid).length
              const done = cyc.completedLevelIds.length
              return (
                <button
                  key={lid}
                  onClick={() => { audioEngine.playClick(); setActiveLadder(lid) }}
                  className="rounded-2xl border-2 border-ink-700 hover:border-bronze-500 bg-ink-800/80 p-5 text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-serif text-bronze-300 w-12 h-12 rounded-full bg-bronze-700/20 flex items-center justify-center">
                      {LADDER_LABEL[lid]}
                    </span>
                    <div>
                      <h3 className="font-serif text-lg text-parchment-50">
                        {lid === 'history' ? '史天梯' : lid === 'poem' ? '诗天梯' : '人天梯'}
                      </h3>
                      <p className="text-xs text-ink-400">{LADDER_DESC[lid]}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-ink-400">关卡进度</span>
                    <span className="text-bronze-300 font-medium">{done} / {total || '—'}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-ink-700 overflow-hidden">
                    <div className="h-full bg-bronze-500" style={{ width: total ? `${(done / total) * 100}%` : '0%' }} />
                  </div>
                  <div className="mt-2 text-xs text-ink-500">XP {cyc.xp}</div>
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-ink-500">
            * MVP 仅展示史天梯前 4 关，其余故事在后续阶段批量接入。诗 / 人天梯的关卡数据可在后续 sprint 由脚本从 poems.json / people.json 生成。
          </p>
        </section>
      </main>
    </div>
  )
}

/* ───────────────────────── 关卡地图视图 ───────────────────────── */
function LadderMapView({
  ladder,
  cycle,
  tiers,
  completedIds,
  currentId,
  xp,
  levelName,
  levelColor,
  levelProgressPct,
  levelXpToNext,
  levelNextName,
  totalXp,
  cycleUnlockedMax,
  canUnlockNext,
  cycle2Unlocked,
  cycle3Unlocked,
  onSelectCycle,
  onUnlockNext,
  onResetCycle,
  onBack,
  onEnterLevel,
}: {
  ladder: LadderId
  cycle: LadderIdCycle
  tiers: LadderLevel[]
  completedIds: string[]
  currentId: string | null
  xp: number
  levelName: string
  levelColor: string
  levelProgressPct: number
  levelXpToNext: number
  levelNextName: string | null
  totalXp: number
  cycleUnlockedMax: LadderIdCycle
  canUnlockNext: boolean
  cycle2Unlocked: boolean
  cycle3Unlocked: boolean
  onSelectCycle: (c: LadderIdCycle) => void
  onUnlockNext: () => void
  onResetCycle: () => void
  onBack: () => void
  onEnterLevel: (id: string) => void
}) {
  const sorted = [...tiers].sort((a, b) => a.order - b.order)
  return (
    <div className="w-full h-full bg-ink-900 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-ink-900/95 backdrop-blur border-b border-ink-700 px-6 py-4 flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-xs text-ink-400 hover:text-bronze-300 mb-1">← 返回天梯</button>
          <h1 className="font-serif text-2xl text-bronze-300">
            {ladder === 'history' ? '史天梯' : ladder === 'poem' ? '诗天梯' : '人天梯'}
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">本难度进度：{completedIds.length} / {sorted.length} · XP {xp}</p>
        </div>
        {/* Cycle Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {[1, 2, 3].map(c => {
            const cyc = c as LadderIdCycle
            const unlocked = cyc <= cycleUnlockedMax
            const isActive = cyc === cycle
            return (
              <button
                key={cyc}
                onClick={() => onSelectCycle(cyc)}
                disabled={!unlocked}
                title={unlocked ? `切换到难度 ${cyc}` : '未解锁'}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isActive
                    ? 'bg-bronze-600 text-parchment-50'
                    : unlocked
                    ? 'bg-ink-700 text-parchment-100 hover:bg-ink-600'
                    : 'bg-ink-800/40 text-ink-600 cursor-not-allowed'
                }`}
              >
                难度 {cyc}
                {!unlocked && <span className="ml-1">🔒</span>}
              </button>
            )
          })}
          <span className="ml-auto flex gap-2">
            {canUnlockNext && (
              <button
                onClick={onUnlockNext}
                className="px-3 py-1.5 rounded-lg text-xs bg-green-700 hover:bg-green-600 text-parchment-50"
              >
                🎉 解锁下一难度
              </button>
            )}
            <button
              onClick={onResetCycle}
              title="重置当前难度的所有进度（笔记/AI 对话都会清空）"
              className="px-3 py-1.5 rounded-lg text-xs bg-ink-800 text-ink-400 hover:bg-red-900 hover:text-red-200 border border-ink-700"
            >
              ↻ 重置本难度
            </button>
          </span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-5">
        {/* Mini HUD */}
        <div className="rounded-xl border p-3 flex items-center gap-3" style={{ borderColor: `${levelColor}55`, background: `${levelColor}10` }}>
          <span className="font-serif text-lg" style={{ color: levelColor }}>{levelName}</span>
          <div className="flex-1 min-w-0">
            <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
              <div className="h-full transition-all duration-500" style={{ width: `${levelProgressPct}%`, background: levelColor }} />
            </div>
          </div>
          <span className="text-xs text-ink-400 tabular-nums">XP {totalXp}</span>
          {levelNextName && (
            <span className="text-xs text-ink-500">→ <span style={{ color: levelColor }}>{levelNextName}</span> 差 {levelXpToNext}</span>
          )}
        </div>

        <div className="space-y-3">
          {sorted.map((t: LadderLevel, i: number) => {
            const done = completedIds.includes(t.id)
            // 顺序解锁规则：仅 done 与 当前可玩关 可玩；其余锁定
            const isCurrent = currentId === t.id || (!done && !currentId && i === completedIds.length)
            const locked = !done && !isCurrent
            const handleClick = () => {
              if (locked) {
                audioEngine.playWrong?.()
                return
              }
              onEnterLevel(t.id)
            }
            return (
              <button
                key={t.id}
                onClick={handleClick}
                disabled={locked}
                title={locked ? '请先通关上一关' : (done ? '已通关 · 点击重玩' : '点击开始本关')}
                className={`w-full flex items-center gap-4 rounded-2xl border p-4 transition-all text-left ${
                  locked
                    ? 'border-ink-700 bg-ink-900/40 opacity-40 cursor-not-allowed'
                    : done
                    ? 'border-bronze-500/50 bg-bronze-700/10 hover:bg-bronze-700/20'
                    : isCurrent
                    ? 'border-bronze-400 bg-ink-800 ring-2 ring-bronze-500/40 animate-pulse-slow'
                    : 'border-ink-700 bg-ink-800/60'
                }`}
              >
                <span className={`w-10 h-10 rounded-full flex items-center justify-center font-serif text-lg ${
                  locked
                    ? 'bg-ink-800 text-ink-600'
                    : done
                    ? 'bg-bronze-500 text-ink-900'
                    : isCurrent
                    ? 'bg-bronze-700 text-bronze-300'
                    : 'bg-ink-700 text-ink-500'
                }`}>
                  {locked ? '🔒' : done ? '✓' : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-serif text-base truncate ${locked ? 'text-ink-500' : 'text-parchment-50'}`}>{t.study.title}</h3>
                  <p className="text-xs text-ink-400 truncate">
                    {locked ? '需先通关上一关' : `${t.entityId} · ${t.quiz.length} 道题`}
                  </p>
                </div>
                {done && <span className="text-xs text-bronze-400">+{t.reward.xp} XP</span>}
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}

/* ───────────────────────── 单关 4 步流程 ───────────────────────── */
function LevelView({
  level,
  step,
  setStep,
  onBack,
  onAdvance,
  onComplete,
  noteDraft,
  saveNoteDraft,
  markAskCompleted,
  askDone,
}: {
  level: LadderLevel
  step: 'study' | 'quiz' | 'notes' | 'ask'
  setStep: (s: 'study' | 'quiz' | 'notes' | 'ask') => void
  onBack: () => void
  onAdvance: () => void
  onComplete: () => void
  noteDraft: string
  saveNoteDraft: (v: string) => void
  markAskCompleted: () => void
  askDone: boolean
}) {
  return (
    <div className="w-full h-full bg-ink-900 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-ink-900/95 backdrop-blur border-b border-ink-700 px-6 py-4 flex items-center justify-between">
        <button onClick={onBack} className="text-xs text-ink-400 hover:text-bronze-300">← 关卡地图</button>
        <h1 className="font-serif text-xl text-parchment-50 truncate px-2">{level.study.title}</h1>
        <span className="text-xs text-bronze-300">+{level.reward.xp} XP</span>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-6 text-xs">
          {(['study', 'quiz', 'notes', 'ask'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => setStep(s)}
                className={`px-3 py-1.5 rounded-full border ${
                  step === s
                    ? 'border-bronze-500 bg-bronze-700/30 text-bronze-300'
                    : 'border-ink-700 text-ink-500'
                }`}
              >
                {['学', '测', '记', '问'][i]}
              </button>
              {i < 3 && <span className="text-ink-600">·</span>}
            </div>
          ))}
        </div>

        {step === 'study' && (
          <section className="rounded-2xl border border-ink-700 bg-ink-800/80 p-6 space-y-4">
            <h2 className="font-serif text-2xl text-bronze-300">{level.study.title}</h2>
            <p className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
              {level.study.summary}
            </p>
            <button onClick={onAdvance} className="w-full py-3 rounded-xl bg-bronze-600 hover:bg-bronze-500 text-parchment-50 font-medium">
              {level.study.cta}
            </button>
          </section>
        )}

        {step === 'quiz' && (
          <QuizStep
            questions={level.quiz}
            onAllCorrect={onAdvance}
            onBack={() => setStep('study')}
          />
        )}

        {step === 'notes' && (
          <section className="rounded-2xl border border-ink-700 bg-ink-800/80 p-6 space-y-4">
            <h2 className="font-serif text-lg text-bronze-300">{level.notes.templateTitle}</h2>
            <p className="text-xs text-ink-400">自动生成的笔记骨架 · 你可改写补充，然后保存</p>
            <textarea
              value={noteDraft || level.notes.templateBody}
              onChange={(e) => saveNoteDraft(e.target.value)}
              rows={14}
              className="w-full rounded-xl bg-ink-900 border border-ink-700 px-4 py-3 text-sm text-parchment-100 leading-relaxed font-mono"
            />
            <button onClick={onAdvance} className="w-full py-3 rounded-xl bg-bronze-600 hover:bg-bronze-500 text-parchment-50 font-medium">
              记完 → 去提问
            </button>
          </section>
        )}

        {step === 'ask' && (
          <AskStep
            npcs={level.ask.npcOptions}
            samples={level.ask.sampleQuestions}
            levelTitle={level.study.title}
            levelXp={level.reward.xp}
            done={askDone}
            onDone={markAskCompleted}
            onComplete={onComplete}
          />
        )}
      </main>
    </div>
  )
}

/* ───────────────────────── 测：单选 + 配对 + 排年表 ───────────────────────── */
function QuizStep({
  questions,
  onAllCorrect,
  onBack,
}: {
  questions: Question[]
  onAllCorrect: () => void
  onBack: () => void
}) {
  const [answers, setAnswers] = useState<Record<number, number | string[]>>({})
  const [submitted, setSubmitted] = useState(false)

  const isCorrect = (q: Question, idx: number) => {
    const a = answers[idx]
    if (a === undefined) return false
    if (q.kind === 'single') return a === q.correctIndex
    if (q.kind === 'match') {
      if (!Array.isArray(a)) return false
      const correctPairs = (q.pairs ?? []).map(p => `${p.left}->${p.right}`)
      return JSON.stringify(a) === JSON.stringify(correctPairs)
    }
    if (q.kind === 'order') {
      if (!Array.isArray(a)) return false
      return JSON.stringify(a) === JSON.stringify(q.correctOrder)
    }
    return false
  }

  const allDone = questions.every((_, i) => isCorrect(questions[i], i))
  const correctCount = questions.filter((q, i) => isCorrect(q, i)).length

  return (
    <section className="rounded-2xl border border-ink-700 bg-ink-800/80 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-bronze-300">测一测 · {questions.length} 道题</h2>
        {submitted && (
          <span className="text-xs text-ink-400">
            已对 {correctCount} / {questions.length}
          </span>
        )}
      </div>

      {questions.map((q, idx) => {
        const ok = isCorrect(q, idx)
        return (
          <div key={idx} className="rounded-xl border border-ink-700 bg-ink-900/40 p-4 space-y-3">
            <p className="text-sm text-parchment-100 font-medium">{idx + 1}. {q.prompt ?? (q.kind === 'match' ? '匹配左右项' : '排出正确顺序')}</p>
            {q.kind === 'single' && (
              <div className="grid sm:grid-cols-2 gap-2">
                {q.options?.map((opt, i) => {
                  const chosen = answers[idx] === i
                  const isRight = submitted && i === q.correctIndex
                  const isWrong = submitted && chosen && i !== q.correctIndex
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers(a => ({ ...a, [idx]: i }))}
                      className={`text-left rounded-lg border px-3 py-2 text-sm transition-all ${
                        isRight ? 'border-green-500 bg-green-900/30 text-green-200'
                        : isWrong ? 'border-red-500 bg-red-900/30 text-red-200'
                        : chosen ? 'border-bronze-500 bg-bronze-700/20 text-parchment-100'
                        : 'border-ink-600 text-ink-300 hover:border-ink-500'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            )}
            {q.kind === 'match' && q.pairs && (
              <div className="space-y-2 text-sm">
                {q.pairs.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={(answers[idx] as string[] | undefined)?.[i] ?? ''}
                      onChange={(e) => {
                        const curPairs = q.pairs ?? []
                        const arr = [...((answers[idx] as string[] | undefined) ?? curPairs.map(() => ''))]
                        arr[i] = e.target.value
                        setAnswers(a => ({ ...a, [idx]: arr }))
                      }}
                      className="rounded-lg bg-ink-800 border border-ink-600 px-2 py-1 text-sm text-parchment-100"
                    >
                      <option value="">— 选 —</option>
                      {q.pairs!.map((rp, j) => (
                        <option key={j} value={rp.left}>{rp.left}</option>
                      ))}
                    </select>
                    <span className="text-bronze-300">↔</span>
                    <span className="text-parchment-100">{p.right}</span>
                  </div>
                ))}
              </div>
            )}
            {q.kind === 'order' && q.items && (
              <div className="space-y-1">
                <p className="text-xs text-ink-400">点序号重排：</p>
                <ol className="space-y-1">
                  {(answers[idx] as string[] | undefined ?? q.items.map(it => it.id)).map((id, i) => {
                    const it = q.items!.find(x => x.id === id)!
                    return (
                      <li key={`${id}-${i}`} className="flex items-center gap-2 rounded-lg bg-ink-800 px-3 py-1.5 text-sm text-parchment-100">
                        <span className="w-5 h-5 rounded-full bg-bronze-700 text-bronze-300 flex items-center justify-center text-xs">{i + 1}</span>
                        <span>{it.label}</span>
                      </li>
                    )
                  })}
                </ol>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      const cur = (answers[idx] as string[] | undefined ?? q.items!.map(it => it.id))
                      if (cur.length < 2) return
                      const next = cur.slice(); const [first] = next.splice(0, 1); next.push(first)
                      setAnswers(a => ({ ...a, [idx]: next }))
                    }}
                    className="px-3 py-1 rounded-lg bg-ink-700 text-xs text-ink-300 hover:bg-ink-600"
                  >↑ 上移</button>
                  <button
                    onClick={() => {
                      const cur = (answers[idx] as string[] | undefined ?? q.items!.map(it => it.id))
                      if (cur.length < 2) return
                      const next = cur.slice(); const last = next.pop()!; next.unshift(last)
                      setAnswers(a => ({ ...a, [idx]: next }))
                    }}
                    className="px-3 py-1 rounded-lg bg-ink-700 text-xs text-ink-300 hover:bg-ink-600"
                  >↓ 下移（末→首）</button>
                </div>
              </div>
            )}
            {submitted && q.explain && ok && q.kind === 'single' && (
              <p className="text-xs text-green-300">✓ {q.explain}</p>
            )}
          </div>
        )
      })}

      <div className="flex gap-3">
        {!submitted ? (
          <button onClick={() => setSubmitted(true)} className="flex-1 py-3 rounded-xl bg-bronze-600 hover:bg-bronze-500 text-parchment-50 font-medium">
            提交答案
          </button>
        ) : allDone ? (
          <button onClick={onAllCorrect} className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-parchment-50 font-medium">
            全对 → 去记
          </button>
        ) : (
          <button onClick={() => setSubmitted(false)} className="flex-1 py-3 rounded-xl bg-ink-700 hover:bg-ink-600 text-parchment-50 font-medium">
            重答 ({correctCount}/{questions.length})
          </button>
        )}
        <button onClick={onBack} className="px-4 py-3 rounded-xl border border-ink-600 text-ink-300 text-sm">
          返回学
        </button>
      </div>
    </section>
  )
}

/* ───────────────────────── 问：AI 角色 + 自问自答 ───────────────────────── */
function AskStep({
  npcs,
  samples,
  levelTitle,
  levelXp,
  done,
  onDone,
  onComplete,
}: {
  npcs: LadderLevel['ask']['npcOptions']
  samples: string[]
  levelTitle: string
  levelXp: number
  done: boolean
  onDone: () => void
  onComplete: () => void
}) {
  const [chosen, setChosen] = useState<string | null>(null)
  const startAi = (npc: { id: string; name: string; era: string; tag: string; persona: string }) => {
    audioEngine.playClick()
    setChosen(npc.id)
    const ai = useAIStore.getState()
    ai.setContext(null, null, npc.id)
    ai.setPersonaPrompt(npc.persona)
    ai.newThread(`与 ${npc.name} 聊「${levelTitle}」`)
    ai.openPanel()
  }
  // 合并 entity-NPC + 通识向导（去重）
  const allNpcs: Array<{ id: string; name: string; era: string; tag: string; persona: string }> = []
  const seen = new Set<string>()
  for (const n of npcs) { if (!seen.has(n.id)) { allNpcs.push(n); seen.add(n.id) } }
  for (const g of LADDER_GUIDES) { if (!seen.has(g.id)) { allNpcs.push(g); seen.add(g.id) } }

  return (
    <section className="rounded-2xl border border-ink-700 bg-ink-800/80 p-6 space-y-5">
      <h2 className="font-serif text-lg text-bronze-300">问 AI · 你可以向一位历史人物提问</h2>
      <p className="text-xs text-ink-400">点击角色 → AIChatPanel 打开已配置该角色人设 + 本关上下文；对话完毕回来点「我已问完」</p>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {allNpcs.map(npc => {
          const isGuide = npc.id.startsWith('guide-')
          return (
            <button
              key={npc.id}
              onClick={() => startAi(npc)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                chosen === npc.id ? 'border-bronze-500 bg-bronze-700/20' : 'border-ink-700 hover:border-ink-500'
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-lg text-parchment-50">{npc.name}</span>
                <span className="text-xs text-ink-500">{npc.era}</span>
                <span className="text-xs text-bronze-400">[{npc.tag}]</span>
                {isGuide && <span className="text-[10px] uppercase tracking-wider text-bronze-400 ml-1">通识向导</span>}
              </div>
              <p className="text-xs text-ink-400 mt-1 leading-relaxed line-clamp-3">{npc.persona}</p>
            </button>
          )
        })}
      </div>

      {chosen && (
        <div className="space-y-3 pt-3 border-t border-ink-700">
          <p className="text-xs text-ink-400">推荐问句：</p>
          <div className="flex flex-wrap gap-2">
            {samples.map((s, i) => (
              <span key={i} className="text-xs rounded-full bg-ink-700/60 border border-ink-600 px-2.5 py-1 text-ink-300">{s}</span>
            ))}
          </div>
          <p className="text-xs text-ink-500">↗ AIChatPanel 已打开，可直接对话。本关可关闭 Panel 回到这里。</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {!done ? (
          <button onClick={onDone} className="flex-1 py-3 rounded-xl bg-bronze-600 hover:bg-bronze-500 text-parchment-50 font-medium">
            我已问完 ✓
          </button>
        ) : (
          <button onClick={onComplete} className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-parchment-50 font-medium">
            ✅ 完成本关 +{levelXp} XP
          </button>
        )}
      </div>
    </section>
  )
}

/* ───────────────────────── 成就页 / 全景画卷 ───────────────────────── */
function AchievementView({ ladders, prog, totalXp, onBack }: {
  ladders: ReturnType<typeof useLadderStore.getState>['ladders']
  prog: ReturnType<typeof progression>
  totalXp: number
  onBack: () => void
}) {
  const rows: Array<{ label: string; cycle: number; done: number; total: number; xp: number }> = []
  for (const ladder of (['history', 'poem', 'figure'] as LadderId[])) {
    for (const cyc of [1, 2, 3] as LadderIdCycle[]) {
      const tiersArr = TIERS_BY_LADDER(ladder, cyc)
      const total = tiersArr.length
      const done = ladders[ladder].cycles[cyc].completedLevelIds.length
      const xp = ladders[ladder].cycles[cyc].xp
      rows.push({ label: `${LADDER_LABEL[ladder]}梯 Cycle ${cyc}`, cycle: cyc, done, total, xp })
    }
  }

  const totalCompleted = rows.reduce((s, r) => s + r.done, 0)
  const totalLevels = rows.reduce((s, r) => s + r.total, 0)

  // 一条合并时间线：诗用 -1800+idx 简化排；人 / 史用对应年份
  const allSorted: Array<{ id: string; yr: number; title: string }> = []
  HISTORY_TIERS.forEach((t) => allSorted.push({ id: t.id, yr: -221 + t.order * 80, title: t.study.title }))
  FIGURE_TIERS.forEach((t, i) => allSorted.push({ id: t.id, yr: -1800 + i * 28, title: t.study.title }))
  POEM_TIERS.forEach((t, i) => allSorted.push({ id: t.id, yr: 600 + i * 12, title: t.study.title }))
  allSorted.sort((a, b) => a.yr - b.yr)

  const TL_W = 1500, TL_H = 220
  const minY = Math.min(...allSorted.map((p) => p.yr))
  const maxY = Math.max(...allSorted.map((p) => p.yr))
  const spanY = maxY - minY || 1
  const xs = (yr: number) => ((yr - minY) / spanY) * (TL_W - 80) + 40
  const isDone = (id: string) =>
    ladders.figure.cycles[1].completedLevelIds.includes(id) ||
    ladders.figure.cycles[2].completedLevelIds.includes(id) ||
    ladders.figure.cycles[3].completedLevelIds.includes(id) ||
    ladders.poem.cycles[1].completedLevelIds.includes(id) ||
    ladders.poem.cycles[2].completedLevelIds.includes(id) ||
    ladders.poem.cycles[3].completedLevelIds.includes(id) ||
    ladders.history.cycles[1].completedLevelIds.includes(id)

  return (
    <div className="w-full h-full bg-ink-900 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-ink-900/95 backdrop-blur border-b border-ink-700 px-6 py-4 flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-xs text-ink-400 hover:text-bronze-300 mb-1">← 返回天梯</button>
          <h1 className="font-serif text-2xl text-bronze-300">🏆 全景画卷</h1>
          <p className="text-xs text-ink-500 mt-0.5">关卡 {totalCompleted} / {totalLevels} · 总 XP {totalXp}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* 玩家卡片 */}
        <section
          className="rounded-2xl border p-6 flex items-center gap-4"
          style={{ background: `linear-gradient(135deg, ${prog.cur.color}22 0%, transparent 50%)`, borderColor: `${prog.cur.color}55` }}
        >
          <span className="text-5xl" style={{ filter: `drop-shadow(0 0 12px ${prog.cur.color}66)` }}>🏆</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl" style={{ color: prog.cur.color }}>Lv {prog.cur.level}</span>
              <span className="font-serif text-xl text-parchment-50">{prog.cur.name}</span>
            </div>
            <div className="mt-1 text-sm text-parchment-200">
              已通 <span className="text-bronze-400">{totalCompleted}</span> 关（/ {totalLevels}）
            </div>
          </div>
          <div className="text-right">
            <div className="font-serif text-3xl text-bronze-300 tabular-nums">{totalXp}</div>
            <div className="text-xs text-ink-500">总 XP</div>
          </div>
        </section>

        {/* 9 cycle 进度表 */}
        <section className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5">
          <h2 className="font-serif text-lg text-parchment-50 mb-3">通关矩阵 · 3 天梯 × 3 cycle</h2>
          <div className="space-y-2">
            {rows.map((r, i) => {
              const pct = r.total ? Math.round((r.done / r.total) * 100) : 0
              const isDone = r.done === r.total && r.total > 0
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-serif text-sm text-parchment-100 w-32 truncate">{r.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-ink-700 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: isDone ? '#c89a5b' : '#9bc89a' }}
                    />
                  </div>
                  <span className="text-xs text-ink-400 tabular-nums w-32 text-right">
                    {r.done} / {r.total} · {r.xp} XP
                  </span>
                  {isDone && <span className="text-bronze-300 text-sm">★</span>}
                </div>
              )
            })}
          </div>
        </section>

        {/* 时间线 SVG */}
        <section className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5">
          <h2 className="font-serif text-lg text-parchment-50 mb-3">全景时间线</h2>
          <p className="text-xs text-ink-400 mb-3">约公元前 1800 年 — 公元 1500 年 · 共 {allSorted.length} 个关卡 · 横轴按时间</p>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${TL_W} ${TL_H}`} className="w-full" style={{ height: 220 }}>
              <defs>
                <linearGradient id="ladGrad" x1="0%" x2="100%">
                  <stop offset="0%" stopColor="#c89a5b" />
                  <stop offset="100%" stopColor="#b85450" />
                </linearGradient>
              </defs>
              <line x1={20} y1={TL_H - 30} x2={TL_W - 20} y2={TL_H - 30} stroke="#3a3838" strokeWidth="1" />
              {allSorted.map((p, i) => {
                const cx = xs(p.yr)
                const done = isDone(p.id)
                const cy = TL_H - 50 - (i % 7) * 14
                return (
                  <g key={p.id}>
                    <circle
                      cx={cx} cy={cy}
                      r={done ? 4 : 2.5}
                      fill={done ? 'url(#ladGrad)' : '#3a3838'}
                      stroke={done ? '#c89a5b' : 'none'}
                      strokeWidth={done ? 1 : 0}
                    />
                    {done && (
                      <text x={cx} y={cy + 4} textAnchor="middle" fill="#1a1818" fontSize="6" fontWeight="bold">✓</text>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
          <div className="mt-3 flex gap-4 text-xs text-ink-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-bronze-500" />已通关</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ink-700" />未通关</span>
          </div>
        </section>
      </main>
    </div>
  )
}
