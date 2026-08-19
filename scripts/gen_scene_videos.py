#!/usr/bin/env python3
"""
scripts/gen_scene_videos.py

批量生成 src/data/scenarios.json 里缺失的 174 个场景视频：
- 用 Agnes video-v2.0 模型
- 默认参数 1280x704 121 帧 24fps (≈5s, 16:9)
- 中文 prompt 自动翻译为英文 (复用 agnes_api.py 的 prepare_generation_prompt)
- 任务异步：POST /v1/videos → 轮询 GET /agnesapi?video_id=... → 下载 .mp4 → 校验大小 → public/scenes/

特性：
  --resume         默认开启：跳过已存在文件 + 进度文件里已成功的 scene
  --limit N        只生成前 N 个 (试跑 / 限速)
  --scenario ID    只生成某个剧本 (如 xuanwumen)
  --dry-run        列出待生成的 scene + prompt，不实际调 API
  --yes            跳过确认提示 (脚本里有 167 个视频，单价较贵，必须确认)

进度持久化到：
  C:/Users/ww220/AppData/Local/Temp/opencode/scene_video_progress.json

依赖：
  环境变量 AGNES_API_KEY / AGNES_API_TOKEN / APIHUB_AGNES_API_KEY
  C:/Users/ww220/.agents/skills/agnes-ai-generation/scripts/agnes_api.py
"""
from __future__ import annotations

import argparse
import io
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

# --- paths ----------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[1]
SCENARIOS_JSON = PROJECT_ROOT / "src" / "data" / "scenarios.json"
SCENES_DIR = PROJECT_ROOT / "public" / "scenes"
PROGRESS = Path(r"C:\Users\ww220\AppData\Local\Temp\opencode\scene_video_progress.json")

AGNES_SCRIPT = Path(r"C:\Users\ww220\.agents\skills\agnes-ai-generation\scripts\agnes_api.py")

# --- style template -------------------------------------------------------
# 风格锁定：穿越历史统一用 ink-wash cinematic，避免每集风格漂移
STYLE_SUFFIX = (
    "Cinematic ink-wash painting style, muted earth tones with subtle gold accents, "
    "atmospheric haze, soft rim light. Camera: slow dolly or pan, 16:9, 1280x704. "
    "Motion: subtle character movement, ambient particles (smoke / dust / falling petals), "
    "wind in fabric, lantern flicker. No modern elements, no text overlays."
)


def build_video_prompt(scene_title: str, scene_text: str, scenario_title: str) -> str:
    """从场景标题 + 前两段正文 + 风格后缀，构造一个稳定的英文 prompt。"""
    paras = [p.strip() for p in re.split(r"\n+", scene_text) if p.strip()]
    body = " ".join(paras[:2])
    if len(body) > 400:
        body = body[:400].rstrip()
    return f"Historical drama scene: {scenario_title} - {scene_title}. {body} {STYLE_SUFFIX}"


def collect_missing() -> list[tuple[str, str, str, str]]:
    """返回 [(scenario_id, scene_id, video_path, prompt), ...]，仅含缺失文件。"""
    data = json.loads(SCENARIOS_JSON.read_text(encoding="utf-8"))
    out: list[tuple[str, str, str, str]] = []
    for sc in data:
        sid = sc["id"]
        for s in sc.get("scenes", []):
            v = s.get("video")
            if not v:
                continue
            # video 字段是 "/scenes/<file>.mp4" 这种形式
            rel = v.lstrip("/")
            abs_path = PROJECT_ROOT / "public" / rel
            if abs_path.exists() and abs_path.stat().st_size > 50_000:
                continue
            prompt = build_video_prompt(s.get("title", s["id"]), s.get("text", ""), sc.get("title", sid))
            out.append((sid, s["id"], str(abs_path), prompt))
    return out


def load_progress() -> dict[str, Any]:
    if PROGRESS.exists():
        try:
            return json.loads(PROGRESS.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"done": {}, "failed": {}, "in_progress": {}}


def save_progress(p: dict[str, Any]) -> None:
    PROGRESS.parent.mkdir(parents=True, exist_ok=True)
    PROGRESS.write_text(json.dumps(p, ensure_ascii=False, indent=2), encoding="utf-8")


def call_agnes_video(prompt: str, *, timeout: int, interval: int) -> dict[str, Any]:
    """调 agnes_api.py video --poll --raw，返回 raw JSON（含 metadata.url）。
    agnes_api.py 内置的 extract_video_urls() 不认 metadata.url，所以我们用 --raw 自己解析。
    """
    cmd = [
        sys.executable,
        str(AGNES_SCRIPT),
        "video",
        "--prompt", prompt,
        "--width", "1280",
        "--height", "704",
        "--num-frames", "121",
        "--frame-rate", "24",
        "--poll",
        "--raw",
        "--timeout", str(timeout),
        "--interval", str(interval),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout + 60)
    # 找 stdout 里第一个 { ... } (脚本只在 --raw 下 print_json 单 object)
    text = proc.stdout.strip()
    start = text.find("{")
    if start < 0 or proc.returncode != 0:
        raise RuntimeError(
            f"agnes_api failed (rc={proc.returncode}):\n"
            f"  stderr: {proc.stderr[-300:]}\n"
            f"  stdout tail: {text[-300:]}"
        )
    return json.loads(text[start:])


def extract_url_from_raw(raw: dict[str, Any]) -> str | None:
    """递归找第一个 https URL（覆盖 metadata.url / video_url / url）。"""
    if isinstance(raw, dict):
        # metadata.url 优先
        meta = raw.get("metadata")
        if isinstance(meta, dict):
            u = meta.get("url")
            if isinstance(u, str) and u.startswith(("http://", "https://")):
                return u
        for k in ("video_url", "url", "remixed_from_video_id"):
            v = raw.get(k)
            if isinstance(v, str) and v.startswith(("http://", "https://")):
                return v
        for v in raw.values():
            found = extract_url_from_raw(v)
            if found:
                return found
    elif isinstance(raw, list):
        for v in raw:
            found = extract_url_from_raw(v)
            if found:
                return found
    return None


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(url, timeout=180) as resp:
        data = resp.read()
    if len(data) < 50_000:
        raise RuntimeError(f"download too small: {len(data)} bytes (likely placeholder)")
    tmp = dest.with_suffix(dest.suffix + ".part")
    tmp.write_bytes(data)
    tmp.replace(dest)


def main() -> None:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenario", help="Only process this scenario id")
    ap.add_argument("--limit", type=int, default=0, help="Generate at most N videos (0 = all)")
    ap.add_argument("--dry-run", action="store_true", help="List targets only, do not call API")
    ap.add_argument("--no-resume", action="store_true", help="Ignore progress file")
    ap.add_argument("--yes", action="store_true", help="Skip cost confirmation prompt")
    ap.add_argument("--timeout", type=int, default=900, help="Per-video poll timeout (s)")
    ap.add_argument("--interval", type=int, default=10, help="Per-video poll interval (s)")
    ap.add_argument("--sleep", type=float, default=2.0, help="Sleep between requests (s)")
    args = ap.parse_args()

    if not AGNES_SCRIPT.exists():
        raise SystemExit(f"agnes_api.py not found: {AGNES_SCRIPT}")
    if not args.dry_run and not os.environ.get("AGNES_API_KEY") and not os.environ.get("AGNES_API_TOKEN") and not os.environ.get("APIHUB_AGNES_API_KEY"):
        raise SystemExit("Missing API key. Set AGNES_API_KEY in env.")

    missing = collect_missing()
    if args.scenario:
        missing = [m for m in missing if m[0] == args.scenario]
    if not missing:
        print("Nothing to generate. All videos present.")
        return

    progress = {} if args.no_resume else load_progress()
    todo: list[tuple[str, str, str, str]] = []
    for sid, scene_id, path, prompt in missing:
        if scene_id in progress.get("done", {}):
            continue
        todo.append((sid, scene_id, path, prompt))
    if args.limit and args.limit > 0:
        todo = todo[: args.limit]

    print(f"Plan: {len(todo)} videos to generate (skipped {len(missing) - len(todo)} already done)")
    est_minutes = len(todo) * 1.5  # rough estimate: 90s/video
    est_cost_usd = len(todo) * 0.6  # rough
    print(f"  estimated time: {est_minutes:.0f} min")
    print(f"  estimated cost: ~${est_cost_usd:.0f} USD (rough)")

    if args.dry_run:
        for sid, scene_id, path, prompt in todo[:20]:
            print(f"  [{sid}/{scene_id}] -> {Path(path).name}")
            print(f"    prompt: {prompt[:140]}...")
        if len(todo) > 20:
            print(f"  ... and {len(todo) - 20} more")
        return

    if not args.yes and len(todo) > 5:
        ans = input(f"\nGenerate {len(todo)} videos? (yes/no): ").strip().lower()
        if ans not in ("y", "yes"):
            print("Aborted.")
            return

    SCENES_DIR.mkdir(parents=True, exist_ok=True)
    progress.setdefault("done", {})
    progress.setdefault("failed", {})
    progress.setdefault("in_progress", {})

    start = time.time()
    for i, (sid, scene_id, path, prompt) in enumerate(todo, 1):
        dest = Path(path)
        elapsed = time.time() - start
        avg = elapsed / max(i - 1, 1) if i > 1 else 0
        eta = avg * (len(todo) - i + 1)
        print(f"\n[{i}/{len(todo)}] {sid}/{scene_id} -> {dest.name}")
        print(f"  elapsed={elapsed/60:.1f}m  eta={eta/60:.1f}m")
        print(f"  prompt: {prompt[:120]}...")

        progress["in_progress"][scene_id] = time.time()
        save_progress(progress)
        # 503 / queue_full 重试；no_url 也重试一次（API 偶尔返回 metadata.url 缺失）
        max_attempts = 3
        last_err = None
        for attempt in range(1, max_attempts + 1):
            try:
                t0 = time.time()
                raw = call_agnes_video(prompt, timeout=args.timeout, interval=args.interval)
                url = extract_url_from_raw(raw)
                if not url:
                    raise RuntimeError(f"no url in result: {json.dumps(raw)[:300]}")
                download(url, dest)
                sz = dest.stat().st_size
                dt = time.time() - t0
                progress["done"][scene_id] = {"path": str(dest), "size": sz, "dt": dt, "url": url}
                progress["in_progress"].pop(scene_id, None)
                save_progress(progress)
                print(f"  OK {sz//1024} KB in {dt:.1f}s (attempt {attempt})")
                last_err = None
                break
            except Exception as e:
                last_err = e
                wait = 5 * attempt
                print(f"  attempt {attempt}/{max_attempts} failed: {str(e)[:160]} (sleep {wait}s)")
                time.sleep(wait)
        if last_err is not None:
            progress["failed"][scene_id] = repr(last_err)[:300]
            progress["in_progress"].pop(scene_id, None)
            save_progress(progress)
            print(f"  FAIL after {max_attempts} attempts: {last_err}")

        if i < len(todo):
            time.sleep(args.sleep)

    ok = len(progress["done"])
    fail = len(progress["failed"])
    print(f"\n=== summary ===")
    print(f"  done : {ok}")
    print(f"  fail : {fail}")
    print(f"  elapsed: {(time.time()-start)/60:.1f}m")


if __name__ == "__main__":
    main()