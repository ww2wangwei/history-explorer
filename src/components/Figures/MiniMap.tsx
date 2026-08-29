/**
 * MiniMap — 节点位置缩略图
 * 用高德 AMap 创建独立地图实例
 * 节点用 HTML div 标记
 *
 * 设计：marker 永远固定在地图中心（容器中心），不动不监听
 */
import { useEffect, useRef, useState } from 'react'
import { loadAmap } from '@/lib/amap/loader'
import { lookupLocation, type LngLat } from '@/utils/locationCoords'
import { wgs84ToGcj02 } from '@/utils/coordsTransform'
import { getAmapKey, getAmapSecurityCode, useApiKeysStore } from '@/store/useApiKeysStore'

/** 通用节点类型：战争事件或大型战争节点 */
export interface MapNode {
  title: string
  year: number
  location: string
  importance: 1 | 2 | 3
  /** 优先使用：直接经纬度（如果有） */
  coordinates?: [number, number]
}

interface MiniMapProps {
  focusNode: MapNode
  allNodes: MapNode[]
  onJumpToMap: (lngLat: LngLat, year: number, label: string) => void
  onSwitchNode?: (node: MapNode) => void
}

export default function MiniMap({ focusNode, allNodes, onJumpToMap, onSwitchNode }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<HTMLElement[]>([])

  const [status, setStatus] = useState<'init' | 'loading' | 'ready' | 'error'>('init')
  const [error, setError] = useState<string | null>(null)

  // 节点位置：优先用 node.coordinates（精确），否则查 location 字典
  const nodePositions = allNodes
    .map(node => ({ node, pos: node.coordinates || lookupLocation(node.location) }))
    .filter(x => x.pos) as Array<{ node: MapNode; pos: LngLat }>

  const focusPos = focusNode.coordinates || lookupLocation(focusNode.location)

  // 保持 onSwitchNode 最新（避免 effect 重跑）
  useEffect(() => { /* no-op, switchNode 在弹窗父组件里处理 */ }, [onSwitchNode])

  // 初始化地图（focusNode 切换时重新创建）
  useEffect(() => {
    if (!focusPos) return
    const key = getAmapKey()
    if (!key || !containerRef.current) {
      setStatus('error')
      setError('高德地图 Key 未配置。可在更多菜单 → 🔑 API Keys 填写。')
      return
    }

    setStatus('loading')
    // 清旧 map
    try { mapRef.current?.destroy?.() } catch { /* ignore */ }
    mapRef.current = null

    loadAmap(key, getAmapSecurityCode())
      .then(() => {
        if (!containerRef.current) return
        const A = (window as any).AMap
        if (!A) {
          setStatus('error')
          setError('AMap 全局对象未定义')
          return
        }

        // 清理容器（防止 HMR 重复挂载）
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild)
        }

        // 创建地图（中心 = 当前节点位置，zoom 6 城市级）
        // 注意：focusPos 是 WGS-84，AMap 要 GCJ-02，需转换
        const [cLng, cLat] = wgs84ToGcj02(focusPos)
        const map = new A.Map(containerRef.current, {
          center: new A.LngLat(cLng, cLat),
          zoom: 6,
          draggable: false,
          scrollWheel: false,
          doubleClickZoom: false,
          zoomControl: false,
        })
        mapRef.current = map

        setStatus('ready')
      })
      .catch(err => {
        setStatus('error')
        setError(err.message || String(err))
      })

    return () => {
      // 清理 markers（绝对定位 div）
      markersRef.current.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el)
      })
      markersRef.current = []
      try { mapRef.current?.destroy?.() } catch { /* ignore */ }
      mapRef.current = null
    }
  }, [focusNode.location, focusPos?.[0], focusPos?.[1]])

  // 当节点位置确定后 + 地图 ready，加 focus 节点 marker（绝对定位在容器中心，永远固定）
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current || !focusPos) return

    // 清理旧 markers
    markersRef.current.forEach(el => {
      if (el.parentNode) el.parentNode.removeChild(el)
    })
    markersRef.current = []

    const mapContainer = containerRef.current
    if (!mapContainer) return

    const node = focusNode
    const label = node.title.length > 10 ? node.title.slice(0, 10) + '…' : node.title

    // 创建一个绝对定位的 HTML div 作为 marker（始终在容器中心 = 地图中心）
    const markerEl = document.createElement('div')
    markerEl.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      width: 130px;
      height: 56px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 99999;
      font-family: serif;
    `
    markerEl.innerHTML = `
      <div style="position:absolute;left:45px;top:2px;width:44px;height:44px;border-radius:50%;background:rgba(255,212,122,0.3);animation:minimap-pulse 2s ease-in-out infinite;"></div>
      <div style="position:absolute;left:53px;top:10px;width:28px;height:28px;border-radius:50%;background:rgba(255,212,122,0.5);"></div>
      <div style="position:absolute;left:58px;top:15px;width:18px;height:18px;border-radius:50%;background:#ffd47a;border:2.5px solid #ffffff;box-shadow:0 0 8px rgba(255,212,122,0.6);"></div>
      <div style="position:absolute;left:63px;top:20px;width:8px;height:8px;border-radius:50%;background:#ffffff;"></div>
      <div style="position:absolute;left:0;top:38px;width:130px;height:18px;background:rgba(15,14,12,0.9);border-radius:3px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,212,122,0.4);">
        <span style="color:#ffd47a;font-size:10px;font-weight:600;text-shadow:0 0 3px #0f0e0c;">${label}</span>
      </div>
    `
    mapContainer.appendChild(markerEl)
    markersRef.current.push(markerEl)
  }, [status, focusNode.title, focusNode.year, focusPos?.[0], focusPos?.[1]])

  // 注入 keyframe 动画（一次性）
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.getElementById('minimap-pulse-style')) return
    const style = document.createElement('style')
    style.id = 'minimap-pulse-style'
    style.textContent = `
      @keyframes minimap-pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.3); opacity: 0.2; }
      }
    `
    document.head.appendChild(style)
  }, [])

  if (!focusPos) {
    return (
      <div className="text-xs text-ink-300 italic p-3 bg-ink-700/30 rounded-lg">
        （该节点无位置信息：{focusNode.location}）
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* 错误提示 */}
      {status === 'error' && (
        <div className="absolute top-2 left-2 right-2 z-20 px-3 py-2 rounded-lg bg-amber-900/80 border border-amber-600/60 text-amber-100 text-xs">
          ⚠️ 天地图加载失败：{error}
        </div>
      )}

      {/* 状态提示（仅在加载中显示） */}
      {status === 'loading' && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 rounded-lg bg-ink-900/80 text-ink-300 text-xs">
          ⏳ 加载天地图...
        </div>
      )}

      {/* 地图容器 */}
      <div
        ref={containerRef}
        className="rounded-lg border border-ink-600 bg-[#0a1820] overflow-hidden"
        style={{ width: '100%', aspectRatio: '2 / 1', maxWidth: '640px', pointerEvents: 'none' }}
      />

      {/* 节点计数提示 */}
      <div className="absolute bottom-2 left-2 text-[9px] text-ink-300/90 bg-ink-900/70 backdrop-blur px-1.5 py-0.5 rounded-lg pointer-events-none z-10">
        {nodePositions.length} 个节点 · {focusPos[0].toFixed(1)}°, {focusPos[1].toFixed(1)}°
      </div>
    </div>
  )
}
