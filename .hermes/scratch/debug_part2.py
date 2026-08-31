"""定位 chunqiu/qin 里 ** 不成对的具体位置。"""
import re
from pathlib import Path

text = Path('src/data/traditions.ts').read_text(encoding='utf-8')

for tid in ['tr-history-chunqiu', 'tr-history-qin']:
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
    n = body.count('**')
    if n % 2 == 0:
        print(f'{tid}: OK ({n})')
        continue
    print(f'{tid}: **={n} 奇数')
    # 按行扫描
    for line in body.split('\n'):
        cnt = line.count('**')
        if cnt % 2 != 0:
            print(f'  错位: {line[:130]}')