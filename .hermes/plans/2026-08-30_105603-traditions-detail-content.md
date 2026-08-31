# 全传统板块·条目的"具体内容"落地计划

**Goal:** 让 Traditions 板块每条条目点击后都能展示完整的弹窗内容；先把数据扩到"可看"，再补 UI 弹窗。

**Architecture:**
- 数据层：`src/data/traditions.ts` — 359 条种子，summary 平均 23 字（目标 60-80），fullContent 平均 126 字（目标 200-300）。分 12 个子分类，分批重写。
- UI 层：`src/components/Traditions/TraditionsOverview.tsx` — 当前只有卡片网格，**没有任何弹窗逻辑**，需新增"点击卡片 → 详情 Modal"。
- Modal：`src/components/ui/Modal.tsx`（已是 ModalShell，纯 CSS/Escape 关闭/焦点管理完备），直接复用。

**Tech Stack:** React 18 + TypeScript + TailwindCSS（项目内 import 风格）。不引入新依赖。

---

## 现状盘点（实测 2026-08-30 10:55）

### 数据层 `src/data/traditions.ts`（425 行，359 条已含 `fullContent`）

| 子分类 | 条数 | summary 平均字 | fullContent 平均字 |
|---|---|---|---|
| history | 30 | 28 | 137 |
| geography-regional | 30 | 28 | 159 |
| myth | 27 | **24** | **99**（最短） |
| philosophy | 30 | 25 | 119 |
| script | **29** | 25 | 117 |
| literature | 30 | 21 | 115 |
| art | 31 | 24 | 125 |
| calendar | 30 | 20 | 105 |
| ritual | 30 | 26 | 127 |
| food | 30 | 22 | 125 |
| housing | 30 | 25 | 129 |
| tech | **32** | 24 | 148 |

- `summary` 在 359 条中 162 条 < 30 字，最大宗短摘要。
- `fullContent` 在 359 条中 20 条 < 100 字（最弱是 `tr-myth-shennong` 83 字、`tr-cal-hanlu` 85 字）。
- 字段齐全度：title/summary/era/imageKeyword/fullContent 全部 100% 覆盖；figure 仅 14 条（可选）；imageUrl 0 条（用户历史偏好 Wikimedia 公共版权，可选补）。
- `script` 子分类缺 2 条（计划 31/实际 29），`myth` 缺 3 条（计划 30/实际 27）。

> **历史偏好（用户记忆）：** traditions 数据惯例：每条 id/category/title/**summary(40-60字)**/**era/imageKeyword(英文)/fullContent(100-200字, 弹窗用)**。本次扩写 summary 到 60-80、fullContent 到 200-300。

### UI 层 `src/components/Traditions/TraditionsOverview.tsx`（161 行）

- 已有：12 chip（按子分类筛选 + 全部）、搜索框、卡片网格（背景图 + 标题 + summary 显示）。
- **没有 onClick 事件**，没有 Modal 组件 import，没有弹窗 state。
- 旁边的 `OverviewLayout` / `OverviewSearch` / `EmptyState` 都是受控 UI 组件，无 modal hook。

### Modal 公共组件 `src/components/ui/Modal.tsx`

- 已实现 ModalShell：role="dialog"、aria-modal="true"、Escape 关闭、焦点进入/返还。
- 100% CSS，零依赖。直接 `import ModalShell from '@/components/ui/Modal'` 即可。

---

## 工作分块

### Phase A — UI 弹窗（首要，不依赖数据再丰富）

**A1. 给 TraditionsOverview 加弹窗渲染**

- 新增 state：`const [selectedId, setSelectedId] = useState<string | null>(null)`
- 卡片 `<div>` 加 `onClick={() => setSelectedId(t.id)}`、`cursor-pointer`、hover transition 微调（缩放 / 边框）
- 新增 `<ModalShell isOpen={!!selectedId} onClose={() => setSelectedId(null)} ariaLabel={`${selected?.title} · 详情`}>` 块
- 弹窗内容布局：标题 + 子分类徽章 + era + imageKeyword 对应的 bingImage 顶图 + fullContent 完整正文（不再 line-clamp-2）
- Esc 键已由 ModalShell 处理，但页面 Esc 会触发 `onClose` 关闭整个全屏组件；要让 ModalShell 的 e.stopPropagation() 生效（已实现，见 Modal.tsx L42-49）
- 弹窗底部可加"关闭"按钮兜底

**Files:**
- Modify: `src/components/Traditions/TraditionsOverview.tsx`（预计 +60 行）

**验证:**
- `npm run lint` 0 error
- 手动：开 Dashboard → Traditions → 点任一卡片 → 弹窗 → summary + fullContent 全部展示 → ESC 关闭

**风险:**
- Modal 嵌套在 OverviewLayout 内，可能出现 z-index 冲突（ModalShell 自带 `z-50`，OverviewLayout 也要检查）
- 大屏滚动锁：目前 OverviewLayout 已支持 ESC 关闭全屏，需确保弹窗打开时不要同时响应外层 ESC → 让 ModalShell `e.stopPropagation()` 兜底

---

### Phase B — 数据层扩写（按 12 子分类分批）

每个子分类扩写策略：**保留现有条目**，只改 `summary` 和 `fullContent` 字段。

| Task | 子分类 | 条数 | 预计行数 | 验收 |
|---|---|---|---|---|
| B1 | history | 30 | ~30 | summary ≥ 50、fullContent 200-300 |
| B2 | geography-regional | 30 | ~30 | 同上 |
| B3 | myth | 27 | ~27 | 重点（最短） |
| B4 | philosophy | 30 | ~30 | 同上 |
| B5 | script | 29 | ~29 | 同上 |
| B6 | literature | 30 | ~30 | 同上 |
| B7 | art | 31 | ~31 | 同上 |
| B8 | calendar | 30 | ~30 | 同上 |
| B9 | ritual | 30 | ~30 | 同上 |
| B10 | food | 30 | ~30 | 同上 |
| B11 | housing | 30 | ~30 | 同上 |
| B12 | tech | 32 | ~32 | 同上 |

每个 Task 的固定步骤：

1. 用 Python 脚本读取 traditions.ts，定位子分类的所有条目
2. 人工 / AI 改写 summary → 60-80 字（中文）
3. 改写 fullContent → 200-300 字（中文，含历史背景 / 文化意义 / 关键细节）
4. 用 `patch` 工具按 id 单条替换；或写 Python `replace_one_by_one` 工具脚本批量替换
5. 跑 `npm run lint`
6. 跑自查脚本：每子分类 summary 平均 ≥ 50、fullContent 平均 ≥ 200、最小 ≥ 150

**Tools used:**
- `terminal` 跑 npm
- `read_file` / `patch` 改 tradition.ts
- 临时 Python 脚本做 diff & 统计（read+write_file）

**为什么不全量一次性 patch：**
1. patch 不能批量匹配（每次只能 unique 字符串）
2. 多条条目字段结构相似但内容不同，patch 容易窜
3. 用户偏好"高频次、单一字段修改"，分批好审查

**字段更新模板（target）：**

```
summary: <60-80 字中文摘要，开头一句点题；二三句说明意义。风格延续项目惯例：shorthand — 结尾风格。
fullContent: <200-300 字中文，正文段落式；交代起源/年代/人物/影响；不列表化，与现有 fullContent 节奏一致。>
```

**Acceptance 每个 Task:**
- summary 均值 ≥ 50
- fullContent 均值 ≥ 200，最小 ≥ 150，最大 ≤ 320
- `npm run lint` 通过
- 该子分类条目数不变（history 30 不变；只改字段，不增删）

---

### Phase C — 数据缺口补齐（可选，用户确认后）

> 当前 359 条，script 缺 2、myth 缺 3、tech 已 32 但计划标题写"扩展到 32 条"实际已达标。是否补要问用户。

| 子分类 | 当前 | 目标 | 缺额 |
|---|---|---|---|
| script | 29 | 31 | 2 |
| myth | 27 | 30 | 3 |

补条目流程同历次扩展（参考 .hermes/plans/2026-08-29_190000-script-31.md）：
1. 用用户给的目录截图（如没有，AI 参照现有条目风格推 30 候选标题）
2. 用户勾确认
3. 按过往规范写 5-10 条 / Round

---

## 验证策略

| 阶段 | 命令 | 期望 |
|---|---|---|
| 任何修改后 | `cd "E:/我的项目/历史软件" && npm run lint` | exit 0 |
| 任何修改后 | `cd "E:/我的项目/历史软件" && npx tsc --noEmit -p tsconfig.json` | exit 0 |
| 数据扩展后 | 自写 scripts/check_traditions.py | 全部子分类 summary ≥50、fullContent ≥150 |
| 手动 | 启动 dev server，点 Traditions chip → 点卡片 → 看弹窗 | fullContent 全部展示；ESC 关 |

---

## 风险与权衡

1. **弹窗与原 Overview z-index：**
   - ModalShell `z-50`，OverviewLayout 自带 `z-40`（待确认）；若冲突，ModalShell 提到 z-[60]。
2. **大屏 ESC 关闭全屏：**
   - 用户在 ModalShell 已 `e.stopPropagation()`，但 capture 阶段拦截需冒泡到顶层再处理，OK。
3. **fullContent 风格一致性：**
   - 历史派别：偏"知识小百科"——一眼讲故事、有具体年号/人物/术语。AI 重写易退化为空泛"重要""影响深远"。每个 Task 跑完后人工抽 5 条 review。
4. **数据量大：** 12 个子分类 × 30 条 ≈ 360 条改写，每条要写 200-300 字 fullContent = 一次性输出 ~80K 字符；要分多 Round 跑，避免一次性请求 OOM。
5. **图像：** 用户偏好 imageUrl 走 Wikimedia Commons（"四百年后还能用"），本次 plan 不强制补 imageUrl（已有 imageKeyword + bing 兜底），如有需要单独 Round 加。

---

## 不在本次范围

- TraditionsOverview 不做 master-detail 重构（沿用弹窗模式，与现有 ModalShell 一致）
- 不做 scenario integration / 跳转路径
- 不重写 traditions.ts 类型（schema 已稳定）
- 不动 traditions 子分类（不增删）

---

## 执行策略建议

按 **A1 → B*（12 个子分类，每个独立 Task） → C*（按需）** 顺序。每次只动一类，避免占满 context。

Task 模板（每个 B 任务 5 步）：

```
### Task B1: history 子分类 summary+fullContent 扩写
**Files:** Modify src/data/traditions.ts (history 段，30 条)
**Steps:**
1. 读 traditions.ts 当前 history 子分类条目
2. AI 重写每条 summary (60-80字)、fullContent (200-300字)
3. 按 id 一对一 patch 替换（先 summary，再 fullContent；或合并一次）
4. 跑 npm run lint
5. 跑检查脚本验证
**Commit:** feat(traditions): history 子分类条目内容扩写
```

**"Plan complete and saved."**
