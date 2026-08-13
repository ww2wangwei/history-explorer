"""restore_ge65.py — copy mandarin W065+ webp (except W091 which mandarin also lacks)
to piranha/public/world-history and update infographic field in youth-world-history.json.
"""
import json, os, shutil, sys
sys.stdout.reconfigure(encoding='utf-8')

M = r'C:\Users\ww220\orca\workspaces\历史软件\mandarin\public\world-history'
P = r'C:\Users\ww220\orca\workspaces\历史软件\piranha\public\world-history'
JSON = r'C:\Users\ww220\orca\workspaces\历史软件\piranha\src\data\youth-world-history.json'

with open(JSON, 'r', encoding='utf-8') as f:
    data = json.load(f)

copied = []
written = []
skipped = []

for L in data['lessons']:
    lid = L['id']
    if not (lid.startswith('W') and lid[1:].isdigit()):
        continue
    n = int(lid[1:])
    if n < 65:
        continue
    src = os.path.join(M, f'{lid}.webp')
    dst = os.path.join(P, f'{lid}.webp')
    if not os.path.exists(src):
        skipped.append(lid)
        continue
    # copy
    shutil.copy2(src, dst)
    copied.append(lid)
    # write JSON
    L['infographic'] = f'/world-history/{lid}.webp'
    written.append(lid)

# write back
with open(JSON, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'copied: {len(copied)}')
print(f'written to JSON: {len(written)}')
print(f'skipped (no mandarin source): {skipped}')
print(f'first/last 5 copied: {copied[:5]} ... {copied[-5:]}')