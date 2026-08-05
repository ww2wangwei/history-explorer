/**
 * renderGeoFeatures — 在 TMap 上叠加渲染自然地理要素
 *
 *  - 用 T.Polyline 画线（河流、山脉、海峡）
 *  - 用 T.Polygon 画面（海、湖、沙漠、平原、半岛、区域）
 *  - 用 T.Label 标名字（位于 lng/lat，自动跟随地图平移缩放）
 *  - 用 try/catch 包裹：单类失败不影响其他类
 *
 * 返回的 dispose() 用于在图层切换或卸载时清掉所有 overlay。
 */
import {
  RIVERS, MOUNTAINS, SEAS, LAKES, DESERTS, PLAINS,
  PENINSULAS, STRAITS, WATERFALLS, REGIONS, CONTINENTS,
  type GeoFeature,
} from '@/data/geographic-features'
import type { GeoLayerKey } from '@/store/useMapLayersStore'

/** 每种 type 的视觉风格（对齐旧的 SVG 层，颜色保持一致） */
const STYLE: Record<string, {
  stroke?: string
  strokeWeight?: number
  fill?: string
  fillOpacity?: number
  strokeOpacity?: number
  strokeDasharray?: string
  isPolygon?: boolean
  labelColor?: string
  marker?: string
}> = {
  river:      { stroke: '#5fb0d8', strokeWeight: 2.5, strokeOpacity: 0.95, labelColor: '#a3d8ec' },
  mountain:   { stroke: '#c8997a', strokeWeight: 2.5, strokeOpacity: 0.9,  strokeDasharray: '6,4', labelColor: '#e8c39a', marker: 'mountain' },
  sea:        { fill: '#3a6e9e', fillOpacity: 0.18,   stroke: '#5fb0d8', strokeWeight: 1.5, strokeOpacity: 0.6,  isPolygon: true, labelColor: '#bcd9eb' },
  lake:       { fill: '#4a90b8', fillOpacity: 0.55,   stroke: '#5fb0d8', strokeWeight: 1.5, strokeOpacity: 0.85, isPolygon: true, labelColor: '#bcd9eb' },
  desert:     { fill: '#c89a5b', fillOpacity: 0.18,   stroke: '#d4a85b', strokeWeight: 1,   strokeOpacity: 0.5,  strokeDasharray: '8,5', isPolygon: true, labelColor: '#e8c39a' },
  plain:      { fill: '#9bbf73', fillOpacity: 0.22,   stroke: '#a3bf85', strokeWeight: 1,   strokeOpacity: 0.5,  isPolygon: true, labelColor: '#c8dfa3' },
  peninsula:  { fill: '#8a7855', fillOpacity: 0.12,   stroke: '#c8a570', strokeWeight: 1,   strokeOpacity: 0.6,  isPolygon: true, labelColor: '#e8c39a' },
  strait:     { stroke: '#5fb0d8', strokeWeight: 2,   strokeOpacity: 0.85, strokeDasharray: '4,3', labelColor: '#a3d8ec' },
  waterfall:  { stroke: '#5fb0d8', strokeWeight: 2,   strokeOpacity: 0.9,  labelColor: '#a3d8ec' },
  region:     { fill: '#c8553d', fillOpacity: 0.10,   stroke: '#c8553d', strokeWeight: 1,   strokeOpacity: 0.5,  isPolygon: true, labelColor: '#e88871' },
  continent:  { labelColor: '#a89a82' },
}

const COLLECTION: Record<GeoLayerKey, GeoFeature[]> = {
  rivers:      RIVERS,
  mountains:   MOUNTAINS,
  seas:        SEAS,
  lakes:       LAKES,
  deserts:     DESERTS,
  plains:      PLAINS,
  peninsulas:  PENINSULAS,
  straits:     STRAITS,
  waterfalls:  WATERFALLS,
  regions:     REGIONS,
  continents:  CONTINENTS,
}

const ALL_KEYS = Object.keys(COLLECTION) as GeoLayerKey[]
const LAYER_KEYS_FOR_UI: GeoLayerKey[] = ALL_KEYS

/** 在 TMap 上渲染 selected 图层，返回 dispose() 移除所有 overlay */
export function renderGeoFeatures(
  map: any,
  visible: Record<GeoLayerKey, boolean>,
  showLabels: boolean,
  onFeatureClick?: (f: GeoFeature) => void,
): () => void {
  const T: any = (window as any).T
  if (!T || !map) return () => {}

  const overlays: any[] = []

  for (const layerKey of ALL_KEYS) {
    if (!visible[layerKey]) continue
    const feats = COLLECTION[layerKey]
    const style = STYLE[feats[0]?.type] ?? {}

    for (const f of feats) {
      // 把 [lng, lat][] 转成 T.LngLat[]
      const pts = f.geometry
        .map(([lng, lat]) => {
          try { return new T.LngLat(lng, lat) } catch { return null }
        })
        .filter(Boolean)
      if (pts.length < 2) continue

      try {
        if (style.isPolygon) {
          const poly = new T.Polygon(pts, {
            color: style.stroke,
            weight: style.strokeWeight ?? 1,
            opacity: style.strokeOpacity ?? 1,
            fillColor: style.fill,
            fillOpacity: style.fillOpacity ?? 0,
          })
          if (onFeatureClick) poly.addEventListener?.('click', () => onFeatureClick(f))
          map.addOverLay(poly)
          overlays.push(poly)
        } else {
          const line = new T.Polyline(pts, {
            color: style.stroke,
            weight: style.strokeWeight ?? 1.5,
            opacity: style.strokeOpacity ?? 0.9,
            dashArray: style.strokeDasharray,
          })
          if (onFeatureClick) line.addEventListener?.('click', () => onFeatureClick(f))
          map.addOverLay(line)
          overlays.push(line)
        }
      } catch { /* single feature failed, skip */ }

      // Label
      if (showLabels && style.labelColor) {
        try {
          const labelPos = new T.LngLat(f.labelPos[0], f.labelPos[1])
          const marker = style.marker === 'mountain' ? '▲ ' : ''
          const label = new T.Label({
            text: marker + f.name,
            position: labelPos,
            offset: new T.Point(0, 0),
          })
          // 让 TMap Label 保留默认白底+边框外观（清晰可读），仅改文字颜色
          try {
            const el = (label as any).getElement?.()
            if (el && el.style) {
              el.style.color = style.labelColor
              el.style.fontSize = (f.importance === 3 ? '13px' : f.importance === 2 ? '12px' : '11px')
              el.style.fontWeight = (f.importance === 3 ? '600' : '400')
              el.style.whiteSpace = 'nowrap'
              el.style.pointerEvents = 'none'
            }
          } catch { /* styling failed but label works */ }
          if (onFeatureClick) label.addEventListener?.('click', () => onFeatureClick(f))
          map.addOverLay(label)
          overlays.push(label)
        } catch { /* label failed */ }
      }
    }
  }

  // dispose
  return () => {
    for (const ov of overlays) {
      try { map.removeOverLay(ov) } catch { /* ignore */ }
    }
  }
}

export { LAYER_KEYS_FOR_UI }