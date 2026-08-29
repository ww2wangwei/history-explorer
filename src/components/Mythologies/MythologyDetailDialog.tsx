/**
 * MythologyDetailDialog — 神话详情弹窗
 *
 * 复用 OverviewLayout 风格的全屏展示。
 * 点击神话列表中的某条 → 弹出此全屏对话框。
 *
 * 内容：
 *  - 大封面图（Bing CDN）+ 标题 / 文明 / 分类 / 年代
 *  - 完整摘要（100-200 字摘要版）
 *  - 登场角色（链接到角色网络）
 *  - 主题 / 主题词
 *
 * 注：未来详版迭代 → 这里替换 `summary` 为 `fullStory`
 */
import ModalShell from '@/components/ui/Modal'
import { bingImage } from '@/utils/geoImage'
import {
  MYTHOLOGIES,
  CIVILIZATIONS,
  CATEGORIES,
  type Mythology,
} from '@/data/mythologies'
import { MYTH_CHARACTERS } from '@/data/myth-characters'

interface Props {
  myth: Mythology | null
  onClose: () => void
  /** 点击"看角色图谱"时，跳转图谱视图 */
  onJumpToGraph?: (charId?: string) => void
}

export default function MythologyDetailDialog({ myth, onClose, onJumpToGraph }: Props) {
  if (!myth) return null
  const civ = CIVILIZATIONS.find(c => c.id === myth.civilization)
  const cat = CATEGORIES.find(c => c.id === myth.category)
  const bgUrl = bingImage(myth.imageKeyword, 1200, 600)
  const characters = MYTH_CHARACTERS.filter(c => myth.characters.includes(c.name))

  return (
    <ModalShell
      isOpen={!!myth}
      onClose={onClose}
      className="p-2 sm:p-4"
      innerClassName="max-w-4xl"
      innerStyle={{ background: 'rgb(15, 14, 12)' }}
      ariaLabel={`${myth.title} · 神话详情`}
    >
      <div className="relative">
        {/* 大封面图 */}
        <div
          className="relative h-72 bg-cover bg-center rounded-t-lg overflow-hidden"
          style={{ backgroundImage: `url(${bgUrl})` }}
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.45) 50%, rgba(15,14,12,0.95) 100%)',
            }}
          />
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-lg bg-ink-900/70 hover:bg-ink-700 text-parchment-50 text-xl flex items-center justify-center backdrop-blur"
            title="关闭 (ESC)"
            aria-label="关闭"
          >
            ×
          </button>
          {/* 顶部信息 */}
          <div className="absolute top-4 left-5 right-5 flex items-start gap-3">
            <div className="text-5xl drop-shadow-lg">{civ?.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-amber-200/80 uppercase tracking-widest mb-1">{civ?.name}</div>
              <h2 className="text-3xl font-serif text-white drop-shadow-lg mb-1">{myth.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] px-2 py-0.5 rounded bg-ink-900/60 text-amber-100 border border-amber-500/30">
                  {cat?.emoji} {cat?.name}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-ink-900/60 text-amber-100/80 border border-amber-500/20">
                  {myth.eraRange}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 正文 */}
        <div className="px-6 pb-6 pt-2 space-y-5">
          {/* 摘要 */}
          <div>
                          <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-2">摘要</div>
            <p className="text-sm text-parchment-50 leading-relaxed whitespace-pre-wrap">
              {myth.summary}
            </p>
          </div>

          {/* 登场角色 */}
          {characters.length > 0 && (
            <div>
              <div className="text-[10px] text-ink-300 uppercase tracking-wider mb-2">
                登场角色（{characters.length}）
              </div>
              <div className="flex flex-wrap gap-1.5">
                {characters.map(c => (
                  <button
                    key={c.id}
                    onClick={() => onJumpToGraph?.(c.id)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-ink-700/60 hover:bg-amber-900/40 border border-ink-600 hover:border-amber-500/50 text-parchment-50 transition-colors text-left"
                    title={`${c.role}${c.domain ? ' · ' + c.domain : ''} — 点击查看图谱`}
                  >
                    {c.name}
                    <span className="text-parchment-50/80 ml-1 text-[10px]">· {c.role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 分类标签 */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-ink-300">
            <span>分类：</span>
            <span className="px-2 py-0.5 rounded bg-ink-700/60 text-amber-200 border border-amber-500/30">
              {cat?.emoji} {cat?.name}
            </span>
            <span>·</span>
            <span>{civ?.emoji} {civ?.name}</span>
          </div>

          {/* 底部操作 */}
          <div className="pt-3 border-t border-ink-700 flex items-center justify-between gap-2 flex-wrap">
            <div className="text-[11px] text-ink-300">
              ID: <code className="text-ink-300 bg-ink-700/40 px-1.5 py-0.5 rounded">{myth.id}</code>
            </div>
            <div className="flex items-center gap-2">
              {onJumpToGraph && (
                <button
                  onClick={() => onJumpToGraph()}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-700/40 hover:bg-amber-600/60 text-amber-100 border border-amber-500/40"
                >
                  🔗 看相关角色图谱
                </button>
              )}
              <button
                onClick={onClose}
                className="text-xs px-3 py-1.5 rounded-lg bg-ink-700/60 hover:bg-ink-700 text-parchment-50 border border-ink-600"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}