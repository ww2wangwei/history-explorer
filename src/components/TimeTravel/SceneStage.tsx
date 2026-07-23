/**
 * SceneStage — 承载 SceneCinematic 的实时播放舞台
 * - 用 @remotion/player 的 <Player> 实时渲染动画
 * - prefers-reduced-motion:降级为静态图 + 暗角
 * - 图加载失败 / Player 异常:回退静态图
 * - motion 未指定时按 sceneIndex 自动轮换
 */
import { useState } from 'react'
import { Player } from '@remotion/player'
import { SceneCinematic, type CinematicMotion, type SceneCinematicProps } from './SceneCinematic'

const MOTION_CYCLE: CinematicMotion[] = ['zoom-in', 'pan-right', 'zoom-out', 'pan-left', 'diagonal']

interface Props {
  imageUrl: string
  /** 场景在剧本中的索引,用于自动轮换镜头运动 */
  sceneIndex: number
  /** 显式指定镜头运动(可选) */
  motion?: CinematicMotion
  color?: string
  /** 用于切场景时重挂载 */
  sceneKey: string
}

const FPS = 30
const DURATION = 300 // 10s

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export default function SceneStage({ imageUrl, sceneIndex, motion, color, sceneKey }: Props) {
  const [failed, setFailed] = useState(false)
  const resolvedMotion: CinematicMotion = motion ?? MOTION_CYCLE[Math.max(0, sceneIndex) % MOTION_CYCLE.length]
  const reduced = prefersReducedMotion()

  // 回退:reduced-motion 或加载失败 → 静态图 + 暗角
  if (reduced || failed) {
    return (
      <div className="relative w-full h-full bg-ink-900 overflow-hidden">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.55)' }} />
      </div>
    )
  }

  const inputProps: SceneCinematicProps = { imageUrl, motion: resolvedMotion, color: color ?? '#000000' }

  return (
    <div className="relative w-full h-full bg-ink-900 overflow-hidden">
      <Player
        key={sceneKey}
        component={SceneCinematic}
        inputProps={inputProps}
        durationInFrames={DURATION}
        fps={FPS}
        compositionWidth={1200}
        compositionHeight={400}
        style={{ width: '100%', height: '100%' }}
        autoPlay
        loop
        controls={false}
        showVolumeControls={false}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        spaceKeyToPlayOrPause={false}
      />
    </div>
  )
}
