/**
 * SectionPreview —— 13 个学习板块的专属内嵌预览 SVG
 *
 * 灵感：motionsites.ai 的 wide preview cards
 * 每个板块都有独特的视觉元素，体现该板块内容
 */

interface Props {
  sectionId: string
  color: string
}

/** 全人物：6 个圆形头像网格 */
function FiguresPreview({ color }: { color: string }) {
  const chars = ['秦', '汉', '唐', '宋', '元', '明']
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      {chars.map((c, i) => {
        const x = 28 + (i % 3) * 60
        const y = 30 + Math.floor(i / 3) * 50
        return (
          <g key={i}>
            {/* 圆形头像 */}
            <circle cx={x} cy={y} r="18" fill={`${color}33`} stroke={color} strokeWidth="1.5" />
            {/* 首字 */}
            <text x={x} y={y + 7} textAnchor="middle" fill="rgb(245,239,223)" fontSize="16" fontWeight="bold" fontFamily="serif">
              {c}
            </text>
            {/* 装饰线 */}
            <line x1={x - 18} y1={y + 26} x2={x + 18} y2={y + 26} stroke={color} strokeOpacity="0.5" strokeWidth="0.5" />
          </g>
        )
      })}
      {/* 标题装饰 */}
      <text x="100" y="125" textAnchor="middle" fill={color} fontSize="9" opacity="0.7" letterSpacing="2">人物群像</text>
    </svg>
  )
}

/** 全战争：交叉的剑 + 战场条纹 */
function WarsPreview({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      {/* 战场背景条纹 */}
      {[20, 40, 60, 80, 100, 120].map(y => (
        <line key={y} x1="20" y1={y} x2="180" y2={y} stroke={color} strokeOpacity="0.15" strokeWidth="1" />
      ))}
      {/* 交叉的双剑 */}
      <g transform="translate(100, 70)">
        <line x1="-45" y1="-45" x2="45" y2="45" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="45" y1="-45" x2="-45" y2="45" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {/* 剑柄 */}
        <circle cx="0" cy="0" r="6" fill="rgb(184,67,58)" stroke={color} strokeWidth="1.5" />
        {/* 剑格 */}
        <rect x="-3" y="-50" width="6" height="6" fill={color} />
        <rect x="-3" y="44" width="6" height="6" fill={color} />
        <rect x="44" y="-3" width="6" height="6" fill={color} transform="rotate(90 47 0)" />
        <rect x="-50" y="-3" width="6" height="6" fill={color} transform="rotate(90 -47 0)" />
      </g>
      {/* 装饰文字 */}
      <text x="100" y="125" textAnchor="middle" fill={color} fontSize="9" opacity="0.7" letterSpacing="2">烽火连天</text>
    </svg>
  )
}

/** 全文化：卷轴 + 文字 */
function CulturesPreview({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      {/* 卷轴 */}
      <rect x="30" y="20" width="140" height="100" fill="rgb(245,239,223)" stroke={color} strokeWidth="1.5" rx="2" />
      {/* 上卷头 */}
      <rect x="25" y="15" width="150" height="8" fill={`${color}55`} stroke={color} strokeWidth="1" rx="2" />
      {/* 下卷头 */}
      <rect x="25" y="117" width="150" height="8" fill={`${color}55`} stroke={color} strokeWidth="1" rx="2" />
      {/* 卷内文字 */}
      <g fill={color} opacity="0.8" fontFamily="serif" fontSize="10" textAnchor="middle">
        <text x="100" y="42">道 · 德 · 经</text>
        <text x="100" y="60">儒 · 释 · 道</text>
        <text x="100" y="78">诗 · 书 · 礼</text>
        <text x="100" y="96">易 · 乐 · 春</text>
      </g>
      <text x="100" y="135" textAnchor="middle" fill={color} fontSize="8" opacity="0.6">百家争鸣</text>
    </svg>
  )
}

/** 全地理：简化世界地图 */
function GeographyPreview({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      {/* 海洋背景 */}
      <rect x="10" y="20" width="180" height="100" fill={`${color}11`} rx="4" />
      {/* 经线 */}
      {[40, 60, 100, 140, 160].map(x => (
        <line key={`m${x}`} x1={x} y1="20" x2={x} y2="120" stroke={color} strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2,2" />
      ))}
      {/* 纬线 */}
      {[40, 80, 100].map(y => (
        <line key={`p${y}`} x1="10" y1={y} x2="190" y2={y} stroke={color} strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2,2" />
      ))}
      {/* 简化的陆地（不规则形状） */}
      <path d="M30,50 Q50,40 70,55 T100,70 Q120,65 140,75 T170,80" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.6" />
      <path d="M40,90 Q60,80 80,95 T110,105 Q130,100 150,110" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.6" />
      {/* 山脉标记 */}
      <path d="M50,75 L55,68 L60,75" fill={color} stroke="none" opacity="0.7" />
      <path d="M120,60 L125,52 L130,60" fill={color} stroke="none" opacity="0.7" />
      <path d="M155,90 L160,83 L165,90" fill={color} stroke="none" opacity="0.7" />
      {/* 罗盘 */}
      <circle cx="170" cy="40" r="6" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
      <text x="170" y="43" textAnchor="middle" fill={color} fontSize="6" opacity="0.7">N</text>
    </svg>
  )
}

/** 全诗词：竖排文字 */
function PoemsPreview({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      {/* 宣纸背景 */}
      <rect x="30" y="15" width="140" height="110" fill="rgb(245,239,223)" stroke={color} strokeWidth="1" rx="2" />
      {/* 竖排文字 */}
      {['床', '前', '明', '月', '光', '疑', '是', '地', '上', '霜'].map((c, i) => (
        <text
          key={i}
          x={70 + (i % 5) * 18}
          y={30 + Math.floor(i / 5) * 36}
          textAnchor="middle"
          fill={color}
          fontSize="14"
          fontFamily="serif"
          opacity={0.85}
        >
          {c}
        </text>
      ))}
      <text x="100" y="135" textAnchor="middle" fill={color} fontSize="8" opacity="0.6">诗酒趁年华</text>
    </svg>
  )
}

/** 中西方文明大对比：阴阳 */
function CivilizationsPreview({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      {/* 阴阳 */}
      <g transform="translate(100, 70)">
        <circle r="40" fill={color} opacity="0.85" />
        <path d="M0,-40 A40,40 0 0,1 0,40 A20,20 0 0,1 0,0 A20,20 0 0,0 0,-40 Z" fill="rgb(245,239,223)" opacity="0.95" />
        <circle cx="0" cy="-20" r="6" fill="rgb(245,239,223)" />
        <circle cx="0" cy="20" r="6" fill={color} />
      </g>
      {/* 左右标注 */}
      <text x="35" y="125" fill={color} fontSize="9" opacity="0.75">东</text>
      <text x="155" y="125" fill={color} fontSize="9" opacity="0.75">西</text>
    </svg>
  )
}

/** 穿越历史：面具 + 钟表 */
function TimeTravelPreview({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      {/* 钟表 */}
      <circle cx="100" cy="70" r="42" fill="none" stroke={color} strokeWidth="2" />
      {/* 钟表刻度 */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
        const r1 = 36, r2 = i % 3 === 0 ? 30 : 33
        const rad = (deg - 90) * Math.PI / 180
        return (
          <line key={i} x1={100 + Math.cos(rad) * r1} y1={70 + Math.sin(rad) * r1}
            x2={100 + Math.cos(rad) * r2} y2={70 + Math.sin(rad) * r2}
            stroke={color} strokeWidth={i % 3 === 0 ? 1.5 : 0.8} />
        )
      })}
      {/* 指针 */}
      <line x1="100" y1="70" x2="100" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="100" y1="70" x2="120" y2="70" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="100" cy="70" r="3" fill={color} />
      {/* 面具（左上角） */}
      <g transform="translate(40, 35)" opacity="0.6">
        <ellipse cx="0" cy="0" rx="14" ry="10" fill={color} />
        <circle cx="-5" cy="-2" r="2" fill="rgb(245,239,223)" />
        <circle cx="5" cy="-2" r="2" fill="rgb(245,239,223)" />
      </g>
      <text x="100" y="128" textAnchor="middle" fill={color} fontSize="8" opacity="0.6">穿梭千年</text>
    </svg>
  )
}

/** 全问题：问号 */
function QuestionsPreview({ color }: { color: string }) {
  const qs = ['?', '?', '?', '?', '?']
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      {/* 思考气泡 */}
      <g transform="translate(100, 70)">
        <ellipse cx="0" cy="-20" rx="35" ry="22" fill={color} opacity="0.85" />
        <circle cx="-15" cy="14" r="6" fill={color} opacity="0.85" />
        <circle cx="-22" cy="24" r="3" fill={color} opacity="0.85" />
      </g>
      {/* 大问号 */}
      <text x="100" y="78" textAnchor="middle" fill="rgb(245,239,223)" fontSize="36" fontWeight="bold" fontFamily="serif">?</text>
      {/* 小问号 */}
      {[-50, -30, 30, 50].map((x, i) => (
        <text key={i} x={100 + x} y={120 + (i % 2) * 8} textAnchor="middle" fill={color} fontSize="14" opacity="0.6">?</text>
      ))}
    </svg>
  )
}

/** 全艺术：调色板 + 画笔 */
function ArtsPreview({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      {/* 调色板 */}
      <ellipse cx="80" cy="80" rx="55" ry="40" fill={color} opacity="0.7" />
      <ellipse cx="80" cy="70" rx="40" ry="22" fill="rgb(245,239,223)" />
      {/* 颜料点 */}
      <circle cx="55" cy="75" r="6" fill="rgb(184,67,58)" />
      <circle cx="75" cy="60" r="6" fill="rgb(91,155,200)" />
      <circle cx="95" cy="65" r="6" fill="rgb(200,154,91)" />
      <circle cx="115" cy="75" r="6" fill="rgb(155,126,182)" />
      <circle cx="65" cy="95" r="6" fill="rgb(91,200,154)" />
      <circle cx="100" cy="95" r="6" fill="rgb(232,121,185)" />
      {/* 画笔 */}
      <g transform="translate(150, 50) rotate(35)">
        <rect x="-3" y="0" width="6" height="40" fill={color} />
        <polygon points="0,-5 -3,0 3,0" fill="rgb(60,40,30)" />
        <polygon points="0,45 -3,40 3,40" fill="rgb(184,67,58)" />
      </g>
    </svg>
  )
}

/** 全文明：地球 */
function WorldHistoryPreview({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      {/* 地球 */}
      <circle cx="100" cy="70" r="50" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
      {/* 经纬线 */}
      <ellipse cx="100" cy="70" rx="50" ry="20" fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="0.5" />
      <ellipse cx="100" cy="70" rx="20" ry="50" fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="0.5" />
      <ellipse cx="100" cy="70" rx="40" ry="50" fill="none" stroke={color} strokeOpacity="0.3" strokeWidth="0.5" />
      {/* 大陆斑块 */}
      <ellipse cx="80" cy="55" rx="15" ry="8" fill={color} opacity="0.7" />
      <ellipse cx="115" cy="70" rx="12" ry="10" fill={color} opacity="0.7" />
      <ellipse cx="85" cy="90" rx="14" ry="6" fill={color} opacity="0.7" />
      <ellipse cx="125" cy="55" rx="8" ry="6" fill={color} opacity="0.7" />
      {/* 文明标记点 */}
      {[[60, 55], [115, 70], [85, 90], [140, 60]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3" fill="rgb(184,67,58)" />
          <circle cx={x} cy={y} r="6" fill="none" stroke="rgb(184,67,58)" strokeOpacity="0.5" />
        </g>
      ))}
    </svg>
  )
}

/** 今日复习：卡片堆叠 */
function ReviewPreview({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      {/* 3张堆叠卡片 */}
      <g transform="translate(100, 75)">
        {[0, 1, 2].map(i => (
          <g key={i} transform={`rotate(${(i - 1) * 8}, 0, ${(i - 1) * 8}) translate(${(i - 1) * 12}, ${-(i - 1) * 8})`}>
            <rect x="-40" y="-30" width="80" height="60" fill="rgb(245,239,223)" stroke={color} strokeWidth="1.5" rx="3" />
            {i === 2 && (
              <>
                <line x1="-30" y1="-15" x2="30" y2="-15" stroke={color} strokeOpacity="0.4" strokeWidth="1" />
                <line x1="-30" y1="-5" x2="20" y2="-5" stroke={color} strokeOpacity="0.4" strokeWidth="1" />
                <line x1="-30" y1="5" x2="25" y2="5" stroke={color} strokeOpacity="0.4" strokeWidth="1" />
                <text x="0" y="20" textAnchor="middle" fill={color} fontSize="8" fontWeight="bold">?</text>
              </>
            )}
          </g>
        ))}
      </g>
      {/* 复习钟 */}
      <g transform="translate(160, 30)">
        <circle r="10" fill="none" stroke={color} strokeWidth="1.5" />
        <line x1="0" y1="0" x2="0" y2="-6" stroke={color} strokeWidth="1.2" />
        <line x1="0" y1="0" x2="5" y2="0" stroke={color} strokeWidth="1.2" />
      </g>
    </svg>
  )
}

/** 文史天梯：梯子台阶 */
function LadderPreview({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      {/* 梯子侧柱 */}
      <line x1="60" y1="20" x2="60" y2="120" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="140" y1="20" x2="140" y2="120" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* 横档 */}
      {[35, 55, 75, 95, 115].map(y => (
        <g key={y}>
          <line x1="60" y1={y} x2="140" y2={y} stroke={color} strokeWidth="2" />
          <circle cx="60" cy={y} r="2" fill={color} />
          <circle cx="140" cy={y} r="2" fill={color} />
        </g>
      ))}
      {/* 顶冠 */}
      <polygon points="100,12 92,20 108,20" fill={color} />
      <circle cx="100" cy="14" r="2" fill="rgb(184,67,58)" />
      {/* 文字 */}
      <text x="100" y="135" textAnchor="middle" fill={color} fontSize="8" opacity="0.6">学·测·记·问</text>
    </svg>
  )
}

/** 朝代时间线：简化横条 */
function TimelineSmallPreview({ color }: { color: string }) {
  const eras = [
    { w: 18, c: '#a84a2c' },
    { w: 12, c: '#c89a5b' },
    { w: 22, c: '#5bc89a' },
    { w: 14, c: '#b85450' },
    { w: 20, c: '#9b7eb6' },
    { w: 14, c: '#a84a2c' },
  ]
  let x = 6
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      <rect x="6" y="58" width="188" height="2" fill={color} opacity="0.3" />
      {eras.map((e, i) => {
        const rect = <rect key={i} x={x} y={62} width={e.w} height="14" fill={e.c} rx="1" />
        x += e.w + 2
        return rect
      })}
      <text x="100" y="100" textAnchor="middle" fill={color} fontSize="8" opacity="0.6">历 · 朝 · 更 · 迭</text>
    </svg>
  )
}

export default function SectionPreview({ sectionId, color }: Props) {
  switch (sectionId) {
    case 'timeline':     return <TimelineSmallPreview color={color} />
    case 'allFigures':   return <FiguresPreview color={color} />
    case 'allWars':      return <WarsPreview color={color} />
    case 'allCultures':  return <CulturesPreview color={color} />
    case 'allGeography': return <GeographyPreview color={color} />
    case 'allPoems':     return <PoemsPreview color={color} />
    case 'civilizations':return <CivilizationsPreview color={color} />
    case 'timeTravel':   return <TimeTravelPreview color={color} />
    case 'allQuestions': return <QuestionsPreview color={color} />
    case 'allArts':      return <ArtsPreview color={color} />
    case 'worldHistory': return <WorldHistoryPreview color={color} />
    case 'review':       return <ReviewPreview color={color} />
    case 'ladder':       return <LadderPreview color={color} />
    default:            return null
  }
}