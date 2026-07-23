/**
 * SceneCinematic — 穿越历史单幕动画(Remotion 组件)
 * 配图 + 缓慢镜头运动(Ken Burns)+ 极淡光影扫过 + 静态暗角。
 * 纯帧驱动(useCurrentFrame + interpolate),不用 CSS 动画。
 */
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'

export type CinematicMotion = 'zoom-in' | 'zoom-out' | 'pan-right' | 'pan-left' | 'diagonal'

export interface SceneCinematicProps {
  imageUrl: string
  motion: CinematicMotion
  /** 剧本主题色(用于底部渐变微调,可选) */
  color?: string
}

const EASE = Easing.inOut(Easing.ease)

export const SceneCinematic: React.FC<SceneCinematicProps> = ({ imageUrl, motion, color = '#000000' }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  // 归一化进度 0→1(镜头运动整段走完)
  const p = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  })

  // 按预设算 scale / translate
  let scale = 1, tx = 0, ty = 0
  if (motion === 'zoom-in') scale = 1.0 + 0.12 * p
  else if (motion === 'zoom-out') scale = 1.12 - 0.12 * p
  else if (motion === 'pan-right') { scale = 1.08; tx = -4 + 8 * p }
  else if (motion === 'pan-left') { scale = 1.08; tx = 4 - 8 * p }
  else if (motion === 'diagonal') { scale = 1.0 + 0.1 * p; tx = -2 + 4 * p; ty = -2 + 4 * p }

  // 光影扫过:周期 450 帧,translateX -120%→120%,opacity 三角波峰值 0.06
  const sweepPeriod = 450
  const sweepFrame = frame % sweepPeriod
  const sweepX = interpolate(sweepFrame, [0, sweepPeriod], [-120, 120], { extrapolateRight: 'clamp' })
  const sweepOpacity = interpolate(sweepFrame, [0, sweepPeriod / 2, sweepPeriod], [0, 0.06, 0], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f0e0c', overflow: 'hidden' }}>
      {/* 配图 + 镜头运动 */}
      <AbsoluteFill>
        <Img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale}) translate(${tx}%, ${ty}%)`,
          }}
        />
      </AbsoluteFill>

      {/* 光影扫过(overlay 混合) */}
      <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '60%',
            transform: `translateX(${sweepX}%) skewX(-12deg)`,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
            opacity: sweepOpacity,
          }}
        />
      </AbsoluteFill>

      {/* 静态暗角 */}
      <AbsoluteFill style={{ pointerEvents: 'none', boxShadow: 'inset 0 0 120px rgba(0,0,0,0.55)' }} />
      {/* 底部渐变(压住图,保证下方文字/边缘可读) */}
      <AbsoluteFill style={{ pointerEvents: 'none', background: `linear-gradient(to bottom, transparent 55%, ${color}22 80%, rgba(15,14,12,0.6) 100%)` }} />
    </AbsoluteFill>
  )
}
