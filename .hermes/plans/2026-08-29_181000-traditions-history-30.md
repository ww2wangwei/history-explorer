# 全传统板块二期·历史子分类实施计划

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** 把"中国人的历史"子分类从 4 条扩展到 30+ 条（基于《半小时漫画中国史》目录风格），保留其他 11 个子分类不变。

**Architecture:**
- 仅修改 `src/data/traditions.ts` 的 `history` 类目条目
- 每条加 `era` 字段（年代范围）+ `summary` 50-100 字 + `fullContent` 100-300 字（弹窗用）+ `imageKeyword`（Bing 检索）
- 标题保留书的原标题（如"春秋"、"战国"、"炎黄子孙"），summary 用书的副标题 + 自己的总结
- 风格：青少年轻历史读物（不是学术论文），符合用户提供的目录风格

**Tech Stack:** 复用现有栈（React + TypeScript + TailwindCSS + bingImage）

---

## 现状

### 已完成（一期 commit `50d75cf` + `087425e`）
- `src/data/traditions.ts`：12 子分类 + 39 条种子数据
- `src/components/Traditions/TraditionsOverview.tsx`：12 chip + 39 卡片 + 背景图 fallback
- Dashboard Filmstrip "全传统"卡入口

### 当前"历史"子分类（4 条）
- `tr-history-1` 春秋战国 / "周王室衰微，诸侯争霸 500 余年"
- `tr-history-2` 秦汉大一统 / "首次大一统"
- `tr-history-3` 唐宋盛世 / "科举成熟、商业繁荣"
- `tr-history-4` 明清转型 / "专制强化、西方叩关"

### 目标（30 条新数据）
按《半小时漫画中国史》目录两页的朝代/主题顺序，覆盖从远古（8000 年前）到清末（1912）。每个条目以书中的小标题为主标题，summary 用书的副标题 + 自己的总结，fullContent 写 100-300 字详细描述。

---

## 任务列表

### Task 1: 历史子分类数据补全（30 条）

**Objective:** 在 `src/data/traditions.ts` 的 `history` 类目下，按《半小时漫画中国史》目录两页顺序，新增 26 条数据（与现有 4 条合计 30 条），加 era + fullContent + imageKeyword 字段。

**Files:**
- Modify: `src/data/traditions.ts`

**Step 1:** 先确认现有 4 条哪些保留、哪些替换为新目录条目：

- 保留：`tr-history-2` 秦汉大一统、`tr-history-3` 唐宋盛世、`tr-history-4` 明清转型（这些是综合主题，与新目录的"秦朝/汉朝/唐朝/宋朝/明朝/清朝"不冲突）
- 替换：`tr-history-1` 春秋战国 → 拆成新目录的"春秋" + "战国"两条
- 新增：30 - 4 = 26 条新条目

**Step 2:** 按下面两页顺序，逐条添加数据到 history 类目：

#### 第 1 页（远古-西周，8000 年前 → BC 770）— 13 条

| id | title | summary (40-60字) | era |
|---|---|---|---|
| tr-history-intro | 引子 | 8000 多年前的"擀面杖" — 远古人类最早的研磨工具，文明的起点。 | '8000 BC 前' |
| tr-history-yanying | 炎黄子孙 | 为什么我们都是炎黄子孙？传说中两个部落联盟奠定了华夏族群基础。 | '约 BC 5000' |
| tr-history-dongyi | 东夷人 | 6500 多年前的"山东人" — 东部沿海的史前文化先民，与海岱文明密切相关。 | '约 BC 4500' |
| tr-history-miaoyao | 苗瑶人 | 5000 多年前的"两湖人" — 长江中游的史前族群，后部分南迁为苗瑶等民族。 | '约 BC 3000' |
| tr-history-liangzhu | 良渚人 | 5000 多年前的"江南人" — 长江下游玉器文明，神徽与水利工程震惊世界。 | '约 BC 3300-2300' |
| tr-history-hongshan | 红山人 | 5000 多年前的红山"老住户" — 西辽河流域玉龙女神庙，开启北方文明。 | '约 BC 4700' |
| tr-history-shimao | 石峁古城 | 4000 多年前的"石头王国" — 陕西神木发现的史前最大城址，皇权雏形。 | '约 BC 2300-1800' |
| tr-history-yaoshunyu | 尧舜禹 | 传说中的上古帝王 — 禅让制与世袭制的交替，部落联盟向国家过渡。 | '约 BC 2300' |
| tr-history-xia | 夏朝 | 拥有"黑科技"的"内向"王朝 — 中国第一个王朝，二里头遗址揭示青铜文明。 | 'BC 2070-1600' |
| tr-history-shang | 商朝 | 打打杀杀的王朝 — 商汤伐桀、盘庚迁殷、妇好征羌，甲骨文与青铜器鼎盛。 | 'BC 1600-1046' |
| tr-history-shu | 神秘的古蜀人 | 一群沉迷于和老祖宗沟通的人 — 三星堆、金沙遗址，出土青铜神树与面具。 | '约 BC 1700-1200' |
| tr-history-zhou | 周人 | 一群来自大西北的种田能手 — 周族崛起于渭水流域，农牧混合经济。 | '约 BC 1100' |
| tr-history-xizhou | 西周 | 开始讲"礼"的时代 — 分封制、宗法制、礼乐文明奠定中华秩序。 | 'BC 1046-771' |

#### 第 2 页（春秋-清朝，BC 770 → 1912）— 17 条

| id | title | summary | era |
|---|---|---|---|
| tr-history-chunqiu | 春秋 | "礼仪第一，争霸第二"的时代 — 周王室衰微，诸侯会盟争霸。 | 'BC 770-476' |
| tr-history-zhanguo | 战国 | "不是你死，就是我亡"的时代 — 七雄并立，变法图强。 | 'BC 475-221' |
| tr-history-qinren | 秦人 | "一统天下"的竟然是一群养马人 — 秦族崛起于陇西，牧马立国。 | '约 BC 900-221' |
| tr-history-qin | 秦朝 | 秦始皇的"大机器" — 书同文、车同轨、行同伦、法家治国。 | 'BC 221-206' |
| tr-history-han | 汉朝 | "长寿"的汉王朝 — 文景之治、汉武盛世、独尊儒术。 | 'BC 202-AD 220' |
| tr-history-sanguo | 三国时期 | 不稳定的"三足鼎立" — 魏蜀吴三分天下，英雄与谋略的时代。 | 'AD 220-280' |
| tr-history-beichao | 五胡十六国与北朝 | 少数民族入主中原 — 匈奴、鲜卑、羯、氐、羌建立北方政权。 | 'AD 304-589' |
| tr-history-nanbeichao | 东晋与南朝 | 流水的皇帝，铁打的世家 — 门阀士族与皇权共治南方。 | 'AD 317-589' |
| tr-history-sui | 隋朝 | "来也匆匆，去也匆匆"的朝代 — 短暂但结束分裂，开皇之治。 | 'AD 581-618' |
| tr-history-tang | 唐朝 | 自信、从容的朝代 — 贞观之治、开元盛世，开放包容的国际时代。 | 'AD 618-907' |
| tr-history-wudai | 五代十国 | 千万不要穿越的朝代 — 短短 53 年五代更迭、十国分立。 | 'AD 907-979' |
| tr-history-song | 宋朝 | 文科第一名，打仗不太行 — 商业繁荣、文化巅峰、武力疲弱。 | 'AD 960-1279' |
| tr-history-yuan | 元 | 草原战斗民族的天下 — 蒙古铁骑横扫欧亚，疆域空前。 | 'AD 1271-1368' |
| tr-history-yuanhou | 元之后的蒙古人 | 哪儿来的，回哪儿去了吗？ — 北元与鞑靼、瓦剌的分化。 | 'AD 1368-17世纪' |
| tr-history-ming | 明朝 | 古怪皇帝一箩筐 — 朱元璋废丞相、郑和下西洋、崇祯自缢。 | 'AD 1368-1644' |
| tr-history-nvzhen | 女真人入主中原 | 女真人从哪儿来？ — 建州女真崛起，建立后金→清。 | 'AD 1616-1644' |
| tr-history-qing | 清朝 | 全面"打补丁"的王朝 — 康乾盛世后鸦片战争、戊戌变法、辛亥革命。 | 'AD 1644-1912' |

**Step 3:** 实施细节：

1. **删除**现有 `tr-history-1`（"春秋战国"），因为新数据里拆成"春秋"和"战国"两条
2. **保留**`tr-history-2/3/4`（秦汉大一统 / 唐宋盛世 / 明清转型）——这些是综合主题，与新目录的"秦朝/汉朝"等不冲突
3. **新增**26 条按上表

**Step 4:** 每条数据必须包含的字段：
- id, category: 'history', title, summary, era
- fullContent：100-300 字，**比 summary 详尽**（弹窗主要看这个）
- imageKeyword：Bing 检索用英文短语（如 'xia dynasty bronze erlitou'、'qin dynasty terracotta'、'tang dynasty changan'）

**Step 5:** `npm run lint` 通过。

**Acceptance:**
- `src/data/traditions.ts` 总条数 ≥ 28（39 - 3 删除 + 30 新增 = 66；但保留 3 条旧的综合主题）
- "history" 类目条数 ≥ 28（30 新条目；旧"秦汉大一统/唐宋盛世/明清转型"归入综合主题，可保留或删除）
- 所有 history 条目都有 `summary` 和 `era`，≥ 80% 有 `fullContent` 和 `imageKeyword`

---

### Task 2: 实测验证

**Objective:** 用 Playwright 验证 history 子分类有 30+ 条，渲染正确。

**Files:**
- Create: `tests/verify-traditions-history.mjs`

**Step 1:** 写验证脚本：

```js
import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5173/history/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)
await page.keyboard.press('Space')
await page.waitForTimeout(2500)

// 进全传统
await page.locator('text=全传统').first().click()
await page.waitForSelector('text=主要诸侯国都邑', { timeout: 5000 }).catch(() => {})
await page.waitForTimeout(2500)

// 默认"全部"视图, 数卡片总数
const totalCards = await page.evaluate(() => document.querySelectorAll('[role="button"][class*="cursor-pointer"]').length)
console.log(`默认全部视图卡片数: ${totalCards}`)  // 期望 >= 60

// 点"历史" chip 筛选
await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('历史') && b.textContent?.includes('('))
  if (btn) btn.click()
})
await page.waitForTimeout(500)
const historyCards = await page.evaluate(() => document.querySelectorAll('[role="button"][class*="cursor-pointer"]').length)
console.log(`历史子分类卡片数: ${historyCards}`)  // 期望 >= 28

// 验证 history 卡片标题含 "春秋"、"秦"、"清" 等
const titles = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[role="button"]'))
    .map(b => b.textContent?.split(' ').slice(-2)[0])
    .filter(Boolean)
    .slice(0, 10)
})
console.log('部分历史卡片标题:', titles)

await browser.close()
```

**Step 2:** 跑测试，期望：
- 总卡片数 ≥ 60
- 历史子分类卡片数 ≥ 28
- 标题包含"春秋"、"秦"、"唐"、"清"等朝代名

**Step 3:** 跑 `npm run build` 确认产物 OK。

**Step 4:** `git add src/data/traditions.ts tests/verify-traditions-history.mjs && git commit -m "feat(traditions): 历史子分类扩展到 30 条"`

---

## 风险与权衡

1. **数据编写工作量**：30 条 × 200 字 = 6000 字内容，工作量大；可委托 subagent 编写 + 人工审阅
2. **历史准确性**：每条 era 必须精确，summary 要符合史实（避免 AI 编造）—— 用户提供的目录风格可作为参考
3. **fullContent 质量**：弹窗的核心内容，100-300 字要"读起来有信息量"，不能凑字数
4. **图片检索**：imageKeyword 选英文短语，Bing 缩略图主题匹配度依赖关键词质量
5. **现有 4 条处理**：保留综合主题（秦汉大一统 / 唐宋盛世 / 明清转型），删除"春秋战国"（已拆分为新两条）

## 开放问题（实施时决定）

- **是否在 history 类目里**保留旧 4 条？保留 3 条综合主题 + 删除"春秋战国"，新加 30 条 → 历史类目共 33 条
- **fullContent 长度**：写 150 字（中等）还是 250 字（详细）？— 倾向 150 字，一期可读性好
- **图片策略**：要不要每条配 imageUrl（Wikimedia 公共版权图）？— 暂用 bingImage fallback，留三期人工挑图

## 验证清单（实施完成后）

- [ ] `npm run lint` 通过
- [ ] `npm run build` 通过
- [ ] traditions.ts 中 "history" 类目条数 ≥ 28
- [ ] 全传统页面默认视图卡片总数 ≥ 60
- [ ] 历史 chip 筛选后卡片数 ≥ 28
- [ ] 所有 history 条目至少含 id/category/title/summary/era
- [ ] ≥ 80% history 条目有 fullContent（弹窗用）
- [ ] 所有 history 条目有 imageKeyword（Bing 检索图）
