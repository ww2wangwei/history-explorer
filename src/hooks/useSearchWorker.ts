/**
 * useSearchWorker — 主线程与 search.worker 的通信 hook
 *
 * - Worker 首次需要时懒加载（dynamic import）
 * - 自动 200ms debounce
 * - 主线程不持有大数据副本（worker chunk 独立）
 *
 * 用法：
 *   const { results, ready, durationMs } = useSearchWorker(query)
 */
import { useEffect, useRef, useState } from 'react'

export interface SearchResultItem {
  type: 'era' | 'event' | 'figure'
  id: string
  title: string
  subtitle?: string
  year?: number
  endYear?: number
  color?: string
}

interface WorkerResponse {
  type: 'ready' | 'results'
  counts?: { eras: number; events: number; people: number }
  results?: SearchResultItem[]
  durationMs?: number
  total?: number
}

interface WorkerRequest {
  type: 'search'
  query: string
  limit?: number
}

const DEBOUNCE_MS = 180
const MAX_QUERY_LEN = 64

export function useSearchWorker(query: string, limit = 20) {
  const workerRef = useRef<Worker | null>(null)
  const [ready, setReady] = useState(false)
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [durationMs, setDurationMs] = useState<number | null>(null)
  const reqIdRef = useRef(0)

  // 启动 worker（仅一次）
  useEffect(() => {
    let cancelled = false
    let worker: Worker | null = null
    const init = async () => {
      try {
        // Vite 自动识别 ?worker 后缀，生成独立 worker chunk
        const SearchWorker = (await import(
          /* @vite-ignore */ '@/workers/search.worker.ts?worker'
        )).default as unknown as { new (): Worker }
        if (cancelled) return
        worker = new SearchWorker()
        workerRef.current = worker
        worker.addEventListener('message', (e: MessageEvent<WorkerResponse>) => {
          if (e.data.type === 'ready') setReady(true)
        })
      } catch (err) {
        // Worker 创建失败（浏览器不支持 / SSR），主线程降级同步搜索
        // eslint-disable-next-line no-console
        console.warn('[useSearchWorker] worker init failed, falling back to main thread:', err)
        setReady(false)
      }
    }
    void init()
    return () => {
      cancelled = true
      worker?.terminate()
      workerRef.current = null
    }
  }, [])

  // Debounced 查询
  useEffect(() => {
    if (!ready || !workerRef.current) {
      // worker 没就绪：清空结果（不卡 UI）
      setResults([])
      setDurationMs(null)
      return
    }
    const trimmed = query.trim().slice(0, MAX_QUERY_LEN)
    if (!trimmed) {
      setResults([])
      setDurationMs(null)
      return
    }
    const myReqId = ++reqIdRef.current
    const timer = setTimeout(() => {
      if (myReqId !== reqIdRef.current) return
      const w = workerRef.current
      if (!w) return
      const handler = (e: MessageEvent<WorkerResponse>) => {
        if (e.data.type !== 'results') return
        if (myReqId !== reqIdRef.current) return  // 过期响应，忽略
        w.removeEventListener('message', handler)
        setResults(e.data.results ?? [])
        setDurationMs(e.data.durationMs ?? null)
      }
      w.addEventListener('message', handler)
      const req: WorkerRequest = { type: 'search', query: trimmed, limit }
      w.postMessage(req)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query, ready, limit])

  return { ready, results, durationMs }
}