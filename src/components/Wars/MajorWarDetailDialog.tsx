/**
 * MajorWarDetailDialog — 大型战争专题详情
 * 显示专题导语 + 子事件时间线列表（每条可点开弹窗）
 */
import { bingImage, majorWarSearchKeywords } from '@/utils/geoImage'
import { useJumpToMap } from '@/hooks/useJumpToMap'
import { lookupLocationStrict } from '@/utils/locationCoords'
import type { MajorWar, MajorWarNode } from '@/data/majorWars'

function MajorWarDetailDialog({ mw, onClose, onSelectNode }: {
  mw: MajorWar
  onClose: () => void
  onSelectNode: (node: MajorWarNode) => void
}) {
  const startYearLabel = mw.startYear < 0 ? `BC ${-mw.startYear}` : `${mw.startYear}`
  const endYearLabel = mw.endYear < 0 ? `BC ${-mw.endYear}` : `${mw.endYear}`
  const mwKw = majorWarSearchKeywords[mw.key] ?? mw.title
  const mwImg = bingImage(mwKw, 800, 450)
  const jumpToMap = useJumpToMap()

  const handleNodeJump = (node: MajorWarNode, idx: number) => {
    const pos = node.coordinates || lookupLocationStrict(node.location)
    if (!pos) return
    const firstSentence = (node.detail || node.description || '').split(/[。.!?！？]/)[0].trim()
    jumpToMap(pos, `${node.title}（${node.location}）`, 5, {
      coverImageUrl: bingImage(mwKw, 400, 240),
      snippet: firstSentence.slice(0, 120),
      reopenLabel: node.title,
      mwKey: mw.key,
      // 不传 nodeIndex：从总览页跳地图，Back 应回到总览列表而非具体节点
    })
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-red-700/40 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="战争详情"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部图片 */}
        <div className="relative w-full bg-ink-900" style={{ aspectRatio: '16/9' }}>
          <img
            src={mwImg}
            alt={mw.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-900/95 to-transparent px-6 pt-8 pb-3">
            <div className="text-xs text-ink-300 mb-0.5 flex items-center gap-2">
              <span>🔥 大型战争专题</span>
              {mw.importance === 3 && <span className="text-amber-400">⭐ 关键</span>}
            </div>
            <h3 className="text-2xl font-serif text-red-200 flex items-center gap-2">
              <span className="text-3xl">{mw.icon}</span>
              {mw.title}
            </h3>
            <div className="text-xs text-ink-300 tabular-nums mt-0.5">
              {startYearLabel} ~ {endYearLabel} · {mw.nodes.length} 个关键节点
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-parchment-50/80 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg bg-ink-900/60 hover:bg-ink-900/80 backdrop-blur"
            title="关闭 (ESC)"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {/* 导语 */}
        <div className="p-6 pb-3">
          <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📜 战争总览</div>
          <div className="text-sm text-parchment-100 leading-relaxed">{mw.summary}</div>
        </div>

        {/* 节点时间线 */}
        <div className="px-6 pb-6">
          <div className="text-xs text-ink-500 uppercase tracking-wider mb-3">⚔️ 关键节点事件（{mw.nodes.length}）</div>
          {mw.nodes.length === 0 ? (
            <div className="text-xs text-ink-500 italic">（暂无节点）</div>
          ) : (
            <div className="relative pl-5">
              {/* 时间线竖线 */}
              <div className="absolute left-1.5 top-1 bottom-1 w-px bg-red-700/40" />
              <div className="space-y-3">
                {mw.nodes.map((node, i) => {
                  const yearLabel = node.year < 0 ? `BC ${-node.year}` : `${node.year}`
                  return (
                    <div key={i} className="relative">
                      {/* 时间线圆点 */}
                      <div
                        className="absolute -left-3.5 top-1 w-2.5 h-2.5 rounded-full ring-2 ring-ink-800"
                        style={{ background: node.importance === 3 ? '#b85450' : '#8a6a55' }}
                      />
                      <div className="p-3 rounded-lg border border-ink-600 bg-ink-700/30 hover:border-red-500/60 transition-colors">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs text-red-300 tabular-nums font-serif">{yearLabel}</span>
                          {node.importance === 3 && <span className="text-amber-400 text-xs">⭐ 关键</span>}
                          {node.location && (
                            <span className="text-xs text-ink-500">📍 {node.location}</span>
                          )}
                          {(node.coordinates || lookupLocationStrict(node.location)) && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleNodeJump(node, i) }}
                              className="ml-auto text-xs px-2 py-0.5 rounded-lg bg-bronze-900/40 hover:bg-bronze-700/60 border border-bronze-700/50 hover:border-bronze-500/70 text-bronze-200 transition-colors inline-flex items-center gap-1"
                              title="在地图上定位"
                            >
                              📍 在地图上定位 <span aria-hidden>↗</span>
                            </button>
                          )}
                        </div>
                        <div className="text-sm font-serif text-parchment-50 mb-1.5">{node.title}</div>
                        <div className="text-[11px] text-ink-300 leading-relaxed mb-2">
                          {node.description}
                        </div>
                        <button
                          onClick={() => onSelectNode(node)}
                          className="w-full text-xs px-2 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/50 hover:border-emerald-500/70 text-emerald-200 transition-colors"
                        >
                          📖 进入节点详情 →
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="sticky bottom-0 z-10 bg-ink-800/95 backdrop-blur border-t border-ink-600 px-6 py-3 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 text-xs transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

export default MajorWarDetailDialog
