/**
 * aiStream.ts — 统一 AI 流式请求（Anthropic / OpenAI 兼容 / Minimax / DeepSeek）
 *
 * 设计要点：
 *  1. 单文件承担 URL/header/body/解析两种协议;出现第三提供商再拆 aiProtocol/*。
 *  2. AIRequestHandle 捆绑 promise + signal + abort()，调用方可 await 也可显式取消。
 *  3. 汇合 controller：外部 signal + 可选 timeoutMs(默认 60s) + 公开 abort()；
 *     finally 一次清 timer 并解绑监听，避免重复清理。
 *  4. 解析用 TextDecoder({stream:true})，跨 chunk 缓冲；兼容 CRLF、多 data: 行、注释行。
 *  5. 损坏 JSON 抛协议错误（错误信息不含 API key / body）。
 *  6. fetchImpl 仅作 mock/未来测试扩展点；不开放 body/header override。
 */

export type AIProtocol = 'anthropic' | 'openai'
export type AIRole = 'system' | 'user' | 'assistant'

export interface AIMessage {
  role: AIRole
  content: string
}

export interface AIRequestOptions {
  protocol: AIProtocol
  apiKey: string
  baseUrl: string
  model: string
  messages: AIMessage[]
  /** max_tokens 输出上限 */
  maxTokens: number
  /** 总超时（覆盖整个 fetch 与读取周期）；默认 60_000 */
  timeoutMs?: number
  /** 外部 AbortSignal，与 timeout 汇合 */
  signal?: AbortSignal
  /** mock/未来测试扩展点；不开放 body/header override */
  fetchImpl?: typeof fetch
}

export interface AIStreamOptions extends AIRequestOptions {
  onDelta(delta: string): void
}

export interface AIRequestHandle<T> {
  promise: Promise<T>
  signal: AbortSignal
  abort(reason?: unknown): void
}

/** 默认总超时（毫秒）；调用方可覆盖 */
const DEFAULT_TIMEOUT_MS = 60_000

/* ---------------- 协议 builder（私有） ---------------- */

function stripSlash(s: string): string { return s.replace(/\/$/, '') }
function stripV1(s: string): string { return s.replace(/\/v1$/, '') }

interface BuiltRequest {
  url: string
  headers: Record<string, string>
  body: string
}

function buildAnthropic(opts: AIRequestOptions): BuiltRequest {
  const baseClean = stripV1(stripSlash(opts.baseUrl))
  const sysMsg = opts.messages.find(m => m.role === 'system')
  const convMsgs = opts.messages.filter(m => m.role !== 'system')
  return {
    url: `${baseClean}/v1/messages`,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': opts.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens,
      system: sysMsg?.content ?? '',
      messages: convMsgs,
      stream: true,
    }),
  }
}

function buildOpenAI(opts: AIRequestOptions): BuiltRequest {
  const baseClean = stripV1(stripSlash(opts.baseUrl))
  return {
    url: `${baseClean}/v1/chat/completions`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens,
      messages: opts.messages,
      stream: true,
    }),
  }
}

function buildRequest(opts: AIRequestOptions): BuiltRequest {
  return opts.protocol === 'anthropic' ? buildAnthropic(opts) : buildOpenAI(opts)
}

/* ---------------- 汇合 controller（私有） ---------------- */

interface CombinedAbort {
  controller: AbortController
  dispose: () => void
}

function combineAbort(external: AbortSignal | undefined, timeoutMs: number, onTimeout: () => void): CombinedAbort {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | null = null
  const externalListener = () => controller.abort(external?.reason)

  if (external) {
    if (external.aborted) controller.abort(external.reason)
    else external.addEventListener('abort', externalListener)
  }
  timer = setTimeout(() => {
    onTimeout()
    controller.abort(new DOMException('AI request timed out', 'TimeoutError'))
  }, timeoutMs)

  return {
    controller,
    dispose: () => {
      if (timer) { clearTimeout(timer); timer = null }
      if (external) external.removeEventListener('abort', externalListener)
    },
  }
}

/* ---------------- 流式解析（公开，供测试 mock） ---------------- */

/**
 * 解析 Anthropic/OpenAI SSE 流。兼容 CRLF、多 data: 行、注释行、半包 JSON。
 * 错误信息不得含 API key / body（仅 status 与字段名）。
 */
export async function parseAIStream(
  stream: ReadableStream<Uint8Array>,
  protocol: AIProtocol,
  onDelta: (delta: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  const reader = stream.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: false })
  let buffer = ''
  let full = ''

  try {
    while (true) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      // 按 \n 切；保留最后一段到下次循环处理
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const raw of lines) {
        const line = raw.trimEnd()
        if (!line || line.startsWith(':')) continue   // 空行 / SSE 注释
        if (!line.startsWith('data:')) continue       // 非 data 行
        const data = line.slice(5).trim()
        if (data === '[DONE]') return full
        let json: any
        try { json = JSON.parse(data) } catch { continue }   // 半包或心跳,跳过
        if (protocol === 'anthropic') {
          if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
            const t = String(json.delta.text ?? '')
            if (t) { full += t; onDelta(t) }
          }
        } else {
          const d = json.choices?.[0]?.delta?.content
          if (typeof d === 'string' && d.length > 0) {
            full += d; onDelta(d)
          }
        }
      }
    }
    return full
  } finally {
    try { reader.releaseLock() } catch { /* noop */ }
  }
}

/* ---------------- 公开 API ---------------- */

/**
 * 流式调用 LLM，回调每次增量文本；返回 handle（promise + abort）。
 *
 * @example
 *   const handle = streamAI({ protocol:'anthropic', apiKey, baseUrl, model,
 *                             messages, maxTokens: 1024,
 *                             onDelta: (t) => updateMessage(...,t) })
 *   // 稍后取消：
 *   handle.abort()
 *   await handle.promise
 */
export function streamAI(options: AIStreamOptions): AIRequestHandle<string> {
  const ctrl = combineAbort(options.signal, options.timeoutMs ?? DEFAULT_TIMEOUT_MS, () => { /* timeout fires */ })
  const built = buildRequest(options)
  const fetchFn = options.fetchImpl ?? fetch

  const promise = (async (): Promise<string> => {
    let response: Response
    try {
      response = await fetchFn(built.url, {
        method: 'POST',
        headers: built.headers,
        body: built.body,
        signal: ctrl.controller.signal,
      })
    } catch (e) {
      // 透传 AbortError / TimeoutError；其它用通用错误包装（不含 body）
      if (e instanceof DOMException && (e.name === 'AbortError' || e.name === 'TimeoutError')) throw e
      throw new Error(`AI request failed: ${(e as Error).message || 'network error'}`)
    }
    if (!response.ok) {
      const statusText = response.statusText || 'request failed'
      // 不读取 body 避免泄露;仅记录前 200 字符的 prefix 作为可观测错误
      const prefix = await response.text().then(t => t.slice(0, 200)).catch(() => '')
      throw new Error(`AI ${response.status} ${statusText}${prefix ? `: ${prefix}` : ''}`)
    }
    if (!response.body) throw new Error('AI response has no body')

    return await parseAIStream(response.body, options.protocol, options.onDelta, ctrl.controller.signal)
  })()

  // 包装 promise：清理 timer + 监听
  const wrapped = (async (): Promise<string> => {
    try { return await promise }
    finally { ctrl.dispose() }
  })()

  return {
    promise: wrapped,
    signal: ctrl.controller.signal,
    abort: (reason?: unknown) => ctrl.controller.abort(reason),
  }
}

/**
 * 非流式：把完整 messages 提交，收集最终 output 文本。
 * 仅用于连通性测试；调用方应明确传 timeoutMs（默认 60s 仍适用但不推荐场景）。
 */
export function requestAI(options: AIRequestOptions): AIRequestHandle<string> {
  // 复用 streamAI，但用 onDelta 累积到 full
  let full = ''
  const handle = streamAI({
    ...options,
    onDelta: (t) => { full += t },
  })
  const wrapped = (async () => {
    try { await handle.promise } catch (e) { throw e }
    return full
  })()
  return { promise: wrapped, signal: handle.signal, abort: handle.abort }
}
