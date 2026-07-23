import { useEffect, useMemo, useState } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useCardsStore } from '@/store/useCardsStore'
import { useAIStore } from '@/store/useAIStore'
import { useLearningPathStore } from '@/store/useLearningPathStore'
import { formatYear, durationYears } from '@/utils/time'
import { bingImage } from '@/utils/geoImage'
import { type Era, type HistoricalEvent, type HistoricalFigure } from '@/types'
import erasData from '@/data/eras.json'
import eventsData from '@/data/events.json'
import peopleData from '@/data/people.json'
import ModalShell from '@/components/ui/Modal'

const eras = erasData as Era[]
const allEvents = eventsData as HistoricalEvent[]
const people = peopleData as HistoricalFigure[]

// 事件 region 短标签（用于"同时期世界大事"section）
const REGION_SHORT: Record<string, string> = {
  rome: '罗马',
  arab: '阿拉伯',
  persia: '波斯',
  mongol: '蒙古',
  britain: '英国',
  other: '其他',
}

// 5 个大区（events.region 枚举）
const MAJOR_REGIONS = new Set(['rome', 'arab', 'persia', 'mongol', 'britain'])

// 文明名 → 关键词列表（按 title 关键词识别事件属于哪个国家/文明）
// 用于把 region='other' 的事件按 title 智能归类
// 关键原则：每个关键词必须"独特"（只属于这个国家/文明），避免跨国家误配
const CIVILIZATION_KEYWORDS: Array<{ eras: string[]; keywords: string[] }> = [
  { eras: ['japan'], keywords: ['日本', '应仁之乱', '大化改新', '镰仓', '室町', '江户', '明治维新', '德川', '丰臣', '源氏', '平氏', '天皇', '幕府', '武士道', '忍者', '遣唐使'] },
  { eras: ['france'], keywords: ['法国', '巴黎公社', '贞德', '奥尔良', '法兰西', '波旁王朝', '戴高乐', '巴士底狱', '法国大革命'] },
  { eras: ['spain'], keywords: ['西班牙内战', '无敌舰队', '卡斯蒂利亚', '阿拉贡', '腓力二世', '查理五世', '佛朗哥', '哥伦布到达美洲', '征服墨西哥'] },
  { eras: ['portugal'], keywords: ['葡萄牙', '达伽马', '里斯本', '布拉干萨'] },
  { eras: ['netherlands'], keywords: ['荷兰', '阿姆斯特丹', '奥兰治威廉', '荷兰东印度'] },
  { eras: ['venice'], keywords: ['威尼斯共和国', '马可·波罗', '里亚尔托', '威尼斯画派', '威尼斯公国'] },
  { eras: ['holy-roman'], keywords: ['神圣罗马帝国', '查理曼加冕', '腓特烈一世', '哈布斯堡王朝', '维也纳会议', '奥地利帝国', '德意志邦联', '三十年战争', '威斯特伐利亚', '宗教改革', '马丁·路德', '九十五条论纲'] },
  { eras: ['prussia'], keywords: ['普鲁士', '腓特烈大帝', '柏林会议', '俾斯麦', '德意志帝国'] },
  { eras: ['russia'], keywords: ['俄罗斯帝国', '莫斯科大公国', '彼得大帝', '叶卡捷琳娜', '罗曼诺夫', '沙皇俄国', '苏联成立', '苏联解体', '斯大林', '列宁', '十月革命', '拿破仑入侵俄国', '俄国革命'] },
  { eras: ['italy'], keywords: ['意大利', '教皇国', '教宗', '梵蒂冈', '佛罗伦萨共和国', '但丁', '文艺复兴', '马基雅维利', '意大利统一'] },
  { eras: ['mughal'], keywords: ['莫卧儿帝国', '阿克巴大帝', '泰姬陵', '德里苏丹国', '巴布尔'] },
  { eras: ['inca'], keywords: ['印加帝国', '库斯科', '皮萨罗', '印加文明'] },
  { eras: ['aztec'], keywords: ['阿兹特克', '特诺奇蒂特兰', '科尔特斯', '阿兹特克帝国'] },
  { eras: ['ottoman', 'arab'], keywords: ['奥斯曼帝国', '苏丹', '穆罕默德二世', '伊斯坦布尔', '君士坦丁堡', '土耳其', '阿拔斯王朝', '麦加', '麦地那', '哈里发', '萨拉丁', '穆罕默德', '阿拉伯帝国', '阿拉伯人', '阿拉伯帝国建立', '塞尔柱'] },
  { eras: ['britain'], keywords: ['英国', '伦敦', '都铎王朝', '斯图亚特', '伊丽莎白一世', '维多利亚女王', '大宪章', '克伦威尔', '工业革命', '英法百年战争', '英西海战', '英荷战争', '七年战争', '滑铁卢', '第一次世界大战', '第二次世界大战', '纳粹德国', '希特勒', '丘吉尔', '大不列颠', '英联邦', '鸦片战争'] },
  { eras: ['persia'], keywords: ['波斯帝国', '萨法维王朝', '阿契美尼德', '萨珊王朝', '居鲁士大帝', '大流士', '查尔迪兰战役'] },
  { eras: ['mongol'], keywords: ['蒙古帝国', '成吉思汗', '忽必烈', '伊尔汗国', '帖木儿帝国', '蒙古西征', '金帐汗国'] },
  { eras: ['rome'], keywords: ['罗马帝国', '拜占庭帝国', '君士坦丁大帝', '戴克里先', '拉丁帝国', '东罗马帝国', '西罗马帝国', '屋大维', '奥古斯都', '凯撒', '罗马帝国分裂', '罗马帝国灭亡', '罗马共和国'] },
]

// 事件 title 关键词 → 文明 id 列表
function guessCivilization(event: HistoricalEvent): string[] {
  const matches: string[] = []
  for (const rule of CIVILIZATION_KEYWORDS) {
    if (rule.keywords.some(kw => event.title.includes(kw))) {
      matches.push(...rule.eras)
    }
  }
  return matches
}

// 事件 region → 可匹配的"文明 region"枚举（严格语义匹配，避免 'other' 错配）
const REGION_TO_CIVILIZATIONS: Record<string, string[]> = {
  rome: ['rome'],
  arab: ['arab'],
  persia: ['persia'],
  mongol: ['mongol'],
  britain: ['britain'],
  // 'other' / 'china' 事件不挂任何具体世界文明
}

interface Props {
  eraId: string
}

export default function EraDetail({ eraId }: Props) {
  const { selectEra, selectEvent, setYear, setMapFocus, undoEraSelect, eraSelectionHistory } = useHistoryStore()
  const addCard = useCardsStore(s => s.addCard)
  const aiSetContext = useAIStore(s => s.setContext)
  const aiSetPersona = useAIStore(s => s.setPersonaPrompt)
  const aiNewThread = useAIStore(s => s.newThread)
  const aiOpenPanel = useAIStore(s => s.openPanel)
  const era = eras.find(e => e.id === eraId)
  // 关键大事详情弹窗
  const [selectedQuickEvent, setSelectedQuickEvent] = useState<{ year: number; title: string; desc?: string; longDesc?: string; category?: string; importance?: number } | null>(null)
  // 关键大事时间线容器 —— 不使用 GSAP stagger（详情页立即显示）

  const existingCardId = useCardsStore(s => {
    if (!era) return null
    for (const id in s.cards) {
      const c = s.cards[id]
      if (c.target.kind === 'era' && c.target.id === era.id) return id
    }
    return null
  })

  // 进入朝代 = 算"对照过"，同步学习路径进度
  useEffect(() => {
    useLearningPathStore.getState().recordVisit('crossReference', eraId)
  }, [eraId])

  if (!era) return null

  const duration = durationYears(era.startYear, era.endYear)

  // 按时间排序的所有朝代
  const sortedEras = useMemo(
    () => eras.slice().sort((a, b) => a.startYear - b.startYear),
    []
  )

  const currentIndex = sortedEras.findIndex(e => e.id === era.id)
  const prevEra = currentIndex > 0 ? sortedEras[currentIndex - 1] : null
  const nextEra = currentIndex < sortedEras.length - 1 ? sortedEras[currentIndex + 1] : null

  // 同时期的世界文明（不同 region）
  const contemporaryEras = useMemo(() => {
    return eras.filter(e =>
      e.id !== era.id &&
      e.region !== era.region &&
      // 时间有重叠
      !(e.endYear < era.startYear || e.startYear > era.endYear)
    )
  }, [era])

  // 该朝代下的所有事件
  // - 中国朝代 (region='china')：用 region 匹配（中国朝代事件多未标 relatedEraId）
  // - 其他文明：严格按 relatedEraId（避免不同文明错配）
  const eraEvents = era.region === 'china'
    ? allEvents.filter(e =>
        e.relatedEraId === eraId ||
        (e.region === era.region && e.year >= era.startYear && e.year <= era.endYear)
      )
    : allEvents.filter(e => e.relatedEraId === eraId)
  eraEvents.sort((a, b) => a.year - b.year)

  // 同时期世界大事（region !== 本朝代 region，importance ≥ 2，按时间排序）
  const contemporaryWorldEvents = useMemo(() => {
    return allEvents
      .filter(e =>
        e.region !== era.region &&
        e.importance >= 2 &&
        e.year >= era.startYear &&
        e.year <= era.endYear
      )
      .sort((a, b) => a.year - b.year)
  }, [era])

  // 按"同期世界文明"分组世界大事
  // 数据方案：events.json 已补全 country 字段（精准国家归属数组），用它匹配 eras.id
  // 兜底：title 关键词（兼容老数据 + 新加的少数事件）
  const eventsByContemporaryEra = useMemo(() => {
    const map: Record<string, HistoricalEvent[]> = {}
    for (const ce of contemporaryEras) {
      // 阶段 2：title 关键词猜测出该文明（兼容老数据）
      const guessedEras = new Set<string>([ce.id])
      for (const rule of CIVILIZATION_KEYWORDS) {
        if (rule.eras.includes(ce.id)) {
          rule.eras.forEach(id => guessedEras.add(id))
        }
      }
      // 匹配该文明下所有事件
      const events = contemporaryWorldEvents.filter(e => {
        if (e.year < ce.startYear || e.year > ce.endYear) return false
        // 1. country 字段直接匹配（最准）
        if (Array.isArray(e.country) && e.country.includes(ce.id)) return true
        // 2. region 字段匹配（仅 5 大区）
        if (MAJOR_REGIONS.has(ce.region) && e.region === ce.region) return true
        // 3. title 关键词命中（兜底）
        const guess = guessCivilization(e)
        if (guess.some(id => guessedEras.has(id))) return true
        return false
      }).sort((a, b) => a.year - b.year)
      if (events.length > 0) {
        map[ce.id] = events
      }
    }
    return map
  }, [contemporaryEras, contemporaryWorldEvents])

  // 不属于任何同期文明的世界大事（兜底）— 既不严格匹配，title 也没关键词命中
  const ungroupedWorldEvents = useMemo(() => {
    const groupedIds = new Set<string>()
    Object.values(eventsByContemporaryEra).forEach(arr => arr.forEach(e => groupedIds.add(e.id)))
    return contemporaryWorldEvents.filter(e => !groupedIds.has(e.id) && e.region !== era.region)
  }, [eventsByContemporaryEra, contemporaryWorldEvents, era])

  // 聚焦地图到朝代都城
  const focusOnMap = () => {
    if (!era.capital) return
    setMapFocus({
      center: era.capital,
      zoom: 2,
      label: `${era.name} 都城`,
    })
  }

  return (
    <div className="p-4 h-full overflow-y-auto scrollbar-thin">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div
            className="inline-block px-2 py-0.5 rounded-lg text-xs mb-2"
            style={{
              background: `${era.color}30`,
              color: era.color,
              border: `1px solid ${era.color}80`,
            }}
          >
            {era.region === 'china' ? '中国朝代' : '世界文明'} · {era.startYear < 0 ? 'BC' : ''}{era.startYear < 0 ? Math.abs(era.startYear) : era.startYear} ~ {era.endYear}
          </div>
          <h2 className="text-xl font-serif" style={{ color: era.color }}>
            {era.name}
          </h2>
          {era.shortDesc && (
            <div className="text-sm text-ink-500 mt-1 italic">{era.shortDesc}</div>
          )}
          {era.keyPoints && era.keyPoints.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-ink-700/40 border border-ink-600/60">
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">📚 5 个核心要点</div>
              <ol className="text-xs text-parchment-50 space-y-1 list-decimal pl-4 marker:text-ink-500">
                {era.keyPoints.map((pt, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: renderMarkdownBold(pt) }} />
                ))}
              </ol>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {eraSelectionHistory.length > 0 && (
            <button
              className="px-2 py-0.5 text-xs text-ink-500 hover:text-parchment-50 border border-ink-600 rounded-lg transition-colors"
              onClick={() => undoEraSelect()}
              title="回退到上一个朝代 (u)"
            >
              ← 回退
            </button>
          )}
          <button
            className="text-ink-500 hover:text-parchment-50 text-lg"
            onClick={() => selectEra(null)}
            title="关闭 (ESC)"
            aria-label="关闭"
          >
            ×
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-ink-700 px-3 py-2 rounded-lg">
          <div className="text-ink-500 mb-1">起始</div>
          <div className="text-parchment-100 font-serif">{formatYear(era.startYear)}</div>
        </div>
        <div className="bg-ink-700 px-3 py-2 rounded-lg">
          <div className="text-ink-500 mb-1">结束</div>
          <div className="text-parchment-100 font-serif">{formatYear(era.endYear)}</div>
        </div>
        <div className="bg-ink-700 px-3 py-2 rounded-lg col-span-2">
          <div className="text-ink-500 mb-1">持续时长</div>
          <div className="text-bronze-400 font-serif">{duration} 年</div>
        </div>
        {era.capital && (
          <div className="bg-ink-700 px-3 py-2 rounded-lg col-span-2">
            <div className="text-ink-500 mb-1">都城</div>
            <div className="text-parchment-100 text-xs">
              📍 {era.capital[1].toFixed(2)}°N, {era.capital[0].toFixed(2)}°E
            </div>
          </div>
        )}
      </div>

      <div className="text-sm leading-relaxed text-parchment-100 mb-4">
        {era.description}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 mb-4">
        <button
          className="flex-1 px-3 py-2 rounded-lg bg-bronze-600/30 hover:bg-bronze-600/50 border border-bronze-500/50 text-bronze-400 text-sm transition-colors"
          onClick={() => setYear(Math.round((era.startYear + era.endYear) / 2))}
        >
          📅 跳到中心时间
        </button>
        {(() => {
          // 找该朝代关联的人物（people.json 中 eraIds 包含本 era.id）
          const eraPeople = people.filter((p) => p.eraIds.includes(era.id))
          if (eraPeople.length === 0) return null
          const main = eraPeople[0]
          const handleChat = () => {
            // 注入 persona 角色 + 打开 AI 面板
            aiSetContext(era.id, null, main.id)
            aiSetPersona(main.personaPrompt || `你是${main.name}，${main.role}。${main.description}`)
            aiNewThread(`与 ${main.name} 对话`)
            aiOpenPanel()
          }
          return (
            <button
              className="flex-1 px-3 py-2 rounded-lg bg-purple-900/30 hover:bg-purple-800/50 border border-purple-700/50 text-purple-300 text-sm transition-colors"
              onClick={handleChat}
              title={`与 ${main.name}（${main.role}）对话`}
            >
              💬 与 {main.name} 对话
            </button>
          )
        })()}
        {existingCardId ? (
          <button
            className="flex-1 px-3 py-2 rounded-lg bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 text-sm cursor-not-allowed"
            disabled
            title="已在复习列表中（点击 Header 复习按钮开始）"
          >
            ✓ 已加入复习
          </button>
        ) : (
          <button
            className="flex-1 px-3 py-2 rounded-lg bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-bronze-400 text-sm transition-colors"
            onClick={() => addCard({ kind: 'era', id: era.id })}
            title="加入间隔重复复习"
          >
            🎴 加入复习
          </button>
        )}
      </div>

      {/* 前/后朝代导航 */}
      {(prevEra || nextEra) && (
        <div className="mb-4 border-t border-ink-600 pt-3">
          <div className="text-xs text-ink-500 mb-1.5">朝代导航</div>
          <div className="grid grid-cols-2 gap-2">
            {prevEra ? (
              <button
                className="text-left px-2 py-1.5 rounded-lg bg-ink-700/40 hover:bg-ink-700 transition-colors"
                onClick={() => selectEra(prevEra.id)}
              >
                <div className="text-[9px] text-ink-500">← 前一朝代</div>
                <div className="text-xs truncate" style={{ color: prevEra.color }}>
                  {prevEra.name}
                </div>
              </button>
            ) : <div />}
            {nextEra ? (
              <button
                className="text-right px-2 py-1.5 rounded-lg bg-ink-700/40 hover:bg-ink-700 transition-colors"
                onClick={() => selectEra(nextEra.id)}
              >
                <div className="text-[9px] text-ink-500">后一朝代 →</div>
                <div className="text-xs truncate" style={{ color: nextEra.color }}>
                  {nextEra.name}
                </div>
              </button>
            ) : <div />}
          </div>
        </div>
      )}

      {/* 同时期其他文明 + 该文明下的大事（嵌套） */}
      {contemporaryEras.length > 0 && (
        <div className="mb-4 border-t border-ink-600 pt-3">
          <div className="text-xs text-ink-500 mb-2">同期世界文明</div>
          <div className="space-y-2">
            {contemporaryEras.map(e => {
              const events = eventsByContemporaryEra[e.id]
              return (
                <div key={e.id}>
                  <button
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-ink-700 transition-colors flex items-center gap-2"
                    onClick={() => selectEra(e.id)}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: e.color }}
                    />
                    <span className="flex-1 text-xs" style={{ color: e.color }}>
                      {e.name}
                    </span>
                    <span className="text-xs text-ink-500">
                      {e.startYear < 0 ? '前' + Math.abs(e.startYear) : e.startYear} ~ {e.endYear}
                    </span>
                  </button>
                  {/* 该文明下的大事件（importance ≥ 2，时间在朝代 + 文明时段内） */}
                  {events && events.length > 0 && (
                    <div className="ml-4 mt-1 pl-2 border-l border-ink-600/60 space-y-0.5">
                      {events.map(ev => (
                        <button
                          key={ev.id}
                          className="w-full text-left px-2 py-1.5 rounded-lg border border-transparent hover:border-bronze-500/60 hover:bg-bronze-900/20 transition-colors flex items-baseline gap-2 group"
                          onClick={() => {
                            selectEvent(ev.id)
                            setYear(ev.year)
                          }}
                          title="点击查看事件详情"
                        >
                          <span className="text-[9px] text-ink-500 font-serif shrink-0 w-10 tabular-nums">
                            {ev.year < 0 ? '前' + Math.abs(ev.year) : ev.year}
                          </span>
                          <span className="text-[11px] text-parchment-100 group-hover:text-bronze-200 flex-1 truncate transition-colors">{ev.title}</span>
                          <span className="text-[9px] text-ink-500 group-hover:text-bronze-400 shrink-0 transition-colors">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 兜底：不属于任何同期文明的世界大事（按 region 字段分组显示） */}
      {ungroupedWorldEvents.length > 0 && (() => {
        // 按 region 分组
        const byRegion: Record<string, typeof ungroupedWorldEvents> = {}
        for (const ev of ungroupedWorldEvents) {
          const r = ev.region || 'other'
          if (!byRegion[r]) byRegion[r] = []
          byRegion[r].push(ev)
        }
        // region 排序：other 在最后（最杂的）
        const order = Object.keys(byRegion).sort((a, b) => a === 'other' ? 1 : b === 'other' ? -1 : a.localeCompare(b))
        return (
          <div className="mb-4 border-t border-ink-600 pt-3">
            <div className="text-xs text-ink-500 mb-2">🌍 其他同时期大事（{ungroupedWorldEvents.length}）</div>
            <div className="space-y-2">
              {order.map(region => (
                <div key={region}>
                  <div className="text-xs text-ink-400 mb-1 px-2">
                    · {REGION_SHORT[region] || region}（{byRegion[region].length}）
                  </div>
                  <div className="ml-3 pl-2 border-l border-ink-600/60 space-y-0.5">
                    {byRegion[region].map(ev => (
                      <button
                        key={ev.id}
                        className="w-full text-left px-2 py-1.5 rounded-lg border border-transparent hover:border-bronze-500/60 hover:bg-bronze-900/20 transition-colors flex items-baseline gap-2 group"
                        onClick={() => { selectEvent(ev.id); setYear(ev.year) }}
                        title="点击查看事件详情"
                      >
                        <span className="text-[9px] text-ink-500 font-serif shrink-0 w-10 tabular-nums">
                          {ev.year < 0 ? '前' + Math.abs(ev.year) : ev.year}
                        </span>
                        <span className="text-[11px] text-parchment-100 group-hover:text-bronze-200 flex-1 truncate transition-colors">{ev.title}</span>
                        <span className="text-[9px] text-ink-500 group-hover:text-bronze-400 shrink-0 transition-colors">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* 该朝代下的事件（发展历程） */}
      {eraEvents.length > 0 && (
        <div className="border-t border-ink-600 pt-3">
          <div className="text-xs text-amber-400 mb-1.5">
            📜 {era.name} 发展历程（{eraEvents.length}）
          </div>
          <div className="space-y-1">
            {eraEvents.slice(0, 8).map(ev => (
              <button
                key={ev.id}
                className="w-full text-left px-2 py-1.5 rounded-lg border border-transparent hover:border-bronze-500/60 hover:bg-bronze-900/20 transition-colors flex items-baseline gap-2 group"
                onClick={() => {
                  selectEvent(ev.id)
                  setYear(ev.year)
                }}
                title="点击查看事件详情"
              >
                <span className="text-xs text-ink-500 font-serif shrink-0 w-12 tabular-nums">
                  {ev.year < 0 ? '前' + Math.abs(ev.year) : ev.year}
                </span>
                <span className="text-xs text-parchment-100 group-hover:text-bronze-200 truncate flex-1 transition-colors">{ev.title}</span>
                <span className="text-[9px] text-ink-500 group-hover:text-bronze-400 transition-colors">查看 →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 📜 关键大事时间线 */}
      {era.quickEvents && era.quickEvents.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-ink-700/40 border border-ink-600/60">
          <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📜 关键大事（{era.quickEvents.length}）· 点击查看详情</div>
          <div className="relative pl-5">
            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-bronze-600/40" />
            {era.quickEvents.map((ev, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedQuickEvent({ year: ev.year, title: ev.title, desc: ev.desc, longDesc: ev.longDesc, category: undefined, importance: undefined })
                }}
                className="w-full text-left relative pb-3 mb-1 last:pb-0 cursor-pointer rounded-lg border border-transparent hover:border-bronze-500/60 hover:bg-bronze-900/30 transition-colors group p-2 -ml-2"
                title="点击查看详情"
                style={{ zIndex: 10 }}
              >
                <div className="absolute -left-3.5 top-2.5 w-2 h-2 rounded-full bg-bronze-500 ring-2 ring-ink-900 group-hover:scale-150 transition-transform pointer-events-none" />
                <div className="text-xs text-bronze-400 tabular-nums">
                  {ev.year < 0 ? `BC ${-ev.year}` : `${ev.year}`}
                </div>
                <div className="text-xs font-serif text-parchment-50 group-hover:text-bronze-200 transition-colors mt-0.5">{ev.title}</div>
                {ev.desc && <div className="text-xs text-ink-500 mt-0.5 line-clamp-1">{ev.desc}</div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 历史意义 / 后期影响 */}
      {era.legacy && (
        <div className="mt-4 p-3 rounded-lg bg-bronze-900/20 border border-bronze-700/40">
          <div className="text-xs text-bronze-400 uppercase tracking-wider mb-1.5">🎯 历史意义 / 对后世影响</div>
          <div className="text-xs text-parchment-50 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdownBold(era.legacy) }} />
        </div>
      )}

      {/* 🔗 与前后朝代连接 */}
      {era.succession && (era.succession.predecessor || era.succession.successor) && (
        <div className="mt-4 p-3 rounded-lg bg-ink-700/40 border border-ink-600/60">
          <div className="text-xs text-ink-500 uppercase tracking-wider mb-1.5">🔗 朝代连续性</div>
          {era.succession.predecessor && (
            <div className="text-xs text-ink-300 mb-1">
              <span className="text-ink-500">← 前承：</span>{era.succession.predecessor}
            </div>
          )}
          {era.succession.successor && (
            <div className="text-xs text-ink-300 mb-1">
              <span className="text-ink-500">后继：</span>{era.succession.successor} →
            </div>
          )}
          {era.succession.note && (
            <div className="text-xs text-ink-500 italic mt-1">{era.succession.note}</div>
          )}
        </div>
      )}
    </div>
  )

  // 关键大事详情弹窗
  {selectedQuickEvent && era && (
    <QuickEventDetail
      event={selectedQuickEvent!}
      eraName={era!.name}
      eraColor={era!.color}
      onClose={() => setSelectedQuickEvent(null)}
    />
  )}
}

/** 把 **加粗** 转成 <strong>，段落用 <p> 分隔（保持其他文本安全） */
function renderMarkdownBold(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-bronze-300">$1</strong>')
  // 把换行/句号后空格拆成段落
  return escaped
    .split(/\n+|(?<=[。！？!?])\s+/)
    .filter(p => p.trim())
    .map(p => `<p class="leading-relaxed">${p.trim()}</p>`)
    .join('')
}
// ============= 关键大事详情弹窗 =============
function QuickEventDetail({ event, eraName, eraColor, onClose }: {
  event: { year: number; title: string; desc?: string; longDesc?: string; category?: string; importance?: number }
  eraName: string
  eraColor: string
  onClose: () => void
}) {
  const aiSetContext = useAIStore(s => s.setContext)
  const aiSetPersona = useAIStore(s => s.setPersonaPrompt)
  const aiNewThread = useAIStore(s => s.newThread)
  const aiOpenPanel = useAIStore(s => s.openPanel)

  const yearLabel = event.year < 0 ? `公元前 ${-event.year} 年` : `${event.year} 年`

  // 智能推断事件类型
  const eventType = inferEventType(event.title)

  // 事件图片（Bing）— 与 era 联动，更精准
  const imgKw = `${event.title} ${eraName} historical`
  const eventImg = bingImage(imgKw, 800, 450)

  // 让 AI 详细解释这个事件
  const handleAskAI = () => {
    const persona = `你是历史学家，专精 ${eraName}（公元前/公元 1 年到现在）时期的历史。
用户询问的关键事件是「${event.title}」（${yearLabel}）：${event.desc || ''}

请详细解释这个事件：
1. 事件背景（为什么会发生）
2. 详细经过（谁参与/在哪里/发生了什么）
3. 短期影响（直接后果）
4. 长期影响（对后世/中国/世界）
5. 关键人物（参与者）
6. 历史评价/争议

用通俗准确的语言回答，2-4 段话。`
    aiSetContext(null, null, null)
    aiSetPersona(persona)
    aiNewThread(`关于 ${event.title}`)
    aiOpenPanel()
    onClose()
  }

  return (
    <ModalShell
      isOpen
      onClose={onClose}
      innerStyle={{ borderColor: eraColor + '60' }}
    >
        {/* 顶部：事件图片（16:9 Bing 缩略图，与其他详情页一致） */}
        <div className="relative w-full bg-ink-900" style={{ aspectRatio: '16/9' }}>
          {/* 兜底：时代色渐变 + 事件名首字 */}
          <div
            className="absolute inset-0 flex items-center justify-center select-none"
            style={{ background: `linear-gradient(135deg, ${eraColor}55 0%, ${eraColor}22 100%)` }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-serif font-bold shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${eraColor} 0%, ${eraColor}aa 100%)`,
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {event.title.charAt(0)}
            </div>
          </div>
          {/* img：真实事件图（Bing）— 加载成功后覆盖在兜底上 */}
          <img
            src={eventImg}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover z-10"
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          {/* 渐变覆盖层（让标题清晰可读） */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/30 to-transparent pointer-events-none z-10" />
          {/* 标题覆盖在图片底部 */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pt-8 pb-4 z-20">
            <div className="text-xs text-bronze-300 mb-1 tracking-wider uppercase">
              {eraName} · {eventType} · {yearLabel}
            </div>
            <h2 className="text-2xl font-serif leading-snug" style={{ color: eraColor }}>
              {event.title}
            </h2>
          </div>
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 text-parchment-50/80 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg bg-ink-900/60 hover:bg-ink-900/80 backdrop-blur"
            title="关闭 (ESC)"
            aria-label="关闭"
          >×</button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* 详细描述（longDesc）— 多段文字，与其他详情页一致 */}
          {event.longDesc && (
            <div>
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">📖 事件详情</div>
              <div
                className="text-sm text-parchment-100 leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{ __html: renderMarkdownBold(event.longDesc) }}
              />
            </div>
          )}

          {/* 一句话简介（desc）— 突出显示 */}
          {event.desc && (
            <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">📋 一句话简介</div>
              <div className="text-sm text-bronze-300 font-serif italic">{event.desc}</div>
            </div>
          )}

          {/* 上下文信息：所属文明 / 时间 / 分类 — 2x2 网格 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">🏛️ 所属文明</div>
              <div className="text-sm font-serif" style={{ color: eraColor }}>{eraName}</div>
            </div>
            <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">📅 时间</div>
              <div className="text-sm text-bronze-300 font-serif">{yearLabel}</div>
            </div>
            <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">📂 分类</div>
              <div className="text-sm text-parchment-50">{eventType}</div>
            </div>
            <div className="p-3 rounded-lg bg-ink-700/30 border border-ink-600/40">
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">⭐ 重要程度</div>
              <div className="text-sm text-parchment-50">
                {event.importance === 3 ? '⭐⭐⭐ 关键' : event.importance === 2 ? '⭐⭐ 重要' : '⭐ 一般'}
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="px-6 pb-6">
          <button
            onClick={handleAskAI}
            className="w-full px-4 py-3 rounded-lg bg-purple-700/40 hover:bg-purple-600/60 border border-purple-500/50 text-purple-200 text-sm font-serif transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-base">🤖</span>
            <span>让 AI 详细讲解这个事件</span>
          </button>
          <div className="text-xs text-ink-500 text-center mt-2">
            AI 将解释：背景 / 经过 / 影响 / 关键人物 / 历史评价
          </div>
        </div>
    </ModalShell>
  )
}

// 推断事件类型（基于标题关键词）
function inferEventType(title: string): string {
  if (/(建立|建国|创建|立国|开国)/.test(title)) return '建国'
  if (/(战争|战役|征服|入侵|起义|兵变|平定|伐|攻陷|击败|大捷)/.test(title)) return '战争'
  if (/(即位|继位|登基|加冕|称帝|称王)/.test(title)) return '即位'
  if (/(改革|变法|维新|改制)/.test(title)) return '改革'
  if (/(鼎盛|繁荣|黄金时代|盛世|崛起)/.test(title)) return '鼎盛'
  if (/(衰|亡|灭|覆灭|终结|陷落|灭亡)/.test(title)) return '衰亡'
  if (/(迁|迁都|迁都|移民)/.test(title)) return '迁都'
  if (/(建|修|筑|造|成)/.test(title)) return '建设'
  return '关键事件'
}
