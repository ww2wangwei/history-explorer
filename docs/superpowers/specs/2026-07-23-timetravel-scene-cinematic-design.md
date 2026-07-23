# 「穿越历史」每幕动画设计文档(Remotion Player)

日期:2026-07-23
项目:历史探索者 · TimeTravel(穿越历史)模块

## 目标

为「穿越历史」每一幕的配图加入动画,提升电影感与沉浸感。经讨论确定:
用 **@remotion/player 实时渲染** "配图 + 镜头运动 + 光影叠加" 的动画组件,
**就地替换**每幕现有的 3:1 静态配图区。

## 关键技术决策(讨论结论)

- **形式**:实时渲染(非预渲染 mp4)。理由:能直接吃 `bingImage()` 的动态图 URL、
  零 mp4 体积、可随场景参数变化;而预渲染会写死图、产物大、渲染耗时。
- **内容**:配图 + 镜头运动(Ken Burns)+ 氛围叠加。非写实历史画面(Remotion 做不到)。
- **氛围层**:核心层(镜头运动 + 暗角)+ 光影扫过。不做粒子。
- **镜头预设**:5 种,每幕可标 `motion` 字段,未标则按场景索引自动轮换。
- **节奏**:缓慢(约 10 秒一次镜头移动),庄重历史感。
- **光影**:极淡(opacity ~0.06),点缀而非主角。
- **呈现位置**:就地替换现有配图区(3:1),不动布局与后果系统 UI。

## 架构与文件

**新增依赖**:`remotion` + `@remotion/player`(Player 为运行时组件,无需完整渲染工具链)。

**新增文件**:
| 文件 | 职责 |
|---|---|
| `SceneCinematic.tsx` | Remotion 组件:配图 + 镜头运动 + 光影 + 暗角。props: imageUrl / motion / color |
| `SceneStage.tsx` | 包装 `<Player>`,尺寸自适应、循环播放、失败回退、reduced-motion 降级 |

**改动文件**:
- `ScenarioPlayer.tsx`:配图区的静态 `<img>` div 替换为 `<SceneStage>`。
- `scenarios.json`:本次**不改**(全用自动轮换;后续如需按幕指定 motion 再加)。

## 镜头运动与光影实现

Remotion 用 `useCurrentFrame()` + `interpolate()` 驱动。设 30fps、每段循环 300 帧(10s):

**5 种镜头预设**(对配图做 CSS transform,`Easing.inOut` 缓入缓出):
- `zoom-in`: scale 1.0 → 1.12
- `zoom-out`: scale 1.12 → 1.0
- `pan-right`: translateX -4% → 4% + scale 1.08
- `pan-left`: translateX 4% → -4% + scale 1.08
- `diagonal`: scale 1.0 → 1.1 + 轻微对角位移

**光影扫过**:宽的半透明白色斜向渐变条,translateX -120% → 120%,周期约 15s(比镜头长,
避免频闪),`mix-blend-mode: overlay`,opacity ~0.06。

**暗角 + 底部渐变**:静态叠加层,沿用现有 radial vignette + 底部黑色渐变,保证文字可读。

**循环**:`<Player loop autoPlay>`;切场景时按新 imageUrl/motion 重新挂载。

**自动轮换**:未指定 motion 的幕,按 `场景索引 % 5` 取预设,保证相邻幕运动不同。

## 实施步骤

1. 装 remotion + @remotion/player,确认构建不破
2. 写 SceneCinematic.tsx(图 + 5 motion + 光影 + 暗角)
3. 写 SceneStage.tsx(Player + 自适应 + 失败回退 + reduced-motion 降级)
4. ScenarioPlayer.tsx 替换配图区
5. 实玩验证 + 调参

**验证**:每步 `tsc --noEmit` 0 错误 + `npm run build` 通过;关注引入 Remotion 后的 bundle 体积变化。

## 回退策略(3 层)

- 图加载失败 → 显示原静态图 fallback
- Player 初始化异常 → 错误边界 / try-catch,退回静态图
- `prefers-reduced-motion` → 镜头运动关闭,显示静态图 + 静态暗角

## 非目标(YAGNI)

- 不做预渲染 mp4;不做粒子;不做全屏过场。
- 本次不改 scenarios.json 的 motion 字段(全用自动轮换)。
- 不碰后果系统 / 布局 / 文字 / 选项 / 状态栏。
- 改动约束在 TimeTravel 模块内。
