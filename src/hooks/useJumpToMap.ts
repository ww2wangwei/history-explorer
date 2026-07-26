/**
 * useJumpToMap — 统一从详情/列表跳转到地图并定位
 *
 * 四件事:
 *   1. setMapFocus({center, zoom, label}) → WorldMap 自动 pan/zoom 到坐标
 *   2. setViewMode('map')                 → 切到地图视图
 *   3. selectEra(null) / selectEvent(null) → 关闭右侧详情面板,让 WorldMap 居中
 *   4. setJumpSuppressUntil(now + 1200)   → 抑制 currentYear effect 的 setCenter 抢飞
 *      （窗口期 1200ms 内 TMapTest 的 currentYear effect 跳过飞行，避免与中心动画竞态）
 *   5. （可选）setPendingReopen({kind, ...}）→ 浮层 ← 按钮可回到原弹窗
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

/** 抑制窗口长度（毫秒）— 经验值：centerAndZoom 飞行约 800ms + 200ms 余量 */
const SUPPRESS_WINDOW_MS = 1200

/**
 * 从 jumpToMap extras 派生 reopen kind 和 payload。
 *
 * 之前这里有**两段**独立的 if/else 链（kind 推导 + payload 构造），
 * 新增 reopen 路径时必须**两处同步改**，极易漏改（Cultures 板块就漏过）。
 * 现在统一成一个函数，一改全改。
 */
function resolveReopen(extras: {
  reopenLabel?: string
  eraId?: string
  eventYear?: number
  eventId?: string
  cultureEventId?: string
  featureId?: string
  territoryId?: string
  territoryRegion?: 'china' | 'world'
  warId?: string
  mwKey?: string
  nodeIndex?: number
}): { kind: string; payload: ReopenPayload } | null {
  const { reopenLabel, eraId, eventYear, eventId, cultureEventId, featureId, territoryId, territoryRegion, warId, mwKey, nodeIndex } = extras

  if (eraId && eventYear !== undefined && reopenLabel !== undefined) {
    return { kind: 'quickEvent', payload: { kind: 'quickEvent', eraId, event: { year: eventYear, title: reopenLabel, desc: '' } } }
  }
  if (eventId) {
    return { kind: 'event', payload: { kind: 'event', eventId } }
  }
  if (cultureEventId) {
    return { kind: 'cultureEvent', payload: { kind: 'cultureEvent', cultureEventId } }
  }
  if (featureId) {
    return { kind: 'geoFeature', payload: { kind: 'geoFeature', featureId } }
  }
  if (territoryId && territoryRegion) {
    return { kind: 'territory', payload: { kind: 'territory', territoryId, region: territoryRegion } }
  }
  if (warId) {
    return { kind: 'war', payload: { kind: 'war', warId } }
  }
  if (mwKey && nodeIndex !== undefined) {
    return { kind: 'majorWarNode', payload: { kind: 'majorWarNode', mwKey, nodeIndex } }
  }
  if (mwKey) {
    return { kind: 'majorWar', payload: { kind: 'majorWar', mwKey } }
  }
  return null
}

export function useJumpToMap() {
  const setMapFocus = useHistoryStore(s => s.setMapFocus)
  const setViewMode = useHistoryStore(s => s.setViewMode)
  const selectEra = useHistoryStore(s => s.selectEra)
  const selectEvent = useHistoryStore(s => s.selectEvent)
  const setPendingReopen = useHistoryStore(s => s.setPendingReopen)
  const setJumpSuppressUntil = useHistoryStore(s => s.setJumpSuppressUntil)

  return useCallback(
    (
      center: [number, number],
      label: string,
      zoom = 3,
      extras?: {
        coverImageUrl?: string
        snippet?: string
        reopenLabel?: string
        eraId?: string
        eventYear?: number
        eventId?: string
        cultureEventId?: string
        featureId?: string
        territoryId?: string
        territoryRegion?: 'china' | 'world'
        warId?: string
        mwKey?: string
        nodeIndex?: number
      },
    ) => {
      // 统一派生 kind + payload（替代之前的两段 if/else 链）
      const reopen = extras ? resolveReopen(extras) : null
      const kind = reopen?.kind

      // 先开抑制窗口（必须在 setMapFocus 之前，否则 currentYear effect 可能在中间跑一次）
      setJumpSuppressUntil(Date.now() + SUPPRESS_WINDOW_MS)

      setMapFocus({ center, zoom, label, ...extras, kind } as any)
      setViewMode('map')
      selectEra(null)
      selectEvent(null)

      // 主动通知 Layout：进入地图视图，关掉所有 Overview active flag
      window.dispatchEvent(new CustomEvent('history:enter-map'))

      // 写入 pendingReopen（供浮层 ← Back 按钮恢复弹窗）
      if (reopen) setPendingReopen(reopen.payload)
    },
    [setMapFocus, setViewMode, selectEra, selectEvent, setPendingReopen, setJumpSuppressUntil],
  )
}
