// 检查每条地理坐标是否在其对应名称的真实位置上
// 期望区域：[lng_min, lng_max, lat_min, lat_max]
// 数据来源：维基百科常识，每条 name 的合理经纬度范围
const EXPECTED = {
  // 大洲
  'asia-continent': [40, 180, -10, 80], 'europe-continent': [-25, 60, 35, 75],
  'africa-continent': [-20, 50, -35, 38], 'north-america-continent': [-170, -50, 5, 80],
  'south-america-continent': [-85, -35, -56, 15], 'oceania-continent': [110, 180, -50, 0],
  'antarctica-continent': [-180, 180, -90, -60],
  // 海洋/海湾
  'mediterranean': [-10, 35, 30, 45], 'red-sea': [32, 45, 12, 30],
  'persian-gulf': [48, 56, 23, 30], 'black-sea': [27, 42, 40, 47],
  'caspian-sea': [47, 54, 36, 47], 'south-china-sea': [105, 121, 3, 21],
  'bengal-bay': [80, 95, 5, 22], 'arabian-sea': [55, 78, 8, 25],
  'caribbean': [-88, -60, 8, 25], 'north-sea': [-4, 9, 51, 61],
  // 湖泊
  'baikal': [103, 114, 51, 56], 'great-lakes': [-92, -76, 41, 49],
  'lake-victoria': [31, 35, -3, 3], 'aral-sea': [57, 62, 43, 47],
  'titicaca': [-71, -67, -16, -13], 'caspian-sea': [47, 54, 36, 47],
  'dead-sea': [35, 36, 31, 32], 'lake-superior': [-92, -84, 46, 49],
  'lake-geneva': [6, 7, 46, 47],
  // 河流
  'nile': [30, 36, 4, 32], 'amazon': [-78, -50, -5, 2],
  'yangtze': [90, 122, 24, 35], 'yellow-river': [95, 112, 32, 41],
  'mississippi': [-95, -89, 29, 47], 'ganges': [78, 90, 22, 30],
  'indus': [66, 80, 23, 36], 'tigris-euphrates': [38, 50, 29, 38],
  'rhine': [4, 9, 46, 52], 'danube': [8, 30, 43, 50],
  'volga': [40, 50, 45, 60], 'congo': [12, 25, -5, 5],
  'mekong': [100, 108, 9, 22], 'thames': [-2, 1, 51, 52],
  'yenisei': [80, 105, 50, 75],
  // 山脉
  'himalayas': [70, 100, 25, 38], 'alps': [5, 17, 43, 49],
  'andes': [-80, -65, -55, 12], 'rockies': [-125, -100, 30, 65],
  'kunlun': [75, 95, 33, 40], 'tianshan': [70, 95, 39, 44],
  'ural': [55, 67, 50, 70], 'atlas': [-10, 5, 28, 37],
  'great-dividing': [140, 153, -40, -15], 'appalachian': [-85, -70, 33, 47],
  'qinghai-tibet-plateau': [75, 105, 26, 40],
  // 沙漠
  'sahara': [-17, 35, 15, 32], 'taklamakan': [76, 90, 36, 41],
  'gobi': [95, 115, 39, 50], 'arabian': [40, 56, 15, 32],
  'australian': [120, 150, -32, -18], 'kalahari': [15, 30, -29, -18],
  'patagonia': [-75, -60, -55, -38],
  // 平原
  'ganges-plain': [76, 90, 22, 30], 'mesopotamia-plain': [38, 50, 29, 38],
  'nile-delta': [29, 33, 29, 32], 'north-china-plain': [113, 119, 32, 40],
  'yangtze-plain': [110, 122, 27, 33], 'amazon-basin': [-75, -50, -10, 2],
  'european-plain': [22, 60, 45, 60],
  // 半岛
  'arabian-peninsula': [35, 60, 12, 32], 'indochina': [92, 110, 5, 23],
  'india-peninsula': [68, 90, 8, 25], 'iberia': [-10, 5, 36, 44],
  'italian-peninsula': [8, 18, 37, 47], 'scandinavian': [4, 30, 55, 72],
  'somalia-peninsula': [40, 52, 0, 12], 'florida-peninsula': [-88, -79, 24, 31],
  'korea-peninsula': [124, 131, 33, 43],
  // 海峡
  'gibraltar': [-6, -5, 35, 36], 'malacca': [100, 105, 1, 5],
  'bosporus': [28, 30, 40, 42], 'hormuz': [55, 58, 25, 28],
  'english-channel': [-3, 3, 48, 52], 'makassar': [116, 120, -4, 0],
  'sunda': [105, 108, -7, -5], 'taiwan': [117, 122, 22, 26],
  // 瀑布
  'angel': [-63, -61, 5, 7], 'niagara': [-80, -78, 42, 44],
  'iguazu': [-55, -53, -27, -25], 'victoria-falls': [25, 27, -18, -17],
  'huangguoshu': [105, 107, 25, 27],
  // 区域
  'mesopotamia': [38, 50, 29, 38], 'mesoamerica': [-100, -82, 8, 22],
  // 路线
  'silk-road': [25, 110, 25, 50], 'roman-roads': [0, 35, 35, 50],
  'triangular-trade': [-50, 10, 0, 50], 'zheng-he': [40, 120, -15, 25],
  'cape-route': [-15, 75, -34, 38], 'crusades': [0, 40, 28, 50],
}

const fs = require('fs')
const raw = fs.readFileSync('scripts/extract-geos.out', 'utf8')
// 第二行是 JSON 数组
const jsonLine = raw.split('\n').filter(l => l.trim().startsWith('['))[0]
const arr = JSON.parse(jsonLine)

const issues = []
const seen = new Map()
arr.forEach(x => {
  // 查重复 id
  if (seen.has(x.id)) {
    issues.push({ id: x.id, name: x.name, type: x.group, lng: x.lng, lat: x.lat, problem: '重复 id', prev: seen.get(x.id) })
  } else {
    seen.set(x.id, [x.lng, x.lat])
  }
  // 查范围
  const exp = EXPECTED[x.id]
  if (!exp) {
    issues.push({ id: x.id, name: x.name, type: x.group, lng: x.lng, lat: x.lat, problem: '无预期范围（无法核对）' })
  } else {
    const [lngMin, lngMax, latMin, latMax] = exp
    if (x.lng < lngMin || x.lng > lngMax || x.lat < latMin || x.lat > latMax) {
      issues.push({ id: x.id, name: x.name, type: x.group, lng: x.lng, lat: x.lat, problem: `超出预期范围 [${lngMin},${lngMax},${latMin},${latMax}]` })
    }
  }
})

console.log('总数:', arr.length)
console.log('问题数:', issues.length)
issues.forEach(i => console.log(`  [${i.type}] ${i.id} (${i.name}): lng=${i.lng} lat=${i.lat} — ${i.problem}`))