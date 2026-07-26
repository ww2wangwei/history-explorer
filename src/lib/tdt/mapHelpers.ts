/**
 * 地图坐标工具
 *
 * 两个核心场景：
 *   1) lng/lat → 容器屏幕像素（hover/click 时 viewport 已稳定）
 *   2) 把屏幕坐标 clamp 进容器可视区（避免 InfoCard 溢出）
 *
 * T.Map v4 同时支持 lngLatToContainerPoint 和 lngLatToPoint，部分历史版本只有后者，所以双路径兜底。
 */

export interface ScreenPoint {
  x: number
  y: number
}

const T = (): any => (window as any).T

/** 把 lng/lat 转为 [x, y]，失败返回 null */
export function getContainerPoint(map: any, lng: number, lat: number): ScreenPoint | null {
  if (!map) return null
  const TT = T()
  if (!TT) return null
  try {
    let pt: any = null
    if (typeof map.lngLatToContainerPoint === 'function') {
      pt = map.lngLatToContainerPoint(new TT.LngLat(lng, lat))
    } else if (typeof map.lngLatToPoint === 'function') {
      pt = map.lngLatToPoint(new TT.LngLat(lng, lat))
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
