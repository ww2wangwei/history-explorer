/**
 * amap/loader.ts — 高德地图 JS API v2.0 (AMap) 动态加载
 *
 * URL: https://webapi.amap.com/maps?v=2.0&key=YOUR_KEY
 * 一次注入，多次复用。返回 Promise 在 window.AMap 就绪后 resolve。
 */
let loadingPromise: Promise<void> | null = null

export function loadAmap(key: string, securityJsCode?: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('window undefined'))
  const w = window as any
  if (w.AMap) return Promise.resolve()
  if (loadingPromise) return loadingPromise

  // 兜底安全密钥：与 window._AMapSecurityConfig 同时下发（新一代 key 必需要）
  if (securityJsCode) {
    w._AMapSecurityConfig = { securityJsCode }
  }

  loadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    // 带常用插件的 polyline/polygon/text/ControlBar/Geocoder，避免后续单独加载
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}&plugin=AMap.Polyline,AMap.Polygon,AMap.Text,AMap.Marker,AMap.ControlBar,AMap.Geocoder`
    script.async = true
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      const start = Date.now()
      const check = () => {
        if (w.AMap) {
          resolve()
          return
        }
        if (Date.now() - start > 8000) {
          // 诊断：key 无效 / 网络被劫持 / 安全密钥缺失 / 跨域 CSP 拦截 都会触发这个错误
          let diag = 'AMap script loaded but window.AMap missing.'
          if (key === 'your-amap-key' || key.includes('your-') || key.length < 10) {
            diag += ' 原因：Key 仍是占位符或太短 — 请在更多菜单 → 🔑 API Keys 中填写真实 Key。'
          } else {
            diag += ' 可能原因：① Key 无效；② Key 启用了「安全密钥」但未设置；③ 网络被拦截（控制台 Network 看 amap.com 是否 200）；④ CSP/广告拦截器屏蔽。'
          }
          reject(new Error(diag))
          return
        }
        setTimeout(check, 80)
      }
      check()
    }
    script.onerror = () => {
      loadingPromise = null
      reject(new Error('Failed to load AMap JS API（网络/CSP/广告拦截器问题）'))
    }
    document.head.appendChild(script)
  })

  return loadingPromise
}