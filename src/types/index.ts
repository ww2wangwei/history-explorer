/**
 * 全局类型定义
 */

// 历史事件
export interface HistoricalEvent {
  id: string;
  year: number;                       // 公元年（公元前用负数，如 -221 表示公元前 221 年）
  endYear?: number;                   // 持续事件结束年份
  title: string;
  category: EventCategory;
  region: string;                     // 'china' | 'rome' | 'arab' | ...
  coordinates?: [number, number];     // [经度, 纬度]，地图标点
  description: string;
  importance: 1 | 2 | 3;              // 用于时间轴视觉权重
  relatedEraId?: string;              // 关联的朝代/文明
  relatedEventIds?: string[];        // 因果/时间关联事件（跨朝代故事线）
  /** 战争专用：背景（开战前的政治/经济/军事形势） */
  warBackground?: string;
  /** 战争专用：结果（胜负/签约/将领命运） */
  warResult?: string;
  /** 战争专用：对后世的影响（格局变化/文明转折/制度演进） */
  warImpact?: string;
  /** 战争专用：发生地点/国家 */
  country?: string;
}

// 历史人物
export type FigureCategory =
  | 'politician'  // 政治家（皇帝、丞相、总统等）
  | 'military'    // 军事家（将军、征服者）
  | 'thinker'     // 思想家（哲学家、儒释道诸子）
  | 'literati'    // 文人/文学艺术家（诗人、画家、音乐家）
  | 'scientist'   // 科学家/发明家/医学家
  | 'reformer'    // 改革家/变法者
  | 'explorer'    // 探险家/航海家
  | 'religious'   // 宗教人物（教主、圣徒）

export interface HistoricalFigure {
  id: string;
  name: string;
  eraIds: string[];                   // 所属朝代 id 列表
  role: string;                       // 角色/头衔
  category: FigureCategory;           // 人物分类（用于筛选）
  birthYear?: number;                 // 出生年
  deathYear?: number;                 // 卒年
  emoji?: string;                     // 头像 emoji（用于关系图谱节点）
  description: string;                // 简介
  personaPrompt?: string;             // AI 角色扮演 system prompt
  relatedFigureIds?: Array<{ id: string; type: 'rival' | 'mentor' | 'successor' | 'contemporary' | 'family' }>; // 人物关系
  /** 代表作品（思想家/文学家/宗教人物用） */
  culturalWorks?: string[];
}

// 事件分类
export type EventCategory =
  | '政治'   // 政治事件
  | '经济'   // 经济事件
  | '文化'   // 文化事件
  | '军事'   // 军事事件
  | '科技'   // 科技事件
  | '思想'   // 思想/宗教
  | '外交'   // 外交事件
  | 'military';  // 兼容历史数据中的英文军事分类

// 朝代/文明
export interface Era {
  id: string;
  name: string;
  region: EraRegion;
  startYear: number;
  endYear: number;
  color: string;                     // 地图上色块 (HEX)
  capital?: [number, number];         // [经度, 纬度]
  geoFile?: string;                  // 中国朝代对应的 GeoJSON 文件
  description: string;
  shortDesc?: string;                // 一句话简介
  /** 快速学习：3-5 个核心要点（每个一句话，覆盖政治/经济/文化/对外） */
  keyPoints?: string[]
  /** 快速学习：关键事件列表（按时间顺序），每件 = { year, title, desc } */
  quickEvents?: { year: number; title: string; desc: string; longDesc?: string }[]
  /** 快速学习：历史意义/对后世的影响（一段话） */
  legacy?: string
  /** 与前后朝代的连接（被...推翻 / 起源于... / 转型为...） */
  succession?: { predecessor?: string; successor?: string; note?: string }
}

// 朝代/文明区域
export type EraRegion = 'china' | 'rome' | 'arab' | 'persia' | 'mongol' | 'britain' | 'other';

// 时间范围常量
export const TIME_RANGE = {
  MIN_YEAR: -3000,    // 公元前 3000
  MAX_YEAR: 2025,
  DEFAULT_YEAR: 1500, // 默认定位到中后期
} as const;

// 世界地图年份取样间隔（每 10 年一个数据点）
export const WORLD_GEO_YEAR_STEP = 10;

// 历史事件分类颜色映射
export const CATEGORY_COLORS: Record<EventCategory, string> = {
  '政治': '#c8553d',
  '经济': '#d4a14a',
  '文化': '#7b9e89',
  '军事': '#8b3a3a',
  '科技': '#5b8aa6',
  '思想': '#9b7eb6',
  '外交': '#a87a3e',
  'military': '#8b3a3a',
};