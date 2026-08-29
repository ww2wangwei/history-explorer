/**
 * territory-files — 疆域变迁卡片元数据
 *
 * 从 GeographyOverview.tsx 拆出来，供 TerritoryDetailModal + GeographyOverview 共享。
 * 维持原有顺序/字段，避免行为差异。
 */
export interface TerritoryFile {
  id: string
  /** GeoJSON 文件名（与 id 不一定一致。例如 id='han-west' 但 GeoJSON 文件叫 'han.geojson'） */
  geoFile?: string
  region: 'china' | 'world'
  label: string
  /** 鼎盛期（用于卡片标题显示） */
  peakYear?: number
  /** 卡片显示的简短描述 */
  shortDesc?: string
  /** 疆域主色（高对比，避免 era.color 太暗看不见） */
  fallbackColor?: string
}

export const TERRITORY_FILES: TerritoryFile[] = [
  // 中国朝代（按时间顺序）— 全部用 GeoJSON 渲染（见 public/geo/china/*.geojson）
  // 没有专门 geojson 的朝代用 geoFile 指向最接近的现有文件
  { id: 'spring-autumn', region: 'china', geoFile: 'qin',   label: '中国', peakYear: -500, shortDesc: '春秋战国：百家争鸣，礼崩乐坏',         fallbackColor: '#a07030' },
  { id: 'qin',          region: 'china', label: '中国', peakYear: -210, shortDesc: '首次大一统：统一文字、度量衡、车轨',            fallbackColor: '#d4a44a' },
  { id: 'han-west',     region: 'china', geoFile: 'han',   label: '中国', peakYear: 1, shortDesc: '北击匈奴、通西域，丝绸之路开通',          fallbackColor: '#c69a5b' },
  { id: 'han-east',     region: 'china', geoFile: 'han',   label: '中国', peakYear: 120, shortDesc: '东汉：光武中兴，班超通西域',                fallbackColor: '#b88a4b' },
  { id: 'three-kingdoms', region: 'china', geoFile: 'han', label: '中国', peakYear: 250, shortDesc: '三国鼎立：魏蜀吴争霸',                          fallbackColor: '#a67a3b' },
  { id: 'jin-west',     region: 'china', geoFile: 'han',   label: '中国', peakYear: 290, shortDesc: '西晋：短暂统一，八王之乱',                  fallbackColor: '#9b6a2b' },
  { id: 'southern-northern', region: 'china', geoFile: 'tang', label: '中国', peakYear: 500, shortDesc: '南北朝：南北对峙，文化交融',                fallbackColor: '#8a5a1b' },
  { id: 'sui',          region: 'china', geoFile: 'tang',  label: '中国', peakYear: 600, shortDesc: '隋朝：结束分裂，开皇之治，大运河',           fallbackColor: '#d47020' },
  { id: 'tang',         region: 'china', label: '中国', peakYear: 710,  shortDesc: '东亚文化中心版图达极盛',                       fallbackColor: '#e07a3a' },
  { id: 'five-dynasties', region: 'china', geoFile: 'tang', label: '中国', peakYear: 940, shortDesc: '五代十国：分裂割据',                            fallbackColor: '#c66020' },
  { id: 'song-north',   region: 'china', geoFile: 'song',  label: '中国', peakYear: 1080, shortDesc: '北方收缩，但经济文化达到巅峰',         fallbackColor: '#7e8ec1' },
  { id: 'song-south',   region: 'china', geoFile: 'song',  label: '中国', peakYear: 1200, shortDesc: '南宋：偏安江南，经济重心南移',                fallbackColor: '#6e7eb1' },
  { id: 'yuan',         region: 'china', geoFile: 'yuan',  label: '中国', peakYear: 1280, shortDesc: '蒙古大帝国下的中国，行省制',                  fallbackColor: '#a04a8a' },
  { id: 'ming',         region: 'china', label: '中国', peakYear: 1420, shortDesc: '永乐迁都北京，七下西洋',                       fallbackColor: '#c8584a' },
  { id: 'qing',         region: 'china', label: '中国', peakYear: 1780, shortDesc: '极盛期版图北抵西伯利亚、南括中印半岛',         fallbackColor: '#3e9a76' },
  // 世界帝国（见 public/geo/world/eras/*.geojson）
  { id: 'achaemenid',   region: 'world', geoFile: 'persia-safavid', label: '世界', peakYear: -500, shortDesc: '波斯阿契美尼德帝国：从爱琴海到印度河',  fallbackColor: '#9a4a3a' },
  { id: 'macedonia-empire', region: 'world', geoFile: 'rome-empire', label: '世界', peakYear: -325, shortDesc: '亚历山大大帝帝国：希腊至印度',                fallbackColor: '#8a5a2a' },
  { id: 'rome-republic',region: 'world', label: '世界', peakYear: -50,  shortDesc: '罗马共和国击败迦太基，地中海西部霸主',          fallbackColor: '#a8473e' },
  { id: 'rome-empire',  region: 'world', label: '世界', peakYear: 117,  shortDesc: '图拉真鼎盛期：版图含达契亚、亚美尼亚',         fallbackColor: '#a8473e' },
  { id: 'byzantine',    region: 'world', label: '世界', peakYear: 555,  shortDesc: '查士丁尼复兴：收复意大利、北非西部',            fallbackColor: '#5d3a8a' },
  { id: 'arab-caliphate', region: 'world', label: '世界', peakYear: 850, shortDesc: '阿拔斯王朝：横跨伊比利亚至中亚',                fallbackColor: '#2c8a4a' },
  { id: 'mongol-empire',region: 'world', label: '世界', peakYear: 1290, shortDesc: '人类史上最大陆上帝国',                            fallbackColor: '#5a3a2a' },
  { id: 'ottoman',      region: 'world', label: '世界', peakYear: 1580, shortDesc: '横跨欧亚非三洲，苏莱曼大帝',                  fallbackColor: '#3a8a5a' },
  { id: 'persia-safavid', region: 'world', label: '世界', peakYear: 1620, shortDesc: '波斯黄金时代，萨法维中兴',                       fallbackColor: '#8a3a3a' },
  { id: 'mughal',       region: 'world', geoFile: 'arab-caliphate', label: '世界', peakYear: 1700, shortDesc: '莫卧儿帝国：印度次大陆',                          fallbackColor: '#a87a3a' },
  { id: 'british-empire', region: 'world', label: '世界', peakYear: 1900, shortDesc: '号称"日不落"，全球海洋霸主（示意边界）',            fallbackColor: '#b04838' },
]