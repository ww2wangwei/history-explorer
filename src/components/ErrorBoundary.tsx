/**
 * ErrorBoundary — 错误边界
 *
 * 作用：捕获子组件树中的 JS 错误（render / lifecycle / constructor），
 *   显示 fallback UI 而不是让整个 App 白屏。
 *
 * 注意：React Error Boundary 必须是 class 组件（不能用 hooks 实现）。
 *
 * 用法：
 *   <ErrorBoundary fallback={<CustomError />}>
 *     <App />
 *   </ErrorBoundary>
 *
 *   或用默认 fallback：
 *   <ErrorBoundary><App /></ErrorBoundary>
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { audioEngine } from '@/utils/audioEngine'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  /** 错误回调（可上报到 Sentry 等） */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 播放错误音效（用户感知）
    try {
      audioEngine.playWrong?.()
    } catch {
      // 忽略音频失败
    }
    // 控制台始终打印（开发者调试用）
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, errorInfo)
    // 上报回调
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <div className="w-full h-full flex items-center justify-center bg-ink-900 text-parchment-50 p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-brush tracking-wide text-vermilion-300 mb-3">
            出了点小问题
          </h1>
          <p className="text-sm text-ink-300 mb-6 leading-relaxed">
            页面遇到了一个意外错误。已自动捕获，不会丢失你的学习进度。
          </p>
          {this.state.error && (
            <details className="mb-6 text-left bg-ink-800/60 rounded-lg p-3 border border-ink-700">
              <summary className="text-xs text-ink-400 cursor-pointer hover:text-ink-200">
                查看错误详情
              </summary>
              <pre className="mt-2 text-xs text-vermilion-200/80 overflow-x-auto whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-lg bg-vermilion-500/30 hover:bg-vermilion-500/50 border border-vermilion-500/40 text-vermilion-200 text-sm transition-colors"
            >
              重试
            </button>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg bg-ink-800/80 hover:bg-ink-700 border border-ink-600 text-ink-200 text-sm transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      </div>
    )
  }
}