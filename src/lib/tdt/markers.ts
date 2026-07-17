/**
 * 天地图 T.Marker 工厂 — 朝代都城 marker
 */
import type { Era } from '@/types'

const T = (): any => (window as any).T

/** SVG data URI 图钉（朝代色填充） */
function pinIconDataUrl(color: string, size = 22): string {
  // 简化的图钉 SVG：圆形头 + 三角尖
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 ${size} ${size + 8}">
    <path d="M ${size/2} ${size+6} L ${size/2-5} ${size-2} L ${size/2+5} ${size-2} Z" fill="${color}" stroke="#0f0e0c" stroke-width="1"/>
    <circle cx="${size/2}" cy="${size/2-3}" r="${size/2-2}" fill="${color}" stroke="#fdf8f0" stroke-width="1.5"/>
    <circle cx="${size/2}" cy="${size/2-3}" r="${(size/2-2)*0.4}" fill="#fdf8f0"/>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export type CapitalKind = 'selected' | 'china' | 'world'

interface CreateOpts {
  era: Era
  kind: CapitalKind
  onClick?: () => void
}

export function createCapitalMarker(opts: CreateOpts): any | null {
  const TT = T()
  if (!TT || !opts.era.capital) return null
  const [lng, lat] = opts.era.capital
  const color = opts.kind === 'selected' ? '#c89a5b' : (opts.era.color || '#c89a5b')
  const size = opts.kind === 'selected' ? 26 : 22

  const icon = new TT.Icon({
    iconUrl: pinIconDataUrl(color, size),
    iconSize: new TT.Point(size, size + 8),
    iconAnchor: new TT.Point(size / 2, size + 6),
  })
  const marker = new TT.Marker(new TT.LngLat(lng, lat), { icon })

  // 选中态或中国朝代显示 label
  if (opts.kind !== 'world') {
    const label = new TT.Label({
      text: opts.kind === 'selected' ? `★ ${opts.era.name}` : `★ ${opts.era.name}`,
      offset: new TT.Point(0, -size - 6),
    })
    marker.setLabel(label)
  }

  if (opts.onClick) {
    marker.addEventListener('click', opts.onClick)
  }
  return marker
}
