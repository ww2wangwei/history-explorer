// 重写郑和下西洋
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/scenarios.json', 'utf8'));

const newZhengHe = {
  id: 'zheng-he',
  title: '郑和下西洋',
  subtitle: '你是郑和，1405 年的福建',
  era: '明',
  year: 1405,
  location: '福建长乐',
  icon: '⛵',
  color: '#5bc89a',
  background: `你是三宝太监郑和，原名马和，回族，云南昆阳人。1371 年，你出生在一个显赫的伊斯兰家庭——你的祖父和父亲都曾到过伊斯兰教圣地麦加朝觐，你被称为"识宝的家族"。

1381 年，明军征云南，11 岁的你被明军俘虏，阉割后入宫。你在宫廷中长大，侍奉燕王朱棣——这位后来的永乐帝。

靖难之役（1399-1402）中，你在郑村坝为朱棣立下大功，从此被赐姓"郑"，改名为"郑和"。"郑"象征他对你的信任。

1402 年，朱棣登基为永乐帝。他开始筹划一项史无前例的远洋行动——下西洋。

永乐三年（1405 年）6 月 15 日，你被任命为下西洋正使，率 200 余艘宝船、2.7 万余人，从福建长乐太平港启航。

这是人类历史上最大规模的远洋航行，比葡萄牙人达·伽马绕过好望角（1497 年）早 92 年，比哥伦布到达美洲（1492 年）早 87 年。`,
  scenes: [
    {
      id: 's1',
      title: '启航',
      image: 'zheng he fleet',
      text: `永乐三年六月十五日。福建长乐太平港。

200 艘宝船在太平港集结。最大的宝船长 137 米、宽 56 米（相当于现代航母），是当时世界上最大的船。船员 2.7 万人，其中军官 100 多人。

你的船队分为五部分：
- 宝船（主力船）：62 艘
- 马船（运输船）：700 艘
- 粮船（补给船）：240 艘
- 坐船（指挥船）：250 艘
- 战船（护航舰）：180 艘

你即将开启人类航海史的新纪元。

朝廷的真正目的是什么？宣示大明威德、联络海外、寻找建文帝（靖难之役后失踪）、拓展朝贡体系——各种目的交织。`,
      npcName: '王景弘',
      npcRole: '你的副手，下西洋监军',
      npcContext: '你是王景弘，宦官，郑和的副手。你与郑和共同主持了七下西洋的后三次（第七次郑和已逝，由你独自完成）。你稳重、忠诚。',
      choices: [
        { id: 'c1a', text: '经占城、爪哇、暹罗：先去东南亚立威。', next: 's2', outcome: '你选择先巩固东南亚', historicalNote: '历史事实：第一次下西洋确实先到占城、爪哇、苏门答腊。' },
        { id: 'c1b', text: '直接往锡兰：先取印度洋战略要地。', next: 's2', outcome: '你选择直奔目标', historicalNote: '历史假设：跳过东南亚可缩短航程但可能错失朝贡体系建立。' },
        { id: 'c1c', text: '先去日本：宣慰倭国，巩固东北。', next: 's1c_fail', outcome: '你选择先去日本', historicalNote: '历史事实：日本方向是另一个朝贡路径，但下西洋是去西洋（西方），不是日本。' }
      ]
    },
    {
      id: 's1c_fail',
      title: '方向的错误',
      text: `你误把"西洋"理解为日本方向。

朝廷的真正意图是与印度洋诸国建立联系，朝贡体系很快瓦解。

永乐帝对你大失所望。`,
      ending: 'ending_misdirected',
      isDeadEnd: true
    },
    {
      id: 's2',
      title: '旧港宣威',
      image: 'sriwijaya palace',
      text: `永乐三年秋。你的船队抵达旧港宣慰司（今印尼巨港）。

旧港是马六甲海峡的重要港口，也是当时东南亚的贸易中心。但这里有一个问题——华人首领陈祖义横行海上、劫掠商船长达几十年。

三佛齐国王（巨港的宗主国）请求你协助剿灭陈祖义。

陈祖义表面归顺，愿率部投降。但他实则打算诈降——趁夜色偷袭你的船队。

你召集幕僚商议对策。`,
      npcName: '陈祖义',
      npcRole: '旧港华人海盗头目',
      npcContext: '你是陈祖义，旧港的华人海盗头目，纠集数千人劫掠南海商船几十年。你表面归顺，实则打算诈降后偷袭大明船队——你不知道你面对的是 2.7 万人的庞大舰队。',
      choices: [
        { id: 'c2a', text: '招抚：朕赦你之罪，归顺即可。', next: 's2a_fail', outcome: '你选择招抚', historicalNote: '历史事实：郑和选择用计活捉陈祖义，不接受招抚。' },
        { id: 'c2b', text: '用计：设伏诱敌，一网打尽。', next: 's3', outcome: '你用计擒敌', historicalNote: '历史事实：郑和设计引诱陈祖义，活捉 5000 余人。' },
        { id: 'c2c', text: '宣战：发兵剿灭，不留后患。', next: 's3', outcome: '你直接进攻', historicalNote: '历史事实：郑和选择以智取胜，避免大规模流血。' }
      ]
    },
    {
      id: 's2a_fail',
      title: '招抚的代价',
      text: `陈祖义假意归顺，趁夜色偷袭你的船队。

虽然你最终击退，但舰队损失惨重，朝廷质疑你的决断。

你被召回。`,
      ending: 'ending_pacify_fail',
      isDeadEnd: true
    },
    {
      id: 's3',
      title: '锡兰立碑',
      image: 'galle sri lanka',
      text: `你设计引诱陈祖义——先假装接受归顺，让他以为你中计。然后突然发兵，活捉陈祖义及其部下 5000 余人。

你将陈祖义押回南京处决，枭首示众。

此事震慑南海。海船继续西行至锡兰（今斯里兰卡），你立碑纪念布施佛寺。碑文：
"仰惟至圣至神……其教之大，天下无以尚之矣。"

你抵达古里（今印度卡利卡特），这是印度西海岸的重要贸易港。郑和在这里立碑记功——这是中国与印度最早的官方交流记录之一。`,
      npcName: '锡兰国王',
      npcRole: '锡兰（今斯里兰卡）国王',
      npcContext: '你是锡兰国王，是虔诚的佛教徒。你敬畏大明宝船的庞大，对郑和的慷慨布施感激不尽——尽管你们此前素未谋面。',
      choices: [
        { id: 'c3a', text: '布施佛寺：代表永乐帝向佛祖致敬。', next: 's4', outcome: '你布施佛寺', historicalNote: '历史事实：郑和确实在锡兰立碑布施，巩固了两国关系。' },
        { id: 'c3b', text: '册封国王：奉永乐帝册封你为王。', next: 's4', outcome: '你册封国王', historicalNote: '历史事实：郑和代表明朝册封当地首领，是朝贡体系的核心。' },
        { id: 'c3c', text: '掠夺宝石：听闻锡兰有宝石，献上一些。', next: 's3c_fail', outcome: '你勒索当地', historicalNote: '历史事实：郑和从未勒索，反而布施——这是大明的外交底线。' }
      ]
    },
    {
      id: 's3c_fail',
      title: '勒索的代价',
      text: `你勒索宝石的行为传到永乐帝耳中。

皇帝震怒——大明是天朝上国，岂能行盗贼之事？你被召回南京，再未出海。`,
      ending: 'ending_disgraced',
      isDeadEnd: true
    },
    {
      id: 's4',
      title: '七下西洋的功过',
      image: 'zheng he returns',
      text: `你七下西洋，足迹遍及东南亚、印度、阿拉伯、东非。

1405-1433 年，28 年间你率船队七下西洋，访问 30 多个国家和地区，最远到达东非的麻林地（今肯尼亚马林迪）。

但永乐帝（1424 年病逝）、洪熙帝（1425 年在位不到一年）、宣德帝都不再支持远洋。1433 年，你第七次下西洋归来后不久病逝于古里归途中。

宝船图纸被兵部侍郎刘大夏焚毁，下西洋时代结束。

中国从世界航海先驱变成陆权国家。`,
      ending: 'ending_great',
      isFinal: true,
      npcName: '王景弘',
      npcRole: '你的副手',
      npcContext: '你是王景弘。郑和逝世后，你独自完成了第七次下西洋的下半段。宝船在你眼前老化，朝廷不再拨款。',
      npcClosing: '大人，您开创的时代已经过去。大明不再远航，世界却记住了您的名字——人类历史上最大规模远洋舰队的统帅。'
    }
  ],
  endings: [
    { id: 'ending_great', title: '⛵ 航海先驱', text: '你开启了中国乃至世界的大航海时代，比葡萄牙达·伽马早 92 年、比哥伦布早 87 年。', isWin: true, historicalReality: '郑和七下西洋是人类航海史的巅峰，200 艘宝船是当时世界上最强大的海军。但宝船图纸在 1477 年被刘大夏焚毁，中国的大航海时代终结。', lessons: ['领先时代的人往往孤独', '帝国的兴衰决定个人命运', '和平外交胜过武力'] },
    { id: 'ending_misdirected', title: '💀 方向错误', text: '你误解了"西洋"的方向，远航失败。', isWin: false, historicalReality: '朝廷的远洋计划明确是去西洋（印度洋以西）', lessons: ['明确目标比努力更重要'] },
    { id: 'ending_pacify_fail', title: '💀 招抚失败', text: '你招抚海盗被反咬，损失惨重。', isWin: false, historicalReality: '对海盗不应招抚', lessons: ['对敌人仁慈就是对自己残忍'] },
    { id: 'ending_disgraced', title: '💀 丧失名誉', text: '你勒索当地被召回。', isWin: false, historicalReality: '郑和以布施闻名，从未勒索', lessons: ['外交形象比短期利益重要'] }
  ]
}

const idx = data.findIndex(s => s.id === 'zheng-he');
if (idx === -1) { console.error('not found'); process.exit(1); }
data[idx] = newZhengHe;
fs.writeFileSync('src/data/scenarios.json', JSON.stringify(data, null, 2) + '\n');
console.log('zheng-he scenes:', data[idx].scenes.length, '| bg:', data[idx].background.length, '字');
