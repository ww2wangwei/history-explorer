// verify-calendar.mjs — 端到端验证 calendar 子分类 (30 条)
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/history/'
const EXPECTED_TOTAL = 250
const KEYWORDS = ['立春', '夏至', '秋分', '冬至', '二十四节气']

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

console.log('=== verify-calendar (30 条) ===\n')

await page.goto(BASE, { waitUntil: 'load' })
await page.waitForTimeout(2500)
await page.keyboard.press('Space')
await page.waitForTimeout(2000)

await page.locator('text=全传统').first().click()
await page.waitForTimeout(2500)

try {
  await page.waitForSelector('text=历法节气', { timeout: 5000 })
  console.log('[1] "历法节气" chip 已渲染')
} catch {
  console.log('[1] ⚠️ 5s 内未发现 chip')
}

const totalCards = await page.evaluate(() => {
  return document.querySelectorAll('[style*="border-left-width"]').length
})
console.log(`[2] 默认"全部"视图卡片数: ${totalCards} (期望 = ${EXPECTED_TOTAL} 或 249)`)
const totalCardsOk = (totalCards === EXPECTED_TOTAL || totalCards === EXPECTED_TOTAL - 1)

const chipText = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'))
  const btn = btns.find(b => /历法节气\s*\(\d+\)/.test(b.textContent || ''))
  if (btn) {
    btn.click()
    return (btn.textContent || '').trim()
  }
  return null
})
console.log(`[3] 点击的 calendar chip: "${chipText}"`)
await page.waitForTimeout(1500)

const calCards = await page.evaluate(() => {
  return document.querySelectorAll('[style*="border-left-width"]').length
})
console.log(`[4] calendar 子分类卡片数: ${calCards} (期望 = 30 +/- 浮动)`)
const calCardsOk = (calCards >= 30 && calCards <= 32)

const titles = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[style*="border-left-width"]'))
    .map(card => {
      const tEl = card.querySelector('span.text-base.font-serif')
      return (tEl?.textContent || '').trim()
    })
    .filter(Boolean)
})
console.log(`[5] calendar 卡片标题 (${titles.length} 条):`)
titles.forEach((t, i) => console.log(`     ${(i + 1).toString().padStart(2)}. ${t}`))

const titleStr = titles.join(' | ')
const found = KEYWORDS.filter(k => titleStr.includes(k))
const missing = KEYWORDS.filter(k => !titleStr.includes(k))
console.log(`     \n     找到关键词: ${found.join(', ') || '(无)'}`)
console.log(`     缺失关键词: ${missing.join(', ') || '(无)'}`)
const keywordsOk = found.length === KEYWORDS.length

await page.screenshot({ path: '_dbg-calendar-verify.png', fullPage: true })

await browser.close()

console.log('\n=== 验收结果 ===')
const checks = [
  { name: `默认全部视图卡片数 = ${EXPECTED_TOTAL} +/- 1`, pass: totalCardsOk, actual: totalCards },
  { name: `calendar 子分类卡片数 (30 +/- 浮动)`, pass: calCardsOk, actual: calCards },
  { name: `${KEYWORDS.length} 个历法关键词全部匹配`, pass: keywordsOk, actual: `${found.length}/${KEYWORDS.length}` },
]
let allPass = true
for (const c of checks) {
  console.log(`  ${c.pass ? '✅' : '❌'}  ${c.name} (实际: ${c.actual})`)
  if (!c.pass) allPass = false
}
console.log(`\n${allPass ? '✅ 全部通过' : '❌ 存在失败项'}`)