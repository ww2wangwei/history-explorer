"""
generic_enrich.py — 富化工具通用模板（子 agent 复用）

子 agent 可以直接 import 这个文件，跑法：
  1. 把 ENRICHMENTS dict 写入 Python 文件（或 JSON 文件）
  2. python .hermes/scratch/generic_enrich.py --category <cat> --data <json> --apply

功能：
  - 自动 find_item_span（花括号配对）
  - 自动 find_full_content_end
  - 自动校验 schema
  - 自动 render_enrich
  - 自动注入 traditions.ts
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path

TRADITIONS_PATH = Path('src/data/traditions.ts')


def check_schema(enrich: dict, all_ids: set) -> list[str]:
    """校验一条富化数据的 schema。"""
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
    for s in enrich.get('sections', []):
        if s.get('type') == 'callout' and 'variant' not in s:
            errs.append(f"callout 缺 variant: {s.get('heading', '?')}")
    return errs


def render_enrich(enrich: dict, indent: str = '    ') -> str:
    """把 Python 字典渲染为 TS 字面量片段。"""
    lines: list[str] = []
    lines.append(f"{indent}facts: [")
    for f in enrich['facts']:
        lines.append(f"{indent}  {{ label: '{f['label']}', value: '{f['value']}' }},")
    lines.append(f"{indent}],")
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
    lines.append(f"{indent}],")
    lines.append(f"{indent}timeline: [")
    for e in enrich['timeline']:
        era_part = f", era: '{e['era']}'" if 'era' in e else ''
        lines.append(f"{indent}  {{ year: '{e['year']}'{era_part}, event: '{e['event']}' }},")
    lines.append(f"{indent}],")
    lines.append(f"{indent}images: [")
    for img in enrich['images']:
        credit_part = f", credit: '{img['credit']}'" if 'credit' in img else ''
        lines.append(f"{indent}  {{ imageKeyword: '{img['imageKeyword']}', caption: '{img['caption']}'{credit_part} }},")
    lines.append(f"{indent}],")
    lines.append(f"{indent}related: [")
    for r in enrich['related']:
        lines.append(f"{indent}  {{ id: '{r['id']}', title: '{r['title']}', reason: '{r['reason']}' }},")
    lines.append(f"{indent}],")
    lines.append(f"{indent}source: '{enrich['source']}',")
    return '\n'.join(lines)


def find_item_span(text: str, tid: str, category: str) -> tuple[int, int] | None:
    """找到 { id: 'tid', category: 'category', ... } 的精确 span。"""
    anchor = f"{{ id: '{tid}', category: '{category}'"
    idx = text.find(anchor)
    if idx < 0: return None
    start = idx
    depth = 0; i = start
    while i < len(text):
        ch = text[i]
        if ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0: return (start, i + 1)
        i += 1
    return None


def find_full_content_end(text: str, item_start: int, item_end: int) -> int | None:
    """在条目范围内找到 fullContent: '...' 字符串的结束引号位置。"""
    fc_idx = text.find("fullContent:", item_start, item_end)
    if fc_idx < 0: return None
    q1 = text.find("'", fc_idx)
    if q1 < 0 or q1 >= item_end: return None
    i = q1 + 1
    while i < item_end:
        ch = text[i]
        if ch == '\\' and i + 1 < item_end: i += 2; continue
        if ch == "'": return i
        i += 1
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--category', required=True, help='traditions.ts 子分类')
    parser.add_argument('--data', help='JSON 文件路径，包含 ENRICHMENTS dict')
    parser.add_argument('--id', help='只处理指定 id（逗号分隔）')
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()

    text = TRADITIONS_PATH.read_text(encoding='utf-8')
    all_ids = set(re.findall(r"id:\s*'([^']+)'", text))

    # 加载数据
    if args.data:
        enrichments = json.loads(Path(args.data).read_text(encoding='utf-8'))
    else:
        print('错误：必须提供 --data 参数'); sys.exit(1)

    if args.id:
        target_ids = [i.strip() for i in args.id.split(',')]
    else:
        target_ids = list(enrichments.keys())

    print(f"待富化条目：{len(target_ids)} 条")

    # 校验
    all_ok = True
    for tid in target_ids:
        enrich = enrichments.get(tid)
        if not enrich:
            print(f"  ✗ {tid}: 数据未定义"); all_ok = False; continue
        errs = check_schema(enrich, all_ids)
        if errs:
            print(f"  ✗ {tid}: {', '.join(errs)}"); all_ok = False
        else:
            facts = enrich
            print(f"  ✓ {tid}: facts={len(facts.get('facts', []))} sections={len(facts.get('sections', []))} timeline={len(facts.get('timeline', []))} images={len(facts.get('images', []))} related={len(facts.get('related', []))}")

    if not all_ok:
        print('\n✗ 校验失败'); sys.exit(1)

    if not args.apply:
        print('\n=== DRY-RUN，加 --apply 写入 ==='); return

    print(f'\n=== 写入 traditions.ts ===')
    new_text = text
    for tid in target_ids:
        enrich = enrichments[tid]
        span = find_item_span(new_text, tid, args.category)
        if not span: print(f'  ✗ {tid}: 未找到'); continue
        item_start, item_end = span
        fc_end = find_full_content_end(new_text, item_start, item_end)
        if fc_end is None: print(f'  ✗ {tid}: fullContent 边界未找到'); continue
        prefix = new_text[item_start:fc_end + 1]
        enrich_block = render_enrich(enrich)
        replacement = prefix + ',\n' + enrich_block + '\n  }'
        new_text = new_text[:item_start] + replacement + new_text[item_end:]
        print(f"  ✓ {tid}: 已注入（{len(enrich_block)} 字符）")

    TRADITIONS_PATH.write_text(new_text, encoding='utf-8')
    print(f'\n✓ 已写入 {TRADITIONS_PATH}')

    print('\n=== 运行 schema 校验 ===')
    import subprocess
    r = subprocess.run(['python', '.hermes/scratch/validate_traditions.py'], capture_output=True, text=True)
    print(r.stdout)


if __name__ == '__main__':
    main()