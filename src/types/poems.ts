/**
 * 诗词类型定义
 *
 * 与 notes.ts 平级独立；不并入 types/index.ts，避免循环依赖。
 *
 * 数据形状来源：src/data/poems.json
 * 对应状态层：src/store/usePoemStore.ts
 * 对应 UI 层：src/components/Poems/*
 */

/** 朝代：当前仅含唐/宋 */
export type PoemDynasty = '唐' | '宋'

/** 主题分类 */
export type PoemCategory =
  | '山水'
  | '送别'
  | '思乡'
  | '边塞'
  | '咏物'
  | '爱情'
  | '哲理'
  | '田园'
  | '咏史'
  | '闺怨'
  | '怀古'
  | '节令'
  | '爱国'
  | '其他'

/** 主题调色板（用于详情头图与列表卡片） */
export interface PoemPalette {
  /** 起始色（线性渐变 0%） */
  from: string
  /** 终止色（线性渐变 100%） */
  to: string
  /** 强调色（题目描边 / 装饰线） */
  accent: string
}

/** 疑难词（多字词或难字）注音 + 释义 */
export interface GlossaryEntry {
  /** 词 */
  term: string
  /** 拼音，用空格分音节，"chán juān" */
  pinyin: string
  /** 白话释义 */
  def: string
}

/** 附配的水墨画面（来自 Wikimedia Commons — Public Domain 或 CC0） */
export interface PoemImage {
  /** 缩放后直链URL（运行时 lazy load） */
  url: string
  /** 原始 Wikimedia 页面 URL（attribution 展示） */
  pageUrl?: string
  /** 文件标题（含 "File:" 等前缀） */
  title?: string
  /** 作品原名 */
  artworkName?: string
  /** 作者 / 来源 */
  credit?: string
  /** 许可（Public domain / CC0） */
  license?: string
}

/** 单首诗 */
export interface Poem {
  /** 'poem-tang-001' / 'poem-song-001' */
  id: string
  /** 题目（含词牌名时为 "念奴娇·赤壁怀古"） */
  title: string
  /** 作者，如 "李白" */
  author: string
  /** 朝代 */
  dynasty: PoemDynasty
  /** 主题 */
  category: PoemCategory

  /** 完整原文（每行一条，含标点）；长篇取第一段节选 */
  lines: string[]
  /** 与 lines 等长；每元素是该行整串拼音，音节以空格分隔 */
  pinyin: string[]
  /** 与 lines 等长；逐句注解（明义 + 修辞 + 用典） */
  annotations: string[]

  /** 疑难词表（多字词 + 难字） */
  glossary: GlossaryEntry[]

  /** 主题调色板（用于 fallback 画面 + 虚化滤镜） */
  palette: PoemPalette
  /** 主题意象 emoji：🌙 🏔 🌸 🍂 🌊 🏮 🪶 ☘️ ❄️ 🏯 🐦 🌌 🍵 等 */
  motif: string
  /** 可选：水墨图（运行时优先于此 CSS 渐变 + motif） */
  image?: PoemImage

  /** 创作背景短文（80-160 字） */
  background: string
  /** 出处（书名 + 卷次） */
  source: string
  /** 可选：诗的"创作地 / 诗中场景地"经纬度 — 详情页按钮跳转地图用 */
  geo?: [number, number]
  /** 可选：创作地的简短标签 — 地图图钉标签用（不填则用诗题） */
  geoLabel?: string

  /** 富内容字段 - 与其他 overview 板块对齐 */
  facts?: Array<{ label: string; value: string }>
  sections?: Array<{
    type: 'paragraph' | 'callout' | 'list' | 'quote'
    heading?: string
    body?: string
    variant?: string
    items?: string[]
    text?: string
    cite?: string
  }>
  timeline?: Array<{ year: string; era?: string; event: string }>
  images?: Array<{ imageKeyword: string; caption: string; credit?: string }>
  related?: Array<{ id: string; title: string; reason: string }>
}

