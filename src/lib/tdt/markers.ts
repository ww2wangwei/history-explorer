/**
 * 天地图 marker 工厂
 *
 * TMapTest.tsx 里原来有 3 段近乎重复的代码（中国都城/世界都城/事件点），
 * 每段都：建 T.Icon → 建 T.Marker → setLabel/Title → 挂 click → 挂 mouseover/mouseout。
 * 现统一抽成 createMapMarker。
 *
 * 兼容：旧 createCapitalMarker 保留作为薄包装，不破坏调用方。
 */
import type { Era } from '@/types'
import {
  DOT_SVG_EVENT,
  ICON_SIZE,
  PIN_SVG_CHINA_CAPITAL,
  PIN_SVG_WORLD_CAPITAL,
  svgToIconUrl,
} from './icons'

const T = (): any => (window as any).T

/** 三种图标形态 */
export type MarkerKind = 'chinaCapital' | 'worldCapital' | 'event'

export interface CreateMarkerOpts {
  /** lng/lat */
  position: [number, number]
  /** marker 形态（决定 SVG 和 iconSize） */
  kind: MarkerKind
  /** worldCapital 需要传入 era.color，其它形态忽略 */
  color?: string
  /** label 文本；chinaCapital / worldCapital 用，event 可选 title */
  label?: string
  /** event marker 的 hover title（T.Marker.setTitle，v4.0 不支持时跳过） */
  hoverTitle?: string
  /** 点击回调 */
  onClick?: () => void
  /** 鼠标移入显示 hover 卡片的回调 */
  onHover?: () => void
  /** 鼠标移出隐藏 hover 卡片的回调 */
  onHoverOut?: () => void
}

/**
 * 建一个 T.Marker，挂好 click + hover 监听，并自动加入指定 map 的 overlay。
 *
 * @returns marker 实例（外部可继续 addOverLay，或这里默认已 add）；null = window.T 尚未加载
 */
export function createMapMarker(map: any, opts: CreateMarkerOpts): any | null {
  const TT = T()
  if (!TT || !map) return null
  const [lng, lat] = opts.position

  const { iconUrl, iconSize, anchor } = resolveIconDescriptor(opts.kind, opts.color)
  const icon = new TT.Icon({
    iconUrl: svgToIconUrl(iconUrl),
    iconSize: new TT.Point(iconSize[0], iconSize[1]),
    iconAnchor: new TT.Point(anchor[0], anchor[1]),
  })
  const marker = new TT.Marker(new TT.LngLat(lng, lat), { icon })

  if (opts.label) {
    const text = opts.kind === 'chinaCapital' ? `★ ${opts.label}` : opts.label
    const label = new TT.Label({
      text,
      offset: new TT.Point(0, -(iconSize[1] + 2)),
    })
    // v4.0 setLabel 路径；回退 addOverLay（但 marker 已 addOverLay，避免重复）
    try {
      marker.setLabel(label)
    } catch {
      /* v4.0 可能不兼容，跳过 */
    }
  }

  if (opts.hoverTitle) {
    try {
      marker.setTitle?.(opts.hoverTitle)
    } catch {
      /* v4.0 可能不支持 */
    }
  }

  if (opts.onClick) marker.addEventListener('click', opts.onClick)
  if (opts.onHover || opts.onHoverOut) {
    try {
      if (opts.onHover) marker.addEventListener('mouseover', opts.onHover)
      if (opts.onHoverOut) marker.addEventListener('mouseout', opts.onHoverOut)
    } catch {
      /* v4.0 不支持 hover 时跳过 */
    }
  }

  return marker
}

/** 每种 kind 对应的 SVG、size、anchor — 抽出来便于 addOverLay 调用方复用 */
function resolveIconDescriptor(kind: MarkerKind, color?: string): {
  iconUrl: string
  iconSize: readonly [number, number]
  anchor: readonly [number, number]
} {
  switch (kind) {
    case 'chinaCapital':
      return {
        iconUrl: PIN_SVG_CHINA_CAPITAL,
        iconSize: [ICON_SIZE.CHINA_CAPITAL[0], ICON_SIZE.CHINA_CAPITAL[1]],
        anchor: [ICON_SIZE.CHINA_CAPITAL[2], ICON_SIZE.CHINA_CAPITAL[3]],
      }
    case 'worldCapital': {
      const fill = color || '#c89a5b'
      return {
        iconUrl: PIN_SVG_WORLD_CAPITAL(fill),
        iconSize: [ICON_SIZE.WORLD_CAPITAL[0], ICON_SIZE.WORLD_CAPITAL[1]],
        anchor: [ICON_SIZE.WORLD_CAPITAL[2], ICON_SIZE.WORLD_CAPITAL[3]],
      }
    }
    case 'event':
      return {
        iconUrl: DOT_SVG_EVENT,
        iconSize: [ICON_SIZE.EVENT_DOT[0], ICON_SIZE.EVENT_DOT[1]],
        anchor: [ICON_SIZE.EVENT_DOT[2], ICON_SIZE.EVENT_DOT[3]],
      }
  }
}

// ===== 旧 API 兼容 =====

export type CapitalKind = 'selected' | 'china' | 'world'

interface LegacyCreateOpts {
  era: Era
  kind: CapitalKind
  onClick?: () => void
}

/** 旧 createCapitalMarker — 现仅作示例，实际应使用 createMapMarker */
export function createCapitalMarker(opts: LegacyCreateOpts): any | null {
  const TT = T()
  if (!TT || !opts.era.capital) return null
  const markerKind: MarkerKind = opts.kind === 'world' ? 'worldCapital' : 'chinaCapital'
  const map = (window as any).__tdtTestMap
  const marker = createMapMarker(map, {
    position: opts.era.capital,
    kind: markerKind,
    color: opts.kind === 'selected' ? '#c89a5b' : opts.era.color,
    label: opts.kind === 'world' ? opts.era.name : `★ ${opts.era.name}`,
    onClick: opts.onClick,
  })
  return marker
}
