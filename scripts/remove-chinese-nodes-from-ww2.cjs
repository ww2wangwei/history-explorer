/**
 * 从 ww2 专题中移除中国抗战节点（1937-1939 + 中国相关）
 * 这些节点已存在于 china-ww2 专题中
 */
const fs = require('fs');
let s = fs.readFileSync('src/components/Wars/WarsOverview.tsx', 'utf8');

// ww2 专题中要移除的中国抗战节点
const TO_REMOVE = [
  '七七事变',
  '淞沪会战',
  '南京大屠杀',
  '台儿庄战役',
  '武汉会战',
  '百团大战',
];

let removed = 0;
TO_REMOVE.forEach(title => {
  // 匹配: { title: 'xxx', year: yyy, location: '...', importance: n, description: '...', (optional bg/detail/result/impact) }
  // 整体匹配整个 { ... } 块
  const escapeReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    "\\s*\\{\\s*title:\\s*'" + escapeReg(title) + "'[\\s\\S]*?\\},?\\n",
    'g'
  );
  const before = s.length;
  s = s.replace(re, '\n');
  const after = s.length;
  if (after < before) {
    removed++;
    console.log('已移除:', title);
  } else {
    console.log('未找到:', title);
  }
});

fs.writeFileSync('src/components/Wars/WarsOverview.tsx', s);
console.log('\\n合计移除', removed, '个节点');
