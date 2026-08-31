"""
fix_odd_bold_v3.py — Properly remove one ** to make count even.
"""
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
        # Replace ONE ** with empty string
        # We need to pick one that won't break Markdown.
        # Strategy: pick the LAST ** (which is unpaired by odd-count logic)
        last_pos = block.rfind('**')
        print(f'  Removing last ** at {last_pos}: ...{block[max(0,last_pos-30):last_pos+30]}...')
        new_block = block[:last_pos] + block[last_pos+2:]
        return text[:idx] + new_block + text[end:], True
    return text, False

for tid in ['tr-lit-su-shi', 'tr-lit-yuanzaju']:
    text, changed = fix_entry(text, tid, 'literature')
    if changed:
        print(f'  fixed {tid}')

open('src/data/traditions.ts', 'w', encoding='utf-8').write(text)
print('Saved')
