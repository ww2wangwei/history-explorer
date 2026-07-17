const fs = require('fs');
const e = JSON.parse(fs.readFileSync('src/data/events.json', 'utf8'));

// 6 组重复，按 (title+year) 匹配，删除右列保留左列
const toRemove = [
  'ev-greece-3',   // 马拉松战役 留 ev-011
  'ev-greece-4',   // 温泉关战役 留 ev-129
  'ev-greece-5',   // 萨拉米斯海战 留 ev-130
  'ev-hittite-2',  // 卡迭石战役 留 ev-137
  'ev-greece-8',   // 喀罗尼亚战役 留 ev-140
  'ev-221',        // 一战爆发 留 ev-168
];

const before = e.length;
const filtered = e.filter(ev => !toRemove.includes(ev.id));
const removed = before - filtered.length;

fs.writeFileSync('src/data/events.json', JSON.stringify(filtered, null, 2) + '\n');
console.log('从', before, '条删除', removed, '条重复 → 现在', filtered.length, '条');
console.log('删除的 id:', toRemove.join(', '));

// 复查
const wars = filtered.filter(x => x.category === '军事' || x.category === 'military');
const map = new Map();
wars.forEach(w => {
  const key = w.title + '_' + w.year;
  if (map.has(key)) map.get(key).push(w);
  else map.set(key, [w]);
});
const dups = [...map.entries()].filter(([_, arr]) => arr.length > 1);
console.log('剩余重复:', dups.length);
