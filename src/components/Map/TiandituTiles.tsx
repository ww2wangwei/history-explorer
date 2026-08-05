/**
 * 天地图 WMTS 瓦片底图（按 zoom level 切换）— RSM 风格 SVG image
 *
 * 设计：
 * - react-simple-maps zoom 1.0 (1.0x) ≈ d3-geo scale=175（世界级别）
 * - react-simple-maps zoom 2.0 ≈ 整世界 0.5x
 * - 映射：tiandituZoom = max(1, floor(reactZoom * 1.5))，范围 1-18
 *
 * 实现：
 * - 按 center + tiandituZoom 计算瓦片覆盖范围
 * - 用等距投影的近似：viewBox 中世界是 980×500
 * - 瓦片位置用 viewBox 坐标（不是经纬度）
 * - 嵌入 ZoomableGroup 内部，自动跟随变换
 */
const TILE_SIZE = 256
const WIDTH = 980
const HEIGHT = 500

// Bumped coercion for higher z level when react zoom grows.
// Original mapping was *2, but RSM's effective scale grows much slower
// (zoom=2 doesn't make tiles 2x more detailed because d3-geo already covers world).
// Use *1.4 to get a steeper tile resolution ramp:
//   reactZoom 1 → tiandituZoom 2 (4 tiles global)
//   reactZoom 4 → tiandituZoom 6 (city-level detail visible)
//   reactZoom 12 → tiandituZoom 18 (street-level)
const ZOOM_MULTIPLIER = 1.4

/** 经纬度 → 墨卡托瓦片浮点坐标（NaN 安全） */
function lngLatToTileFloat(lng: number, lat: number, z: number): [number, number] {
  if (!Number.isFinite(lng) || !Number.isFinite(lat) || !Number.isFinite(z)) return [0, 0]
  // 钳制到合法范围（避免极地 90° 时 Math.cos(lat)=0 → Infinity）
  const safeLng = Math.max(-180, Math.min(180, lng))
  const safeLat = Math.max(-85.05112878, Math.min(85.05112878, lat))
  const n = 2 ** z
  const x = ((safeLng + 180) / 360) * n
  const latRad = (safeLat * Math.PI) / 180
  const cosLat = Math.cos(latRad)
  if (cosLat <= 0) return [x, n / 2]  // 极地 fallback
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / cosLat) / Math.PI) / 2) * n
  if (!Number.isFinite(x) || !Number.isFinite(y)) return [0, 0]
  return [x, y]
}

const TIANDITU_VEC = (key: string, x: number, y: number, z: number) =>
  `https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL=${x}&TILEROW=${y}&TILEMATRIX=${z}&tk=${key}`

const TIANDITU_CVA = (key: string, x: number, y: number, z: number) =>
  `https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL=${x}&TILEROW=${y}&TILEMATRIX=${z}&tk=${key}`

interface Props {
  center: [number, number]
  zoom: number
}

export default function TiandituTiles({ center, zoom }: Props) {
  const key = import.meta.env.VITE_TIANDITU_KEY as string | undefined

  // 计算瓦片（每次 render 都重算，避免 useMemo 依赖陷阱）
  const tiles = (() => {
    if (!key || !center || center.length !== 2) {
      return { z: 1, items: [] as Array<{ x: number; y: number; left: number; top: number; size: number }> }
    }

    // 映射：让 tile 在屏幕上显示尺寸 ≈ 60-300px（避免过度放大导致瓦片屏宽 < 10px 模糊）
    //   reactZoom=1  → z=2   (tile 屏宽≈245px, 全球)
    //   reactZoom=2  → z=3   (tile 屏宽≈122px, 国家级)
    //   reactZoom=3  → z=5   (tile 屏宽≈80px,  省级)
    //   reactZoom=4  → z=6   (tile 屏宽≈50px,  城市级)
    //   reactZoom=5  → z=7   (tile 屏宽≈25px,  街区级)
    // 公式：z = max(2, min(8, round(reactZoom * 1.5)))
    const safeZoom = typeof zoom === 'number' && isFinite(zoom) ? zoom : 1
    const z = Math.max(2, Math.min(8, Math.round(safeZoom * 1.5)))

    // 中心瓦片坐标
    const [cx, cy] = lngLatToTileFloat(center[0], center[1], z)
    const centerTileX = Math.floor(cx)
    const centerTileY = Math.floor(cy)

    // 瓦片覆盖范围
    const tileSizeInViewBox = WIDTH / 2 ** z

    const range = 3
    const items: Array<{ x: number; y: number; left: number; top: number; size: number }> = []

    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const x = centerTileX + dx
        const y = centerTileY + dy
        if (x < 0 || y < 0 || x >= 2 ** z || y >= 2 ** z) continue

        const cx_px = WIDTH / 2
        const cy_px = HEIGHT / 2
        const left = cx_px + (x - cx) * tileSizeInViewBox
        const top = cy_px + (y - cy) * tileSizeInViewBox

        items.push({ x, y, left, top, size: tileSizeInViewBox })
      }
    }
    return { z, items }
  })()

  if (!key) {
    return (
      <g>
        {/* 半透明深色背板，让提示更醒目（之前是一行小字，容易被忽略） */}
        <rect x={WIDTH / 2 - 180} y={HEIGHT / 2 - 50} width={360} height={100} rx={8}
          fill="rgba(15,14,12,0.85)" stroke="#c89a5b" strokeWidth={1} />
        <text
          x={WIDTH / 2}
          y={HEIGHT / 2 - 18}
          textAnchor="middle"
          style={{ fill: '#c89a5b', fontSize: 18, fontWeight: 600 }}
        >
          🗺 天地图 API Key 未配置
        </text>
        <text
          x={WIDTH / 2}
          y={HEIGHT / 2 + 6}
          textAnchor="middle"
          style={{ fill: '#a89a82', fontSize: 12 }}
        >
          在项目根目录 .env 添加 VITE_TIANDITU_KEY=你的AK
        </text>
        <text
          x={WIDTH / 2}
          y={HEIGHT / 2 + 26}
          textAnchor="middle"
          style={{ fill: '#7a6e58', fontSize: 11 }}
        >
          申请地址: console.tianditu.gov.cn/api/key
        </text>
      </g>
    )
  }

  // 透明度：zoom 越大瓦片越小（分辨率高）→ 增加不透明度；越小（全球模糊）→ 降低
  // 也考虑极地：|lat| > 60 降低
  const latFactor = Math.max(0.5, 1 - Math.abs(center[1]) / 90 * 0.7)
  const opacity = Math.max(0.3, Math.min(0.9, 0.4 + zoom * 0.05) * latFactor)

  return (
    <>
      {/* 矢量底图 — 应用深色 filter */}
      <g style={{ filter: 'invert(0.88) hue-rotate(180deg) saturate(0.7) brightness(0.95)' }}>
        {tiles.items.map(t => (
          <image
            key={`vec-${t.x}-${t.y}`}
            href={TIANDITU_VEC(key, t.x, t.y, tiles.z)}
            x={t.left}
            y={t.top}
            width={t.size}
            height={t.size}
            preserveAspectRatio="none"
            opacity={opacity}
          />
        ))}
      </g>
      {/* 标注层 — 保持原色（白色文字），让城市/山名清晰可见 */}
      <g>
        {tiles.items.map(t => (
          <image
            key={`cva-${t.x}-${t.y}`}
            href={TIANDITU_CVA(key, t.x, t.y, tiles.z)}
            x={t.left}
            y={t.top}
            width={t.size}
            height={t.size}
            preserveAspectRatio="none"
            opacity={opacity * 0.85}
          />
        ))}
      </g>
    </>
  )
}
