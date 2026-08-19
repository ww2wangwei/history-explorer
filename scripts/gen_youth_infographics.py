"""Generate NotebookLM infographics for youth-world-history bonus lessons missing them.

Uses subprocess to call notebooklm CLI directly:
  notebooklm generate infographic --source <id> --wait --json
  notebooklm download infographic <path> --json

Resumable: skips already-done lessons (checks progress.json + JSON infographic field).
"""
import argparse
import io
import json
import re
import subprocess
import sys
import time
from pathlib import Path

NB_ID = 'c30eedc8-e05a-43d9-918b-c6cc6b7387b5'
YOUTH = Path('E:/我的项目/历史软件/src/data/youth-world-history.json')
MAP_FILE = Path('C:/Users/ww220/AppData/Local/Temp/opencode/lesson_source_map.json')
WEBP_DIR = Path('E:/我的项目/历史软件/public/world-history')
PROGRESS = Path('C:/Users/ww220/AppData/Local/Temp/opencode/youth_infographic_progress.json')
TMP_PNG  = Path('C:/Users/ww220/AppData/Local/Temp/opencode/youth_artifacts')
LOG_FILE = Path('C:/Users/ww220/AppData/Local/Temp/opencode/youth_infographic.log')

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Load
yh = json.loads(YOUTH.read_text(encoding='utf-8'))
mp = json.loads(MAP_FILE.read_text(encoding='utf-8'))['mapping']


def load_progress():
    if PROGRESS.exists():
        try:
            return json.loads(PROGRESS.read_text(encoding='utf-8'))
        except Exception:
            pass
    return {'done': {}, 'failed': {}, 'in_progress': {}}


def save_progress(p):
    PROGRESS.write_text(json.dumps(p, ensure_ascii=False, indent=2), encoding='utf-8')


def focus_prompt(title):
    """Extract a short focus keyword from lesson title."""
    t = re.sub(r'^\d+\s*', '', title).strip()
    t = t.split('：')[0].split(':')[0].strip()
    t = re.sub(r'[《》()（）「」『』]', '', t)
    return t[:30] or '历史'


def run_cli(cmd, *, timeout):
    """Run notebooklm CLI, return (returncode, stdout, stderr)."""
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    return proc.returncode, proc.stdout, proc.stderr


def generate_one(lid, src_id, focus, *, wait_timeout, interval, retries=10, quota_wait_seconds=43200):
    """Generate infographic. Returns (True, artifact_dict) or (False, error_msg).

    On hard rate limit (USER_DISPLAYABLE_ERROR / RateLimitError from
    NotebookLM RPC), sleeps for quota_wait_seconds (default 12h) then retries.
    This handles Google's per-account daily infographic quota.
    """
    last_err = None
    hard_quota_hit = False
    for attempt in range(1, retries + 1):
        cmd = [
            'notebooklm', 'generate', 'infographic',
            focus,
            '-n', NB_ID,
            '-s', src_id,
            '--wait',
            '--timeout', str(wait_timeout),
            '--interval', str(interval),
            '--json',
        ]
        rc, stdout, stderr = run_cli(cmd, timeout=wait_timeout + 60)
        stderr_text = stderr.decode('utf-8', errors='replace') if isinstance(stderr, bytes) else stderr
        if rc != 0:
            last_err = f'rc={rc} stderr={stderr_text[-200:]}'
            # Soft rate (transient queue/503) — short retry
            if ('rate' in stderr_text.lower() and 'queue' in stderr_text.lower()) or '503' in stderr_text:
                wait = 30 * attempt
                print(f'    [soft-rate] attempt {attempt}/{retries}, sleep {wait}s', flush=True)
                time.sleep(wait)
                continue
            # Hard quota (USER_DISPLAYABLE_ERROR / RateLimitError) — sleep 12h
            if ('USER_DISPLAYABLE_ERROR' in stderr_text
                    or 'RateLimitError' in stderr_text
                    or 'rate limited' in stderr_text.lower()):
                hard_quota_hit = True
                print(f'    [HARD QUOTA] sleeping {quota_wait_seconds//3600}h...', flush=True)
                time.sleep(quota_wait_seconds)
                # After long sleep, retry this attempt again (don't consume attempt)
                attempt -= 1
                continue
            # Non-rate error
            return False, last_err
        # Parse JSON — CLI emits progress lines + final JSON. Extract last JSON object.
        try:
            text = stdout.strip() if isinstance(stdout, str) else stdout.decode('utf-8', errors='replace')
            start = text.rfind('{')
            if start < 0:
                raise ValueError('no { in output')
            data = json.loads(text[start:])
        except Exception as e:
            last_err = f'parse error: {e}  stdout={text[-300:] if isinstance(text, str) else str(text[-300:])}'
            time.sleep(5 * attempt)
            continue
        # Check status — CLI returns 'url' (singular) at top level
        status = data.get('status', '?')
        # Some responses include code field with hard-quota indicator
        code = data.get('code', '')
        if code in ('USER_DISPLAYABLE_ERROR', 'RATE_LIMITED') or status == 'rate_limited':
            print(f'    [HARD QUOTA in JSON] sleeping {quota_wait_seconds//3600}h...', flush=True)
            time.sleep(quota_wait_seconds)
            attempt -= 1
            continue
        url = data.get('url') or (data.get('urls') or [None])[0]
        urls = [url] if url else []
        if status == 'completed' and urls:
            return True, data
        last_err = f'status={status} url={url}'
        if attempt < retries:
            time.sleep(15)
    return False, last_err or 'unknown'


def download_one(dest):
    """Use notebooklm CLI to download the latest infographic (auth-handled)."""
    cmd = [
        'notebooklm', 'download', 'infographic',
        '--latest',
        '--json',
        str(dest),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    if proc.returncode != 0:
        raise RuntimeError(f'cli failed rc={proc.returncode}: {proc.stderr[-300:]}')
    if not dest.exists() or dest.stat().st_size < 5000:
        raise RuntimeError(f'download too small or missing: {dest.stat().st_size if dest.exists() else 0}')
    return dest


def png_to_webp(png_path, webp_path):
    from PIL import Image
    im = Image.open(png_path)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGB')
    im.thumbnail((1200, 1200))
    webp_path.parent.mkdir(parents=True, exist_ok=True)
    im.save(str(webp_path), 'WEBP', quality=88, method=6)


def update_json(lid, webp_rel_path):
    """Update youth-world-history.json with infographic field."""
    yh_local = json.loads(YOUTH.read_text(encoding='utf-8'))
    for L in yh_local['lessons']:
        if L['id'] == lid:
            L['infographic'] = webp_rel_path
            break
    YOUTH.write_text(json.dumps(yh_local, ensure_ascii=False, indent=2), encoding='utf-8')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--yes', action='store_true', help='skip confirmation')
    ap.add_argument('--sleep', type=float, default=20.0, help='sleep between lessons')
    ap.add_argument('--timeout', type=int, default=480, help='per-lesson wait timeout (s)')
    ap.add_argument('--interval', type=int, default=6, help='poll interval (s)')
    ap.add_argument('--retries', type=int, default=10, help='retry count (also covers hard-quota restarts)')
    ap.add_argument('--quota-wait-hours', type=float, default=12, help='hours to sleep on hard quota (USER_DISPLAYABLE_ERROR)')
    ap.add_argument('--no-resume', action='store_true')
    ap.add_argument('--one', help='process only this lesson id (test mode)')
    args = ap.parse_args()

    if args.no_resume:
        save_progress({'done': {}, 'failed': {}, 'in_progress': {}})

    progress = load_progress()

    # Targets
    targets = []
    for L in yh['lessons']:
        lid = L['id']
        grp = L.get('group')
        if grp != 'bonus':
            continue
        if L.get('infographic'):
            continue
        if lid in progress['done']:
            continue
        if lid not in mp:
            continue
        targets.append(lid)

    if args.one:
        targets = [args.one] if args.one in mp else []
    if args.limit:
        targets = targets[:args.limit]

    print(f'Targets: {len(targets)} bonus lessons', flush=True)
    if args.dry_run:
        for lid in targets[:10]:
            print(f'  {lid}: focus={focus_prompt(next(l for l in yh["lessons"] if l["id"] == lid)["title"])}')
        return

    if not args.yes and len(targets) > 3:
        ans = input(f'\nGenerate {len(targets)} infographics? (yes/no): ').strip().lower()
        if ans not in ('y', 'yes'):
            print('Aborted.')
            return

    TMP_PNG.mkdir(parents=True, exist_ok=True)
    WEBP_DIR.mkdir(parents=True, exist_ok=True)

    start = time.time()
    ok = 0
    fail = 0

    for i, lid in enumerate(todo := targets, 1):
        elapsed = time.time() - start
        avg = elapsed / max(i-1, 1) if i > 1 else 0
        eta = avg * (len(todo) - i + 1)
        L = next(l for l in yh['lessons'] if l['id'] == lid)
        focus = focus_prompt(L['title'])
        sid = mp[lid]['source_id']
        print(f'\n[{i}/{len(todo)}] {lid} ({elapsed/60:.1f}m, ETA {eta/60:.1f}m)', flush=True)
        print(f'  title: {L["title"][:60]}', flush=True)
        print(f'  focus:  {focus!r}', flush=True)
        print(f'  src:    {sid}', flush=True)

        progress['in_progress'][lid] = time.time()
        save_progress(progress)

        try:
            t0 = time.time()
            ok_flag, payload = generate_one(lid, sid, focus,
                                            wait_timeout=args.timeout,
                                            interval=args.interval,
                                            retries=args.retries,
                                            quota_wait_seconds=int(args.quota_wait_hours * 3600))
            if not ok_flag:
                raise RuntimeError(payload)
            # Extract URL from various formats
            url = (payload.get('url')
                   or (payload.get('urls') or [None])[0]
                   or (payload.get('metadata') or {}).get('url'))
            if not url:
                raise RuntimeError(f'no url: {payload}')
            urls = [url]
            png = TMP_PNG / f'{lid}.png'
            download_one(png)
            webp = WEBP_DIR / f'{lid}.webp'
            png_to_webp(png, webp)
            rel = f'/world-history/{lid}.webp'
            update_json(lid, rel)
            sz = webp.stat().st_size
            dt = time.time() - t0
            progress['done'][lid] = {'size': sz, 'dt': dt, 'url': urls[0]}
            progress['in_progress'].pop(lid, None)
            save_progress(progress)
            ok += 1
            print(f'  OK {sz//1024} KB in {dt:.1f}s', flush=True)
        except Exception as e:
            progress['failed'][lid] = repr(e)[:300]
            progress['in_progress'].pop(lid, None)
            save_progress(progress)
            fail += 1
            print(f'  FAIL: {e}', flush=True)

        if i < len(todo):
            time.sleep(args.sleep)

    print(f'\n=== summary ===', flush=True)
    print(f'  done: {ok}  fail: {fail}  elapsed: {(time.time()-start)/60:.1f}m', flush=True)


if __name__ == '__main__':
    main()