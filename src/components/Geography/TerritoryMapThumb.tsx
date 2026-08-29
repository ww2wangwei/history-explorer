/**
 * TerritoryMapThumb — 朝代/帝国地图缩略图
 *
 * 基于 GeoJSON（手画多边形）→ d3-geo + world-atlas 渲染 SVG。
 * 统一外观：SVG 宽度 100%、高度 auto（viewBox 固定 16:9），父元素用 aspect-ratio 控制尺寸。
 *
 * 额外绘制：
  - 世界底图（world-atlas 50m 国家边界）
  - 大洲名（亚洲/欧洲/非洲/北美洲/南美洲/大洋洲），仅当疆域 bbox 与该大洲相交时显示
  - 首都圆点 + 朝代/帝国名（如果传入 center 和 label）
 */
import { useMemo, useState, useEffect, memo } from 'react'
import { geoEqualEarth, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

export interface LabelPoint { name: string; lon: number; lat: number }

interface Props {
  /** 朝代/帝国 GeoJSON */
  geojson?: FeatureCollection | null
  width?: number
  height?: number
  fallbackColor?: string
  className?: string
  alt?: string
  /** 首都坐标 [lon, lat]，绘制为圆点+文字标签 */
  center?: [number, number]
  /** 朝代/帝国名（在中心点旁边显示） */
  label?: string
  /** 中国朝代时叠加的省/地区标签点（省会坐标+名），仅 empire bbox 范围内的显示 */
  provinces?: LabelPoint[]
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

/** 大洲定义：name, bbox [minLng,minLat,maxLng,maxLat], label 位置 [lon,lat] */
const CONTINENTS: { name: string; min: [number, number, number, number]; label: [number, number] }[] = [
  { name: '亚洲', min: [-10, -10, 170, 80], label: [90, 40] },
  { name: '欧洲', min: [-30, 35, 60, 75], label: [20, 55] },
  { name: '非洲', min: [-20, -40, 55, 38], label: [20, 5] },
  { name: '北美洲', min: [-170, 5, -50, 80], label: [-100, 45] },
  { name: '南美洲', min: [-90, -60, -30, 15], label: [-60, -20] },
  { name: '大洋洲', min: [110, -50, 180, 0], label: [140, -25] },
]
function bboxIntersects(a: [[number, number], [number, number]], b: [number, number, number, number]) {
  return !(a[1][0] < b[0] || a[0][0] > b[2] || a[1][1] < b[1] || a[0][1] > b[3])
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

function TerritoryMapThumbInner({
  geojson,
  width = 400,
  height = 225,
  fallbackColor = '#5b9bc8',
  className = '',
  alt = '疆域图',
  center,
  label,
  provinces,
}: Props) {
  return (
    <GeoJsonSvg
      geojson={geojson}
      width={width}
      height={height}
      fallbackColor={fallbackColor}
      className={className}
      alt={alt}
      center={center}
      label={label}
      provinces={provinces}
    />
  )
}

// 用 React.memo 包裹：上层状态变化（如 timelineCollapsed）时不重渲染所有24张卡片
const TerritoryMapThumb = memo(TerritoryMapThumbInner)
export default TerritoryMapThumb

/** 当有 geojson 时画一个紧凑 SVG（无外部图片时 fallback） */
function GeoJsonSvg({
  geojson, width = 400, height = 225, fallbackColor, className = '', alt,
  center, label, provinces,
}: {
  geojson?: FeatureCollection | null
  width?: number
  height?: number
  fallbackColor?: string
  className?: string
  alt?: string
  center?: [number, number]
  label?: string
  provinces?: LabelPoint[]
}) {
  const [worldGeo, setWorldGeo] = useState<FeatureCollection | null>(null)
  useEffect(() => { getWorldGeo().then(g => { if (g) setWorldGeo(g) }) }, [])
  const { worldPaths, empirePaths, empireColor, continentLabels, centerPt, labelPt, provincePts } = useMemo(() => {
    const features = (geojson?.features || []) as Feature<Geometry, any>[]
    const color = fallbackColor || (features[0]?.properties?.color as string) || '#5b9bc8'
    const bbox = computeBbox(features)
    if (!bbox) return {
      worldPaths: [] as string[], empirePaths: [] as string[], empireColor: color,
      continentLabels: [] as { name: string; x: number; y: number }[],
      centerPt: null as { x: number; y: number } | null,
      labelPt: null as { x: number; y: number } | null,
      provincePts: [] as { name: string; x: number; y: number }[],
    }
    const projection = (geoEqualEarth() as any).fitExtent(
      [[2, 2], [width - 2, height - 2]],
      { type: 'FeatureCollection', features }
    )
    const pathGen = (geoPath as any)(projection)
    const wPaths: string[] = worldGeo
      ? ((worldGeo.features as Feature<Geometry, any>[]) || []).map(f => pathGen(f as any) || '')
      : []
    const ePaths = features.map(f => pathGen(f as any) || '')

    // 大洲标签：只显示与 empire bbox 相交的大洲
    const labels: { name: string; x: number; y: number }[] = []
    for (const c of CONTINENTS) {
      if (!bboxIntersects(bbox, c.min)) continue
      const p = projection([c.label[0], c.label[1]])
      if (p && isFinite(p[0]) && isFinite(p[1])) labels.push({ name: c.name, x: p[0], y: p[1] })
    }

    // 首都点 + 朝代名
    let cPt: { x: number; y: number } | null = null
    let lPt: { x: number; y: number } | null = null
    if (center) {
      const p = projection(center)
      if (p && isFinite(p[0]) && isFinite(p[1])) {
        cPt = { x: p[0], y: p[1] }
        lPt = { x: p[0] + 6, y: p[1] - 6 }
      }
    }

    // 省份标签：仅显示在 empire bbox 范围内的（避免边界外混乱）
    const pPts: { name: string; x: number; y: number }[] = []
    if (provinces) {
      for (const p of provinces) {
        // 不做 bbox 过滤，让所有传入的省份/国家都显示。
// 理由：精细 geojson 的 bbox 可能略小于"应涵盖"范围（如栅格化后边缘缩进），
// 过滤反而会把朝代应涵盖的省份（如越南/蒙古）挡在地图外。投影后的点若不在画面内会被自然裁掉。
        // if (p.lon < bbox[0][0] || p.lat < bbox[0][1] || p.lon > bbox[1][0] || p.lat > bbox[1][1]) continue
        const pp = projection([p.lon, p.lat])
        if (pp && isFinite(pp[0]) && isFinite(pp[1])) pPts.push({ name: p.name, x: pp[0], y: pp[1] })
      }
    }

    return { worldPaths: wPaths, empirePaths: ePaths, empireColor: color, continentLabels: labels, centerPt: cPt, labelPt: lPt, provincePts: pPts }
  }, [geojson, width, height, fallbackColor, worldGeo, center, provinces])

  // 根据 empire 颜色亮度挑文字颜色（dark bg → light text）
  const textColor = '#e6dcc7' // bone
  const labelBg = 'rgba(10,18,28,0.7)'

  return (
    // 不设置 height 属性 — SVG 不接受 height="auto"，会触发 setValueForProperty 警告
    // CSS 通过外层容器的 aspect-ratio 控制高度，SVG 内部 viewBox 自动适配
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={alt}
      className={`block w-full h-full ${className}`}
    >
      <style>{`
        .empire-path, .world-path { /* no per-path animation — too costly with 24 cards × hundreds of paths */ }
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
      {/* 大洲名（在 empire 下、world 上） */}
      {continentLabels.map((c, i) => (
        <g key={`c-${i}`} pointerEvents="none">
          <rect x={c.x - 18} y={c.y - 7} width={36} height={14} rx={3}
            fill="rgba(10,18,28,0.55)" stroke="rgba(200,154,91,0.25)" strokeWidth={0.5} />
          <text x={c.x} y={c.y + 4} textAnchor="middle"
            fontSize="11" fontWeight="500"
            style={{ fontFamily: '"Noto Serif SC", "Source Han Serif SC", serif' }}
            fill={textColor} fillOpacity={0.85}>
            {c.name}
          </text>
        </g>
      ))}
      {empirePaths.map((d, i) => (
        <path
          key={`e-${i}`}
          className="empire-path"
          d={d}
          fill={empireColor}
          fillOpacity={0.85}
          fillRule="evenodd"
          stroke={empireColor}
          strokeWidth={0}
        />
      ))}
      {/* 首都点 + 朝代名（在 empire 上） */}
      {centerPt && (
        <g pointerEvents="none">
          <circle cx={centerPt.x} cy={centerPt.y} r={4}
            fill="#fff" stroke={empireColor} strokeWidth={1.5} />
          {labelPt && label && (
            <text x={labelPt.x} y={labelPt.y} fontSize="12" fontWeight="600"
style={{ fontFamily: '"Microsoft YaHei", "微软雅黑", "SimHei", "Source Han Serif SC", "Noto Serif SC", serif' }}
              fill={textColor}
              stroke={labelBg} strokeWidth={3} paintOrder="stroke" strokeLinejoin="round">
              {label}
            </text>
          )}
        </g>
      )}
      {/* 省份/地区点+标签（在 empire 内） */}
      {provincePts.map((p, i) => (
        <g key={`p-${i}`} pointerEvents="none">
          {/* 高对比度：白色大圆点 + 深色阴影 + 金色描边 */}
          <circle cx={p.x + 0.6} cy={p.y + 0.6} r={5.5} fill="rgba(0,0,0,0.5)" />
          <circle cx={p.x} cy={p.y} r={5.5} fill={empireColor} fillOpacity={1} stroke="#fff" strokeWidth={1.2} />
          <rect x={p.x + 4} y={p.y - 10} width={Math.max(p.name.length * 12 + 10, 30)} height={17} rx={3}
            fill="rgba(10,10,10,0.92)" stroke={empireColor} strokeWidth={1} />
          <text x={p.x + 9} y={p.y + 2} fontSize="12" fontWeight="700"
            style={{ fontFamily: '"Microsoft YaHei", "微软雅黑", "SimHei", "PingFang SC", "Noto Sans SC", system-ui, sans-serif', paintOrder: 'stroke' }}
            fill="#fff" stroke="rgba(0,0,0,0.6)" strokeWidth={0.5}>
            {p.name}
          </text>
        </g>
      ))}
    </svg>
  )
}
