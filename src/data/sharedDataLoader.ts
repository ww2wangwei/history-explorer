/**
 * sharedDataLoader — 核心数据懒加载器（eras + people + events）
 *
 * 🎯 性能优化：这些 JSON 之前被 AmapTest/Dashboard/useLearningPathStore 等
 *   核心组件静态 import，导致 eras.json(348KB) + people.json(58KB) +
 *   events.json(156KB) 总计 ~560KB 全进主 bundle。
 *
 *   现在改为顶层 dynamic import + 模块级缓存：
 *   - 数据未到位时返回空数组（调用方需处理）
 *   - 模块加载时立即启动 import（不阻塞）
 *   - 加载完后所有调用方共享同一份数据
 *   - 加载完后通过订阅机制通知所有组件重新渲染
 */
import { useEffect, useState } from 'react'
import type { Era, HistoricalEvent, HistoricalFigure } from '@/types'

export interface CoreData {
  eras: Era[]
  people: HistoricalFigure[]
  events: HistoricalEvent[]
}

const EMPTY: CoreData = { eras: [], people: [], events: [] }

let _data: CoreData = EMPTY
let _loadingPromise: Promise<void> | null = null

// 🎯 订阅者列表 — 数据加载完后通知所有 React 组件重新渲染
type Listener = () => void
const _listeners = new Set<Listener>()
function notifyAll() {
  _listeners.forEach(fn => fn())
}

export function ensureCoreData(): Promise<void> {
  if (_data !== EMPTY) return Promise.resolve()
  if (!_loadingPromise) {
    _loadingPromise = Promise.all([
      import('@/data/eras.json'),
      import('@/data/people.json'),
      import('@/data/events.json'),
    ]).then(([e, p, ev]) => {
      _data = {
        eras: e.default as Era[],
        people: p.default as HistoricalFigure[],
        events: ev.default as HistoricalEvent[],
      }
      notifyAll()
    })
  }
  return _loadingPromise
}

// 模块加载即触发（不阻塞）
ensureCoreData()

/** React hook：数据是否加载完成 */
export function useCoreDataReady(): boolean {
  const [, force] = useState(0)
  useEffect(() => {
    if (_data !== EMPTY) return
    const fn = () => force(x => x + 1)
    _listeners.add(fn)
    return () => { _listeners.delete(fn) }
  }, [])
  return _data !== EMPTY
}

/** 同步 getter — 数据未到位时返回空数组（调用方应配合 useCoreDataReady 显示 loading） */
export function getEras(): Era[] { return _data.eras }
export function getPeople(): HistoricalFigure[] { return _data.people }
export function getEvents(): HistoricalEvent[] { return _data.events }

/** 模块级变量直接访问（仅在 useCoreDataReady=true 后才安全使用） */
export const eras = /* @__PURE__ */ getEras()
export const people = /* @__PURE__ */ getPeople()
export const events = /* @__PURE__ */ getEvents()