// 重写哈廷会战（十字军东征）
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/scenarios.json', 'utf8'));

const newCrusades = {
  id: 'crusades',
  title: '哈廷会战（十字军东征）',
  subtitle: '你是鲍德温四世，1187 年的耶路撒冷',
  era: '中东',
  year: 1187,
  location: '耶路撒冷王国',
  icon: '⚔️',
  color: '#9b7eb6',
  background: `你是耶路撒冷王国的麻风王鲍德温四世（Baldwin IV）。

你 1161 年出生，是阿马里克一世（Amalric I）和阿格尼丝·德·库尔滕（Agnes of Courtenay）的儿子。你 13 岁登基时就患上了麻风病——一种不治之症，会慢慢侵蚀你的身体。到 16 岁时，你已面目全非、双手萎缩、双目近乎失明。

但你是有史以来最杰出的耶路撒冷国王之一。你在 1177 年蒙吉萨战役（Battle of Montgisard）中以 500 骑兵击败萨拉丁的 26,000 大军——当时你才 16 岁。萨拉丁本人差点被俘。

耶路撒冷王国——1099 年第一次十字军东征建立的拉丁国家——正在被两大威胁撕裂：内部是贵族之间的权力斗争，外部是阿尤布王朝的萨拉丁。

1187 年，你的死敌萨拉丁已集结 30,000 大军。你手下只有几千骑士和步兵。

而且，你的身体已接近崩溃——你无法行走、无法骑马、几乎失明。

但你仍然坐在耶路撒冷王国的王座上。

这是你的最后一战。`,
  scenes: [
    {
      id: 's1',
      title: '麻风之王',
      image: 'baldwin iv',
      text: `1187 年 7 月初。你的麻风病已到晚期。

你的手无法握笔，你的脚无法站立，你只能坐在担架上被抬行。但你的头脑清醒——你仍然关心着这个摇摇欲坠的王国。

萨拉丁集结了 30,000 大军，正在向耶路撒冷推进。他要收复这座被基督徒占领了 88 年的圣城。

你的宫廷分裂为两派：

- 雷蒙德（的黎波里伯爵，摄政）：主张主动出击，趁萨拉丁立足未稳。但他说这话时眼神闪烁——他自己也害怕野战。
- 居伊·吕西尼安（西顿领主）：建议按兵不动，等待更多援军。
- 沙蒂永的雷纳德（外约旦领主）：最狂热的十字军——他要与萨拉丁决一死战。

你面临选择：出击还是坚守？`,
      npcName: '雷蒙德',
      npcRole: '的黎波里伯爵，摄政',
      npcContext: '你是雷蒙德三世，的黎波里伯爵，耶路撒冷王国的摄政（因国王年幼病重）。你稳重、谨慎，深谙军事。萨拉丁是你最强对手。',
      choices: [
        { id: 'c1a', text: '主动出击：趁萨拉丁立足未稳突袭。', next: 's2', outcome: '你选择先发制人', historicalNote: '历史假设：耶路撒冷王国主动出击会改变局势。' },
        { id: 'c1b', text: '坚守不出：避免野战固守城池。', next: 's2', outcome: '你选择稳妥', historicalNote: '历史事实：耶路撒冷王国兵力不足，野战风险极大。' },
        { id: 'c1c', text: '议和：派使节向萨拉丁求和。', next: 's1c_fail', outcome: '你选择外交', historicalNote: '历史事实：萨拉丁要耶路撒冷，不会接受议和。' }
      ]
    },
    {
      id: 's1c_fail',
      title: '议和的代价',
      text: `萨拉丁不接受求和，将你的软弱视为进攻信号。

穆斯林大军长驱直入。

你失去了所有主动权。`,
      ending: 'ending_diplomacy',
      isDeadEnd: true
    },
    {
      id: 's2',
      title: '哈廷角之灾',
      image: 'hattin horns',
      text: `你决定率军前往太巴列湖解围——那里有你的母亲阿格尼丝和许多基督徒被围困。

1187 年 7 月 4 日清晨。哈廷角。

萨拉丁在附近的高地上扎营，封锁了所有的水源。烈日下，你的骑士们饥渴难耐。

早晨，萨拉丁命令穆斯林骑兵在山下列阵。他命令点燃干草——浓烟随风飘向你的军队。饥渴加上浓烟，士兵们精疲力竭。

十字军最终被迫与萨拉丁进行野战。

你坐在担架上，被骑士们抬到战场上。你无法战斗，只能看着。

战斗开始。萨拉丁的骑兵发起总攻。雷蒙德试图突围，但被击退。居伊·吕西尼安的部队被分割包围。沙蒂永的雷纳德率领的一支部队全军覆没——他本人被俘。

到傍晚，十字军全军覆没——数千骑士被杀或被俘。

"真十字架"——基督教世界最神圣的圣物——被穆斯林缴获。`,
      npcName: '萨拉丁',
      npcRole: '阿尤布王朝苏丹，穆斯林世界领袖',
      npcContext: '你是萨拉丁（Saladin），库尔德人，伊斯兰世界的传奇统帅。你有骑士精神，慷慨、宽容、虔诚。你视耶路撒冷为伊斯兰第三圣地，必欲收复。但你对战俘从不滥杀。',
      choices: [
        { id: 'c2a', text: '突围：朕率亲卫突围重整旗鼓。', next: 's2a_fail', outcome: '你尝试突围', historicalNote: '历史事实：鲍德温四世因病无法突围，被抬回耶路撒冷。' },
        { id: 'c2b', text: '决战：全军与敌决一死战。', next: 's2b_fail', outcome: '你选择正面对决', historicalNote: '历史事实：哈廷会战十字军全军覆没，真十字架被俘。' },
        { id: 'c2c', text: '求和：传话给萨拉丁朕愿受洗入教。', next: 's2c_shame', outcome: '你以宗教换和平', historicalNote: '历史假设：麻风王以皈依换和平——但这违背十字军信仰。' }
      ]
    },
    {
      id: 's2a_fail',
      title: '全军覆没',
      text: `你无法突围。十字军全军覆没，真十字架被穆斯林缴获。

你被抬回耶路撒冷，一年后病逝。`,
      ending: 'ending_defeat',
      isFinal: true,
      npcName: '萨拉丁',
      npcRole: '穆斯林苏丹',
      npcContext: '你是萨拉丁。哈廷之战后你乘胜收复耶路撒冷（1187 年 10 月），入城时禁止屠杀和抢掠。',
      npcClosing: '鲍德温，我的老对手。你的麻风病让你承受了常人无法想象的痛苦，但你从未屈服。虽然我赢了，但我敬佩你——你是我见过最勇敢的国王之一。'
    },
    {
      id: 's2b_fail',
      title: '真十字架陷落',
      text: `你亲自率军冲锋，但十字军已无力回天。

真十字架被穆斯林缴获，这是整个基督教世界的奇耻大辱。`,
      ending: 'ending_reliquary',
      isFinal: true,
      npcName: '萨拉丁',
      npcRole: '穆斯林苏丹',
      npcContext: '你是萨拉丁，夺取真十字架是伊斯兰世界 88 年来最大的胜利——第一次十字军东征时这件圣物被夺走。',
      npcClosing: '真十字架现在属于伊斯兰世界。这是真主对我们的恩赐。但我会善待你的子民——你虽是异教徒，却是个正直的国王。'
    },
    {
      id: 's2c_shame',
      title: '受洗的代价',
      text: `你宣布皈依伊斯兰教以换取和平，但你的骑士们不能接受——他们发动兵变，将你软禁。

你最终死在狱中，耶路撒冷陷落。`,
      ending: 'ending_converted',
      isDeadEnd: true
    }
  ],
  endings: [
    { id: 'ending_defeat', title: '🛡️ 麻风王陨落', text: '你败了，但赢得对手的尊重。萨拉丁入城时禁止屠杀，这是一位配得上更好命运的国王。', isWin: false, historicalReality: '哈廷之战是十字军东征的转折点，耶路撒冷再次落入穆斯林手中，促成了第三次十字军东征。', lessons: ['不畏逆境是真正的勇气', '失败也可能是伟大的', '尊重对手也是美德'] },
    { id: 'ending_reliquary', title: '✝️ 圣物陷落', text: '你亲自战败，真十字架落入敌手。激起第三次十字军东征。', isWin: false, historicalReality: '真十字架被缴获震动整个欧洲', lessons: ['有时死亡比投降更光荣', '信仰有时压倒理性'] },
    { id: 'ending_diplomacy', title: '💀 议和失败', text: '议和失败，耶路撒冷陷落。', isWin: false, historicalReality: '萨拉丁不会接受议和', lessons: ['选择外交对象要谨慎'] },
    { id: 'ending_converted', title: '💀 背叛信仰', text: '你皈依敌教却被自己人推翻。', isWin: false, historicalReality: '鲍德温四世从未背叛信仰', lessons: ['背叛信仰会失去所有人'] }
  ]
}

const idx = data.findIndex(s => s.id === 'crusades');
if (idx === -1) { console.error('not found'); process.exit(1); }
data[idx] = newCrusades;
fs.writeFileSync('src/data/scenarios.json', JSON.stringify(data, null, 2) + '\n');
console.log('crusades scenes:', data[idx].scenes.length, '| bg:', data[idx].background.length, '字');
