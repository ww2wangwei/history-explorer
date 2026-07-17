/**
 * 天地图 JS API v4.0 动态加载
 *
 * 一次注入，多次复用。返回 Promise 在 window.T 就绪后 resolve。
 */
let loadingPromise: Promise<void> | null = null

export function loadTianditu(tk: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('window undefined'))
  const w = window as any
  if (w.T) return Promise.resolve()
  if (loadingPromise) return loadingPromise

  loadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${tk}`
    script.async = true
    script.onload = () => {
      if (w.T) resolve()
      else reject(new Error('T API loaded but window.T missing'))
    }
    script.onerror = () => {
      loadingPromise = null
      reject(new Error('Failed to load Tianditu JS API'))
    }
    document.head.appendChild(script)
  })

  return loadingPromise
}
