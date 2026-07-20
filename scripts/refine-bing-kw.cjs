// 优化部分 Bing thumbnail 关键词使其更精准
const fs = require('fs');
const FILE = 'src/data/geographic-features.ts';
let s = fs.readFileSync(FILE, 'utf8');

const updates = {
  'gobi': 'gobi%20desert%20mongolia%20steppe',
  'taklamakan': 'taklimakan%20desert%20china%20dunes',
  'aral-sea': 'aral%20sea%20uzbekistan%20ship%20graveyard',
  'thames': 'thames%20river%20london%20tower%20bridge',
  'caribbean': 'caribbean%20sea%20beach%20tropical',
  'mediterranean': 'mediterranean%20sea%20blue%20water%20coast',
  'gibraltar': 'gibraltar%20strait%20rock%20spain%20morocco',
  'persian-gulf': 'persian%20gulf%20skyline%20dubai',
  'mesoamerica': 'chichen%20itza%20mayan%20pyramid',
  'mesopotamia': 'ziggurat%20ur%20mesopotamia',
  'danube': 'danube%20river%20budapest%20hungary',
  'rhine': 'rhine%20river%20germany%20castle',
  'congo': 'congo%20river%20africa%20rainforest',
  'mekong': 'mekong%20river%20southeast%20asia',
  'titicaca': 'lake%20titicaca%20peru%20bolivia',
  'lake-victoria': 'lake%20victoria%20africa%20sunset',
  'rockies': 'rocky%20mountains%20canada%20landscape',
  'andes': 'andes%20mountains%20peru%20machu%20picchu',
  'alps': 'alps%20mountains%20matterhorn%20switzerland',
  'himalayas': 'himalayas%20mountains%20everest%20snow',
  'atlas': 'atlas%20mountains%20morocco%20snow',
  'kunlun': 'kunlun%20mountains%20china%20tibet',
  'tianshan': 'tianshan%20mountains%20xinjiang%20china',
  'ural': 'ural%20mountains%20russia',
  'great-dividing': 'great%20dividing%20range%20australia',
  'europe-continent': 'europe%20alps%20landscape',
  'asia-continent': 'asia%20landscape%20temple',
  'africa-continent': 'africa%20safari%20elephant',
  'south-america-continent': 'andes%20south%20america%20machu%20picchu',
  'north-america-continent': 'yellowstone%20national%20park',
  'oceania-continent': 'great%20barrier%20reef%20australia',
  'antarctica-continent': 'antarctica%20penguin%20ice',
  'indus': 'indus%20river%20pakistan',
  'ganges': 'ganges%20river%20varanasi%20ghats',
  'tigris-euphrates': 'tigris%20river%20iraq%20mosul',
  'volga': 'volga%20river%20russia%20samara',
  'mississippi': 'mississippi%20river%20new%20orleans',
  'amazon': 'amazon%20river%20brazil%20rainforest',
  'yangtze': 'yangtze%20river%20three%20gorges',
  'yellow-river': 'yellow%20river%20china%20loess',
  'nile': 'nile%20river%20egypt%20cairo%20felucca',
  'baikal': 'lake%20baikal%20ice%20russia%20winter',
  'great-lakes': 'great%20lakes%20superior%20lighthouse',
  'angel': 'angel%20falls%20venezuela%20waterfall',
  'niagara': 'niagara%20falls%20canada%20rainbow',
  'iguazu': 'iguazu%20falls%20argentina',
  'bosporus': 'bosporus%20istanbul%20turkey',
  'hormuz': 'strait%20of%20hormuz',
  'malacca': 'malacca%20strait%20ship',
  'sahara': 'sahara%20desert%20sand%20dunes%20camel',
  'australian': 'uluru%20ayers%20rock%20australia',
  'arabian': 'arabian%20desert%20sand%20dunes',
  'kalahari': 'kalahari%20desert%20africa%20sunset',
  'ganges-plain': 'ganges%20plain%20india%20farmland',
  'mesopotamia-plain': 'mesopotamia%20iraq%20fertile%20crescent',
  'nile-delta': 'nile%20delta%20egypt%20satellite',
  'north-china-plain': 'north%20china%20plain%20wheat',
  'yangtze-plain': 'yangtze%20river%20delta%20rice',
  'arabian-peninsula': 'arabian%20peninsula%20desert',
  'indochina': 'indochina%20vietnam%20rice%20paddy',
  'india-peninsula': 'south%20india%20temple',
  'iberia': 'iberia%20spain%20andalusia',
  'italian-peninsula': 'italy%20coast%20amalfi',
  'scandinavian': 'norway%20fjord%20scandinavia',
  'red-sea': 'red%20sea%20egypt%20coral%20reef',
  'black-sea': 'black%20sea%20turkey%20coast',
  'caspian-sea': 'caspian%20sea%20sunset',
  'south-china-sea': 'south%20china%20sea%20philippines',
  'bengal-bay': 'bay%20of%20bengal%20india%20coast',
  'arabian-sea': 'arabian%20sea%20india%20coast',
  'north-sea': 'north%20sea%20oil%20platform',
};

let count = 0;
for (const [id, kw] of Object.entries(updates)) {
  const newUrl = `https://tse1.mm.bing.net/th?q=${kw}&w=800&h=450&c=7&p=0`;
  const re = new RegExp(`(id: '${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?imageUrl:\\s*)'[^']*'`, 'g');
  if (re.test(s)) {
    s = s.replace(re, `$1'${newUrl}'`);
    count++;
  } else {
    console.log('  NOT MATCHED:', id);
  }
}

fs.writeFileSync(FILE, s);
console.log('Refined', count, 'imageUrls');
