/**
 * overview_rich_render.tsx — 给 4 个 overview 详情 dialog 共用的富内容渲染片段
 *
 * 使用：在 dialog 渲染主文本后插入 <OverviewRichContent item={item} />
 */
import React from 'react'
import { renderInline } from '@/lib/inlineMd'

// 把含 **bold** 的字符串解析为 React 节点
function Md({ text }: { text?: string }) {
  if (!text) return null
  return <>{renderInline(text)}</>
}

interface ItemWithRich {
  facts?: Array<{ label: string; value: string }>
  sections?: Array<{ type: string; heading?: string; body?: string; text?: string; items?: string[]; cite?: string; variant?: string }>
  timeline?: Array<{ year: string; era?: string; event: string }>
  related?: Array<{ id: string; title: string; reason: string }>
  source?: string
}

export function OverviewRichContent({ item }: { item: ItemWithRich | any }) {
  const it = item as ItemWithRich
  return (
    <>
      {it.facts && it.facts.length > 0 && (
        <div>
          <div className="text-xs text-ink-300 uppercase tracking-wider mb-2">📊 关键事实</div>
          <div className="grid grid-cols-2 gap-2">
            {it.facts.map((f, i) => (
              <div key={i} className="p-3 rounded-lg bg-ink-700/30 border border-ink-500/40">
                <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-1">{f.label}</div>
                <div className="text-sm text-parchment-50"><Md text={f.value} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {it.sections && it.sections.length > 0 && (
        <div className="space-y-3">
          {it.sections.map((s, i) => {
            if (s.type === 'paragraph') {
              return (
                <div key={i}>
                  {s.heading && <div className="text-xs text-ink-300 uppercase tracking-wider mb-1"><Md text={'📝 ' + s.heading} /></div>}
                  <div className="text-sm text-parchment-50 leading-relaxed"><Md text={s.body} /></div>
                </div>
              )
            }
            if (s.type === 'callout') {
              return (
                <div key={i} className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/40">
                  {s.heading && <div className="text-xs text-emerald-300 uppercase tracking-wider mb-1"><Md text={'💡 ' + s.heading} /></div>}
                  <div className="text-sm text-parchment-50 leading-relaxed"><Md text={s.body} /></div>
                </div>
              )
            }
            if (s.type === 'list') {
              return (
                <div key={i}>
                  {s.heading && <div className="text-xs text-ink-300 uppercase tracking-wider mb-1"><Md text={'📋 ' + s.heading} /></div>}
                  <ul className="text-sm text-parchment-50 leading-relaxed space-y-1 list-disc list-inside">
                    {s.items?.map((it2: string, j: number) => (
                      <li key={j}><Md text={it2} /></li>
                    ))}
                  </ul>
                </div>
              )
            }
            if (s.type === 'quote') {
              return (
                <div key={i} className="p-3 rounded-lg bg-ink-700/30 border-l-4 border-vermilion-500/60">
                  <div className="text-sm text-parchment-50 italic"><Md text={s.text} /></div>
                  {s.cite && <div className="text-xs text-ink-300 mt-1">— {s.cite}</div>}
                </div>
              )
            }
            return null
          })}
        </div>
      )}

      {it.timeline && it.timeline.length > 0 && (
        <div>
          <div className="text-xs text-ink-300 uppercase tracking-wider mb-2">⏳ 时间线</div>
          <div className="space-y-1.5">
            {it.timeline.map((t, i) => (
              <div key={i} className="flex gap-3 items-start text-sm">
                <div className="font-mono text-xs text-vermilion-300 min-w-[80px] shrink-0">{t.year}{t.era && <span className="text-ink-400"> · {t.era}</span>}</div>
                <div className="text-parchment-50"><Md text={t.event} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {it.related && it.related.length > 0 && (
        <div>
          <div className="text-xs text-ink-300 uppercase tracking-wider mb-2">🔗 关联条目</div>
          <div className="flex flex-wrap gap-2">
            {it.related.map((r, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-ink-700/40 border border-ink-500/40 text-xs text-parchment-50" title={r.reason}>
                → {r.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {it.source && (
        <div className="text-xs text-ink-300 leading-relaxed border-t border-ink-700/40 pt-2">
          📚 {it.source}
        </div>
      )}
    </>
  )
}