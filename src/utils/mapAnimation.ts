/**
 * mapAnimation — 统一的地图飞越动画工具
 *
 * 支持：
 * - Globe (react-globe.gl) 与 AMap 2D 的统一接口
 * - 可配置时长、缓动函数（支持 gsap 缓动名）
 * - Promise 返回，便于 await 链式调用
 */

import { gsap } from 'gsap'

export interface FlyToOptions {
  /** 目标经度 */
  lng: number
  /** 目标纬度 */
  lat: number
  /** 目标高度/缩放级别（Globe: altitude, AMap: zoom） */
  altitude?: number
  /** 动画时长（毫秒），默认 800 */
  duration?: number
  /** 缓动函数：gsap 缓动名字符串 或 自定义函数，默认 'power2.out' */
  ease?: string | ((t: number) => number)
  /** 完成回调 */
  onComplete?: () => void
}

/** Globe 飞越 */
export function flyToGlobe(
  globe: any,
  { lng, lat, altitude = 2.5, duration = 800, ease = 'power2.out', onComplete }: FlyToOptions
): Promise<void> {
  return new Promise((resolve) => {
    if (!globe) { resolve(); return }
    const startPov = globe.pointOfView()
    const targetPov = { lat, lng, altitude }
    gsap.to(startPov, {
      ...targetPov,
      duration: duration / 1000,
      ease,
      onUpdate: () => globe.pointOfView(startPov, 0),
      onComplete: () => { onComplete?.(); resolve(); }
    })
  })
}

/** AMap 2D 飞越（使用 panTo + setZoom 动画） */
export function flyToAMap(
  map: any,
  { lng, lat, altitude = 4, duration = 800, ease = 'power2.out', onComplete }: FlyToOptions
): Promise<void> {
  return new Promise((resolve) => {
    if (!map) { resolve(); return }
    const A = (window as any).AMap
    if (!A) { resolve(); return }

    const targetCenter = new A.LngLat(lng, lat)
    const startZoom = map.getZoom()
    const targetZoom = altitude

    // 使用 gsap 驱动 zoom + center 同步插值
    const state = { zoom: startZoom }
    gsap.to(state, {
      zoom: targetZoom,
      duration: duration / 1000,
      ease,
      onUpdate: () => {
        map.setZoom(state.zoom)
        map.panTo(targetCenter)
      },
      onComplete: () => {
        map.setZoom(targetZoom)
        map.panTo(targetCenter)
        onComplete?.()
        resolve()
      }
    })
  })
}

/** 统一入口：自动判断地图类型 */
export function flyTo(
  mapOrGlobe: any,
  isGlobe: boolean,
  options: FlyToOptions
): Promise<void> {
  return isGlobe
    ? flyToGlobe(mapOrGlobe, options)
    : flyToAMap(mapOrGlobe, options)
}