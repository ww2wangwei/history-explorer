/**
 * reopenRoutes — 统一 reopen 路由映射表
 *
 * 所有"从地图浮层 ← Back 按钮返回到原窗口"的 kind → CustomEvent 映射集中在此。
 * 新增 reopen 路径只需在 REOPEN_EVENT_MAP 加一行，无需改 TMapTest / useJumpToMap 的 if/else 链。
 */

/** kind → window CustomEvent 名（Layout 内各 useEffect 监听） */
export type ReopenKind =
  | 'quickEvent'
  | 'event'
  | 'cultureEvent'
  | 'geoFeature'
  | 'territory'
  | 'war'
  | 'majorWar'
  | 'majorWarNode'

export const REOPEN_EVENT_MAP: Record<ReopenKind, string> = {
  quickEvent: 'history:go-dashboard',
  event: 'history:go-dashboard',
  cultureEvent: 'history:go-cultures',
  geoFeature: 'history:go-geography',
  territory: 'history:go-geography',
  war: 'history:go-wars',
  majorWar: 'history:go-wars',
  majorWarNode: 'history:go-wars',
}

/** 根据 kind 取对应 CustomEvent 名，无匹配时 fallback 到 dashboard */
export function getReopenEvent(kind: ReopenKind | undefined): string {
  if (kind && REOPEN_EVENT_MAP[kind]) return REOPEN_EVENT_MAP[kind]
  return 'history:go-dashboard'
}
