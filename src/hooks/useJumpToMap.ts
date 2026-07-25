/**
 * useJumpToMap — 统一从详情/列表跳转到地图并定位
 *
 * 三件事:
 *   1. setMapFocus({center, zoom, label}) → WorldMap 自动 pan/zoom 到坐标
 *   2. setViewMode('map')                 → 切到地图视图
 *   3. selectEra(null) / selectEvent(null) → 关闭右侧详情面板,让 WorldMap 居中
 *
 * 用法:
 *   const jumpToMap = useJumpToMap()
 *   <button onClick={() => jumpToMap([lng, lat], '标签', 4)}>📍 定位地图</button>
 */
import { useCallback } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'

export function useJumpToMap() {
  const setMapFocus = useHistoryStore(s => s.setMapFocus)
  const setViewMode = useHistoryStore(s => s.setViewMode)
  const selectEra = useHistoryStore(s => s.selectEra)
  const selectEvent = useHistoryStore(s => s.selectEvent)

  return useCallback(
    (center: [number, number], label: string, zoom = 4) => {
      // eslint-disable-next-line no-console
      console.debug('[useJumpToMap]', { center, label, zoom })
      setMapFocus({ center, zoom, label })
      setViewMode('map')
      selectEra(null)
      selectEvent(null)
    },
    [setMapFocus, setViewMode, selectEra, selectEvent],
  )
}