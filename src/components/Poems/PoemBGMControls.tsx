/**
 * PoemBGMControls — 详情页背景音乐控制条（播放/暂停 + 音量滑块）
 */
import { usePoemBGM } from '@/hooks/usePoemBGM'

export default function PoemBGMControls() {
  const { isPlaying, volume, toggle, setVolume } = usePoemBGM()

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={toggle}
        className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors shrink-0 ${
          isPlaying
            ? 'bg-amber-600/30 hover:bg-amber-600/45 border-amber-400/60 text-amber-200'
            : 'bg-ink-700/60 hover:bg-ink-700 border-ink-600 text-ink-300'
        }`}
        title={isPlaying ? '暂停古风背景音乐' : '继续播放'}
      >
        {isPlaying ? (
          <>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>🎵 演奏中 · 点击暂停</span>
          </>
        ) : (
          <>
            <span>♪</span>
            <span>已暂停 · 点击播放</span>
          </>
        )}
      </button>

      <div className="flex items-center gap-2 min-w-[160px] flex-1 max-w-[260px]">
        <span className="text-ink-300 text-xs select-none">🔊</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 accent-amber-500 cursor-pointer h-1.5"
          title={`音量 ${volume}%`}
          aria-label="BGM 音量"
        />
        <span className="text-[10px] text-ink-400 tabular-nums w-9 text-right">{volume}%</span>
      </div>

      <span className="text-[10px] text-ink-300 italic shrink-0">
        doubao AI 古风纯音乐 · 循环 · 自动记忆
      </span>
    </div>
  )
}
