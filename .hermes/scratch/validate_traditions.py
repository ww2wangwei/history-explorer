"""
validate_traditions.py — 富化 traditions.ts 的 schema 校验工具

校验规则（每条 tradition 必须满足，最低阈值）：
  - facts        ≥ 4 个
  - sections     ≥ 4 个
  - timeline     ≥ 6 个
  - images       ≥ 2 个
  - related      ≥ 4 个
  - source       非空字符串
  - related[*].id 必须出现在 TRADITIONS 中（避免跳空）
  - sections[*].body 内联 Markdown 闭合检查：** 必须成对、`code` 必须成对

输出：
  - 每子分类统计（条数 / 通过率）
  - 失败条目 id + 失败原因
  - exit 0 全通过；exit 1 有失败
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

# 阈值定义（与"炎黄子孙"示范对齐）
MIN_FACTS = 4
MIN_SECTIONS = 4
MIN_TIMELINE = 6
MIN_IMAGES = 2
MIN_RELATED = 4


def extract_traditions(text: str) -> list[dict]:
    """
    极简解析 traditions.ts：用 { id: '...', category: '...', ... } 一行作为锚点
    然后用花括号配对抓出每个条目对象的文本。
    """
    items: list[dict] = []
    # 锚点：每条以 "{ id: '...', category: '...'" 开头
    pattern = re.compile(r"\{\s*id:\s*'([^']+)',\s*category:\s*'([^']+)'")
    for m in pattern.finditer(text):
        start = m.start()
        # 找到对应的右花括号（嵌套）
        depth = 0
        i = start
        while i < len(text):
            ch = text[i]
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    items.append({
                        'id': m.group(1),
                        'category': m.group(2),
                        'span': (start, i + 1),
                        'body': text[start:i + 1],
                    })
                    break
            i += 1
    return items


def field_present(body: str, field: str) -> bool:
    """判断条目里是否有该字段（即便为空数组也算"有"）。"""
    return re.search(rf"\b{re.escape(field)}\s*:", body) is not None


def parse_array_field(body: str, field: str) -> list[str]:
    """
    提取  field: [ ... ]  的内容作为 raw 字符串列表（每元素一个字符串）。
    简化：只关心是否存在以及大致的元素数量。
    """
    m = re.search(rf"\b{re.escape(field)}\s*:\s*\[", body)
    if not m:
        return []
    # 从 [ 后开始花括号匹配
    start_bracket = m.end() - 1  # the [
    depth = 0
    i = start_bracket
    while i < len(body):
        ch = body[i]
        if ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                arr_text = body[start_bracket + 1:i]
                # 顶层元素个数（粗略按 }, 或 },{  拆分）
                elements = re.findall(r"\{[^{}]*\}", arr_text)
                # 如果嵌套了 } ，上面的正则取不到，需要更稳
                if len(elements) == 0:
                    elements = re.findall(r"\{(?:[^{}]|\{[^{}]*\})*\}", arr_text)
                return elements
        i += 1
    return []


def parse_string_field(body: str, field: str) -> str | None:
    """提取 field: '...' 或 field: \"...\" 的字符串值。"""
    m = re.search(rf"\b{re.escape(field)}\s*:\s*['\"]([^'\"]*)['\"]", body)
    return m.group(1) if m else None


def extract_ids_from_array(elements: list[str]) -> list[str]:
    """从 related 数组的每个 { id: '...', title: ... } 中提取 id。"""
    ids = []
    for el in elements:
        m = re.search(r"id:\s*'([^']+)'", el)
        if m:
            ids.append(m.group(1))
    return ids


def check_inline_md(body: str) -> list[str]:
    """
    校验正文里的 ** 和 `code` 是否成对。
    简单的 *italic* 太脆弱（中文 * 可能混进来），不强制校验。
    """
    issues = []
    # ** 必须成对
    bold_count = body.count('**')
    if bold_count % 2 != 0:
        issues.append(f"** 不成对（出现 {bold_count} 次）")
    # `code` 必须成对（仅出现在 body / heading / items / cite / text / caption）
    code_count = body.count('`')
    if code_count % 2 != 0:
        issues.append(f"`code` 不成对（出现 {code_count} 次）")
    return issues


def validate(text: str) -> tuple[list[dict], list[dict], list[dict]]:
    items = extract_traditions(text)
    all_ids = {it['id'] for it in items}

    passed: list[dict] = []
    failed: list[dict] = []
    pending: list[dict] = []

    for it in items:
        body = it['body']
        errors: list[str] = []

        # 仅当条目声明了富字段才校验；老条目（只有 id/title/...）跳过
        has_rich = any(field_present(body, f) for f in
                       ['facts', 'sections', 'timeline', 'images', 'related', 'source'])
        if not has_rich:
            # 未富化 = pending（区别于"已富化且通过"的 done）
            pending.append({'id': it['id'], 'category': it['category'],
                            'status': 'pending (no rich fields)',
                            'facts': 0, 'sections': 0, 'timeline': 0,
                            'images': 0, 'related': 0})
            continue

        facts = parse_array_field(body, 'facts')
        sections = parse_array_field(body, 'sections')
        timeline = parse_array_field(body, 'timeline')
        images = parse_array_field(body, 'images')
        related_elements = parse_array_field(body, 'related')
        source = parse_string_field(body, 'source')

        related_ids = extract_ids_from_array(related_elements)

        # 数量阈值
        if len(facts) < MIN_FACTS:
            errors.append(f"facts={len(facts)} < {MIN_FACTS}")
        if len(sections) < MIN_SECTIONS:
            errors.append(f"sections={len(sections)} < {MIN_SECTIONS}")
        if len(timeline) < MIN_TIMELINE:
            errors.append(f"timeline={len(timeline)} < {MIN_TIMELINE}")
        if len(images) < MIN_IMAGES:
            errors.append(f"images={len(images)} < {MIN_IMAGES}")
        if len(related_ids) < MIN_RELATED:
            errors.append(f"related={len(related_ids)} < {MIN_RELATED}")

        # related.id 真实性
        for rid in related_ids:
            if rid not in all_ids:
                errors.append(f"related.id 不存在: {rid}")

        # source 非空
        if not source or not source.strip():
            errors.append("source 为空")

        # 内联 Markdown 闭合
        md_issues = check_inline_md(body)
        errors.extend(md_issues)

        record = {
            'id': it['id'],
            'category': it['category'],
            'facts': len(facts),
            'sections': len(sections),
            'timeline': len(timeline),
            'images': len(images),
            'related': len(related_ids),
            'source_chars': len(source) if source else 0,
        }

        if errors:
            record['errors'] = errors
            failed.append(record)
        else:
            passed.append(record)

    return passed, failed, pending


def main():
    if len(sys.argv) > 1:
        path = Path(sys.argv[1])
    else:
        path = Path('src/data/traditions.ts')
    text = path.read_text(encoding='utf-8')
    passed, failed, pending = validate(text)
    all_items = passed + failed + pending

    print(f"=== 校验报告：{path.name} ===")
    print(f"总条目：{len(all_items)}  富化：{len(passed)}  待富化：{len(pending)}  失败：{len(failed)}\n")

    # 按子分类统计
    by_cat: dict[str, dict] = {}
    for it in all_items:
        cat = it['category']
        if cat not in by_cat:
            by_cat[cat] = {'total': 0, 'enriched': 0, 'pending': 0, 'failed': 0}
        by_cat[cat]['total'] += 1
        if 'errors' in it:
            by_cat[cat]['failed'] += 1
        elif it.get('status', '').startswith('pending'):
            by_cat[cat]['pending'] += 1
        else:
            by_cat[cat]['enriched'] += 1

    print("按子分类：")
    print(f"  {'子分类':<20} {'总':>5} {'富化':>5} {'待富化':>6} {'失败':>5}  富化率")
    for cat, st in by_cat.items():
        rate = f"{100*st['enriched']/st['total']:.0f}%" if st['total'] else '-'
        print(f"  {cat:<20} {st['total']:>5} {st['enriched']:>5} {st['pending']:>6} {st['failed']:>5}  {rate}")

    if failed:
        print("\n失败条目详情：")
        for it in failed:
            print(f"  ✗ {it['id']} ({it['category']})")
            print(f"    facts={it.get('facts', 0)} sections={it.get('sections', 0)} "
                  f"timeline={it.get('timeline', 0)} images={it.get('images', 0)} "
                  f"related={it.get('related', 0)}")
            for err in it['errors']:
                print(f"      - {err}")
        sys.exit(1)
    else:
        print("\n✓ 全部通过")
        sys.exit(0)


if __name__ == '__main__':
    main()