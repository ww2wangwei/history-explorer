"""
fix_odd_bold.py — Strip one extra ** from entries with odd bold count.
"""
import re

text = open('src/data/traditions.ts', encoding='utf-8').read()

def fix_entry(text, tid, category):
    anchor = f"{{ id: '{tid}', category: '{category}'"
    idx = text.find(anchor)
    if idx < 0: return text, False
    # find balanced braces
    depth = 0; i = idx
    while i < len(text):
        ch = text[i]
        if ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0: break
        i += 1
    end = i + 1
    block = text[idx:end]

    bold_count = block.count('**')
    print(f'{tid}: ** count = {bold_count}')
    if bold_count % 2 != 0:
        # remove one ** to make even (replace first occurrence with empty)
        new_block = block.replace('**', '__TEMP__', 1).replace('**', '', 1).replace('__TEMP__', '', 1)
        return text[:idx] + new_block + text[end:], True
    return text, False

for tid in ['tr-lit-su-shi', 'tr-lit-yuanzaju']:
    text, changed = fix_entry(text, tid, 'literature')
    if changed:
        print(f'  fixed {tid}')
    else:
        print(f'  unchanged {tid}')

open('src/data/traditions.ts', 'w', encoding='utf-8').write(text)
print('Saved')
