/**
 * amap/mapHelpers.ts — 高德地图屏幕坐标工具
 *
 * AMap JS API v2.0:
 *   map.lngLatToContainer(lnglat[, height]) — 容器像素
 *   map.lngLatToPixel(lnglat, zoom)        — 像素
 */
export interface ScreenPoint {
  x: number
  y: number
}

/** 把 lng/lat 转为 [x, y]，失败返回 null */
export function getContainerPoint(map: any, lng: number, lat: number): ScreenPoint | null {
  if (!map) return null
  try {
    let pt: any = null
    if (typeof map.lngLatToContainer === 'function') {
      pt = map.lngLatToContainer(new (window as any).AMap.LngLat(lng, lat))
    } else if (typeof map.lngLatToPixel === 'function') {
      pt = map.lngLatToPixel(new (window as any).AMap.LngLat(lng, lat), map.getZoom())
    }
    if (!pt) return null
    if (Array.isArray(pt)) return { x: pt[0], y: pt[1] }
    if (typeof pt.x === 'number' && typeof pt.y === 'number') return { x: pt.x, y: pt.y }
  } catch {
    /* ignore */
  }
  return null
}

/** 把 [x, y] clamp 到 [padding, dim - padding] 区间 */
export function clampToContainer(
  pt: ScreenPoint | null,
  containerW: number,
  containerH: number,
  padding = 24,
): ScreenPoint {
  if (!pt) return { x: 0, y: 0 }
  if (containerW <= 0 || containerH <= 0) return pt
  return {
    x: Math.max(padding, Math.min(pt.x, containerW - padding)),
    y: Math.max(padding, Math.min(pt.y, containerH - padding)),
  }
}

/** 一站式：lng/lat → clamp 后的屏幕像素（hover 用） */
export function getClampedScreenPoint(
  map: any,
  lng: number,
  lat: number,
  containerW: number,
  containerH: number,
  padding = 24,
): ScreenPoint {
  const pt = getContainerPoint(map, lng, lat)
  return clampToContainer(pt, containerW, containerH, padding)
}