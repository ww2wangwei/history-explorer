import type { GeoJSON } from 'geojson'

/**
 * 数据懒加载器（含内存缓存）
 */

// 世界地图 GeoJSON 缓存
const worldGeoCache = new Map<number, GeoJSON.FeatureCollection>()

/**
 * 加载指定年份的世界地图 GeoJSON
 * 自动从 public/geo/world/{year}.geojson 拉取
 * 若文件不存在则返回 null（前端可降级）
 */
export async function loadWorldGeoJSON(year: number): Promise<GeoJSON.FeatureCollection | null> {
  if (worldGeoCache.has(year)) {
    return worldGeoCache.get(year)!
  }

  try {
    const res = await fetch(`/geo/world/${year}.geojson`)
    if (!res.ok) {
      console.warn(`World GeoJSON not found for year ${year}: ${res.status}`)
      return null
    }
    const data: GeoJSON.FeatureCollection = await res.json()
    worldGeoCache.set(year, data)
    return data
  } catch (err) {
    console.error(`Failed to load world GeoJSON for year ${year}:`, err)
    return null
  }
}

/**
 * 预加载指定年份范围的世界地图数据（用于平滑过渡）
 */
export async function preloadWorldGeoJSONRange(
  startYear: number,
  endYear: number,
  step: number,
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  const years: number[] = []
  for (let y = startYear; y <= endYear; y += step) {
    years.push(y)
  }

  let loaded = 0
  await Promise.all(
    years.map(async (y) => {
      await loadWorldGeoJSON(y)
      loaded++
      onProgress?.(loaded, years.length)
    })
  )
}

/**
 * 清除缓存（用于强制刷新数据）
 */
export function clearDataCache(): void {
  worldGeoCache.clear()
}