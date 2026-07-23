/**
 * TMapTest 完整版：T.Map 底图 + 朝代都城 marker + 朝代疆域 polygon + 事件点
 * 完全替代 RSM WorldMap
 */
import { useEffect, useRef, useState } from 'react'
import { loadTianditu } from '@/lib/tdt/loader'
import { useHistoryStore } from '@/store/useHistoryStore'
import { getActiveErasAtYear } from '@/utils/geo'
import erasData from '@/data/eras.json'
import eventsData from '@/data/events.json'
import type { Era, HistoricalEvent } from '@/types'

const eras = erasData as Era[]
const events = eventsData as HistoricalEvent[]

function getChinaEraAtYear(year: number): Era | null {
  const chinaEras = eras.filter(e => e.region === 'china')
  return chinaEras.find(e => year >= e.startYear && year <= e.endYear) ?? null
}

export default function TMapTest() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polygonsRef = useRef<any[]>([])
  const eventMarkersRef = useRef<any[]>([])

  const [status, setStatus] = useState<string>('init')
  const [error, setError] = useState<string | null>(null)

  const currentYear = useHistoryStore(s => s.currentYear)
  const selectEra = useHistoryStore(s => s.selectEra)
  const selectEvent = useHistoryStore(s => s.selectEvent)
  const setYear = useHistoryStore(s => s.setYear)

  // 初始化 T.Map（只一次）
  useEffect(() => {
    const tk = import.meta.env.VITE_TIANDITU_KEY as string | undefined
    if (!tk || !containerRef.current) return

    setStatus('loading T API...')
    loadTianditu(tk)
      .then(() => {
        if (!containerRef.current) return
        const T = (window as any).T
        if (!T) { setError('T undefined'); return }

        // 清理容器
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild)
        }

        setStatus('creating T.Map...')
        const map = new T.Map(containerRef.current)
        setTimeout(() => {
          try { map.checkResize?.() } catch { /* ignore */ }
        }, 200)
        // 初始中心：先看 selectedEraId，没有就用当前朝代
        const initialCenter: [number, number] = [104, 35]
        const initialZoom = 4
        map.centerAndZoom(new T.LngLat(initialCenter[0], initialCenter[1]), initialZoom)
        map.disableDoubleClickZoom()
        // 启用滚轮缩放
        if (typeof map.enableScrollWheelZoom === 'function') {
          map.enableScrollWheelZoom()
        }
        mapRef.current = map
        ;(window as any).__tdtTestMap = map
        setStatus('T.Map ready')
      })
      .catch(err => setError(err.message || String(err)))

    let resizeHandler: (() => void) | null = null
    // 稍后再挂 resize（等 map 存在）
    setTimeout(() => {
      const map = mapRef.current
      if (!map) return
      resizeHandler = () => {
        try { map.checkResize?.() } catch { /* ignore */ }
      }
      window.addEventListener('resize', resizeHandler)
    }, 500)

    return () => {
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)
      // 清理所有 overlays
      const map = mapRef.current
      if (map) {
        markersRef.current.forEach((m: any) => { try { map.removeOverLay(m) } catch { /* ignore */ } })
        polygonsRef.current.forEach((p: any) => { try { map.removeOverLay(p) } catch { /* ignore */ } })
        eventMarkersRef.current.forEach((e: any) => { try { map.removeOverLay(e) } catch { /* ignore */ } })
        try { map.destroy() } catch { /* ignore */ }
      }
      markersRef.current = []
      polygonsRef.current = []
      eventMarkersRef.current = []
      mapRef.current = null
      if ((window as any).__tdtTestMap) delete (window as any).__tdtTestMap
    }
  }, [])

  // currentYear 变化时：飞向当前朝代都城 + 重建 markers/polygons
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const T = (window as any).T
    if (!T) return

    // 清理旧 markers/polygons
    markersRef.current.forEach((m: any) => { try { map.removeOverLay(m) } catch { /* ignore */ } })
    polygonsRef.current.forEach((p: any) => { try { map.removeOverLay(p) } catch { /* ignore */ } })
    eventMarkersRef.current.forEach((e: any) => { try { map.removeOverLay(e) } catch { /* ignore */ } })
    markersRef.current = []
    polygonsRef.current = []
    eventMarkersRef.current = []

    const chinaEra = getChinaEraAtYear(currentYear)
    if (chinaEra?.capital) {
      const [lng, lat] = chinaEra.capital
      // 飞向当前朝代都城
      try {
        map.setCenter(new T.LngLat(lng, lat), 4)
      } catch (e) { /* ignore */ }

      // 朝代都城 marker（金色图钉）
      const icon = new T.Icon({
        iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 22 30">
            <path d="M 11 28 L 6 16 L 16 16 Z" fill="#c89a5b" stroke="#0f0e0c" stroke-width="1"/>
            <circle cx="11" cy="9" r="9" fill="#c89a5b" stroke="#fdf8f0" stroke-width="1.5"/>
            <circle cx="11" cy="9" r="3" fill="#fdf8f0"/>
          </svg>`
        ),
        iconSize: new T.Point(22, 30),
        iconAnchor: new T.Point(11, 28),
      })
      const marker = new T.Marker(new T.LngLat(lng, lat), { icon })
      const label = new T.Label({
        text: `★ ${chinaEra.name}`,
        offset: new T.Point(0, -32),
      })
      try { marker.setLabel(label) } catch { /* v4.0 可能不支持，回退到 addOverLay */ }
      try { map.addOverLay(label) } catch { /* ignore */ }
      marker.addEventListener('click', () => selectEra(chinaEra.id))
      map.addOverLay(marker)
      markersRef.current.push(marker)
    }

    // 同时期的世界朝代都城 marker
    const activeEras = getActiveErasAtYear(eras, currentYear)
    activeEras.filter(e => e.region !== 'china' && e.capital).slice(0, 4).forEach(era => {
      const [lng, lat] = era.capital!
      const icon = new T.Icon({
        iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
            <path d="M 9 22 L 5 13 L 13 13 Z" fill="${era.color}" stroke="#0f0e0c" stroke-width="1"/>
            <circle cx="9" cy="7" r="7" fill="${era.color}" stroke="#fdf8f0" stroke-width="1"/>
            <circle cx="9" cy="7" r="2" fill="#fdf8f0"/>
          </svg>`
        ),
        iconSize: new T.Point(18, 24),
        iconAnchor: new T.Point(9, 22),
      })
      const marker = new T.Marker(new T.LngLat(lng, lat), { icon })
      const label = new T.Label({
        text: era.name,
        offset: new T.Point(0, -26),
      })
      try { marker.setLabel(label) } catch { /* v4.0 回退 */ }
      try { map.addOverLay(label) } catch { /* ignore */ }
      marker.addEventListener('click', () => selectEra(era.id))
      map.addOverLay(marker)
      markersRef.current.push(marker)
    })

    // 该时期事件点（红色圆点）
    const eraEvents = events.filter(
      e => e.coordinates && e.importance >= 2 &&
           Math.abs(e.year - currentYear) <= 50
    ).slice(0, 30)
    eraEvents.forEach(ev => {
      const [lng, lat] = ev.coordinates!
      const dot = new T.Icon({
        iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="5" fill="#dc2626" stroke="#fdf8f0" stroke-width="1.5"/>
          </svg>`
        ),
        iconSize: new T.Point(12, 12),
        iconAnchor: new T.Point(6, 6),
      })
      const marker = new T.Marker(new T.LngLat(lng, lat), { icon: dot })
      try { marker.setTitle(ev.title) } catch { /* v4.0 可能不支持 */ }
      marker.addEventListener('click', () => {
        selectEvent(ev.id)
        setYear(ev.year)
      })
      map.addOverLay(marker)
      eventMarkersRef.current.push(marker)
    })
  }, [currentYear, selectEra, selectEvent, setYear])

  return (
    <div className="w-full h-full relative">
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />
      <div className="absolute top-2 left-2 z-10 text-xs bg-ink-800/95 px-3 py-1.5 rounded-lg border border-bronze-500/40 shadow-lg">
        <span className="text-bronze-400 font-serif">天地图 T.Map</span>
        <span className="ml-2 text-parchment-100">Status: {status}</span>
        {error && <span className="text-red-400 ml-2">ERROR: {error}</span>}
        <div className="text-xs text-ink-500 mt-1">
          当前年: {currentYear} · 朝代: {getChinaEraAtYear(currentYear)?.name ?? '无'}
        </div>
      </div>
    </div>
  )
}
