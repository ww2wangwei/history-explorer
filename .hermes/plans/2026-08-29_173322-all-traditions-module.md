# 全传统（Chinese Traditions）板块实施计划

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** 在 Dashboard 引导页加一个"全传统"板块入口，进入 TraditionsOverview 子页面，按 12 个子分类（历史、家、神话、哲学、文字、文学、艺术、历法节气、礼仪制度、衣食、住行、科技）展示中国人的文化传统。

**Architecture:**
- 顶层新增一个 MainView 模式 `traditions`（与 `geography` / `mythologies` 平级），lazy import `TraditionsOverview`
- `TraditionsOverview` 复用现有 `OverviewLayout` + 子分类 tab/筛选条 + 卡片网格（沿用 MythologiesOverview 模式）
- 数据放 `src/data/traditions.ts`，按 12 个 `TraditionCategory` 分组；每条含 id / title / category / summary / era 范围 / 关键人物 / 相关朝代等
- 子分类 tab 是顶部一级导航（一期只做 12 个 chip + 全部 网格），不做详情弹窗（与 ArtsOverview/CulturesOverview 一致风格）

**Tech Stack:** React 18, TypeScript, zustand (useLearningPathStore), TailwindCSS, react-simple-maps（按需）, lucide icons（如果需要）—— 复用现有栈，无新增依赖。

---

## 现状 / 假设

### 已确认
- "引导模块" = `src/components/Dashboard.tsx`（layoutReducer 注释：home → Dashboard 学习引导）
- Dashboard 的 `PATHS` 数组（line 48-79）渲染 13 个"全xx"卡片，每个卡片点击通过 `onEnterPath(pathId)` 触发 `pathEntryToAction(pathId)` → reducer dispatch `OPEN_xxx`
- 当前 PATHS 不含"全传统"
- 现有 11 个"全xx"全部按以下模式 wiring：
  - PATHS 加 `{ id: 'allXxx', ... }`
  - `src/store/useLearningPathStore.ts:24` 的 `PathId` union 加 `'allXxx'`
  - `src/components/Layout/layoutReducer.ts`：`MainView` union 加 `{ mode: 'xxx' }`，`LayoutAction` union 加 `'OPEN_XXX'`，reducer case 加 `'OPEN_XXX': return { ...state, main: { mode: 'xxx' } }`，`pathEntryToAction` switch 加 case
  - `src/components/Layout.tsx`：lazy import `XxxOverview` + 渲染分支

### 假设
- **用户范围**：12 个子分类由用户给出，**不包含**西方内容，纯粹"中国人的传统"——每个子分类聚焦中国本土材料
- **MVP 范围**：
  - 第一阶段（本周可完成）：完成 wiring + 12 子分类 chip + "全部"网格渲染 + 数据骨架（每类 3-5 条种子数据，共约 40 条）
  - 第二阶段（后续 PR）：逐子分类补全数据、详情弹窗、人物关系图（参考 MythologyCharacterGraph）
- **不做**：
  - 跨朝代时间线过滤（参考 WarsOverview 的时间过滤是后续 PR 范围）
  - AI 对话入口（一期所有"全xx"板块都没有 AI，仅人物/穿越等有）
  - 搜索框（先做 tab 切换，未来再补）

### 工作区未提交变更
当前 `git status` 有大量未提交改动（性能优化 + 数据补全），实施前需先提交。建议作为 Plan 实施前的 task 0。

---

## 任务列表

### Task 0: 提交当前未提交的改动

**Objective:** 把上一轮"疆域变迁性能优化 + 数据补全"已落地的改动先 commit，避免后续 plan 实施时混淆 diff。

**Files:**
- Modify: `src/components/Geography/GeographyOverview.tsx` (M)
- Modify: `src/components/Geography/MarkdownText.tsx` (M)
- Modify: `src/components/Geography/TerritoryMapThumb.tsx` (M)
- Modify: `src/data/china-provinces.ts` (M)
- Modify: `src/data/empire-countries.ts` (M)
- Modify: `src/store/useHistoryStore.ts` (M)
- Add: `src/components/Geography/MarkdownImpl.tsx`
- Add: `src/components/Geography/TerritoryDetailModal.tsx`
- Add: `src/data/era-centers.ts`
- Add: `src/data/historical-capitals.ts`
- Add: `src/data/territory-files.ts`

**Step 1:** 在工作区根目录运行 `git status` 确认 11 个文件状态。

**Step 2:** `git add -A` + 提交，建议拆 3 个 commit（性能优化 / 数据提取 / 数据补全），commit message 例：
- `perf(geography): TerritoryDetailModal lazy + 拆 MarkdownImpl`
- `refactor(geography): 拆分 territory-files / era-centers / TerritoryDetailModal`
- `feat(geography): TERRITORY_FALLBACK + HISTORICAL_CAPITALS + mughal/Afghanistan 数据补全`

---

### Task 1: 数据骨架 - TraditionCategory 类型与种子数据

**Objective:** 定义 12 个子分类的枚举类型，写入约 40 条种子数据（每子分类 3-5 条）。

**Files:**
- Create: `src/data/traditions.ts`

**Step 1:** 写文件头注释，导出以下类型与常量：

```ts
/** 12 个传统子分类（与用户的"全传统"板块列表一一对应） */
export const TRADITION_CATEGORIES = [
  'history',    // 中国人的历史
  'family',     // 中国人的家
  'myth',       // 中国人的神话
  'philosophy', // 中国人的哲学
  'script',     // 中国人的文字
  'literature', // 中国人的文学
  'art',        // 中国人的艺术
  'calendar',   // 中国人的历法和节气
  'ritual',     // 中国人的礼仪与制度
  'food',       // 中国人的衣食
  'housing',    // 中国人的住行
  'tech',       // 中国人的科技
] as const
export type TraditionCategory = typeof TRADITION_CATEGORIES[number]

/** 单条传统条目 */
export interface TraditionItem {
  id: string
  category: TraditionCategory
  title: string
  summary: string           // 50-100 字摘要
  era?: string              // 主要朝代，如 "春秋战国" / "唐宋" / "先秦"
  figure?: string           // 关键人物（可选）
  imageKeyword?: string     // Bing 检索关键词（可选）
  imageUrl?: string         // 公共版权图片 URL（可选，Wikimedia Commons 优先）
}

/** 种子数据：每类 3-5 条，共约 40 条（按史实） */
export const TRADITIONS: TraditionItem[] = [
  // history (3-4)
  { id: 'tr-history-1', category: 'history', title: '春秋战国', summary: '周王室衰微，诸侯争霸 500 余年；诸子百家争鸣，奠定中华文明底色。', era: 'BC 770 ~ BC 221', imageKeyword: 'ancient warring states china' },
  { id: 'tr-history-2', category: 'history', title: '秦汉大一统', summary: '首次大一统：书同文、车同轨、行同伦；汉承秦制，独尊儒术。', era: 'BC 221 ~ AD 220' },
  { id: 'tr-history-3', category: 'history', title: '唐宋盛世', summary: '唐代开放包容，宋代文治天下；科举成熟、商业繁荣、文化达顶峰。', era: 'AD 618 ~ AD 1279' },
  { id: 'tr-history-4', category: 'history', title: '明清转型', summary: '明清专制强化、科举僵化、商品经济萌芽、西方叩关——传统社会走向近代。', era: 'AD 1368 ~ AD 1912' },
  // family (3)
  { id: 'tr-family-1', category: 'family', title: '宗法制度', summary: '嫡长子继承、大宗小宗、家谱世系——以血缘为骨架的政治伦理。', era: '西周 ~ 清' },
  { id: 'tr-family-2', category: 'family', title: '宗祠与族田', summary: '聚族而居，祠堂祭祀，族田助学——宗族自治的物质基础。', era: '宋 ~ 清' },
  { id: 'tr-family-3', category: 'family', title: '婚丧礼俗', summary: '六礼（纳采、问名、纳吉、纳征、请期、亲迎）与丧服五等——人生礼仪的礼仪传统。', era: '先秦 ~ 当代' },
  // myth (3)
  { id: 'tr-myth-1', category: 'myth', title: '盘古开天', summary: '天地混沌如鸡子，盘古生其中；一日九变，神于天，圣于地。', era: '上古神话' },
  { id: 'tr-myth-2', category: 'myth', title: '女娲造人', summary: '女娲抟黄土造人、炼石补天——母系社会的女神崇拜与灾难叙事。', era: '上古神话' },
  { id: 'tr-myth-3', category: 'myth', title: '三皇五帝', summary: '伏羲画卦、神农尝百草、黄帝战蚩尤——文明初祖的传说谱系。', era: '上古神话' },
  // philosophy (3-4)
  { id: 'tr-philosophy-1', category: 'philosophy', title: '儒家', summary: '孔子、孟子、荀子：仁义礼智，修齐治平——两千年来主流意识形态。', era: '春秋 ~ 当代' },
  { id: 'tr-philosophy-2', category: 'philosophy', title: '道家', summary: '老子、庄子：道法自然、无为而治——中华精神的另一极。', era: '春秋战国' },
  { id: 'tr-philosophy-3', category: 'philosophy', title: '佛家', summary: '汉代传入，与儒道合流形成三教合一；禅宗、宋明理学皆受其影响。', era: '汉 ~ 当代' },
  { id: 'tr-philosophy-4', category: 'philosophy', title: '诸子百家', summary: '墨、法、名、阴阳、纵横……春秋战国的思想盛宴。', era: '春秋战国' },
  // script (3)
  { id: 'tr-script-1', category: 'script', title: '甲骨文', summary: '商代契刻于龟甲兽骨——中国最早的成熟文字，也是汉字的源头。', era: '商' },
  { id: 'tr-script-2', category: 'script', title: '篆隶楷行草', summary: '从篆书到草书，汉字五体的演变折射书写工具与审美变迁。', era: '秦 ~ 当代' },
  { id: 'tr-script-3', category: 'script', title: '汉字简化', summary: '20 世纪推广简化字——千年汉字传统与现代普及的张力。', era: '近现代' },
  // literature (3)
  { id: 'tr-literature-1', category: 'literature', title: '诗经楚辞', summary: '中国文学的两大源头：黄河的现实主义与长江的浪漫主义。', era: '先秦' },
  { id: 'tr-literature-2', category: 'literature', title: '唐诗宋词', summary: '一个把诗写到极致、把词写到骨子里的时代。', era: '唐 ~ 宋' },
  { id: 'tr-literature-3', category: 'literature', title: '四大名著', summary: '《三国》《水浒》《西游》《红楼》——章回小说的巅峰。', era: '明 ~ 清' },
  // art (3)
  { id: 'tr-art-1', category: 'art', title: '山水画', summary: '从展子虞到王希孟——中国人如何用毛笔"看"山水。', era: '魏晋 ~ 当代' },
  { id: 'tr-art-2', category: 'art', title: '青花瓷', summary: '白地蓝花，从元代走向世界——陶瓷工艺的极致。', era: '元 ~ 清' },
  { id: 'tr-art-3', category: 'art', title: '园林', summary: '移步换景，咫尺山林——中国独特的空间美学。', era: '明 ~ 清' },
  // calendar (3)
  { id: 'tr-calendar-1', category: 'calendar', title: '农历（夏历）', summary: '阴阳合历：月相定月、太阳定年——指导农耕数千年。', era: '夏 ~ 当代' },
  { id: 'tr-calendar-2', category: 'calendar', title: '二十四节气', summary: '立春、惊蛰、清明……太阳在黄道上的 24 个刻度，已列入人类非遗。', era: '先秦 ~ 当代' },
  { id: 'tr-calendar-3', category: 'calendar', title: '干支纪年', summary: '天干地支 60 年一轮——纪年、纪月、纪日、纪时皆用之。', era: '殷商 ~ 当代' },
  // ritual (3)
  { id: 'tr-ritual-1', category: 'ritual', title: '科举制度', summary: '从隋唐到清末 1300 年——"朝为田舍郎，暮登天子堂"的社会流动机制。', era: '隋 ~ 清' },
  { id: 'tr-ritual-2', category: 'ritual', title: '五礼制度', summary: '吉、凶、军、宾、嘉——覆盖政治、社会、人生所有仪节。', era: '先秦 ~ 清' },
  { id: 'tr-ritual-3', category: 'ritual', title: '礼与法', summary: '"礼者禁于将然之前，法者禁于已然之后"——德治与法治的双轨。', era: '先秦 ~ 当代' },
  // food (3)
  { id: 'tr-food-1', category: 'food', title: '八大菜系', summary: '鲁川粤苏闽浙湘徽——四方水土养出四方滋味。', era: '清 ~ 当代' },
  { id: 'tr-food-2', category: 'food', title: '丝绸与棉麻', summary: '从桑蚕到棉花——中国人 5000 年的纤维革命。', era: '新石器 ~ 当代' },
  { id: 'tr-food-3', category: 'food', title: '茶', summary: '从神农尝百草到陆羽《茶经》——一片树叶如何成为国饮。', era: '唐 ~ 当代' },
  // housing (3)
  { id: 'tr-housing-1', category: 'housing', title: '四合院', summary: '北方的合院式住宅：方正对称、伦理秩序、长幼有序。', era: '元 ~ 当代' },
  { id: 'tr-housing-2', category: 'housing', title: '江南水乡', summary: '粉墙黛瓦、小桥流水——水网地带的人居智慧。', era: '明 ~ 当代' },
  { id: 'tr-housing-3', category: 'housing', title: '交通工具', summary: '舟车、轿马、独轮车、漕运——传统中国的出行图谱。', era: '先秦 ~ 清' },
  // tech (3-4)
  { id: 'tr-tech-1', category: 'tech', title: '四大发明', summary: '造纸、印刷、火药、指南针——重塑世界历史的四项技术。', era: '汉 ~ 宋' },
  { id: 'tr-tech-2', category: 'tech', title: '天文历法', summary: '从甲骨卜辞到郭守敬《授时历》——世界上连续最久的天文观测。', era: '商 ~ 元' },
  { id: 'tr-tech-3', category: 'tech', title: '中医中药', summary: '《黄帝内经》《伤寒论》、针灸、本草——以另一种方式理解人体。', era: '先秦 ~ 当代' },
  { id: 'tr-tech-4', category: 'tech', title: '水利与农业', summary: '都江堰、坎儿井、桑基鱼塘——水利工程塑造农业文明。', era: '先秦 ~ 当代' },
]
```

**Step 2:** 创建文件。

**Step 3:** `npm run lint` 确认类型通过。

---

### Task 2: Wiring - PathId + MainView + Action + reducer case

**Objective:** 把"全传统"接入现有的 5 处 wiring 点（与 `allMythologies` 同样的 pattern）。

**Files:**
- Modify: `src/store/useLearningPathStore.ts:24`
- Modify: `src/components/Layout/layoutReducer.ts`（3 处：MainView union line 30-47、LayoutAction union line 57-83、reducer case、pathEntryToAction switch）

**Step 1:** 在 `useLearningPathStore.ts` 的 PathId union 加 `'allTraditions'`：

```ts
export type PathId = '...' | 'allMythologies' | 'allTraditions'
```

**Step 2:** 在 `layoutReducer.ts` 的 `MainView` union 加：

```ts
| { mode: 'traditions' }                                       // 全传统
```

**Step 3:** 在 `LayoutAction` union 加：

```ts
| { type: 'OPEN_TRADITIONS' }
```

**Step 4:** 在 reducer switch 加 case：

```ts
case 'OPEN_TRADITIONS':
  return { ...state, main: { mode: 'traditions' } }
```

**Step 5:** 在 `pathEntryToAction` switch 加：

```ts
case 'allTraditions':
  return { type: 'OPEN_TRADITIONS' }
```

**Step 6:** `npm run lint` 确认 TS 通过。

---

### Task 3: Layout.tsx lazy import + 渲染分支

**Objective:** 在 Layout.tsx 把 TraditionsOverview 加到 lazy 导入和 renderMain() 条件分支。

**Files:**
- Modify: `src/components/Layout.tsx`（imports line 32-59、renderMain 分支 line 449 附近）

**Step 1:** 在 lazy import 块（line 32-59）添加：

```ts
const TraditionsOverview = lazy(() => import('@/components/Traditions/TraditionsOverview'))
```

**Step 2:** 在 renderMain() 内、紧跟 `MythologiesOverview` 后（line 449 附近）添加：

```tsx
{main.mode === 'traditions' && (
  <Suspense fallback={<PageFallback />}>
    <TraditionsOverview
      isActive={main.mode === 'traditions'}
      onClose={() => dispatch({ type: 'OPEN_HOME' })}
    />
  </Suspense>
)}
```

**Step 3:** `npm run lint` 确认。

---

### Task 4: TraditionsOverview 组件骨架

**Objective:** 实现可渲染的 TraditionsOverview，复用 OverviewLayout，提供 12 子分类 chip + 全部网格。

**Files:**
- Create: `src/components/Traditions/TraditionsOverview.tsx`

**Step 1:** 写文件头注释与 import（参考 MythologiesOverview 风格）：

```tsx
/**
 * TraditionsOverview — 全传统全屏浏览页
 *
 * 12 个子分类 chip + 全部卡片网格。子分类筛选。
 * 顶部 OverviewLayout + 12 chip 横排 + 卡片网格。
 * 点击卡片暂不打开详情（一期只做浏览入口，详情弹窗是后续 PR）。
 *
 * 数据：src/data/traditions.ts（TRADITIONS, TRADITION_CATEGORIES, TraditionCategory）
 */
import { useMemo, useState } from 'react'
import OverviewLayout from '@/components/ui/OverviewLayout'
import OverviewSearch from '@/components/ui/OverviewSearch'
import EmptyState from '@/components/ui/EmptyState'
import { TRADITIONS, TRADITION_CATEGORIES, type TraditionCategory } from '@/data/traditions'

interface Props {
  isActive: boolean
  onClose: () => void
}

const CATEGORY_META: Record<TraditionCategory, { icon: string; label: string; color: string }> = {
  history:    { icon: '📜', label: '历史',     color: '#c89a5b' },
  family:     { icon: '👪', label: '家',       color: '#d4856a' },
  myth:       { icon: '🐉', label: '神话',     color: '#a07050' },
  philosophy: { icon: '☯️', label: '哲学',     color: '#9b7eb6' },
  script:     { icon: '✒️', label: '文字',     color: '#5b9bc8' },
  literature: { icon: '📖', label: '文学',     color: '#c89a8a' },
  art:        { icon: '🎨', label: '艺术',     color: '#e879b9' },
  calendar:   { icon: '🌾', label: '历法节气', color: '#9bc89a' },
  ritual:     { icon: '⚖️', label: '礼仪制度', color: '#d4a85b' },
  food:       { icon: '🍚', label: '衣食',     color: '#b85450' },
  housing:    { icon: '🏯', label: '住行',     color: '#5bc89a' },
  tech:       { icon: '🔧', label: '科技',     color: '#5b9bc8' },
}

export default function TraditionsOverview({ isActive, onClose }: Props) {
  const [activeCat, setActiveCat] = useState<TraditionCategory | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TRADITIONS.filter(t => {
      if (activeCat !== 'all' && t.category !== activeCat) return false
      if (q) {
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.summary.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [activeCat, query])

  // ESC 关闭
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, onClose])

  return (
    <OverviewLayout
      emoji="🪷"
      title="全传统"
      subtitle={`${TRADITIONS.length} 项中国传统 · 12 个子分类`}
      onClose={onClose}
      toolbar={
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCat('all')}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              activeCat === 'all'
                ? 'bg-emerald-700/40 text-emerald-200 border-emerald-500/60'
                : 'bg-ink-700/60 text-ink-400 border-ink-600 hover:text-parchment-50'
            }`}
          >
            全部 <span className="text-ink-300 ml-1">({TRADITIONS.length})</span>
          </button>
          {TRADITION_CATEGORIES.map(cat => {
            const count = TRADITIONS.filter(t => t.category === cat).length
            if (count === 0) return null
            const meta = CATEGORY_META[cat]
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  activeCat === cat ? 'border-emerald-500/60' : 'bg-ink-700/60 text-ink-400 border-ink-600 hover:text-parchment-50'
                }`}
                style={activeCat === cat ? { background: meta.color + '30', color: meta.color } : undefined}
              >
                {meta.icon} {meta.label} <span className="text-ink-300 ml-1">({count})</span>
              </button>
            )
          })}
        </div>
      }
    >
      <OverviewSearch value={query} onChange={setQuery} placeholder="搜索传统条目..." />
      {filtered.length === 0 ? (
        <EmptyState message="暂无符合条件的条目" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(t => {
            const meta = CATEGORY_META[t.category]
            return (
              <div
                key={t.id}
                className="text-left rounded-lg overflow-hidden border border-ink-600 bg-ink-800/60 hover:border-emerald-500/60 hover:bg-ink-700/60 transition-all group"
                style={{ borderLeftWidth: '3px', borderLeftColor: meta.color }}
              >
                {t.imageUrl && (
                  <div className="relative w-full bg-ink-900" style={{ aspectRatio: '16/9' }}>
                    <img src={t.imageUrl} alt={t.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-transparent to-ink-900/40 pointer-events-none" />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-base font-serif group-hover:text-emerald-300 transition-colors">
                      {meta.icon} {t.title}
                    </span>
                    {t.era && (
                      <span className="text-xs text-ink-300 tabular-nums shrink-0">{t.era}</span>
                    )}
                  </div>
                  <div className="text-xs text-ink-300 leading-relaxed line-clamp-3">{t.summary}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </OverviewLayout>
  )
}
```

**Step 2:** `npm run lint` 确认。

---

### Task 5: Dashboard PATHS 添加"全传统"

**Objective:** 在 PATHS 数组加新一项，让 FilmstripGallery 渲染新卡片。

**Files:**
- Modify: `src/components/Dashboard.tsx`（PATHS 数组 line 48-79）

**Step 1:** 在 PATHS 数组末尾（line 78 之后、line 79 `]` 之前）添加：

```ts
{ id: 'allTraditions', icon: '🪷', title: '全传统', desc: '12 个子分类 · 中国人的历史、家、神话、哲学、文字、文学、艺术、历法节气、礼仪制度、衣食住行、科技', color: '#d4856a', imageKeyword: 'chinese tradition culture scroll painting', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Zhang_Yimou%2C_Jiang_Wen_and_Zhang_Ziyi_-_Beijing_Opera.jpg/1280px-Zhang_Yimou%2C_Jiang_Wen_and_Zhang_Ziyi_-_Beijing_Opera.jpg' }, // 待替换为更合适的图
```

> 注：imageUrl 占位用 Wikimedia 公共版权图。后续可换为更贴切的"中国传统"主题图（如清明上河图局部 / 故宫一角 / 园林）。

**Step 2:** 同时更新顶部"13 板块"文案（line 317）：

```tsx
<span className="text-xs text-ink-400 font-brush tracking-widest">14 板块</span>
```

**Step 3:** `npm run lint` 确认。

**Step 4:** （可选） `npm run build` 确认产物。

---

### Task 6: 视觉验证

**Objective:** 在 Playwright headless 里跑一遍，确认卡片渲染、筛选、关闭都正常。

**Files:**
- Create: `tests/verify-traditions.mjs`

**Step 1:** 写脚本（参考 `tests/verify-labels.mjs` 的模式）：

```js
import { chromium } from 'playwright'
const BASE = 'http://localhost:5173/history/'
async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  // 在 Dashboard 应能看到 14 张 Filmstrip 卡（包括新加的"全传统"）
  // 找 "全传统" 卡，点击
  await page.locator('text=全传统').first().click()
  // 等 TraditionsOverview 渲染
  await page.waitForSelector('[role="dialog"], main', { timeout: 5000 }).catch(() => {})
  // 截图
  await page.screenshot({ path: '_dbg-traditions.png' })
  // 验证 12 个 chip 渲染
  const chipCount = await page.locator('text=/历史|家|神话|哲学|文字|文学|艺术|历法|礼仪|衣食|住行|科技/').count()
  console.log('chip matches:', chipCount)
  // 验证 ESC 关闭
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  const dialogStill = await page.evaluate(() => !!document.querySelector('[role="dialog"]'))
  console.log('ESC closed:', !dialogStill)
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
```

**Step 2:** `node tests/verify-traditions.mjs`，期望：
- "chip matches" >= 12
- "ESC closed: true"

---

### Task 7: 数据补全 + 详情弹窗（后续 PR 标记，不在本计划执行）

**Objective:** 一期只做"入口 + 浏览"。"逐子分类补全数据 + 详情弹窗"作为下一轮 plan。

**Files:** 待定

**不在本次范围内**，但保留 plan 路径：
- Task 7.1: 把每个子分类补到 8-12 条高质量条目
- Task 7.2: 增加 TraditionDetailDialog（参考 MythologyDetailDialog / CultureOverview 的 dialog 模式）
- Task 7.3: 用 useLearningPathStore 记录已访问 id
- Task 7.4: 跨子分类交叉关联（"哲学 → 儒 → 相关人物 → 跳到全人物"）

---

## 风险与权衡

1. **数据质量 vs 范围**：一期 40 条种子数据可能"看着不全"——但 MVP 优先验证 wiring + 视觉，后续按子分类 PR 补全
2. **PATHS 已 13 项**，加 14 项后 FilmstripGallery 横向拥挤——评估是否需要分组或换"次路径"区（用户感知）
3. **图片占位**：imageUrl 临时用 Wikimedia 图——若不符合主题会显得突兀；或改为不显示图只显示 emoji + 文字
4. **`History` 与已有"朝代时间线"重叠**：用户在"全传统"列了"中国人的历史"——和已有"朝代时间线 / 全战争"内容有部分交叉。处理：在 TraditionsOverview 里保留"历史"分类但 summary 偏文化而非政治军事
5. **未来扩展**：如需做"详情弹窗"，跟 MythologiesOverview 一样复杂（dialog + MarkdownText + 相关朝代引用）—— 评估用户期望后决定优先级

## 开放问题（无需在实施前回答，PR review 时讨论）

- "全传统"是否进 MAIN_PATHS（顶部 4 列大卡）？目前 4 列已是 timeline/全人物/穿越/天梯——加进来会变成 5 列；建议先放在 MORE_PATHS，让用户主动探索
- 历法节气与时令是否要单独做一个"今日节气"小卡片在 Dashboard 顶部？— 后续 PR
- 是否有"季节性高亮"（春分/冬至临近时高亮对应条目）？— 后续 PR

## 验证清单（实施完成后）

- [ ] `npm run lint` 通过
- [ ] `npm run build` 通过
- [ ] Dashboard 显示 14 张 Filmstrip 卡，"全传统"在期望位置
- [ ] 点击"全传统"进入 TraditionsOverview，12 chip 渲染正确
- [ ] 全部 chip 显示 40 条网格；单类 chip 切到该类子集
- [ ] ESC 关闭回到 Dashboard
- [ ] 慢网络下 Suspense fallback 显示正常
- [ ] Task 0 已提交（避免未提交改动堆积）