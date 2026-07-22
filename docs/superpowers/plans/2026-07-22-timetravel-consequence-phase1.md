# 「穿越历史」后果系统 · 阶段1(引擎 + 玄武门试点)实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为「穿越历史」实现双值对立 + 象限结局的后果系统引擎,并给「玄武门之变」配好数据作为试点;其余剧本无 stats 字段时自动回退旧逻辑。

**Architecture:** 在 `ScenarioPlayer.tsx` 内维护两个状态值(useState),选项携带 `effects` 改变数值并飘字反馈;顶部常驻 `StatBar` 双值进度条;走到最终场景时按两值高低组合成象限(HH/HL/LH/LL),匹配对应 `quadrant` 结局。数据结构在 `scenarios.json` 纯增量扩展。无 `stats` 的剧本走现有 `choice.next→ending` 直连逻辑(向后兼容)。

**Tech Stack:** React 18 + TypeScript + Tailwind。无单元测试框架 —— 验证方式为 `npx tsc --noEmit`(0 错误)+ `npm run build`(成功)+ 浏览器实玩验证。

**验证约定:** 每个 Task 后运行 `cd /f/历史软件 && npx tsc --noEmit && npm run build`,期望 tsc 0 错误、build 成功。

---

## 数据设计(玄武门之变)

**双值**:⚔️ 兵权(power,init 3,max 10)/ ❤️ 人心(heart,init 5,max 10)

**选项 effects 映射**(基于现有场景/选项 id):
| 场景 | 选项 | text 摘要 | effects |
|---|---|---|---|
| s1 | c1a | 下定决心伏兵 | power +3, heart -1 |
| s1 | c1b | 犹豫禀明父皇 | (即时失败,不改值)→ ending_inaction |
| s1 | c1c | 公开讨论 | (即时失败)→ ending_collapse |
| s1b_army | c1ba | 亲自伏击 | power +2, heart -1 |
| s1b_army | c1bb | 坐镇指挥 | power +1, heart +1 |
| s2 | c2a | 亲自射杀建成 | power +2, heart -2 |
| s2 | c2b | 尉迟敬德执行 | power +1, heart -1 |
| s2 | c2c | 尝试活捉劝降 | (即时失败)→ ending_compassion_dead |
| s3 | c3a | 带兵逼父皇下诏 | power +2, heart -1 |
| s3 | c3b | 跪哭父皇 | power -1, heart +3 |
| s3 | c3c | 秘不发丧称帝 | power +2, heart -3 |

**最终场景 s4 的象限结局**(两值 ≥5 为高 H,<5 为低 L):
| 象限 | 含义 | 结局 |
|---|---|---|
| HH | 兵权高+人心高 | `ending_emperor`(贞观之治,复用现有,isWin=true) |
| HL | 兵权高+人心低 | `ending_tyrant`(**新增**:铁腕夺位·猜忌之主,isWin=false-ish) |
| LH | 兵权低+人心高 | `ending_fragile`(**新增**:众望所归但根基不稳,isWin=false-ish) |
| LL | 兵权低+人心低 | `ending_collapse`(复用现有崩溃结局,isWin=false) |

即时失败结局(inaction/collapse/compassion_dead)保留原样,由特定选项直接触发,不经象限。

---

## 文件结构

| 文件 | 职责 | 改动 |
|---|---|---|
| `src/components/TimeTravel/StatBar.tsx` | 双值状态栏展示组件(纯展示) | 新建 |
| `src/components/TimeTravel/ScenarioPlayer.tsx` | 状态值逻辑、effects 应用、飘字、象限判定、回退 | 修改 |
| `src/data/scenarios.json` | 玄武门加 stats/effects/quadrant + 2 新结局 | 修改 |

---

## Task 1: 类型定义扩展

**Files:**
- Modify: `src/components/TimeTravel/ScenarioPlayer.tsx`(interface Scene / Scenario,约 39-79 行)

- [ ] **Step 1: 扩展 Scene.choices 和 Scenario 的类型**

在 `ScenarioPlayer.tsx` 顶部的 interface 中新增字段(全部可选,保证向后兼容)。

`Scene['choices']` 数组元素类型中加 `effects`:
```typescript
  choices: Array<{
    id: string
    text: string
    next: string
    outcome?: string
    historicalNote?: string
    effects?: Record<string, number>  // 新增:选项对状态值的增减
  }>
```

`Scenario` 接口加 `stats`:
```typescript
interface StatDef {
  id: string
  name: string
  emoji: string
  init: number
  max: number
}
```
并在 `Scenario` 接口内加:
```typescript
  stats?: { a: StatDef; b: StatDef }
```

`Scenario['endings']` 元素加 `quadrant`:
```typescript
  endings: Array<{
    id: string
    title: string
    text: string
    isWin: boolean
    historicalReality: string
    lessons: string[]
    quadrant?: 'HH' | 'HL' | 'LH' | 'LL'  // 新增:象限映射
  }>
```

- [ ] **Step 2: 验证**

Run: `cd /f/历史软件 && npx tsc --noEmit`
Expected: 0 错误(纯类型新增,不影响现有代码)。

- [ ] **Step 3: Commit**

```bash
cd /f/历史软件
git add src/components/TimeTravel/ScenarioPlayer.tsx
git commit -m "feat(timetravel): 后果系统类型定义(stats/effects/quadrant)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: StatBar 双值状态栏组件

**Files:**
- Create: `src/components/TimeTravel/StatBar.tsx`

- [ ] **Step 1: 新建 StatBar.tsx**

创建文件,内容如下。展示两个值的进度条 + emoji + 数字,高值(≥max*0.7)加金色辉光,危险低值(≤max*0.2)加红色警示。纯展示组件,值由父组件传入。

```tsx
/**
 * StatBar — 穿越历史双值状态栏
 * 两个互相拉扯的状态值(如 兵权/人心),常驻场景顶部。
 */
interface StatDef {
  id: string
  name: string
  emoji: string
  init: number
  max: number
}

interface Props {
  statA: StatDef
  statB: StatDef
  valueA: number
  valueB: number
  color: string
}

function OneStat({ def, value, color }: { def: StatDef; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / def.max) * 100))
  const high = value >= def.max * 0.7
  const danger = value <= def.max * 0.2
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-parchment-100 flex items-center gap-1">
          <span>{def.emoji}</span>
          <span className="font-serif">{def.name}</span>
        </span>
        <span
          className={`tabular-nums font-serif ${danger ? 'text-danger' : high ? 'text-bronze-300' : 'text-parchment-100'}`}
        >
          {value} / {def.max}
        </span>
      </div>
      <div className="h-2 rounded-full bg-ink-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: danger ? '#b85450' : color,
            boxShadow: high ? `0 0 8px ${color}` : danger ? '0 0 8px #b85450' : 'none',
          }}
        />
      </div>
    </div>
  )
}

export default function StatBar({ statA, statB, valueA, valueB, color }: Props) {
  return (
    <div className="mb-5 p-3 rounded-lg bg-ink-800/70 border border-ink-700 flex items-center gap-5">
      <OneStat def={statA} value={valueA} color={color} />
      <div className="w-px h-8 bg-ink-600 shrink-0" />
      <OneStat def={statB} value={valueB} color={color} />
    </div>
  )
}
```

- [ ] **Step 2: 验证**

Run: `cd /f/历史软件 && npx tsc --noEmit && npm run build`
Expected: 0 错误;build 成功。(组件未被引用不影响构建,下一 Task 接入。)

- [ ] **Step 3: Commit**

```bash
cd /f/历史软件
git add src/components/TimeTravel/StatBar.tsx
git commit -m "feat(timetravel): 新增双值状态栏组件 StatBar

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: ScenarioPlayer 接入状态值 —— state 初始化 + StatBar 渲染

**Files:**
- Modify: `src/components/TimeTravel/ScenarioPlayer.tsx`

- [ ] **Step 1: 加状态值 state + import StatBar**

在 import 区(CharacterAvatar import 附近,约 35 行)加:
```typescript
import StatBar from './StatBar'
```

在组件内其他 useState 附近(约 90-95 行)加两个状态值 + 飘字反馈 state:
```typescript
  // 后果系统:两个状态值(仅当 scenario.stats 存在时启用)
  const [statA, setStatA] = useState(0)
  const [statB, setStatB] = useState(0)
  // 飘字反馈:[{id, statKey, delta}]
  const [floatFx, setFloatFx] = useState<Array<{ key: number; emoji: string; delta: number }>>([])
```

- [ ] **Step 2: 初始化状态值(在现有"从第一个场景开始"的 useEffect 内)**

找到 `useEffect(() => { if (scenario && scenario.scenes.length > 0) {` 块(约 103 行),在 `setCurrentSceneId(scenario.scenes[0].id)` 之后加初始化:
```typescript
      if (scenario.stats) {
        setStatA(scenario.stats.a.init)
        setStatB(scenario.stats.b.init)
      }
```

- [ ] **Step 3: 在场景内容区渲染 StatBar(仅当有 stats)**

找到进度条 `<div className="mb-6 h-1 bg-ink-700 ...">`(约 291 行)。在其**之后**、场景图之前插入:
```tsx
        {/* 后果系统:双值状态栏 */}
        {scenario.stats && (
          <StatBar
            statA={scenario.stats.a}
            statB={scenario.stats.b}
            valueA={statA}
            valueB={statB}
            color={scenario.color}
          />
        )}
```

- [ ] **Step 4: 验证**

Run: `cd /f/历史软件 && npx tsc --noEmit && npm run build`
Expected: 0 错误;build 成功。(此时玄武门数据还没配 stats,状态栏暂不显示——正常,Task 6 配好数据后显示。)

- [ ] **Step 5: Commit**

```bash
cd /f/历史软件
git add src/components/TimeTravel/ScenarioPlayer.tsx
git commit -m "feat(timetravel): ScenarioPlayer 接入状态值 state + StatBar 渲染

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 选项应用 effects + 飘字反馈 + 方向标示

**Files:**
- Modify: `src/components/TimeTravel/ScenarioPlayer.tsx`

- [ ] **Step 1: handleChoice 中应用 effects**

找到 `handleChoice`(约 163 行)。在 `audioEngine.playClick()` 之后、outcome 处理之前,插入 effects 应用逻辑:
```typescript
    // 应用选项的状态值影响(后果系统)
    if (scenario.stats && choice.effects) {
      const fx: Array<{ key: number; emoji: string; delta: number }> = []
      const aKey = scenario.stats.a.id
      const bKey = scenario.stats.b.id
      if (choice.effects[aKey]) {
        const d = choice.effects[aKey]
        setStatA(v => Math.max(0, Math.min(scenario.stats!.a.max, v + d)))
        fx.push({ key: Date.now(), emoji: scenario.stats.a.emoji, delta: d })
      }
      if (choice.effects[bKey]) {
        const d = choice.effects[bKey]
        setStatB(v => Math.max(0, Math.min(scenario.stats!.b.max, v + d)))
        fx.push({ key: Date.now() + 1, emoji: scenario.stats.b.emoji, delta: d })
      }
      if (fx.length) {
        setFloatFx(fx)
        setTimeout(() => setFloatFx([]), 1500)
      }
    }
```

- [ ] **Step 2: 加飘字动画 keyframes**

在文件顶部的 `styleEl` 的 `s.textContent` 模板字符串里(约 25 行 `@keyframes scene-image-zoom` 之后)追加:
```
    @keyframes stat-float {
      0% { opacity: 0; transform: translateY(0); }
      20% { opacity: 1; }
      100% { opacity: 0; transform: translateY(-40px); }
    }
```

- [ ] **Step 3: 渲染飘字层**

在 return 的最外层 `<div className="w-full h-full bg-ink-900 overflow-y-auto relative">` 内、`max-w-3xl` 容器**之后**(约 386 行,`</div>` 闭合前),加飘字浮层:
```tsx
        {/* 后果系统:状态值变化飘字 */}
        {floatFx.length > 0 && (
          <div className="fixed left-1/2 top-32 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1">
            {floatFx.map(f => (
              <div
                key={f.key}
                className={`text-lg font-serif tabular-nums ${f.delta > 0 ? 'text-success' : 'text-danger'}`}
                style={{ animation: 'stat-float 1.5s ease-out forwards' }}
              >
                {f.emoji} {f.delta > 0 ? '+' : ''}{f.delta}
              </div>
            ))}
          </div>
        )}
```

- [ ] **Step 4: 选项上显示方向标示(不带数字)**

找到选项渲染 `{currentScene.choices.map(c => (`(约 361 行)。把选项按钮内部的 `<div className="text-sm ...">{c.text}</div>` 替换为带方向标的布局:
```tsx
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-parchment-50 group-hover:text-bronze-200 transition-colors">{c.text}</div>
                  {scenario.stats && c.effects && (
                    <div className="flex items-center gap-2 shrink-0 text-xs">
                      {c.effects[scenario.stats.a.id] ? (
                        <span className={c.effects[scenario.stats.a.id] > 0 ? 'text-success' : 'text-danger'}>
                          {scenario.stats.a.emoji}{c.effects[scenario.stats.a.id] > 0 ? '↑' : '↓'}
                        </span>
                      ) : null}
                      {c.effects[scenario.stats.b.id] ? (
                        <span className={c.effects[scenario.stats.b.id] > 0 ? 'text-success' : 'text-danger'}>
                          {scenario.stats.b.emoji}{c.effects[scenario.stats.b.id] > 0 ? '↑' : '↓'}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
```

- [ ] **Step 5: 验证**

Run: `cd /f/历史软件 && npx tsc --noEmit && npm run build`
Expected: 0 错误;build 成功。

- [ ] **Step 6: Commit**

```bash
cd /f/历史软件
git add src/components/TimeTravel/ScenarioPlayer.tsx
git commit -m "feat(timetravel): 选项应用 effects + 飘字反馈 + 方向标示

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: 象限结局判定

**Files:**
- Modify: `src/components/TimeTravel/ScenarioPlayer.tsx`(`proceedToNext`,约 181 行)

- [ ] **Step 1: proceedToNext 中加象限判定**

在 `proceedToNext` 里,找到 `if (next.ending) {` 分支。在进入该分支后、`setEndingId(next.ending)` 之前,加象限覆盖逻辑:当剧本有 stats 且该结局所属剧本配置了象限结局时,用当前双值算出的象限覆盖 `next.ending`。

把:
```typescript
    if (next.ending) {
      // 跳到结局
      setEndingId(next.ending)
      setCurrentSceneId(null)
```
改为:
```typescript
    if (next.ending) {
      // 后果系统:若剧本启用 stats 且存在象限结局,按当前双值选结局
      let targetEnding = next.ending
      if (scenario.stats) {
        const half = scenario.stats.a.max / 2  // 用 a 的 max 作阈值基准(a/b 同 max)
        const aHigh = statA >= half
        const bHigh = statB >= half
        const quad = `${aHigh ? 'H' : 'L'}${bHigh ? 'H' : 'L'}` as 'HH' | 'HL' | 'LH' | 'LL'
        const quadEnding = scenario.endings.find(e => e.quadrant === quad)
        if (quadEnding) targetEnding = quadEnding.id
      }
      setEndingId(targetEnding)
      setCurrentSceneId(null)
```

**注意:** 后续记录完成进度的代码里,凡用到 `next.ending` 记录已解锁结局的地方,改用 `targetEnding`。具体:把该分支内 `const newEndings = currentEndings.includes(next.ending)` 改为 `.includes(targetEnding)`,`[...currentEndings, next.ending]` 改为 `[...currentEndings, targetEnding]`。

- [ ] **Step 2: 验证**

Run: `cd /f/历史软件 && npx tsc --noEmit && npm run build`
Expected: 0 错误;build 成功。逻辑:即时失败结局(如 s1b_dead_end→ending_inaction)的场景没有 stats 象限映射匹配时……注意这些即时失败场景直接 `ending` 指向失败结局,而失败结局**不配 quadrant**,所以 `quadEnding` 找不到 → 保持 `next.ending` 原值。只有最终场景 s4 的 ending_emperor 会被象限覆盖(因为 HH/HL/LH/LL 四结局都配了 quadrant)。

- [ ] **Step 3: Commit**

```bash
cd /f/历史软件
git add src/components/TimeTravel/ScenarioPlayer.tsx
git commit -m "feat(timetravel): 象限结局判定(双值高低组合选结局)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: 玄武门之变数据配置(stats + effects + 2 新结局 + quadrant)

**Files:**
- Modify: `src/data/scenarios.json`(玄武门 scenario)

- [ ] **Step 1: 用脚本给玄武门注入 stats / effects / quadrant / 新结局**

由于 JSON 手改易错,用 Node 脚本精确修改。运行:

```bash
cd /f/历史软件 && node -e '
const fs = require("fs");
const path = "./src/data/scenarios.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));
const sc = data.find(x => x.title.includes("玄武门"));

// 1. 双值定义
sc.stats = {
  a: { id: "power", name: "兵权", emoji: "⚔️", init: 3, max: 10 },
  b: { id: "heart", name: "人心", emoji: "❤️", init: 5, max: 10 },
};

// 2. 选项 effects 映射
const eff = {
  c1a: { power: 3, heart: -1 },
  c1ba: { power: 2, heart: -1 },
  c1bb: { power: 1, heart: 1 },
  c2a: { power: 2, heart: -2 },
  c2b: { power: 1, heart: -1 },
  c3a: { power: 2, heart: -1 },
  c3b: { power: -1, heart: 3 },
  c3c: { power: 2, heart: -3 },
};
sc.scenes.forEach(sn => (sn.choices||[]).forEach(c => { if (eff[c.id]) c.effects = eff[c.id]; }));

// 3. 现有结局补 quadrant
const q = { ending_emperor: "HH", ending_collapse: "LL" };
sc.endings.forEach(e => { if (q[e.id]) e.quadrant = q[e.id]; });

// 4. 新增两个象限结局(HL 暴君 / LH 根基不稳)
sc.endings.push({
  id: "ending_tyrant",
  quadrant: "HL",
  isWin: false,
  title: "💀 铁腕之主",
  text: "你以绝对武力登基,却背负弑兄逼父的骂名。朝堂噤若寒蝉,史官在暗处颤抖着落笔。皇位稳固,人心尽失。",
  historicalReality: "历史上李世民同样以武力夺位,但他此后勤政纳谏、善待功臣,用贞观之治的政绩赢回了人心——这正是他区别于单纯暴君的关键。",
  lessons: ["武力可以夺取权力,却无法直接换来人心", "夺位者能否被历史宽恕,取决于夺位之后做了什么"],
});
sc.endings.push({
  id: "ending_fragile",
  quadrant: "LH",
  isWin: false,
  title: "💀 众望难支",
  text: "你赢得了人心,却未能牢牢掌握兵权。旧党暗流涌动,边将拥兵自重。你坐上皇位,却如坐针毡,根基不稳。",
  historicalReality: "唐初的政局中,军权的绝对掌控是稳定的前提。仅有声望而无实力的君主,往往难以压制野心勃勃的功臣与藩镇。",
  lessons: ["理想主义需要实力作后盾", "人心与实力,缺一不可"],
});

fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("玄武门配置完成:stats + " + Object.keys(eff).length + " 选项 effects + " + sc.endings.length + " 结局");
'
```
Expected 输出: `玄武门配置完成:stats + 8 选项 effects + 6 结局`

- [ ] **Step 2: 验证数据正确性**

Run:
```bash
cd /f/历史软件 && node -e '
const d = require("./src/data/scenarios.json");
const sc = d.find(x => x.title.includes("玄武门"));
console.log("stats:", JSON.stringify(sc.stats));
console.log("象限结局:", sc.endings.filter(e=>e.quadrant).map(e=>e.quadrant+"="+e.id).join(", "));
const withEff = sc.scenes.flatMap(s=>s.choices||[]).filter(c=>c.effects).length;
console.log("带 effects 的选项数:", withEff);
'
```
Expected: stats 有 power/heart;象限结局四个(HH/HL/LH/LL 各一);带 effects 选项 8 个。

- [ ] **Step 3: 构建验证**

Run: `cd /f/历史软件 && npx tsc --noEmit && npm run build`
Expected: 0 错误;build 成功。

- [ ] **Step 4: Commit**

```bash
cd /f/历史软件
git add src/data/scenarios.json
git commit -m "feat(timetravel): 玄武门之变配置双值+象限结局(试点)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: 实玩验证(手动)

**Files:** 无(浏览器手动测试)

- [ ] **Step 1: 启动 dev server**

Run: `cd /f/历史软件 && npm run dev`(若已在运行则跳过),打开 http://localhost:5173/(或 Vite 分配的端口)。

- [ ] **Step 2: 进入玄武门之变,验证以下检查点**

进入"学习引导 → 穿越历史 → 玄武门之变":
- [ ] 顶部显示「⚔️ 兵权 3/10」「❤️ 人心 5/10」状态栏
- [ ] 选项右侧显示方向箭头(如 c1a "下定决心" 显示 ⚔️↑ ❤️↓)
- [ ] 点选项后,数值飘字浮出(如 ⚔️ +3 绿色 / ❤️ −1 红色),进度条平滑变化
- [ ] 走一条"高兵权低人心"路线(如 c1a→c1ba→c2a→c3c)到 s4,结局应为 HL「铁腕之主」
- [ ] 重玩走"平衡"路线到 s4,验证能触发 HH「贞观之治」
- [ ] 即时失败(s1 选 c1b 犹豫)仍直达「流放岭南」,不受象限影响

- [ ] **Step 3: 若发现数值曲线不合理**

如果实玩发现某象限太易/太难达成,回到 Task 6 的 effects 或 init 值微调(纯数据,改完重跑 Step 1 脚本的 eff 部分)。这是设计调优,不算返工。

---

## 自检结果

**Spec 覆盖:**
- 双值对立 → Task 1(类型)+ Task 6(数据)✓
- 象限结局(2×2)→ Task 5(判定)+ Task 6(4 象限结局)✓
- 状态呈现全程可见 → Task 2(StatBar)+ Task 3(渲染)✓
- 实时飘字反馈 → Task 4 ✓
- 选项标方向不标幅度 → Task 4 Step 4 ✓
- 反馈节奏 ~1.5s → Task 4(setTimeout 1500 + 动画 1.5s)✓
- 向后兼容(无 stats 走旧逻辑)→ Task 3/4/5 均以 `scenario.stats &&` 守卫 ✓
- 阶段1只做玄武门 → Task 6 只改玄武门,其余剧本不动 ✓

**占位符扫描:** 无 TBD/TODO,每步含完整代码/命令。✓

**类型/命名一致性:**
- `stats.a/b`、`StatDef`、`effects`、`quadrant`(HH/HL/LH/LL)在类型(T1)、组件(T2)、逻辑(T3-5)、数据(T6)间一致 ✓
- 状态值 id `power`/`heart` 在 effects 映射(T6)与判定(T5 用 `scenario.stats.a.id`)间一致 ✓
- 结局 id `ending_emperor`/`ending_collapse`/`ending_tyrant`/`ending_fragile` 在 T6 定义,T5 通过 quadrant 查找不硬编码 id ✓

**说明:** Task 7 为手动验收,不产生 commit。阶段2(其余 6 剧本配置)不在本计划,验收满意后另行处理。
