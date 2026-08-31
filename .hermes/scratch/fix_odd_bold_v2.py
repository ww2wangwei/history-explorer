"""
fix_odd_bold_v2.py — Smart fix odd-bold: find unpaired ** and remove it.
Approach: track ** as we walk the text. When we see an unclosed **, remove it.
"""
import re

text = open('src/data/traditions.ts', encoding='utf-8').read()

def fix_entry(text, tid, category):
    anchor = f"{{ id: '{tid}', category: '{category}'"
    idx = text.find(anchor)
    if idx < 0: return text, False
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
        # Walk the block; find positions of ** and detect unpaired ones
        positions = []
        j = 0
        while True:
            k = block.find('**', j)
            if k < 0: break
            positions.append(k)
            j = k + 2
        # Pair them up; the last unpaired one is the problem.
        # Actually: since they're inside string literals (single-quoted), the simplest
        # robust fix: remove every ** that's preceded by ** (already paired) is wrong.
        # Better: just remove the last ** (last one is unpaired by odd count)
        last_pos = positions[-1]
        # verify it's a standalone **, not inside a value with content
        # show context
        print(f'  Removing last ** at {last_pos}: ...{block[max(0,last_pos-20):last_pos+20]}...')
        new_block = block[:last_pos] + block[last_pos+2:]
        return text[:idx] + new_block + text[end:], True
    return text, False

for tid in ['tr-lit-su-shi', 'tr-lit-yuanzaju']:
    text, changed = fix_entry(text, tid, 'literature')
    if changed:
        print(f'  fixed {tid}')

open('src/data/traditions.ts', 'w', encoding='utf-8').write(text)
print('Saved')
