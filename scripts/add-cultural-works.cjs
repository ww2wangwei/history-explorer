const fs = require('fs');
const p = JSON.parse(fs.readFileSync('src/data/people.json', 'utf8'));

const WORKS = {
  // 思想家
  'p-confucius':    ['《论语》', '《春秋》', '《诗经》'],
  'p-laozi':        ['《道德经》'],
  'p-zhuangzi':     ['《庄子》'],
  'p-mencius':      ['《孟子》'],
  'p-sun-tzu':      ['《孙子兵法》'],
  'p-zhu-xi':       ['《四书章句集注》', '《朱子语类》'],
  'p-marcus-aurelius': ['《沉思录》'],
  'p-sakyamuni':    ['佛经三藏（经律论）', '《金刚经》', '《法华经》'],
  'p-muhammad':     ['《古兰经》'],
  'p-christ-jesus': ['《新约圣经》'],
  'p-socrates':     ['（无著作，思想经由柏拉图、色诺芬记录）'],
  'p-plato':        ['《理想国》', '《会饮篇》', '《苏格拉底的辩护》'],
  'p-aristotle':    ['《形而上学》', '《尼各马可伦理学》', '《政治学》', '《工具论》'],

  // 文人/艺术家
  'p-sima-qian':    ['《史记》130 卷'],
  'p-li-bai':       ['《将进酒》', '《蜀道难》', '《静夜思》', '《早发白帝城》'],
  'p-du-fu':        ['《登高》', '《春望》', '《三吏三别》', '《茅屋为秋风所破歌》'],
  'p-sima-guang':   ['《资治通鉴》294 卷'],
  'p-song-huizong': ['瘦金体书法', '《芙蓉锦鸡图》', '《听琴图》'],
  'p-wang-wei':     ['《山居秋暝》', '《使至塞上》', '《辋川集》'],
  'p-lu-you':       ['《示儿》', '《卜算子·咏梅》', '《书愤》'],
  'p-bai-juyi':     ['《长恨歌》', '《琵琶行》', '《卖炭翁》'],
  'p-qu-yuan':      ['《离骚》', '《九歌》', '《天问》'],
  'p-ouyang-xiu':   ['《醉翁亭记》', '《秋声赋》'],
  'p-homer':        ['《伊利亚特》', '《奥德赛》'],
  'p-shakespeare':  ['《哈姆雷特》', '《罗密欧与朱丽叶》', '《李尔王》', '《麦克白》', '十四行诗 154 首'],
  'p-da-vinci':     ['《蒙娜丽莎》', '《最后的晚餐》', '《维特鲁威人》'],
  'p-michelangelo': ['《大卫》', '《圣母怜子》', '西斯廷教堂天顶画《创世纪》'],
  'p-van-gogh':     ['《星夜》', '《向日葵》', '《吃土豆的人》', '《麦田上的乌鸦》'],
  'p-cao-cao':      ['《短歌行》', '《观沧海》', '《蒿里行》'],
};

let added = 0;
p.forEach(person => {
  if (WORKS[person.id] && !person.culturalWorks) {
    person.culturalWorks = WORKS[person.id];
    added++;
  }
});

fs.writeFileSync('src/data/people.json', JSON.stringify(p, null, 2) + '\n');
console.log('已为', added, '位人物添加 culturalWorks');
