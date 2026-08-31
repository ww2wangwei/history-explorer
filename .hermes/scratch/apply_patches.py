"""
apply_patches.py — 把 tradition_patches/<cat>.json 的 patch 应用到 traditions.ts
纯文本替换，逐条 unique 替换（multi-line）。
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path('E:/我的项目/历史软件')
FILE = ROOT / 'src/data/traditions.ts'
PATCH_DIR = ROOT / '.hermes/scratch/tradition_patches'


def apply(cat):
    pfile = PATCH_DIR / f'{cat}.json'
    if not pfile.exists():
        print(f'no patch file for {cat}')
        return 1
    patches = json.load(open(pfile, encoding='utf-8'))
    if not patches:
        print(f'no patches in {pfile}')
        return 0

    text = FILE.read_text(encoding='utf-8')
    ok, miss = 0, 0
    for p in patches:
        old = p['old_body']
        new = p['new_body']
        if old not in text:
            miss += 1
            print(f'  MISS [{p["id"]}]: old_body not found')
            continue
        # 严格保证唯一（多个 old_body 出现时跳过 — 不太可能，因为 entry body 含 id 唯一）
        count = text.count(old)
        if count > 1:
            miss += 1
            print(f'  SKIP [{p["id"]}]: old_body appears {count} times')
            continue
        text = text.replace(old, new, 1)
        ok += 1

    FILE.write_text(text, encoding='utf-8')
    print(f'cat={cat} applied={ok} skipped={miss}')
    return 0 if miss == 0 else 2


if __name__ == '__main__':
    sys.exit(apply(sys.argv[1]))
