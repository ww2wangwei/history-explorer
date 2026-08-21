# 📜 历史探索者 · History Explorer

一个给历史爱好者的个人学习工具，通过**双轴探索**（横向时间轴 + 动态世界地图）建立中国史与世界史的时空认知框架。

## ✨ 特性

- **双轴联动**：拖动时间轴 → 世界地图版图平滑切换；点击地图国家 → 时间轴定位
- **时间跨度**：公元前 3000 至公元 2025（5000 年文明史）
- **中国史**：秦/汉/唐/宋/元/明/清 7 大朝代 + 三国过渡期
- **世界史**：罗马共和国/帝国、拜占庭、阿拉伯帝国、奥斯曼、蒙古帝国、波斯萨法维、大英帝国
- **事件标记**：80+ 个改变历史走向的标志性事件
- **暗色主题**：暖色调历史感 UI

## 🛠️ 技术栈

- **前端**：React 18 + TypeScript + Vite
- **地图**：MapLibre GL JS（WebGL 渲染）+ react-map-gl
- **时间轴**：自实现 SVG（d3-scale）
- **状态**：Zustand
- **样式**：Tailwind CSS

## 🚀 开发

```bash
npm install        # 安装依赖
npm run dev        # 启动 dev server (http://localhost:5173)
npm run build      # 生产构建（生成 .gz + .br 预压缩文件）
npm run lint       # TypeScript 类型检查
```

### 🚄 静态资源压缩

`vite build` 会同时生成 `.gz` 和 `.br` 预压缩文件。部署服务器需启用相应静态压缩：

```nginx
# nginx
gzip_static on;
brotli_static on;  # 需要 nginx-module-brotli 模块

# 或者用动态压缩（不推荐，慢）：
# gzip on; gzip_types text/css application/javascript ...;
```

```caddyfile
# Caddy — 自动
encode zstd gzip
```

```toml
# Cloudflare Pages — 自动（无需配置）
```

主要 chunk 压缩后大小参考：

| 文件 | 原始 | gzip | brotli |
|------|-----:|-----:|-------:|
| `index.js` (主 bundle) | 1643 KB | 588 KB | **445 KB** |
| `LadderPanel.js` | 990 KB | 196 KB | **66 KB** |
| `countries-50m.js` | 736 KB | 223 KB | **201 KB** |

## 📂 项目结构

```
src/
├── components/
│   ├── Timeline/      # 时间轴组件
│   ├── Map/           # 地图组件
│   ├── DetailPanel/   # 详情面板
│   ├── SearchBar.tsx  # 搜索
│   └── Layout.tsx     # 整体布局
├── store/
│   └── useHistoryStore.ts  # Zustand 全局状态
├── data/
│   ├── events.json    # 历史事件
│   └── eras.json      # 朝代/文明元数据
├── types/
│   └── index.ts       # 类型定义
└── utils/
    ├── time.ts        # 年份格式化
    ├── geo.ts         # 朝代匹配
    └── dataLoader.ts  # 数据懒加载
```

## 📝 后续规划

- 知识图谱（学习轨迹可视化）
- AI 费曼问答
- 个人笔记
- 间隔重复卡片

## 📜 数据来源

- 中国朝代边界：手绘简化版（基于谭其骧《中国历史地图集》）
- 世界地图底图：手绘简化版（各大洲轮廓）
- 历史事件：基于通史教材整理

如需更精确的世界历史边界数据，可手动下载 [aourednik/historical-basemaps](https://github.com/aourednik/historical-basemaps) 的 GeoJSON 文件放入 `public/geo/world/` 目录（隔 10 年一个文件）。