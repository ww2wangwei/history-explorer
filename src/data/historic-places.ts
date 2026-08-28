/**
 * historic-places.ts — 内置精选 POI 数据集
 *
 * 用途：替代 OSM Overpass（公共实例经常挂），给地球仪加 POI 点 + 文字标签。
 * 数据来源：项目已有的 eras.json 都城 + 手工补的世界著名历史城市/遗址。
 *
 * 字段：
 *  - id, name：唯一标识 + 显示名
 *  - lat, lng：经纬度
 *  - category：'capital'（古都）/ 'city'（著名城市）/ 'site'（历史遗址）
 *  - subtag：可选二级分类（castle / temple / ruin / observatory 等）
 *  - importance：1-3，影响字号与点大小
 *  - eraRange：可选，繁荣年代（仅 UI 文字）
 */
import erasData from '@/data/eras.json'
import type { Era } from '@/types'

export interface HistoricPlace {
  id: string
  name: string
  lat: number
  lng: number
  category: 'capital' | 'city' | 'site'
  subtag?: string
  importance: 1 | 2 | 3
  eraRange?: string
}

const eras = erasData as Era[]

// 从 era 数据自动提取都城作为 capital 类 POI
function capFromEras(): HistoricPlace[] {
  const seen = new Map<string, HistoricPlace>()
  for (const e of eras) {
    if (!e.capital || e.capital.length !== 2) continue
    const [lng, lat] = e.capital
    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`
    if (seen.has(key)) {
      const prev = seen.get(key)!
      // 多朝代共用同一都城 → 提升重要性
      prev.importance = 3
      prev.eraRange = `${prev.eraRange ?? ''} · ${e.name}`
      continue
    }
    seen.set(key, {
      id: `cap-${e.id}`,
      name: e.name === '阿卡德帝国' ? '阿卡德城' : e.name,  // 简化
      lat,
      lng,
      category: 'capital',
      subtag: e.region,
      importance: 2,
      eraRange: `${e.startYear < 0 ? `BC ${-e.startYear}` : e.startYear} ~ ${e.endYear < 0 ? `BC ${-e.endYear}` : e.endYear}`,
    })
  }
  return [...seen.values()]
}

// 手工补的世界著名历史城市/遗址
//  - 选 100+ 横跨各时代的著名地点
//  - 含 lat/lng（主要来源：维基百科常用坐标）
const HAND_CURATED: HistoricPlace[] = [
  // ===== 中国 =====
  { id: 'city-changan', name: '长安 (今西安)', lat: 34.27, lng: 108.95, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 202 ~ AD 907' },
  { id: 'city-luoyang', name: '洛阳', lat: 34.62, lng: 112.45, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 770 ~ AD 940' },
  { id: 'city-kaifeng', name: '开封 (汴梁)', lat: 34.80, lng: 114.30, category: 'city', subtag: 'capital', importance: 2, eraRange: 'AD 534 ~ 1234' },
  { id: 'city-hangzhou', name: '杭州 (临安)', lat: 30.27, lng: 120.16, category: 'city', subtag: 'capital', importance: 2, eraRange: 'AD 1127 ~ 1276' },
  { id: 'city-beijing', name: '北京 (燕京/大都)', lat: 39.90, lng: 116.41, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 1045 ~ AD 1949' },
  { id: 'city-nanjing', name: '南京 (金陵/建康)', lat: 32.06, lng: 118.80, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 229 ~ AD 1949' },
  { id: 'city-chengdu', name: '成都', lat: 30.57, lng: 104.07, category: 'city', importance: 2 },
  { id: 'site-greatwall', name: '万里长城', lat: 40.43, lng: 116.57, category: 'site', subtag: 'fortress', importance: 3, eraRange: 'BC 7 世纪 ~ AD 17 世纪' },
  { id: 'site-terracotta', name: '秦始皇兵马俑', lat: 34.39, lng: 109.28, category: 'site', subtag: 'tomb', importance: 3, eraRange: 'BC 210' },
  { id: 'site-forbiddencity', name: '紫禁城 (故宫)', lat: 39.92, lng: 116.40, category: 'site', subtag: 'palace', importance: 3, eraRange: 'AD 1406 ~ 至今' },
  { id: 'site-mogao', name: '敦煌莫高窟', lat: 40.04, lng: 94.81, category: 'site', subtag: 'temple', importance: 3, eraRange: 'AD 366 ~ 14 世纪' },

  // ===== 古埃及 =====
  { id: 'city-memphis', name: '孟菲斯 (古埃及)', lat: 29.85, lng: 31.25, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 3100 ~ BC 2181' },
  { id: 'city-thebes', name: '底比斯 (卢克索)', lat: 25.69, lng: 32.64, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 2055 ~ BC 1069' },
  { id: 'city-alexandria', name: '亚历山大', lat: 31.20, lng: 29.92, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 331 ~ AD 642' },
  { id: 'site-pyramids', name: '吉萨金字塔群', lat: 29.98, lng: 31.13, category: 'site', subtag: 'tomb', importance: 3, eraRange: 'BC 2580 ~ BC 2560' },
  { id: 'site-sphinx', name: '狮身人面像', lat: 29.98, lng: 31.13, category: 'site', subtag: 'monument', importance: 3, eraRange: 'BC 2500' },
  { id: 'site-karnak', name: '卡纳克神庙', lat: 25.72, lng: 32.66, category: 'site', subtag: 'temple', importance: 3, eraRange: 'BC 2055 ~ BC 100' },
  { id: 'site-abusimbel', name: '阿布辛贝神庙', lat: 22.34, lng: 31.63, category: 'site', subtag: 'temple', importance: 3, eraRange: 'BC 1264' },

  // ===== 古希腊 =====
  { id: 'city-athens', name: '雅典', lat: 37.97, lng: 23.73, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 508 ~ 至今' },
  { id: 'city-sparta', name: '斯巴达', lat: 37.08, lng: 22.43, category: 'city', importance: 2, eraRange: 'BC 900 ~ BC 146' },
  { id: 'city-corinth', name: '科林斯', lat: 37.94, lng: 22.93, category: 'city', importance: 2 },
  { id: 'site-acropolis', name: '雅典卫城 / 帕特农', lat: 37.97, lng: 23.73, category: 'site', subtag: 'temple', importance: 3, eraRange: 'BC 447 ~ BC 432' },
  { id: 'site-delphi', name: '德尔斐神庙', lat: 38.48, lng: 22.50, category: 'site', subtag: 'temple', importance: 3, eraRange: 'BC 8 世纪 ~ AD 4 世纪' },
  { id: 'site-olympia', name: '奥林匹亚', lat: 37.64, lng: 21.63, category: 'site', subtag: 'temple', importance: 3, eraRange: 'BC 776 ~ AD 393' },
  { id: 'site-knossos', name: '克诺索斯王宫', lat: 35.30, lng: 25.16, category: 'site', subtag: 'palace', importance: 3, eraRange: 'BC 1700 ~ BC 1450' },

  // ===== 古罗马 =====
  { id: 'city-rome', name: '罗马', lat: 41.90, lng: 12.50, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 753 ~ 至今' },
  { id: 'city-pompeii', name: '庞贝', lat: 40.75, lng: 14.49, category: 'city', importance: 2, eraRange: 'BC 600 ~ AD 79' },
  { id: 'city-constantinople', name: '君士坦丁堡', lat: 41.01, lng: 28.95, category: 'city', subtag: 'capital', importance: 3, eraRange: 'AD 330 ~ 1453' },
  { id: 'site-colosseum', name: '罗马斗兽场', lat: 41.89, lng: 12.49, category: 'site', subtag: 'amphitheater', importance: 3, eraRange: 'AD 72 ~ 80' },
  { id: 'site-pantheon', name: '万神殿', lat: 41.90, lng: 12.48, category: 'site', subtag: 'temple', importance: 3, eraRange: 'AD 118 ~ 128' },
  { id: 'site-forumpetra', name: '罗马广场', lat: 41.89, lng: 12.48, category: 'site', importance: 2 },

  // ===== 西亚 / 波斯 / 阿拉伯 =====
  { id: 'city-babylon', name: '巴比伦', lat: 32.54, lng: 44.42, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 2300 ~ BC 539' },
  { id: 'city-nineveh', name: '尼尼微', lat: 36.36, lng: 43.16, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 705 ~ BC 612' },
  { id: 'city-ur', name: '乌尔', lat: 30.96, lng: 46.10, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 2112 ~ BC 2004' },
  { id: 'city-persepolis', name: '波斯波利斯', lat: 29.94, lng: 52.89, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 518 ~ BC 330' },
  { id: 'city-susa', name: '苏萨', lat: 32.19, lng: 48.26, category: 'city', subtag: 'capital', importance: 2, eraRange: 'BC 4000 ~ BC 1218' },
  { id: 'city-baghdad', name: '巴格达', lat: 33.34, lng: 44.40, category: 'city', subtag: 'capital', importance: 3, eraRange: 'AD 762 ~ 至今' },
  { id: 'city-damascus', name: '大马士革', lat: 33.51, lng: 36.30, category: 'city', importance: 2 },
  { id: 'city-jerusalem', name: '耶路撒冷', lat: 31.78, lng: 35.22, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 3000 ~ 至今' },
  { id: 'city-mecca', name: '麦加', lat: 21.39, lng: 39.86, category: 'city', importance: 3 },
  { id: 'site-petra', name: '佩特拉古城', lat: 30.33, lng: 35.44, category: 'site', subtag: 'city', importance: 3, eraRange: 'BC 4 世纪 ~ AD 106' },

  // ===== 中亚 / 印度 =====
  { id: 'city-delhi', name: '德里', lat: 28.61, lng: 77.21, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 6 世纪 ~ 至今' },
  { id: 'city-mohenjo', name: '摩亨佐-达罗', lat: 27.33, lng: 68.14, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 2500 ~ BC 1900' },
  { id: 'city-varanasi', name: '瓦拉纳西', lat: 25.32, lng: 83.01, category: 'city', importance: 2 },
  { id: 'city-tashkent', name: '塔什干', lat: 41.30, lng: 69.24, category: 'city', importance: 2 },
  { id: 'city-samarkand', name: '撒马尔罕', lat: 39.65, lng: 66.96, category: 'city', importance: 3, eraRange: 'BC 7 世纪 ~ 至今' },
  { id: 'site-tajmahal', name: '泰姬陵', lat: 27.17, lng: 78.04, category: 'site', subtag: 'tomb', importance: 3, eraRange: 'AD 1632 ~ 1653' },
  { id: 'site-ellora', name: '埃洛拉石窟', lat: 20.02, lng: 75.18, category: 'site', subtag: 'temple', importance: 3, eraRange: 'AD 600 ~ 1000' },
  { id: 'site-angkor', name: '吴哥窟', lat: 13.41, lng: 103.87, category: 'site', subtag: 'temple', importance: 3, eraRange: 'AD 802 ~ 至今' },
  { id: 'site-borobudur', name: '婆罗浮法', lat: -7.61, lng: 110.20, category: 'site', subtag: 'temple', importance: 3, eraRange: 'AD 800' },

  // ===== 美洲 =====
  { id: 'city-teotihuacan', name: '特奥蒂瓦坎', lat: 19.69, lng: -98.84, category: 'city', importance: 3, eraRange: 'BC 100 ~ AD 550' },
  { id: 'city-tikal', name: '蒂卡尔', lat: 17.22, lng: -89.62, category: 'city', importance: 3, eraRange: 'BC 250 ~ AD 900' },
  { id: 'city-cuscotl', name: '库斯科', lat: -13.53, lng: -71.97, category: 'city', subtag: 'capital', importance: 3, eraRange: 'AD 1100 ~ 1533' },
  { id: 'city-tenochtitlan', name: '特诺奇提特兰', lat: 19.43, lng: -99.13, category: 'city', subtag: 'capital', importance: 3, eraRange: 'AD 1325 ~ 1521' },
  { id: 'city-chichenitza', name: '奇琴伊察', lat: 20.68, lng: -88.57, category: 'site', subtag: 'temple', importance: 3, eraRange: 'AD 600 ~ 1224' },
  { id: 'city-cahokia', name: '卡霍基亚土丘', lat: 38.65, lng: -90.06, category: 'site', importance: 2, eraRange: 'AD 600 ~ 1400' },

  // ===== 欧洲其他 =====
  { id: 'city-london', name: '伦敦', lat: 51.51, lng: -0.13, category: 'city', subtag: 'capital', importance: 3 },
  { id: 'city-paris', name: '巴黎', lat: 48.86, lng: 2.35, category: 'city', subtag: 'capital', importance: 3 },
  { id: 'city-venice', name: '威尼斯', lat: 45.44, lng: 12.32, category: 'city', importance: 2 },
  { id: 'city-byrzantium', name: '拜占庭', lat: 41.01, lng: 28.95, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 657 ~ AD 330' },
  { id: 'city-carthage', name: '迦太基', lat: 36.86, lng: 10.32, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 814 ~ BC 146' },
  { id: 'city-madrid', name: '马德里', lat: 40.42, lng: -3.70, category: 'city', subtag: 'capital', importance: 2 },
  { id: 'city-cordoba', name: '科尔多瓦', lat: 37.88, lng: -4.78, category: 'city', importance: 2 },
  { id: 'site-stonehenge', name: '巨石阵', lat: 51.18, lng: -1.83, category: 'site', subtag: 'ritual', importance: 3, eraRange: 'BC 3000 ~ BC 2000' },
  { id: 'site-versailles', name: '凡尔赛宫', lat: 48.80, lng: 2.12, category: 'site', subtag: 'palace', importance: 2 },
  { id: 'site-acropolisathens', name: '雅典卫城', lat: 37.97, lng: 23.73, category: 'site', subtag: 'fortress', importance: 3 },

  // ===== 非洲其他 =====
  { id: 'city-carthage', name: '迦太基', lat: 36.86, lng: 10.32, category: 'city', subtag: 'capital', importance: 3, eraRange: 'BC 814 ~ BC 146' },
  { id: 'city-timbuktu', name: '廷巴克图', lat: 16.77, lng: -3.00, category: 'city', importance: 2 },
  { id: 'city-great-zimbabwe', name: '大津巴布韦', lat: -20.27, lng: 30.93, category: 'site', importance: 2 },
  { id: 'city-kush', name: '麦罗埃 (库施)', lat: 16.93, lng: 33.75, category: 'city', subtag: 'capital', importance: 2 },
]

// 合并 + 去重（同坐标只保留 importance 最高的）
function buildAll(): HistoricPlace[] {
  const fromEras = capFromEras()
  const all = [...fromEras, ...HAND_CURATED]
  const byKey = new Map<string, HistoricPlace>()
  for (const p of all) {
    const key = `${p.lat.toFixed(2)},${p.lng.toFixed(2)}`
    const prev = byKey.get(key)
    if (!prev || p.importance > prev.importance) {
      byKey.set(key, p)
    }
  }
  return [...byKey.values()].sort((a, b) => b.importance - a.importance)
}

export const HISTORIC_PLACES: readonly HistoricPlace[] = buildAll()