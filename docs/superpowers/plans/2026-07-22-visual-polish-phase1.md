# 视觉精致化 · 第一阶段(全局基础)实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 通过纯增量的 Tailwind token 与 CSS 工具类,提升历史学习应用的全局视觉精致度(古典历史感 + 质感),不重构任何组件。

**Architecture:** 方案3(混合)。在 `tailwind.config.js` 新增/微调设计 token(色阶、语义表面色、标题层级),在 `src/index.css` 新增质感工具类(羊皮纸纹理、典籍卡片、暗角)。所有改动为纯增量:现有 `bg-ink-*`/`text-bronze-*` 值不变(除 ink-900 极小幅暖调微调),新 token 作为可选升级项供第二阶段套用。

**Tech Stack:** Tailwind CSS 3.4、PostCSS、Vite。无单元测试框架——验证方式为 `tsc --noEmit`(零错误)+ `npm run build`(构建通过)+ 视觉检查。

**验证约定:** 每个 Task 完成后运行 `npx tsc --noEmit`(应为 0 错误)与 `npm run build`(应成功)。Tailwind config 的 JS 语法错误会导致构建失败,是主要的回归信号。

---

## 文件结构

| 文件 | 职责 | 改动类型 |
|---|---|---|
| `tailwind.config.js` | 设计 token:颜色色阶、语义表面色、标题层级 fontSize | 修改(纯新增 + ink-900 微调) |
| `src/index.css` | 视觉工具类:羊皮纸纹理、`.card-classic`、暗角、装饰底线 | 修改(纯新增) |

---

## Task 1: 配色 token —— 补齐 bronze 中间调 + ink 暖调微调 + 语义表面色

**Files:**
- Modify: `tailwind.config.js`(`theme.extend.colors`,约 9-50 行)

- [ ] **Step 1: 在 bronze 色阶补 200/800 两档**

打开 `tailwind.config.js`,找到 `bronze` 对象(当前为 300-700)。改为:

```js
        bronze: {
          200: '#f0dcbf',  // 最浅:近羊皮纸高光
          300: '#e8c997',
          400: '#c89a5b',
          500: '#a87a3e',
          600: '#7e5a2a',
          700: '#5e4320',
          800: '#42301a',  // 深锚点
        },
```

- [ ] **Step 2: ink-900 极小幅暖褐微调**

找到 `ink` 对象。仅把 `900` 从 `#0f0e0c` 改为 `#100e0b`(暖褐方向 +1~2,幅度极小,不影响对比度)。其余档位保持不变:

```js
        ink: {
          900: '#100e0b',
          800: '#1a1814',
          700: '#26221c',
          600: '#3a342a',
          500: '#5a5142',
          400: '#7a705c',
        },
```

- [ ] **Step 3: 新增语义表面色(在 colors.extend 内,语义色附近追加)**

在 `colors` 对象内(如 `info` 之后、角色类别色之前或之后皆可)追加三个语义色:

```js
        // 语义表面(方案3:卡片/凹陷/极细线)
        'surface-raised': '#221f19',  // 卡片浮起面:比 ink-800 亮一档带暖调
        'surface-sunken': '#141210',  // 凹陷面:比 ink-900 略深
        hairline: '#2f2a22',          // 极细分隔线:介于 ink-700 与 ink-600
```

- [ ] **Step 4: 验证构建**

Run: `cd /f/历史软件 && npx tsc --noEmit && npm run build`
Expected: tsc 0 错误;build 成功(`✓ built in ...`)。若 Tailwind config 有 JS 语法错误,build 会报错。

- [ ] **Step 5: Commit**

```bash
cd /f/历史软件
git add tailwind.config.js
git commit -m "feat(ui): 补齐 bronze 色阶 + ink 暖调微调 + 语义表面色

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: 字体层级 token —— display / heading / subheading

**Files:**
- Modify: `tailwind.config.js`(`theme.extend.fontSize`,当前仅有 `label` 一项,约 62-64 行)

- [ ] **Step 1: 扩展 fontSize,新增标题层级**

找到 `fontSize` 对象(当前只有 `label`)。追加三档标题样式(第二个元素为 lineHeight + letterSpacing + fontWeight 配置):

```js
      fontSize: {
        'label': ['11px', { lineHeight: '14px', letterSpacing: '0.05em' }],
        // 标题层级(配 font-serif 使用):字距疏朗 + 行高收紧显庄重
        'display': ['30px', { lineHeight: '1.15', letterSpacing: '0.02em', fontWeight: '600' }],
        'heading': ['22px', { lineHeight: '1.2', letterSpacing: '0.015em', fontWeight: '600' }],
        'subheading': ['15px', { lineHeight: '1.3', letterSpacing: '0.01em', fontWeight: '500' }],
      },
```

- [ ] **Step 2: 验证构建**

Run: `cd /f/历史软件 && npx tsc --noEmit && npm run build`
Expected: tsc 0 错误;build 成功。构建后可确认 `text-display`/`text-heading`/`text-subheading` 工具类可用(不报未知类名——Tailwind 对 config 内定义的 fontSize 自动生成工具类)。

- [ ] **Step 3: Commit**

```bash
cd /f/历史软件
git add tailwind.config.js
git commit -m "feat(ui): 新增 display/heading/subheading 标题层级 token

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: 羊皮纸微纹理背景工具类

**Files:**
- Modify: `src/index.css`(在 `@layer utilities` 或全局效果区追加)

- [ ] **Step 1: 追加 .paper-texture 工具类**

在 `src/index.css` 的 `@layer utilities { ... }` 块内追加(纯 CSS 生成的极淡纤维/噪点纹理,用 SVG data-URI feTurbulence,不引外部图片)。纹理透明度极低,若隐若现:

```css
  /* 🧵 羊皮纸微纹理 —— 极淡,若隐若现。加在大背景容器上 */
  .paper-texture {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
    background-repeat: repeat;
  }
```

- [ ] **Step 2: 验证构建**

Run: `cd /f/历史软件 && npm run build`
Expected: build 成功。CSS 层改动不影响 tsc,但仍确认构建通过。

- [ ] **Step 3: Commit**

```bash
cd /f/历史软件
git add src/index.css
git commit -m "feat(ui): 羊皮纸微纹理工具类 .paper-texture

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 典籍卡片质感类 .card-classic + 装饰底线 + 暗角

**Files:**
- Modify: `src/index.css`(全局效果区追加)

- [ ] **Step 1: 追加 .card-classic(卡片质感:暖调面 + 柔边 + 顶部高光)**

在 `src/index.css` 全局效果区(`.glass-card` 附近)追加。用 Task 1 的 surface-raised/hairline 语义色(通过 theme() 引用),顶部 1px 内层高光模拟纸张受光:

```css
/* 📜 典籍卡片质感 —— 暖调面 + 柔和边框 + 顶部受光高光 */
.card-classic {
  background-color: theme('colors.surface-raised');
  border: 1px solid theme('colors.hairline');
  border-radius: theme('borderRadius.card');
  box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(240,220,191,0.06);
}
```

- [ ] **Step 2: 追加装饰底线工具类 .title-underline**

标题下方一条渐隐装饰线(bronze 渐变到透明),放在标题元素上:

```css
/* ✒️ 标题装饰底线 —— bronze 渐隐,放在标题容器下 */
.title-underline {
  position: relative;
  padding-bottom: 6px;
}
.title-underline::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 48px;
  height: 2px;
  background: linear-gradient(90deg, theme('colors.bronze.400'), transparent);
  border-radius: 2px;
}
```

- [ ] **Step 3: 追加极淡暗角 .vignette**

大页面容器四周极淡暗角(博物馆射灯感),用 inset box-shadow 实现,克制到几乎无感:

```css
/* 🔦 极淡暗角 —— 聚焦视线中心,加在大页面容器上 */
.vignette {
  position: relative;
}
.vignette::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 160px rgba(0,0,0,0.25);
  z-index: 0;
}
```

- [ ] **Step 4: 验证构建**

Run: `cd /f/历史软件 && npm run build`
Expected: build 成功。注意 `theme()` 引用的颜色名必须与 Task 1 定义一致(`surface-raised`/`hairline`/`bronze.400`),否则 PostCSS 报错。

- [ ] **Step 5: Commit**

```bash
cd /f/历史软件
git add src/index.css
git commit -m "feat(ui): 典籍卡片质感 .card-classic + 标题装饰底线 + 极淡暗角

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: 应用示范 —— Dashboard 主标题 + 主背景纹理(验证新 token 生效)

本 Task 做**最小化的实际套用**,验证新 token/工具类在真实页面中生效且不破坏布局。仅改 Dashboard 一处主标题与主背景,作为样板;其余页面留待第二阶段。

**Files:**
- Modify: `src/components/Dashboard.tsx`(主标题 h1 + 最外层容器)

- [ ] **Step 1: 定位 Dashboard 主标题与最外层容器**

Run: `cd /f/历史软件 && grep -n "历史探索者\|w-full h-full overflow-y-auto" src/components/Dashboard.tsx | head`
Expected: 找到主标题 `<h1 ... 📜 历史探索者</h1>`(约 211 行)与最外层滚动容器(约 207 行 `w-full h-full overflow-y-auto scrollbar-thin bg-ink-900`)。

- [ ] **Step 2: 给最外层容器加羊皮纸纹理 + 暗角**

把最外层容器 className 中的 `bg-ink-900` 保留,追加 `paper-texture vignette`:

```
从: className="w-full h-full overflow-y-auto scrollbar-thin bg-ink-900"
到: className="w-full h-full overflow-y-auto scrollbar-thin bg-ink-900 paper-texture vignette"
```

- [ ] **Step 3: 主标题套用 display 层级 + 装饰底线**

把主标题 h1(当前形如 `className="text-3xl font-serif text-bronze-400 mb-2"`)改为使用新的 display 层级与装饰底线(去掉 text-3xl,改 text-display;加 title-underline;inline-block 让底线宽度贴合):

```
从: className="text-3xl font-serif text-bronze-400 mb-2"
到: className="text-display font-serif text-bronze-300 mb-2 title-underline inline-block"
```

- [ ] **Step 4: 验证构建 + 视觉**

Run: `cd /f/历史软件 && npx tsc --noEmit && npm run build`
Expected: tsc 0 错误;build 成功。视觉上:Dashboard 背景有极淡纹理与暗角,主标题字号/字距更精致且下方有 bronze 渐隐短线。若纹理/暗角过强,回到 Task 3/4 下调 opacity 数值(纹理 0.025→0.018,暗角 0.25→0.18)。

- [ ] **Step 5: Commit**

```bash
cd /f/历史软件
git add src/components/Dashboard.tsx
git commit -m "feat(ui): Dashboard 套用 display 标题 + 纹理/暗角(新 token 样板)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 自检结果

**Spec 覆盖:**
- 配色精调(bronze 中间调 / ink 暖调 / surface·hairline 语义色)→ Task 1 ✓
- 字体层级(display/heading/subheading + 字距 + 数字等宽)→ Task 2 ✓(数字 tabular-nums 已在多处使用,作为 token 已具备,逐处补齐属第二阶段套用范畴)
- 羊皮纸微纹理 → Task 3 ✓
- 典籍卡片质感 / 统一阴影 / 装饰底线 / 极淡暗角 → Task 4 ✓
- 只做质感不做具象装饰(C)→ 计划中无卷草/菱形,符合 ✓
- 只做中文标题(A)→ 无中英混排,符合 ✓
- 纯增量 + 不重构组件 → Task 1-4 纯新增,Task 5 仅最小样板套用 ✓
- 验证(tsc + build)→ 每 Task 都有 ✓

**占位符扫描:** 无 TBD/TODO,每步含实际代码/命令。✓

**类型/命名一致性:** `.card-classic`、`surface-raised`、`hairline`、`text-display` 等名称在定义(Task 1/2/4)与引用(Task 4/5)间一致。✓

**说明:** Task 5 是可选样板(验证新 token 生效)。若只想夯实基础层不碰任何组件,可在执行时跳过 Task 5——Task 1-4 已完整交付全局基础。
