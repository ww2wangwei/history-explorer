/**
 * MiniMap — 节点位置缩略图（HTML 瓦片版）
 * 用天地图瓦片（项目已有）作为背景，HTML overlay 节点
 * 避免 react-simple-maps 投影问题
 */
import { useMemo, useState, useEffect, useRef } from 'react'
import { lookupLocation, type LngLat } from '@/utils/locationCoords'
import { useHistoryStore } from '@/store/useHistoryStore'
import type { MajorWarNode } from './WarsOverview'

interface MiniMapProps {
  focusNode: MajorWarNode
  allNodes: MajorWarNode[]
  onJumpToMap: (lngLat: LngLat, year: number, label: string) => void
  onSwitchNode?: (node: MajorWarNode) => void
}

const WIDTH = 360
const HEIGHT = 220

/** 计算 1 个瓦片坐标 (x, y) 在 zoom z 下的经纬度 */
function tileToLngLat(x: number, y: number, z: number): [number, number] {
  const n = Math.pow(2, z)
  const lng = (x / n) * 360 - 180
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)))
  const lat = (180 / Math.PI) * latRad
  return [lng, lat]
}

/** 给定经纬度 + zoom + 容器宽高，计算该瓦片的 px 偏移 (left, top) */
function lngLatToPx(lng: number, lat: number, z: number, centerLng: number, centerLat: number, zoomScale: number, containerW: number, containerH: number) {
  const n = Math.pow(2, z)
  const centerX = (centerLng + 180) / 360 * n
  const centerY = (1 - Math.log(Math.tan(centerLat * Math.PI / 180) + 1 / Math.cos(centerLat * Math.PI / 180)) / Math.PI) / 2 * n

  const pointX = (lng + 180) / 360 * n
  const pointY = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n

  const dx = (pointX - centerX) * 256 * zoomScale
  const dy = (pointY - centerY) * 256 * zoomScale
  return { x: containerW / 2 + dx, y: containerH / 2 + dy }
}

export default function MiniMap({ focusNode, allNodes, onJumpToMap, onSwitchNode }: MiniMapProps) {
  const setMapFocus = useHistoryStore(s => s.setMapFocus)
  const setYear = useHistoryStore(s => s.setYear)

  // 节点位置解析
  const nodePositions = useMemo(() => {
    return allNodes
      .map(node => ({ node, pos: lookupLocation(node.location) }))
      .filter(x => x.pos) as Array<{ node: MajorWarNode; pos: LngLat }>
  }, [allNodes])

  const focusPos = useMemo(() => lookupLocation(focusNode.location), [focusNode])

  // 容器 ref
  const containerRef = useRef<HTMLDivElement>(null)

  // 计算 zoom 等级：根据节点分布
  const zoomLevel = useMemo(() => {
    if (!focusPos || nodePositions.length <= 1) return 3  // city
    let maxDist = 0
    nodePositions.forEach(({ pos }) => {
      const d = Math.hypot(pos[0] - focusPos[0], pos[1] - focusPos[1])
      if (d > maxDist) maxDist = d
    })
    if (maxDist < 3) return 5  // city
    if (maxDist < 8) return 4
    if (maxDist < 20) return 3  // region
    if (maxDist < 50) return 2  // country
    return 2  // continent
  }, [focusPos, nodePositions])

  // 瓦片大小（256 标准），每个瓦片在 256px
  const tileSize = 256
  const zoomScale = 1  // 每个瓦片渲染 256px
  // 计算中心瓦片坐标
  const n = Math.pow(2, zoomLevel)
  const centerTileX = (focusPos![0] + 180) / 360 * n
  const centerTileY = (1 - Math.log(Math.tan(focusPos![1] * Math.PI / 180) + 1 / Math.cos(focusPos![1] * Math.PI / 180)) / Math.PI) / 2 * n

  // 需要的瓦片范围（容器 360x220 约需要 2-3 块瓦片）
  const tilesX = Math.ceil(WIDTH / tileSize) + 1
  const tilesY = Math.ceil(HEIGHT / tileSize) + 1
  const startTileX = Math.floor(centerTileX - tilesX / 2)
  const startTileY = Math.floor(centerTileY - tilesY / 2)

  // 拖动平移状态
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [panning, setPanning] = useState(false)
  const panRef = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).tagName !== 'IMG') return
    setPanning(true)
    panRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  useEffect(() => {
    if (!panning) return
    const move = (e: MouseEvent) => {
      setPan({ x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y })
    }
    const up = () => setPanning(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [panning])

  const resetView = () => setPan({ x: 0, y: 0 })

  const handleJump = () => {
    onJumpToMap(focusPos!, focusNode.year, focusNode.title)
  }

  if (!focusPos) {
    return (
      <div className="text-xs text-ink-500 italic p-3 bg-ink-700/30 rounded">
        （该节点无位置信息：{focusNode.location}）
      </div>
    )
  }

  // 计算节点像素位置
  const nodeMarkers = nodePositions.map(({ node, pos }) => {
    const { x, y } = lngLatToPx(
      pos[0], pos[1], zoomLevel,
      focusPos![0], focusPos![1], zoomScale,
      WIDTH, HEIGHT
    )
    const isFocus = node === focusNode
    return { node, x, y, isFocus, isImp3: node.importance === 3 }
  })

  // 瓦片背景
  const tiles = []
  for (let dy = 0; dy < tilesY; dy++) {
    for (let dx = 0; dx < tilesX; dx++) {
      const tx = startTileX + dx
      const ty = startTileY + dy
      // 计算瓦片 px 位置
      const tilePos = lngLatToPx(
        ...tileToLngLat(tx, ty, zoomLevel).slice(0, 1).map(x => x) as [number],  // lng
        ...tileToLngLat(tx, ty, zoomLevel).slice(1, 2).map(x => x) as [number],   // lat  ← 太绕，简化为下面
        zoomLevel, focusPos![0], focusPos![1], zoomScale, WIDTH, HEIGHT
      )
      // 简化的瓦片 px 位置计算
      const txLngLat = tileToLngLat(tx, ty, zoomLevel)
      const tilePx = lngLatToPx(
        txLngLat[0], txLngLat[1],
        zoomLevel, focusPos![0], focusPos![1], zoomScale, WIDTH, HEIGHT
      )
      // 天地图 URL
      const url = `https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&TILEMATRIX=${zoomLevel}&TILEROW=${ty}&TILECOL=${tx}&FORMAT=tiles&tk=174705aebe8ae4c7b9a85b8cd4a32936`
      tiles.push({ x: tilePx.x, y: tilePx.y, url, key: `${tx}-${ty}` })
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[220px] overflow-hidden rounded border border-ink-600 bg-[#0a1820]"
      style={{ cursor: panning ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
    >
      {/* 瓦片层 */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          transition: panning ? 'none' : 'transform 0.2s',
        }}
      >
        {tiles.map(t => (
          <img
            key={t.key}
            src={t.url}
            alt=""
            className="absolute pointer-events-none"
            style={{ left: t.x, top: t.y, width: 256, height: 256 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ))}
        {/* 节点标记 */}
        {nodeMarkers.map(({ node, x, y, isFocus, isImp3 }) => (
          <div
            key={`${node.year}-${node.title}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y, transform: `translate(${pan.x}px, ${pan.y}px) translate(-50%, -50%)` }}
          >
            <div
              className="relative cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                if (isFocus) {
                  handleJump()
                } else if (onSwitchNode) {
                  onSwitchNode(node)
                }
              }}
            >
              {isFocus && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    width: 20, height: 20,
                    background: 'rgba(255, 212, 122, 0.3)',
                    top: -4, left: -4,
                  }}
                />
              )}
              <div
                className="rounded-full border-2"
                style={{
                  width: isFocus ? 12 : isImp3 ? 8 : 6,
                  height: isFocus ? 12 : isImp3 ? 8 : 6,
                  background: isFocus ? '#ffd47a' : (isImp3 ? '#b85450' : '#7a8a98'),
                  borderColor: isFocus ? '#fdf8f0' : 'transparent',
                }}
                title={`${node.year < 0 ? 'BC ' + (-node.year) : node.year} · ${node.title}`}
              />
              {isFocus && (
                <div
                  className="absolute top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] px-1.5 py-0.5 rounded font-serif"
                  style={{ background: 'rgba(15, 14, 12, 0.85)', color: '#ffd47a', textShadow: '0 0 3px #0f0e0c' }}
                >
                  {node.title}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 顶部信息条 */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] text-parchment-100/90 pointer-events-none z-10">
        <div className="bg-ink-900/80 backdrop-blur px-2 py-1 rounded">
          📍 {focusNode.location}
        </div>
        <button
          onClick={resetView}
          className="bg-ink-900/80 backdrop-blur px-2 py-1 rounded text-ink-300 hover:text-parchment-50 pointer-events-auto"
          title="重置视图"
        >
          ⛶ 重置
        </button>
      </div>

      {/* 底部跳转按钮 */}
      <button
        onClick={handleJump}
        className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-emerald-700/80 hover:bg-emerald-600/90 border border-emerald-500/60 text-emerald-100 text-[10px] transition-colors shadow z-10"
      >
        🗺️ 跳到主地图
      </button>

      {/* 提示 */}
      <div className="absolute bottom-2 left-2 text-[9px] text-ink-300/90 bg-ink-900/70 backdrop-blur px-1.5 py-0.5 rounded pointer-events-none z-10">
        {nodePositions.length} 个节点 · 拖动平移
      </div>
    </div>
  )
}
