/**
 * Edge TTS 代理服务器
 *
 * 浏览器 → localhost:4370/speak?text=你好 → Node.js WebSocket → Edge TTS → MP3 流回浏览器
 * 解决浏览器端直接 WSS 连接被微软 CDN 403 的问题。
 *
 * 启动：node scripts/tts-proxy.mjs
 */
import http from 'node:http'
import { WebSocket } from 'ws'
import { createHash, randomUUID } from 'node:crypto'

const PORT = 4370
const BASE_URL = 'speech.platform.bing.com/consumer/speech/synthesize/readaloud'
const TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'
const VERSION = '1-143.0.3650.75'
const WIN_EPOCH = 11644473600
const S_TO_NS = 1e9

// ============= Sec-MS-GEC token 生成 =============
function generateSecMsGec() {
  let ticks = Date.now() / 1000
  ticks += WIN_EPOCH
  ticks = Math.floor(ticks / 300) * 300
  ticks *= S_TO_NS / 100
  return createHash('sha256').update(`${ticks.toFixed(0)}${TOKEN}`, 'ascii').digest('hex').toUpperCase()
}

// ============= Edge TTS WebSocket 连接 =============
function synthesize(text, voice, rate, pitch) {
  return new Promise((resolve, reject) => {
    const secMsGec = generateSecMsGec()
    const url = `wss://${BASE_URL}/edge/v1?TrustedClientToken=${TOKEN}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${VERSION}&ConnectionId=${randomUUID().replaceAll('-', '')}`

    const ws = new WebSocket(url, {
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
        'Sec-WebSocket-Version': '13',
      },
    })

    const chunks = []
    const timer = setTimeout(() => { ws.close(); reject(new Error('timeout')) }, 15000)

    ws.on('error', (err) => { clearTimeout(timer); reject(err) })
    ws.on('message', (rawData, isBinary) => {
      if (!isBinary) {
        const data = rawData.toString('utf8')
        if (data.includes('turn.end')) {
          clearTimeout(timer)
          resolve(Buffer.concat(chunks))
          ws.close()
        }
        return
      }
      const idx = rawData.indexOf('Path:audio\r\n')
      if (idx >= 0) chunks.push(rawData.subarray(idx + 12))
      else chunks.push(rawData)
    })
    ws.on('open', () => {
      const config = JSON.stringify({ context: { synthesis: { audio: {
        metadataoptions: { sentenceBoundaryEnabled: false, wordBoundaryEnabled: false },
        outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
      } } } })
      ws.send(`X-Timestamp:${Date()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n${config}`,
        { compress: true },
        (err) => {
          if (err) { clearTimeout(timer); reject(err); return }
          const clean = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;')
          const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}' volume='+0%'>${clean}</prosody></voice></speak>`
          ws.send(`X-RequestId:${randomUUID().replaceAll('-', '')}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${Date()}Z\r\nPath:ssml\r\n\r\n${ssml}`,
            { compress: true },
            (err) => { if (err) { clearTimeout(timer); reject(err) } })
        })
    })
  })
}

// ============= HTTP 服务 =============
const MALE_VOICES = ['zh-CN-YunyangNeural', 'zh-CN-YunjianNeural', 'zh-CN-YunxiNeural', 'zh-CN-YunxiaNeural']

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)

  // GET /speak?text=...&voice=... → audio/mpeg
  if (url.pathname === '/speak') {
    const text = url.searchParams.get('text')
    const voice = url.searchParams.get('voice') || MALE_VOICES[0]
    const rate = url.searchParams.get('rate') || '-5%'
    const pitch = url.searchParams.get('pitch') || '-5Hz'

    if (!text || text.length > 5000) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'text required, max 5000 chars' }))
      return
    }

    // 尝试所有男声，直到一个成功
    const voicesToTry = voice === MALE_VOICES[0] ? MALE_VOICES : [voice, ...MALE_VOICES]
    for (const v of voicesToTry) {
      try {
        const buf = await synthesize(text, v, rate, pitch)
        res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Content-Length': buf.length })
        res.end(buf)
        return
      } catch (e) {
        if (process.env.DEV) console.warn(`[TTS Proxy] ${v} failed: ${e.message}`)
      }
    }
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'all voices failed' }))
    return
  }

  // GET /voices → JSON 列表
  if (url.pathname === '/voices') {
    try {
      const resp = await fetch(`https://${BASE_URL}/voices/list?trustedclienttoken=${TOKEN}`, {
        headers: {
          'Authority': 'speech.platform.bing.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
          'Accept': '*/*',
        },
      })
      const data = await resp.json()
      const zhCN = data.filter(v => v.Locale.startsWith('zh-CN'))
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(zhCN.map(v => ({ name: v.ShortName, gender: v.Gender, friendly: v.FriendlyName }))))
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: e.message }))
    }
    return
  }

  res.writeHead(404)
  res.end('not found')
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[TTS Proxy] http://127.0.0.1:${PORT}`)
  console.log(`[TTS Proxy] 男声: ${MALE_VOICES.join(', ')}`)
})
