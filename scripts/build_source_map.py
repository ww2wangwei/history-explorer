"""
build_source_map.py — 一次性从 NotebookLM notebook 拉 sources,
按 lesson.id 数字前缀匹配 → 写 lesson_source_map.json。

W001..W099 + B 番外(用数字回落 W{num}) 由 title 数字前缀匹配;
R史料 没独立 source, 不写入。
"""
import sys, os, io, json, re
sys.path.insert(0, r'C:\Users\ww220\AppData\Roaming\uv\tools\notebooklm-mcp-cli\Lib\site-packages')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7897'

from notebooklm_tools.core.auth import load_cached_tokens
from notebooklm_tools.core.client import NotebookLMClient

NB = 'c30eedc8-e05a-43d9-918b-c6cc6b7387b5'
JSON_PATH = r'C:\Users\ww220\orca\workspaces\历史软件\piranha\src\data\youth-world-history.json'
OUT = r'C:\Users\ww220\AppData\Local\Temp\lesson_source_map.json'


async def main():
    tokens = load_cached_tokens()
    client = NotebookLMClient(cookies=tokens.cookies, csrf_token=tokens.csrf_token)
    nb_data = client.get_notebook_sources_with_types(NB)
    srcs = nb_data
    print(f'sources: {len(srcs)}')

    # Build index: numeric prefix → source uuid. Prefer main (no suffix) when both exist.
    index = {}
    for s in srcs:
        title = s.get('title', '')
        m = re.match(r'^(\d+)([a-z]?)', title)
        if not m:
            continue
        num = int(m.group(1))
        suf = m.group(2)
        key = f'W{num:03d}'
        if key not in index:
            index[key] = (s['id'], suf)
        elif not suf and index[key][1] != '':
            # upgrade a suffix variant to the canonical main entry
            index[key] = (s['id'], suf)

    # Load lessons
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    lessons = data['lessons']

    mapping = {}
    unmapped = []
    for L in lessons:
        lid = L['id']
        # W series
        m = re.match(r'^W(\d+)', lid)
        if m:
            num = int(m.group(1))
            key = f'W{num:03d}'
            if key in index:
                mapping[lid] = {'source_uuid': index[key][0], 'source_title_key': key}
                continue
        # B番外: try numeric → W key
        m = re.match(r'^B0*(\d+)', lid)
        if m:
            num = int(m.group(1))
            for cand_key in (f'W{num:03d}', f'W{num:03d}a', f'W{num:03d}b'):
                if cand_key in index:
                    mapping[lid] = {'source_uuid': index[cand_key][0], 'source_title_key': cand_key}
                    break
            else:
                unmapped.append(lid)
            continue
        # R史料 — unmapped (rare史 no standalone source)
        unmapped.append(lid)

    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump({'mapping': mapping, 'unmapped': unmapped}, f, ensure_ascii=False, indent=2)
    print(f'mapping: {len(mapping)}, unmapped: {len(unmapped)}')
    print(f'unmapped list: {unmapped[:20]}')


if __name__ == '__main__':
    import asyncio
    asyncio.run(main())