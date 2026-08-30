/**
 * verify-myth.mjs — 端到端验证 myth 子分类 (30 条)
 *
 * 流程:
 *   1. 进入 Dashboard
 *   2. 点 "全传统" Filmstrip 卡 → TraditionsOverview
 *   3. 默认 "全部" 视图, 数卡片总数 (期望 = 194)
 *   4. 点 "🐉 神话 (30)" chip 筛选
 *   5. 数 myth 卡片数 (期望 = 28)
 *   6. 验证 myth 卡片标题含 5 个关键神话人物 (伏羲/黄帝/玉皇大帝/共工/西王母)
 *
 * 实测期望 (per plan .hermes/plans/2026-08-29_184000-myth-31.md):
 *   - total cards = 122 (95 旧 + 27 新)
 *   - myth cards  = 30  (3 综合主题 + 28 新)
 *   - 5 keywords  = 伏羲 / 黄帝 / 玉皇大帝 / 共工 / 西王母
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/history/'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  console.log('=== verify-myth (30 条) ===\n')

  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForTimeout(3000)  // 等待首屏渲染

  // 步骤 1: Dashboard 出现 "全传统" Filmstrip 卡
  const dashCards = await page.locator('text=全传统').count()
  console.log(`[1] Dashboard "全传统" 元素数: ${dashCards} (期望 ≥ 1)`)

  // 步骤 2: 点 "全传统" 卡 → 进入 TraditionsOverview
  await page.locator('text=全传统').first().click()
  await page.waitForTimeout(2500)
  console.log('[2] 已点击"全传统"卡 → TraditionsOverview')

  // 步骤 3: 默认 "全部" 视图, 数卡片总数
  // 卡片: div[style*="border-left-width"]
  const totalCards = await page.evaluate(() => {
    return document.querySelectorAll('[style*="border-left-width"]').length
  })
  console.log(`[3] 默认"全部"视图卡片数: ${totalCards} (期望 = 194)`)
  const totalCardsOk = totalCards === 194

  // 步骤 4: 点 "🐉 神话 (30)" chip 筛选
  // chip 按钮: 含 "🐉" + "神话" + "(数字)"
  const mythClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const btn = btns.find(b => {
      const t = (b.textContent || '').trim()
      return /🐉\s*神话\s*\(\d+\)/.test(t)
    })
    if (btn) {
      btn.click()
      return btn.textContent?.trim()
    }
    return null
  })
  console.log(`[4] 点击的 myth chip: "${mythClicked}" (期望 "🐉 神话 (30)")`)
  await page.waitForTimeout(800)

  // 步骤 5: 数 myth 卡片数
  const mythCards = await page.evaluate(() => {
    return document.querySelectorAll('[style*="border-left-width"]').length
  })
  console.log(`[5] myth 子分类卡片数: ${mythCards} (期望 = 28)`)
  const mythCardsOk = mythCards === 28

  // 步骤 6: 验证 myth 卡片标题含 5 个关键神话人物
  // 标题在 <span class="text-base font-serif ...">{t.title}</span>
  const titles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[style*="border-left-width"]'))
      .map(card => {
        const tEl = card.querySelector('span.text-base.font-serif')
        return (tEl?.textContent || '').trim()
      })
      .filter(Boolean)
  })
  console.log(`[6] myth 卡片标题 (${titles.length} 条):`)
  titles.forEach((t, i) => console.log(`     ${(i + 1).toString().padStart(2)}. ${t}`))

  const keywords = ['伏羲', '黄帝', '玉皇大帝', '共工', '西王母']
  const titleStr = titles.join(' | ')
  const foundKeywords = keywords.filter(k => titleStr.includes(k))
  const missingKeywords = keywords.filter(k => !titleStr.includes(k))
  console.log(`\n     找到的神话人物: ${foundKeywords.join(', ') || '(无)'}`)
  console.log(`     缺失的神话人物: ${missingKeywords.join(', ') || '(无)'}`)
  const keywordsOk = missingKeywords.length === 0

  // 保存截图
  await page.screenshot({ path: '_dbg-myth-verify.png', fullPage: true })
  console.log('\n截图保存: _dbg-myth-verify.png')

  await browser.close()

  // 汇总
  console.log('\n=== 验收结果 ===')
  const checks = [
    { name: '默认全部视图卡片数 = 194', pass: totalCardsOk, actual: totalCards },
    { name: 'myth 子分类卡片数 = 30',   pass: mythCardsOk,  actual: mythCards },
    { name: '5 关键词 (伏羲/黄帝/玉皇大帝/共工/西王母) 全匹配', pass: keywordsOk, actual: `${foundKeywords.length}/${keywords.length}` },
  ]
  let allPass = true
  for (const c of checks) {
    console.log(`  ${c.pass ? '✅' : '❌'}  ${c.name} (实际: ${c.actual})`)
    if (!c.pass) allPass = false
  }
  console.log(`\n${allPass ? '✅ 全部通过' : '❌ 存在失败项'}`)

  process.exit(allPass ? 0 : 1)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
