/**
 * scripts/fetch-poem-images.mjs（v2 — Category-based，避免逐诗搜索 429 限流）
 *
 * 第一阶段：1 次拉取 12 个 Wikimedia 主题类别下 100-300 个文件，缓存到 scripts/.poem-files-cache.json
 *           （含 title / thumburl / pageUrl / artwork / credit / license）
 * 第二阶段：每首诗按 motif + 关键词从缓存精确匹配；无候选时才发 search API。
 *
 * 这样 100 首诗只需要 12-20 次 API 调用而不是 200-500 次。
 *
 * 用法：
 *   FORCE_REFRESH=1 node scripts/fetch-poem-images.mjs  # 强制重新下载类目
 *   node scripts/fetch-poem-images.mjs                    # 增量
 */
import fs from 'node:fs'
import path from 'node:path'

const POEMS_PATH = path.resolve('src/data/poems.json')
const CACHE_PATH = path.resolve('scripts/.poem-files-cache.json')
const API = 'https://commons.wikimedia.org/w/api.php'
const UA = 'HistoryExplorer/1.0 (educational; poems cover lookup)'
const WIDTH = 1024
const FILES_PER_CAT = 200
const SCRIPT_VERSION = 2

// ---------- Wikimedia API ----------

function stripHtml(s) {
  if (!s) return ''
  return s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

function isFree(item) {
  const lic = (item.license || '').toLowerCase()
  return /\b(pd|public\s*domain|cc0|cc[- ]pd|cc[- ]0|creative\s*commons\s*zero)\b/.test(lic)
}

const FORBIDDEN = ['shunga', 'erotic', 'nudity', 'conchologia', 'shell', 'map', 'flag', 'coin', 'stamp', 'seal', 'diagram', 'anatomy', 'photograph', 'photo of']
function isClean(item) {
  const t = `${item.title || ''} ${item.artwork || ''} ${item.credit || ''}`.toLowerCase()
  return !FORBIDDEN.some(f => t.includes(f))
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function apiCall(params, attempt = 0) {
  const url = `${API}?${new URLSearchParams(params).toString()}`
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } })
      if (r.status === 429 || r.status >= 500) {
        await sleep(8000 * Math.pow(2, i))
        continue
      }
      if (!r.ok) return null
      return await r.json()
    } catch (e) {
      console.warn('NET ERR', e.message)
      await sleep(2000)
    }
  }
  return null
}

/** 拉某个 category 下所有文件 + 元数据 + 缩略图 URL（带 continue 翻页） */
async function fetchCategory(categoryName) {
  const files = []
  let cmcontinue = null
  const cmtitle = 'Category:' + categoryName
  for (let i = 0; i < 6; i++) {
    const params = {
      action: 'query',
      format: 'json',
      list: 'categorymembers',
      cmtitle,
      cmtype: 'file',
      cmlimit: String(FILES_PER_CAT),
      ...(cmcontinue ? { cmcontinue } : {}),
    }
    const data = await apiCall(params)
    if (!data) break
    const members = data.query?.categorymembers ?? []
    files.push(...members)
    cmcontinue = data.continue?.cmcontinue
    if (!cmcontinue) break
    await sleep(500)
  }
  if (!files.length) return []

  // 一次性批量获取 imageinfo（每页最多 50 个 title）
  const titles = files.map(m => m.title)
  const detailed = []
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40)
    const params = {
      action: 'query',
      format: 'json',
      titles: batch.join('|'),
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiurlwidth: String(WIDTH),
    }
    const d = await apiCall(params)
    if (!d) continue
    const pages = Object.values(d.query?.pages ?? {})
    for (const p of pages) {
      const info = p.imageinfo?.[0]
      if (!info) continue
      const meta = info.extmetadata ?? {}
      detailed.push({
        title: p.title,
        thumburl: info.thumburl || info.url,
        url: info.url,
        pageUrl: info.descriptionurl,
        artwork: stripHtml(meta.ObjectName?.value ?? meta.ImageDescription?.value ?? p.title),
        credit: stripHtml(meta.Artist?.value ?? meta.Credit?.value ?? '').slice(0, 200),
        license: meta.LicenseShortName?.value ?? '',
        category: categoryName,
      })
    }
    await sleep(500)
  }
  return detailed
}

// ---------- Theme → Keywords ----------

function motifToEn(motif) {
  const m = {
    '🌙': ['moon', 'night', 'lunar'], '🌕': ['moon', 'full moon'],
    '☀️': ['sun', 'sunrise'], '🌅': ['sunset', 'dusk', 'evening'],
    '🌇': ['sunset', 'town'], '🌌': ['star', 'starry'], '✨': ['star'],
    '⛰️': ['mountain', 'peak'], '🏔': ['mountain', 'peak'], '🏯': ['pagoda', 'tower'],
    '🌊': ['water', 'river', 'stream', 'wave'], '💧': ['water'], '🚣': ['boat', 'ship'],
    '🐦': ['bird', 'magpie', 'swallow'], '🦢': ['swan', 'crane'],
    '🌸': ['flower', 'peach', 'cherry'], '🌺': ['flower'], '🌹': ['rose'],
    '🍂': ['autumn', 'leaf'], '🍁': ['autumn'], '🍃': ['leaf', 'wind'],
    '❄️': ['snow', 'winter'], '🪶': ['quill'],
    '⚔️': ['battle', 'war', 'warrior'], '🏹': ['archer', 'bow'],
    '🍷': ['wine'], '🍶': ['wine'],
    '🏮': ['lantern', 'night'], '🛕': ['temple'],
    '🌿': ['bamboo', 'leaf'], '🎋': ['bamboo'], '🪷': ['lotus'],
    '🌲': ['pine', 'tree'], '🌾': ['harvest', 'field'], '🏠': ['cottage', 'house'],
    '🏡': ['house'], '🏚️': ['ruins'], '💌': ['couple', 'love'],
  }
  return m[motif] || ['landscape', 'mountain', 'pavilion', 'mist', 'river']
}

// ---------- Build / refresh cache ----------

const CATEGORIES = [
  'Shan shui',                                       // 山水
  'Chinese landscape paintings',                      // 中国山水画
  'Moon in art of China',                            // 月
  'Chinese paintings of flowers',                    // 花鸟
  'Bamboo paintings of China',                       // 竹
  'Plum blossoms in art',                            // 梅
  'Snow in art of China',                            // 雪景
  'Birds in Chinese art',                            // 飞鸟
  'Boats in Chinese art',                            // 舟
  'Wines in Chinese art',                            // 酒
  'Fog in art of China',                             // 雾暮色
  'Chinese painting of fish',                        // 鱼 (for 鱼跃)
]

async function refreshCache() {
  const all = []
  const seen = new Set()
  for (const cat of CATEGORIES) {
    process.stdout.write(`  → Category: ${cat} ... `)
    const items = await fetchCategory(cat)
    let kept = 0
    for (const it of items) {
      if (!isFree(it) || !isClean(it)) continue
      const dedupKey = it.url || it.title
      if (seen.has(dedupKey)) continue
      seen.add(dedupKey)
      all.push(it)
      kept++
    }
    console.log(`kept ${kept}`)
    await sleep(1500)
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify({ version: SCRIPT_VERSION, categories: CATEGORIES, files: all }, null, 2), 'utf8')
  console.log(`Cached ${all.length} files → ${CACHE_PATH}`)
}

// ---------- Per-poem match ----------

function matchScore(file, poem) {
  const haystack = `${file.title} ${file.artwork}`.toLowerCase()
  const themeKw = motifToEn(poem.motif)
  let score = 0
  // motif 关键词
  for (const kw of themeKw) {
    if (haystack.includes(kw)) score += 5
  }
  // 标题关键词（去词牌名）
  const titleKw = stripTonePatterns(poem.title)
  if (titleKw && haystack.includes(titleKw.toLowerCase())) score += 8
  // 作者名命中（避免人物画，但要权衡）
  // 不加分，避免都用同一张李白图
  // 题材分类词
  const catKw = categoryToKw(poem.category)
  if (catKw.some(k => haystack.includes(k))) score += 3
  // 通用山水
  if (haystack.includes('landscape') || haystack.includes('山') || haystack.includes('shanshui')) score += 1
  return score
}

function categoryToKw(category) {
  const m = {
    '山水': ['mountain', 'water', 'river'],
    '送别': ['farewell', 'send off'],
    '思乡': ['moon', 'night'],
    '边塞': ['battle', 'warrior', 'horse'],
    '咏物': ['bamboo', 'plum', 'flower', 'bird'],
    '爱情': ['woman', 'couple', 'love'],
    '哲理': ['moon', 'mountain'],
    '田园': ['village', 'field', 'farmer'],
    '咏史': ['historian'],
    '闺怨': ['woman', 'maid'],
    '怀古': ['ruins', 'temple'],
    '节令': ['lantern', 'moon', 'snow'],
    '爱国': ['warrior', 'battle'],
    '其他': ['landscape', 'mountain'],
  }
  return m[category] || []
}

const TONE_PATTERNS = new Set([
  '如梦令','渔家傲','蝶恋花','贺新郎','南乡子','破阵子','满江红','念奴娇',
  '永遇乐','青玉案','浣溪沙','西江月','卜算子','鹊桥仙','苏幕遮','钗头凤',
  '水调歌头','水龙吟','摸鱼儿','满庭芳','风入松','临江仙','相见欢','清平乐',
  '一剪梅','虞美人','生查子','江城子','点绛唇','好事近','忆江南','长相思',
  '浪淘沙','鹧鸪天','定风波','虞美人',
])
function stripTonePatterns(title) {
  const parts = title.split(/[·\s]/).filter(w => w.length >= 2 && !TONE_PATTERNS.has(w))
  return parts.sort((a, b) => a.length - b.length)[0] || ''
}

// ---------- Save ----------

async function main() {
  const POEM_FIELD_DONE = (poem) => !!poem.image?.url
  // 1. 加载 / 刷新 cache
  const needRefresh = process.env.FORCE_REFRESH === '1'
  let cache
  if (!needRefresh && fs.existsSync(CACHE_PATH)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
      if (cache.version !== SCRIPT_VERSION) {
        console.log('Cache version mismatch, refreshing...')
        needRefresh = true
      }
    } catch (e) {
      console.log('Cache unreadable, refreshing...')
      needRefresh = true
    }
  }
  if (!cache || needRefresh) {
    console.log('Phase 1: 拉取 Wikimedia category 文件...')
    await refreshCache()
    cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
  }
  const files = cache.files
  console.log(`Phase 2: 用本地缓存匹配 100 首诗（${files.length} 张候选）`)

  // 2. 对每首诗挑最高分
  const data = JSON.parse(fs.readFileSync(POEMS_PATH, 'utf8'))
  let found = 0, skipped = 0, unfilled = 0
  let i = 0
  for (const poem of data.poems) {
    i++
    if (POEM_FIELD_DONE(poem)) { skipped++; continue }
    const ranked = files
      .map(f => ({ f, s: matchScore(f, poem) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
    if (ranked.length > 0) {
      const pick = ranked[0].f
      poem.image = {
        url: pick.thumburl || pick.url,
        pageUrl: pick.pageUrl,
        artworkName: pick.artwork,
        title: pick.title,
        credit: pick.credit,
        license: pick.license,
      }
      found++
      console.log(`[${i}/${data.poems.length}] ✅ ${poem.id} ${poem.title} score=${ranked[0].s} → ${pick.artwork.slice(0, 60)}`)
    } else {
      unfilled++
      console.log(`[${i}/${data.poems.length}] ⚠️  ${poem.id} ${poem.title} no match (motif=${poem.motif})`)
    }
  }
  // 增量写回
  fs.writeFileSync(POEMS_PATH, JSON.stringify(data, null, 2), 'utf8')
  console.log(`\nDone. From cache: ${found} ✓  | skipped(has-image): ${skipped} | unfilled: ${unfilled}`)
}

main().catch(err => { console.error('FATAL', err); process.exit(1) })
