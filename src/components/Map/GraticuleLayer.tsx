/**
 * GraticuleLayer — 经纬网层
 *
 *  在地图上画 lat/lng 等间距的网格线 + 标签，方便定位历史事件坐标
 *  - 主线：每 30°（赤道、本初子午线等）——较粗较亮
 *  - 副线：每 10°
 *  - 标签：主经线/主纬线在「视口内」显示 30° / 90°E 等，跟随地图移动
 *
 *  跟随视口：每次地图移动/缩放后重画当前可视范围内的网格与标签，
 *  保证标签永远在屏幕上而不是卡在世界边缘。
 */
import { useEffect, useRef } from 'react'

interface Props {
  map: any
  visible: boolean
  /** 主线间隔（默认 30°） */
  majorStep?: number
  /** 副线间隔（默认 10°） */
  minorStep?: number
}

export default function GraticuleLayer({
  map,
  visible,
  majorStep = 30,
  minorStep = 10,
}: Props) {
  const overlaysRef = useRef<any[]>([])
  const lastTickRef = useRef<number>(0)

  useEffect(() => {
    if (!map) return
    const A = (window as any).AMap
    if (!A) return

    const clearOverlays = () => {
      for (const ov of overlaysRef.current) {
        if (ov == null) continue
        try { if (typeof ov.setMap === 'function') ov.setMap(null) } catch { /* ignore */ }
      }
      overlaysRef.current = []
    }

    const draw = () => {
      clearOverlays()
      if (!visible || !map) return

      // 当前视口范围（外扩 30% 避免拖动瞬间标签闪没）
      let west = -180, east = 180, south = -85, north = 85
      try {
        if (typeof map.getBounds === 'function') {
          const b = map.getBounds()
          if (b) {
            west = Math.max(-180, b.getWest())
            east = Math.min(180, b.getEast())
            south = Math.max(-85, b.getSouth())
            north = Math.min(85, b.getNorth())
          }
        }
      } catch { /* ignore */ }

      // 外扩一段，让线条比视口宽一些，拖动时不露白
      const lngPad = Math.min(45, (east - west) * 0.3)
      const latPad = Math.min(45, (north - south) * 0.3)
      const w0 = Math.max(-180, west - lngPad)
      const w1 = Math.min(180, east + lngPad)
      const s0 = Math.max(-85, south - latPad)
      const s1 = Math.min(85, north + latPad)

      const drawn: any[] = []

      // 经线（每个 lng 一条竖线）
      for (let lng = Math.ceil(w0 / minorStep) * minorStep; lng <= w1; lng += minorStep) {
        const isMajor = lng % majorStep === 0
        const line = new A.Polyline({
          path: [new A.LngLat(lng, s0), new A.LngLat(lng, s1)],
          strokeColor: isMajor ? '#d8c9a8' : '#8a7d63',
          strokeWeight: isMajor ? 1.2 : 0.6,
          strokeOpacity: isMajor ? 0.7 : 0.32,
          map,
          zIndex: 8,
        })
        drawn.push(line)

        // 主经线标签：放在该经线与「视口上沿附近」的交点
        if (isMajor && lng >= west - 1 && lng <= east + 1) {
          const txt = lng === 0 ? '0°' : `${Math.abs(lng)}°${lng > 0 ? 'E' : 'W'}`
          const label = new A.Text({
            text: txt,
            position: new A.LngLat(lng, Math.min(s1, north)),
            anchor: 'top-center',
            offset: new A.Pixel(0, 4),
            style: {
              color: '#f0e6cf',
              'font-size': '11px',
              'font-weight': 'bold',
              background: 'rgba(20,18,14,0.75)',
              'border-radius': '3px',
              padding: '1px 5px',
              border: '1px solid rgba(216,201,168,0.4)',
            },
          })
          label.setMap(map) // A.Text 不支持构造参数挂载，必须显式 setMap
          drawn.push(label)
        }
      }

      // 纬线（每个 lat 一条横线）
      for (let lat = Math.ceil(s0 / minorStep) * minorStep; lat <= s1; lat += minorStep) {
        const isMajor = lat % majorStep === 0
        const line = new A.Polyline({
          path: [new A.LngLat(w0, lat), new A.LngLat(w1, lat)],
          strokeColor: isMajor ? '#d8c9a8' : '#8a7d63',
          strokeWeight: isMajor ? 1.2 : 0.6,
          strokeOpacity: isMajor ? 0.7 : 0.32,
          map,
          zIndex: 8,
        })
        drawn.push(line)

        // 主纬线标签：放在该纬线与「视口左沿附近」的交点
        if (isMajor && lat >= south - 1 && lat <= north + 1) {
          const txt = lat === 0 ? '0°' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}`
          const label = new A.Text({
            text: txt,
            position: new A.LngLat(Math.max(w0, west), lat),
            anchor: 'middle-left',
            offset: new A.Pixel(6, 0),
            style: {
              color: '#f0e6cf',
              'font-size': '11px',
              'font-weight': 'bold',
              background: 'rgba(20,18,14,0.75)',
              'border-radius': '3px',
              padding: '1px 5px',
              border: '1px solid rgba(216,201,168,0.4)',
            },
          })
          label.setMap(map) // A.Text 不支持构造参数挂载，必须显式 setMap
          drawn.push(label)
        }
      }

      overlaysRef.current = drawn
    }

    // 首画
    lastTickRef.current = 0
    draw()

    // 跟随地图移动/缩放
    const events = ['moveend', 'zoomend', 'resize']
    const onMove = () => {
      const now = Date.now()
      // 节流 ~120ms
      if (now - lastTickRef.current < 120) return
      lastTickRef.current = now
      draw()
    }
    for (const ev of events) {
      try { map.on(ev, onMove) } catch { /* ignore */ }
    }

    return () => {
      clearOverlays()
      for (const ev of events) {
        try { map.off(ev, onMove) } catch { /* ignore */ }
      }
    }
  }, [map, visible, majorStep, minorStep])

  return null
}
