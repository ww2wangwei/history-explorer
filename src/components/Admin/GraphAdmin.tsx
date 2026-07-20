/**
 * GraphAdmin — 关系网编辑器（Phase 3 待做）
 */
export default function GraphAdmin() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-serif text-bronze-300 mb-2">🕸️ 人物关系网编辑器</h1>
      <p className="text-sm text-ink-400 mb-6">
        可视化编辑人物之间的 relatedFigureIds（关系类型：contemporary / mentor / successor / predecessor 等）。
      </p>
      <div className="p-6 rounded-lg bg-ink-800 border border-ink-700 text-ink-300 text-sm">
        🚧 Phase 3 实施中...<br />
        <span className="text-xs text-ink-500">Phase 2 (4 个内容 tab) 已完成，先测一下；图谱编辑器下一轮做</span>
      </div>
    </div>
  )
}
