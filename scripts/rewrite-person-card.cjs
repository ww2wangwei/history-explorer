const fs = require('fs');
const s = fs.readFileSync('src/components/Figures/FiguresOverview.tsx', 'utf8');
const lines = s.split('\n');

// 找 PersonCard 起止
let startIdx = -1, endIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('function PersonCard(')) startIdx = i;
  if (startIdx !== -1 && i > startIdx && lines[i].trim() === '}') { endIdx = i; break; }
}
console.log('PersonCard lines:', startIdx+1, '-', endIdx+1);

const newCard = [
  'function PersonCard({ person, visited, onClick }: {',
  '  person: HistoricalFigure',
  '  visited: boolean',
  '  onClick: () => void',
  '}) {',
  '  const eraNames = person.eraIds',
  '    .map(eid => eras.find(e => e.id === eid))',
  '    .filter((e): e is Era => Boolean(e))',
  '  const catMeta = CATEGORY_LABEL[person.category]',
  '  const kw = personSearchKeywords[person.id] ?? fallbackKeyword(person.name, person.category)',
  '  // 横向缩略图（与全战争/全文化/全地理统一：400x240）',
  '  const img = bingImage(kw, 400, 240)',
  '  const years = (() => {',
  '    if (person.birthYear && person.deathYear) {',
  '      const b = person.birthYear < 0 ? `BC ${-person.birthYear}` : `${person.birthYear}`',
  '      const d = person.deathYear < 0 ? `BC ${-person.deathYear}` : `${person.deathYear}`',
  '      return `${b} ~ ${d}`',
  '    }',
  '    return null',
  '  })()',
  '',
  '  return (',
  '    <button',
  '      onClick={onClick}',
  '      className="text-left rounded-lg bg-ink-800/60 border border-ink-700 hover:border-bronze-500/60 hover:bg-ink-700/60 transition-all relative group overflow-hidden flex"',
  '    >',
  '      {/* 左：缩略图（统一 128px 宽） */}',
  '      <div className="relative w-32 flex-shrink-0 bg-ink-900">',
  '        <img',
  '          src={img}',
  '          alt={person.name}',
  '          loading="lazy"',
  '          className="w-full h-full object-cover"',
  '          onError={(e) => { (e.target as HTMLImageElement).style.display = \'none\' }}',
  '        />',
  '        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink-800/30 pointer-events-none" />',
  '        {/* 已了解对勾 */}',
  '        {visited && (',
  '          <span className="absolute top-1.5 right-1.5 text-green-400 text-sm bg-ink-900/70 backdrop-blur w-5 h-5 rounded-full flex items-center justify-center" title="已了解">✓</span>',
  '        )}',
  '      </div>',
  '      {/* 右：信息 */}',
  '      <div className="flex-1 p-3 min-w-0">',
  '        <div className="flex items-center gap-2 mb-1 flex-wrap">',
  '          <span',
  '            className="text-lg w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"',
  '            style={{ background: catMeta.color + \'25\' }}',
  '            title={catMeta.label}',
  '          >',
  '            {catMeta.icon}',
  '          </span>',
  '          <span className="text-sm font-serif text-parchment-50 truncate flex-1">{person.name}</span>',
  '        </div>',
  '        <div className="text-[10px] text-ink-500 mb-1 truncate">',
  '          {years ? `${years} · ${person.role.slice(0, 24)}${person.role.length > 24 ? \'…\' : \'\'}` : person.role.slice(0, 30)}',
  '        </div>',
  '        <div className="text-[10px] text-ink-400 line-clamp-2 leading-relaxed mb-1">{person.description?.slice(0, 60)}{person.description && person.description.length > 60 ? \'…\' : \'\'}</div>',
  '        <div className="flex flex-wrap gap-1 mt-1">',
  '          {eraNames.slice(0, 2).map(e => (',
  '            <span',
  '              key={e.id}',
  '              className="text-[9px] px-1.5 py-0.5 rounded"',
  '              style={{ background: e.color + \'20\', color: e.color }}',
  '            >',
  '              {e.name}',
  '            </span>',
  '          ))}',
  '          {eraNames.length > 2 && (',
  '            <span className="text-[9px] text-ink-500">+{eraNames.length - 2}</span>',
  '          )}',
  '        </div>',
  '      </div>',
  '    </button>',
  '  )',
  '}',
];

lines.splice(startIdx, endIdx - startIdx + 1, ...newCard);
fs.writeFileSync('src/components/Figures/FiguresOverview.tsx', lines.join('\n'));
console.log('Done. Old:', endIdx - startIdx + 1, 'lines. New:', newCard.length, 'lines');
