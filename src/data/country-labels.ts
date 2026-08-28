/**
 * country-labels.ts — 国家/地区标签数据集
 *
 * 数据来源：world-atlas/countries-110m.json（已在项目依赖里）
 * 转换：topojson-client 把 TopoJSON 转成 GeoJSON Feature[]，
 *       计算每个国家的 bbox 中心作为标签位置
 *
 * 中文名维护：内置一份主要国家中英对照表（~80 个主要国家），其余用英文名
 * （110m 分辨率包括 ~177 个国家/地区，本应用场景下大多数偏远小岛不需要中文）
 */
import * as topojson from 'topojson-client'
// @ts-ignore — JSON import in Vite
import countriesTopo from 'world-atlas/countries-110m.json'
import type { FeatureCollection, Geometry } from 'geojson'

const topology = countriesTopo as any
const featureCollection = topojson.feature(
  topology,
  topology.objects.countries,
) as FeatureCollection<Geometry, { name: string }>

/** ISO numeric country code → 中文名（覆盖主要可见国家；未列出的用英文名） */
const CN_NAMES: Record<string, string> = {
  '004': '阿富汗', '008': '阿尔巴尼亚', '012': '阿尔及利亚', '024': '安哥拉',
  '032': '阿根廷', '036': '澳大利亚', '040': '奥地利', '050': '孟加拉国',
  '056': '比利时', '068': '玻利维亚', '070': '波斯尼亚和黑山', '072': '博茨瓦纳',
  '076': '巴西', '084': '伯利兹', '090': '所罗门群岛', '096': '文莱',
  '100': '保加利亚', '104': '缅甸', '108': '布隆迪', '112': '白俄罗斯',
  '116': '柬埔寨', '120': '喀麦隆', '124': '加拿大', '140': '中非共和国',
  '144': '斯里兰卡', '148': '乍得', '152': '智利', '156': '中国',
  '158': '中国台湾', '170': '哥伦比亚', '178': '刚果（布）', '180': '刚果（金）',
  '188': '哥斯达黎加', '191': '克罗地亚', '192': '古巴', '196': '塞浦路斯',
  '203': '捷克', '204': '贝宁', '208': '丹麦', '214': '多米尼加',
  '218': '厄瓜多尔', '222': '萨尔瓦多', '226': '赤道几内亚', '231': '埃塞俄比亚',
  '232': '厄立特里亚', '233': '爱沙尼亚', '242': '斐济', '246': '芬兰',
  '250': '法国', '262': '吉布提', '266': '加蓬', '268': '格鲁吉亚',
  '270': '冈比亚', '275': '巴勒斯坦', '276': '德国', '288': '加纳',
  '292': '直布罗陀', '300': '希腊', '320': '危地马拉', '324': '几内亚',
  '328': '圭亚那', '332': '海地', '340': '洪都拉斯', '348': '匈牙利',
  '352': '冰岛', '356': '印度', '360': '印度尼西亚', '364': '伊朗',
  '368': '伊拉克', '372': '爱尔兰', '376': '以色列', '380': '意大利',
  '384': '象牙海岸', '388': '牙买加', '392': '日本', '398': '哈萨克斯坦',
  '400': '约旦', '404': '肯尼亚', '408': '朝鲜', '410': '韩国',
  '414': '科威特', '417': '吉尔吉斯斯坦', '418': '老挝',
  '422': '黎巴嫩', '426': '莱索托', '428': '拉脱维亚', '430': '利比里亚',
  '434': '利比亚', '440': '立陶宛', '442': '卢森堡', '450': '马达加斯加',
  '454': '马拉维', '458': '马来西亚', '466': '马里', '478': '毛里塔尼亚',
  '480': '毛里求斯', '484': '墨西哥', '496': '蒙古', '498': '摩尔多瓦',
  '504': '摩洛哥', '508': '莫桑比克', '516': '纳米比亚', '524': '尼泊尔',
  '528': '荷兰', '540': '新喀里多尼亚', '548': '瓦努阿图', '554': '新西兰',
  '558': '尼加拉瓜', '562': '尼日尔', '566': '尼日利亚', '578': '挪威',
  '586': '巴基斯坦', '591': '巴拿马', '598': '巴布亚新几内亚', '600': '巴拉圭',
  '604': '秘鲁', '608': '菲律宾', '616': '波兰', '620': '葡萄牙',
  '624': '几内亚比绍', '626': '东帝汶', '630': '波多黎各', '634': '卡塔尔',
  '642': '罗马尼亚', '643': '俄罗斯', '646': '卢旺达', '682': '沙特阿拉伯',
  '686': '塞内加尔', '694': '塞拉利昂', '702': '新加坡', '703': '斯洛伐克',
  '704': '越南', '705': '斯洛文尼亚', '706': '索马里', '710': '南非',
  '716': '津巴布韦', '724': '西班牙', '728': '南苏丹', '729': '苏丹',
  '732': '西撒哈拉', '740': '苏里南', '748': '斯威士兰', '752': '瑞典',
  '756': '瑞士', '760': '叙利亚', '762': '塔吉克斯坦', '764': '泰国',
  '768': '多哥', '780': '特立尼达和多巴哥', '784': '阿联酋', '788': '突尼斯',
  '792': '土耳其', '795': '土库曼斯坦', '800': '乌干达', '804': '乌克兰',
  '807': '北马其顿', '818': '埃及', '826': '英国', '834': '坦桑尼亚',
  '840': '美国', '854': '布基纳法索', '858': '乌拉圭', '860': '乌兹别克斯坦',
  '862': '委内瑞拉', '882': '萨摩亚', '887': '也门', '894': '赞比亚',
  '-99': '西撒哈拉',
}

export interface CountryLabel {
  id: string
  name: string        // 显示名（中文优先，否则英文）
  lat: number
  lng: number
  size: number        // 字号（影响 alpha 权重）
  // 仅显示陆地面积 > 阈值 或重要性高的国家（避免在小岛/争议地区堆叠）
  importance: number
}

/** 计算几何 bbox 中心（适用于 Polygon / MultiPolygon，lng 经度会跨 180° 处理） */
function geometryBboxCenter(
  geom: Geometry,
): { lat: number; lng: number; area: number } | null {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  let pointCount = 0
  const visit = (ring: number[][]) => {
    for (const [x, y] of ring) {
      if (typeof x !== 'number' || typeof y !== 'number') continue
      minX = Math.min(minX, x); maxX = Math.max(maxX, x)
      minY = Math.min(minY, y); maxY = Math.max(maxY, y)
      pointCount++
    }
  }
  if (geom.type === 'Polygon') {
    for (const ring of geom.coordinates) visit(ring)
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) {
      for (const ring of poly) visit(ring)
    }
  }
  if (pointCount === 0) return null
  // 跨 180° 经度（bbox 跨度 > 350°）→ 国家横跨反子午线（如俄罗斯、美国阿拉斯加部分、斐济等）
  //   此时不能用简单 bbox center；这里跳过（label 自然 fallback 到英文）
  if (maxX - minX > 350) return null
  return {
    lng: (minX + maxX) / 2,
    lat: (minY + maxY) / 2,
    // 面积粗略估计：经度差 × 纬度差（绝对值，用于排序）
    area: Math.abs(maxX - minX) * Math.abs(maxY - minY),
  }
}

function buildLabels(): CountryLabel[] {
  const out: CountryLabel[] = []
  for (const feat of featureCollection.features) {
    const id = String((feat as any).id ?? '')
    const engName = (feat.properties as any)?.name ?? ''
    const cnName = CN_NAMES[id]
    const name = cnName || engName
    if (!name) continue
    const center = geometryBboxCenter(feat.geometry)
    if (!center) continue
    // 字号按面积分级（大国家=显眼，小国家=淡）
    let size = 0.30
    let importance = 1
    if (center.area > 1500) { size = 0.42; importance = 3 }
    else if (center.area > 400) { size = 0.35; importance = 2 }
    out.push({
      id,
      name,
      lat: center.lat,
      lng: center.lng,
      size,
      importance,
    })
  }
  return out
}

export const COUNTRY_LABELS: readonly CountryLabel[] = buildLabels()