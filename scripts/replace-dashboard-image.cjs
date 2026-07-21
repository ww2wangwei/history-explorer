const fs = require('fs');
let s = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const lines = s.split('\n');
let targetLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<h2 className="text-2xl font-serif leading-snug" style={{ color: learnEra.color }}>')) {
    targetLine = i;
    break;
  }
}
if (targetLine === -1) { console.log('not found'); process.exit(1); }

// 替换 line 668-672（h2 + title + close h2 + close div + p-6 容器）
const newLines = [
  '            </div>',
  '            <div className="relative w-full bg-ink-900" style={{ aspectRatio: \'16/9\' }}>',
  '              <img',
  '                src={"https://tse1.mm.bing.net/th?q=" + encodeURIComponent(selectedQuickEvent.title + \' \' + learnEra.name + \' historical\') + "&w=800&h=450&c=7&p=0"}',
  '                alt={selectedQuickEvent.title}',
  '                loading="lazy"',
  '                className="w-full h-full object-cover"',
  '                onError={(e) => { (e.target as HTMLImageElement).style.display = \'none\' }}',
  '              />',
  '              <div className="absolute inset-0 bg-gradient-to-t from-ink-800/95 via-ink-800/30 to-transparent pointer-events-none" />',
  '              <div className="absolute bottom-0 left-0 right-0 p-6">',
  '                <h2 className="text-2xl font-serif leading-snug text-parchment-50" style={{ textShadow: \'0 0 12px rgba(0,0,0,0.7)\' }}>',
  '                  {selectedQuickEvent.title}',
  '                </h2>',
  '              </div>',
  '            </div>',
  lines[672], // 保留原 p-6 space-y-4 行
];

lines.splice(targetLine, 5, ...newLines);
fs.writeFileSync('src/components/Dashboard.tsx', lines.join('\n'));
console.log('Replaced', targetLine, '~', targetLine + 4);
