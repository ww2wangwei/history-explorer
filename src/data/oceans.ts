/**
 * 五大洋文字标签数据
 * 单独的 Marker 渲染（不画 polygon，只显示文字）
 */

export interface OceanLabel {
  id: string
  name: string
  position: [number, number]  // [经度, 纬度]
  importance: 1 | 2 | 3
}

export const OCEAN_LABELS: OceanLabel[] = [
  { id: 'pacific',  name: '太平洋', position: [-150, 10], importance: 3 },
  { id: 'atlantic', name: '大西洋', position: [-30, 15],  importance: 3 },
  { id: 'indian',   name: '印度洋', position: [80, -25],  importance: 3 },
  { id: 'arctic',   name: '北冰洋', position: [0, 80],    importance: 2 },
  { id: 'southern', name: '南冰洋', position: [0, -70],   importance: 2 },
]