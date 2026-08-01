/**
 * scripts/fetch-territory-maps.mjs
 *
 * 完整下载剩余 7 个朝代/帝国的 Wikimedia Commons 地图。
 * 每个目标以搜索词找到最佳 PNG，并通过 Content-Type 自动决定扩展名。
 *
 * 用法：node scripts/fetch-territory-maps.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
const UA = 'HistoryExplorer/1.0 (educational)'

const WIDTH = 1200  // thumb width

const TARGETS = [
  // 北宋 — 真版本
  { key: 'song',     query: 'Northern Song dynasty 1100 map',      dir: 'public/geo/china',         prefer: 'song' },
  { key: 'yuan',     query: 'Yuan dynasty Mongol China map',      dir: 'public/geo/china',         prefer: 'yuan' },
  // 世界帝国
  { key: 'arab-caliphate', query: 'Abbasid Caliphate 750 map',     dir: 'public/geo/world',         prefer: 'arab-caliphate' },
  { key: 'persia-safavid', query: 'Safavid Empire 1600 map',      dir: 'public/geo/world',         prefer: 'persia-safavid' },
  { key: 'ottoman',  query: 'Ottoman Empire 1683 maximum map',     dir: 'public/geo/world',         prefer: 'ottoman' },
  { key: 'british-empire', query: 'British Empire 1920 map',     dir: 'public/geo/world',         prefer: 'british-empire' },
  { key: 'rome-republic', query: 'Roman Republic 50 BC map',       dir: 'public/geo/world',         prefer: 'rome-republic' },
]

async function fetchJson(url) {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } })
    if (r.status === 429) { await sleep(8000 * (i + 1)); continue }
    if (!r.ok) return null
    return r.json()
  }
  return null
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function searchFirst(q) {
  const u = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
    action: 'query', format: 'json', generator: 'search', gsrnamespace: '6',
    gsrsearch: q, gsrlimit: '3',
  })}`
  const d = await fetchJson(u)
  const pages = Object.values(d?.query?.pages ?? {})
  // Prefer SVG thumbnails (smaller)
  const svgPages = pages.filter(p => /\.svg$/i.test(p.title))
  if (svgPages.length) return svgPages[0].title
  return pages[0]?.title || null
}

async function thumburl(title) {
  const u = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
    action: 'query', format: 'json', titles: title,
    prop: 'imageinfo', iiprop: 'url', iiurlwidth: String(WIDTH),
  })}`
  const d = await fetchJson(u)
  const pages = Object.values(d?.query?.pages ?? {})
  const info = pages[0]?.imageinfo?.[0]
  // 优先用 thumburl（被 rasterize 的是 PNG），否则 url
  return { url: info?.thumburl || info?.url, mime: info?.mime, height: info?.thumbheight }
}

async function main() {
  console.log('=== 抓取剩余 7 张地图 ===\n')
  for (const t of TARGETS) {
    const out = path.join(t.dir, `${t.prefer}.png`)
    if (fs.existsSync(out) && fs.statSync(out).size > 5000) {
      console.log(`⏭ ${t.key} 已有 ${path.basename(out)} (${(fs.statSync(out).size/1024).toFixed(1)}KB), 跳过`)
      continue
    }
    process.stdout.write(`搜索 "${t.query}" ... `)
    const title = await searchFirst(t.query)
    if (!title) { console.log('找不到'); continue }
    await sleep(1500) // polite
    process.stdout.write(`→ ${title} ... `)
    let { url, mime } = await thumburl(title)
    if (!url) { console.log('无法拿 url'); continue }
    // content-type 决定扩展名（多数 thumb 是 image/png + .png 后缀）
    const ext = /\.png$/i.test(url) || mime === 'image/png' ? '.png'
              : /\.svg$/i.test(url) || mime === 'image/svg+xml' ? '.svg'
              : '.png'
    const r = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!r.ok) { console.log(`HTTP ${r.status}`); continue }
    const buf = Buffer.from(await r.arrayBuffer())
    const target = path.join(t.dir, `${t.prefer}${ext}`)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, buf)
    console.log(`OK (${(buf.length/1024).toFixed(1)}KB, mime=${mime})`)
    await sleep(2500)  // polite delay
  }
  console.log('\n=== done ===')
}
main().catch(e => { console.error(e); process.exit(1) })
