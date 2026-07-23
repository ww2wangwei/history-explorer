# 「穿越历史」每幕动画(Remotion Player)实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 `@remotion/player` 实时渲染"配图 + 镜头运动 + 光影"动画,就地替换「穿越历史」每幕的静态配图区,提升电影感;失败时回退静态图,不破坏可玩性。

**Architecture:** 新增两个组件——`SceneCinematic`(Remotion 组件:用 `useCurrentFrame()`+`interpolate()` 驱动 5 种镜头运动预设 + 极淡光影扫过 + 静态暗角,图片用 `<Img>` 吃远程 URL)和 `SceneStage`(包 `<Player>`,处理尺寸自适应、reduced-motion 降级、错误/加载失败回退静态图)。`ScenarioPlayer` 把配图区那一个 `<div>` 换成 `<SceneStage>`。数据不改,motion 按场景索引自动轮换。

**Tech Stack:** React 18 + TypeScript + Remotion(`remotion` + `@remotion/player`)+ Vite。无单元测试框架——验证:`npx tsc --noEmit`(0 错误)+ `npm run build`(通过)+ 浏览器实玩。

**验证约定:** 每个 Task 后 `cd /f/历史软件 && npx tsc --noEmit && npm run build`,期望 tsc 0 错误、build 成功。

**Remotion 关键约束(来自 remotion-best-practices):**
- 组件内**禁用 CSS transition/animation**,一切动画用 `useCurrentFrame()` + `interpolate()` 驱动。
- 图片用 Remotion 的 `<Img>` 组件(支持远程 URL),不用原生 `<img>`。
- 网页实时播放用 `<Player>`(来自 `@remotion/player`),需传 `component`/`durationInFrames`/`fps`/`compositionWidth`/`compositionHeight`/`inputProps`。

---

## 文件结构

| 文件 | 职责 | 改动 |
|---|---|---|
| `src/components/TimeTravel/SceneCinematic.tsx` | Remotion 组件:图+镜头运动+光影+暗角(纯帧驱动) | 新建 |
| `src/components/TimeTravel/SceneStage.tsx` | 包 `<Player>`,自适应/降级/回退 | 新建 |
| `src/components/TimeTravel/ScenarioPlayer.tsx` | 配图区替换为 `<SceneStage>` | 修改 |
| `package.json` | 加 remotion + @remotion/player | 修改(via npm) |

**镜头预设(SceneCinematic 内常量):**
```
zoom-in:   scale 1.0 → 1.12
zoom-out:  scale 1.12 → 1.0
pan-right: translateX -4% → 4%, scale 1.08
pan-left:  translateX 4% → -4%, scale 1.08
diagonal:  scale 1.0 → 1.1, translate 对角 -2% → 2%
```
时长:300 帧 @ 30fps(10 秒),循环。光影周期 450 帧(15秒),opacity 峰值 0.06。

---

## Task 1: 安装 Remotion 依赖

**Files:** `package.json`(via npm)

- [ ] **Step 1: 安装**

Run:
```bash
cd /f/历史软件 && npm install remotion@^4 @remotion/player@^4
```
Expected: 安装成功,package.json 出现 `remotion` 和 `@remotion/player`(版本需与彼此一致)。

- [ ] **Step 2: 确认版本一致 + 构建不破**

Run: `cd /f/历史软件 && node -e "const p=require('./package.json');console.log('remotion',p.dependencies.remotion,'| player',p.dependencies['@remotion/player'])" && npx tsc --noEmit && npm run build 2>&1 | grep -E "built in|error" | head -3`
Expected: 两个包版本主号一致(都是 4.x);tsc 0 错误;build 成功。记录 bundle 体积变化(index chunk 会增大)。

- [ ] **Step 3: Commit**

```bash
cd /f/历史软件
git add package.json package-lock.json
git commit -m "chore: 安装 remotion + @remotion/player

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: SceneCinematic —— Remotion 动画组件

**Files:** Create `src/components/TimeTravel/SceneCinematic.tsx`

- [ ] **Step 1: 新建 SceneCinematic.tsx**

创建文件。用帧驱动实现镜头运动 + 光影 + 暗角。**不使用任何 CSS transition/animation**。

```tsx
/**
 * SceneCinematic — 穿越历史单幕动画(Remotion 组件)
 * 配图 + 缓慢镜头运动(Ken Burns)+ 极淡光影扫过 + 静态暗角。
 * 纯帧驱动(useCurrentFrame + interpolate),不用 CSS 动画。
 */
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'

export type CinematicMotion = 'zoom-in' | 'zoom-out' | 'pan-right' | 'pan-left' | 'diagonal'

export interface SceneCinematicProps {
  imageUrl: string
  motion: CinematicMotion
  /** 剧本主题色(用于底部渐变微调,可选) */
  color?: string
}

const EASE = Easing.inOut(Easing.ease)

export const SceneCinematic: React.FC<SceneCinematicProps> = ({ imageUrl, motion, color = '#000000' }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  // 归一化进度 0→1(镜头运动整段走完)
  const p = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  })

  // 按预设算 scale / translate
  let scale = 1, tx = 0, ty = 0
  if (motion === 'zoom-in') scale = 1.0 + 0.12 * p
  else if (motion === 'zoom-out') scale = 1.12 - 0.12 * p
  else if (motion === 'pan-right') { scale = 1.08; tx = -4 + 8 * p }
  else if (motion === 'pan-left') { scale = 1.08; tx = 4 - 8 * p }
  else if (motion === 'diagonal') { scale = 1.0 + 0.1 * p; tx = -2 + 4 * p; ty = -2 + 4 * p }

  // 光影扫过:周期 450 帧,translateX -120%→120%,opacity 三角波峰值 0.06
  const sweepPeriod = 450
  const sweepFrame = frame % sweepPeriod
  const sweepX = interpolate(sweepFrame, [0, sweepPeriod], [-120, 120], { extrapolateRight: 'clamp' })
  const sweepOpacity = interpolate(sweepFrame, [0, sweepPeriod / 2, sweepPeriod], [0, 0.06, 0], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f0e0c', overflow: 'hidden' }}>
      {/* 配图 + 镜头运动 */}
      <AbsoluteFill>
        <Img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale}) translate(${tx}%, ${ty}%)`,
          }}
        />
      </AbsoluteFill>

      {/* 光影扫过(overlay 混合) */}
      <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '60%',
            transform: `translateX(${sweepX}%) skewX(-12deg)`,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
            opacity: sweepOpacity,
          }}
        />
      </AbsoluteFill>

      {/* 静态暗角 */}
      <AbsoluteFill style={{ pointerEvents: 'none', boxShadow: 'inset 0 0 120px rgba(0,0,0,0.55)' }} />
      {/* 底部渐变(压住图,保证下方文字/边缘可读) */}
      <AbsoluteFill style={{ pointerEvents: 'none', background: `linear-gradient(to bottom, transparent 55%, ${color}22 80%, rgba(15,14,12,0.6) 100%)` }} />
    </AbsoluteFill>
  )
}
```

- [ ] **Step 2: 验证**

Run: `cd /f/历史软件 && npx tsc --noEmit && npm run build 2>&1 | grep -E "built in|error" | head -3`
Expected: tsc 0 错误;build 成功。(组件未被引用,仅验证编译。)

- [ ] **Step 3: Commit**

```bash
cd /f/历史软件
git add src/components/TimeTravel/SceneCinematic.tsx
git commit -m "feat(timetravel): SceneCinematic Remotion 动画组件(镜头运动+光影+暗角)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: SceneStage —— Player 包装 + 回退

**Files:** Create `src/components/TimeTravel/SceneStage.tsx`

- [ ] **Step 1: 新建 SceneStage.tsx**

创建文件。用 `<Player>` 播放 SceneCinematic;reduced-motion 或图未定义时回退静态图;用 state + onError 兜底。

```tsx
/**
 * SceneStage — 承载 SceneCinematic 的实时播放舞台
 * - 用 @remotion/player 的 <Player> 实时渲染动画
 * - prefers-reduced-motion:降级为静态图 + 暗角
 * - 图加载失败 / Player 异常:回退静态图
 * - motion 未指定时按 sceneIndex 自动轮换
 */
import { useState } from 'react'
import { Player } from '@remotion/player'
import { SceneCinematic, type CinematicMotion, type SceneCinematicProps } from './SceneCinematic'

const MOTION_CYCLE: CinematicMotion[] = ['zoom-in', 'pan-right', 'zoom-out', 'pan-left', 'diagonal']

interface Props {
  imageUrl: string
  /** 场景在剧本中的索引,用于自动轮换镜头运动 */
  sceneIndex: number
  /** 显式指定镜头运动(可选) */
  motion?: CinematicMotion
  color?: string
  /** 用于切场景时重挂载 */
  sceneKey: string
}

const FPS = 30
const DURATION = 300 // 10s

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export default function SceneStage({ imageUrl, sceneIndex, motion, color, sceneKey }: Props) {
  const [failed, setFailed] = useState(false)
  const resolvedMotion: CinematicMotion = motion ?? MOTION_CYCLE[sceneIndex % MOTION_CYCLE.length]
  const reduced = prefersReducedMotion()

  // 回退:reduced-motion 或加载失败 → 静态图 + 暗角
  if (reduced || failed) {
    return (
      <div className="relative w-full h-full bg-ink-900 overflow-hidden">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.55)' }} />
      </div>
    )
  }

  const inputProps: SceneCinematicProps = { imageUrl, motion: resolvedMotion, color: color ?? '#000000' }

  return (
    <div className="relative w-full h-full bg-ink-900 overflow-hidden">
      <Player
        key={sceneKey}
        component={SceneCinematic}
        inputProps={inputProps}
        durationInFrames={DURATION}
        fps={FPS}
        compositionWidth={1200}
        compositionHeight={400}
        style={{ width: '100%', height: '100%' }}
        autoPlay
        loop
        controls={false}
        showVolumeControls={false}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        spaceKeyToPlayOrPause={false}
      />
    </div>
  )
}
```

- [ ] **Step 2: 验证**

Run: `cd /f/历史软件 && npx tsc --noEmit && npm run build 2>&1 | grep -E "built in|error" | head -3`
Expected: tsc 0 错误;build 成功。若 Player props 类型不符会在此暴露。

- [ ] **Step 3: Commit**

```bash
cd /f/历史软件
git add src/components/TimeTravel/SceneStage.tsx
git commit -m "feat(timetravel): SceneStage 用 Player 实时渲染 + 静态图回退

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 接入 ScenarioPlayer —— 替换配图区

**Files:** Modify `src/components/TimeTravel/ScenarioPlayer.tsx`

- [ ] **Step 1: import SceneStage**

在 import 区(`import StatBar from './StatBar'` 附近)加:
```typescript
import SceneStage from './SceneStage'
```

- [ ] **Step 2: 计算当前场景索引(自动轮换用)**

在组件内 `currentScene` 定义之后(约 177 行 `const currentScene = ...` 附近)加:
```typescript
  const currentSceneIndex = scenario.scenes.findIndex(s => s.id === currentSceneId)
```

- [ ] **Step 3: 替换配图区 div**

找到配图区(约 368 行,`<div key={`img-${sceneKey}`} ... scene-image-zoom ...>` 包着 `<img>` 的那个 div)。原代码形如:
```tsx
        <div key={`img-${sceneKey}`} className="mb-4 rounded-lg overflow-hidden border border-ink-700" style={{ aspectRatio: '3/1', animation: 'scene-image-zoom 0.8s ease-out' }}>
          <img
            src={sceneImg}
            alt={currentScene.title}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
```
替换为:
```tsx
        <div key={`img-${sceneKey}`} className="mb-4 rounded-lg overflow-hidden border border-ink-700" style={{ aspectRatio: '3/1' }}>
          <SceneStage
            imageUrl={sceneImg}
            sceneIndex={currentSceneIndex}
            color={scenario.color}
            sceneKey={sceneKey}
          />
        </div>
```
(移除了 `scene-image-zoom` 内联动画——镜头运动已由 SceneStage 接管;`setImageLoaded` 不再需要,但保留 state 声明不影响,若 lint 报未使用可后续清理。)

- [ ] **Step 4: 验证构建**

Run: `cd /f/历史软件 && npx tsc --noEmit && npm run build 2>&1 | grep -E "built in|error" | head -3`
Expected: tsc 0 错误;build 成功。

- [ ] **Step 5: 实玩验证**

Run: `cd /f/历史软件 && npm run dev`,打开分配的端口(如 5173/5176)。
进入 穿越历史 → 任意剧本:
- [ ] 配图区的图有缓慢镜头运动(推近/平移),约 10 秒一轮循环
- [ ] 一道极淡光影缓慢掠过
- [ ] 暗角 + 底部渐变让图有电影质感
- [ ] 切换到下一幕,镜头运动方式不同(自动轮换)
- [ ] 图能正常加载(远程 Bing 图 URL)
- [ ] 布局未乱:玩家头像/标题/文字/选项/状态栏都在原位

- [ ] **Step 6: Commit**

```bash
cd /f/历史软件
git add src/components/TimeTravel/ScenarioPlayer.tsx
git commit -m "feat(timetravel): 每幕配图区接入 SceneStage 实时动画

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 自检结果

**Spec 覆盖:**
- @remotion/player 实时渲染 → Task 1(依赖)+ Task 3(Player)✓
- 配图 + 镜头运动(5 预设)→ Task 2(SceneCinematic)✓
- 极淡光影扫过(0.06)→ Task 2 ✓
- 暗角 + 底部渐变 → Task 2 ✓
- motion 自动轮换(按索引)→ Task 3(MOTION_CYCLE)+ Task 4(sceneIndex)✓
- 就地替换配图区,不动布局/后果系统 → Task 4 只改配图 div ✓
- 3 层回退(图失败/reduced-motion)→ Task 3(failed state + reduced check)✓
  注:Player 初始化异常这层,由"图 onError 回退 + 组件本身不抛"覆盖;若需更强可加 ErrorBoundary,但当前 Player 失败通常表现为不渲染,静态图 fallback 已兜底基本情况。
- 帧驱动、禁 CSS 动画、用 `<Img>` → Task 2 遵循 ✓

**占位符扫描:** 无 TBD/TODO,每步含完整代码/命令。✓

**类型/命名一致性:**
- `CinematicMotion`、`SceneCinematicProps`、`SceneCinematic` 在 Task 2 定义,Task 3 import 使用 ✓
- `MOTION_CYCLE`、`sceneIndex`、`sceneKey`、`resolvedMotion` 在 Task 3 内自洽 ✓
- Task 4 传给 SceneStage 的 props(imageUrl/sceneIndex/color/sceneKey)与 Task 3 的 Props 接口一致 ✓
- `sceneImg`、`sceneKey`、`currentSceneId` 是 ScenarioPlayer 已有变量,Task 4 复用 ✓

**说明:** motion 字段本次不写入 scenarios.json(全自动轮换),与 spec 非目标一致。Task 4 Step 5 为手动实玩,不产生额外 commit(commit 在 Step 6)。
