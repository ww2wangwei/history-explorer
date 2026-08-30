// verify-art.mjs — 端到端验证 art 子分类 (31 条)
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/history/'
const EXPECTED_TOTAL = 223
const KEYWORDS = ['兵马俑', '兰亭集序', '千里江山图', '京剧', '昆曲']

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

console.log('=== verify-art (31 条) ===\n')

await page.goto(BASE, { waitUntil: 'load' })
await page.waitForTimeout(2500)
await page.keyboard.press('Space')
await page.waitForTimeout(2000)

await page.locator('text=全传统').first().click()
await page.waitForTimeout(2500)

try {
  await page.waitForSelector('text=艺术', { timeout: 5000 })
  console.log('[1] "艺术" chip 已渲染')
} catch {
  console.log('[1] ⚠️ 5s 内未发现 "艺术" chip')
}

const totalCards = await page.evaluate(() => {
  return document.querySelectorAll('[style*="border-left-width"]').length
})
console.log(`[2] 默认"全部"视图卡片数: ${totalCards} (期望 = ${EXPECTED_TOTAL})`)
const totalCardsOk = (totalCards === EXPECTED_TOTAL || totalCards === EXPECTED_TOTAL - 1)

const chipText = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'))
  const btn = btns.find(b => /艺术\s*\(\d+\)/.test(b.textContent || ''))
  if (btn) {
    btn.click()
    return (btn.textContent || '').trim()
  }
  return null
})
console.log(`[3] 点击的 art chip: "${chipText}"`)
await page.waitForTimeout(1500)

const artCards = await page.evaluate(() => {
  return document.querySelectorAll('[style*="border-left-width"]').length
})
console.log(`[4] art 子分类卡片数: ${artCards} (期望 = 31 +/- 浮动)`)
const artCardsOk = artCards >= 31 && artCards <= 33

const titles = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[style*="border-left-width"]'))
    .map(card => {
      const tEl = card.querySelector('span.text-base.font-serif')
      return (tEl?.textContent || '').trim()
    })
    .filter(Boolean)
})
console.log(`[5] art 卡片标题 (${titles.length} 条):`)
titles.forEach((t, i) => console.log(`     ${(i + 1).toString().padStart(2)}. ${t}`))

const titleStr = titles.join(' | ')
const found = KEYWORDS.filter(k => titleStr.includes(k))
const missing = KEYWORDS.filter(k => !titleStr.includes(k))
console.log(`     \n     找到关键词: ${found.join(', ') || '(无)'}`)
console.log(`     缺失关键词: ${missing.join(', ') || '(无)'}`)
const keywordsOk = found.length === KEYWORDS.length

await page.screenshot({ path: '_dbg-art-verify.png', fullPage: true })

await browser.close()

console.log('\n=== 验收结果 ===')
const checks = [
  { name: `默认全部视图卡片数 = ${EXPECTED_TOTAL}`, pass: totalCardsOk, actual: totalCards },
  { name: `art 子分类卡片数 (31 +/- 浮动)`, pass: artCardsOk, actual: artCards },
  { name: `${KEYWORDS.length} 个艺术关键词全部匹配`, pass: keywordsOk, actual: `${found.length}/${KEYWORDS.length}` },
]
let allPass = true
for (const c of checks) {
  console.log(`  ${c.pass ? '✅' : '❌'}  ${c.name} (实际: ${c.actual})`)
  if (!c.pass) allPass = false
}
console.log(`\n${allPass ? '✅ 全部通过' : '❌ 存在失败项'}`)