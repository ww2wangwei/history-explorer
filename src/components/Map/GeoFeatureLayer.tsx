/**
 * renderGeoFeatures — 在高德 AMap 上叠加渲染自然地理要素
 *
 *  - AMap.Polyline 画线（河流、山脉、海峡）
 *  - AMap.Polygon 画面（海、湖、沙漠、平原、半岛、区域）
 *  - AMap.Text 标名字（位于 lng/lat，自动跟随地图平移缩放）
 *
 * 返回的 dispose() 用于在图层切换或卸载时清掉所有 overlay。
 */
import {
  RIVERS, MOUNTAINS, SEAS, LAKES, DESERTS, PLAINS,
  PENINSULAS, STRAITS, WATERFALLS, REGIONS, CONTINENTS,
  type GeoFeature,
} from '@/data/geographic-features'
import type { GeoLayerKey } from '@/store/useMapLayersStore'
import { wgs84ToGcj02, wgs84ToGcj02Path } from '@/utils/coordsTransform'

/** 每种 type 的视觉风格（保留与原版一致） */
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
  river:      { stroke: '#5fb0d8', strokeWeight: 3,   strokeOpacity: 0.95, labelColor: '#a3d8ec' },
  mountain:   { stroke: '#c8997a', strokeWeight: 3,   strokeOpacity: 0.9,  strokeDasharray: '6,4', labelColor: '#e8c39a', marker: 'mountain' },
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

/** 在 AMap 上渲染 selected 图层，返回 dispose() 移除所有 overlay */
export function renderGeoFeatures(
  map: any,
  visible: Record<GeoLayerKey, boolean>,
  showLabels: boolean,
  onFeatureClick?: (f: GeoFeature) => void,
): () => void {
  const A = (window as any).AMap
  if (!A || !map) return () => {}

  const overlays: any[] = []

  for (const layerKey of ALL_KEYS) {
    if (!visible[layerKey]) continue
    const feats = COLLECTION[layerKey]
    const style = STYLE[feats[0]?.type] ?? {}

    for (const f of feats) {
      const path: any[] = wgs84ToGcj02Path(f.geometry as [number, number][])
        .map(([lng, lat]) => {
          try { return new A.LngLat(lng, lat) } catch { return null }
        })
        .filter(Boolean)
      if (path.length < 2) continue

      try {
        if (style.isPolygon) {
          const poly = new A.Polygon({
            path,
            strokeColor: style.stroke,
            strokeWeight: style.strokeWeight ?? 1,
            strokeOpacity: style.strokeOpacity ?? 1,
            strokeStyle: style.strokeDasharray ? 'dashed' : 'solid',
            fillColor: style.fill,
            fillOpacity: style.fillOpacity ?? 0,
            map,
          })
          if (onFeatureClick) poly.on('click', () => onFeatureClick(f))
          overlays.push(poly)
        } else {
          const line = new A.Polyline({
            path,
            strokeColor: style.stroke,
            strokeWeight: style.strokeWeight ?? 1.5,
            strokeOpacity: style.strokeOpacity ?? 0.9,
            strokeStyle: style.strokeDasharray ? 'dashed' : 'solid',
            map,
          })
          if (onFeatureClick) line.on('click', () => onFeatureClick(f))
          overlays.push(line)
        }
      } catch { /* single feature failed, skip */ }

      // Label
      if (showLabels && style.labelColor) {
        try {
          const [lLng, lLat] = wgs84ToGcj02(f.labelPos as [number, number])
          const labelPos = new A.LngLat(lLng, lLat)
          const marker = style.marker === 'mountain' ? '▲ ' : ''
          const textLabel = new A.Text({
            text: marker + f.name,
            position: labelPos,
            map,
            anchor: 'center',
            style: {
              background: 'rgba(15,14,12,0.88)',
              'border-radius': '3px',
              color: style.labelColor,
              'border-color': 'rgba(200,154,91,0.6)',
              'border-style': 'solid',
              'border-width': '1px',
              'font-size': (f.importance === 3 ? '13px' : f.importance === 2 ? '12px' : '11px'),
              'font-weight': (f.importance === 3 ? '600' : '400'),
              padding: '1px 6px',
              'white-space': 'nowrap',
              'box-shadow': '0 1px 3px rgba(0,0,0,0.6)',
            },
          })
          if (onFeatureClick) textLabel.on('click', () => onFeatureClick(f))
          overlays.push(textLabel)
        } catch { /* label failed */ }
      }
    }
  }

  return () => {
    // 一次性清掉所有 overlay（按类型 setMap(null)
    map.remove(overlays)
  }
}

export { LAYER_KEYS_FOR_UI }