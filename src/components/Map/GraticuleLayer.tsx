/**
 * GraticuleLayer — 经纬网层
 *
 *  在地图上画 lat/lng 等间距的网格线 + 标签，方便定位历史事件坐标
 *  - 0.05 alpha 细线不抢戏
 *  - 主线：每 30°（赤道、本初子午线等）
 *  - 副线：每 10°
 *  - 标签：每 30° 交点显示经纬度数字
 *
 *  设计成"始终在屏幕上"（不随地图消失），所以只画世界范围一次
 */
import { useEffect, useRef } from 'react'

interface Props {
  map: any
  visible: boolean
  /** 主线间隔（默认 30°） */
  majorStep?: number
  /** 副线间隔（默认 10°） */
  minorStep?: number
  /** 经度范围（-180..180） */
  lngRange?: [number, number]
  /** 纬度范围（-90..90） */
  latRange?: [number, number]
}

export default function GraticuleLayer({
  map,
  visible,
  majorStep = 30,
  minorStep = 10,
  lngRange = [-180, 180],
  latRange = [-85, 85],  // 避免极地变形极端
}: Props) {
  const overlaysRef = useRef<any[]>([])

  useEffect(() => {
    if (!map) return
    const A = (window as any).AMap
    if (!A) return

    // 清理
    for (const ov of overlaysRef.current) {
      if (ov == null) continue
      try { if (typeof ov.setMap === 'function') ov.setMap(null) } catch { /* ignore */ }
    }
    overlaysRef.current = []

    if (!visible) return

    const drawn: any[] = []

    // 经线（每个 lng 一条竖线）
    for (let lng = lngRange[0]; lng <= lngRange[1]; lng += minorStep) {
      const isMajor = lng % majorStep === 0
      const path = [new A.LngLat(lng, latRange[0]), new A.LngLat(lng, latRange[1])]
      const line = new A.Polyline({
        path,
        strokeColor: isMajor ? '#a89a82' : '#6a5e48',
        strokeWeight: isMajor ? 1 : 0.5,
        strokeOpacity: isMajor ? 0.45 : 0.25,
        map,
        zIndex: 5,
      })
      drawn.push(line)

      // 主经线标签（北端）
      if (isMajor) {
        const txt = lng === 0 ? '0°' : `${Math.abs(lng)}°${lng > 0 ? 'E' : 'W'}`
        const label = new A.Text({
          text: txt,
          position: new A.LngLat(lng, latRange[1]),
          anchor: 'top-center',
          offset: new A.Pixel(0, 4),
          style: {
            color: '#a89a82',
            'font-size': '9px',
            background: 'rgba(15,14,12,0.6)',
            'border-radius': '2px',
            padding: '0 3px',
            border: 'none',
          },
        })
        drawn.push(label)
      }
    }

    // 纬线（每个 lat 一条横线）
    for (let lat = latRange[0]; lat <= latRange[1]; lat += minorStep) {
      const isMajor = lat % majorStep === 0
      const path = [new A.LngLat(lngRange[0], lat), new A.LngLat(lngRange[1], lat)]
      const line = new A.Polyline({
        path,
        strokeColor: isMajor ? '#a89a82' : '#6a5e48',
        strokeWeight: isMajor ? 1 : 0.5,
        strokeOpacity: isMajor ? 0.45 : 0.25,
        map,
        zIndex: 5,
      })
      drawn.push(line)

      // 主纬线标签（左端）
      if (isMajor) {
        const txt = lat === 0 ? '0°' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}`
        const label = new A.Text({
          text: txt,
          position: new A.LngLat(lngRange[0], lat),
          anchor: 'middle-left',
          offset: new A.Pixel(4, 0),
          style: {
            color: '#a89a82',
            'font-size': '9px',
            background: 'rgba(15,14,12,0.6)',
            'border-radius': '2px',
            padding: '0 3px',
            border: 'none',
          },
        })
        drawn.push(label)
      }
    }

    overlaysRef.current = drawn
  }, [map, visible, majorStep, minorStep, lngRange[0], lngRange[1], latRange[0], latRange[1]])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      for (const ov of overlaysRef.current) {
        if (ov == null) continue
        try { if (typeof ov.setMap === 'function') ov.setMap(null) } catch { /* ignore */ }
      }
      overlaysRef.current = []
    }
  }, [])

  return null
}
