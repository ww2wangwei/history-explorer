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
  PENINSULAS, STRAITS,
  type GeoFeature, type GeoFeatureType,
} from '@/data/geographic-features'
import type { GeoLayerKey } from '@/store/useMapLayersStore'
import { wgs84ToGcj02, wgs84ToGcj02Path } from '@/utils/coordsTransform'

/** 每种 type 的视觉风格（保留与原版一致） */
type StyleRow = {
  stroke?: string
  strokeWeight?: number
  fill?: string
  fillOpacity?: number
  strokeOpacity?: number
  strokeDasharray?: string
  isPolygon?: boolean
  labelColor?: string
  marker?: string
}
const STYLE: Record<GeoFeatureType, StyleRow> = {
  river:      { stroke: '#3ddcff', strokeWeight: 3,   strokeOpacity: 1.0,  labelColor: '#ffe9a8' },
  mountain:   { stroke: '#ffb27a', strokeWeight: 3,   strokeOpacity: 1.0,  strokeDasharray: '6,4', labelColor: '#ffd9a8', marker: 'mountain' },
  sea:        { fill: '#2a78c8', fillOpacity: 0.38,   stroke: '#3ddcff', strokeWeight: 2,   strokeOpacity: 1.0,  isPolygon: true, labelColor: '#bce8ff' },
  lake:       { fill: '#1a6db8', fillOpacity: 0.62,   stroke: '#3ddcff', strokeWeight: 2,   strokeOpacity: 1.0,  isPolygon: true, labelColor: '#bce8ff' },
  desert:     { fill: '#d4a85b', fillOpacity: 0.35,   stroke: '#ffb27a', strokeWeight: 2,   strokeOpacity: 1.0,  isPolygon: true, labelColor: '#ffd9a8' },
  plain:      { fill: '#7bbf5a', fillOpacity: 0.35,   stroke: '#a3d885', strokeWeight: 2,   strokeOpacity: 1.0,  isPolygon: true, labelColor: '#c8ffa3' },
  peninsula:  { fill: '#a08555', fillOpacity: 0.32,   stroke: '#e8c39a', strokeWeight: 2,   strokeOpacity: 1.0,  isPolygon: true, labelColor: '#ffd9a8' },
  strait:     { stroke: '#3ddcff', strokeWeight: 2.5, strokeOpacity: 1.0,  strokeDasharray: '4,3', labelColor: '#bce8ff' },
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
}

const ALL_KEYS = Object.keys(COLLECTION) as GeoLayerKey[]
const LAYER_KEYS_FOR_UI: GeoLayerKey[] = ALL_KEYS

/** 在 AMap 上渲染 selected 图层，返回 dispose() 移除所有 overlay */
export function renderGeoFeatures(
  map: any,
  visible: Record<GeoLayerKey, boolean>,
  showLabels: boolean,
  onFeatureHover?: (f: GeoFeature) => void,
  onFeatureLeave?: (f: GeoFeature) => void,
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
          if (onFeatureHover) poly.on('mouseover', () => onFeatureHover(f))
          if (onFeatureLeave) poly.on('mouseout', () => onFeatureLeave(f))
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
          if (onFeatureHover) line.on('mouseover', () => onFeatureHover(f))
          if (onFeatureLeave) line.on('mouseout', () => onFeatureLeave(f))
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
          if (onFeatureHover) textLabel.on('mouseover', () => onFeatureHover(f))
          if (onFeatureLeave) textLabel.on('mouseout', () => onFeatureLeave(f))
          overlays.push(textLabel)
        } catch { /* label failed */ }
      }
    }
  }

  return () => {
    // 一次性清掉所有 overlay（按类型 setMap(null)
    // 防御：map 可能已被销毁（组件 unmount 时序问题），或某些 overlay 创建失败为 undefined
    if (!map) return
    for (const ov of overlays) {
      if (ov == null) continue
      try {
        if (typeof ov.setMap === 'function') ov.setMap(null)
        else if (typeof ov.close === 'function') ov.close()
        else map.remove(ov)
      } catch { /* ignore individual removal errors */ }
    }
  }
}

export { LAYER_KEYS_FOR_UI }