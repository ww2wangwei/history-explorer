/**
 * 诗词详情弹窗
 *
 * 复用 CulturesOverview 的 "fixed inset-0 z-50" 弹窗模式
 * + click-outside 关闭 + inner stopPropagation
 *
 * 主要区块：
 *  1. 主题画面（PoemScene 大尺寸）
 *  2. 题目 / 作者 / 朝代 / 收藏
 *  3. 原文逐字 ruby 拼音 + 逐行注解
 *  4. 疑难词表（点击高亮原文相应字）
 *  5. 我的白话翻译（自动保存）
 *  6. 创作背景 + 出处
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePoemStore } from '@/store/usePoemStore'
import { useJumpToMap } from '@/hooks/useJumpToMap'
import { formatRelativeTime } from '@/utils/relativeTime'
import type { Poem } from '@/types/poems'
import PoemScene from './PoemScene'
import PoemBGMControls from './PoemBGMControls'

interface Props {
  poem: Poem
  isFavorite: boolean
  onToggleFavorite: () => void
  onClose: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  '山水': '#5b9bc8', '送别': '#c8a85b', '思乡': '#c89a5b', '边塞': '#b85450',
  '咏物': '#9bc89a', '爱情': '#c89a8a', '哲理': '#9b7eb6', '田园': '#5bc89a',
  '咏史': '#a08570', '闺怨': '#c878a0', '怀古': '#7a8a98', '节令': '#e8a23c',
  '爱国': '#b85450', '其他': '#5a5142',
}

/**
 * 把整行的拼音串按空格拆为音节。
 * 遍历原文每一字符，把拼音注在汉字上方（ruby + rt，浏览器原生支持）。
 * 标点不参与注音。
 */
function renderLineWithPinyin(line: string, pinyinLine: string, highlightChars: Set<string> | null, idxOffset: number) {
  const syllables = pinyinLine.split(/\s+/).filter(Boolean)
  const chars = Array.from(line) // 处理 surrogate pair (emoji)
  const charNodes: React.ReactNode[] = []
  let pinyinIdx = 0

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    if (/[一-龥]/.test(ch)) {
      const p = pinyinIdx < syllables.length ? syllables[pinyinIdx] : ''
      pinyinIdx++
      const highlight = highlightChars?.has(ch)
      charNodes.push(
        <ruby key={`${idxOffset}-${i}`} className={highlight ? 'poem-char highlight' : 'poem-char'}>
          {ch}
          <rt>{p}</rt>
        </ruby>
      )
    } else {
      // 标点直接渲染
      charNodes.push(
        <span key={`${idxOffset}-${i}`} className="poem-punct">{ch}</span>
      )
    }
  }
  return charNodes
}

/**
 * 把术语的字符集合（去重）转化出来，用于原文中高亮。
 */
function termToChars(term: string): Set<string> {
  return new Set(Array.from(term).filter(c => /[一-龥]/.test(c)))
}

export default function PoemDetailDialog({ poem, isFavorite, onToggleFavorite, onClose }: Props) {
  const userTranslation = usePoemStore(s => s.userTranslations[poem.id]) ?? ''
  const setTranslation = usePoemStore(s => s.setTranslation)

  const jumpToMap = useJumpToMap()
  const [translationDraft, setTranslationDraft] = useState(userTranslation)
  const [activeTerm, setActiveTerm] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 当弹出新诗时重置本地草稿
  useEffect(() => {
    setTranslationDraft(userTranslation)
    setSavedAt(null)
    setActiveTerm(null)
    return () => {
      // 卸载前 flush 一次
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [poem.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // 自动保存（600ms debounce）
  useEffect(() => {
    if (translationDraft === userTranslation) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setTranslation(poem.id, translationDraft)
      setSavedAt(Date.now())
    }, 600)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [translationDraft, poem.id, userTranslation, setTranslation])

  // 关闭前强制保存（确保切换时不丢内容）
  const handleClose = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    if (translationDraft !== userTranslation) {
      setTranslation(poem.id, translationDraft)
      setSavedAt(Date.now())
    }
    onClose()
  }

  // 当前要高亮的字符集
  const highlightChars = useMemo(() => {
    if (!activeTerm) return null
    return termToChars(activeTerm)
  }, [activeTerm])

  const accentColor = poem.palette.accent
  const catColor = CATEGORY_COLORS[poem.category] ?? '#a8a8a8'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-vermilion-500/40 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={poem.title}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部画面 */}
        <div className="relative">
          <PoemScene
            palette={poem.palette}
            motif={poem.motif}
            title={poem.title}
            subtitle={`${poem.author} · ${poem.dynasty}`}
            image={poem.image}
          />
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-parchment-50/85 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg bg-ink-900/60 hover:bg-ink-900/85 backdrop-blur"
            title="关闭 (ESC)"
            aria-label="关闭"
          >
            ×
          </button>
          <button
            onClick={onToggleFavorite}
            className={`absolute top-3 right-14 px-3 py-1.5 text-xs rounded-lg backdrop-blur transition-colors ${
              isFavorite
                ? 'bg-amber-600/70 hover:bg-amber-600/85 text-amber-100 border border-amber-400/50'
                : 'bg-ink-900/60 hover:bg-ink-900/85 text-parchment-50/85 hover:text-amber-300 border border-ink-600/60'
            }`}
            title={isFavorite ? '取消收藏' : '收藏'}
            aria-label={isFavorite ? '取消收藏' : '收藏'}
          >
            {isFavorite ? '⭐ 已收藏' : '☆ 收藏'}
          </button>
        </div>

        {/* 图片 attribution（CC-PD / 公共领域合规） */}
        {poem.image && (
          <div className="px-6 py-2 border-b border-ink-700 text-[10px] text-ink-300 flex items-center gap-1.5 flex-wrap">
            <span className="opacity-70">🎨 画面：</span>
            <a
              href={poem.image.pageUrl || '#'}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-vermilion-300/85 hover:text-vermilion-300 transition-colors truncate max-w-[60%]"
              title={poem.image.artworkName ?? poem.title}
            >
              {poem.image.artworkName || 'Wikimedia artwork'}
            </a>
            {poem.image.credit && (
              <span className="opacity-70">· {poem.image.credit}</span>
            )}
            <span className="ml-auto opacity-70 bg-ink-700/50 px-1.5 py-0.5 rounded text-[9px]">
              {poem.image.license || 'Wikimedia'}
            </span>
          </div>
        )}

        {/* 元信息条 */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-ink-700 text-xs flex-wrap">
          <span className="font-serif text-base text-vermilion-300 truncate">{poem.title}</span>
          <span className="text-ink-300">·</span>
          <span className="text-parchment-50">{poem.author}</span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: catColor + '20', color: catColor }}
          >
            {poem.category}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-ink-700/60 text-ink-400">{poem.dynasty}</span>
          <span className="ml-auto text-ink-300 truncate">{poem.source}</span>
        </div>

        {/* 主体 */}
        <div className="px-6 py-5 space-y-5">
          {/* 原文（带拼音 + 注解） */}
          <section>
            <div className="text-xs text-ink-300 uppercase tracking-wider mb-2">📖 原文（点击下方疑难词可高亮）</div>
            <div className="bg-ink-900/40 rounded-lg p-4 leading-[2.6] text-lg poem-text">
              {poem.lines.map((line, i) => (
                <div key={i} className="poem-line mb-1.5">
                  <span className="poem-line-num mr-2 text-[10px] text-ink-300 align-middle">{i + 1}</span>
                  {renderLineWithPinyin(line, poem.pinyin[i], highlightChars, i * 100)}
                  <div className="ml-7 mt-0.5 text-xs text-ink-300 italic leading-snug">
                    {poem.annotations[i]}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 疑难词 */}
          {poem.glossary.length > 0 && (
            <section>
              <div className="text-xs text-ink-300 uppercase tracking-wider mb-2">📚 疑难词解释</div>
              <div className="flex flex-wrap gap-2">
                {poem.glossary.map(g => {
                  const active = activeTerm === g.term
                  return (
                    <button
                      key={g.term}
                      onClick={() => setActiveTerm(active ? null : g.term)}
                      className={`group flex flex-col items-start text-left px-3 py-1.5 rounded-lg border text-xs transition-colors max-w-full ${
                        active
                          ? 'bg-amber-600/30 border-amber-400/70 text-amber-100'
                          : 'bg-ink-700/40 border-ink-600 text-parchment-50 hover:bg-ink-700 hover:border-vermilion-500/40'
                      }`}
                      title="点击在原文中高亮"
                    >
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-serif text-sm" style={{ color: active ? '#f0c878' : accentColor }}>
                          {g.term}
                        </span>
                        <span className="text-[10px] text-ink-300 font-mono">{g.pinyin}</span>
                      </div>
                      <span className="text-[11px] text-ink-300 mt-0.5 leading-snug">{g.def}</span>
                    </button>
                  )
                })}
              </div>
              {activeTerm && (
                <button
                  onClick={() => setActiveTerm(null)}
                  className="mt-2 text-xs text-ink-300 hover:text-vermilion-300 transition-colors"
                >
                  ✕ 取消高亮
                </button>
              )}
            </section>
          )}

          {/* 🎵 详情页古风背景音乐（doubao AI 纯音乐循环） */}
          <section>
            <div className="text-xs text-ink-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              🎵 古风音乐
            </div>
            <PoemBGMControls />
          </section>

          {/* 我的白话翻译 */}
          <section>
            <div className="text-xs text-ink-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>✍ 我的白话翻译</span>
              {savedAt && (
                <span className="text-[10px] text-ink-300 normal-case">
                  ✓ 已保存 · {formatRelativeTime(savedAt)}
                </span>
              )}
            </div>
            <textarea
              value={translationDraft}
              onChange={(e) => setTranslationDraft(e.target.value)}
              placeholder={`用你自己的话写出这首诗的意思...

可以用现代汉语的口语表达，比如：
"明亮的月光洒在床前，抬头望月，低头就想起远方的故乡。"`}
              rows={5}
              className="w-full px-3 py-2 bg-ink-700/60 border border-ink-600 rounded-lg text-sm text-parchment-50 placeholder-ink-500 leading-relaxed resize-y focus:outline-none focus:border-vermilion-500/40 font-serif"
            />
            <div className="flex justify-between text-[10px] text-ink-300 mt-1 px-1">
              <span>输入会自动保存到本地</span>
              <span>{translationDraft.length} 字</span>
            </div>
          </section>

          {/* 创作背景 + 地图跳转 */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-ink-300 uppercase tracking-wider">📜 创作背景</div>
              {poem.geo ? (
                <button
                  onClick={() => {
                    const geo = poem.geo!
                    handleClose()
                    // 100ms 后让弹窗关闭过渡完成
                    setTimeout(() => {
                      jumpToMap(geo, poem.geoLabel || poem.title, 6, {
                        reopenKind: 'poem',
                        reopenLabel: poem.title,
                        poemId: poem.id,
                        snippet: poem.background.slice(0, 140),
                      })
                    }, 100)
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-ink-700/70 hover:bg-ink-700 border border-ink-600 text-vermilion-300 hover:text-vermilion-200 flex items-center gap-1 transition-colors"
                  title={`在大地图上查看 ${poem.geoLabel || poem.title} 的位置`}
                >
                  🗺️ 在地图上查看 · {poem.geoLabel || poem.title}
                </button>
              ) : (
                <span className="text-[10px] text-ink-300">📍 暂无地理信息</span>
              )}
            </div>
            <p className="text-sm text-parchment-50 leading-relaxed whitespace-pre-line">
              {poem.background}
            </p>
            <div className="text-[10px] text-ink-300 mt-2">出处 · {poem.source}</div>
          </section>
        </div>
      </div>

      {/* 局部 CSS — ruby 注音 + 字高亮（无全局污染） */}
      <style>{`
        .poem-text ruby {
          ruby-position: over;
          margin: 0 1px;
        }
        .poem-text ruby.poem-char,
        .poem-text ruby.highlight {
          transition: background-color 150ms ease;
          padding: 1px 1.5px;
          border-radius: 3px;
          cursor: pointer;
        }
        .poem-text ruby.highlight {
          background: ${accentColor}30;
          box-shadow: inset 0 0 0 1px ${accentColor}66;
        }
        .poem-text ruby > rt {
          font-size: 10px;
          color: #a8a090;
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.4;
        }
        .poem-text ruby.highlight > rt {
          color: ${accentColor};
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
