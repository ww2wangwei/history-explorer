"""定位 shimao 条目里 ** 不成对的位置。"""
import re

text = open('src/data/traditions.ts', encoding='utf-8').read()
pattern = re.compile(r"\{\s*id:\s*'tr-history-shimao',\s*category:\s*'history'")
m = pattern.search(text)
start = m.start()
depth = 0
i = start
while i < len(text):
    ch = text[i]
    if ch == '{':
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            break
    i += 1
body = text[start:end]
print(f'body 总长: {len(body)}')

# 用 eval-style parser: 找所有 ': ' 后的字符串值
# 简化：按行扫描，每行检查
for line_no, line in enumerate(body.split('\n'), 1):
    cnt = line.count('**')
    if cnt % 2 != 0:
        print(f'L{line_no}: **{cnt} 不配对: {line[:120]}')