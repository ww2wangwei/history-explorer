/**
 * HistoricalCapitals — 朝代/诸侯国都邑（用于"现代省份"概念不适用的早期朝代）
 *
 * 比如春秋战国：没有"现代省份对应"，但有著名的诸侯国都邑
 *   - 齐临淄、晋绛、楚郢、宋商丘、鲁曲阜、郑新郑…
 *
 * 与 china-provinces.ts 的区别：
 *   - china-provinces → "现代省/地区"语义
 *   - historical-capitals → "当时重要的城市/都邑"语义
 *
 * getProvincesForTerritory 优先用 TERRITORY_PROVINCES，找不到时尝试本文件。
 * 这样春秋战国、五代十国等"无现代省份对应"的朝代至少有几座都邑作为标注。
 */

/** 与 china-provinces.ts 的 Province 接口保持一致（独立定义避免循环依赖） */
export interface HistoricalCapital {
  name: string
  lon: number
  lat: number
}

/** 春秋战国主要诸侯国都邑（春秋初-战国末，BC 770 ~ BC 221） */
const SPRING_AUTUMN_CAPITALS: HistoricalCapital[] = [
  { name: '齐·临淄', lon: 118.37, lat: 36.86 },  // 今山东淄博
  { name: '晋·绛', lon: 111.55, lat: 35.50 },     // 今山西侯马
  { name: '楚·郢', lon: 112.21, lat: 30.32 },     // 今湖北荆州
  { name: '鲁·曲阜', lon: 116.99, lat: 35.59 },  // 今山东曲阜
  { name: '宋·商丘', lon: 115.65, lat: 34.45 },  // 今河南商丘
  { name: '郑·新郑', lon: 113.71, lat: 34.40 },  // 今河南新郑
  { name: '卫·朝歌', lon: 114.57, lat: 35.77 },  // 今河南淇县
  { name: '吴·姑苏', lon: 120.62, lat: 31.32 },  // 今江苏苏州
  { name: '越·会稽', lon: 120.58, lat: 30.04 },  // 今浙江绍兴
  { name: '周·洛邑', lon: 112.45, lat: 34.62 },  // 东周都城
]

/** 三国（魏蜀吴）核心都邑（BC 220 ~ AD 280） */
const THREE_KINGDOMS_CAPITALS: HistoricalCapital[] = [
  { name: '魏·洛阳', lon: 112.45, lat: 34.62 },
  { name: '蜀·成都', lon: 104.07, lat: 30.67 },
  { name: '吴·建业', lon: 118.78, lat: 32.07 },  // 今江苏南京
]

/** 五代十国主要都邑（AD 907 ~ 979） */
const FIVE_DYNASTIES_CAPITALS: HistoricalCapital[] = [
  { name: '后梁·汴', lon: 114.30, lat: 34.80 },
  { name: '后唐·洛阳', lon: 112.45, lat: 34.62 },
  { name: '后晋·汴', lon: 114.30, lat: 34.80 },
  { name: '后汉·汴', lon: 114.30, lat: 34.80 },
  { name: '后周·汴', lon: 114.30, lat: 34.80 },
]

/** 南北朝主要都邑（AD 420 ~ 589） */
const SOUTHERN_NORTHERN_CAPITALS: HistoricalCapital[] = [
  { name: '北魏·平城', lon: 113.30, lat: 40.10 },  // 今山西大同
  { name: '北魏·洛阳', lon: 112.45, lat: 34.62 },
  { name: '东魏·邺', lon: 114.38, lat: 36.10 },    // 今河北临漳
  { name: '南朝·建康', lon: 118.78, lat: 32.07 },  // 今江苏南京
]

/** 按朝代 id 索引的"历史都邑"列表 */
export const HISTORICAL_CAPITALS: Record<string, HistoricalCapital[]> = {
  'spring-autumn': SPRING_AUTUMN_CAPITALS,
  'three-kingdoms': THREE_KINGDOMS_CAPITALS,
  'five-dynasties': FIVE_DYNASTIES_CAPITALS,
  'southern-northern': SOUTHERN_NORTHERN_CAPITALS,
}

/** 给定朝代 id，返回历史都邑标注 */
export function getHistoricalCapitalsForTerritory(id: string): HistoricalCapital[] {
  return HISTORICAL_CAPITALS[id] ?? []
}