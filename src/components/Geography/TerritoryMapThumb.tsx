/**
 * TerritoryMapThumb — 朝代/帝国地图缩略图
 *
 * 基于 GeoJSON（手画多边形）→ d3-geo + world-atlas 渲染 SVG。
 * 统一外观：SVG 宽度 100%、高度 auto（viewBox 固定 16:9），父元素用 aspect-ratio 控制尺寸。
 */
import { useMemo, useState, useEffect } from 'react'
import { geoEqualEarth, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

interface Props {
  /** 朝代/帝国 GeoJSON */
  geojson?: FeatureCollection | null
  width?: number
  height?: number
  fallbackColor?: string
  className?: string
  alt?: string
}

/** GeoJSON bbox 计算 */
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
  width = 400,
  height = 225,
  fallbackColor = '#5b9bc8',
  className = '',
  alt = '疆域图',
}: Props) {
  return (
    <GeoJsonSvg
      geojson={geojson}
      width={width}
      height={height}
      fallbackColor={fallbackColor}
      className={className}
      alt={alt}
    />
  )
}

/** 当有 geojson 时画一个紧凑 SVG（无外部图片时 fallback） */
function GeoJsonSvg({
  geojson, width = 400, height = 225, fallbackColor, className = '', alt,
}: { geojson?: FeatureCollection | null; width?: number; height?: number; fallbackColor?: string; className?: string; alt?: string }) {
  const [worldGeo, setWorldGeo] = useState<FeatureCollection | null>(null)
  useEffect(() => { getWorldGeo().then(g => { if (g) setWorldGeo(g) }) }, [])
  const { worldPaths, empirePaths, empireColor } = useMemo(() => {
    const features = (geojson?.features || []) as Feature<Geometry, any>[]
    const color = fallbackColor || (features[0]?.properties?.color as string) || '#5b9bc8'
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

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="auto"
      role="img"
      aria-label={alt}
      className={`block w-full ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <style>{`
        .empire-path { animation: empire-fade 0.8s ease-out 0.2s both; }
        @keyframes empire-fade { from { opacity: 0; } to { opacity: 1; } }
        .world-path { animation: world-fade 0.5s ease-out both; }
        @keyframes world-fade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
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
      {empirePaths.map((d, i) => (
        <path
          key={`e-${i}`}
          className="empire-path"
          d={d}
          fill={empireColor}
          fillOpacity={0.85}
          stroke={empireColor}
          strokeWidth={1.2}
        />
      ))}
    </svg>
  )
}
