// 中国省/直辖/自治区 省会坐标（粗略）
// 朝代弹窗会在地图上叠加该朝代涵盖的省份圆点+名称
import { HISTORICAL_CAPITALS, type HistoricalCapital } from './historical-capitals'
export type Province = { name: string; lon: number; lat: number }

export const CHINA_PROVINCES: Province[] = [
  { name: '北京', lon: 116.40, lat: 39.90 },
  { name: '天津', lon: 117.20, lat: 39.13 },
  { name: '上海', lon: 121.47, lat: 31.23 },
  { name: '重庆', lon: 106.55, lat: 29.56 },
  { name: '河北', lon: 114.48, lat: 38.03 },
  { name: '山西', lon: 112.55, lat: 37.87 },
  { name: '内蒙古', lon: 110.00, lat: 41.00 },
  { name: '辽宁', lon: 123.43, lat: 41.80 },
  { name: '吉林', lon: 125.33, lat: 43.88 },
  { name: '黑龙江', lon: 128.00, lat: 47.00 },
  { name: '江苏', lon: 118.78, lat: 32.07 },
  { name: '浙江', lon: 120.15, lat: 30.29 },
  { name: '安徽', lon: 117.27, lat: 31.86 },
  { name: '福建', lon: 119.30, lat: 26.08 },
  { name: '江西', lon: 115.89, lat: 28.68 },
  { name: '山东', lon: 117.00, lat: 36.65 },
  { name: '河南', lon: 113.65, lat: 34.76 },
  { name: '湖北', lon: 114.30, lat: 30.60 },
  { name: '湖南', lon: 112.98, lat: 28.23 },
  { name: '广东', lon: 113.27, lat: 23.13 },
  { name: '广西', lon: 108.33, lat: 22.84 },
  { name: '海南', lon: 110.35, lat: 20.02 },
  { name: '四川', lon: 104.07, lat: 30.67 },
  { name: '贵州', lon: 106.71, lat: 26.58 },
  { name: '云南', lon: 102.71, lat: 25.04 },
  { name: '西藏', lon: 88.00, lat: 31.00 },
  { name: '陕西', lon: 108.95, lat: 34.27 },
  { name: '甘肃', lon: 103.83, lat: 36.06 },
  { name: '青海', lon: 98.00, lat: 36.00 },
  { name: '宁夏', lon: 106.27, lat: 38.47 },
  { name: '新疆', lon: 87.00, lat: 43.00 },
  // 周边
  { name: '蒙古', lon: 106.00, lat: 47.92 },
  { name: '朝鲜', lon: 125.75, lat: 39.02 },
  { name: '韩国', lon: 127.00, lat: 37.50 },
  { name: '越南', lon: 105.85, lat: 21.02 },
]

/** 从 "河北南部" / "山西南部" 中提取基础省名（用于查找 CHINA_PROVINCES） */
function baseName(s: string): string {
  return s.replace(/(北部|南部|东部|西部|中部|大部|部分)/g, '').trim()
}

/**
 * 朝代 id → TERRITORY_PROVINCES 键的 fallback 映射。
 *
 * TERRITORY_PROVINCES 只存了 7 个聚合 key（qin/han/tang/song/yuan/ming/qing），
 * 但 TERRITORY_FILES 里有 15 个中国朝代。剩余 8 个朝代（spring-autumn、han-*、
 * three-kingdoms、jin-west、southern-northern、sui、five-dynasties、song-*）
 * 用最近似的聚合 key 兜底。
 *
 * 注：这是临时近似，后续要按史实精细化每个朝代的省份列表。
 */
const TERRITORY_FALLBACK: Record<string, string> = {
  'spring-autumn': 'qin',     // 春秋战国诸侯林立，疆域近似秦统一前的核心区
  'han-west': 'han',
  'han-east': 'han',
  'three-kingdoms': 'han',    // 三国基本在汉末十三州内
  'jin-west': 'han',          // 西晋接东汉，疆域相近
  'southern-northern': 'han', // 南北朝对峙，南方沿用汉末范围
  'sui': 'tang',              // 隋接唐前夕，疆域相似
  'five-dynasties': 'tang',   // 五代十国沿用唐末
  'song-north': 'song',       // 北宋
  'song-south': 'song',       // 南宋
}

// 世界帝国 fallback 在 empire-countries.ts 的 EMPIRE_FALLBACK 中定义

/** 朝代对应的现代省份/地区（基于谭其骧《中国历史地图集》粗略对应） */
export const TERRITORY_PROVINCES: Record<string, string[]> = {
  qin: ['河北', '山西', '辽宁', '山东', '河南', '江苏北部', '安徽北部', '湖北', '陕西', '甘肃东南', '宁夏', '四川东部', '重庆', '湖南北部'],
  han: ['河北', '山西', '内蒙古', '辽宁', '山东', '河南', '江苏', '安徽', '湖北', '湖南', '陕西', '甘肃', '宁夏', '青海', '四川', '重庆', '云南', '贵州西部', '广西', '广东', '海南', '朝鲜', '蒙古南部', '越南北部'],
  tang: ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '山东', '河南', '江苏', '安徽', '浙江', '福建', '江西', '湖北', '湖南', '广东', '广西', '海南', '陕西', '甘肃', '宁夏', '青海', '新疆', '重庆', '四川', '贵州', '云南', '蒙古', '朝鲜'],
  song: ['河北南部', '山西南部', '山东', '河南', '江苏', '安徽', '浙江', '福建', '江西', '湖北', '湖南', '广东', '广西', '海南', '陕西南部', '甘肃南部', '四川', '重庆', '贵州', '云南'],
  yuan: ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '山东', '河南', '江苏', '安徽', '浙江', '福建', '江西', '湖北', '湖南', '广东', '广西', '海南', '陕西', '甘肃', '宁夏', '青海', '新疆', '四川', '重庆', '贵州', '云南', '西藏', '蒙古', '朝鲜', '韩国'],
  ming: ['北京', '天津', '河北', '山西', '山东', '河南', '江苏', '安徽', '浙江', '福建', '江西', '湖北', '湖南', '广东', '广西', '海南', '陕西', '甘肃', '宁夏', '青海', '四川', '重庆', '贵州', '云南', '西藏', '辽宁'],
  qing: ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '山东', '河南', '江苏', '安徽', '浙江', '福建', '江西', '湖北', '湖南', '广东', '广西', '海南', '陕西', '甘肃', '宁夏', '青海', '新疆', '四川', '重庆', '贵州', '云南', '西藏', '台湾', '蒙古'],
}

/** 朝代对应省会（含方位修饰词保留在 chip 显示上）
 * 早期朝代（春战国、三国等）改用历史都邑（HistoricalCapital），结构兼容 Province
 */
export function getProvincesForTerritory(id: string): Province[] {
  // 🏛️ 优先：早期朝代（春战国、三国等）没有"现代省份"概念，用历史都邑标注
  const capitals: HistoricalCapital[] | undefined = HISTORICAL_CAPITALS[id]
  if (capitals) return capitals as unknown as Province[]

  // ⚡ fallback: id 找不到时尝试 TERRITORY_FALLBACK 映射的聚合 key
  let names = TERRITORY_PROVINCES[id]
  if (!names && TERRITORY_FALLBACK[id]) {
    names = TERRITORY_PROVINCES[TERRITORY_FALLBACK[id]]
  }
  if (!names) return []
  // 用 baseName 匹配 CHINA_PROVINCES（去方位词），但 chip 显示保留原名
  const seen = new Set<string>()
  const out: Province[] = []
  for (const n of names) {
    const base = baseName(n)
    if (seen.has(base)) continue
    seen.add(base)
    const p = CHINA_PROVINCES.find(p => p.name === base)
    if (p) out.push(p)
  }
  return out
}