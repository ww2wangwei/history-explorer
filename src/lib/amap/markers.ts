/**
 * amap/markers.ts — 高德地图 (AMap) marker 工厂
 *
 * 与 tdt/markers.ts 同构，API 替换：
 *   T.Icon → AMap.Icon({ size, image, imageSize, anchor })
 *   T.Marker(pos, { icon }) → new AMap.Marker({ position, icon, offset, map })
 *   T.Label → new AMap.Text({ text, position, anchor, style, map })
 *   marker.setLabel(label) → map.add(label) 单独添加
 *   click / mouseover 事件名不变
 */
import {
  DOT_SVG_EVENT,
  ICON_SIZE,
  PIN_SVG_CHINA_CAPITAL,
  PIN_SVG_WORLD_CAPITAL,
  svgToIconUrl,
} from './icons'

/** 三种图标形态 */
export type MarkerKind = 'chinaCapital' | 'worldCapital' | 'event'

export interface CreateMarkerOpts {
  position: [number, number]
  kind: MarkerKind
  color?: string
  label?: string
  hoverTitle?: string
  onClick?: () => void
  onHover?: () => void
  onHoverOut?: () => void
}

/**
 * 建一个 AMap.Marker + 可选 AMap.Text 标签，挂好 click + hover 监听，并加入指定 map。
 * 返回 { marker, label }：label 可能为 null（无 opts.label 时）；
 * 调用方需同时清理两个对象，否则 Text 会永远留在地图上。
 */
export function createMapMarker(map: any, opts: CreateMarkerOpts): { marker: any; label: any } | null {
  const A = (window as any).AMap
  if (!A || !map) return null
  const [lng, lat] = opts.position

  const { iconUrl, iconSize, anchor } = resolveIconDescriptor(opts.kind, opts.color)
  const icon = new A.Icon({
    size: new A.Size(iconSize[0], iconSize[1]),
    image: svgToIconUrl(iconUrl),
    imageSize: new A.Size(iconSize[0], iconSize[1]),
    anchor: new A.Pixel(anchor[0], anchor[1]),
  })
  const marker = new A.Marker({
    position: new A.LngLat(lng, lat),
    icon,
    offset: new A.Pixel(0, 0),
    map,
    title: opts.hoverTitle,
  })

  let label: any = null
  if (opts.label) {
    const text = opts.kind === 'chinaCapital' ? `★ ${opts.label}` : opts.label
    label = new A.Text({
      text,
      position: new A.LngLat(lng, lat),
      anchor: 'bottom-center',
      offset: new A.Pixel(0, -(iconSize[1] + 2)),
      map,
      style: {
        background: 'rgba(15,14,12,0.88)',
        'border-radius': '3px',
        'border-color': '#c89a5b',
        color: '#fdf8f0',
        'font-size': '11px',
        padding: '1px 6px',
        'white-space': 'nowrap',
        'box-shadow': '0 1px 3px rgba(0,0,0,0.6)',
        'border-width': '1px',
        'border-style': 'solid',
      },
    })
  }

  if (opts.onClick) marker.on('click', opts.onClick)
  if (opts.onHover) marker.on('mouseover', opts.onHover)
  if (opts.onHoverOut) marker.on('mouseout', opts.onHoverOut)

  return { marker, label }
}

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