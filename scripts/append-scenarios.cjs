const fs = require('fs');

// 读现状
let content = fs.readFileSync('src/data/scenarios.json', 'utf8');

// 清理：移除任何残留的 JSONEND 标记 + 修复 ,, 多余逗号
content = content.replace(/JSONEND\n?/g, '');
content = content.replace(/,\s*\n*\s*\}[\s,]*$/m, ',\n  }');

// 移除末尾的 ] 收尾（我们后面重新加）
if (content.trim().endsWith(']')) {
  content = content.replace(/\n?\s*\[\s*$/m, '');
}
content = content.replace(/}\s*,?\s*$/, '}');
content = content.trimEnd();

const FRENCH = `,
  {
    "id": "french-revolution",
    "title": "法国大革命",
    "subtitle": "你是路易十六，1789 年的凡尔赛",
    "era": "法国",
    "year": 1789,
    "location": "凡尔赛宫",
    "icon": "👑",
    "color": "#5b9bc8",
    "background": "1789 年 7 月，巴黎市民攻陷巴士底狱。革命蔓延。你是路易十六，被后世称为唯一正直的法国人。但诚实救不了王冠。",
    "scenes": [
      {
        "id": "s1",
        "title": "巴士底狱陷落",
        "image": "bastille storming",
        "text": "巴士底狱被攻陷的消息传到凡尔赛。王后主张武力镇压，财政大臣内克建议让步。",
        "npcName": "玛丽·安托瓦内特",
        "npcRole": "你的王后",
        "npcContext": "你是玛丽·安托瓦内特，奥地利公主嫁来法国，被蔑称为奥地利女人。你崇尚绝对君权，但你不了解人民。",
        "choices": [
          { "id": "c1a", "text": "武力镇压：调瑞士卫队进巴黎。", "next": "s2", "outcome": "你选择武装镇压", "historicalNote": "历史事实：路易十六犹豫 6 周才调军队，错过时机" },
          { "id": "c1b", "text": "退让：撤换内克让步给议会。", "next": "s1b_fail", "outcome": "你选择退让", "historicalNote": "历史事实：解除内克引发 7 月 14 日起义" },
          { "id": "c1c", "text": "亲民：朕去巴黎向人民讲话。", "next": "s2", "outcome": "你选择以身作则", "historicalNote": "历史假设：路易十六主动亲民" }
        ]
      },
      {
        "id": "s1b_fail",
        "title": "示弱的代价",
        "text": "你解除内克让革命派误判你的软弱。巴士底狱市民得鼓舞，王党失去主动权。",
        "ending": "ending_weak",
        "isDeadEnd": true
      },
      {
        "id": "s2",
        "title": "凡尔赛妇女游行",
        "image": "versailles women march",
        "text": "1789 年 10 月 5 日，巴黎妇女游行 20 公里到凡尔赛，高呼面包冲入王宫。国民卫队站在妇女一边。",
        "npcName": "拉法耶特",
        "npcRole": "国民卫队司令",
        "npcContext": "你是拉法耶特侯爵，美国独立战争英雄，信奉自由但仍是保王党。你保护国王撤离。",
        "choices": [
          { "id": "c2a", "text": "撤离巴黎：先去兰斯待机复位。", "next": "s3_flight", "outcome": "你选择战略转移", "historicalNote": "历史事实：路易十六 1791 年瓦雷讷逃亡失败" },
          { "id": "c2b", "text": "留在巴黎：朕与人民同在。", "next": "s3_stay", "outcome": "你选择留在巴黎", "historicalNote": "历史事实：路易十六被护送回巴黎后被软禁" },
          { "id": "c2c", "text": "调外国军队：请奥地利兄弟来援。", "next": "s2c_fail", "outcome": "你请求外援", "historicalNote": "历史事实：勾结外国被曝光，彻底失去民心" }
        ]
      },
      {
        "id": "s2c_fail",
        "title": "外援的代价",
        "text": "你请求外国军队的消息被泄露。革命派怒不可遏——国王勾结外敌！1792 年共和国成立，你被废黜。",
        "ending": "ending_foreign_aid",
        "isDeadEnd": true
      },
      {
        "id": "s3_flight",
        "title": "瓦雷讷逃亡",
        "image": "varennes flight",
        "text": "1791 年 6 月你秘密出逃，在瓦雷讷镇被认出，国民卫队将你押回巴黎。",
        "ending": "ending_escape",
        "isFinal": true,
        "npcName": "罗伯斯庇尔",
        "npcRole": "雅各宾派领袖",
        "npcContext": "你是罗伯斯庇尔，律师出身，革命激进派，信奉人民主权，反对任何妥协。",
        "npcClosing": "路易，国王与人民不能两立。逃跑证明你从未接受革命。你被审判是历史的必然。"
      },
      {
        "id": "s3_stay",
        "title": "王政终结",
        "image": "french republic",
        "text": "你回巴黎被软禁杜伊勒里宫。1792 年 8 月 10 日，民众攻入王宫，你被关进 Temple 监狱。",
        "ending": "ending_republic",
        "isFinal": true,
        "npcName": "罗伯斯庇尔",
        "npcRole": "雅各宾派领袖",
        "npcContext": "你是罗伯斯庇尔，反对君主制，主张建立共和国。",
        "npcClosing": "路易，革命不接受悔过。你没有主动退位，让法国陷入十年混乱。但历史会记住：你是唯一不撒谎的法国人。"
      }
    ],
    "endings": [
      { "id": "ending_republic", "title": "⚔️ 王政终结", "text": "你被送上断头台。临死前说我死得无辜。法国进入恐怖时期。", "isWin": false, "historicalReality": "路易十六 1793 年 1 月 21 日被处决。法国废除君主制。", "lessons": ["革命一旦开始就不回头", "失去民心的君主无法统治", "个人品德救不了制度"] },
      { "id": "ending_escape", "title": "💀 瓦雷讷逃亡失败", "text": "你逃亡失败被押回，加速了审判。", "isWin": false, "historicalReality": "瓦雷讷逃亡是路易最大政治错误", "lessons": ["逃亡失败加速灭亡", "该妥协时不妥协必遭反噬"] },
      { "id": "ending_weak", "title": "💀 示弱亡国", "text": "你退让后革命派得寸进尺。", "isWin": false, "historicalReality": "革命中示弱只会让对方更激进", "lessons": ["退让要看对象", "革命不接受妥协"] },
      { "id": "ending_foreign_aid", "title": "💀 勾结外敌", "text": "勾结外国曝光，共和派怒不可遏。", "isWin": false, "historicalReality": "国王勾结外敌是最不可饶恕的罪行", "lessons": ["不要勾结外敌", "主权是底线"] }
    ]
  }`

const CRUSADES = `,
  {
    "id": "crusades",
    "title": "哈廷会战（十字军东征）",
    "subtitle": "你是鲍德温四世，1187 年的耶路撒冷",
    "era": "中东",
    "year": 1187,
    "location": "耶路撒冷王国",
    "icon": "⚔️",
    "color": "#9b7eb6",
    "background": "你是麻风王鲍德温四世。13 岁登基就患麻风病，16 岁已近乎失明。但你是有史以来最杰出的耶路撒冷国王之一。1187 年死敌萨拉丁已集结 3 万大军。",
    "scenes": [
      {
        "id": "s1",
        "title": "麻风之王",
        "image": "baldwin iv",
        "text": "你的麻风病日益恶化。雷蒙德主张主动出击，居伊则建议按兵不动。",
        "npcName": "雷蒙德",
        "npcRole": "的黎波里伯爵，摄政",
        "npcContext": "你是雷蒙德三世，耶路撒冷王国的摄政。你稳重、谨慎，深谙军事。萨拉丁是你最强对手。",
        "choices": [
          { "id": "c1a", "text": "主动出击：趁萨拉丁立足未稳突袭。", "next": "s2", "outcome": "你选择先发制人", "historicalNote": "历史假设：主动出击会改变局势" },
          { "id": "c1b", "text": "坚守不出：避免野战固守城池。", "next": "s2", "outcome": "你选择稳妥", "historicalNote": "历史事实：兵力不足，野战风险极大" },
          { "id": "c1c", "text": "议和：派使节向萨拉丁求和。", "next": "s1c_fail", "outcome": "你选择外交", "historicalNote": "历史事实：萨拉丁要耶路撒冷，不会接受" }
        ]
      },
      {
        "id": "s1c_fail",
        "title": "议和的代价",
        "text": "萨拉丁不接受求和，将你的软弱视为进攻信号。",
        "ending": "ending_diplomacy",
        "isDeadEnd": true
      },
      {
        "id": "s2",
        "title": "哈廷角之灾",
        "image": "hattin horns",
        "text": "你率军前往太巴列湖解围。1187 年 7 月 4 日，萨拉丁在哈廷角点燃干草，浓烟让十字军饥渴难耐，骑士精疲力竭。",
        "npcName": "萨拉丁",
        "npcRole": "阿尤布王朝苏丹",
        "npcContext": "你是萨拉丁，库尔德人，伊斯兰世界传奇统帅。慷慨、宽容、虔诚，对战俘从不滥杀。",
        "choices": [
          { "id": "c2a", "text": "突围：朕率亲卫突围重整旗鼓。", "next": "s2a_fail", "outcome": "你尝试突围", "historicalNote": "历史事实：鲍德温因病无法突围，被抬回" },
          { "id": "c2b", "text": "决战：全军与敌决一死战。", "next": "s2b_fail", "outcome": "你选择正面对决", "historicalNote": "历史事实：哈廷会战十字军全军覆没" },
          { "id": "c2c", "text": "求和：传话给萨拉丁朕愿受洗入教。", "next": "s2c_shame", "outcome": "你以宗教换和平", "historicalNote": "历史假设：麻风王以皈依换和平" }
        ]
      },
      {
        "id": "s2a_fail",
        "title": "全军覆没",
        "text": "你无法突围。十字军全军覆没，真十字架被穆斯林缴获。你被抬回耶路撒冷，一年后病逝。",
        "ending": "ending_defeat",
        "isFinal": true,
        "npcName": "萨拉丁",
        "npcRole": "穆斯林苏丹",
        "npcContext": "你是萨拉丁。哈廷之战后你乘胜收复耶路撒冷（1187年10月），入城时禁止屠杀。",
        "npcClosing": "鲍德温，我的老对手。你的麻风病让你承受了常人无法想象的痛苦，但你从未屈服。虽然我赢了，但我敬佩你——你是我见过最勇敢的国王之一。"
      },
      {
        "id": "s2b_fail",
        "title": "真十字架陷落",
        "text": "你亲自率军冲锋但无力回天。真十字架被穆斯林缴获，这是基督教世界奇耻大辱。",
        "ending": "ending_reliquary",
        "isFinal": true,
        "npcName": "萨拉丁",
        "npcRole": "穆斯林苏丹",
        "npcContext": "你是萨拉丁，夺取真十字架是伊斯兰世界 88 年来最大的胜利。",
        "npcClosing": "真十字架现在属于伊斯兰世界。但我会善待你的子民——你虽是异教徒，却是个正直的国王。"
      },
      {
        "id": "s2c_shame",
        "title": "受洗的代价",
        "text": "你宣布皈依伊斯兰教换取和平，但你的骑士们不能接受——他们发动兵变，将你软禁。你最终死在狱中。",
        "ending": "ending_converted",
        "isDeadEnd": true
      }
    ],
    "endings": [
      { "id": "ending_defeat", "title": "🛡️ 麻风王陨落", "text": "你败了，但赢得对手的尊重。萨拉丁入城时禁止屠杀，这是一位配得上更好命运的国王。", "isWin": false, "historicalReality": "哈廷之战是十字军东征的转折点，促成了第三次十字军东征。", "lessons": ["不畏逆境是真正的勇气", "失败也可能是伟大的", "尊重对手也是美德"] },
      { "id": "ending_reliquary", "title": "✝️ 圣物陷落", "text": "你亲自战败，真十字架落入敌手。激起第三次十字军东征。", "isWin": false, "historicalReality": "真十字架被缴获震动整个欧洲", "lessons": ["有时死亡比投降更光荣", "信仰有时压倒理性"] },
      { "id": "ending_diplomacy", "title": "💀 议和失败", "text": "议和失败，耶路撒冷陷落。", "isWin": false, "historicalReality": "萨拉丁不会接受议和", "lessons": ["选择外交对象要谨慎"] },
      { "id": "ending_converted", "title": "💀 背叛信仰", "text": "你皈依敌教却被自己人推翻。", "isWin": false, "historicalReality": "鲍德温四世从未背叛信仰", "lessons": ["背叛信仰会失去所有人"] }
    ]
  }`

const ZHENGHE = `,
  {
    "id": "zheng-he",
    "title": "郑和下西洋",
    "subtitle": "你是郑和，1405 年的福建",
    "era": "明",
    "year": 1405,
    "location": "福建长乐",
    "icon": "⛵",
    "color": "#5bc89a",
    "background": "你是三宝太监郑和，奉永乐帝之命率 200 余艘宝船、2.7 万人远下西洋。这是人类历史上最大规模的远洋航行。1405 年 7 月 11 日从福建长乐太平港启航。",
    "scenes": [
      {
        "id": "s1",
        "title": "启航",
        "image": "zheng he fleet",
        "text": "200 艘宝船在福建太平港集结。最大宝船长 137 米，是当时世界上最大的船。船员 2.7 万人。",
        "npcName": "王景弘",
        "npcRole": "你的副手，下西洋监军",
        "npcContext": "你是王景弘，宦官，郑和的副手。共同主持了七下西洋的后三次。",
        "choices": [
          { "id": "c1a", "text": "经占城、爪哇、暹罗：先去东南亚立威。", "next": "s2", "outcome": "你选择先巩固东南亚", "historicalNote": "历史事实：第一次下西洋确实先到东南亚" },
          { "id": "c1b", "text": "直接往锡兰：先取印度洋战略要地。", "next": "s2", "outcome": "你选择直奔目标", "historicalNote": "历史假设：跳过东南亚缩短航程" },
          { "id": "c1c", "text": "先去日本：宣慰倭国巩固东北。", "next": "s1c_fail", "outcome": "你选择先去日本", "historicalNote": "历史事实：下西洋是去西洋（西方），不是日本" }
        ]
      },
      {
        "id": "s1c_fail",
        "title": "方向的错误",
        "text": "你误把西洋理解为日本方向。朝贡体系瓦解，永乐帝对你大失所望。",
        "ending": "ending_misdirected",
        "isDeadEnd": true
      },
      {
        "id": "s2",
        "title": "旧港宣威",
        "image": "sriwijaya palace",
        "text": "你的船队抵达旧港。这里的华人首领陈祖义横行海上、劫掠商船。三佛齐国王请求你协助剿灭。",
        "npcName": "陈祖义",
        "npcRole": "旧港华人海盗头目",
        "npcContext": "你是陈祖义，旧港的华人海盗头目，纠集数千人劫掠南海商船几十年。你表面归顺，实则打算诈降后偷袭。",
        "choices": [
          { "id": "c2a", "text": "招抚：朕赦你之罪归顺即可。", "next": "s2a_fail", "outcome": "你选择招抚", "historicalNote": "历史事实：郑和选择用计活捉陈祖义" },
          { "id": "c2b", "text": "用计：设伏诱敌一网打尽。", "next": "s3", "outcome": "你用计擒敌", "historicalNote": "历史事实：郑和设计引诱，活捉 5000 余人" },
          { "id": "c2c", "text": "宣战：发兵剿灭不留后患。", "next": "s3", "outcome": "你直接进攻", "historicalNote": "历史事实：郑和选择以智取胜" }
        ]
      },
      {
        "id": "s2a_fail",
        "title": "招抚的代价",
        "text": "陈祖义假意归顺，趁夜色偷袭。虽然你最终击退，但舰队损失惨重。",
        "ending": "ending_pacify_fail",
        "isDeadEnd": true
      },
      {
        "id": "s3",
        "title": "锡兰立碑",
        "image": "galle sri lanka",
        "text": "你擒获陈祖义押回南京处决。海船继续西行至锡兰，你立碑纪念布施佛寺。",
        "npcName": "锡兰国王",
        "npcRole": "锡兰国王",
        "npcContext": "你是锡兰国王，虔诚佛教徒，敬畏大明宝船。",
        "choices": [
          { "id": "c3a", "text": "布施佛寺：代表永乐帝向佛祖致敬。", "next": "s4", "outcome": "你布施佛寺", "historicalNote": "历史事实：郑和确实在锡兰立碑布施" },
          { "id": "c3b", "text": "册封国王：奉永乐帝册封你为王。", "next": "s4", "outcome": "你册封国王", "historicalNote": "历史事实：郑和代表明朝册封当地首领" },
          { "id": "c3c", "text": "掠夺宝石：听闻锡兰有宝石献上一些。", "next": "s3c_fail", "outcome": "你勒索当地", "historicalNote": "历史事实：郑和从未勒索" }
        ]
      },
      {
        "id": "s3c_fail",
        "title": "勒索的代价",
        "text": "你勒索宝石的行为传到永乐帝耳中。皇帝震怒——大明是天朝上国，岂能行盗贼之事？你被召回南京。",
        "ending": "ending_disgraced",
        "isDeadEnd": true
      },
      {
        "id": "s4",
        "title": "七下西洋的功过",
        "image": "zheng he returns",
        "text": "你七下西洋，足迹遍及东南亚印度阿拉伯东非。永乐帝驾崩后新皇帝不再支持远洋。1433 年你第七次归来后不久病逝。宝船图纸被兵部侍郎刘大夏焚毁。",
        "ending": "ending_great",
        "isFinal": true,
        "npcName": "王景弘",
        "npcRole": "你的副手",
        "npcContext": "你是王景弘。郑和逝世后你独自完成第七次下西洋的下半段。",
        "npcClosing": "大人，您开创的时代已经过去。大明不再远航，世界却记住了您的名字——人类历史上最大规模远洋舰队的统帅。"
      }
    ],
    "endings": [
      { "id": "ending_great", "title": "⛵ 航海先驱", "text": "你开启了中国乃至世界的大航海时代，比葡萄牙达·伽马早 80 年、比哥伦布早 87 年。", "isWin": true, "historicalReality": "郑和七下西洋是人类航海史的巅峰，200 艘宝船是当时世界上最强大的海军。", "lessons": ["领先时代的人往往孤独", "帝国的兴衰决定个人命运", "和平外交胜过武力"] },
      { "id": "ending_misdirected", "title": "💀 方向错误", "text": "你误解了西洋的方向，远航失败。", "isWin": false, "historicalReality": "远洋计划明确是去西洋（印度洋以西）", "lessons": ["明确目标比努力更重要"] },
      { "id": "ending_pacify_fail", "title": "💀 招抚失败", "text": "你招抚海盗被反咬，损失惨重。", "isWin": false, "historicalReality": "对海盗不应招抚", "lessons": ["对敌人仁慈就是对自己残忍"] },
      { "id": "ending_disgraced", "title": "💀 丧失名誉", "text": "你勒索当地被召回。", "isWin": false, "historicalReality": "郑和以布施闻名", "lessons": ["外交形象比短期利益重要"] }
    ]
  }
]`

// 合并
let body = content + FRENCH + CRUSADES + ZHENGHE
// 确保末尾有 ]
body = body.trimEnd()
if (!body.endsWith(']')) body += '\n]'

fs.writeFileSync('src/data/scenarios.json', body)
console.log('Wrote', body.length, 'chars')

// 验证
try {
  const j = JSON.parse(body)
  console.log('✓ Valid JSON,', j.length, 'scenarios:')
  j.forEach(s => console.log('  -', s.id, ':', s.title, '|', s.scenes.length, 'scenes,', s.endings.length, 'endings'))
} catch (e) {
  console.error('✗ Invalid JSON:', e.message)
}
