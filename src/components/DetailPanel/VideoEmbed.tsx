import { useState } from 'react'
import type { HistoricalEvent } from '@/types'

function PlayIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

interface Props {
  event: HistoricalEvent
}

export default function VideoEmbed({ event }: Props) {
  const [loaded, setLoaded] = useState(false)
  const { videoId, videoPlatform, videoTitle, title } = event
  if (!videoId) return null

  // 缩略图：YouTube 用 hqdefault.jpg；B站无公开缩略图 API，直接显示加载按钮
  const thumb = videoPlatform === 'youtube'
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : null

  // 平台对应的加载文案
  const platformLabel = videoPlatform === 'bilibili' ? '哔哩哔哩' : 'YouTube'
  const platformColor = videoPlatform === 'bilibili' ? 'bg-pink-500' : 'bg-red-600'

  // 嵌入 URL
  const embedUrl = videoPlatform === 'bilibili'
    ? `https://player.bilibili.com/player.html?bvid=${videoId}&autoplay=0&danmaku=0&high_quality=1`
    : `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`

  const aspectRatio = videoPlatform === 'bilibili' ? '70%' : '56.25%'

  return (
    <>
      <div
        className="relative w-full rounded-lg overflow-hidden border border-ink-600 bg-ink-900 group"
        style={{ paddingTop: aspectRatio }}
      >
        {loaded ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title={videoTitle || title}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            scrolling={videoPlatform === 'bilibili' ? 'no' : undefined}
            frameBorder={videoPlatform === 'bilibili' ? '0' : undefined}
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-ink-900 hover:bg-ink-800 transition-colors cursor-pointer"
            title={`播放：${videoTitle || title}`}
          >
            {thumb && (
              <img
                src={thumb}
                alt={videoTitle || title}
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
                loading="lazy"
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-16 h-16 rounded-full ${platformColor} flex items-center justify-center shadow-lg`}>
                <PlayIcon size={32} />
              </div>
              <div className="text-white text-sm font-medium px-3 py-1 rounded bg-black/60">
                点击播放（{platformLabel}）
              </div>
            </div>
          </button>
        )}
      </div>
      {videoTitle && (
        <div className="text-[10px] text-ink-500 mt-1 truncate" title={videoTitle}>
          {videoTitle}
        </div>
      )}
    </>
  )
}