/**
 * TerritoryMapThumb — 朝代/帝国 GeoJSON 缩略图
 *
 * 用 d3-geo 的 geoEqualEarth 投影：
 * 1. 底图：world-atlas/countries-50m（国家轮廓线，淡灰色）— 让用户看到疆域在地球上的位置
 * 2. 主体：朝代/帝国 GeoJSON（填充色 + 半透明边框）
 *
 * GSAP 动画：
 * - 卡片入场时朝代疆域先描边（stroke-dashoffset）→ 再填充
 *
 * 用途：全地理 → 疆域变迁卡片的缩略图
 */
import { useMemo, useState, useEffect, useRef } from 'react'
import { geoEqualEarth, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import gsap from 'gsap'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

interface Props {
  /** 朝代/帝国 GeoJSON（用作填充主体） */
  geojson: FeatureCollection
  width?: number
  height?: number
  /** 备用色（GeoJSON properties.color 缺失时） */
  fallbackColor?: string
  className?: string
}

/** 计算 GeoJSON bbox */
function computeBbox(features: Feature<Geometry, any>[]): [[number, number], [number, number]] | null {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
  const walk = (c: any) => {
    if (typeof c[0] === 'number') {
      for (let i = 0; i < c.length; i += 2) {
        if (c[i] < minLng) minLng = c[i]
        if (c[i] > maxLng) maxLng = c[i]
        if (c[i + 1] < minLat) minLat = c[i + 1]
        if (c[i + 1] > maxLat) maxLat = c[i + 1]
      }
    } else {
      c.forEach(walk)
    }
  }
  features.forEach(f => walk((f.geometry as any).coordinates))
  if (!isFinite(minLng)) return null
  return [[minLng, minLat], [maxLng, maxLat]]
}

/** 单例缓存 — 共享一个 world-atlas Promise */
let worldPromise: Promise<FeatureCollection | null> | null = null
function getWorldGeo(): Promise<FeatureCollection | null> {
  if (!worldPromise) {
    worldPromise = import('world-atlas/countries-50m.json')
      .then(mod => {
        const topo: any = mod.default || mod
        const countriesFC = (feature as any)(topo, topo.objects.countries)
        return countriesFC as unknown as FeatureCollection
      })
      .catch(() => null)
  }
  return worldPromise
}

export default function TerritoryMapThumb({
  geojson,
  width = 240,
  height = 140,
  fallbackColor = '#5b9bc8',
  className = '',
}: Props) {
  const [worldGeo, setWorldGeo] = useState<FeatureCollection | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [drawn, setDrawn] = useState(false)
  useEffect(() => { getWorldGeo().then(g => { if (g) setWorldGeo(g) }) }, [])

  const { worldPaths, empirePaths, empireColor } = useMemo(() => {
    const features = (geojson?.features || []) as Feature<Geometry, any>[]
    const color = (features[0]?.properties?.color as string) || fallbackColor
    const bbox = computeBbox(features)
    if (!bbox) return { worldPaths: [] as string[], empirePaths: [] as string[], empireColor: color }

    const projection = (geoEqualEarth() as any).fitExtent(
      [[2, 2], [width - 2, height - 2]],
      { type: 'FeatureCollection', features }
    )
    const pathGen = (geoPath as any)(projection)

    const wPaths: string[] = worldGeo
      ? ((worldGeo.features as Feature<Geometry, any>[]) || []).map(f => pathGen(f as any) || '')
      : []
    const ePaths = features.map(f => pathGen(f as any) || '')

    return { worldPaths: wPaths, empirePaths: ePaths, empireColor: color }
  }, [geojson, width, height, fallbackColor, worldGeo])

  // GSAP 描边 + fade-in 动画
  useEffect(() => {
    if (!svgRef.current || empirePaths.length === 0) return

    const svg = svgRef.current
    const empireNodes = svg.querySelectorAll<SVGPathElement>('.empire-path')
    const worldNodes = svg.querySelectorAll<SVGPathElement>('.world-path')

    const tl = gsap.timeline()
    if (worldNodes.length) {
      gsap.set(worldNodes, { autoAlpha: 0 })
      tl.to(worldNodes, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0)
    }
    if (empireNodes.length) {
      gsap.set(empireNodes, { autoAlpha: 0 })
      // 计算 pathLength 用于描边
      empireNodes.forEach(path => {
        const len = path.getTotalLength()
        path.style.strokeDasharray = `${len}`
        path.style.strokeDashoffset = `${len}`
      })
      tl.to(empireNodes, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'power1.inOut',
        stagger: 0.1,
      }, 0.3)
      .to(empireNodes, {
        autoAlpha: 1,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => setDrawn(true),
      }, 0.9)
    } else {
      setDrawn(true)
    }
    return () => { tl.kill() }
  }, [empirePaths, worldPaths])

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      style={{ display: 'block', overflow: 'hidden' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect x={0} y={0} width={width} height={height} fill="#0a1820" />

      {worldPaths.length > 0 && (
        <g>
          {worldPaths.map((d, i) => (
            <path
              key={`w-${i}`}
              className="world-path"
              d={d}
              fill="#1f3540"
              fillOpacity={0.55}
              stroke="#3a5a6b"
              strokeOpacity={0.45}
              strokeWidth={0.3}
            />
          ))}
        </g>
      )}

      {empirePaths.length > 0 ? (
        <g>
          {empirePaths.map((d, i) => (
            <path
              key={`e-${i}`}
              className="empire-path"
              d={d}
              fill={empireColor}
              fillOpacity={drawn ? 0.85 : 0}
              stroke={empireColor}
              strokeWidth={0.8}
              strokeOpacity={1}
            />
          ))}
        </g>
      ) : worldPaths.length === 0 && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill="#5a7a8a"
          fontFamily="serif"
        >
          ⏳ 加载中
        </text>
      )}
    </svg>
  )
}
