// 脚本：把所有 geographic-features.ts 的 imageUrl 替换成 Bing thumbnail URL
// 关键词映射：英文搜索更精准，每个条目给 1-2 个备选

const fs = require('fs');
const path = require('path');

const FILE = 'src/data/geographic-features.ts';
let s = fs.readFileSync(FILE, 'utf8');

// 关键词字典：id -> 搜索词
const KW = {
  // 大洲
  'asia-continent': 'asia continent landscape',
  'europe-continent': 'europe landscape mountains',
  'africa-continent': 'africa savanna wildlife',
  'north-america-continent': 'north america landscape',
  'south-america-continent': 'south america andes landscape',
  'oceania-continent': 'australia oceania landscape',
  'antarctica-continent': 'antarctica iceberg landscape',
  // 海
  'mediterranean': 'mediterranean sea coast',
  'red-sea': 'red sea coral',
  'persian-gulf': 'persian gulf dubai',
  'black-sea': 'black sea coast',
  'caspian-sea': 'caspian sea',
  'south-china-sea': 'south china sea',
  'bengal-bay': 'bay of bengal',
  'arabian-sea': 'arabian sea mumbai',
  'caribbean': 'caribbean sea beach',
  'north-sea': 'north sea coast',
  // 湖
  'baikal': 'lake baikal ice russia',
  'great-lakes': 'great lakes north america',
  'lake-victoria': 'lake victoria africa',
  'aral-sea': 'aral sea dried',
  'titicaca': 'lake titicaca peru',
  // 河
  'nile': 'nile river egypt cairo',
  'amazon': 'amazon river rainforest',
  'yangtze': 'yangtze river china',
  'yellow-river': 'yellow river china',
  'mississippi': 'mississippi river',
  'ganges': 'ganges river varanasi india',
  'indus': 'indus river pakistan',
  'tigris-euphrates': 'tigris euphrates iraq',
  'rhine': 'rhine river germany castle',
  'danube': 'danube river budapest',
  'volga': 'volga river russia',
  'congo': 'congo river rainforest',
  'mekong': 'mekong river asia',
  'thames': 'thames river london tower bridge',
  // 山
  'himalayas': 'himalayas mountains everest',
  'alps': 'alps mountains matterhorn',
  'andes': 'andes mountains south america',
  'rockies': 'rocky mountains usa',
  'kunlun': 'kunlun mountains china',
  'tianshan': 'tianshan mountains xinjiang',
  'ural': 'ural mountains russia',
  'atlas': 'atlas mountains morocco',
  'great-dividing': 'great dividing range australia',
  // 沙漠
  'sahara': 'sahara desert dunes',
  'taklamakan': 'taklamakan desert xinjiang',
  'gobi': 'gobi desert mongolia',
  'arabian': 'arabian desert saudi',
  'australian': 'australian desert uluru',
  'kalahari': 'kalahari desert africa',
  // 平原
  'ganges-plain': 'ganges plain india fields',
  'mesopotamia-plain': 'mesopotamia plain iraq',
  'nile-delta': 'nile delta egypt',
  'north-china-plain': 'north china plain farmland',
  'yangtze-plain': 'yangtze plain rice',
  // 半岛
  'arabian-peninsula': 'arabian peninsula desert',
  'indochina': 'indochina peninsula vietnam',
  'india-peninsula': 'india peninsula',
  'iberia': 'iberia peninsula spain',
  'italian-peninsula': 'italian peninsula coast',
  'scandinavian': 'scandinavian peninsula norway fjord',
  // 海峡
  'gibraltar': 'gibraltar strait rock',
  'malacca': 'malacca strait',
  'bosporus': 'bosporus istanbul',
  'hormuz': 'strait of hormuz',
  // 瀑布
  'angel': 'angel falls venezuela',
  'niagara': 'niagara falls',
  'iguazu': 'iguazu falls',
  // 区域
  'mesopotamia': 'mesopotamia ruins ziggurat',
  'mesoamerica': 'mayan pyramid chichen itza',
};

// 对每个 id 替换 imageUrl
let replaced = 0;
for (const [id, keyword] of Object.entries(KW)) {
  const url = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(keyword)}&w=800&h=450&c=7&p=0`;
  // 匹配该 id 对应的 imageUrl 行
  const re = new RegExp(
    `(id: '${id}'[\\s\\S]*?imageUrl:\\s*)'[^']*'`,
    'g'
  );
  if (re.test(s)) {
    s = s.replace(re, `$1'${url}'`);
    replaced++;
  } else {
    console.log('  NOT MATCHED:', id);
  }
}

fs.writeFileSync(FILE, s);
console.log('Replaced', replaced, 'imageUrls out of', Object.keys(KW).length);
