/**
 * Splash — 墨·朱砂 开场动画
 *
 * - 朱砂墨滴从屏外砸下来
 * - 砸到中央时墨滴"晕染"展开成印章 + 标题
 * - ~2.4s 后整体淡出，调用 onDone
 * - 点击/按任意键跳过
 * - localStorage 持久化"已看过"，避免每次刷新都重播
 */
import { useEffect, useState } from 'react'

interface Props {
  onDone: () => void
}

const STORAGE_KEY = 'history-explorer:splash-seen:v2'

export default function Splash({ onDone }: Props) {
  const [phase, setPhase] = useState<'drop' | 'bloom' | 'fade'>('drop')
  const [skipping, setSkipping] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('bloom'), 700)
    const t2 = setTimeout(() => setPhase('fade'), 2200)
    const t3 = setTimeout(() => onDone(), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  useEffect(() => {
    const onKey = () => {
      if (!skipping) {
        setSkipping(true)
        setPhase('fade')
        setTimeout(() => onDone(), 300)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('click', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('click', onKey)
    }
  }, [onDone, skipping])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden ink-wash-bg paper-grain transition-opacity duration-700 ${
        phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="presentation"
    >
      {/* 墨滴从屏外掉下来 */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '-160px',
          transform: 'translateX(-50%)',
          animation: phase === 'drop' ? 'splash-drop 0.7s cubic-bezier(0.5, 0, 0.7, 0.4) forwards' : 'none',
          opacity: 1,
        }}
      >
        <div className="vermilion-seal" style={{ width: 80, height: 80, fontSize: 38 }}>
          史
        </div>
        {/* 墨滴尾巴（细长拉丝） */}
        <div
          className="absolute left-1/2 top-full -translate-x-1/2"
          style={{
            width: 6,
            height: 120,
            background: 'linear-gradient(180deg, #b8433a 0%, rgba(184, 67, 58, 0.6) 60%, transparent 100%)',
            borderRadius: 3,
          }}
        />
      </div>

      {/* 中心内容：印章 + 标题 + 副标题（滴到位置后才显示） */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          opacity: phase === 'drop' ? 0 : 1,
          transform: phase === 'drop' ? 'scale(0.8)' : 'scale(1)',
          transition: 'opacity 0.5s ease-out, transform 0.6s cubic-bezier(0.2, 0.8, 0.3, 1)',
        }}
      >
        {/* 印章 */}
        <div
          className="vermilion-seal mb-6"
          style={{
            width: 84,
            height: 84,
            fontSize: 40,
            transform: phase === 'bloom' ? 'rotate(-12deg) scale(1)' : 'rotate(0deg) scale(0.6)',
            transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.3, 1)',
          }}
        >
          史
        </div>

        {/* 标题（毛笔字） */}
        <h1
          className="font-brush text-7xl text-bone mb-3 tracking-widest"
          style={{
            opacity: phase === 'bloom' ? 1 : 0,
            transform: phase === 'bloom' ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease-out 0.2s, transform 0.7s cubic-bezier(0.2, 0.8, 0.3, 1) 0.2s',
          }}
        >
          历史探索
        </h1>

        {/* 副标题（宋体） */}
        <div
          className="font-serif text-bone/70 text-base tracking-[0.3em] uppercase"
          style={{
            opacity: phase === 'bloom' ? 1 : 0,
            transform: phase === 'bloom' ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.7s ease-out 0.4s, transform 0.7s cubic-bezier(0.2, 0.8, 0.3, 1) 0.4s',
          }}
        >
          History · Explorer
        </div>

        {/* 1cm 的"印章下的注脚" */}
        <div
          className="font-serif text-ink-400 text-xs mt-8 italic"
          style={{
            opacity: phase === 'bloom' ? 0.7 : 0,
            transition: 'opacity 0.6s ease-out 0.8s',
          }}
        >
          ——双轴时空史学习工具
        </div>
      </div>

      {/* 角落墨滴飞溅（装饰） */}
      <svg
        className="absolute top-1/4 left-12 pointer-events-none"
        style={{ opacity: phase === 'bloom' ? 0.6 : 0, transition: 'opacity 0.8s ease-out 0.4s' }}
        width="80" height="70" viewBox="0 0 80 70"
      >
        <g fill="#0e0c0a">
          <circle cx="30" cy="30" r="9" opacity="0.7" />
          <circle cx="48" cy="22" r="3" opacity="0.5" />
          <circle cx="20" cy="42" r="2" opacity="0.4" />
          <path d="M 24 12 Q 18 4 12 0" stroke="#0e0c0a" stroke-width="0.9" fill="none" opacity="0.5" />
        </g>
      </svg>
      <svg
        className="absolute bottom-1/4 right-12 pointer-events-none"
        style={{ opacity: phase === 'bloom' ? 0.6 : 0, transition: 'opacity 0.8s ease-out 0.4s' }}
        width="80" height="60" viewBox="0 0 80 60"
      >
        <g fill="#0e0c0a">
          <circle cx="22" cy="22" r="8" opacity="0.6" />
          <circle cx="46" cy="36" r="2.5" opacity="0.5" />
          <path d="M 18 8 Q 12 0 8 -4" stroke="#0e0c0a" stroke-width="0.8" fill="none" opacity="0.4" />
        </g>
      </svg>

      {/* 右下角提示：按任意键跳过 */}
      <div
        className="absolute bottom-6 right-8 font-serif text-ink-500 text-xs tracking-wider"
        style={{
          opacity: phase === 'bloom' ? 0.5 : 0,
          transition: 'opacity 0.6s ease-out 1s',
        }}
      >
        按任意键跳过 →
      </div>

      <style>{`
        @keyframes splash-drop {
          0%   { transform: translateX(-50%) translateY(-160px) scale(1); }
          60%  { transform: translateX(-50%) translateY(50vh) scale(1); }
          75%  { transform: translateX(-50%) translateY(50vh) scale(1.3, 0.7); }
          100% { transform: translateX(-50%) translateY(50vh) scale(1, 1); }
        }
      `}</style>
    </div>
  )
}

/** 检查是否需要展示 splash（首次访问） */
export function shouldShowSplash(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return !window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return false
  }
}

/** 标记已看过（下次刷新不再重播） */
export function markSplashSeen(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* noop */
  }
}