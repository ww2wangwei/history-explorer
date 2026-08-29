/**
 * verify-traditions.mjs — 验证"全传统"板块
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/history/'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)

  // Dashboard 应能看到 14 张 Filmstrip 卡（包括新加的"全传统"）
  const dashCards = await page.locator('text=全传统').count()
  console.log(`页面出现"全传统"次数: ${dashCards}（至少 1 个 = 卡片可见）`)

  // 点击"全传统"卡（Filmstrip 里的卡）
  await page.locator('text=全传统').first().click()

  // 等 TraditionsOverview 渲染：toolbar chip "全部" 出现
  await page.waitForSelector('text=全传统', { timeout: 5000 }).catch(() => {})
  await page.waitForTimeout(1500)

  // 验证 12 个子分类 chip 渲染
  const chips = await page.evaluate(() => {
    const expectedLabels = ['历史', '家', '神话', '哲学', '文字', '文学', '艺术', '历法节气', '礼仪制度', '衣食', '住行', '科技']
    const out = {}
    for (const l of expectedLabels) {
      out[l] = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.includes(l)).length
    }
    return out
  })
  console.log('\n=== 子分类 chip 出现次数 ===')
  let chipOk = 0
  for (const [k, v] of Object.entries(chips)) {
    console.log(`  ${v > 0 ? '✅' : '❌'}  ${k.padEnd(8)} ${v}`)
    if (v > 0) chipOk++
  }
  console.log(`\n${chipOk}/12 个子分类 chip 渲染`)

  // 验证卡片总数 (默认全部视图 = 41 条)
  await page.waitForTimeout(500)
  const cardCount = await page.evaluate(() => {
    // TraditionItem 卡片：左 border、含 title
    return document.querySelectorAll('[style*="border-left-width"]').length
  })
  console.log(`\n默认"全部"视图卡片数: ${cardCount}`)

  // 点"神话"chip 验证筛选
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('神话') && b.textContent?.includes('3'))
    if (btn) btn.click()
  })
  await page.waitForTimeout(500)
  const mythCardCount = await page.evaluate(() => {
    return document.querySelectorAll('[style*="border-left-width"]').length
  })
  console.log(`筛选"神话"后卡片数: ${mythCardCount}（期望 3）`)

  // ESC 关闭
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  const dialogStill = await page.evaluate(() => {
    // TraditionsOverview 在 OverviewLayout 中，没有 role=dialog，需要检查工具栏是否还在
    const toolsVisible = !!document.querySelector('button') && Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('全部'))
    return toolsVisible
  })
  console.log(`\nESC 关闭后回到 Dashboard: ${!dialogStill ? '✅ 是' : '❌ 否'}`)

  await page.screenshot({ path: '_dbg-traditions.png' })
  console.log('\n截图保存到 _dbg-traditions.png')

  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })