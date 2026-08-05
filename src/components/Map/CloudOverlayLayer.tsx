/**
 * CloudOverlayLayer — OpenWeatherMap 实时云图叠加层
 *
 *  用 A.TileLayer 叠加 OWM 透明云层瓦片到当前底图上（WGS-84 Web Mercator，
 *  与高德 GCJ-02 有几米~几百米偏移，云图尺度下无感知）。
 *
 *  - 瓦片 URL：https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=KEY
 *  - 更新频率：每 10 分钟
 *  - 最大 zoom：OWM 图层到 zoom 9 左右，超过后由 AMap 自动裁掉/返回空白
 *  - 无 key 时不渲染，并暴露 apiKeyMissing 反馈
 */
import { useEffect, useRef } from 'react'

interface Props {
  map: any
  visible: boolean
  apiKey: string
}

const OWM_TILE_URL = 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid={key}'
/** OWM 免费层有效最大 zoom（更高层级标题会 404/空白） */
const OWM_MAX_ZOOM = 9

function tileUrl(z: number, x: number, y: number, apiKey: string): string {
  return OWM_TILE_URL
    .replace('{z}', String(z))
    .replace('{x}', String(x))
    .replace('{y}', String(y))
    .replace('{key}', apiKey)
}

export default function CloudOverlayLayer({ map, visible, apiKey }: Props) {
  const layerRef = useRef<any>(null)
  const reportedRef = useRef(false)

  useEffect(() => {
    const A = (window as any).AMap
    if (!map || !A) return

    // 移除旧层
    if (layerRef.current) {
      try { map.remove(layerRef.current) } catch { /* noop */ }
      layerRef.current = null
    }

    if (!visible) {
      reportedRef.current = false
      return
    }

    // 需要 key
    if (!apiKey) {
      if (!reportedRef.current) {
        reportedRef.current = true
        console.warn('[CloudOverlay] 未配置 VITE_OWM_API_KEY，实时云图无法显示。免费注册：https://openweathermap.org/api')
      }
      return
    }

    try {
      const tileLayer = new A.TileLayer({
        getTileUrl: (x: number, y: number, z: number): string => {
          // OWM 只到 zoom ~9，避免高清层级请求一堆 404
          const safeZ = z > OWM_MAX_ZOOM ? OWM_MAX_ZOOM : z
          return tileUrl(safeZ, x, y, apiKey)
        },
        tileSize: 256,
        zIndex: 3,
      })
      tileLayer.setMap(map)
      layerRef.current = tileLayer
    } catch (e) {
      console.warn('[CloudOverlay] 创建云图层失败', e)
    }
  }, [map, visible, apiKey])

  return null
}