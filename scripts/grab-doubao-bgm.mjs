/**
 * scripts/grab-doubao-bgm.mjs
 *
 * 启动一个 Chromium（Playwright），打开 doubao music-sharing 页面，
 * 等页面把 mp3/opus/m4a 通过 XHR/媒体加载出来，截获其 URL 并下载到 public/poems/bg.mp3
 *
 * 用法：
 *   node scripts/grab-doubao-bgm.mjs <shareUrl> [outputFilename]
 *
 * 例：
 *   node scripts/grab-doubao-bgm.mjs \
 *     "https://www.doubao.com/music-sharing?vid=v0d292g10006d9m8q3i7dld8g6cus9u0&share_id=51440267959835906&task_id=0&source_type=web" \
 *     bg.mp3
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const shareUrl = process.argv[2]
const outputName = process.argv[3] || 'bg.mp3'

if (!shareUrl) {
  console.error('Usage: node scripts/grab-doubao-bgm.mjs <shareUrl> [outputFilename]')
  process.exit(1)
}

const outDir = path.resolve('public/poems/audio')
fs.mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, outputName)

const SIZE_THRESHOLD = 100_000 // 100KB — 拒掉音乐封面 / 静音预览

;(async () => {
  console.log(`启动 Chromium，加载 ${shareUrl.slice(0, 80)}...`)
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36' })
  const page = await ctx.newPage()

  let audioUrl = null
  let audioMime = null
  let audioSize = 0
  let videoTitle = null

  page.on('request', req => {
    const url = req.url()
    const type = req.resourceType()
    if (type === 'media' || /\.(mp3|m4a|wav|ogg|opus|aac|flac)(\?|$)/i.test(url)) {
      console.log(`  捕获 ${type} URL: ${url.slice(0, 110)}`)
      audioUrl = url
      audioMime = req.headers()['content-type'] || 'audio/mpeg'
    }
  })

  page.on('response', async (resp) => {
    try {
      const req = resp.request()
      const headers = resp.headers()
      const u = req.url()
      const isAudio = /\.(mp3|m4a|wav|ogg|opus|aac|flac)(\?|$)/i.test(u)
        || /^audio\//i.test(headers['content-type'] || '')
      if (isAudio && !audioUrl) {
        audioUrl = u
        audioMime = headers['content-type'] || 'audio/mpeg'
        const cl = parseInt(headers['content-length'] || '0', 10)
        if (cl) audioSize = cl
      }
    } catch {}
  })

  // 提取 <title>
  page.on('domcontentloaded', async () => {
    try {
      videoTitle = await page.title()
      console.log(`  page title: ${videoTitle}`)
    } catch {}
  })

  try {
    await page.goto(shareUrl, { waitUntil: 'domcontentloaded', timeout: 25_000 })
  } catch (e) {
    console.warn('goto 异常 (可能仍加载出部分):', e.message)
  }

  // 等播放器发起 media 请求
  const deadline = Date.now() + 25_000
  while (!audioUrl && Date.now() < deadline) {
    await page.waitForTimeout(500)
  }

  if (!audioUrl) {
    // 看看页面里有没有 <audio> 元素 / video src
    const candidates = await page.evaluate(() => {
      const arr = []
      document.querySelectorAll('audio').forEach(a => {
        if (a.src) arr.push({ kind: 'audio.src', url: a.src })
        a.querySelectorAll('source').forEach(s => arr.push({ kind: 'source', url: s.src }))
      })
      document.querySelectorAll('video').forEach(v => {
        if (v.src) arr.push({ kind: 'video.src', url: v.src })
      })
      // blob urls
      return arr
    })
    console.log('  页面内嵌 media 元素:', JSON.stringify(candidates).slice(0, 200))
    if (candidates.length) audioUrl = candidates[0].url
  }

  if (!audioUrl) {
    console.error('❌ 未能捕获任何音频 URL。可能是页面结构已变 / 鉴权拦截。')
    await browser.close()
    process.exit(2)
  }

  // 体验 - 直接通过 page context 下载（继承 cookie / 鉴权头）
  const pageEval = await page.evaluate(async (u) => {
    const r = await fetch(u)
    if (!r.ok) return { error: `status ${r.status}` }
    const buf = await r.arrayBuffer()
    let bin = ''
    const u8 = new Uint8Array(buf)
    for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i])
    return { b64: btoa(bin), contentType: r.headers.get('content-type') || '' }
  }, audioUrl).catch(e => ({ error: String(e) }))

  if (pageEval?.error) {
    console.error('下载失败：', pageEval.error)
    await browser.close()
    process.exit(3)
  }

  const buf = Buffer.from(pageEval.b64, 'base64')
  console.log(`  ✓ 抓到 ${buf.length.toLocaleString()} 字节 (${pageEval.contentType})`)
  if (buf.length < SIZE_THRESHOLD) {
    console.error(`  ⚠ 文件小于 ${SIZE_THRESHOLD} 字节 — 可能不是完整音频。继续保存。`)
  }
  fs.writeFileSync(outPath, buf)
  console.log(`  ✓ 已保存: ${outPath}`)

  // 提取页面元数据
  try {
    const meta = await page.evaluate(() => ({
      title: document.title,
      artist: document.querySelector('meta[property="og:title"]')?.content || '',
      cover: document.querySelector('meta[property="og:image"]')?.content || '',
      desc: document.querySelector('meta[property="og:description"]')?.content || '',
    }))
    console.log('  meta:', JSON.stringify(meta).slice(0, 200))
    fs.writeFileSync(outPath.replace(/\.mp3$/, '.meta.json'),
      JSON.stringify({ ...meta, audioUrl, mime: pageEval.contentType, size: buf.length }, null, 2))
  } catch (e) {
    console.warn('  meta 提取失败:', e.message)
  }

  await browser.close()
  console.log('  完成。')
})().catch(e => { console.error('FATAL', e); process.exit(1) })
