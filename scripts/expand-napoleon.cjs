// 重写拿破仑加冕
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/scenarios.json', 'utf8'));

const newNapoleon = {
  id: 'napoleon-coronation',
  title: '拿破仑加冕',
  subtitle: '你是拿破仑·波拿巴，1804 年的巴黎',
  era: '法国',
  year: 1804,
  location: '巴黎圣母院',
  icon: '👑',
  color: '#c89a5b',
  background: `你是拿破仑·波拿巴（Napoleon Bonaparte），法兰西第一共和国第一执政，现在即将成为法兰西第一帝国皇帝。

你 1769 年生于科西嘉岛——仅仅一年前，这个岛屿才从热那亚共和国卖给法国。你父亲是个律师，母亲则在他 10 岁时把全家的积蓄用于他的教育。

1785 年，你从巴黎军事学院毕业，以炮兵少尉身份入伍。

法国大革命爆发时（1789 年），你还是个默默无闻的军官。但你凭借卓越的军事才能迅速崛起：土伦战役（1793）击败保王党军队、收复土伦，你一战成名，年仅 24 岁就晋升为准将。

1796 年，你与约瑟芬·德·博阿尔内结婚——她比你大 6 岁，是前贵族的遗孀。同年，你指挥意大利军团远征意大利，以少胜多击败奥地利和撒丁联军，被称颂为革命军最优秀的将领。

1799 年，你发动雾月十八日政变，推翻督政府，建立执政府，你任第一执政。

1804 年，你已是法兰西的实际统治者。你需要的不再是执政之名，而是皇帝之实。

1804 年 5 月，元老院通过法案宣布你为"法兰西人的皇帝"。同年 12 月 2 日，你将在巴黎圣母院举行加冕仪式。

这是你的登基大典。`,
  scenes: [
    {
      id: 's1',
      title: '圣母院前',
      image: 'notre dame',
      text: `1804 年 12 月 2 日清晨。巴黎圣母院。

你穿着华丽的大帝礼服——紫红色天鹅绒，绣满金色蜜蜂图案（蜜蜂是你的新徽记，取代了波旁王朝的百合花）。

教皇庇护七世端坐祭坛，等待为你加冕。他不远千里从罗马来到巴黎，是因为他希望通过加冕让法国教会与新政权和解。

圣母院内外金碧辉煌。观礼台上，教皇派、奥地利代表（你的敌人）、旧贵族（你曾经的敌人）、革命元老（你的战友）、军队将领（你的权力基础）分庭抗礼。

你从香榭丽舍大街缓缓走来，8 匹白色高头大马拉着金色御辇。

但你的心中有疑虑——教皇从你手中加冕，意味着你的权力来自上帝。

你要展示：权力来自你自身。`,
      npcName: '约瑟芬',
      npcRole: '你的妻子，约瑟芬皇后',
      npcContext: '你是约瑟芬·德·博阿尔内，拿破仑挚爱的妻子。你比他大 6 岁，曾是贵族遗孀。你在政治上多次为他出谋划策，但因未能生育继承人，你最终接受了离婚。',
      choices: [
        { id: 'c1a', text: '按传统：跪在教皇面前接受加冕。', next: 's2', outcome: '你尊重教皇权威', historicalNote: '历史事实：拿破仑最终没跪——他从教皇手中夺过皇冠自己戴上。' },
        { id: 'c1b', text: '向约瑟芬低声：今日之后，我们将是皇帝与皇后。', next: 's2', outcome: '你向她表忠心', historicalNote: '历史事实：约瑟芬 1809 年因不育被离婚。' },
        { id: 'c1c', text: '大步上前，仪式由我来定义。', next: 's2', outcome: '你展现强势', historicalNote: '历史事实：拿破仑从教皇手中夺皇冠自行加冕。' }
      ]
    },
    {
      id: 's2',
      title: '皇冠的重量',
      image: 'crown',
      text: `加冕大典开始。教皇高举王冠，准备为你加冕。

圣母院中数千人屏息——教皇代表上帝，而你是革命的继承者。

关键时刻到了。`,
      npcName: '庇护七世',
      npcRole: '罗马教皇',
      npcContext: '你是庇护七世，罗马教皇。你不远千里来到巴黎为拿破仑加冕，是因为你希望通过加冕让法国教会与新政权和解。但拿破仑的野心让你深感不安。',
      choices: [
        { id: 'c2a', text: '从教皇手中接过皇冠，自己戴在头上。', next: 's3', outcome: '你自戴皇冠', historicalNote: '历史事实：拿破仑在加冕时从教皇手中夺过皇冠自行戴上——这是法国大革命的延续——王冠不属于教皇。' },
        { id: 'c2b', text: '按仪式跪下接受加冕，向教皇致意。', next: 's3', outcome: '你选择传统', historicalNote: '历史假设：若拿破仑接受加冕，可能与教会关系更融洽。' },
        { id: 'c2c', text: '先为约瑟芬加冕，再为自己。', next: 's3', outcome: '你把约瑟芬放在前面', historicalNote: '历史事实：拿破仑确实先为约瑟芬加冕。' }
      ]
    },
    {
      id: 's3',
      title: '皇帝的宣言',
      image: 'emperor throne',
      text: `你头戴皇冠，手持权杖。教皇退坐一旁。

台下是观礼的将军、外交官、议员。英、俄、奥、普的使节冷眼旁观。

你开口了——`,
      npcName: '塔列朗',
      npcRole: '你的外交大臣',
      npcContext: '你是塔列朗，外交大臣。你曾是大革命时期的贵族、外交家，政变中你支持拿破仑。你深谙权力平衡之道，是欧洲最老练的外交家。',
      choices: [
        { id: 'c3a', text: '承诺：朕将继承革命精神，建立自由平等。', next: 'ending_liberal', outcome: '你强调革命精神', historicalNote: '历史事实：拿破仑称帝后颁布《拿破仑法典》，是革命精神的延续。' },
        { id: 'c3b', text: '承诺：朕将让法兰西的荣耀照耀欧洲。', next: 'ending_glory', outcome: '你强调帝国荣耀', historicalNote: '历史事实：拿破仑确实在 1805-1807 年让法兰西帝国达到顶峰。' },
        { id: 'c3c', text: '保持沉默，让你的将军们欢呼。', next: 'ending_silent', outcome: '你保持神秘感', historicalNote: '历史事实：拿破仑的政治魅力很大程度来自他的神秘感。' }
      ]
    }
  ],
  endings: [
    { id: 'ending_liberal', title: '📜 法典之帝', text: '你颁布《拿破仑法典》，确立了私有财产、契约自由、世俗国家。这些原则在 200 年后的今天仍是大陆法系的基石。', isWin: true, historicalReality: '《拿破仑法典》被誉为现代民法的基础，影响了全世界 70 多个国家的法律，包括中国（1980 年代后的合同法、物权法都深受其影响）。', lessons: ['革命的精神在制度中永生', '法典比战争更持久', '权力要为理念服务'] },
    { id: 'ending_glory', title: '🏆 帝国荣光', text: '你大败奥地利、普鲁士，称霸欧洲。特拉法尔加海战失利后你转向大陆体系，征俄失败。1815 年滑铁卢战败，流放圣赫勒拿岛。', isWin: true, historicalReality: '拿破仑帝国只持续了 10 年，但他的影响延续至今。', lessons: ['军事天才弥补不了战略短视', '俄国是帝国的终结者', '传奇的失败也是传奇'] },
    { id: 'ending_silent', title: '👤 神秘之帝', text: '你沉默的高贵让欧洲既敬畏又猜疑。你的统治依靠的不是言语而是行动。', isWin: true, historicalReality: '拿破仑的沉默常常比言语更有效', lessons: ['权力有时不需要言语', '神秘感是统治工具'] }
  ]
}

const idx = data.findIndex(s => s.id === 'napoleon-coronation');
if (idx === -1) { console.error('not found'); process.exit(1); }
data[idx] = newNapoleon;
fs.writeFileSync('src/data/scenarios.json', JSON.stringify(data, null, 2) + '\n');
console.log('napoleon-coronation scenes:', data[idx].scenes.length, '| bg:', data[idx].background.length, '字');
