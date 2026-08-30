// verify-script.mjs — 端到端验证 script 子分类 (31 条)
// 复用 verify-regions.mjs 的成熟选择器 (text=全传统 + [style*="border-left-width"])

import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/history/'
const EXPECTED_TOTAL = 166
const EXPECTED_SCRIPT = 28
const KEYWORDS = ['仓颉', '篆书', '隶书', '文房四宝', '三字经']

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

console.log('=== verify-script (31 条) ===\n')

// 1. Dashboard
await page.goto(BASE, { waitUntil: 'load' })
await page.waitForTimeout(2500)
await page.keyboard.press('Space')
await page.waitForTimeout(2000)
console.log('[1] Dashboard 已加载, 已跳过开场动画')

// 2. 点 Filmstrip 里的 "全传统" 卡
const dashCount = await page.locator('text=全传统').count()
console.log(`[2] Dashboard "全传统" 元素数: ${dashCount} (期望 ≥ 1)`)
await page.locator('text=全传统').first().click()
await page.waitForTimeout(2500)
console.log('[3] 已点击 "全传统" 卡 → TraditionsOverview')

// 等 "文字" chip 出现
try {
  await page.waitForSelector('text=文字', { timeout: 5000 })
  console.log('[4] "文字" chip 已渲染')
} catch {
  console.log('[4] ⚠️ 5s 内未发现 "文字" chip, 继续执行')
}

// 3. 默认"全部"视图卡片总数
const totalCards = await page.evaluate(() => {
  return document.querySelectorAll('[style*="border-left-width"]').length
})
console.log(`[5] 默认"全部"视图卡片数: ${totalCards} (期望 = ${EXPECTED_TOTAL})`)
const totalCardsOk = totalCards === EXPECTED_TOTAL

// 4. 点 script chip
const chipText = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'))
  const btn = btns.find(b => /文字\s*\(\d+\)/.test(b.textContent || ''))
  if (btn) {
    btn.click()
    return (btn.textContent || '').trim()
  }
  return null
})
console.log(`[6] 点击的 chip: "${chipText}"`)
await page.waitForTimeout(800)

// 5. 数 script 卡片
const scriptCards = await page.evaluate(() => {
  return document.querySelectorAll('[style*="border-left-width"]').length
})
console.log(`[7] script 子分类卡片数: ${scriptCards} (期望 = ${EXPECTED_SCRIPT})`)
const scriptCardsOk = scriptCards === EXPECTED_SCRIPT

// 6. 验证关键词
const titles = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[style*="border-left-width"]'))
    .map(card => {
      const tEl = card.querySelector('span.text-base.font-serif')
      return (tEl?.textContent || '').trim()
    })
    .filter(Boolean)
})
console.log(`[8] script 卡片标题 (${titles.length} 条):`)
titles.forEach((t, i) => console.log(`     ${(i + 1).toString().padStart(2)}. ${t}`))

const titleStr = titles.join(' | ')
const found = KEYWORDS.filter(k => titleStr.includes(k))
const missing = KEYWORDS.filter(k => !titleStr.includes(k))
console.log(`     \n     找到关键词: ${found.join(', ') || '(无)'}`)
console.log(`     缺失关键词: ${missing.join(', ') || '(无)'}`)
const keywordsOk = found.length === KEYWORDS.length

await page.screenshot({ path: '_dbg-script-verify.png', fullPage: true })
console.log('\n截图保存: _dbg-script-verify.png')

await browser.close()

// 汇总
console.log('\n=== 验收结果 ===')
const checks = [
  { name: `默认全部视图卡片数 = ${EXPECTED_TOTAL}`, pass: totalCardsOk, actual: totalCards },
  { name: `script 子分类卡片数 = ${EXPECTED_SCRIPT}`, pass: scriptCardsOk, actual: scriptCards },
  { name: `${KEYWORDS.length} 个文字学关键词全部匹配`, pass: keywordsOk, actual: `${found.length}/${KEYWORDS.length}` },
]
let allPass = true
for (const c of checks) {
  console.log(`  ${c.pass ? '✅' : '❌'}  ${c.name} (实际: ${c.actual})`)
  if (!c.pass) allPass = false
}
console.log(`\n${allPass ? '✅ 全部通过' : '❌ 存在失败项'}`)