/**
 * verify-regions.mjs — 端到端验证 geography-regional (地域文化) 子分类
 *
 * 流程:
 *   1. 进入 Dashboard (http://localhost:5173/history/)
 *   2. 跳过开场动画 (Space)
 *   3. 点 Filmstrip 中的 "全传统" 卡 → TraditionsOverview
 *   4. 默认 "全部" 视图, 数卡片总数 (期望 = 98: 33 history + 30 region + ... + 4 tech (3 family 已删除))
 *   5. 点 "🏔️ 地域文化 (30)" chip
 *   6. 数地域文化卡片数 (期望 = 30)
 *   7. 验证 6 个地域关键词匹配 (燕赵/齐鲁/岭南/巴蜀/三秦/吴越)
 *   8. 列出全部 30 条地域文化标题 (debug)
 *
 * 卡片选择器: [style*="border-left-width"] (TraditionsOverview.tsx line 118)
 * 筛选 chip 选择器: button 内文匹配 /地域文化\s*\(\d+\)/
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/history/'
const EXPECTED_TOTAL = 95
const EXPECTED_REGION = 30
const KEYWORDS = ['燕赵', '齐鲁', '岭南', '巴蜀', '三秦', '吴越']

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  console.log('=== verify-regions ===\n')

  // 步骤 1: 进入 Dashboard
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForTimeout(2500)  // 等首屏渲染 + Filmstrip hover 复位

  // 步骤 2: 跳过开场动画
  await page.keyboard.press('Space')
  await page.waitForTimeout(2000)
  console.log('[1] Dashboard 已加载, 已跳过开场动画')

  // 步骤 3: 点 Filmstrip 里的 "全传统" 卡
  // 精确匹配 — 避开 "全传统子分类" 这类组合文字; 取第一个
  const dashCount = await page.locator('text=全传统').count()
  console.log(`[2] Dashboard "全传统" 元素数: ${dashCount} (期望 ≥ 1)`)
  await page.locator('text=全传统').first().click()
  await page.waitForTimeout(2500)
  console.log('[3] 已点击 "全传统" 卡 → TraditionsOverview')

  // 等 "地域文化" chip 出现 (Task 2 已加)
  try {
    await page.waitForSelector('text=地域文化', { timeout: 5000 })
    console.log('[4] "地域文化" chip 已渲染')
  } catch {
    console.log('[4] ⚠️ 5s 内未发现 "地域文化" chip, 继续执行')
  }

  // 步骤 4: 默认 "全部" 视图卡片总数
  const totalCards = await page.evaluate(() => {
    return document.querySelectorAll('[style*="border-left-width"]').length
  })
  console.log(`[5] 默认"全部"视图卡片数: ${totalCards} (期望 = ${EXPECTED_TOTAL})`)
  const totalCardsOk = totalCards === EXPECTED_TOTAL

  // 步骤 5: 点 "🏔️ 地域文化 (30)" chip
  const chipText = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const btn = btns.find(b => /地域文化\s*\(\d+\)/.test(b.textContent || ''))
    if (btn) {
      btn.click()
      return (btn.textContent || '').trim()
    }
    return null
  })
  console.log(`[6] 点击的 chip: "${chipText}"`)
  await page.waitForTimeout(800)

  // 步骤 6: 数地域文化卡片
  const regionCards = await page.evaluate(() => {
    return document.querySelectorAll('[style*="border-left-width"]').length
  })
  console.log(`[7] 地域文化子分类卡片数: ${regionCards} (期望 = ${EXPECTED_REGION})`)
  const regionCardsOk = regionCards === EXPECTED_REGION

  // 步骤 7: 验证关键词
  const titles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[style*="border-left-width"]'))
      .map(card => {
        const tEl = card.querySelector('span.text-base.font-serif')
        return (tEl?.textContent || '').trim()
      })
      .filter(Boolean)
  })
  console.log(`[8] 地域文化卡片标题 (${titles.length} 条):`)
  titles.forEach((t, i) => console.log(`     ${(i + 1).toString().padStart(2)}. ${t}`))

  const titleStr = titles.join(' | ')
  const found = KEYWORDS.filter(k => titleStr.includes(k))
  const missing = KEYWORDS.filter(k => !titleStr.includes(k))
  console.log(`     \n     找到关键词: ${found.join(', ') || '(无)'}`)
  console.log(`     缺失关键词: ${missing.join(', ') || '(无)'}`)
  const keywordsOk = found.length === KEYWORDS.length

  // 截图存档
  await page.screenshot({ path: '_dbg-regions-verify.png', fullPage: true })
  console.log('\n截图保存: _dbg-regions-verify.png')

  await browser.close()

  // 汇总
  console.log('\n=== 验收结果 ===')
  const checks = [
    { name: `默认全部视图卡片数 = ${EXPECTED_TOTAL}`, pass: totalCardsOk, actual: totalCards },
    { name: `地域文化子分类卡片数 = ${EXPECTED_REGION}`, pass: regionCardsOk, actual: regionCards },
    { name: `${KEYWORDS.length} 个地域关键词全部匹配`, pass: keywordsOk, actual: `${found.length}/${KEYWORDS.length}` },
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