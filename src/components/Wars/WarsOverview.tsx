/**
 * WarsOverview — 全战争全屏浏览页
 * 数据源：events.json 中 category='军事' 的事件
 * 复用模式与 FiguresOverview 相同（区域筛选 + importance 筛选 + 搜索 + 详情弹窗）
 */
import { useEffect, useMemo, useState } from 'react'
import eventsData from '@/data/events.json'
import erasData from '@/data/eras.json'
import { useAIStore } from '@/store/useAIStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useAllLearningContexts } from '@/utils/useLearningContext'
import { enhancePersonaPrompt } from '@/utils/useLearningContext'
import type { Era, HistoricalEvent } from '@/types'

const events = eventsData as HistoricalEvent[]
const eras = erasData as Era[]
const wars = events.filter(e => e.category === '军事' || e.category === 'military')

/**
 * "大型/长期战争"专题 — 持续 1 年以上 + 多战区 + 多子事件
 * 这些战争不只是一场战斗，而是多年多国的综合博弈
 * 列表中只列代表性事件（用户点开看详情），专题用 dedicated 区域展示
 */
interface MajorWar {
  /** 内部 id（人类可读） */
  key: string
  /** 专题标题（显示在栏目头部） */
  title: string
  /** 起止年（含正负数） */
  startYear: number
  endYear: number
  /** 简述（100-200 字导语） */
  summary: string
  /** icon */
  icon: string
  /** 包含的具体事件 id */
  eventIds: string[]
  /** 专题总评分（用于排序和颜色） */
  importance: 3 | 2
}

const MAJOR_WARS: MajorWar[] = [
  {
    key: 'ww1',
    title: '第一次世界大战',
    startYear: 1914,
    endYear: 1918,
    icon: '🟦',
    importance: 3,
    summary: '1914 年萨拉热窝事件引爆，30 多国卷入、1700 万人死亡，摧毁四大帝国（俄/德/奥/奥斯曼），催生凡尔赛体系和共产主义革命。',
    eventIds: ['ev-072', 'ev-168'],  // ev-168 已删（兜底）
  },
  {
    key: 'ww2',
    title: '第二次世界大战',
    startYear: 1939,
    endYear: 1945,
    icon: '🟥',
    importance: 3,
    summary: '人类历史上最大规模战争，60+ 国家参战、7000 万人死亡，结束于 1945 年 5 月德国投降、9 月日本投降。战后形成雅尔塔体系和美苏冷战。',
    eventIds: ['ev-224', 'ev-225', 'ev-226', 'ev-249', 'ev-250'],
  },
  {
    key: 'china-ww2',
    title: '抗日战争（中国人民抗日战争）',
    startYear: 1937,
    endYear: 1945,
    icon: '🇨🇳',
    importance: 3,
    summary: '1937 年七七事变爆发全民族抗战，至 1945 年日本投降，8 年浴血奋战，1800 万中国人牺牲，中国近代首次取得反侵略战争完全胜利。',
    eventIds: ['ev-249', 'ev-250'],
  },
  {
    key: 'napoleonic',
    title: '拿破仑战争',
    startYear: 1803,
    endYear: 1815,
    icon: '🇫🇷',
    importance: 2,
    summary: '拿破仑·波拿巴主导的欧洲霸权争夺，从 1803 年到 1815 年滑铁卢战役。席卷整个欧洲大陆，最终在俄国的寒冬和莱比锡战役中崩溃。',
    eventIds: ['ev-114', 'ev-115'],
  },
  {
    key: 'mongol-west',
    title: '蒙古三次西征',
    startYear: 1219,
    endYear: 1260,
    icon: '🏹',
    importance: 2,
    summary: '成吉思汗及其后裔发动的三次大规模西征（1219-1225、1235-1242、1253-1260），建立横跨欧亚的蒙古帝国，深刻改变中亚、东欧、波斯历史走向。',
    eventIds: ['ev-046', 'ev-047', 'ev-151', 'ev-assyria-2'],
  },
  {
    key: 'thirty-years',
    title: '三十年战争',
    startYear: 1618,
    endYear: 1648,
    icon: '⚔️',
    importance: 2,
    summary: '神圣罗马帝国内战升级为欧洲混战，1648 年《威斯特伐利亚和约》奠定现代国际关系基础（主权国家、不干涉内政），被称"现代国际法起源"。',
    eventIds: ['ev-159'],
  },
  {
    key: 'seven-years',
    title: '七年战争',
    startYear: 1756,
    endYear: 1763,
    icon: '🌍',
    importance: 2,
    summary: '欧洲列强在欧陆、北美、加勒比、印度同时开战，被称"第一次世界大战"。腓特烈大帝奇迹般撑住，1763 年《巴黎和约》让英国获得法属加拿大和印度。',
    eventIds: ['ev-162'],
  },
  {
    key: '100-years',
    title: '英法百年战争',
    startYear: 1337,
    endYear: 1453,
    icon: '🏰',
    importance: 2,
    summary: '欧洲中世纪最长的战争，持续 116 年。贞德 1429 年解放奥尔良扭转战局，1453 年法军收复加莱。英格兰民族意识觉醒，丧失欧洲大陆所有领地。',
    eventIds: ['ev-108', 'ev-110', 'ev-233'],
  },
  {
    key: 'us-civil',
    title: '美国南北战争',
    startYear: 1861,
    endYear: 1865,
    icon: '🇺🇸',
    importance: 3,
    summary: '美国历史上最大规模内战，1863 年葛底斯堡战役为转折，1865 年林肯遇刺同年南方投降。奴隶制废除，联邦权威高于州权。',
    eventIds: ['ev-147', 'ev-148', 'ev-149', 'ev-219'],
  },
  {
    key: 'punic',
    title: '布匿战争（罗马 vs 迦太基）',
    startYear: -264,
    endYear: -146,
    icon: '🛡️',
    importance: 2,
    summary: '罗马与迦太基争夺地中海霸权的三次战争（公元前 264-241、218-201、149-146），以汉尼拔翻越阿尔卑斯山和坎尼会战最为著名，最终罗马彻底摧毁迦太基。',
    eventIds: ['ev-carthage-2', 'ev-carthage-3', 'ev-carthage-4', 'ev-carthage-5'],
  },
  {
    key: 'greco-persian',
    title: '希波战争（希腊 vs 波斯）',
    startYear: -499,
    endYear: -449,
    icon: '🏛️',
    importance: 2,
    summary: '希腊城邦反抗波斯帝国侵略的战争（约公元前 500-449），马拉松、温泉关、萨拉米斯海战为关键战役，希腊文明得以延续，奠定西方文明基础。',
    eventIds: ['ev-011', 'ev-129', 'ev-130'],
  },
  {
    key: 'alexander-east',
    title: '亚历山大大帝东征',
    startYear: -336,
    endYear: -323,
    icon: '🦅',
    importance: 2,
    summary: '亚历山大大帝 13 年征战建立横跨欧亚非的帝国，将希腊文化传播到东方，开启"希腊化时代"，深刻塑造中东、中亚文明。',
    eventIds: ['ev-131', 'ev-141'],
  },
]

interface Props {
  isActive: boolean
  onClose: () => void
  /** 跳到主地图：父组件关闭本视图 + 切到地图 */
  onViewOnMap?: () => void
}

type RegionFilter = 'all' | 'china' | 'world'

export default function WarsOverview({ isActive, onClose, onViewOnMap }: Props) {
  const [region, setRegion] = useState<RegionFilter>('all')
  const [importance, setImportance] = useState<0 | 1 | 2 | 3>(0)
  const [query, setQuery] = useState('')
  const [selectedWar, setSelectedWar] = useState<HistoricalEvent | null>(null)

  // AI 对话准备
  const setContext = useAIStore(s => s.setContext)
  const setPersonaPrompt = useAIStore(s => s.setPersonaPrompt)
  const newThread = useAIStore(s => s.newThread)
  const openPanel = useAIStore(s => s.openPanel)
  const allContexts = useAllLearningContexts()
  // 跳到地图：设置年份 + 聚焦到战争地点
  const setYear = useHistoryStore(s => s.setYear)
  const setMapFocus = useHistoryStore(s => s.setMapFocus)

  /** 处理"在地图看位置"：年份 + 坐标定位 + 通知父组件切到地图 */
  const handleViewOnMap = (war: HistoricalEvent) => {
    if (war.coordinates) {
      setYear(war.year)
      setMapFocus({
        center: war.coordinates,
        zoom: 4,
        label: war.title,
      })
    } else {
      // 没坐标的战争：只切年份
      setYear(war.year)
    }
    setSelectedWar(null)
    onViewOnMap?.()
  }

  // ESC 关闭
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedWar) setSelectedWar(null)
        else onClose()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, selectedWar, onClose])

  if (!isActive) return null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return wars.filter(w => {
      if (region === 'china' && w.region !== 'china') return false
      if (region === 'world' && w.region === 'china') return false
      if (importance > 0 && w.importance !== importance) return false
      if (q && !(w.title.toLowerCase().includes(q) || (w.description ?? '').toLowerCase().includes(q))) return false
      return true
    }).sort((a, b) => a.year - b.year)
  }, [region, importance, query])

  const handleChat = (war: HistoricalEvent) => {
    // 上下文：所属朝代（让 AI 知道背景时期）
    setContext(war.relatedEraId ?? null, war.id, null)
    // 拼上学习上下文（让 AI 知道用户学过什么）
    const contextString = allContexts[war.relatedEraId ?? '']?.contextString ?? ''
    // persona prompt 注入战争的 4 段内容（如有）+ 守则
    const warDetails = [
      war.warBackground && `【背景】\n${war.warBackground}`,
      war.description && `【经过】\n${war.description}`,
      war.warResult && `【结果】\n${war.warResult}`,
      war.warImpact && `【影响】\n${war.warImpact}`,
    ].filter(Boolean).join('\n\n')
    const basePersona = `你是历史军事专家。请基于以下这场战争的背景资料回答用户问题，保持客观中立，引述史料，遇到存疑处说明学界争议。\n\n【战争】${war.title}（${war.year < 0 ? `BC ${-war.year}` : war.year}）\n${war.country ? `地点：${war.country}\n` : ''}${warDetails}`
    const persona = enhancePersonaPrompt(basePersona + contextString, '历史军事专家')
    setPersonaPrompt(persona)
    newThread(`关于 ${war.title}`)
    openPanel()
    setSelectedWar(null)
  }

  return (
    <div className="w-full h-full bg-ink-900 overflow-y-auto">
      {/* 头部 */}
      <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-red-700/40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-serif text-red-300">⚔️ 全战争</h2>
              <p className="text-xs text-ink-500 mt-1">
                {filtered.length} / {wars.length} 场战争 · 从公元前 1046 武王伐纣到 20 世纪
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-ink-700"
              title="返回 Dashboard (ESC)"
            >
              ×
            </button>
          </div>
          {/* 筛选条 */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
              {(['all', 'china', 'world'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-3 py-1.5 transition-colors ${
                    region === r
                      ? 'bg-red-700/40 text-red-300'
                      : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
                  }`}
                >
                  {r === 'all' ? '全部' : r === 'china' ? '🇨🇳 中国' : '🌍 世界'}
                </button>
              ))}
            </div>
            <div className="flex rounded bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
              {([0, 1, 2, 3] as const).map(i => (
                <button
                  key={i}
                  onClick={() => setImportance(i)}
                  className={`px-2.5 py-1.5 transition-colors ${
                    importance === i
                      ? 'bg-red-700/40 text-red-300'
                      : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
                  }`}
                  title={i === 0 ? '全部' : `重要性 ${i}（${i === 3 ? '关键' : i === 2 ? '重要' : '一般'}）`}
                >
                  {i === 0 ? '全部' : `${'⭐'.repeat(i)}`}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索战争名/描述..."
              className="flex-1 min-w-[200px] text-xs px-3 py-1.5 bg-ink-700/60 border border-ink-600 rounded text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* 🔥 大型/长期战争专题 — 单独的醒目栏目 */}
      {MAJOR_WARS.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="mb-3 flex items-baseline gap-2">
            <h3 className="text-base font-serif text-red-300">🔥 大型战争专题</h3>
            <span className="text-xs text-ink-500">持续多年、多国卷入的综合博弈</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {MAJOR_WARS.map(mw => {
              const startYearLabel = mw.startYear < 0 ? `BC ${-mw.startYear}` : `${mw.startYear}`
              const endYearLabel = mw.endYear < 0 ? `BC ${-mw.endYear}` : `${mw.endYear}`
              // 关联的事件：从 wars 列表中找出存在的（容错 ev-168 这种已删的）
              const mwEvents = mw.eventIds
                .map(eid => wars.find(w => w.id === eid))
                .filter((x): x is HistoricalEvent => Boolean(x))
              return (
                <div
                  key={mw.key}
                  className="p-4 rounded-lg border border-red-700/40 bg-gradient-to-br from-red-950/30 to-ink-800/80 hover:border-red-500/80 transition-colors"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-2xl flex-shrink-0">{mw.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-serif text-red-200 truncate">{mw.title}</div>
                      <div className="text-[10px] text-ink-400 tabular-nums">
                        {startYearLabel} ~ {endYearLabel} · {mwEvents.length} 个相关事件
                      </div>
                    </div>
                    {mw.importance === 3 && (
                      <span className="text-[10px] text-amber-400">⭐ 关键</span>
                    )}
                  </div>
                  <div className="text-[11px] text-parchment-100 leading-relaxed mb-2 line-clamp-3">
                    {mw.summary}
                  </div>
                  {/* 列出包含的具体事件 */}
                  <div className="flex flex-wrap gap-1">
                    {mwEvents.map(we => (
                      <button
                        key={we.id}
                        onClick={() => setSelectedWar(we)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/30 hover:bg-red-800/60 border border-red-700/40 hover:border-red-500/60 text-red-200 transition-colors"
                        title={`${we.year < 0 ? 'BC ' + (-we.year) : we.year} · ${we.title} · ${we.region === 'china' ? '中国' : '世界'}`}
                      >
                        {we.title}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 列表 */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center text-ink-500 py-12">未找到匹配的战争</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map(war => {
              const yearLabel = war.year < 0 ? `BC ${-war.year}` : `${war.year}`
              const relatedEra = war.relatedEraId ? eras.find(e => e.id === war.relatedEraId) : null
              return (
                <button
                  key={war.id}
                  onClick={() => setSelectedWar(war)}
                  className="text-left p-3 rounded border border-ink-600 bg-ink-800/60 hover:border-red-500/60 hover:bg-ink-700/60 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-red-400 tabular-nums font-serif">{yearLabel}</span>
                    {war.importance === 3 && <span className="text-amber-400 text-xs">⭐ 关键</span>}
                    {war.importance === 2 && <span className="text-amber-400/60 text-xs">⭐ 重要</span>}
                    {war.region === 'china'
                      ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-300 border border-amber-700/40">中国</span>
                      : <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-700/40">世界</span>
                    }
                    <span className="text-sm font-serif text-parchment-50 truncate">{war.title}</span>
                  </div>
                  <div className="text-[11px] text-ink-400 line-clamp-2">{war.description}</div>
                  {relatedEra && (
                    <div className="text-[10px] text-ink-500 mt-1">
                      朝代：<span style={{ color: relatedEra.color }}>{relatedEra.name}</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedWar && (
        <WarDetailDialog
          war={selectedWar}
          onClose={() => setSelectedWar(null)}
          onChat={() => handleChat(selectedWar)}
          onViewOnMap={() => handleViewOnMap(selectedWar)}
        />
      )}
    </div>
  )
}

function WarDetailDialog({ war, onClose, onChat, onViewOnMap }: {
  war: HistoricalEvent
  onClose: () => void
  onChat: () => void
  onViewOnMap: () => void
}) {
  const yearLabel = war.year < 0 ? `BC ${-war.year}` : `${war.year}`
  const relatedEra = war.relatedEraId ? eras.find(e => e.id === war.relatedEraId) : null

  // 根据 importance 决定内容丰富度
  const isKey = war.importance === 3
  const isMajor = war.importance === 2

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-red-700/40 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-red-700/30 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-ink-500 mb-1 flex items-center gap-2">
              <span>⚔️ 战争</span>
              <span className="tabular-nums">{yearLabel}</span>
              {isKey && <span className="text-amber-400">⭐ 关键</span>}
              {isMajor && <span className="text-amber-400/60">⭐ 重要</span>}
            </div>
            <h3 className="text-xl font-serif text-red-300">{war.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-ink-700"
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* 朝代 / 时期 */}
          {relatedEra && (
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">🏛️ 所属朝代</div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded border"
                  style={{ background: relatedEra.color + '20', color: relatedEra.color, borderColor: relatedEra.color + '40' }}
                >
                  {relatedEra.name}
                </span>
                <span className="text-[10px] text-ink-500 tabular-nums">
                  {relatedEra.startYear < 0 ? `BC ${-relatedEra.startYear}` : relatedEra.startYear} ~ {relatedEra.endYear < 0 ? `BC ${-relatedEra.endYear}` : relatedEra.endYear}
                </span>
              </div>
            </div>
          )}

          {/* 地理位置 */}
          {war.country && (
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">📍 地点</div>
              <div className="text-sm text-parchment-50">{war.country}</div>
              {war.coordinates && (
                <div className="text-[10px] text-ink-500 tabular-nums mt-0.5">
                  {war.coordinates[0].toFixed(2)}°E, {war.coordinates[1].toFixed(2)}°N
                </div>
              )}
            </div>
          )}

          {/* 背景 — 战前形势 */}
          {war.warBackground && (
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">📜 战争背景</div>
              <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
                {war.warBackground}
              </div>
            </div>
          )}

          {/* 经过 — 主描述（必显示） */}
          <div>
            <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">⚔️ 战争经过</div>
            <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
              {war.description ?? '（暂无描述）'}
            </div>
          </div>

          {/* 结果 — 胜负/签约 */}
          {war.warResult && (
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">🏁 战争结果</div>
              <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
                {war.warResult}
              </div>
            </div>
          )}

          {/* 影响 — 后世格局变化（如果有） */}
          {war.warImpact && (
            <div className="p-3 rounded bg-amber-900/15 border border-amber-700/40">
              <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-1.5">🎯 历史影响</div>
              <div className="text-sm text-parchment-100 leading-relaxed">
                {war.warImpact}
              </div>
            </div>
          )}

          {/* 关联事件（同一战争的后续/前奏） */}
          {war.relatedEventIds && war.relatedEventIds.length > 0 && (
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">🔗 关联事件</div>
              <div className="flex flex-wrap gap-1.5">
                {war.relatedEventIds.map(eid => {
                  const related = events.find(e => e.id === eid)
                  if (!related) return null
                  return (
                    <span
                      key={eid}
                      className="text-xs px-2 py-0.5 rounded bg-ink-700/60 text-ink-300 border border-ink-600"
                      title={`${related.year < 0 ? `BC ${-related.year}` : related.year} · ${related.title}`}
                    >
                      {related.title}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* 重要度提示（无 warImpact 时 fallback） */}
          {isKey && !war.warImpact && (
            <div className="p-3 rounded bg-amber-900/20 border border-amber-700/40">
              <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-1">🎯 历史意义</div>
              <div className="text-xs text-parchment-100 leading-relaxed">
                这场战争被史学界视为<strong className="text-amber-300">改写历史进程</strong>的关键事件。
                {relatedEra && <>它直接影响了<strong style={{ color: relatedEra.color }}>{relatedEra.name}</strong>的走向。 </>}
                建议从其所属朝代/时期的"朝代时间线"路径了解更完整的上下文。
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t border-ink-700">
            {war.coordinates && (
              <button
                onClick={onViewOnMap}
                className="flex-1 px-4 py-2.5 rounded bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-600/50 text-emerald-200 text-sm transition-colors"
              >
                🗺️ 在地图看位置
              </button>
            )}
            <button
              onClick={onChat}
              className="flex-1 px-4 py-2.5 rounded bg-red-900/40 hover:bg-red-800/60 border border-red-600/50 text-red-200 text-sm transition-colors"
            >
              💬 询问这场战争
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 text-sm transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
