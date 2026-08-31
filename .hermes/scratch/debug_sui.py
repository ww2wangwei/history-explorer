"""定位 sui 里 ** 不成对的具体位置。"""
import re
from pathlib import Path

text = Path('src/data/traditions.ts').read_text(encoding='utf-8')
pattern = re.compile(r"\{\s*id:\s*'tr-history-sui',\s*category:\s*'history'")
m = pattern.search(text)
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
# 按行扫描
for line in body.split('\n'):
    cnt = line.count('**')
    if cnt % 2 != 0:
        print(f'  错位: {line[:200]}')