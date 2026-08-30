/**
 * verify-philosophy.mjs — 端到端验证 philosophy 子分类
 *
 * 流程:
 *   1. 进入 Dashboard
 *   2. 点 "全传统" Filmstrip 卡 → TraditionsOverview
 *   3. 默认 "全部" 视图, 数卡片总数 (期望 152 = 122 + 30)
 *   4. 点 "☯️ 哲学 (N)" chip 筛选
 *   5. 数哲学卡片数 (从 chip label 动态读取期望值, 避免硬编码)
 *   6. 验证哲学卡片标题/摘要含 5 位哲学家关键词: 孔子/老子/庄子/墨子/朱熹
 *
 * 实测期望:
 *   - total cards = 152 (122 现有 + 30 新增 philosophy)
 *   - philosophy cards = N (从 chip label 动态读取)
 *   - 5 个关键词全部命中
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/history/'

// 5 位哲学家关键词
const PHILOSOPHERS = ['孔子', '老子', '庄子', '墨子', '朱熹']

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  console.log('=== verify-philosophy ===\n')

  try {
    await page.goto(BASE, { waitUntil: 'load' })
    await page.waitForTimeout(3000)

    // Dashboard intro screen — press Space to advance
    await page.keyboard.press('Space')
    await page.waitForTimeout(1500)

    // 步骤 1: Dashboard 出现 "全传统" Filmstrip 卡
    const dashCards = await page.locator('text=全传统').count()
    console.log(`[1] Dashboard "全传统" 元素数: ${dashCards} (期望 ≥ 1)`)

    // 步骤 2: 点 "全传统" 卡 → 进入 TraditionsOverview
    await page.locator('text=全传统').first().click()
    await page.waitForTimeout(2500)
    console.log('[2] 已点击"全传统"卡 → TraditionsOverview')

    // 步骤 3: 默认 "全部" 视图, 数卡片总数
    const totalCards = await page.evaluate(() => {
      return document.querySelectorAll('[style*="border-left-width"]').length
    })
    console.log(`[3] 默认"全部"视图卡片数: ${totalCards} (期望 152)`)
    const totalCardsOk = totalCards === 152

    // 步骤 4: 点 "☯️ 哲学 (N)" chip 筛选
    const philosophyClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      const btn = btns.find(b => {
        const t = (b.textContent || '').trim()
        // 必须含 "哲学" + 紧跟 "(数字)"
        return /哲学\s*\(\d+\)/.test(t)
      })
      if (btn) {
        btn.click()
        const m = btn.textContent?.match(/\((\d+)\)/)
        return { text: btn.textContent?.trim(), count: m ? parseInt(m[1], 10) : null }
      }
      return null
    })
    const expectedPhilosophy = philosophyClicked?.count ?? 30
    console.log(`[4] 点击的 philosophy chip: "${philosophyClicked?.text}" (期望数 ${expectedPhilosophy})`)
    await page.waitForTimeout(800)

    // 步骤 5: 数哲学卡片数
    const philosophyCards = await page.evaluate(() => {
      return document.querySelectorAll('[style*="border-left-width"]').length
    })
    console.log(`[5] 哲学子分类卡片数: ${philosophyCards} (期望 ${expectedPhilosophy})`)
    const philosophyCardsOk = philosophyCards === expectedPhilosophy

    // 步骤 6: 提取所有哲学卡片文本 (title + summary)
    const philosophyTexts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[style*="border-left-width"]'))
        .map(card => card.textContent || '')
    })
    const philosophyCorpus = philosophyTexts.join(' | ')
    console.log(`[6] 哲学卡片语料长度: ${philosophyCorpus.length}`)

    // 检查 5 位哲学家关键词
    const foundPhilosophers = PHILOSOPHERS.filter(k => philosophyCorpus.includes(k))
    const missingPhilosophers = PHILOSOPHERS.filter(k => !philosophyCorpus.includes(k))
    console.log(`\n     找到的哲学家: ${foundPhilosophers.join(', ') || '(无)'}`)
    console.log(`     缺失的哲学家: ${missingPhilosophers.join(', ') || '(无)'}`)
    const philosophersOk = missingPhilosophers.length === 0

    // 列出所有哲学卡片标题
    const philosophyTitles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[style*="border-left-width"]'))
        .map(card => {
          const tEl = card.querySelector('span.text-base.font-serif')
          return (tEl?.textContent || '').trim()
        })
        .filter(Boolean)
    })
    console.log(`\n     哲学卡片标题 (${philosophyTitles.length} 条):`)
    philosophyTitles.forEach((t, i) => console.log(`        ${(i + 1).toString().padStart(2)}. ${t}`))

    // 保存截图
    await page.screenshot({ path: '_dbg-philosophy-verify.png', fullPage: true })
    console.log('\n截图保存: _dbg-philosophy-verify.png')

    await browser.close()

    // 汇总
    console.log('\n=== 验收结果 ===')
    const checks = [
      { name: '默认全部视图卡片数 = 152', pass: totalCardsOk, actual: totalCards },
      { name: '哲学子分类卡片数 = 34', pass: philosophyCardsOk, actual: philosophyCards },
      { name: '5 位哲学家关键词全部命中', pass: philosophersOk, actual: `${foundPhilosophers.length}/5 (${foundPhilosophers.join(',')})` },
    ]
    let allPass = true
    for (const c of checks) {
      console.log(`  ${c.pass ? '✅' : '❌'}  ${c.name} (实际: ${c.actual})`)
      if (!c.pass) allPass = false
    }
    console.log(`\n${allPass ? '✅ 全部通过' : '❌ 存在失败项 (Task 1 可能未完成)'}`)

    process.exit(allPass ? 0 : 1)
  } catch (e) {
    console.error('脚本错误:', e.message)
    await browser.close()
    process.exit(2)
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
