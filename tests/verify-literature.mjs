// verify-literature.mjs — 端到端验证 literature 子分类 (30 条)
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/history/'
const EXPECTED_TOTAL = 194
const KEYWORDS = ['诗经', '李白', '杜甫', '苏轼', '红楼梦']

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

console.log('=== verify-literature (30 条) ===\n')

await page.goto(BASE, { waitUntil: 'load' })
await page.waitForTimeout(2500)
await page.keyboard.press('Space')
await page.waitForTimeout(2000)
console.log('[1] Dashboard 已加载, 已跳过开场动画')

await page.locator('text=全传统').first().click()
await page.waitForTimeout(2500)
console.log('[2] 已点击 "全传统" 卡 → TraditionsOverview')

try {
  await page.waitForSelector('text=文学', { timeout: 5000 })
  console.log('[3] "文学" chip 已渲染')
} catch {
  console.log('[3] ⚠️ 5s 内未发现 "文学" chip, 继续执行')
}

const totalCards = await page.evaluate(() => {
  return document.querySelectorAll('[style*="border-left-width"]').length
})
console.log(`[4] 默认"全部"视图卡片数: ${totalCards} (期望 = ${EXPECTED_TOTAL})`)
const totalCardsOk = totalCards === EXPECTED_TOTAL

const chipText = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'))
  const btn = btns.find(b => /文学\s*\(\d+\)/.test(b.textContent || ''))
  if (btn) {
    btn.click()
    return (btn.textContent || '').trim()
  }
  return null
})
console.log(`[5] 点击的 literature chip: "${chipText}"`)
await page.waitForTimeout(1500)

const litCards = await page.evaluate(() => {
  return document.querySelectorAll('[style*="border-left-width"]').length
})
console.log(`[6] literature 子分类卡片数: ${litCards} (期望 = chip 数字 + 浮动)`)
const litCardsOk = litCards >= 30 && litCards <= 32

const titles = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[style*="border-left-width"]'))
    .map(card => {
      const tEl = card.querySelector('span.text-base.font-serif')
      return (tEl?.textContent || '').trim()
    })
    .filter(Boolean)
})
console.log(`[7] literature 卡片标题 (${titles.length} 条):`)
titles.forEach((t, i) => console.log(`     ${(i + 1).toString().padStart(2)}. ${t}`))

const titleStr = titles.join(' | ')
const found = KEYWORDS.filter(k => titleStr.includes(k))
const missing = KEYWORDS.filter(k => !titleStr.includes(k))
console.log(`     \n     找到关键词: ${found.join(', ') || '(无)'}`)
console.log(`     缺失关键词: ${missing.join(', ') || '(无)'}`)
const keywordsOk = found.length === KEYWORDS.length

await page.screenshot({ path: '_dbg-literature-verify.png', fullPage: true })
console.log('\n截图保存: _dbg-literature-verify.png')

await browser.close()

console.log('\n=== 验收结果 ===')
const checks = [
  { name: `默认全部视图卡片数 = ${EXPECTED_TOTAL}`, pass: totalCardsOk, actual: totalCards },
  { name: `literature 子分类卡片数 (30 +/- 浮动)`, pass: litCardsOk, actual: litCards },
  { name: `${KEYWORDS.length} 个文学关键词全部匹配`, pass: keywordsOk, actual: `${found.length}/${KEYWORDS.length}` },
]
let allPass = true
for (const c of checks) {
  console.log(`  ${c.pass ? '✅' : '❌'}  ${c.name} (实际: ${c.actual})`)
  if (!c.pass) allPass = false
}
console.log(`\n${allPass ? '✅ 全部通过' : '❌ 存在失败项'}`)