/**
 * 主要地理要素数据
 * 用于在地图上叠加显示：海洋、山脉、河流、大洲标签
 *
 * 所有坐标都是 [经度, 纬度]
 */

export type GeoFeatureType = 'continent' | 'sea' | 'mountain' | 'river' | 'desert' | 'region'

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
}

// ============= 大洲 =============
// 主要大洲的简化轮廓（用作背景参考）
export const CONTINENTS: GeoFeature[] = [
  {
    id: 'asia-continent',
    type: 'continent',
    name: '亚洲',
    labelPos: [80, 45],
    importance: 1,
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
    geometry: [
      [113, -22], [120, -18], [130, -12], [140, -10], [148, -18],
      [153, -25], [150, -34], [142, -38], [130, -34], [120, -32], [113, -22],
    ],
  },
]

// ============= 海洋/海湾/水域 =============
export const SEAS: GeoFeature[] = [
  // 海湾和内海
  {
    id: 'mediterranean',
    type: 'sea',
    name: '地中海',
    labelPos: [15, 35],
    importance: 3,
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
    geometry: [
      [28, 42], [32, 46], [40, 46], [42, 44], [40, 42], [32, 41], [28, 42],
    ],
  },
  {
    id: 'caspian-sea',
    type: 'sea',
    name: '里海',
    labelPos: [51, 40],
    importance: 1,
    geometry: [
      [47, 45], [54, 45], [54, 36], [48, 36], [47, 45],
    ],
  },
]

// ============= 主要河流 =============
// 河流用折线表示路径
export const RIVERS: GeoFeature[] = [
  {
    id: 'nile',
    type: 'river',
    name: '尼罗河',
    labelPos: [31, 22],
    importance: 3,
    geometry: [
      [31, 31], [31, 28], [32, 25], [33, 22], [32, 19],
      [30, 16], [31, 12], [32, 8], [31, 5], [30, 2],
    ],
  },
  {
    id: 'tigris-euphrates',
    type: 'river',
    name: '两河流域',
    labelPos: [44, 33],
    importance: 3,
    geometry: [
      [40, 38], [42, 36], [44, 34], [46, 32], [47, 30],
      [48, 28], [49, 30], [50, 31],
    ],
  },
  {
    id: 'indus',
    type: 'river',
    name: '印度河',
    labelPos: [70, 27],
    importance: 2,
    geometry: [
      [73, 33], [70, 30], [68, 27], [67, 24], [66, 21], [66, 18],
    ],
  },
  {
    id: 'ganges',
    type: 'river',
    name: '恒河',
    labelPos: [84, 27],
    importance: 2,
    geometry: [
      [80, 30], [83, 28], [86, 26], [88, 25], [89, 22],
    ],
  },
  {
    id: 'yellow-river',
    type: 'river',
    name: '黄河',
    labelPos: [103, 35],
    importance: 3,
    geometry: [
      [98, 38], [102, 36], [106, 35], [110, 34], [114, 35], [118, 36],
    ],
  },
  {
    id: 'yangtze',
    type: 'river',
    name: '长江',
    labelPos: [110, 30],
    importance: 3,
    geometry: [
      [92, 32], [98, 31], [105, 30], [112, 30], [118, 31], [122, 32],
    ],
  },
  {
    id: 'rhine',
    type: 'river',
    name: '莱茵河',
    labelPos: [7, 50],
    importance: 1,
    geometry: [
      [9, 47], [8, 49], [7, 50], [6, 51], [5, 52],
    ],
  },
  {
    id: 'danube',
    type: 'river',
    name: '多瑙河',
    labelPos: [17, 47],
    importance: 1,
    geometry: [
      [8, 48], [12, 48], [17, 47], [22, 46], [27, 45], [30, 45],
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
    geometry: [
      [75, 35], [78, 33], [82, 31], [85, 30], [88, 29], [92, 28], [95, 27],
    ],
  },
  {
    id: 'alps',
    type: 'mountain',
    name: '阿尔卑斯山',
    labelPos: [10, 47],
    importance: 2,
    geometry: [
      [5, 46], [8, 47], [10, 47], [12, 47], [15, 46], [17, 45],
    ],
  },
  {
    id: 'andes',
    type: 'mountain',
    name: '安第斯山脉',
    labelPos: [-70, -25],
    importance: 2,
    geometry: [
      [-78, 10], [-75, 0], [-72, -10], [-70, -20], [-68, -30], [-67, -40], [-70, -50],
    ],
  },
  {
    id: 'rockies',
    type: 'mountain',
    name: '落基山脉',
    labelPos: [-115, 45],
    importance: 1,
    geometry: [
      [-125, 60], [-120, 55], [-115, 45], [-110, 38], [-105, 32],
    ],
  },
  {
    id: 'ural',
    type: 'mountain',
    name: '乌拉尔山',
    labelPos: [60, 60],
    importance: 1,
    geometry: [
      [55, 67], [58, 64], [60, 60], [62, 56], [60, 53],
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
    importance: 2,
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
    geometry: [
      [-100, 22], [-90, 18], [-85, 14], [-90, 12], [-98, 16], [-100, 22],
    ],
  },
]

// ============= 全部地理要素 =============
export const ALL_GEO_FEATURES = {
  continents: CONTINENTS,
  seas: SEAS,
  rivers: RIVERS,
  mountains: MOUNTAINS,
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
  continent: { color: '#4a4232', fontSize: 13, fontStyle: 'normal',   fontWeight: 'bold',   visible: true  },
  sea:       { color: '#5a8aa6', fontSize: 11, fontStyle: 'italic',   fontWeight: 'normal', visible: true  },
  river:     { color: '#5a8aa6', fontSize: 9,  fontStyle: 'italic',   fontWeight: 'normal', visible: true  },
  mountain:  { color: '#8a6a4a', fontSize: 9,  fontStyle: 'normal',   fontWeight: 'bold',   visible: true  },
  region:    { color: '#6a5a4a', fontSize: 9,  fontStyle: 'normal',   fontWeight: 'normal', visible: true  },
  desert:    { color: '#8a7a5a', fontSize: 9,  fontStyle: 'italic',   fontWeight: 'normal', visible: true  },
}