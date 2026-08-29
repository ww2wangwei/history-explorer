/**
 * EraCenters — 朝代/帝国近似中心坐标
 * 拆分到独立文件供 TerritoryDetailModal 与 GeographyOverview 共享。
 * 同时导出 PROVINCES_BY_ID / COUNTRIES_BY_ID，避免两份组件各自维护。
 */
import { TERRITORY_FILES, type TerritoryFile } from './territory-files'
import { getProvincesForTerritory, type Province } from './china-provinces'
import { getCountriesForEmpire } from './empire-countries'
import type { LabelPoint } from '@/components/Geography/TerritoryMapThumb'

/** 朝代/文明的近似中心坐标（用于疆域弹窗的缩略图） */
export const ERA_CENTERS: Record<string, [number, number]> = {
  'qin': [108.94, 34.34], 'han': [108.94, 34.34], 'tang': [108.94, 34.34],
  'song': [114.3, 30.6], 'yuan': [116.4, 39.9], 'ming': [116.4, 39.9], 'qing': [116.4, 39.9],
  'spring-autumn': [108.94, 34.34], 'han-east': [112, 34], 'three-kingdoms': [112, 32],
  'jin-west': [112, 33], 'southern-northern': [113, 33], 'sui': [113, 34],
  'five-dynasties': [114, 33], 'song-south': [120, 30],
  'rome-republic': [12.5, 41.9], 'rome-empire': [12.5, 41.9],
  'byzantine': [28.98, 41.01], 'arab-caliphate': [44.42, 32.54],
  'ottoman': [28.98, 41.01], 'mongol-empire': [106.92, 47.92],
  'persia-safavid': [51.42, 35.69], 'british-empire': [-0.13, 51.51],
  'achaemenid': [51.42, 35.69], 'macedonia-empire': [25, 38], 'mughal': [78, 27],
}

/** 模块级：每个朝代/帝国对应的省份/国家列表（一次计算，永不重算） */
export const PROVINCES_BY_ID: Record<string, Province[]> = {}
export const COUNTRIES_BY_ID: Record<string, LabelPoint[]> = {}
for (const f of TERRITORY_FILES) {
  PROVINCES_BY_ID[f.id] = f.region === 'china' ? getProvincesForTerritory(f.id) : []
  COUNTRIES_BY_ID[f.id] = f.region === 'world' ? getCountriesForEmpire(f.id) : []
}