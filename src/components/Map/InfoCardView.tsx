/**
 * InfoCardView — 共享的位置信息卡
 *
 * 2D/3D 地图（AmapTest）与地球仪（MapGlobeView）共用同一张卡：
 *  - 顶部条：返回按钮（可选）/位置图标 + 关闭
 *  - Bing 封面图（16:9，加载失败自动隐藏）
 *  - 标题 + 简介（最多 3 行）
 *  - 朝下小三角（指向标签位置）
 *
 * 定位：默认由调用方提供 screenX/screenY（屏幕坐标）。
 * 地球仪模式下，调用方可以直接传入 "居中" 坐标，视觉上仍然合理。
 */
import { useState } from 'react'
import type { ReopenKind } from '@/lib/reopenRoutes'

export interface InfoCardData {
  label: string
  snippet: string
  coverImageUrl: string
  lng: number
  lat: number
  screenX: number
  screenY: number
  source?: 'hover' | 'jump' | 'click'
  reopenLabel?: string
  reopenKind?: ReopenKind
  reopenEraId?: string
  reopenEventYear?: number
  reopenFeatureId?: string
  reopenTerritoryId?: string
  reopenTerritoryRegion?: 'china' | 'world'
  reopenWarId?: string
  reopenMwKey?: string
  reopenNodeIndex?: string | number
}

interface Props {
  card: InfoCardData
  onClose: () => void
  onBack?: () => void
}

export default function InfoCardView({ card, onClose, onBack }: Props) {
  const [imgFailed, setImgFailed] = useState(false)

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
  const CARD_W = 280
  const flipY = card.screenY < 200
  const offsetX = card.screenX < CARD_W / 2 + 16 ? '0%' : card.screenX > vw - CARD_W / 2 - 16 ? '-100%' : '-50%'
  const offsetY = flipY ? '14px' : 'calc(-100% - 14px)'
  const transform = `translate(${offsetX}, ${offsetY})`

  return (
    <div
      data-testid="amap-info-card"
      className="absolute z-20 pointer-events-auto"
      style={{
        left: card.screenX,
        top: card.screenY,
        transform,
        width: '280px',
        maxWidth: 'calc(100vw - 32px)',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div
        className="relative rounded-lg shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'rgb(26 23 20 / 0.95)',
          border: '1px solid rgb(184 67 58 / 0.4)',
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: '1px solid rgb(184 67 58 / 0.3)' }}
        >
          {card.reopenLabel && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center text-vermilion-300 hover:text-vermilion-200 text-sm"
              title="返回"
              aria-label="返回"
            >
              <span className="leading-none">←</span>
              <span className="ml-1 text-xs">Back</span>
            </button>
          ) : (
            <span className="text-xs" style={{ color: 'rgb(154 143 126)' }}>📍 位置</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-base leading-none hover:text-vermilion-300"
            style={{ color: 'rgb(154 143 126)' }}
            title="关闭"
            aria-label="关闭"
          >
            ×
          </button>
        </div>
        {card.coverImageUrl && !imgFailed && (
          <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
            <img
              src={card.coverImageUrl}
              alt={card.label}
              onError={() => setImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}
        <div className="px-3 py-2">
          <div
            className="text-sm font-brush truncate"
            style={{ color: 'rgb(247 238 216)' }}
          >
            {card.label}
          </div>
          {card.snippet && (
            <div
              className="text-xs mt-1 line-clamp-3"
              style={{ color: 'rgb(184 198 184)' }}
            >
              {card.snippet}
            </div>
          )}
        </div>
      </div>
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          [flipY ? 'bottom' : 'top']: '100%',
          marginTop: flipY ? '0' : '-1px',
          marginBottom: flipY ? '-1px' : '0',
          width: 0, height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: flipY ? '0 solid transparent' : '8px solid rgba(30, 28, 24, 0.95)',
          borderBottom: flipY ? '8px solid rgba(30, 28, 24, 0.95)' : '0 solid transparent',
          filter: 'drop-shadow(0 1px 0 rgba(201, 154, 91, 0.5))',
        }}
      />
    </div>
  )
}
