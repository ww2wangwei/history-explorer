/**
 * usePoemBGM — 详情页循环播放 doubao AI 古风纯音乐（public/poems/audio/bg.mp3）
 *
 * - 自动循环 + 音量持久化到 localStorage（默认 18/100）
 * - 进详情页即开始（unmount 暂停）
 * - 提供 toggle / start / stop / volume / setVolume
 */
import { useEffect, useRef, useState } from 'react'

const SRC = '/poems/audio/bg.mp3'
const VOLUME_KEY = 'poem-bgm-volume'
const DEFAULT_VOLUME = 18

function loadVolume(): number {
  if (typeof window === 'undefined') return DEFAULT_VOLUME
  try {
    const v = parseInt(window.localStorage.getItem(VOLUME_KEY) ?? '', 10)
    if (Number.isFinite(v) && v >= 0 && v <= 100) return v
  } catch {}
  return DEFAULT_VOLUME
}

export interface UsePoemBGMReturn {
  isPlaying: boolean
  volume: number          // 0-100
  toggle: () => void
  start: () => void
  stop: () => void
  setVolume: (v: number) => void
}

export function usePoemBGM(): UsePoemBGMReturn {
  const [isPlaying, setIsPlaying] = useState(true)
  const [volume, setVolumeState] = useState(loadVolume)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 一次性创建 + 隐藏在 DOM 树
  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio(SRC)
      a.loop = true
      a.volume = loadVolume() / 100
      a.preload = 'auto'
      audioRef.current = a
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const start = () => {
    if (audioRef.current && audioRef.current.paused) {
      const p = audioRef.current.play()
      if (p?.catch) p.catch(() => {/* ignore autoplay rejection */})
      setIsPlaying(true)
    }
  }

  const stop = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggle = () => (isPlaying ? stop() : start())

  // 音量变更 — 实时调整 + 持久化
  const setVolume = (v: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(v)))
    setVolumeState(clamped)
    if (audioRef.current) audioRef.current.volume = clamped / 100
    try {
      window.localStorage.setItem(VOLUME_KEY, String(clamped))
    } catch {}
  }

  // 进详情页即开始播放（用户首次进入有交互，浏览器允许自动播放）
  useEffect(() => {
    if (audioRef.current) {
      const p = audioRef.current.play()
      if (p?.catch) p.catch(() => {/* user needs to interact */})
    }
  }, [])

  return { isPlaying, volume, toggle, start, stop, setVolume }
}
