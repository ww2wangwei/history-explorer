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
  endings: Array<{ id: string; isWin: boolean; title: string }>
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

  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, onClose])

  if (!isActive) return null

  return (
    <div className="w-full h-full bg-gradient-to-b from-ink-900 via-ink-900 to-ink-800 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-serif text-bronze-300 mb-1">🎭 穿越历史</h1>
            <p className="text-sm text-ink-400">
              化身历史人物，在关键节点做选择。3 个剧本 · 7 个结局 · 你的决定塑造历史。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LobbyVolumeControl />
            <button
              onClick={onClose}
              className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-ink-700"
              title="返回 (ESC)"
            >×</button>
          </div>
        </div>

        {/* 已完成进度 */}
        {completedScenarios.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-900/20 border border-emerald-700/40">
            <div className="text-xs text-emerald-300">
              ✓ 已通关 <span className="text-lg font-serif">{completedScenarios.length}</span> / {scenarios.length} 个剧本
              {Object.keys(scenarioEndings).length > 0 && (
                <span className="ml-3">· 达成 {Object.keys(scenarioEndings).length} 个结局</span>
              )}
            </div>
          </div>
        )}

        {/* 剧本列表 */}
        <div className="space-y-4">
          {scenarios.map(sc => {
            const completed = completedScenarios.includes(sc.id)
            const myEndingId = scenarioEndings[sc.id]
            const myEnding = myEndingId ? sc.endings.find(e => e.id === myEndingId) : null
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
                    name={sc.subtitle.replace(/你是|，.*/g, '').trim() || sc.title}
                    searchKeyword={`${sc.subtitle.split('，')[0].replace('你是', '')} portrait historical`}
                    size={80}
                    className="rounded-full ring-2 ring-offset-2 ring-offset-ink-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-2xl font-serif text-parchment-50">{sc.title}</h2>
                      {completed && <span className="text-xs px-2 py-0.5 rounded bg-emerald-700/40 text-emerald-300 border border-emerald-600/50">✓ 已通关</span>}
                      <span className="text-xs text-ink-500">· {sc.era} · {sc.year} 年 · {sc.location}</span>
                    </div>
                    <div className="text-sm text-bronze-300 mb-2">{sc.subtitle}</div>
                    <p className="text-sm text-ink-300 leading-relaxed mb-3">{sc.background}</p>
                    {myEnding && (
                      <div className="mb-3 p-2 rounded bg-ink-900/60 border border-bronze-700/30 text-xs">
                        <span className="text-ink-500">上次结局：</span>
                        <span className="text-bronze-300 font-serif">{myEnding.title}</span>
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
                        className="px-5 py-2 rounded font-serif text-base transition-colors hover:scale-105 active:scale-95"
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
