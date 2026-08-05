/**
 * 主要地理要素数据
 * 用于在地图上叠加显示 + 在"全地理"页弹出详情
 *
 * 所有坐标都是 [经度, 纬度]
 *
 * 图片来源：Bing 图片搜索 (tse1.mm.bing.net)
 * 后续可替换为维基共享资源或本地图片
 */

export type GeoFeatureType = 'continent' | 'sea' | 'mountain' | 'river' | 'desert' | 'region' | 'lake' | 'waterfall' | 'plain' | 'peninsula' | 'strait'

export interface GeoFeature {
  id: string
  type: GeoFeatureType
  name: string
  /** 标签显示位置 [经度, 纬度] */
  labelPos: [number, number]
  /** 几何要素（不同类型含义不同）：
   * - continent/sea: Polygon 轮廓
   * - mountain: 折线（简化山脊线）
   * - river: 折线（河流路径）
   * - region: 折线（区域）
   */
  geometry: [number, number][]
  /** 重要性 1-3，影响显示大小 */
  importance?: 1 | 2 | 3
  /** 中文介绍 */
  description?: string
  /** 图片 URL (Bing 图片搜索真实图片) */
  imageUrl?: string
  /** 图片来源标注 */
  imageCredit?: string
}

// ============= 大洲 =============
export const CONTINENTS: GeoFeature[] = [
  {
    id: 'asia-continent',
    type: 'continent',
    name: '亚洲',
    labelPos: [80, 45],
    importance: 1,
    description: '亚洲是世界上面积最大、人口最多的大洲，面积约 4458 万平方公里，占地球陆地总面积的 30%。北临北冰洋，东临太平洋，南临印度洋。亚洲是四大文明古国（古中国、古印度、古巴比伦、古埃及）中三个的所在地，孕育了儒教、佛教、印度教、伊斯兰教等世界性宗教，也是人类文明最重要的发源地之一。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=asia%20landscape%20temple&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [40, 70], [60, 75], [90, 75], [140, 70], [160, 60],
      [170, 50], [150, 40], [140, 30], [130, 20], [110, 5],
      [105, 0], [95, 5], [85, 10], [78, 12], [70, 20],
      [55, 25], [45, 30], [40, 40], [35, 50], [40, 60], [40, 70],
    ],
  },
  {
    id: 'europe-continent',
    type: 'continent',
    name: '欧洲',
    labelPos: [20, 55],
    importance: 1,
    description: '欧洲面积约 1018 万平方公里，是世界第六大洲。地处亚欧大陆西部，北临北冰洋，西临大西洋，南隔地中海与非洲相望。欧洲是古希腊罗马文明、文艺复兴、工业革命的发源地，对现代世界政治、经济、科技、文化影响深远。欧盟是欧洲一体化最重要的政治经济组织。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=europe%20alps%20landscape&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-10, 55], [-5, 60], [5, 65], [25, 68], [45, 67],
      [55, 60], [50, 50], [40, 42], [30, 38], [20, 38],
      [10, 40], [0, 45], [-10, 50], [-10, 55],
    ],
  },
  {
    id: 'africa-continent',
    type: 'continent',
    name: '非洲',
    labelPos: [20, 5],
    importance: 1,
    description: '非洲面积约 3020 万平方公里，是世界第二大洲。赤道横贯中部，北临地中海，东临红海和印度洋，西临大西洋。非洲是人类起源地（发现 300 万年前的南方古猿化石），孕育了古埃及文明，是人类的摇篮。撒哈拉沙漠是世界上最大的热沙漠，刚果盆地拥有世界第二大热带雨林。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=africa%20safari%20elephant&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-17, 32], [-10, 32], [0, 34], [15, 32], [30, 30],
      [42, 18], [50, 12], [52, 0], [40, -10], [30, -25],
      [18, -34], [10, -20], [5, -5], [-5, 5], [-15, 15], [-17, 25], [-17, 32],
    ],
  },
  {
    id: 'north-america-continent',
    type: 'continent',
    name: '北美洲',
    labelPos: [-100, 50],
    importance: 1,
    description: '北美洲面积约 2422 万平方公里，是世界第三大洲。北临北冰洋，东临大西洋，西临太平洋，南以巴拿马运河与南美洲分界。北美包括加拿大、美国、墨西哥等国家，是世界上经济最发达的地区之一。密西西比河是世界第四长河，五大湖是世界上最大的淡水湖群。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=yellowstone%20national%20park&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-170, 70], [-150, 72], [-100, 75], [-75, 75], [-60, 60],
      [-65, 45], [-80, 30], [-95, 18], [-105, 22], [-115, 32],
      [-130, 45], [-150, 60], [-170, 65], [-170, 70],
    ],
  },
  {
    id: 'south-america-continent',
    type: 'continent',
    name: '南美洲',
    labelPos: [-60, -15],
    importance: 1,
    description: '南美洲面积约 1784 万平方公里，是世界第四大洲。地处西半球南部，东临大西洋，西临太平洋，北临加勒比海。安第斯山脉纵贯西部，是世界上最长的山脉；亚马逊河是世界上流量最大、流域面积最广的河流；亚马逊雨林是地球之肺。南美洲孕育了印加文明，玛雅文明的中美洲部分也在此。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=andes%20south%20america%20machu%20picchu&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-80, 10], [-60, 12], [-50, 5], [-45, -5], [-40, -18],
      [-48, -28], [-58, -38], [-65, -45], [-72, -52], [-75, -40],
      [-78, -25], [-78, -10], [-80, 0], [-80, 10],
    ],
  },
  {
    id: 'oceania-continent',
    type: 'continent',
    name: '大洋洲',
    labelPos: [135, -25],
    importance: 1,
    description: '大洋洲位于太平洋中部和西南部，包括澳大利亚、新西兰、巴布亚新几内亚及太平洋诸岛国。陆地总面积约 897 万平方公里，是世界上最小的洲。澳大利亚大陆是世界上最小、最平坦、最干燥的大陆，著名的乌鲁鲁巨石、大堡礁都在这里。毛利人是新西兰的原住民。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=great%20barrier%20reef%20australia&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [113, -22], [120, -18], [130, -12], [140, -10], [148, -18],
      [153, -25], [150, -34], [142, -38], [130, -34], [120, -32], [113, -22],
    ],
  },
  {
    id: 'antarctica-continent',
    type: 'continent',
    name: '南极洲',
    labelPos: [0, -82],
    importance: 1,
    description: '南极洲位于地球最南端，面积约 1420 万平方公里，是世界第五大洲。平均海拔 2350 米，是世界上海拔最高的大洲。98% 的陆地被平均厚度 1.9 公里的冰盖覆盖，储存了世界上 70% 的淡水资源。最冷记录 -89.2°C（1983 年东方站）。无永久居民，只有科考队员。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=antarctica%20penguin%20ice&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-180, -65], [-90, -75], [0, -72], [90, -68], [180, -70], [180, -85], [0, -90], [-180, -85], [-180, -65],
    ],
  },
]

// ============= 海洋/海湾/水域 =============
export const SEAS: GeoFeature[] = [
  {
    id: 'mediterranean',
    type: 'sea',
    name: '地中海',
    labelPos: [15, 35],
    importance: 3,
    description: '地中海是欧洲、非洲、亚洲之间的陆间海，面积约 250 万平方公里。被誉为西方文明的摇篮 —— 古希腊罗马文明、腓尼基文明、迦太基文明都兴起于此。沿岸著名港口：马赛、巴塞罗那、罗马、雅典、伊斯坦布尔、亚历山大。1869 年苏伊士运河开通后，成为连接欧亚的重要航道。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=mediterranean%20sea%20blue%20water%20coast&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-5, 36], [-1, 38], [3, 40], [10, 42], [18, 41],
      [25, 38], [30, 36], [32, 32], [28, 33], [20, 35],
      [12, 35], [5, 34], [-5, 36],
    ],
  },
  {
    id: 'red-sea',
    type: 'sea',
    name: '红海',
    labelPos: [38, 22],
    importance: 2,
    description: '红海位于非洲东北部和阿拉伯半岛之间，面积约 45 万平方公里。因海水中生长有红色海藻而得名。是连接地中海（经苏伊士运河）和阿拉伯海的重要航道，对世界航运至关重要。红海也是世界上最年轻的海，约 3000 万年前由阿拉伯半岛从非洲分裂形成。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=red%20sea%20egypt%20coral%20reef&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [32, 30], [38, 28], [43, 22], [44, 16], [42, 12],
      [38, 14], [34, 20], [32, 26], [32, 30],
    ],
  },
  {
    id: 'persian-gulf',
    type: 'sea',
    name: '波斯湾',
    labelPos: [50, 26],
    importance: 2,
    description: '波斯湾（阿拉伯湾）位于阿拉伯半岛和伊朗之间，面积约 25 万平方公里，平均深度仅 50 米。是世界上最重要的石油产区，沿岸的沙特阿拉伯、伊朗、伊拉克、科威特、阿联酋等国拥有世界已探明石油储量的 50% 以上。霍尔木兹海峡是世界上最重要的石油运输通道，每天通过约 1700 万桶原油。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=persian%20gulf%20skyline%20dubai&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [48, 30], [52, 28], [56, 26], [56, 24], [52, 24],
      [48, 26], [48, 30],
    ],
  },
  {
    id: 'black-sea',
    type: 'sea',
    name: '黑海',
    labelPos: [35, 43],
    importance: 2,
    description: '黑海位于欧洲东南部，面积约 43.6 万平方公里，最大深度 2212 米。沿岸国家：土耳其、保加利亚、罗马尼亚、乌克兰、俄罗斯、格鲁吉亚。黑海通过博斯普鲁斯海峡与地中海相连，是古希腊殖民、黑海贸易的重要场所。希腊神话中，伊阿宋率阿耳戈英雄到此寻取金羊毛。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=black%20sea%20turkey%20coast&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [28, 42], [32, 46], [40, 46], [42, 44], [40, 42], [32, 41], [28, 42],
    ],
  },
  {
    id: 'caspian-sea',
    type: 'sea',
    name: '里海',
    labelPos: [51, 40],
    importance: 2,
    description: '里海是世界上最大的湖泊（虽是海），面积约 37 万平方公里。地处欧洲和亚洲的交界，被俄罗斯、哈萨克斯坦、土库曼斯坦、伊朗、阿塞拜疆五国环绕。富含石油、天然气和鱼类资源（鲟鱼鱼子酱）。里海沿岸有巴库（阿塞拜疆首都）等重要城市。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=caspian%20sea%20sunset&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [47, 45], [54, 45], [54, 36], [48, 36], [47, 45],
    ],
  },
  {
    id: 'south-china-sea',
    type: 'sea',
    name: '南海',
    labelPos: [115, 12],
    importance: 3,
    description: '南海是亚洲三大边缘海之一，面积约 350 万平方公里，平均深度 1212 米，最大深度 5567 米（马尼拉海沟）。通过台湾海峡、巴士海峡、马六甲海峡等连接太平洋和印度洋。是世界上最繁忙的国际航道之一，每年通过全球约 30% 的海运贸易。中国主张的九段线是争议焦点。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=south%20china%20sea%20philippines&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [100, 5], [105, 10], [110, 15], [115, 20], [120, 22], [120, 15], [118, 8], [110, 3], [105, 0], [100, 5],
    ],
  },
  {
    id: 'bengal-bay',
    type: 'sea',
    name: '孟加拉湾',
    labelPos: [88, 18],
    importance: 2,
    description: '孟加拉湾位于印度洋北部，被印度、孟加拉国、缅甸、斯里兰卡环绕。面积约 217 万平方公里，最大深度 4694 米。是热带气旋（旋风）频繁发生的地区，1970 年博拉旋风造成 30-50 万人死亡。恒河和布拉马普特拉河注入此湾，形成世界最大的海湾三角洲。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=bay%20of%20bengal%20india%20coast&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [80, 8], [85, 12], [90, 15], [95, 18], [95, 22], [88, 22], [80, 18], [78, 12], [80, 8],
    ],
  },
  {
    id: 'arabian-sea',
    type: 'sea',
    name: '阿拉伯海',
    labelPos: [65, 17],
    importance: 2,
    description: '阿拉伯海是印度洋西北部海域，面积约 386 万平方公里，最大深度 4652 米。位于阿拉伯半岛、印度、伊朗之间。是连接波斯湾（经霍尔木兹海峡）和红海（经亚丁湾）的重要海上通道。沿岸重要港口：孟买、卡拉奇、迪拜、亚丁。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=arabian%20sea%20india%20coast&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [55, 8], [60, 12], [68, 18], [73, 22], [70, 25], [60, 22], [55, 18], [52, 12], [55, 8],
    ],
  },
  {
    id: 'caribbean',
    type: 'sea',
    name: '加勒比海',
    labelPos: [-75, 15],
    importance: 2,
    description: '加勒比海位于中美洲、南美洲和西印度群岛之间，面积约 275 万平方公里，最大深度 7686 米（开曼海沟）。1492 年哥伦布在此登陆，开启大航海时代。著名的海盗活动、加勒比海地区丰富的珊瑚礁、玛雅文明遗址都使这片海域充满传奇色彩。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=caribbean%20sea%20beach%20tropical&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-88, 18], [-82, 14], [-77, 12], [-70, 11], [-60, 13], [-65, 18], [-75, 21], [-85, 21], [-88, 18],
    ],
  },
  {
    id: 'north-sea',
    type: 'sea',
    name: '北海',
    labelPos: [3, 56],
    importance: 1,
    description: '北海位于欧洲西北部，面积约 57 万平方公里，平均深度 95 米。是大西洋的边缘海，被英国、挪威、丹麦、德国、荷兰、比利时、法国环绕。是世界上最繁忙的海域之一，蕴藏丰富的石油和天然气资源。著名的北海渔场（鳕鱼、鲱鱼）和北海油田。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=north%20sea%20oil%20platform&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-4, 58], [0, 60], [5, 62], [10, 60], [8, 56], [4, 53], [-2, 53], [-4, 58],
    ],
  },
]

// ============= 湖泊 =============
export const LAKES: GeoFeature[] = [
  {
    id: 'baikal',
    type: 'lake',
    name: '贝加尔湖',
    labelPos: [108, 53],
    importance: 3,
    description: '贝加尔湖位于俄罗斯西伯利亚南部，是世界上最深、最古老的淡水湖，最大深度 1642 米（世界最深），已存在约 2500 万年。面积约 3.15 万平方公里，储存了世界淡水总量的 20%（约占地球表面液态淡水的 90%）。湖水清澈，能见度可达 40 米。栖息着 3700 多种生物，其中一半以上是特有物种（如贝加尔海豹）。1996 年列入世界文化遗产。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=lake%20baikal%20ice%20russia%20winter&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [105, 51.5], [108, 53], [110, 54], [110, 55], [108, 55.5], [105, 55], [104, 53], [105, 51.5],
    ],
  },
  {
    id: 'great-lakes',
    type: 'lake',
    name: '北美五大湖',
    labelPos: [-85, 45],
    importance: 2,
    description: '北美五大湖（苏必利尔湖、密歇根湖、休伦湖、伊利湖、安大略湖）是世界上最大的淡水湖群，总面积约 24.4 万平方公里，储存了世界淡水总量的 21%。位于加拿大和美国交界处，是冰川作用形成。湖水经圣劳伦斯河注入大西洋。沿岸有芝加哥、底特律、多伦多等大城市。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=great%20lakes%20superior%20lighthouse&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-92, 48], [-87, 48], [-83, 46], [-78, 43], [-82, 42], [-87, 42], [-92, 45], [-92, 48],
    ],
  },
  {
    id: 'lake-victoria',
    type: 'lake',
    name: '维多利亚湖',
    labelPos: [33, -1],
    importance: 1,
    description: '维多利亚湖位于东非，是非洲最大的湖泊，世界第二大淡水湖，面积约 6.88 万平方公里。由乌干达、肯尼亚、坦桑尼亚三国共有。是尼罗河源头之一（白尼罗河发源于此湖）。1858 年英国探险家斯皮克发现此湖，以维多利亚女王命名。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=lake%20victoria%20africa%20sunset&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [31, -3], [33, -1], [35, 0], [35, 3], [33, 4], [31, 3], [30, 0], [31, -3],
    ],
  },
  {
    id: 'aral-sea',
    type: 'lake',
    name: '咸海',
    labelPos: [60, 45],
    importance: 1,
    description: '咸海位于中亚，是曾经的世界第四大湖，面积从 1960 年的 6.8 万平方公里锐减到 2010 年的不足 1.7 万平方公里（90% 已消失）。原因是苏联时期引阿姆河、锡尔河水灌溉棉田，导致入湖水量锐减。咸海危机是 20 世纪最大的人为生态灾难之一，留下了"船舶坟场"。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=aral%20sea%20uzbekistan%20ship%20graveyard&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [58, 44], [62, 46], [62, 47], [58, 47], [58, 44],
    ],
  },
  {
    id: 'titicaca',
    type: 'lake',
    name: '的的喀喀湖',
    labelPos: [-69, -15],
    importance: 1,
    description: '的的喀喀湖位于南美洲秘鲁和玻利维亚交界处安第斯山脉中，面积约 8372 平方公里，海拔 3812 米，是世界上海拔最高的大型可通航湖泊。印加文明的发源地之一，湖中太阳岛（月亮岛）至今仍有原住民居住。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=lake%20titicaca%20peru%20bolivia&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-70, -16], [-68, -15], [-68, -14], [-70, -14], [-70, -16],
    ],
  },
]

// ============= 主要河流 =============
export const RIVERS: GeoFeature[] = [
  {
    id: 'nile',
    type: 'river',
    name: '尼罗河',
    labelPos: [31, 22],
    importance: 3,
    description: '尼罗河长约 6650 公里，是世界上最长的河流，发源于非洲东部布隆迪，注入地中海。白尼罗河和青尼罗河在喀土穆汇合。每年 6-10 月青尼罗河泛滥，为下游带来肥沃的土壤，孕育了古埃及文明（沿河留下卢克索、阿斯旺、金字塔、狮身人面像等遗迹）。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=nile%20river%20egypt%20cairo%20felucca&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [31, 31], [31, 28], [32, 25], [33, 22], [32, 19],
      [30, 16], [31, 12], [32, 8], [31, 5], [30, 2],
    ],
  },
  {
    id: 'amazon',
    type: 'river',
    name: '亚马逊河',
    labelPos: [-60, -3],
    importance: 3,
    description: '亚马逊河长约 6400 公里，是世界第二长河，但流量是尼罗河的 60 倍以上（平均 20 万立方米/秒），是世界上流域面积最大（705 万平方公里）、流量最大的河流。发源于安第斯山脉，注入大西洋。孕育了亚马逊雨林 —— 世界上最大的热带雨林，被誉为地球之肺。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=amazon%20river%20brazil%20rainforest&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-78, -4], [-72, -3], [-65, -3], [-58, -2], [-52, -1], [-50, 0], [-50, -1.5],
    ],
  },
  {
    id: 'yangtze',
    type: 'river',
    name: '长江',
    labelPos: [110, 30],
    importance: 3,
    description: '长江（扬子江）长约 6300 公里，是亚洲第一长河、世界第三长河，发源于青藏高原唐古拉山，注入东海。流经青、藏、川、滇、渝、鄂、湘、赣、皖、苏、沪 11 省市区，是中华文明的重要摇篮。三峡、葛洲坝水利枢纽、上海港、南京、武汉、重庆等沿河城市见证了中华民族的兴衰。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=yangtze%20river%20three%20gorges&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [92, 32], [98, 31], [105, 30], [112, 30], [118, 31], [122, 32],
    ],
  },
  {
    id: 'yellow-river',
    type: 'river',
    name: '黄河',
    labelPos: [103, 35],
    importance: 3,
    description: '黄河长约 5464 公里，是中国第二长河，发源于青藏高原巴颜喀拉山，注入渤海。流经青、川、甘、宁、内蒙古、晋、陕、豫、鲁 9 省区。是中华文明的母亲河，因含沙量极高（年均 16 亿吨）、下游为"地上河"而闻名。历史上多次改道，孕育了河洛文明、关中文化。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=yellow%20river%20china%20loess&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [98, 38], [102, 36], [106, 35], [110, 34], [114, 35], [118, 36],
    ],
  },
  {
    id: 'mississippi',
    type: 'river',
    name: '密西西比河',
    labelPos: [-90, 36],
    importance: 2,
    description: '密西西比河长约 6275 公里（含密苏里河支流），是北美洲第二长河、世界第四长河。发源于美国明尼苏达州，注入墨西哥湾。流域面积约 325 万平方公里，覆盖美国 31 个州和加拿大 2 个省。是美国内河航运大动脉，沿岸有圣路易斯、孟菲斯、新奥尔良等重要城市。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=mississippi%20river%20new%20orleans&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-95, 47], [-92, 43], [-91, 38], [-90, 35], [-90, 30], [-89, 29],
    ],
  },
  {
    id: 'ganges',
    type: 'river',
    name: '恒河',
    labelPos: [84, 27],
    importance: 3,
    description: '恒河长约 2525 公里，是印度最重要的河流，印度教徒视为圣河。发源于喜马拉雅山冈底斯山，流经印度北部、孟加拉国，注入孟加拉湾。瓦拉纳西、阿拉哈巴德、加尔各答等圣城沿河分布。恒河流域是古印度文明（吠陀文明、孔雀王朝、笈多王朝、莫卧儿王朝）的核心区域。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=ganges%20river%20varanasi%20ghats&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [80, 30], [83, 28], [86, 26], [88, 25], [89, 22],
    ],
  },
  {
    id: 'indus',
    type: 'river',
    name: '印度河',
    labelPos: [70, 27],
    importance: 2,
    description: '印度河长约 3180 公里，发源于西藏冈底斯山冈仁波齐，流经中国西藏、印度、巴基斯坦，注入阿拉伯海。古印度文明（哈拉帕文明）发源于印度河流域。沿河有卡拉奇、海得拉巴等城市，巴基斯坦农业（棉花、小麦）依赖印度河水灌溉。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=indus%20river%20pakistan&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [73, 33], [70, 30], [68, 27], [67, 24], [66, 21], [66, 18],
    ],
  },
  {
    id: 'tigris-euphrates',
    type: 'river',
    name: '两河流域',
    labelPos: [44, 33],
    importance: 3,
    description: '底格里斯河和幼发拉底河两河并行流经美索不达米亚平原（"两河之间"），注入波斯湾。古巴比伦、亚述、苏美尔文明都发源于此。沿河有巴格达、巴比伦、尼尼微等古城。著名的《汉谟拉比法典》、空中花园、乌尔塔庙都位于此地。两河平原是文明的摇篮之一。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=tigris%20river%20iraq%20mosul&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [40, 38], [42, 36], [44, 34], [46, 32], [47, 30],
      [48, 28], [49, 30], [50, 31],
    ],
  },
  {
    id: 'rhine',
    type: 'river',
    name: '莱茵河',
    labelPos: [7, 50],
    importance: 2,
    description: '莱茵河长约 1233 公里，发源于瑞士阿尔卑斯山，流经列支敦士登、奥地利、德国、法国、荷兰，注入北海。是欧洲最重要的河流之一，被誉为"欧洲交通走廊"和"德意志民族的命运之河"。沿岸有巴塞尔、斯特拉斯堡、科布伦茨、科隆、杜塞尔多夫、鹿特丹等城市。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=rhine%20river%20germany%20castle&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [9, 47], [8, 49], [7, 50], [6, 51], [5, 52],
    ],
  },
  {
    id: 'danube',
    type: 'river',
    name: '多瑙河',
    labelPos: [17, 47],
    importance: 2,
    description: '多瑙河长约 2850 公里，是世界第二长河（仅次于伏尔加河），流经 10 个国家（德国、奥地利、斯洛伐克、匈牙利、克罗地亚、塞尔维亚、罗马尼亚、保加利亚、摩尔多瓦、乌克兰），注入黑海。约翰·施特劳斯的《蓝色多瑙河》使其成为世界上最著名的河流音乐主题。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=danube%20river%20budapest%20hungary&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [8, 48], [12, 48], [17, 47], [22, 46], [27, 45], [30, 45],
    ],
  },
  {
    id: 'volga',
    type: 'river',
    name: '伏尔加河',
    labelPos: [45, 55],
    importance: 2,
    description: '伏尔加河长约 3690 公里，是欧洲最长河流，俄罗斯的母亲河。发源于俄罗斯瓦尔代丘陵，注入里海。流域居住着俄罗斯近一半的人口，沿岸有莫斯科（支流）、下诺夫哥罗德、喀山、伏尔加格勒（原斯大林格勒）、阿斯特拉罕等城市。苏联歌曲《莫斯科郊外的晚上》《喀秋莎》《伏尔加船夫曲》都源于此。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=volga%20river%20russia%20samara&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [35, 57], [40, 56], [45, 55], [48, 52], [50, 50], [48, 47], [47, 46],
    ],
  },
  {
    id: 'congo',
    type: 'river',
    name: '刚果河',
    labelPos: [18, 0],
    importance: 2,
    description: '刚果河长约 4700 公里，是非洲第二长河，世界流域面积第二大的河流（仅次于亚马逊），流量世界第二。流域有世界第二大热带雨林 —— 刚果雨林。河口深邃（最深处 220 米），是世界上唯一在赤道两侧都有支流的大河。19 世纪斯坦利的探险使其闻名于世。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=congo%20river%20africa%20rainforest&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [12, -6], [16, -3], [18, 0], [20, 2], [22, 4], [20, 6], [12, 4],
    ],
  },
  {
    id: 'mekong',
    type: 'river',
    name: '湄公河',
    labelPos: [105, 15],
    importance: 2,
    description: '湄公河长约 4909 公里，发源于中国青藏高原（在中国境内称澜沧江），流经中国、缅甸、老挝、泰国、柬埔寨、越南，注入南海。是东南亚最长的河流，孕育了下游的湄公河文明（高棉文明、占婆文明），沿岸有万象、金边、胡志明市等首都城市。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=mekong%20river%20southeast%20asia&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [100, 22], [102, 19], [105, 15], [106, 12], [108, 10], [107, 8],
    ],
  },
  {
    id: 'thames',
    type: 'river',
    name: '泰晤士河',
    labelPos: [-0.1, 51.5],
    importance: 1,
    description: '泰晤士河长约 346 公里，是英国最重要的河流，流经牛津、雷丁、温莎、伦敦等城市，注入北海。是英国历史的见证 —— 罗马时代、撒克逊时代、维京时代、诺曼征服、工业革命都留下遗迹。伦敦塔、伦敦塔桥、议会大厦沿河而建。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=thames%20river%20london%20tower%20bridge&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-2, 51.5], [-1, 51.5], [-0.1, 51.5], [0.5, 51.5], [1, 51.7],
    ],
  },
]

// ============= 主要山脉 =============
export const MOUNTAINS: GeoFeature[] = [
  {
    id: 'himalayas',
    type: 'mountain',
    name: '喜马拉雅山',
    labelPos: [85, 30],
    importance: 3,
    description: '喜马拉雅山长约 2450 公里，宽约 200-350 公里，平均海拔 6000 米以上，是世界上最高大、最年轻的山脉之一。位于青藏高原南缘，分布在中国、印度、尼泊尔、不丹、巴基斯坦。拥有 110 多座海拔 7000 米以上的山峰，包括世界最高峰珠穆朗玛峰（8848.86 米）、乔戈里峰、洛子峰等。"喜马拉雅"藏语意为"雪的故乡"。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=himalayas%20mountains%20everest%20snow&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [75, 35], [78, 33], [82, 31], [85, 30], [88, 29], [92, 28], [95, 27],
    ],
  },
  {
    id: 'alps',
    type: 'mountain',
    name: '阿尔卑斯山',
    labelPos: [10, 47],
    importance: 3,
    description: '阿尔卑斯山长约 1200 公里，平均海拔 3000 米以上，最高峰勃朗峰（4810 米）。位于欧洲中南部，从法国南部延伸到斯洛文尼亚，跨越意大利、法国、瑞士、德国、奥地利、列支敦士登、斯洛文尼亚 7 国。是欧洲最重要的山脉，是多瑙河、莱茵河、波河、罗讷河的发源地，被誉为"欧洲脊梁"。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=alps%20mountains%20matterhorn%20switzerland&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [5, 46], [8, 47], [10, 47], [12, 47], [15, 46], [17, 45],
    ],
  },
  {
    id: 'andes',
    type: 'mountain',
    name: '安第斯山脉',
    labelPos: [-70, -25],
    importance: 3,
    description: '安第斯山脉长约 7000 公里，是世界上最长的山脉，纵贯南美大陆西岸，从委内瑞拉到火地岛，跨越 7 国（委内瑞拉、哥伦比亚、厄瓜多尔、秘鲁、玻利维亚、智利、阿根廷）。平均海拔 3660 米，最高峰阿空加瓜山（6961 米）。印加文明发源地，马丘比丘、的的喀喀湖、复活节岛都与之相关。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=andes%20mountains%20peru%20machu%20picchu&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-78, 10], [-75, 0], [-72, -10], [-70, -20], [-68, -30], [-67, -40], [-70, -50],
    ],
  },
  {
    id: 'rockies',
    type: 'mountain',
    name: '落基山脉',
    labelPos: [-115, 45],
    importance: 2,
    description: '落基山脉长约 4800 公里，从加拿大不列颠哥伦比亚省延伸到美国新墨西哥州，是北美洲最重要的山脉。最高峰埃尔伯特山（4401 米）。黄石国家公园、冰川国家公园、大提顿国家公园都位于此。是北美的"脊梁"，分隔太平洋和大西洋水系。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=rocky%20mountains%20canada%20landscape&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-125, 60], [-120, 55], [-115, 45], [-110, 38], [-105, 32],
    ],
  },
  {
    id: 'kunlun',
    type: 'mountain',
    name: '昆仑山',
    labelPos: [85, 36],
    importance: 2,
    description: '昆仑山西起帕米尔高原，横贯新疆、西藏、青海、四川，长约 2500 公里，平均海拔 5500-6000 米。最高峰公格尔山（7649 米）。中国神话中的万山之祖，是道教"昆仑墟"所在地。黄河、长江、塔里木河、雅鲁藏布江等多条大河的发源地。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=kunlun%20mountains%20china%20tibet&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [78, 38], [82, 36], [85, 36], [88, 35], [92, 34], [95, 33],
    ],
  },
  {
    id: 'tianshan',
    type: 'mountain',
    name: '天山',
    labelPos: [82, 42],
    importance: 2,
    description: '天山横贯新疆中部，长约 2500 公里，平均海拔 4000 米，最高峰托木尔峰（7443 米）。是新疆最重要的山脉，分隔准噶尔盆地和塔里木盆地。是古丝绸之路北道的重要屏障，也是当代"一带一路"的重要通道。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=tianshan%20mountains%20xinjiang%20china&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [75, 45], [78, 43], [82, 42], [85, 41], [88, 42], [90, 43],
    ],
  },
  {
    id: 'ural',
    type: 'mountain',
    name: '乌拉尔山',
    labelPos: [60, 60],
    importance: 1,
    description: '乌拉尔山长约 2500 公里，从北冰洋沿岸延伸到哈萨克斯坦北部，是欧洲和亚洲的传统分界线。平均海拔 500-1200 米，最高峰纳罗德纳亚山（1895 米）。蕴藏丰富的铁矿、铜矿、宝石（孔雀石、紫水晶、翡翠）。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=ural%20mountains%20russia&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [55, 67], [58, 64], [60, 60], [62, 56], [60, 53],
    ],
  },
  {
    id: 'atlas',
    type: 'mountain',
    name: '阿特拉斯山脉',
    labelPos: [-7, 32],
    importance: 1,
    description: '阿特拉斯山脉位于非洲西北部，从摩洛哥延伸至突尼斯，长约 2400 公里。最高峰图卜卡勒山（4167 米）。希腊神话中， Atlas 神（擎天神）被认为居住于此。山脉分割了地中海沿岸与撒哈拉沙漠。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=atlas%20mountains%20morocco%20snow&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-10, 35], [-7, 33], [-7, 32], [-5, 32], [-3, 33], [0, 35], [5, 35], [10, 36],
    ],
  },
  {
    id: 'great-dividing',
    type: 'mountain',
    name: '大分水岭',
    labelPos: [148, -25],
    importance: 1,
    description: '大分水岭位于澳大利亚东部，长约 3500 公里，平均海拔 1000 米，最高峰科修斯科山（2228 米）。是大堡礁山脉的一部分，分隔了太平洋水系和印度洋水系。澳大利亚东部沿海城市（悉尼、墨尔本、布里斯班）都位于其东侧。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=great%20dividing%20range%20australia&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [142, -18], [145, -22], [148, -25], [151, -30], [150, -35], [146, -38], [143, -35], [142, -30], [142, -22],
    ],
  },
  // —— 中国主要山脉 ——
  {
    id: 'qinling',
    type: 'mountain',
    name: '秦岭',
    labelPos: [108, 34],
    importance: 3,
    description: '秦岭是中国南北地理分界线（与淮河合称"秦岭-淮河线"），东西绵延 1600 多公里，是亚热带与暖温带的天然界线，也是长江流域与黄河流域的分水岭。最高峰太白山（3767 米）。汉唐时期，秦岭是关中平原（长安）与汉中/巴蜀之间的天然屏障，发生过无数次军事对峙（暗度陈仓、诸葛亮北伐等）。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=qinling%20mountains%20china%20snow&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [104, 34], [106, 34], [108, 34], [110, 33.5], [112, 34],
    ],
  },
  {
    id: 'hengduan',
    type: 'mountain',
    name: '横断山脉',
    labelPos: [99, 28],
    importance: 3,
    description: '横断山脉位于青藏高原东缘，是世界上最年轻的山脉之一，由一系列南北走向的山脉（金沙江、澜沧江、怒江等深切其中）构成"三江并流"奇观，平均海拔 4000 米以上。最高峰贡嘎山（7556 米）。地质构造复杂，生物多样性极高，是藏羌彝民族文化走廊。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=hengduan%20mountains%20yunnan&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [97, 30], [98, 29], [99, 28], [100, 27], [101, 26], [102, 25], [101, 24], [100, 23],
    ],
  },
  {
    id: 'taihang',
    type: 'mountain',
    name: '太行山',
    labelPos: [113, 37],
    importance: 2,
    description: '太行山位于华北平原与黄土高原之间，南北绵延 400 多公里，平均海拔 1500-2000 米，最高峰五台山（3061 米；五台山与太行山同属恒山-太行山系）。是华北平原的天然屏障，古代"太行八陉"是穿越山脉的咽喉要道，墨子、愚公移山等典故皆出于此。八路军抗日主战场。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=taihang%20mountains%20china&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [112, 39], [113, 38], [113, 37], [114, 36], [114, 35], [113, 34],
    ],
  },
  {
    id: 'qilian',
    type: 'mountain',
    name: '祁连山',
    labelPos: [99, 39],
    importance: 2,
    description: '祁连山位于青海与甘肃交界，东西长约 800 公里，平均海拔 4000 米以上，最高峰团结峰（5827 米）。"祁连"匈奴语意为"天山"，是河西走廊南侧的天然屏障。祁连山冰雪融水孕育了河西走廊绿洲（武威、张掖、酒泉、敦煌），是古丝绸之路的核心通道。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=qilian%20mountains%20gansu&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [94, 39], [96, 39], [98, 39], [100, 39], [102, 39],
    ],
  },
  {
    id: 'great-khingan',
    type: 'mountain',
    name: '大兴安岭',
    labelPos: [124, 50],
    importance: 2,
    description: '大兴安岭位于内蒙古东部与黑龙江交界，呈东北-西南走向，长约 1200 公里，平均海拔 1100-1400 米，最高峰黄岗梁（2029 米）。是嫩江、额尔古纳河、松花江的发源地，分隔东北平原与蒙古高原。清朝发祥地之一（"龙兴之地"），至今是中国最大的原始林区。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=great%20khingan%20range%20china&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [118, 50], [120, 50], [122, 50], [124, 50], [127, 49], [127, 47],
    ],
  },
  {
    id: 'yinshan',
    type: 'mountain',
    name: '阴山',
    labelPos: [109, 41],
    importance: 2,
    description: '阴山位于内蒙古中部，是黄河"几"字弯北侧的天然屏障，长约 1200 公里，最高峰呼和巴什格山（2364 米）。战国时期李牧守边抗匈奴、秦时蒙恬北击匈奴、修筑万里长城，皆以阴山为屏障。汉武帝派卫青、霍去病出阴山北击匈奴，封狼居胥。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=yinshan%20mountains%20inner%20mongolia&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [107, 41], [109, 41], [111, 41], [113, 41], [115, 42],
    ],
  },
  {
    id: 'altai',
    type: 'mountain',
    name: '阿尔泰山',
    labelPos: [90, 47],
    importance: 1,
    description: '阿尔泰山位于新疆北部，中、俄、哈、蒙四国交界，长约 2000 公里，平均海拔 1000-3000 米，最高峰友谊峰（4374 米）。额尔齐斯河的发源地。中国古代重要游牧民族（匈奴、鲜卑、突厥）发祥地之一。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=altai%20mountains%20china&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [88, 48], [89, 47.5], [90, 47], [91, 47], [92, 47],
    ],
  },
  {
    id: 'nanling',
    type: 'mountain',
    name: '南岭',
    labelPos: [112, 25],
    importance: 2,
    description: '南岭是长江流域与珠江流域的分水岭，横亘湘、赣、粤、桂四省交界，由五岭（大庾岭、骑田岭、都庞岭、萌渚岭、越城岭）组成，平均海拔 1000-1500 米。秦始皇统一六国后建灵渠沟通湘江与漓水；长征中红军翻越老山界即在此。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=nangling%20five%20mountains%20china&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [110, 26], [111, 25.5], [112, 25], [113, 25], [114, 25],
    ],
  },
  {
    id: 'wuling',
    type: 'mountain',
    name: '武陵山',
    labelPos: [110, 29],
    importance: 1,
    description: '武陵山位于湘、鄂、渝、黔四省交界，长约 420 公里，平均海拔 1000 米，最高峰梵净山（2572 米）。陶渊明《桃花源记》中的"武陵人"指此区域。土家族、苗族聚居地。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=wuling%20mountains%20china&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [108, 30], [109, 29.5], [110, 29], [111, 29], [112, 29],
    ],
  },
  {
    id: 'bayankala',
    type: 'mountain',
    name: '巴颜喀拉山',
    labelPos: [96, 35],
    importance: 1,
    description: '巴颜喀拉山位于青海南部，是长江与黄河的分水岭，平均海拔 5000 米以上，最高峰果洛山（5369 米）。长江南源当曲、北源楚玛尔河都发源于此，"中华民族母亲河"两源汇聚之地。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=bayankala%20mountains%20china&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [94, 35], [95, 35], [96, 35], [97, 35], [98, 35],
    ],
  },
  // —— 世界其他重要山脉 ——
  {
    id: 'caucasus',
    type: 'mountain',
    name: '高加索山脉',
    labelPos: [44, 43],
    importance: 2,
    description: '高加索山脉位于欧亚大陆分界线上，黑海与里海之间，长约 1200 公里，最高峰厄尔布鲁士山（5642 米，欧洲最高峰）。传统上被视为欧亚分界线之一。希腊神话中"普罗米修斯被缚于此"。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=caucasus%20mountains%20elbrus&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [40, 44], [42, 43], [44, 43], [46, 42], [48, 41],
    ],
  },
  {
    id: 'zargos',
    type: 'mountain',
    name: '扎格罗斯山脉',
    labelPos: [48, 33],
    importance: 2,
    description: '扎格罗斯山脉位于伊朗高原西部，从伊朗西北延伸至波斯湾，长约 1500 公里，平均海拔 3000 米，最高峰扎尔德峰（4548 米）。是古波斯帝国（阿契美尼德王朝）的天然屏障，也是波斯帝国与美索不达米亚的地理分界。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=zagros%20mountains%20iran&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [45, 36], [46, 35], [47, 34], [48, 33], [49, 31], [50, 29],
    ],
  },
  {
    id: 'hindu-kush',
    type: 'mountain',
    name: '兴都库什山脉',
    labelPos: [70, 36],
    importance: 1,
    description: '兴都库什山脉位于阿富汗和巴基斯坦，长约 800 公里，平均海拔 4500 米，最高峰蒂里奇米尔峰（7708 米）。是中亚通往南亚次大陆的天然屏障，丝绸之路上的关键要隘。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=hindu%20kush%20mountains&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [68, 38], [69, 37], [70, 36], [71, 35.5], [72, 35],
    ],
  },
  {
    id: 'carpathians',
    type: 'mountain',
    name: '喀尔巴阡山脉',
    labelPos: [25, 47],
    importance: 1,
    description: '喀尔巴阡山脉位于中欧，呈弧形横跨捷克、斯洛伐克、波兰、乌克兰、罗马尼亚，长约 1500 公里，平均海拔 1000-1500 米，最高峰格尔拉赫峰（2655 米）。与阿尔卑斯山共同构成欧洲中部山地脊梁。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=carpathian%20mountains%20landscape&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [20, 50], [22, 49], [24, 48], [25, 47], [26, 46], [27, 45],
    ],
  },
  {
    id: 'pyrenees',
    type: 'mountain',
    name: '比利牛斯山脉',
    labelPos: [0, 43],
    importance: 1,
    description: '比利牛斯山脉分隔法国与西班牙，从大西洋延伸至地中海，长约 430 公里，平均海拔 2000 米，最高峰阿内托峰（3404 米）。是伊比利亚半岛与欧洲大陆的天然屏障。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=pyrenees%20mountains&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-2, 43], [0, 43], [2, 42.5], [3, 42.5],
    ],
  },
  {
    id: 'appalachians',
    type: 'mountain',
    name: '阿巴拉契亚山脉',
    labelPos: [-78, 39],
    importance: 1,
    description: '阿巴拉契亚山脉位于美国东部，从加拿大魁北克延伸到亚拉巴马州，长约 2400 公里，平均海拔 900 米，最高峰米切尔峰（2037 米）。是北美早期殖民地开拓、阿巴拉契亚小道的关键地理标志。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=appalachian%20mountains%20usa&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-82, 45], [-80, 42], [-78, 39], [-76, 36], [-80, 32],
    ],
  },
  {
    id: 'sierra-madre',
    type: 'mountain',
    name: '马德雷山脉',
    labelPos: [-100, 23],
    importance: 1,
    description: '马德雷山脉位于墨西哥境内，由东、西、南三条平行山系组成，全长约 1300 公里，最高峰韦韦托山（5751 米）。是墨西哥高原的"脊柱"，孕育了玛雅与阿兹特克文明的核心区域。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=sierra%20madre%20mountains%20mexico&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-103, 28], [-101, 25], [-100, 23], [-99, 20], [-97, 17],
    ],
  },
]

// ============= 沙漠 =============
export const DESERTS: GeoFeature[] = [
  {
    id: 'sahara',
    type: 'desert',
    name: '撒哈拉沙漠',
    labelPos: [20, 23],
    importance: 3,
    description: '撒哈拉沙漠位于非洲北部，面积约 906 万平方公里，是世界上最大的热沙漠（仅次于南极和北极）。横跨阿尔及利亚、利比亚、埃及、苏丹、乍得、尼日尔、马里、毛里塔尼亚、西撒哈拉等 11 国。年降水量不足 100 毫米，最高气温记录 58°C。"撒哈拉"阿拉伯语意为"大沙漠"。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=sahara%20desert%20sand%20dunes%20camel&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-15, 30], [-5, 32], [5, 32], [15, 30], [25, 30], [32, 25], [33, 18], [30, 15], [20, 14], [10, 18], [-5, 22], [-15, 28], [-15, 30],
    ],
  },
  {
    id: 'taklamakan',
    type: 'desert',
    name: '塔克拉玛干沙漠',
    labelPos: [83, 39],
    importance: 2,
    description: '塔克拉玛干沙漠位于新疆塔里木盆地中部，面积约 33.7 万平方公里，是中国最大的沙漠，世界第十大沙漠。"塔克拉玛干"维吾尔语意为"进去出不来"，又称"死亡之海"。年降水量不足 40 毫米。塔里木盆地有塔里木河，孕育了丝绸之路南道的于阗、龟兹等古国。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=taklimakan%20desert%20china%20dunes&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [78, 40], [82, 40], [85, 39], [87, 38], [86, 36], [82, 36], [78, 38], [78, 40],
    ],
  },
  {
    id: 'gobi',
    type: 'desert',
    name: '戈壁沙漠',
    labelPos: [105, 43],
    importance: 2,
    description: '戈壁沙漠位于蒙古和中国内蒙古、甘肃、新疆交界处，面积约 130 万平方公里，是世界第五大沙漠。"戈壁"蒙古语意为"沙漠"。年降水量不足 200 毫米。与塔克拉玛干的纯沙漠不同，戈壁以砾石、岩石为主。丝绸之路北道穿越戈壁，曾是游牧民族（匈奴、突厥、蒙古）的发源地。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=gobi%20desert%20mongolia%20steppe&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [95, 46], [100, 45], [105, 43], [112, 42], [115, 41], [110, 40], [100, 42], [95, 46],
    ],
  },
  {
    id: 'arabian',
    type: 'desert',
    name: '阿拉伯沙漠',
    labelPos: [45, 23],
    importance: 2,
    description: '阿拉伯沙漠位于阿拉伯半岛，面积约 233 万平方公里，是世界第四大沙漠。横跨沙特、阿联酋、阿曼、也门等国。鲁卜哈里沙漠（"空白之地"）是世界上最大的连续沙体之一。蕴藏丰富的石油资源，是中东文明的地理基础。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=arabian%20desert%20sand%20dunes&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [38, 30], [42, 28], [48, 25], [55, 22], [58, 20], [55, 15], [48, 17], [42, 22], [38, 28], [38, 30],
    ],
  },
  {
    id: 'australian',
    type: 'desert',
    name: '澳大利亚沙漠',
    labelPos: [135, -25],
    importance: 1,
    description: '澳大利亚沙漠（Great Victoria、Sandy、Simpson、Gibson、Great Sandy 等）面积约 155 万平方公里，占澳大利亚大陆的 18%。辛普森沙漠的红沙丘（Simpsons Gap）和乌鲁鲁巨石（艾尔斯岩）是著名地标。原住民在沙漠中生活了 6 万年以上。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=uluru%20ayers%20rock%20australia&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [125, -22], [130, -22], [135, -25], [140, -27], [142, -30], [138, -32], [130, -30], [125, -26], [125, -22],
    ],
  },
  {
    id: 'kalahari',
    type: 'desert',
    name: '卡拉哈迪沙漠',
    labelPos: [22, -22],
    importance: 1,
    description: '卡拉哈迪沙漠位于非洲南部博茨瓦纳、纳米比亚、南非境内，面积约 93 万平方公里。并非纯沙漠，而是沙地、灌木和稀树草原。是布须曼人（San）世代居住地。野生动物丰富，有狮、豹、猎豹、长颈鹿等。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=kalahari%20desert%20africa%20sunset&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [18, -20], [22, -22], [26, -23], [28, -25], [25, -28], [20, -27], [17, -25], [18, -20],
    ],
  },
]

// ============= 平原 =============
export const PLAINS: GeoFeature[] = [
  {
    id: 'ganges-plain',
    type: 'plain',
    name: '恒河平原',
    labelPos: [82, 26],
    importance: 3,
    description: '恒河平原是世界上最大、人口最稠密的冲积平原之一，面积约 70 万平方公里，由恒河和布拉马普特拉河冲积而成。海拔仅 10-200 米，土壤肥沃。孕育了古印度文明（吠陀文明、孔雀王朝、莫卧儿王朝），现在居住着 8 亿人口。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=ganges%20plain%20india%20farmland&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [78, 28], [82, 28], [86, 27], [90, 26], [92, 24], [88, 23], [82, 24], [78, 26], [78, 28],
    ],
  },
  {
    id: 'mesopotamia-plain',
    type: 'plain',
    name: '美索不达米亚平原',
    labelPos: [44, 33],
    importance: 3,
    description: '美索不达米亚平原（"两河之间"）位于今伊拉克境内，由底格里斯河和幼发拉底河冲积而成，面积约 12 万平方公里。是古巴比伦文明、苏美尔文明、亚述文明的发源地，被誉为"文明的摇篮"。这里诞生了楔形文字、汉谟拉比法典、空中花园、60 进制等。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=mesopotamia%20iraq%20fertile%20crescent&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [40, 36], [44, 36], [48, 34], [48, 32], [44, 31], [40, 32], [38, 34], [40, 36],
    ],
  },
  {
    id: 'nile-delta',
    type: 'plain',
    name: '尼罗河三角洲',
    labelPos: [31, 30],
    importance: 2,
    description: '尼罗河三角洲位于埃及北部，面积约 2.4 万平方公里，是世界上最大的三角洲之一。土壤极其肥沃，是古埃及文明的心脏。公元前 4-3 千纪的法老时代，这里密布村庄、城镇、神庙、金字塔。亚历山大港是古希腊文明的重要中心。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=nile%20delta%20egypt%20satellite&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [29, 31], [31, 30.5], [33, 31], [32, 31.5], [30, 31.8], [29, 31],
    ],
  },
  {
    id: 'north-china-plain',
    type: 'plain',
    name: '华北平原',
    labelPos: [115, 36],
    importance: 2,
    description: '华北平原（黄淮海平原）是中国第二大平原，面积约 31 万平方公里，由黄河、淮河、海河冲积而成。是中华文明的核心区域 —— 仰韶文化、龙山文化、夏商周王朝的核心地带。今天有北京、天津、石家庄、郑州、济南等大城市。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=north%20china%20plain%20wheat&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [113, 38], [117, 38], [120, 36], [118, 33], [114, 33], [112, 36], [113, 38],
    ],
  },
  {
    id: 'yangtze-plain',
    type: 'plain',
    name: '长江中下游平原',
    labelPos: [115, 30],
    importance: 2,
    description: '长江中下游平原面积约 16 万平方公里，由长江及其支流冲积而成，包括江汉平原、洞庭湖平原、鄱阳湖平原、长江三角洲。是"鱼米之乡"，中国古代农业最发达的区域之一。今天有武汉、长沙、南昌、南京、上海等大城市。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=yangtze%20river%20delta%20rice&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [112, 32], [118, 32], [122, 31], [121, 28], [115, 28], [112, 30], [112, 32],
    ],
  },
]

// ============= 半岛 =============
export const PENINSULAS: GeoFeature[] = [
  {
    id: 'arabian-peninsula',
    type: 'peninsula',
    name: '阿拉伯半岛',
    labelPos: [47, 23],
    importance: 3,
    description: '阿拉伯半岛是世界上最大的半岛，面积约 300 万平方公里。包括沙特阿拉伯、也门、阿曼、阿联酋、卡塔尔、巴林、科威特等 7 国。是伊斯兰教的发源地，麦加（穆罕默德诞生地）、麦地那（先知之城）每年吸引数百万穆斯林朝觐。蕴藏世界 25% 的石油资源。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=arabian%20peninsula%20desert&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [35, 28], [38, 30], [45, 28], [52, 25], [58, 22], [60, 17], [55, 12], [50, 14], [45, 18], [42, 22], [38, 25], [35, 28],
    ],
  },
  {
    id: 'indochina',
    type: 'peninsula',
    name: '中南半岛',
    labelPos: [105, 17],
    importance: 2,
    description: '中南半岛（印度支那半岛）是亚洲东南部的半岛，面积约 235 万平方公里。包括越南、老挝、柬埔寨、泰国、缅甸 5 国。湄公河、湄南河、伊洛瓦底江流经半岛。孕育了高棉文明（吴哥窟）、占婆文明、蒲甘王朝等。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=indochina%20vietnam%20rice%20paddy&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [95, 22], [100, 22], [105, 20], [108, 15], [110, 10], [107, 5], [102, 6], [97, 12], [95, 18], [95, 22],
    ],
  },
  {
    id: 'india-peninsula',
    type: 'peninsula',
    name: '印度半岛',
    labelPos: [78, 18],
    importance: 2,
    description: '印度半岛是亚洲南部三角形半岛，南北长 1600 公里，伸入印度洋 1600 公里。北部为德干高原，南部为西高止山、东高止山。孕育了印度河流域文明（哈拉帕）、恒河文明、达罗毗荼文化。今天印度、孟加拉国大部分在半岛上。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=south%20india%20temple&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [72, 22], [78, 23], [83, 22], [87, 18], [86, 10], [82, 8], [78, 12], [74, 18], [72, 22],
    ],
  },
  {
    id: 'iberia',
    type: 'peninsula',
    name: '伊比利亚半岛',
    labelPos: [-4, 40],
    importance: 2,
    description: '伊比利亚半岛位于欧洲西南部，面积约 58.4 万平方公里。包括西班牙、葡萄牙、安道尔、直布罗陀。是古罗马帝国最重要的行省之一，也是阿拉伯人统治 800 年留下最深刻印记的欧洲地区（摩尔式建筑、阿尔罕布拉宫）。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=iberia%20spain%20andalusia&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-9, 43], [-3, 43], [3, 42], [3, 38], [0, 36], [-5, 36], [-9, 38], [-9, 43],
    ],
  },
  {
    id: 'italian-peninsula',
    type: 'peninsula',
    name: '意大利半岛',
    labelPos: [12, 42],
    importance: 2,
    description: '意大利半岛（亚平宁半岛）位于南欧，长约 1100 公里，呈靴状伸入地中海。包括意大利的大部分国土。是古罗马文明的核心 —— 罗马、佛罗伦萨、威尼斯、那不勒斯、西西里岛都见证了西方文明的兴衰。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=italy%20coast%20amalfi&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [8, 44], [12, 44], [15, 42], [18, 40], [18, 38], [15, 38], [10, 40], [8, 44],
    ],
  },
  {
    id: 'scandinavian',
    type: 'peninsula',
    name: '斯堪的纳维亚半岛',
    labelPos: [15, 65],
    importance: 1,
    description: '斯堪的纳维亚半岛位于欧洲西北部，面积约 75 万平方公里，包括挪威、瑞典和芬兰北部。西临挪威海、东临波罗的海。是维京人的故乡，留下了峡湾、北极光、极夜等独特景观。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=norway%20fjord%20scandinavia&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [5, 60], [12, 65], [18, 68], [25, 70], [30, 67], [28, 60], [22, 56], [15, 58], [10, 58], [5, 60],
    ],
  },
]

// ============= 海峡 =============
export const STRAITS: GeoFeature[] = [
  {
    id: 'gibraltar',
    type: 'strait',
    name: '直布罗陀海峡',
    labelPos: [-5, 36],
    importance: 3,
    description: '直布罗陀海峡位于欧洲伊比利亚半岛和非洲摩洛哥之间，最窄处仅 14 公里。是地中海与大西洋的唯一通道，连接欧洲、非洲、美洲的海上交通要冲。每天通过约 300 艘商船。1704 年英国占领直布罗陀至今，是大英帝国最重要的海外领地之一。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=gibraltar%20strait%20rock%20spain%20morocco&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-6, 36], [-5, 36], [-5.5, 35.7], [-6, 35.8], [-6, 36],
    ],
  },
  {
    id: 'malacca',
    type: 'strait',
    name: '马六甲海峡',
    labelPos: [102, 3],
    importance: 3,
    description: '马六甲海峡位于马来半岛和苏门答腊岛之间，长约 800 公里，最窄处 37 公里。是连接太平洋和印度洋的咽喉，每年通过 10 万艘商船，世界约 30% 的海运贸易、50% 的原油运输经过此海峡。新加坡海峡是世界上最繁忙的航道之一。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=malacca%20strait%20ship&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [100, 5], [103, 5], [104, 2], [102, 1], [100, 2], [100, 5],
    ],
  },
  {
    id: 'bosporus',
    type: 'strait',
    name: '博斯普鲁斯海峡',
    labelPos: [29, 41],
    importance: 2,
    description: '博斯普鲁斯海峡位于土耳其，长约 30 公里，最窄处仅 730 米。是连接黑海和马尔马拉海（通过达达尼尔海峡再到地中海）的唯一通道。两岸是伊斯坦布尔（横跨欧亚）的欧洲区和亚洲区。拜占庭帝国和奥斯曼帝国都以此为天然屏障。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=bosporus%20istanbul%20turkey&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [28.5, 41], [29.5, 41], [29.5, 41.5], [28.5, 41.5], [28.5, 41],
    ],
  },
  {
    id: 'hormuz',
    type: 'strait',
    name: '霍尔木兹海峡',
    labelPos: [56, 26],
    importance: 3,
    description: '霍尔木兹海峡位于阿曼和伊朗之间，宽约 39 公里，最窄处仅 33 公里。是波斯湾的唯一出口，世界 20% 的石油贸易通过此海峡（约 1700 万桶/天）。被誉为"世界石油运输的咽喉"。任何冲突都会立即影响全球油价。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=strait%20of%20hormuz&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [55, 26], [57, 26.5], [57, 27], [55, 27], [55, 26],
    ],
  },
]

// ============= 瀑布 =============
export const WATERFALLS: GeoFeature[] = [
  {
    id: 'angel',
    type: 'waterfall',
    name: '安赫尔瀑布',
    labelPos: [-62, 6],
    importance: 2,
    description: '安赫尔瀑布（天使瀑布）位于委内瑞拉卡奈马国家公园，落差 979 米，是世界上落差最大的瀑布（比尼亚加拉瀑布高 15 倍）。从奥扬特普伊平顶山顶直泻而下，瀑布在落下前会蒸发形成雾气。1937 年美国飞行员吉米·安赫尔寻找金矿时发现。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=angel%20falls%20venezuela%20waterfall&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-62, 6], [-62, 6.5], [-62.5, 6.5], [-62.5, 6], [-62, 6],
    ],
  },
  {
    id: 'niagara',
    type: 'waterfall',
    name: '尼亚加拉瀑布',
    labelPos: [-79, 43],
    importance: 2,
    description: '尼亚加拉瀑布位于美国和加拿大交界处，瀑布高 51 米，宽 1200 米（其中美国境内 300 米、加拿大境内 790 米）。年平均流量 2400 立方米/秒，是北美最壮观的瀑布。由伊利湖流入安大略湖的尼亚加拉河形成。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=niagara%20falls%20canada%20rainbow&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-79, 43], [-79.5, 43], [-79.5, 43.2], [-79, 43.2], [-79, 43],
    ],
  },
  {
    id: 'iguazu',
    type: 'waterfall',
    name: '伊瓜苏瀑布',
    labelPos: [-54, -26],
    importance: 2,
    description: '伊瓜苏瀑布位于阿根廷和巴西交界处，是世界上最宽的瀑布之一，宽约 2700 米（由 270 多股大小瀑布组成），最高落差 82 米。1984 年被联合国教科文组织列入世界遗产。瀑布呈半圆形，瀑布中央是"魔鬼咽喉"（Garganta del Diablo）。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=iguazu%20falls%20argentina&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-54, -26], [-55, -26], [-55, -25.7], [-54, -25.7], [-54, -26],
    ],
  },
]

// ============= 区域 =============
export const REGIONS: GeoFeature[] = [
  {
    id: 'mesopotamia',
    type: 'region',
    name: '美索不达米亚',
    labelPos: [44, 34],
    importance: 3,
    description: '美索不达米亚（"两河之间"）位于底格里斯河和幼发拉底河之间，是已知的最早人类文明发源地之一。约公元前 4000 年出现苏美尔文明，发明了楔形文字、60 进制、轮子。先后经历苏美尔、阿卡德、巴比伦、亚述、新巴比伦、波斯、希腊、阿拉伯等帝国统治。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=ziggurat%20ur%20mesopotamia&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [38, 36], [42, 37], [46, 36], [48, 33], [46, 31], [42, 31], [38, 33], [38, 36],
    ],
  },
  {
    id: 'mesoamerica',
    type: 'region',
    name: '中美洲',
    labelPos: [-95, 16],
    importance: 1,
    description: '中美洲是墨西哥南部到巴拿马地峡之间的狭长陆地。孕育了奥尔梅克文明（约公元前 1500 年）、玛雅文明（古典期 250-900 年）、阿兹特克文明（1325-1521 年）。玛雅人的金字塔（奇琴伊察）、历法、文字至今仍是世界谜题。',
    imageUrl: 'https://tse1.mm.bing.net/th?q=chichen%20itza%20mayan%20pyramid&w=800&h=450&c=7&p=0',
    imageCredit: 'Bing 图片搜索',
    geometry: [
      [-100, 22], [-90, 18], [-85, 14], [-90, 12], [-98, 16], [-100, 22],
    ],
  },
]

// ============= 全部地理要素 =============
export const ALL_GEO_FEATURES = {
  continents: CONTINENTS,
  seas: SEAS,
  lakes: LAKES,
  rivers: RIVERS,
  mountains: MOUNTAINS,
  deserts: DESERTS,
  plains: PLAINS,
  peninsulas: PENINSULAS,
  straits: STRAITS,
  waterfalls: WATERFALLS,
  regions: REGIONS,
}

// 样式映射
export const GEO_FEATURE_STYLES: Record<GeoFeatureType, {
  color: string
  fontSize: number
  fontStyle: 'normal' | 'italic'
  fontWeight: 'normal' | 'bold'
  visible: boolean
}> = {
  continent:  { color: '#4a4232', fontSize: 13, fontStyle: 'normal',   fontWeight: 'bold',   visible: true  },
  sea:        { color: '#5a8aa6', fontSize: 11, fontStyle: 'italic',   fontWeight: 'normal', visible: true  },
  lake:       { color: '#6a9ab6', fontSize: 10, fontStyle: 'italic',   fontWeight: 'normal', visible: true  },
  river:      { color: '#5a8aa6', fontSize: 9,  fontStyle: 'italic',   fontWeight: 'normal', visible: true  },
  mountain:   { color: '#8a6a4a', fontSize: 9,  fontStyle: 'normal',   fontWeight: 'bold',   visible: true  },
  desert:     { color: '#c8a85b', fontSize: 9,  fontStyle: 'italic',   fontWeight: 'normal', visible: true  },
  region:     { color: '#6a5a4a', fontSize: 9,  fontStyle: 'normal',   fontWeight: 'normal', visible: true  },
  plain:      { color: '#9bc89a', fontSize: 9,  fontStyle: 'normal',   fontWeight: 'normal', visible: true  },
  peninsula:  { color: '#b88a6a', fontSize: 9,  fontStyle: 'normal',   fontWeight: 'bold',   visible: true  },
  strait:     { color: '#8a9aba', fontSize: 9,  fontStyle: 'italic',   fontWeight: 'normal', visible: true  },
  waterfall:  { color: '#6abab6', fontSize: 9,  fontStyle: 'normal',   fontWeight: 'bold',   visible: true  },
}
