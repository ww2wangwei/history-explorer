/**
 * scripts/clean-and-rematch.mjs
 *
 * 1. 清掉 scripts/.poem-files-cache.json 里的 djvu/pdf/scan/IA_ 类伪图条目
 * 2. 删掉 src/data/poems.json 里被 image.url 命中伪图的脏匹配
 * 3. 重新跑 phase 2 把这些诗补上一张合适的图
 */
import fs from 'node:fs'
import path from 'node:path'

const POEMS_PATH = path.resolve('src/data/poems.json')
const CACHE_PATH = path.resolve('scripts/.poem-files-cache.json')

const FORBIDDEN_SUBSTR = [
  '.djvu', '.pdf', '.tif', '.tiff',
  'page1-', 'page2-', 'page3-', 'page4-', 'page5-', 'page6-', 'page7-', 'page8-', 'page9-',
  '/thumbs%',
  'IA_outlines', 'IA_selected', 'IA_china', 'Selected_relics', 'Illustrated_catalogue', 'Chinese_painting_(IA',
  'Chinese_art_(IA', 'Shunga', 'erotic', 'conchologia', 'nude', 'nudity', 'pornography',
]

function isBad(item) {
  const text = `${item.url || ''} ${item.title || ''} ${item.artwork || ''}`.toLowerCase()
  return FORBIDDEN_SUBSTR.some(s => text.includes(s.toLowerCase()))
}

// ---- 1. 清 cache ----
const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
const before = cache.files.length
cache.files = cache.files.filter(f => !isBad(f))
const after = cache.files.length
fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8')
console.log(`Cache: 清理 ${before - after} 个脏项 (剩 ${after} 条)`)

// ---- 2. 清 poems.json 的 image 字段 ----
const data = JSON.parse(fs.readFileSync(POEMS_PATH, 'utf8'))
let cleaned = 0
for (const p of data.poems) {
  if (p.image && isBad(p.image)) {
    p.image = undefined
    cleaned++
    console.log(`  清: ${p.id} ${p.title}`)
  }
}
fs.writeFileSync(POEMS_PATH, JSON.stringify(data, null, 2), 'utf8')
console.log(`\\npoems.json: 清理 ${cleaned} 个脏 image 字段`)

// ---- 3. 显示当前状态 ----
const stillBad = data.poems.filter(p => p.image && isBad(p.image)).length
const totalWithImg = data.poems.filter(p => p.image).length
console.log(`\\n当前状态: 有图 ${totalWithImg}/100, 剩余脏图 ${stillBad}`)
console.log('\\n下一步：跑 node scripts/fetch-poem-images.mjs 重 phase 2 (脚本会自动 skip 已填好图)')
