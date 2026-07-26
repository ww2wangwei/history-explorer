/**
 * useJumpToMap — 统一从详情/列表跳转到地图并定位
 *
 * 三件事:
 *   1. setMapFocus({center, zoom, label}) → WorldMap 自动 pan/zoom 到坐标
 *   2. setViewMode('map')                 → 切到地图视图
 *   3. selectEra(null) / selectEvent(null) → 关闭右侧详情面板,让 WorldMap 居中
 *   4. （可选）setPendingReopen({kind, ...}）→ 浮层 ← 按钮可回到原弹窗
 *
 * 用法:
 *   const jumpToMap = useJumpToMap()
 *   <button onClick={() => jumpToMap([lng, lat], '标签', 4, {
 *     coverImageUrl: '...',
 *     snippet: '...',
 *     reopenKind: 'majorWarNode',
 *     reopenMwKey: 'ww2',
 *     reopenNodeIndex: 3,
 *   })}>📍 定位地图</button>
 */
import { useCallback } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'

type ReopenPayload =
  | { kind: 'quickEvent'; eraId: string; event: { year: number; title: string; desc: string; longDesc?: string } }
  | { kind: 'event'; eventId: string }
  | { kind: 'cultureEvent'; cultureEventId: string }
  | { kind: 'geoFeature'; featureId: string }
  | { kind: 'territory'; territoryId: string; region: 'china' | 'world' }
  | { kind: 'war'; warId: string }
  | { kind: 'majorWar'; mwKey: string }
  | { kind: 'majorWarNode'; mwKey: string; nodeIndex: number }

export function useJumpToMap() {
  const setMapFocus = useHistoryStore(s => s.setMapFocus)
  const setViewMode = useHistoryStore(s => s.setViewMode)
  const selectEra = useHistoryStore(s => s.selectEra)
  const selectEvent = useHistoryStore(s => s.selectEvent)
  const setPendingReopen = useHistoryStore(s => s.setPendingReopen)

  return useCallback(
    (
      center: [number, number],
      label: string,
      zoom = 3,
      extras?: {
        coverImageUrl?: string
        snippet?: string
        // reopen 链路：浮层 ← 按钮可回到原弹窗
        reopenLabel?: string
        // quickEvent
        eraId?: string
        eventYear?: number
        // event (单事件详情)
        eventId?: string
        // cultureEvent (文化板块)
        cultureEventId?: string
        // geoFeature / territory
        featureId?: string
        territoryId?: string
        territoryRegion?: 'china' | 'world'
        // war / majorWar / majorWarNode
        warId?: string
        mwKey?: string
        nodeIndex?: number
      },
    ) => {
      // 推导 reopenKind（TMapTest 浮层 ← 按钮据此决定走哪个分支）
      let kind: string | undefined
      if (extras) {
        if (extras.warId) kind = 'war'
        else if (extras.mwKey && extras.nodeIndex !== undefined) kind = 'majorWarNode'
        else if (extras.mwKey) kind = 'majorWar'
        else if (extras.featureId) kind = 'geoFeature'
        else if (extras.territoryId) kind = 'territory'
        else if (extras.eraId && extras.eventYear !== undefined) kind = 'quickEvent'
        else if (extras.eventId) kind = 'event'
        else if (extras.cultureEventId) kind = 'cultureEvent'
      }

      setMapFocus({ center, zoom, label, ...extras, kind } as any)
      setViewMode('map')
      selectEra(null)
      selectEvent(null)

      // 主动通知 Layout：进入地图视图，关掉所有 Overview active flag
      // （Dashboard / WarsOverview / GeographyOverview 等都是覆盖主区域的全屏页，
      //  否则 TMapTest 不会挂载，InfoCard 浮层无 DOM 容器 → 看不见）
      window.dispatchEvent(new CustomEvent('history:enter-map'))

      // reopen：派生 payload，写入 pendingReopen
      if (extras) {
        if (extras.eraId && extras.eventYear !== undefined && extras.reopenLabel !== undefined) {
          const payload: ReopenPayload = {
            kind: 'quickEvent',
            eraId: extras.eraId,
            event: { year: extras.eventYear, title: extras.reopenLabel, desc: extras.snippet ?? '' },
          }
          setPendingReopen(payload)
        } else if (extras.eventId) {
          setPendingReopen({ kind: 'event', eventId: extras.eventId })
        } else if (extras.cultureEventId) {
          setPendingReopen({ kind: 'cultureEvent', cultureEventId: extras.cultureEventId })
        } else if (extras.featureId) {
          setPendingReopen({ kind: 'geoFeature', featureId: extras.featureId })
        } else if (extras.territoryId && extras.territoryRegion) {
          setPendingReopen({ kind: 'territory', territoryId: extras.territoryId, region: extras.territoryRegion })
        } else if (extras.warId) {
          setPendingReopen({ kind: 'war', warId: extras.warId })
        } else if (extras.mwKey && extras.nodeIndex !== undefined) {
          setPendingReopen({ kind: 'majorWarNode', mwKey: extras.mwKey, nodeIndex: extras.nodeIndex })
        } else if (extras.mwKey) {
          setPendingReopen({ kind: 'majorWar', mwKey: extras.mwKey })
        }
      }
    },
    [setMapFocus, setViewMode, selectEra, selectEvent, setPendingReopen],
  )
}