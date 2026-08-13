import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')

P_JSON = r'C:\Users\ww220\orca\workspaces\历史软件\piranha\src\data\youth-world-history.json'
M_DIR  = r'C:\Users\ww220\orca\workspaces\历史软件\mandarin\public\world-history'

with open(P_JSON, 'r', encoding='utf-8') as f:
    data = json.load(f)
lessons = data['lessons']

m_files = set(os.listdir(M_DIR))

print('=== R-series lesson status ===')
for L in lessons:
    if L['id'].startswith('R'):
        have = L.get('infographic') or '(none)'
        in_m = '✓' if f"{L['id']}.webp" in m_files else '✗'
        print(f'  {L["id"]:8s} {in_m} inf={have:25s} title={L["title"][:35]}')

print('\n=== W091 status ===')
for L in lessons:
    if L['id'] == 'W091':
        print(f'  {L["id"]} inf={L.get("infographic","-")} title={L["title"]}')

print('\n=== B-series lesson status ===')
for L in lessons:
    if L['id'].startswith('B'):
        have = L.get('infographic') or '(none)'
        in_m = '✓' if f"{L['id']}.webp" in m_files else '✗'
        print(f'  {L["id"]:8s} {in_m} inf={have:25s} title={L["title"][:35]}')

print('\n=== W065-W100 lessons with infographic field status ===')
for L in lessons:
    lid = L['id']
    if not (lid.startswith('W') and lid[1:].isdigit()):
        continue
    n = int(lid[1:])
    if n < 65:
        continue
    have = L.get('infographic') or '(none)'
    in_m = '✓' if f"{L['id']}.webp" in m_files else '✗'
    in_p = '✓' if os.path.exists(rf'C:\Users\ww220\orca\workspaces\历史软件\piranha\public\world-history\{L["id"]}.webp') else '✗'
    print(f'  {L["id"]:6s} mandarin={in_m} piranha={in_p} inf={have}  {L["title"][:30]}')