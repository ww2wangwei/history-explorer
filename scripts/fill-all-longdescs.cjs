// 补齐所有 quickEvents 的 longDesc
// 策略：
// 1. 优先复用 events.json 里同名事件的 description
// 2. 用模板按 era + title 智能生成（基于标题关键词）
// 3. 实在没信息用通用模板

const fs = require('fs');
const eras = JSON.parse(fs.readFileSync('src/data/eras.json', 'utf8'));
const events = JSON.parse(fs.readFileSync('src/data/events.json', 'utf8'));

// 1. events.json 索引（按 title）
const eventsByTitle = new Map();
for (const e of events) {
  if (e.title && e.description && e.description.length > 30) {
    eventsByTitle.set(e.title.trim(), e.description);
  }
}

// 2. 通用 longDesc 模板（按 era 类别）
function makeLongDesc(era, ev) {
  const title = ev.title
  const year = ev.year
  const yearLabel = year < 0 ? `公元前 ${-year}` : `${year}`
  const desc = ev.desc || ''
  const eraName = era.name

  // 按 title 关键词生成
  if (/建立|创建|建国|开国|建都/.test(title)) {
    return `${eraName} 时期的关键事件。${yearLabel} 年，${title}。${desc ? '背景说明：' + desc : '这是该文明发展史上的奠基性事件。'}这标志着 ${eraName} 进入了一个新阶段。`
  }
  if (/战争|战役|入侵|起义|伐|攻|大捷|击败|征服/.test(title)) {
    return `${eraName} 时期（${yearLabel} 年）发生的重大军事事件："${title}"。${desc ? '战事概况：' + desc : '这是一场影响深远的军事行动。'}这次军事行动改变了 ${eraName} 的政治格局和领土版图，对后世产生了重要影响。`
  }
  if (/改革|变法|新政/.test(title)) {
    return `${eraName} 时期（${yearLabel} 年）进行的重大改革："${title}"。${desc ? '改革内容：' + desc : '这是该文明为应对内忧外患而进行的社会改革。'}改革通常涉及政治制度、经济基础、文化教育等多个层面，对后世产生深远影响。`
  }
  if (/即位|继位|登基|称帝|加冕/.test(title)) {
    return `${eraName} 时期（${yearLabel} 年）的重要权力交接："${title}"。${desc ? '背景：' + desc : '这是统治者更替的关键时刻。'}新君主的政策和性格往往决定了 ${eraName} 未来数十年的走向。`
  }
  if (/鼎盛|黄金|盛世|崛起|繁荣/.test(title)) {
    return `${eraName} 时期（${yearLabel} 年）达到鼎盛："${title}"。${desc ? '盛况：' + desc : '这是该文明的黄金时代。'}在政治、经济、文化等方面都取得了重大成就，奠定了后世的基础。`
  }
  if (/衰|亡|灭|陷落|终结|覆灭|被灭/.test(title)) {
    return `${eraName} 时期（${yearLabel} 年）的衰亡事件："${title}"。${desc ? '衰亡过程：' + desc : '这是该文明走向终结的转折点。'}其原因通常是内部矛盾激化、外部压力加大、或自然灾变。一个时代的结束，往往也是另一个时代的开始。`
  }
  if (/建|修|筑|造|成/.test(title)) {
    return `${eraName} 时期（${yearLabel} 年）建成的工程/作品："${title}"。${desc ? '说明：' + desc : '这是该文明的代表性建设成就。'}它体现了当时的技术水平和文化审美，许多至今仍是世界文化遗产。`
  }

  // 默认模板
  return `${eraName} 时期（${yearLabel} 年）发生的重要事件："${title}"。${desc ? desc : '这是该文明发展史上的重要节点。'}这一事件对当时及后世都产生了深远影响。`
}

let matchedFromEvents = 0
let generated = 0
let alreadyHas = 0
let stillEmpty = 0

for (const era of eras) {
  if (!era.quickEvents) continue
  for (let i = 0; i < era.quickEvents.length; i++) {
    const ev = era.quickEvents[i]
    if (ev.longDesc && ev.longDesc.length > 50) {
      alreadyHas++
      continue
    }
    // 1) 从 events.json 找
    const fromEvents = eventsByTitle.get(ev.title?.trim())
    if (fromEvents && fromEvents.length > 50) {
      ev.longDesc = fromEvents
      matchedFromEvents++
      continue
    }
    // 2) 模板生成
    const generated_text = makeLongDesc(era, ev)
    if (generated_text) {
      ev.longDesc = generated_text
      generated++
    } else {
      stillEmpty++
    }
  }
}
fs.writeFileSync('src/data/eras.json', JSON.stringify(eras, null, 2) + '\n')
console.log('Already had:', alreadyHas)
console.log('From events.json:', matchedFromEvents)
console.log('Generated (template):', generated)
console.log('Still empty:', stillEmpty)
console.log('Total:', alreadyHas + matchedFromEvents + generated + stillEmpty)
