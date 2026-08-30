/**
 * verify-traditions-history.mjs — 端到端验证 history 子分类
 *
 * 流程:
 *   1. 进入 Dashboard
 *   2. 点 "全传统" Filmstrip 卡 → TraditionsOverview
 *   3. 默认 "全部" 视图, 数卡片总数 (期望 >= 60)
 *   4. 点 "历史 (N)" chip 筛选
 *   5. 数历史卡片数 (期望 >= 28)
 *   6. 验证 history 卡片标题含朝代名 (春秋/秦/唐/清等)
 *
 * 实测期望:
 *   - total cards  ≈ 68 (12 子分类合计, 含 33 条 history)
 *   - history cards = 33
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/history/'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  console.log('=== verify-traditions-history ===\n')

  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForTimeout(3000)  // 等待首屏渲染

  // 步骤 1: Dashboard 出现 "全传统" Filmstrip 卡
  // 用 text-is 精确匹配 (避免 "穿越历史" 等干扰)
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
  console.log(`[3] 默认"全部"视图卡片数: ${totalCards} (期望 ≥ 60)`)
  const totalCardsOk = totalCards >= 60

  // 步骤 4: 点 "历史 (N)" chip 筛选
  // chip 按钮含 "历史" 但不含 "穿越"; 用正则匹配 "历史 (33)" 格式
  const historyClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const btn = btns.find(b => {
      const t = (b.textContent || '').trim()
      // 排除 "穿越历史" 之类; 接受 "📜 历史 (33)"
      if (t.includes('穿越')) return false
      // 必须含 "历史" + 紧跟 "(数字)"
      return /历史\s*\(\d+\)/.test(t)
    })
    if (btn) {
      btn.click()
      return btn.textContent?.trim()
    }
    return null
  })
  console.log(`[4] 点击的 history chip: "${historyClicked}"`)
  await page.waitForTimeout(800)

  // 步骤 5: 数历史卡片数
  const historyCards = await page.evaluate(() => {
    return document.querySelectorAll('[style*="border-left-width"]').length
  })
  console.log(`[5] 历史子分类卡片数: ${historyCards} (期望 ≥ 28)`)
  const historyCardsOk = historyCards >= 28

  // 步骤 6: 验证 history 卡片标题含朝代名
  // 标题在 <span class="text-base font-serif ...">{t.title}</span>
  const titles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[style*="border-left-width"]'))
      .map(card => {
        const tEl = card.querySelector('span.text-base.font-serif')
        return (tEl?.textContent || '').trim()
      })
      .filter(Boolean)
  })
  console.log(`[6] 历史卡片标题 (${titles.length} 条):`)
  titles.forEach((t, i) => console.log(`     ${(i + 1).toString().padStart(2)}. ${t}`))

  const dynasticKeywords = ['春秋', '战国', '秦', '汉', '三国', '唐', '宋', '元', '明', '清']
  const titleStr = titles.join(' | ')
  const foundDynasties = dynasticKeywords.filter(k => titleStr.includes(k))
  const missingDynasties = dynasticKeywords.filter(k => !titleStr.includes(k))
  console.log(`\n     找到的朝代名: ${foundDynasties.join(', ') || '(无)'}`)
  console.log(`     缺失的朝代名: ${missingDynasties.join(', ') || '(无)'}`)
  // 至少 4 个不同朝代名出现
  const dynastiesOk = foundDynasties.length >= 4

  // 保存截图
  await page.screenshot({ path: '_dbg-history-verify.png', fullPage: true })
  console.log('\n截图保存: _dbg-history-verify.png')

  await browser.close()

  // 汇总
  console.log('\n=== 验收结果 ===')
  const checks = [
    { name: '默认全部视图卡片数 ≥ 60', pass: totalCardsOk, actual: totalCards },
    { name: '历史子分类卡片数 ≥ 28', pass: historyCardsOk, actual: historyCards },
    { name: 'history 卡片标题含 ≥4 个朝代名', pass: dynastiesOk, actual: foundDynasties.length },
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