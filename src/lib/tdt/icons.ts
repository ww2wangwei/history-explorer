/**
 * 天地图 marker 用 SVG 图钉（data URL 形式）
 *
 * 为什么用字符串拼接 + encodeURIComponent 而不是固定 dataURL？
 *   - 朝代都城需要按 era.color 染色，必须运行时插值
 *   - data:image/svg+xml;base64,... 不支持内插变量
 *
 * 这里我们导出「未编码的 SVG 字符串」，调用方自行 encodeURIComponent 后拼上 data:image/svg+xml;utf8, 前缀。
 */

/** 中国朝代都城 — 22×30 金色图钉 */
export const PIN_SVG_CHINA_CAPITAL = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 22 30">
  <path d="M 11 28 L 6 16 L 16 16 Z" fill="#c89a5b" stroke="#0f0e0c" stroke-width="1"/>
  <circle cx="11" cy="9" r="9" fill="#c89a5b" stroke="#fdf8f0" stroke-width="1.5"/>
  <circle cx="11" cy="9" r="3" fill="#fdf8f0"/>
</svg>`

/** 世界朝代都城 — 18×24 可染色图钉（color 来自 era.color） */
export function PIN_SVG_WORLD_CAPITAL(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
  <path d="M 9 22 L 5 13 L 13 13 Z" fill="${color}" stroke="#0f0e0c" stroke-width="1"/>
  <circle cx="9" cy="7" r="7" fill="${color}" stroke="#fdf8f0" stroke-width="1"/>
  <circle cx="9" cy="7" r="2" fill="#fdf8f0"/>
</svg>`
}

/** 事件点 — 12×12 红色实心圆 */
export const DOT_SVG_EVENT = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
  <circle cx="6" cy="6" r="5" fill="#dc2626" stroke="#fdf8f0" stroke-width="1.5"/>
</svg>`

/** 给 SVG 字符串编码成 T.Icon 的 iconUrl */
export function svgToIconUrl(svg: string): string {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

/** T.Icon iconSize / iconAnchor 三元组（[width, height, anchorX, anchorY]） */
export const ICON_SIZE = {
  CHINA_CAPITAL: [22, 30, 11, 28] as const,
  WORLD_CAPITAL: [18, 24, 9, 22] as const,
  EVENT_DOT: [12, 12, 6, 6] as const,
}
