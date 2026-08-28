/**
 * ApiKeysSettings — 用户填第三方 API key 的浮层
 *
 * 入口：
 *   1. Layout.tsx 头部"更多"菜单的"🔑 API Keys"
 *   2. AMap 相关组件出错时错误条上的"⚙ 设置 Key"
 *
 * key 写入 localStorage（useApiKeysStore），重启页面后仍然生效，
 * 填好后点保存会自动重载页面（让 AMap 用新 key）。
 */
import { useState } from 'react'
import { useApiKeysStore, getAmapKey, getOwmApiKey } from '@/store/useApiKeysStore'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ApiKeysSettings({ isOpen, onClose }: Props) {
  const storedAmapKey = useApiKeysStore(s => s.amapKey)
  const storedAmapCode = useApiKeysStore(s => s.amapSecurityCode)
  const storedOwmKey = useApiKeysStore(s => s.owmApiKey)
  const setAmapKey = useApiKeysStore(s => s.setAmapKey)
  const setAmapSecurityCode = useApiKeysStore(s => s.setAmapSecurityCode)
  const setOwmApiKey = useApiKeysStore(s => s.setOwmApiKey)
  const clearAmapKey = useApiKeysStore(s => s.clearAmapKey)

  const [amapKeyInput, setAmapKeyInput] = useState('')
  const [amapCodeInput, setAmapCodeInput] = useState('')
  const [owmKeyInput, setOwmKeyInput] = useState('')
  const [saved, setSaved] = useState(false)

  if (!isOpen) return null

  // 显示的是"用户已存值"——不是 fallback env
  const currentAmapKey = storedAmapKey ?? ''
  const currentAmapCode = storedAmapCode ?? ''
  const currentOwmKey = storedOwmKey ?? ''
  // 是否在用 fallback (.env 里读到的)
  const usingEnvFallback = !storedAmapKey && Boolean(getAmapKey())
  const usingOwmEnvFallback = !storedOwmKey && Boolean(getOwmApiKey())

  const save = () => {
    setAmapKey(amapKeyInput)
    setAmapSecurityCode(amapCodeInput)
    setOwmApiKey(owmKeyInput)
    setSaved(true)
    // 让 AMap 用新 key：reload 是最稳的方式（清掉已注入的 script）
    setTimeout(() => window.location.reload(), 400)
  }

  const clear = () => {
    clearAmapKey()
    setAmapKeyInput('')
    setAmapCodeInput('')
    setOwmKeyInput('')
    setSaved(true)
    setTimeout(() => window.location.reload(), 400)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="设置第三方 API Key"
    >
      <div
        className="w-full max-w-lg bg-ink-800 border border-ink-600 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-600 bg-ink-900/40">
          <h2 className="text-sm font-serif text-vermilion-300">🔑 第三方 API Key 设置</h2>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-700"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs text-ink-300">
          <p className="leading-relaxed">
            这些 key 保存在浏览器 localStorage（不会上传服务器），重启后仍然有效。
            不填的话程序会回退到 <code className="px-1 bg-ink-900 rounded">.env</code> 里配置的 key（如果有）。
          </p>

          {/* --- AMap 高德地图 --- */}
          <div className="space-y-2 border border-ink-600 rounded-lg p-3 bg-ink-900/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-parchment-50 font-serif">🗺 高德地图 (AMap) Key</div>
              <div className="text-[10px] text-ink-500">
                {currentAmapKey ? (
                  <span className="text-emerald-400">✓ 已设置（用户）</span>
                ) : usingEnvFallback ? (
                  <span className="text-amber-400">⚠ 来自 .env</span>
                ) : (
                  <span className="text-red-400">✗ 未配置</span>
                )}
              </div>
            </div>

            <div className="text-ink-400 leading-relaxed">
              在高德开放平台 (<a href="https://lbs.amap.com/" target="_blank" rel="noreferrer" className="text-vermilion-300 hover:underline">lbs.amap.com</a>)
              申请「Web 端 (JS API)」key，绑定域名 <code className="px-1 bg-ink-900 rounded">localhost</code>。
            </div>

            <label className="block">
              <span className="text-ink-400">Key</span>
              <input
                value={amapKeyInput}
                onChange={(e) => { setAmapKeyInput(e.target.value); setSaved(false) }}
                placeholder={currentAmapKey || '例如：a1b2c3d4e5f6...'}
                className="w-full mt-1 px-2 py-1.5 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50 font-mono"
              />
            </label>

            <label className="block">
              <span className="text-ink-400">安全密钥 (新一代 key 必填)</span>
              <input
                value={amapCodeInput}
                onChange={(e) => { setAmapCodeInput(e.target.value); setSaved(false) }}
                placeholder={currentAmapCode || '例如：ab12cd34...'}
                className="w-full mt-1 px-2 py-1.5 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50 font-mono"
              />
            </label>
          </div>

          {/* --- OWM 实时云图 --- */}
          <div className="space-y-2 border border-ink-600 rounded-lg p-3 bg-ink-900/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-parchment-50 font-serif">☁ 实时云图 (OpenWeatherMap) Key</div>
              <div className="text-[10px] text-ink-500">
                {currentOwmKey ? (
                  <span className="text-emerald-400">✓ 已设置（用户）</span>
                ) : usingOwmEnvFallback ? (
                  <span className="text-amber-400">⚠ 来自 .env</span>
                ) : (
                  <span className="text-red-400">✗ 未配置</span>
                )}
              </div>
            </div>

            <div className="text-ink-400 leading-relaxed">
              在 OpenWeatherMap (<a href="https://openweathermap.org/api" target="_blank" rel="noreferrer" className="text-vermilion-300 hover:underline">openweathermap.org/api</a>)
              申请免费 key（&quot;Current Weather Data&quot+或&quot;3 hour forecast&quot+均可）。
              免费层 60 次/分钟、100 万次/月。
            </div>

            <label className="block">
              <span className="text-ink-400">API Key</span>
              <input
                value={owmKeyInput}
                onChange={(e) => { setOwmKeyInput(e.target.value); setSaved(false) }}
                placeholder={currentOwmKey || '例如：a1b2c3d4e5f6g7h8i9...'}
                className="w-full mt-1 px-2 py-1.5 bg-ink-900 border border-ink-600 rounded-lg text-parchment-50 font-mono"
              />
            </label>
          </div>

          {/* --- 提示 --- */}
          <div className="text-[11px] text-ink-500 leading-relaxed border-t border-ink-700 pt-3">
            <strong className="text-ink-400">注意：</strong>填好后保存会自动刷新页面以加载新 key。
            如果在浏览器里访问 GitHub Pages 等公开域名，需要在高德后台把域名加白名单。
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-ink-600 bg-ink-900/40">
          <button
            onClick={clear}
            disabled={!storedAmapKey && !storedAmapCode && !storedOwmKey}
            className="text-xs text-red-400 hover:text-red-300 disabled:text-ink-400 disabled:cursor-not-allowed px-2 py-1.5"
          >
            清除已保存的 key
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-ink-300 hover:text-parchment-50 border border-ink-600 rounded-lg hover:bg-ink-700"
            >
              取消
            </button>
            <button
              onClick={save}
              disabled={!amapKeyInput.trim() && !amapCodeInput.trim()}
              className="px-3 py-1.5 text-xs bg-vermilion-500 hover:bg-vermilion-600 disabled:bg-ink-700 disabled:text-ink-500 text-parchment-50 rounded-lg font-serif"
            >
              {saved ? '✓ 已保存，刷新中…' : '保存并刷新'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}