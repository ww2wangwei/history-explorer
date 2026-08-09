"""
scripts/gen_ladder_infographics_v2.py

用 Python SDK (NotebookLMClient) 跑 99 W + 5 mapped B = 104 lesson
批量 generate infographic:
  1. Phase 1: 试 1 张 W001 → 验 auth + rate-limit
  2. Phase 2: 串行 create, 每张间隔 30s 防 rate limit
  3. Phase 3: download PNG → PIL webp → public/world-history/<lid>.webp
  4. Phase 4: 写回 src/data/youth-world-history.json infographic 字段

进度持久化在 C:\\Users\\ww220\\AppData\\Local\\Temp\\opencode\\ladder_progress.json

R/B 系列 (没独立 source) 跳过 — 不骗用户说 NotebookLM 生了图。
"""
import sys
import os
import re
import asyncio
import json
import io
import time
from pathlib import Path

sys.path.insert(0, r'C:\Users\ww220\AppData\Roaming\uv\tools\notebooklm-mcp-cli\Lib\site-packages')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from notebooklm_tools.core.auth import load_cached_tokens
from notebooklm_tools.core.client import NotebookLMClient

NB = 'c30eedc8-e05a-43d9-918b-c6cc6b7387b5'
MAP_PATH = r'C:\Users\ww220\AppData\Local\Temp\lesson_source_map.json'
JSON_PATH = r'C:\Users\ww220\orca\workspaces\历史软件\piranha\src\data\youth-world-history.json'
PROGRESS = Path(r'C:\Users\ww220\AppData\Local\Temp\opencode\ladder_progress.json')
TMP_PNG = Path(r'C:\Users\ww220\AppData\Local\Temp\opencode\ladder_artifacts')
WEBP_DIR = Path(r'C:\Users\ww220\orca\workspaces\历史软件\piranha\public\world-history')
TMP_PNG.mkdir(parents=True, exist_ok=True)
WEBP_DIR.mkdir(parents=True, exist_ok=True)

# Load progress
if PROGRESS.exists():
    progress = json.loads(PROGRESS.read_text(encoding='utf-8'))
else:
    progress = {'created': {}, 'downloaded': {}, 'webp': {}, 'failed': {}, 'auth_expired': False}

# Load mapping
with open(MAP_PATH, 'r', encoding='utf-8') as f:
    mp = json.load(f)['mapping']

# Load lessons
with open(JSON_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)
lessons = {L['id']: L for L in data['lessons']}

# Targets
targets = [(lid, src_id) for lid, src_id in mp.items()]
print(f'targets: {len(targets)} mapped lessons')


def save_progress():
    PROGRESS.write_text(json.dumps(progress, ensure_ascii=False, indent=2), encoding='utf-8')


def strip_focus(title):
    title = re.sub(r'^\s*\d+[a-z]?\s*\u3010[^\u3011]*\u3011\s*', '', title).strip()
    title = title[:18].replace(':', '').replace('：', '').replace('"', '').replace('"', '').replace(',', '').strip()
    return title or '历史'


async def create_one(client, src_id, focus, retries=6):
    """create with exponential backoff on RESOURCE_EXHAUSTED / rate-limit errors."""
    base_wait = 30
    for attempt in range(retries):
        try:
            r = await client.create_infographic(
                notebook_id=NB, source_ids=[src_id],
                focus_prompt=focus, language='zh',
            )
            if r and isinstance(r, dict) and r.get('id'):
                return r['id']
            # Some return shapes: {'id': ..., 'name': ...}
            for k in ('id', 'artifact_id', 'task_id'):
                if r and r.get(k):
                    return r[k]
            return None
        except Exception as e:
            estr = repr(e)[:200]
            print(f'    create err attempt {attempt+1}: {estr}', flush=True)
            if 'Authentication' in estr or 'expired' in estr.lower():
                progress['auth_expired'] = True
                save_progress()
                raise SystemExit('AUTH EXPIRED')
            if 'RESOURCE_EXHAUSTED' in estr or 'rate' in estr.lower() or 'disconnected' in estr.lower():
                wait = base_wait * (2 ** attempt)
                print(f'    rate-limited; sleeping {wait}s', flush=True)
                await asyncio.sleep(wait)
                continue
            await asyncio.sleep(5)
    return None


async def download_one(client, artifact_id, out_png, retries=4):
    base = 5
    for i in range(retries):
        try:
            await client.download_infographic_async(NB, str(out_png), artifact_id=artifact_id)
            if out_png.exists() and out_png.stat().st_size > 1024:
                return True
        except Exception as e:
            estr = repr(e)[:150]
            print(f'    dl err: {estr}', flush=True)
            if 'Authentication' in estr or 'expired' in estr.lower():
                progress['auth_expired'] = True
                save_progress()
                raise SystemExit('AUTH EXPIRED')
        await asyncio.sleep(base * (2 ** i))
    return False


def png_to_webp(png_path, webp_path):
    from PIL import Image
    im = Image.open(png_path)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGB')
    im.thumbnail((1200, 1200))
    im.save(str(webp_path), 'WEBP', quality=88, method=6)


def writeback(lid, webp_path):
    rel = f'/world-history/{lid}.webp'
    for L in data['lessons']:
        if L['id'] == lid:
            L['infographic'] = rel
            return
    raise KeyError(lid)


async def main():
    tokens = load_cached_tokens()
    client = NotebookLMClient(cookies=tokens.cookies, csrf_token=tokens.csrf_token)
    print(f'auth: cookies={len(tokens.cookies)}', flush=True)

    # Phase 1: probe
    print('=== phase 1: probe create ===', flush=True)
    probe_lid = 'W001'
    probe_src = mp[probe_lid]
    probe_focus = strip_focus(lessons[probe_lid]['title'])
    probe_aid = await create_one(client, probe_src, probe_focus, retries=2)
    if probe_aid:
        progress['created'][probe_lid] = probe_aid
        save_progress()
        print(f'  probe W001 OK: {probe_aid}', flush=True)
    else:
        print('  probe FAIL; will wait and retry during phase 2', flush=True)

    # Phase 2: create remaining (skip those already in progress)
    print('=== phase 2: create infographics ===', flush=True)
    pending = [(lid, sid) for lid, sid in targets
               if lid not in progress['created'] and lid not in progress['failed']]
    print(f'  pending creates: {len(pending)}', flush=True)
    for i, (lid, sid) in enumerate(pending):
        if lid in progress['created']:
            continue
        L = lessons[lid]
        focus = strip_focus(L['title'])
        print(f'  [{i+1}/{len(pending)}] create {lid} focus={focus!r}', flush=True)
        aid = await create_one(client, sid, focus, retries=8)
        if aid:
            progress['created'][lid] = aid
            print(f'    OK {aid}', flush=True)
        else:
            progress['failed'][lid] = 'create_no_artifact'
            print(f'    FAIL', flush=True)
        save_progress()
        # Sleep between creates to avoid rate limit (30s base, longer if recent failure)
        await asyncio.sleep(30)

    # Phase 3: download (parallel-ish but sequential to keep simple)
    print('=== phase 3: download artifacts ===', flush=True)
    to_dl = [(lid, aid) for lid, aid in progress['created'].items() if lid not in progress['downloaded']]
    for lid, aid in to_dl:
        png = TMP_PNG / f'{lid}.png'
        print(f'  download {lid} ...', end=' ', flush=True)
        if png.exists() and png.stat().st_size > 1024:
            print(f'cached {png.stat().st_size//1024} KB')
        else:
            ok = await download_one(client, aid, png)
            if ok:
                print(f'OK {png.stat().st_size//1024} KB')
            else:
                print('FAIL')
                continue
        # convert + writeback
        webp = WEBP_DIR / f'{lid}.webp'
        try:
            png_to_webp(png, webp)
            writeback(lid, webp)
            progress['downloaded'][lid] = str(png)
            progress['webp'][lid] = str(webp)
            save_progress()
            print(f'    -> {webp.name} {webp.stat().st_size//1024} KB + JSON written')
        except Exception as e:
            print(f'    webp FAIL: {e}')

    # Summary
    print('=== summary ===', flush=True)
    print(f'  created: {len(progress["created"])}', flush=True)
    print(f'  downloaded: {len(progress["downloaded"])}', flush=True)
    print(f'  failed: {len(progress["failed"])}', flush=True)
    if progress.get('auth_expired'):
        print('  AUTH EXPIRED — please re-run nlm login', flush=True)


if __name__ == '__main__':
    asyncio.run(main())
