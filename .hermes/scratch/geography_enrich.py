"""
geography_enrich.py — 把 geography-regional 子分类的 30 条条目按「炎黄子孙」模板富化。

用法：
  python .hermes/scratch/geography_enrich.py           # dry-run，只校验不写入
  python .hermes/scratch/geography_enrich.py --apply   # 写入 traditions.ts
  python .hermes/scratch/geography_enrich.py --id <id1>,<id2>  # 只处理指定 id
  python .hermes/scratch/geography_enrich.py --lint    # 仅校验 schema

数据来源：
  - geography_data_1.json (tr-region-intro, jiuzhou, xingsheng)
  - geography_data_2.json (tr-region-fangqu, dusheng, nanbei)
  - geography_data_3.json (tr-region-overview, yanzhao, shanjin, qilu)
  - geography_data_4.json (tr-region-guandong, neimenggu, zhongzhou, hui)
  - geography_data_5.json (tr-region-jiangxi, jingchu, huxiang, wuyue)
  - geography_data_6.json (tr-region-min, lingnan, gui, dianyun)
  - geography_data_7.json (tr-region-qiangui, bashu, sanqin, ganlong)
  - geography_data_8.json (tr-region-ningxia, xinjiang, zang, hehuang)
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path

TRADITIONS_PATH = Path('src/data/traditions.ts')
DATA_DIR = Path(__file__).parent  # .hermes/scratch/


def load_enrichments() -> dict[str, dict]:
    """从 geography_data_*.json 合并加载所有富化数据。"""
    enrichments: dict[str, dict] = {}
    for jf in sorted(DATA_DIR.glob('geography_data_*.json')):
        with jf.open(encoding='utf-8') as f:
            data = json.load(f)
            enrichments.update(data)
    return enrichments


ENRICHMENTS = load_enrichments()


# === helper functions (复用 history_enrich.py 的逻辑) ===

def check_schema(enrich: dict, all_ids: set[str]) -> list[str]:
    """校验一条富化数据的 schema，返回错误列表（空表示通过）。"""
    errs = []
    if len(enrich.get('facts', [])) < 6:
        errs.append(f"facts={len(enrich.get('facts', []))} < 6")
    if len(enrich.get('sections', [])) < 6:
        errs.append(f"sections={len(enrich.get('sections', []))} < 6")
    if len(enrich.get('timeline', [])) < 8:
        errs.append(f"timeline={len(enrich.get('timeline', []))} < 8")
    if len(enrich.get('images', [])) < 3:
        errs.append(f"images={len(enrich.get('images', []))} < 3")
    related = enrich.get('related', [])
    if len(related) < 5:
        errs.append(f"related={len(related)} < 5")
    for r in related:
        if r.get('id') not in all_ids:
            errs.append(f"related.id 不存在: {r.get('id')}")
    if not enrich.get('source', '').strip():
        errs.append("source 为空")
    valid_types = {'paragraph', 'callout', 'list', 'quote', 'table'}
    for s in enrich.get('sections', []):
        if s.get('type') not in valid_types:
            errs.append(f"section.type 未知: {s.get('type')}")
    for s in enrich.get('sections', []):
        if s.get('type') == 'callout' and 'variant' not in s:
            errs.append(f"callout 缺 variant: {s.get('heading', '?')}")
    return errs


def render_enrich(enrich: dict, indent: str = '    ') -> str:
    """把 Python 字典渲染为 TS 字面量片段（包含逗号结尾）。"""
    lines: list[str] = []
    # facts
    lines.append(f"{indent}facts: [")
    for f in enrich['facts']:
        lines.append(f"{indent}  {{ label: '{f['label']}', value: '{f['value']}' }},")
    lines.append(f"{indent}],")
    # sections
    lines.append(f"{indent}sections: [")
    for s in enrich['sections']:
        if s['type'] == 'paragraph':
            lines.append(f"{indent}  {{ type: 'paragraph', heading: '{s['heading']}', body: '{s['body']}' }},")
        elif s['type'] == 'callout':
            lines.append(f"{indent}  {{ type: 'callout', heading: '{s['heading']}', body: '{s['body']}', variant: '{s['variant']}' }},")
        elif s['type'] == 'list':
            items_str = '\n'.join(f"{indent}      '{it}'," for it in s['items'])
            lines.append(f"{indent}  {{ type: 'list', heading: '{s['heading']}', items: [")
            lines.append(items_str)
            lines.append(f"{indent}  ] }},")
        elif s['type'] == 'quote':
            cite_part = f", cite: '{s['cite']}'" if 'cite' in s else ''
            heading_part = f"heading: '{s['heading']}', " if 'heading' in s else ''
            lines.append(f"{indent}  {{ type: 'quote', {heading_part}text: '{s['text']}'{cite_part} }},")
        elif s['type'] == 'table':
            lines.append(f"{indent}  {{ type: 'table', heading: '{s['heading']}', headers: {s['headers']}, rows: {s['rows']} }},")
    lines.append(f"{indent}],")
    # timeline
    lines.append(f"{indent}timeline: [")
    for e in enrich['timeline']:
        era_part = f", era: '{e['era']}'" if 'era' in e else ''
        lines.append(f"{indent}  {{ year: '{e['year']}'{era_part}, event: '{e['event']}' }},")
    lines.append(f"{indent}],")
    # images
    lines.append(f"{indent}images: [")
    for img in enrich['images']:
        credit_part = f", credit: '{img['credit']}'" if 'credit' in img else ''
        lines.append(f"{indent}  {{ imageKeyword: '{img['imageKeyword']}', caption: '{img['caption']}'{credit_part} }},")
    lines.append(f"{indent}],")
    # related
    lines.append(f"{indent}related: [")
    for r in enrich['related']:
        lines.append(f"{indent}  {{ id: '{r['id']}', title: '{r['title']}', reason: '{r['reason']}' }},")
    lines.append(f"{indent}],")
    # source
    lines.append(f"{indent}source: '{enrich['source']}',")
    return '\n'.join(lines)


def find_item_span(text: str, tid: str, category: str) -> tuple[int, int] | None:
    """找到 { id: 'tid', category: 'category', ... } 的精确 span（花括号配对）。"""
    anchor = f"{{ id: '{tid}', category: '{category}'"
    idx = text.find(anchor)
    if idx < 0:
        return None
    start = idx
    depth = 0
    i = start
    while i < len(text):
        ch = text[i]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return (start, i + 1)
        i += 1
    return None


def find_full_content_end(text: str, item_start: int, item_end: int) -> int | None:
    """在条目范围内找到 fullContent: '...' 字符串的结束引号位置。"""
    fc_idx = text.find("fullContent:", item_start, item_end)
    if fc_idx < 0:
        return None
    q1 = text.find("'", fc_idx)
    if q1 < 0 or q1 >= item_end:
        return None
    i = q1 + 1
    while i < item_end:
        ch = text[i]
        if ch == '\\' and i + 1 < item_end:
            i += 2
            continue
        if ch == "'":
            return i
        i += 1
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true', help='写入 traditions.ts')
    parser.add_argument('--id', help='只处理指定 id（逗号分隔）')
    parser.add_argument('--lint', action='store_true', help='仅校验 schema')
    args = parser.parse_args()

    print(f"已加载 {len(ENRICHMENTS)} 条富化数据")

    text = TRADITIONS_PATH.read_text(encoding='utf-8')
    all_ids = set(re.findall(r"id:\s*'([^']+)'", text))

    # 选择要处理的 id
    if args.id:
        target_ids = [i.strip() for i in args.id.split(',')]
    else:
        target_ids = sorted(ENRICHMENTS.keys())

    print(f"待富化条目：{len(target_ids)} 条\n")

    # === 校验阶段 ===
    all_ok = True
    for tid in target_ids:
        if tid not in ENRICHMENTS:
            print(f"  ✗ {tid}: 数据未定义")
            all_ok = False
            continue
        errs = check_schema(ENRICHMENTS[tid], all_ids)
        if errs:
            all_ok = False
            print(f"   {tid}: {', '.join(errs)}")
        else:
            facts = ENRICHMENTS[tid]
            print(f"  ✓ {tid}: facts={len(facts.get('facts', []))} sections={len(facts.get('sections', []))} "
                  f"timeline={len(facts.get('timeline', []))} images={len(facts.get('images', []))} "
                  f"related={len(facts.get('related', []))}")

    if not all_ok:
        print("\n✗ 校验失败")
        sys.exit(1)

    if args.lint:
        print("\n✓ 校验通过")
        return

    if not args.apply:
        print("\n=== DRY-RUN（未写入）— 加 --apply 写入 traditions.ts ===")
        return

    # === 写入阶段 ===
    print(f"\n=== 写入 traditions.ts ===")
    new_text = text

    for tid in target_ids:
        enrich = ENRICHMENTS[tid]
        span = find_item_span(new_text, tid, 'geography-regional')
        if not span:
            print(f"  ✗ {tid}: 找不到条目")
            all_ok = False
            continue
        item_start, item_end = span
        fc_end = find_full_content_end(new_text, item_start, item_end)
        if fc_end is None:
            print(f"  ✗ {tid}: 找不到 fullContent 字符串结束")
            all_ok = False
            continue
        prefix = new_text[item_start:fc_end + 1]
        enrich_block = render_enrich(enrich)
        replacement = prefix + ',\n' + enrich_block + '\n  }'
        new_text = new_text[:item_start] + replacement + new_text[item_end:]
        print(f"  ✓ {tid}: 已注入富化（{len(enrich_block)} 字符）")

    TRADITIONS_PATH.write_text(new_text, encoding='utf-8')
    print(f"\n✓ 已写入 {TRADITIONS_PATH}")

    # 跑校验脚本
    print("\n=== 运行 schema 校验 ===")
    import subprocess
    r = subprocess.run(['python', '.hermes/scratch/validate_traditions.py'],
                       capture_output=True, text=True)
    print(r.stdout)
    if r.stderr:
        print('STDERR:', r.stderr)
    if r.returncode != 0:
        sys.exit(r.returncode)


if __name__ == '__main__':
    main()
