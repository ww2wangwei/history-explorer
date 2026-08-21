/**
 * coordsTransform.ts — WGS-84 → GCJ-02 坐标转换
 *
 * 中国法律要求地图服务商对国内坐标进行 GCJ-02 加密（俗称"火星坐标"）。
 * 偏移量在 50-500 米之间，AMap / 腾讯 / 谷歌中国 都用 GCJ-02。
 *
 * 国际地点（不在中国境内）不偏移，原值返回。
 *
 * 来源：gcoord 开源实现（被众多国内工具采用的标准公式）
 */
const GCJ_A = 6378245.0           // 长半轴
const GCJ_EE = 0.00669342162296594323 // 第一偏心率平方

const LON_RANGE = [73, 135]   // 中国经度范围（粗略）
const LAT_RANGE = [18, 54]    // 中国纬度范围（粗略）

function outOfChina(lng: number, lat: number): boolean {
  return !(lng >= LON_RANGE[0] && lng <= LON_RANGE[1] && lat >= LAT_RANGE[0] && lat <= LAT_RANGE[1])
}

// gcoord 标准公式（与 eviltransform 完全等价的官方实现）
function _transformLat(x: number, y: number): number {
  let ret =
    -100.0 +
    2.0 * x +
    3.0 * y +
    0.2 * y * y +
    0.1 * x * y +
    0.2 * Math.sqrt(Math.abs(x))
  ret +=
    (20.0 * Math.sin(6.0 * x * Math.PI) +
      20.0 * Math.sin(2.0 * x * Math.PI)) *
    2.0 /
    3.0
  ret +=
    (20.0 * Math.sin(y * Math.PI) +
      40.0 * Math.sin((y / 3.0) * Math.PI)) *
    2.0 /
    3.0
  ret +=
    (160.0 * Math.sin((y / 12.0) * Math.PI) +
      320.0 * Math.sin((y * Math.PI) / 30.0)) *
    2.0 /
    3.0
  return ret
}

function _transformLng(x: number, y: number): number {
  let ret =
    300.0 +
    x +
    2.0 * y +
    0.1 * x * x +
    0.1 * x * y +
    0.1 * Math.sqrt(Math.abs(x))
  ret +=
    (20.0 * Math.sin(6.0 * x * Math.PI) +
      20.0 * Math.sin(2.0 * x * Math.PI)) *
    2.0 /
    3.0
  ret +=
    (20.0 * Math.sin(x * Math.PI) +
      40.0 * Math.sin((x / 3.0) * Math.PI)) *
    2.0 /
    3.0
  ret +=
    (150.0 * Math.sin((x / 12.0) * Math.PI) +
      300.0 * Math.sin((x / 30.0) * Math.PI)) *
    2.0 /
    3.0
  return ret
}

function _delta(lng: number, lat: number): { dLng: number; dLat: number } {
  let dLat = _transformLat(lng - 105.0, lat - 35.0)
  let dLng = _transformLng(lng - 105.0, lat - 35.0)
  const radLat = (lat / 180.0) * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - GCJ_EE * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180.0) / ((GCJ_A * (1 - GCJ_EE)) / (magic * sqrtMagic) * Math.PI)
  dLng = (dLng * 180.0) / (GCJ_A / sqrtMagic * Math.cos(radLat) * Math.PI)
  return { dLng, dLat }
}

/**
 * WGS-84 → GCJ-02（高德/腾讯/谷歌中国）
 * 国际点原值返回；中国点加密。
 */
export function wgs84ToGcj02([lng, lat]: [number, number]): [number, number] {
  if (outOfChina(lng, lat)) return [lng, lat]
  const { dLng, dLat } = _delta(lng, lat)
  return [lng + dLng, lat + dLat]
}

/** 路径/多边形多点批量转换 */
export function wgs84ToGcj02Path(path: [number, number][]): [number, number][] {
  return path.map(wgs84ToGcj02)
}