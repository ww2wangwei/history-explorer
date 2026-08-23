// 资源路径解析：处理 vite.config 中的 base 配置
// 例如 base='/history/' 时, '/world-history/W001.webp' → '/history/world-history/W001.webp'

const BASE = import.meta.env.BASE_URL || '/'

/**
 * 把数据中的绝对路径（/world-history/foo.webp）转成当前部署的完整路径。
 * - dev (base='/'): /world-history/foo.webp → /world-history/foo.webp
 * - prod (base='/history/'): /world-history/foo.webp → /history/world-history/foo.webp
 * - 已经是完整 URL (http/https/blob/data): 原样返回
 */
export function resolveAsset(path: string | undefined | null): string {
  if (!path) return ''
  if (/^(https?:|blob:|data:)/.test(path)) return path
  const stripped = path.startsWith('/') ? path.slice(1) : path
  // 去掉 BASE 末尾的斜杠（如果有）
  const base = BASE.endsWith('/') ? BASE : BASE + '/'
  return base + stripped
}