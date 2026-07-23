/**
 * TimeTravelLobby — 剧本选择大厅
 * 列出 3 个剧本，显示完成情况，点击进入
 */
import { useEffect, useState } from 'react'
import { useLearningPathStore } from '@/store/useLearningPathStore'
import { audioEngine, pickBGMForScenario } from '@/utils/audioEngine'
import bgmLibrary from '@/data/bgmLibrary.json'
import CharacterAvatar from './CharacterAvatar'
import scenariosData from '@/data/scenarios.json'

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
  scenes: Array<{ id: string }>
  endings: Array<{ id: string; isWin: boolean; title: string; text: string; historicalReality: string; lessons: string[] }>
}

const scenarios = scenariosData as Scenario[]

interface Props {
  isActive: boolean
  onClose: () => void
  onStart: (scenarioId: string) => void
}

export default function TimeTravelLobby({ isActive, onClose, onStart }: Props) {
  const completedScenarios = useLearningPathStore(s => s.progressByPath.timeTravel.completedScenarios) ?? []
  const scenarioEndings = useLearningPathStore(s => s.progressByPath.timeTravel.scenarioEndings) ?? {}
  const [region, setRegion] = useState<'all' | 'china' | 'world'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unplayed' | 'completed'>('all')
  const [showEndingsAtlas, setShowEndingsAtlas] = useState(false)

  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, onClose])

  if (!isActive) return null

  // 过滤剧本
  const filteredScenarios = scenarios.filter(sc => {
    if (region === 'china' && !['唐', '宋', '元', '明', '清', '三国', '汉', '秦', '隋'].includes(sc.era)) return false
    if (region === 'world' && ['唐', '宋', '元', '明', '清', '三国', '汉', '秦', '隋'].includes(sc.era)) return false
    if (statusFilter === 'unplayed' && completedScenarios.includes(sc.id)) return false
    if (statusFilter === 'completed' && !completedScenarios.includes(sc.id)) return false
    return true
  })

  return (
    <div className="w-full h-full bg-gradient-to-b from-ink-900 via-ink-900 to-ink-800 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-serif text-bronze-300 mb-1">🎭 穿越历史</h1>
            <p className="text-sm text-ink-400">
              化身历史人物，在关键节点做选择。{scenarios.length} 个剧本 · 多个结局 · 你的决定塑造历史。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LobbyVolumeControl />
            <button
              onClick={onClose}
              className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700"
              title="返回 (ESC)"
              aria-label="返回"
            >×</button>
          </div>
        </div>

        {/* 已完成进度 */}
        {completedScenarios.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-900/20 border border-emerald-700/40 flex items-center justify-between">
            <div className="text-xs text-emerald-300">
              ✓ 已通关 <span className="text-lg font-serif">{completedScenarios.length}</span> / {scenarios.length} 个剧本
              {Object.keys(scenarioEndings).length > 0 && (
                <span className="ml-3">· 达成 {(() => {
                  const total = Object.values(scenarioEndings).reduce((sum, arr) => sum + (arr?.length ?? 0), 0)
                  return total
                })()} 个结局</span>
              )}
            </div>
            <button
              onClick={() => setShowEndingsAtlas(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-700/40 hover:bg-amber-600/60 border border-amber-600/50 text-amber-200 transition-colors"
            >
              🏆 结局总览
            </button>
          </div>
        )}

        {/* 筛选条 */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex rounded-lg bg-ink-800/60 border border-ink-600 overflow-hidden text-xs">
            {(['all', 'china', 'world'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-3 py-1.5 transition-colors ${region === r ? 'bg-bronze-700/40 text-bronze-200' : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-700'}`}
              >
                {r === 'all' ? '全部' : r === 'china' ? '🇨🇳 中国' : '🌍 世界'}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg bg-ink-800/60 border border-ink-600 overflow-hidden text-xs">
            {(['all', 'unplayed', 'completed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 transition-colors ${statusFilter === s ? 'bg-bronze-700/40 text-bronze-200' : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-700'}`}
              >
                {s === 'all' ? '全部状态' : s === 'unplayed' ? '🆕 未通关' : '✓ 已通关'}
              </button>
            ))}
          </div>
          <span className="text-xs text-ink-500 ml-auto">
            {filteredScenarios.length} / {scenarios.length} 个剧本
          </span>
        </div>

        {/* 剧本列表 */}
        {filteredScenarios.length === 0 ? (
          <div className="text-center text-ink-500 py-12">没有匹配的剧本</div>
        ) : (
        <div className="space-y-4">
          {filteredScenarios.map(sc => {
            const completed = completedScenarios.includes(sc.id)
            const myEndingIds = scenarioEndings[sc.id] ?? []
            const unlockedCount = myEndingIds.length
            const totalEndings = sc.endings.length
            const myEnding = myEndingIds.length > 0 ? sc.endings.find(e => e.id === myEndingIds[0]) : null
            return (
              <div
                key={sc.id}
                className="p-6 rounded-lg border-2 transition-all hover:border-bronze-500/80 group"
                style={{
                  background: `linear-gradient(135deg, ${sc.color}20 0%, transparent 60%)`,
                  borderColor: completed ? sc.color + '80' : 'rgba(90, 90, 106, 0.4)',
                }}
              >
                <div className="flex items-start gap-4">
                  <CharacterAvatar
                    name={sc.title}
                    searchKeyword={`${sc.title} ${sc.era} historical scene`}
                    size={80}
                    className="rounded-full ring-2 ring-offset-2 ring-offset-ink-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-2xl font-serif text-parchment-50">{sc.title}</h2>
                      {completed && <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-700/40 text-emerald-300 border border-emerald-600/50">✓ 已通关</span>}
                      <span className="text-xs text-ink-500">· {sc.era} · {sc.year} 年 · {sc.location}</span>
                    </div>
                    <div className="text-sm text-bronze-300 mb-2">{sc.subtitle}</div>
                    <p className="text-sm text-ink-300 leading-relaxed mb-3">{sc.background}</p>
                    {myEnding && (
                      <div className="mb-3 p-2 rounded-lg bg-ink-900/60 border border-bronze-700/30 text-xs">
                        <span className="text-ink-500">上次结局：</span>
                        <span className="text-bronze-300 font-serif">{myEnding.title}</span>
                      </div>
                    )}
                    {/* 结局解锁进度 */}
                    {totalEndings > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-ink-500">结局解锁</span>
                          <span className={unlockedCount === totalEndings ? 'text-emerald-400 font-serif' : 'text-bronze-300'}>
                            {unlockedCount} / {totalEndings}
                          </span>
                        </div>
                        <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${(unlockedCount / totalEndings) * 100}%`,
                              background: unlockedCount === totalEndings ? '#5bc89a' : sc.color,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          // 触发穿越音效 + 切场景 BGM
                          audioEngine.start()
                          audioEngine.playTimeTravel()
                          const bgm = pickBGMForScenario(sc.era, sc.year)
                          const key = `${bgm.style}_${bgm.mood}`
                          const entry = (bgmLibrary as any)[key] || (bgmLibrary as any).lobby
                          const urls = entry?.urls || []
                          audioEngine.playRemoteBGM(urls)
                          audioEngine.playClick()
                          // 短延迟让音效先响再切换场景
                          setTimeout(() => onStart(sc.id), 600)
                        }}
                        className="px-5 py-2 rounded-lg font-serif text-base transition-colors hover:scale-105 active:scale-95"
                        style={{
                          background: sc.color,
                          color: '#0f0e0c',
                        }}
                      >
                        {completed ? '🔁 再玩一次' : '▶ 穿越开始'}
                      </button>
                      <div className="text-xs text-ink-500">
                        {sc.scenes.length} 个场景 · {sc.endings.length} 种结局
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        )}

        {/* 提示 */}
        <div className="mt-8 p-4 rounded-lg bg-ink-800/60 border border-ink-700 text-sm text-ink-400 space-y-1">
          <div className="text-bronze-300 font-serif mb-2">💡 玩法说明</div>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>点击 "▶ 穿越开始" 进入剧本，化身历史人物</li>
            <li>每个场景末尾有 2-3 个选项，你的选择将影响后续剧情</li>
            <li>遇到关键 NPC 时可点"和 XX 谈谈" — AI 角色会与你对话</li>
            <li>剧本结束会显示"你改变的历史 vs 真实历史"</li>
            <li>每个剧本可重玩，探索不同选择和结局</li>
          </ul>
        </div>
      </div>

      {/* 结局总览图谱 */}
      {showEndingsAtlas && (
        <EndingsAtlas
          scenarioEndings={scenarioEndings}
          onClose={() => setShowEndingsAtlas(false)}
        />
      )}
    </div>
  )
}

// Lobby 专用音量控制
function LobbyVolumeControl() {
  const [muted, setMuted] = useState(audioEngine.isMuted())
  const [vol, setVol] = useState(audioEngine.getVolume())
  const toggleMuted = () => {
    const m = !muted
    setMuted(m)
    audioEngine.setMuted(m)
  }
  const onVolChange = (v: number) => {
    setVol(v)
    audioEngine.setVolume(v)
    if (muted && v > 0) { setMuted(false); audioEngine.setMuted(false) }
  }
  return (
    <div className="flex items-center gap-1.5 bg-ink-800/60 backdrop-blur border border-ink-600 rounded-full px-2 py-1">
      <button onClick={toggleMuted} className="text-base hover:scale-110 transition-transform" title={muted ? '取消静音' : '静音'}>
        {muted ? '🔇' : '🔊'}
      </button>
      <input type="range" min="0" max="1" step="0.05" value={vol} onChange={e => onVolChange(parseFloat(e.target.value))} className="w-16 h-1 accent-bronze-500" style={{ filter: muted ? 'grayscale(1)' : 'none' }} />
    </div>
  )
}

// 结局总览图谱
function EndingsAtlas({ scenarioEndings, onClose }: { scenarioEndings: Record<string, string[]>; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [onClose])

  const totalEndings = scenarios.reduce((sum, sc) => sum + sc.endings.length, 0)
  const unlockedEndings = Object.values(scenarioEndings).reduce((sum, arr) => sum + (arr?.length ?? 0), 0)

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-900/90 backdrop-blur p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-amber-700/40 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-amber-700/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif text-amber-300 flex items-center gap-2">🏆 结局总览</h2>
            <p className="text-xs text-ink-400 mt-1">
              你已解锁 <span className="text-amber-300 font-serif">{unlockedEndings}</span> / {totalEndings} 个结局
              （{Math.round((unlockedEndings / totalEndings) * 100)}%）
            </p>
          </div>
          <button onClick={onClose} className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700">×</button>
        </div>

        <div className="p-6 space-y-6">
          {scenarios.map(sc => {
            const unlocked = scenarioEndings[sc.id] ?? []
            return (
              <div key={sc.id} className="p-4 rounded-lg border" style={{ borderColor: sc.color + '40', background: `${sc.color}08` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{sc.icon}</span>
                    <h3 className="text-base font-serif" style={{ color: sc.color }}>{sc.title}</h3>
                  </div>
                  <div className="text-xs">
                    <span className={unlocked.length === sc.endings.length ? 'text-emerald-400 font-serif' : 'text-ink-400'}>
                      {unlocked.length} / {sc.endings.length}
                    </span>
                  </div>
                </div>
                {/* 结局网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sc.endings.map(ending => {
                    const isUnlocked = unlocked.includes(ending.id)
                    return (
                      <div
                        key={ending.id}
                        className={`p-3 rounded-lg border text-xs ${isUnlocked ? '' : 'opacity-40 grayscale'}`}
                        style={{
                          borderColor: isUnlocked ? ending.isWin ? '#5bc89a' : '#b85450' : 'rgba(90, 90, 106, 0.4)',
                          background: isUnlocked ? 'rgba(15,14,12,0.4)' : 'transparent',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{isUnlocked ? (ending.isWin ? '🏆' : '💀') : '❓'}</span>
                          <span className={`font-serif ${isUnlocked ? 'text-parchment-50' : 'text-ink-500'}`}>
                            {isUnlocked ? ending.title : '???'}
                          </span>
                        </div>
                        {isUnlocked ? (
                          <p className="text-ink-300 leading-relaxed line-clamp-3">{ending.text}</p>
                        ) : (
                          <p className="text-ink-600 italic">未解锁</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
