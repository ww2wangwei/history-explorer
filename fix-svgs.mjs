import fs from 'node:fs';
const UA = 'HistoryExplorer/1.0 (educational)';
const RENAMES = [
  ['public/geo/china/qin.svg',   'public/geo/china/qin.png'],
  ['public/geo/china/tang.svg',  'public/geo/china/tang.png'],
  ['public/geo/china/han.svg',   'public/geo/china/han.png'],
  ['public/geo/world/roman-empire.svg', 'public/geo/world/roman-empire.png'],
  ['public/geo/world/mongol-empire.svg', 'public/geo/world/mongol-empire.png'],
];
for (const [from, to] of RENAMES) {
  if (fs.existsSync(from)) {
    fs.renameSync(from, to);
    console.log(`renamed ${from} -> ${to}`);
  }
}
