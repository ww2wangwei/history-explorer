"""Download matched artifacts, dedup per lesson (pick latest), save to webp, update JSON."""
import json
import re
import subprocess
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

MATCH_FILE = Path('C:/Users/ww220/AppData/Local/Temp/opencode/bonus_artifact_map.json')
YOUTH = Path('E:/我的项目/历史软件/src/data/youth-world-history.json')
WEBP_DIR = Path('E:/我的项目/历史软件/public/world-history')
TMP_DIR = Path('C:/Users/ww220/AppData/Local/Temp/opencode/youth_dl_tmp')
PROGRESS = Path('C:/Users/ww220/AppData/Local/Temp/opencode/youth_dl_progress.json')

with MATCH_FILE.open(encoding='utf-8') as f:
    matches = json.load(f)

# Dedupe: for each lid, keep the artifact with shortest title (most specific)
by_lid = {}
for m in matches:
    lid = m['lid']
    if lid not in by_lid or len(m['title']) < len(by_lid[lid]['title']):
        by_lid[lid] = m

print(f'Dedup: {len(by_lid)} unique lessons (from {len(matches)} matches)')

with YOUTH.open(encoding='utf-8') as f:
    yh = json.load(f)


def download_via_cli(artifact_id, dest):
    cmd = ['notebooklm', 'download', 'infographic', '-a', artifact_id,
           '--json', str(dest)]
    proc = subprocess.run(cmd, capture_output=True, timeout=180)
    if proc.returncode != 0:
        stderr = proc.stderr.decode('utf-8', errors='replace') if isinstance(proc.stderr, bytes) else proc.stderr
        raise RuntimeError(f'cli failed: {stderr[-300:]}')
    if not dest.exists() or dest.stat().st_size < 5000:
        raise RuntimeError('download too small')
    return dest


def png_to_webp(png, webp):
    from PIL import Image
    im = Image.open(png)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGB')
    im.thumbnail((1200, 1200))
    im.save(str(webp), 'WEBP', quality=88, method=6)


def load_progress():
    if PROGRESS.exists():
        return json.loads(PROGRESS.read_text(encoding='utf-8'))
    return {'done': {}, 'failed': {}}


def save_progress(p):
    PROGRESS.write_text(json.dumps(p, ensure_ascii=False, indent=2), encoding='utf-8')


def update_json(lid, webp_rel):
    yh_l = json.loads(YOUTH.read_text(encoding='utf-8'))
    for L in yh_l['lessons']:
        if L['id'] == lid:
            L['infographic'] = webp_rel
            break
    YOUTH.write_text(json.dumps(yh_l, ensure_ascii=False, indent=2), encoding='utf-8')


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--yes', action='store_true')
    ap.add_argument('--no-resume', action='store_true')
    args = ap.parse_args()

    if args.no_resume:
        save_progress({'done': {}, 'failed': {}})

    progress = load_progress()
    WEBP_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    todo = list(by_lid.items())
    if args.limit:
        todo = todo[:args.limit]
    if not args.yes and len(todo) > 3:
        ans = input(f'Download {len(todo)} infographics? (yes/no): ').strip().lower()
        if ans not in ('y', 'yes'):
            print('Aborted.')
            return

    ok = fail = 0
    for i, (lid, m) in enumerate(todo, 1):
        if lid in progress['done']:
            continue
        art_id = m['artifact_id']
        title = m['title']
        print(f'\n[{i}/{len(todo)}] {lid} <- {title[:50]}')
        print(f'  artifact: {art_id[:12]}...')
        try:
            png = TMP_DIR / f'{lid}.png'
            download_via_cli(art_id, png)
            webp = WEBP_DIR / f'{lid}.webp'
            png_to_webp(png, webp)
            update_json(lid, f'/world-history/{lid}.webp')
            sz = webp.stat().st_size
            progress['done'][lid] = {'artifact_id': art_id, 'size': sz}
            save_progress(progress)
            ok += 1
            print(f'  OK {sz//1024} KB')
        except Exception as e:
            progress['failed'][lid] = repr(e)[:300]
            save_progress(progress)
            fail += 1
            print(f'  FAIL: {e}')

    print(f'\n=== summary ===')
    print(f'  done: {ok}  fail: {fail}')


if __name__ == '__main__':
    main()