/**
 * ScenarioPlayer — 剧本播放引擎
 * 显示场景文字 → 选项 → 跳下一章 → 结局 → 历史复盘
 */
import { useState, useEffect, useRef } from 'react'

// 全局 CSS 动画 keyframes
const styleEl = typeof document !== 'undefined' ? (() => {
  if (document.getElementById('scenario-animations')) return null
  const s = document.createElement('style')
  s.id = 'scenario-animations'
  s.textContent = `
    @keyframes scene-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scene-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scene-image-zoom {
      from { opacity: 0; transform: scale(1.05); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes stat-float {
      0% { opacity: 0; transform: translateY(0); }
      20% { opacity: 1; }
      100% { opacity: 0; transform: translateY(-40px); }
    }
  `
  document.head.appendChild(s)
  return s
})() : null
import scenariosData from '@/data/scenarios.json'
import { audioEngine, pickBGMForScene, pickBGMForScenario } from '@/utils/audioEngine'
import { bingImage } from '@/utils/geoImage'
import bgmLibrary from '@/data/bgmLibrary.json'
import CharacterAvatar, { PlayerAvatar } from './CharacterAvatar'
import { useLearningPathStore } from '@/store/useLearningPathStore'
import { useAIStore } from '@/store/useAIStore'
import StatBar from './StatBar'

const BGM_BY_KEY = bgmLibrary as any

interface Scene {
  id: string
  title: string
  text: string
  npcName?: string
  npcRole?: string
  npcContext?: string
  choices: Array<{
    id: string
    text: string
    next: string
    outcome?: string
    historicalNote?: string
    effects?: Record<string, number>  // 后果系统:选项对状态值的增减
  }>
  ending?: string
  isFinal?: boolean
  isDeadEnd?: boolean
  npcClosing?: string
  image?: string
  /** 场景视频（优先于 image 播放） */
  video?: string
}

interface StatDef {
  id: string
  name: string
  emoji: string
  init: number
  max: number
}

interface Scenario {
  id: string
  title: string
  subtitle: string
  era: string
  year: number
  location: string
  icon: string
  color: string
  background: string
  stats?: { a: StatDef; b: StatDef }  // 后果系统:双值定义
  scenes: Scene[]
  endings: Array<{
    id: string
    title: string
    text: string
    isWin: boolean
    historicalReality: string
    lessons: string[]
    quadrant?: 'HH' | 'HL' | 'LH' | 'LL'  // 后果系统:象限映射
  }>
}

const scenarios = scenariosData as Scenario[]

interface Props {
  scenarioId: string
  onExit: () => void
}

export default function ScenarioPlayer({ scenarioId, onExit }: Props) {
  const scenario = scenarios.find(s => s.id === scenarioId)
  const [history, setHistory] = useState<string[]>([])  // 经过的 scene id
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null)
  const [outcomeText, setOutcomeText] = useState<string | null>(null)  // 选择后的过渡文字
  const [endingId, setEndingId] = useState<string | null>(null)
  const [showNpc, setShowNpc] = useState<{ name: string; role: string; context: string; closing?: string } | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  // 后果系统:两个状态值(仅当 scenario.stats 存在时启用)
  const [statA, setStatA] = useState(0)
  const [statB, setStatB] = useState(0)
  // 飘字反馈
  const [floatFx, setFloatFx] = useState<Array<{ key: number; emoji: string; delta: number }>>([])
  // 视频重新播放按钮
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [videoLoadFailed, setVideoLoadFailed] = useState(false)

  // 选择提交期间防双击
  const isChoosingRef = useRef(false)
  // 计时器追踪器：unmount / 场景切换时清理 setTimeout
  const outcomeTimersRef = useRef<Set<number>>(new Set())
  const floatFxTimersRef = useRef<Set<number>>(new Set())

  const setContext = useAIStore(s => s.setContext)
  const setPersonaPrompt = useAIStore(s => s.setPersonaPrompt)
  const newThread = useAIStore(s => s.newThread)
  const openPanel = useAIStore(s => s.openPanel)

  // 初始化：从第一个场景开始
  useEffect(() => {
    if (scenario && scenario.scenes.length > 0) {
      setCurrentSceneId(scenario.scenes[0].id)
      if (scenario.stats) {
        setStatA(scenario.stats.a.init)
        setStatB(scenario.stats.b.init)
      }
      // 启动场景 BGM（lobby 已触发穿越音，这里继续 BGM）
      audioEngine.start()
      const bgm = pickBGMForScenario(scenario.era, scenario.year)
      const entry = BGM_BY_KEY[`${bgm.style}_${bgm.mood}`] || BGM_BY_KEY.lobby
      const urls = entry?.urls || []
      audioEngine.playRemoteBGM(urls, bgm.mood)
    }
    return () => { audioEngine.stopBGM() }
  }, [scenario])

  // 场景变化时交叉淡入 BGM（保持连续不断）+ 朗读场景文字
  useEffect(() => {
    if (currentSceneId && scenario) {
      const scene = scenario.scenes.find(s => s.id === currentSceneId)
      if (scene) {
        const mood = pickBGMForScene(scene.title)
        const style = (scenario.era && ['法国', '英国', '德国', '罗马'].includes(scenario.era)) ? 'european' : 'chinese'
        const entry = BGM_BY_KEY[`${style}_${mood}`] || BGM_BY_KEY.lobby
        const urls = entry?.urls || []
        audioEngine.crossfadeBGM(urls, 1.2, mood)
        audioEngine.playPageTurn()
        // 朗读：拼接 标题 + 正文，浏览器原生中文 TTS
        speakScene(`${scene.title}。${scene.text}`)
      }
    }
    return () => { stopSpeak() }
  }, [currentSceneId, scenario])

  // 结局时停 BGM + 播放结局音
  useEffect(() => {
    if (endingId && scenario) {
      audioEngine.stopBGM()
      const ending = scenario.endings.find(e => e.id === endingId)
      if (ending) audioEngine.playEnding(ending.isWin)
    }
  }, [endingId, scenario])

  // ESC 退出
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const active = document.activeElement as HTMLElement | null
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
        return
      }
      e.stopPropagation()
      onExit()
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [onExit])

  if (!scenario) {
    return <div className="p-8 text-parchment-50">剧本未找到</div>
  }

  // 玩家名（从 scenario.subtitle 解析 "你是 XXX，..."）
  const playerName = scenario.subtitle.replace(/你是/, '').split(/[，,]/)[0].trim() || scenario.subtitle

  const currentScene = scenario.scenes.find(s => s.id === currentSceneId)
  const currentSceneIndex = scenario.scenes.findIndex(s => s.id === currentSceneId)
  const ending = endingId ? scenario.endings.find(e => e.id === endingId) : null

  // 当前场景的 key（用于动画重新触发）
  const sceneKey = currentSceneId || (ending ? `ending-${endingId}` : 'init')

  // 切换场景时重置视频结束状态 + isChoosing
  useEffect(() => {
    setVideoEnded(false)
    setVideoLoadFailed(false)
    isChoosingRef.current = false
  }, [sceneKey])

  // 组件卸载或剧本切换时清理所有未触发的计时器
  useEffect(() => {
    return () => {
      outcomeTimersRef.current.forEach(t => clearTimeout(t))
      outcomeTimersRef.current.clear()
      floatFxTimersRef.current.forEach(t => clearTimeout(t))
      floatFxTimersRef.current.clear()
    }
  }, [scenario])

  // 选择分支
  const handleChoice = (choice: Scene['choices'][0]) => {
    if (isChoosingRef.current) return  // 双击防御
    isChoosingRef.current = true
    audioEngine.playClick()

    // 同步计算本次选择的最终双值（避免 setState 异步导致象限误判）
    let projectedA = statA
    let projectedB = statB
    if (scenario.stats && choice.effects) {
      const aKey = scenario.stats.a.id
      const bKey = scenario.stats.b.id
      projectedA = Math.max(0, Math.min(scenario.stats.a.max, statA + (choice.effects[aKey] ?? 0)))
      projectedB = Math.max(0, Math.min(scenario.stats.b.max, statB + (choice.effects[bKey] ?? 0)))
    }

    // 飘字反馈
    if (scenario.stats && choice.effects) {
      const fx: Array<{ key: number; emoji: string; delta: number }> = []
      const aKey = scenario.stats.a.id
      const bKey = scenario.stats.b.id
      if (choice.effects[aKey]) {
        const d = choice.effects[aKey]
        setStatA(v => Math.max(0, Math.min(scenario.stats!.a.max, v + d)))
        fx.push({ key: Date.now(), emoji: scenario.stats.a.emoji, delta: d })
      }
      if (choice.effects[bKey]) {
        const d = choice.effects[bKey]
        setStatB(v => Math.max(0, Math.min(scenario.stats!.b.max, v + d)))
        fx.push({ key: Date.now() + 1, emoji: scenario.stats.b.emoji, delta: d })
      }
      if (fx.length) {
        setFloatFx(fx)
        const t = window.setTimeout(() => setFloatFx([]), 1500)
        floatFxTimersRef.current.add(t)
      }
    }

    // 显示 outcome（如果有）
    if (choice.outcome) {
      setOutcomeText(choice.outcome)
      const t = window.setTimeout(() => {
        setOutcomeText(null)
        proceedToNext(choice.next, projectedA, projectedB)
      }, 1500)
      outcomeTimersRef.current.add(t)
    } else {
      proceedToNext(choice.next, projectedA, projectedB)
    }

    // 推进历史
    setHistory(h => [...h, currentSceneId!, choice.id])
  }

  const proceedToNext = (nextSceneId: string, projectedA?: number, projectedB?: number) => {
    const next = scenario.scenes.find(s => s.id === nextSceneId)
    // 判定本步是否进入结局:
    //   1) next 是带 ending 字段的场景(如即时失败场景),取 next.ending
    //   2) next 不是任何场景,但本身就是一个结局 id(如拿破仑 s3 选项直连 ending_xxx)
    let baseEnding: string | null = null
    if (next?.ending) {
      baseEnding = next.ending
    } else if (!next && scenario.endings.some(e => e.id === nextSceneId)) {
      baseEnding = nextSceneId
    }

    if (baseEnding) {
      // 后果系统:若剧本启用 stats 且存在象限结局,按投影值(或当前 state)选结局
      let targetEnding = baseEnding
      if (scenario.stats) {
        const aVal = projectedA ?? statA
        const bVal = projectedB ?? statB
        const half = scenario.stats.a.max / 2
        const aHigh = aVal >= half
        const bHigh = bVal >= half
        const quad = `${aHigh ? 'H' : 'L'}${bHigh ? 'H' : 'L'}` as 'HH' | 'HL' | 'LH' | 'LL'
        const quadEnding = scenario.endings.find(e => e.quadrant === quad)
        if (quadEnding) targetEnding = quadEnding.id
      }
      setEndingId(targetEnding)
      setCurrentSceneId(null)
      // 记录完成
      const s = useLearningPathStore.getState()
      const completed = [...(s.progressByPath.timeTravel.completedScenarios ?? []), scenario.id]
      const unique = Array.from(new Set(completed))
      // 支持多结局：每个剧本可解锁多个 ending
      const currentEndings = s.progressByPath.timeTravel.scenarioEndings?.[scenario.id] ?? []
      const newEndings = currentEndings.includes(targetEnding)
        ? currentEndings
        : [...currentEndings, targetEnding]
      const endings = { ...(s.progressByPath.timeTravel.scenarioEndings ?? {}), [scenario.id]: newEndings }
      useLearningPathStore.setState({
        progressByPath: {
          ...s.progressByPath,
          timeTravel: {
            ...s.progressByPath.timeTravel,
            completedScenarios: unique,
            scenarioEndings: endings,
            lastVisitedAt: Date.now(),
          }
        }
      })
    } else if (next) {
      setCurrentSceneId(nextSceneId)
    }
    // 既非结局又非有效场景 → 静默忽略(异常防御)
  }

  const handleNpcTalk = () => {
    if (!currentScene?.npcName) return
    // 用 AI 准备 persona 上下文
    const npcContext = currentScene.npcContext ?? `你是${currentScene.npcName}，${currentScene.npcRole}。`
    const fullContext = `场景：${scenario.title} (${scenario.year}年，${scenario.location})\n你是${currentScene.npcName}（${currentScene.npcRole}）。\n\n${npcContext}\n\n玩家正在扮演剧本中的关键人物。你可以：\n1. 回答玩家的问题\n2. 透露一些历史背景\n3. 暗示玩家可能的选择\n4. 表达你的态度（忠臣/对手/谋士等）\n\n请以第一人称回答，简短有特色，1-3 段话。`
    setContext(null, null, null)
    setPersonaPrompt(enhanceNpcPersona(fullContext, currentScene.npcName))
    newThread(`与 ${currentScene.npcName} 交谈`)
    openPanel()
  }

  const handleNpcClosing = () => {
    if (!currentScene?.npcName) return
    const npcContext = currentScene.npcContext ?? `你是${currentScene.npcName}。`
    const fullContext = `${npcContext}\n\n场景：${scenario.title} (${scenario.year}年)\n你刚刚亲眼目睹了玩家做出的关键决定。请以第一人称回应玩家的选择，1-2 段话。`
    setContext(null, null, null)
    setPersonaPrompt(enhanceNpcPersona(fullContext, currentScene.npcName))
    newThread(`${currentScene.npcName} 的回应`)
    openPanel()
  }

  // 结局页
  if (ending) {
    return <EndingView scenario={scenario} ending={ending} onExit={onExit} onReplay={() => {
      isChoosingRef.current = false
      setHistory([])
      setCurrentSceneId(scenario.scenes[0].id)
      setOutcomeText(null)
      setEndingId(null)
    }} />
  }

  // 当前场景不存在（异常）
  if (!currentScene) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-ink-900">
        <div className="text-center">
          <div className="text-ink-400 mb-4">加载中...</div>
          <button onClick={onExit} className="px-4 py-2 rounded-lg bg-bronze-700/40 text-bronze-200">返回</button>
        </div>
      </div>
    )
  }

  // 进度
  const totalScenes = scenario.scenes.length
  const currentIdx = scenario.scenes.findIndex(s => s.id === currentSceneId)
  const progressPct = ((currentIdx + 1) / totalScenes) * 100

  // 场景图片（用 Bing 搜索关键字）
  const sceneImg = currentScene.image
    ? bingImage(`${scenario.title} ${currentScene.image}`, 1200, 400)
    : bingImage(`${scenario.title} ${currentScene.title}`, 1200, 400)

  return (
    <div className="w-full h-full bg-ink-900 overflow-y-auto relative">
      {/* 背景迷雾：暗色 vignette + 微弱粒子（CSS 实现） */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)',
      }} />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,212,122,0.05) 0px, transparent 50%), radial-gradient(circle at 80% 70%, rgba(91,156,200,0.05) 0px, transparent 50%)',
      }} />
      <div className="max-w-3xl mx-auto px-6 py-6 relative z-10">
        {/* 顶部：进度 + 退出 */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-ink-500 uppercase tracking-wider">{scenario.era} · {scenario.year}年 · {scenario.location}</div>
            <h1 className="text-lg font-serif" style={{ color: scenario.color }}>{scenario.title}</h1>
          </div>
          <button onClick={onExit} className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700">×</button>
        </div>

        {/* 进度条 */}
        <div className="mb-6 h-1 bg-ink-700 rounded-full overflow-hidden">
          <div className="h-full transition-all" style={{ width: `${progressPct}%`, background: scenario.color }} />
        </div>

        {/* 后果系统:双值状态栏 */}
        {scenario.stats && (
          <StatBar
            statA={scenario.stats.a}
            statB={scenario.stats.b}
            valueA={statA}
            valueB={statB}
            color={scenario.color}
          />
        )}

        {/* 场景图：优先播放视频，否则用 SceneStage */}
        <div key={`img-${sceneKey}`} className="mb-4 rounded-lg overflow-hidden border border-ink-700 relative" style={{ aspectRatio: '3/1' }}>
          {currentScene.video && !videoLoadFailed ? (
            <>
              <video
                key={`vid-${sceneKey}`}
                ref={setVideoEl}
                src={currentScene.video}
                autoPlay
                muted
                playsInline
                loop
                preload="metadata"
                className="w-full h-full object-cover"
                onError={() => setVideoLoadFailed(true)}
              />
              {/* 循环模式下不再覆盖"重新播放"按钮 — 视频自动无缝循环，配音独立播放 */}
              {false && videoEnded && (
                <button
                  onClick={() => {
                    if (videoEl) {
                      videoEl.currentTime = 0
                      videoEl.play()
                    }
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-ink-900/70 hover:bg-ink-900/85 transition-colors"
                >
                  <div className="px-6 py-3 rounded-full bg-bronze-600 hover:bg-bronze-500 text-parchment-50 font-serif text-lg flex items-center gap-2 shadow-2xl">
                    <span className="text-2xl">▶</span>
                    重新播放
                  </div>
                </button>
              )}
            </>
          ) : (
            <img
              key={`img-${sceneKey}`}
              src={sceneImg}
              alt={currentScene.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* 场景标题 + 玩家头像 — 用 key 触发渐入动画 */}
        <div key={`player-${sceneKey}`} className="mb-4 flex items-center gap-3" style={{ animation: 'scene-fade-in 0.5s ease-out' }}>
          <PlayerAvatar name={playerName} color={scenario.color} size={56} />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-ink-500 uppercase tracking-wider">你正扮演</div>
            <div className="text-sm font-serif" style={{ color: scenario.color }}>{playerName}</div>
          </div>
          <VolumeControl />
        </div>

        {/* 场景标题 */}
        <div key={`title-${sceneKey}`} className="mb-3 flex items-center gap-2" style={{ animation: 'scene-slide-up 0.6s ease-out 0.1s both' }}>
          <span className="text-2xl">{scenario.icon}</span>
          <h2 className="text-2xl font-serif text-parchment-50">{currentScene.title}</h2>
        </div>

        {/* 场景文字 */}
        <div key={`text-${sceneKey}`} className="mb-6 p-5 rounded-lg bg-ink-800/80 border border-ink-700 text-base text-parchment-100 leading-relaxed font-serif" style={{ animation: 'scene-slide-up 0.6s ease-out 0.2s both' }}>
          {currentScene.text}
        </div>

        {/* NPC 信息 + 对话按钮 */}
        {currentScene.npcName && (
          <div className="mb-6 p-4 rounded-lg bg-purple-900/20 border border-purple-700/40 flex items-center gap-3">
            <CharacterAvatar name={currentScene.npcName} size={56} />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-purple-300 uppercase tracking-wider mb-1">场景 NPC</div>
              <div className="text-base text-parchment-50 font-serif">
                <strong>{currentScene.npcName}</strong>
              </div>
            </div>
            <button
              onClick={handleNpcTalk}
              className="px-3 py-2 rounded-lg bg-purple-700/40 hover:bg-purple-600/60 border border-purple-500/50 text-purple-200 text-sm whitespace-nowrap"
            >
              💬 和 {currentScene.npcName} 谈谈
            </button>
          </div>
        )}

        {/* outcome 过渡 */}
        {outcomeText && (
          <div className="mb-6 p-4 rounded-lg border text-center" style={{
            background: scenario.color + '20',
            borderColor: scenario.color + '60',
          }}>
            <div className="text-sm" style={{ color: scenario.color }}>{outcomeText}</div>
          </div>
        )}

        {/* 选项 */}
        {!outcomeText && (
          <div className="space-y-2">
            <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">你的选择</div>
            {currentScene.choices.map(c => (
              <button
                key={c.id}
                onClick={() => handleChoice(c)}
                className="w-full text-left p-4 rounded-lg border-2 border-ink-700 bg-ink-800/60 hover:border-bronze-500 hover:bg-ink-700/80 transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-parchment-50 group-hover:text-bronze-200 transition-colors">{c.text}</div>
                  {scenario.stats && c.effects && (
                    <div className="flex items-center gap-2 shrink-0 text-xs">
                      {c.effects[scenario.stats.a.id] ? (
                        <span className={c.effects[scenario.stats.a.id] > 0 ? 'text-success' : 'text-danger'}>
                          {scenario.stats.a.emoji}{c.effects[scenario.stats.a.id] > 0 ? '↑' : '↓'}
                        </span>
                      ) : null}
                      {c.effects[scenario.stats.b.id] ? (
                        <span className={c.effects[scenario.stats.b.id] > 0 ? 'text-success' : 'text-danger'}>
                          {scenario.stats.b.emoji}{c.effects[scenario.stats.b.id] > 0 ? '↑' : '↓'}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 最终场景：显示 NPC closing + 完成按钮 */}
        {currentScene.isFinal && currentScene.npcClosing && currentScene.npcName && !outcomeText && (
          <div className="mt-6 p-5 rounded-lg bg-bronze-900/30 border border-bronze-600/40 flex items-start gap-3">
            <CharacterAvatar name={currentScene.npcName} size={48} />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-bronze-400 uppercase tracking-wider mb-2">📜 {currentScene.npcName} 说</div>
              <div className="text-sm text-parchment-100 italic leading-relaxed font-serif mb-3">{currentScene.npcClosing}</div>
              <button
                onClick={handleNpcClosing}
                className="px-3 py-1.5 rounded-lg bg-purple-700/40 hover:bg-purple-600/60 border border-purple-500/50 text-purple-200 text-xs"
              >💬 回应</button>
            </div>
          </div>
        )}
      </div>

      {/* 后果系统:状态值变化飘字 */}
      {floatFx.length > 0 && (
        <div className="fixed left-1/2 top-32 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1">
          {floatFx.map(f => (
            <div
              key={f.key}
              className={`text-lg font-serif tabular-nums ${f.delta > 0 ? 'text-success' : 'text-danger'}`}
              style={{ animation: 'stat-float 1.5s ease-out forwards' }}
            >
              {f.emoji} {f.delta > 0 ? '+' : ''}{f.delta}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
function enhanceNpcPersona(rawContext: string, npcName: string): string {
  return `${rawContext}\n\n[角色扮演守则]\n- 第一人称（"我"）\n- 符合历史人物的真实性格\n- 不编造确凿不存在的事件\n- 简洁（1-3 段话）\n- 用中文回答\n- 不要解释你是 AI`
}

// ============= 朗读（Edge TTS 代理 — localhost:4370）=============
const TTS_PROXY = 'http://127.0.0.1:4370'
const MALE_VOICES = [
  'zh-CN-YunyangNeural',   // 云扬 — 浑厚新闻男声
  'zh-CN-YunjianNeural',   // 云剑 — 沉稳男声
  'zh-CN-YunxiNeural',     // 云希 — 青年男声
  'zh-CN-YunxiaNeural',    // 云夏 — 温和男声
]

let activeAudio: HTMLAudioElement | null = null
let ttsAbortController: AbortController | null = null
let ttsEnabled = true

async function speakScene(text: string) {
  if (typeof window === 'undefined') return
  if (ttsEnabled === false) return

  stopSpeak()

  const cleanText = text.replace(/<[^>]+>/g, '').slice(0, 3000)
  ttsAbortController = new AbortController()
  const signal = ttsAbortController.signal

  for (const voice of MALE_VOICES) {
    if (signal.aborted) return
    try {
      const params = new URLSearchParams({ text: cleanText, voice, rate: '-5%', pitch: '-5Hz' })
      const resp = await fetch(`${TTS_PROXY}/speak?${params}`, { signal })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

      const blob = await resp.blob()
      if (signal.aborted) return
      if (blob.size === 0) throw new Error('Empty response')

      const url = URL.createObjectURL(blob)
      activeAudio = new Audio(url)
      activeAudio.volume = 0.85
      activeAudio.onended = () => {
        if (activeAudio?.src === url) URL.revokeObjectURL(url)
      }
      await activeAudio.play()
      if (import.meta.env.DEV) console.log('[TTS] proxy OK:', voice, blob.size, 'bytes')
      return // 成功
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      if (import.meta.env.DEV) console.warn(`[TTS] proxy ${voice} 失败:`, (e as Error).message)
    }
  }

  // 回退：浏览器 SpeechSynthesis
  fallbackSpeak(cleanText)
}

function fallbackSpeak(text: string) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'zh-CN'
  u.rate = 0.9
  u.pitch = 0.7
  u.volume = 0.85

  const voices = window.speechSynthesis.getVoices()
  const FEMALE_NAMES = [
    'Xiaoxiao', 'Xiaoyi', 'Xiaobei', 'Xiaohan', 'Xiaomeng', 'Xiaoshuang', 'Xiaochen',
    'Huihui', 'Yaoyao', 'Hanhan', 'Lili', 'Xixi', 'Lingling', 'Shanshan',
    'Xinyi', 'Yuhan', 'Yueyue', 'Female', '女',
  ]
  const zhCN = voices.filter(v => v.lang.startsWith('zh-CN'))
  const male = zhCN.find(v => !FEMALE_NAMES.some(f => v.name.includes(f))) ?? null
  if (male) u.voice = male
  window.speechSynthesis.speak(u)
}

function stopSpeak() {
  if (ttsAbortController) { ttsAbortController.abort(); ttsAbortController = null }
  if (activeAudio) { activeAudio.pause(); activeAudio.currentTime = 0; activeAudio = null }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

// 音量控制（极简）
function VolumeControl() {
  const [muted, setMuted] = useState(audioEngine.isMuted())
  const [vol, setVol] = useState(audioEngine.getVolume())
  const [speaking, setSpeaking] = useState(true)

  const toggleMuted = () => {
    const m = !muted
    setMuted(m)
    audioEngine.setMuted(m)
  }
  const toggleSpeaking = () => {
    const next = !speaking
    setSpeaking(next)
    ttsEnabled = next
    if (!next) stopSpeak()
  }
  const onVolChange = (v: number) => {
    setVol(v)
    audioEngine.setVolume(v)
    if (muted && v > 0) { setMuted(false); audioEngine.setMuted(false) }
  }

  return (
    <div className="flex items-center gap-1.5 bg-ink-800/60 backdrop-blur border border-ink-600 rounded-full px-2 py-1">
      <button
        onClick={toggleSpeaking}
        className="text-xs hover:scale-105 transition-transform px-1"
        title={speaking ? '关闭朗读' : '开启朗读'}
      >
        {speaking ? '🔊 朗读' : '🔇 静读'}
      </button>
      <div className="w-px h-4 bg-ink-600" />
      <input
        type="range"
        min="0" max="1" step="0.05"
        value={vol}
        onChange={e => onVolChange(parseFloat(e.target.value))}
        className="w-16 h-1 accent-bronze-500"
        style={{ filter: muted ? 'grayscale(1)' : 'none' }}
      />
    </div>
  )
}

// ============= 结局页 =============
function EndingView({ scenario, ending, onExit, onReplay }: {
  scenario: Scenario
  ending: NonNullable<Scenario['endings'][number]>
  onExit: () => void
  onReplay: () => void
}) {
  return (
    <div className="w-full h-full bg-ink-900 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* 顶部 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-ink-500 uppercase tracking-wider">剧本结束</div>
            <h1 className="text-lg font-serif" style={{ color: scenario.color }}>{scenario.title}</h1>
          </div>
          <button onClick={onExit} className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700">×</button>
        </div>

        {/* 结局标题 */}
        <div className="mb-6 p-6 rounded-lg text-center" style={{ background: ending.isWin ? 'linear-gradient(135deg, #5bc89a30 0%, transparent 100%)' : 'linear-gradient(135deg, #b8545030 0%, transparent 100%)' }}>
          <div className="text-5xl mb-3">{ending.isWin ? '🏆' : '💀'}</div>
          <h2 className="text-3xl font-serif text-parchment-50 mb-3">{ending.title}</h2>
          <p className="text-base text-parchment-100 leading-relaxed font-serif max-w-xl mx-auto">{ending.text}</p>
        </div>

        {/* 历史真相 */}
        <div className="mb-6 p-5 rounded-lg bg-amber-900/20 border border-amber-700/40">
          <div className="text-xs text-amber-400 uppercase tracking-wider mb-2">📜 真实历史</div>
          <p className="text-sm text-parchment-100 leading-relaxed">{ending.historicalReality}</p>
        </div>

        {/* 启示 */}
        <div className="mb-6 p-5 rounded-lg bg-purple-900/20 border border-purple-700/40">
          <div className="text-xs text-purple-300 uppercase tracking-wider mb-2">💡 启示</div>
          <ul className="space-y-1.5">
            {ending.lessons.map((lesson, i) => (
              <li key={i} className="text-sm text-parchment-100 flex items-start gap-2">
                <span className="text-purple-400">▸</span>
                <span>{lesson}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 操作 */}
        <div className="flex gap-3">
          <button
            onClick={onReplay}
            className="flex-1 px-4 py-3 rounded-lg font-serif text-base transition-colors"
            style={{ background: scenario.color, color: '#0f0e0c' }}
          >
            🔁 再玩一次
          </button>
          <button
            onClick={onExit}
            className="flex-1 px-4 py-3 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-parchment-50 font-serif text-base transition-colors"
          >
            📚 返回剧本列表
          </button>
        </div>
      </div>
    </div>
  )
}

// useAIStore 全局（避免每次调用 import）
