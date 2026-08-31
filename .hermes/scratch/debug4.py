"""定位 wudai/song/yuanhou/nvzhen 里 quote 错位。"""
import re
from pathlib import Path

text = Path('src/data/traditions.ts').read_text(encoding='utf-8')

for tid in ['tr-history-wudai', 'tr-history-song', 'tr-history-yuanhou', 'tr-history-nvzhen']:
    pattern = re.compile(rf"\{{\s*id:\s*'{tid}',\s*category:\s*'history'")
    m = pattern.search(text)
    if not m: continue
    start = m.start()
    depth = 0; i = start
    while i < len(text):
        ch = text[i]
        if ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0: end = i + 1; break
        i += 1
    body = text[start:end]
    for line in body.split('\n'):
        if 'quote' in line and line.count('**') % 2 != 0:
            print(f'{tid}: {line[:150]}')