"""restore_rseries.py — copy mandarin R-series webp to piranha
and update infographic field in youth-world-history.json.

mirrors restore_ge65.py logic for R-series scope.
"""
import json, os, shutil, sys
sys.stdout.reconfigure(encoding='utf-8')

M = r'C:\Users\ww220\orca\workspaces\历史软件\mandarin\public\world-history'
P = r'C:\Users\ww220\orca\workspaces\历史软件\piranha\public\world-history'
JSON = r'C:\Users\ww220\orca\workspaces\历史软件\piranha\src\data\youth-world-history.json'

with open(JSON, 'r', encoding='utf-8') as f:
    data = json.load(f)

copied = []
skipped = []
for L in data['lessons']:
    lid = L['id']
    if not lid.startswith('R'):
        continue
    src = os.path.join(M, f'{lid}.webp')
    dst = os.path.join(P, f'{lid}.webp')
    if not os.path.exists(src):
        skipped.append(lid)
        continue
    shutil.copy2(src, dst)
    copied.append(lid)
    L['infographic'] = f'/world-history/{lid}.webp'

with open(JSON, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'copied/written: {len(copied)} -> {copied}')
print(f'skipped: {skipped}')