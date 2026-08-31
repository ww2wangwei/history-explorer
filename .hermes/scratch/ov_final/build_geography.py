"""Build enrichment for geographic-features.ts. 93 entries.

Strategy: define per-entry enrichment as Python dicts (matching the schema
used by EraQuickLearnModal), then render to TS literals and inject.

Schema (matches RichSection/KeyFact/TimelineEvent/TraditionImage/RelatedItem):
  facts:     [{label, value}]
  sections:  [{type: 'paragraph'|'callout'|'list'|'quote', ...}]
  timeline:  [{year, event, era?}]
  images:    [{imageKeyword, caption, credit?}]
  related:   [{id, title, reason}]
  source:    str
"""
import re
import json
import sys
from pathlib import Path

SRC = Path('src/data/geographic-features.ts')


def render_enrich(enrich, indent='    '):
    """Render Python dict as TS object literal fragment."""
    lines = []
    pad = indent
    lines.append(f"{pad}facts: [")
    for f in enrich['facts']:
        lbl = f['label'].replace("'", "\\'")
        val = f['value'].replace("'", "\\'")
        lines.append(f"{pad}  {{ label: '{lbl}', value: '{val}' }},")
    lines.append(f"{pad}],")
    lines.append(f"{pad}sections: [")
    for s in enrich['sections']:
        if s['type'] == 'paragraph':
            h = s.get('heading', '').replace("'", "\\'")
            b = s['body'].replace("'", "\\'")
            lines.append(f"{pad}  {{ type: 'paragraph', heading: '{h}', body: '{b}' }},")
        elif s['type'] == 'callout':
            h = s.get('heading', '').replace("'", "\\'")
            b = s['body'].replace("'", "\\'")
            v = s.get('variant', 'info')
            lines.append(f"{pad}  {{ type: 'callout', heading: '{h}', body: '{b}', variant: '{v}' }},")
        elif s['type'] == 'list':
            h = s.get('heading', '').replace("'", "\\'")
            lines.append(f"{pad}  {{ type: 'list', heading: '{h}', items: [")
            for it in s['items']:
                ix = it.replace("'", "\\'")
                lines.append(f"{pad}      '{ix}',")
            lines.append(f"{pad}  ] }},")
        elif s['type'] == 'quote':
            t = s['text'].replace("'", "\\'")
            cite = s.get('cite', '').replace("'", "\\'")
            lines.append(f"{pad}  {{ type: 'quote', text: '{t}', cite: '{cite}' }},")
    lines.append(f"{pad}],")
    lines.append(f"{pad}timeline: [")
    for e in enrich['timeline']:
        yr = e['year'].replace("'", "\\'")
        ev = e['event'].replace("'", "\\'")
        era_part = f", era: '{e['era']}'" if 'era' in e and e['era'] else ''
        lines.append(f"{pad}  {{ year: '{yr}'{era_part}, event: '{ev}' }},")
    lines.append(f"{pad}],")
    lines.append(f"{pad}images: [")
    for img in enrich['images']:
        kw = img['imageKeyword'].replace("'", "\\'")
        cap = img['caption'].replace("'", "\\'")
        credit = img.get('credit', 'Wikimedia Commons').replace("'", "\\'")
        lines.append(f"{pad}  {{ imageKeyword: '{kw}', caption: '{cap}', credit: '{credit}' }},")
    lines.append(f"{pad}],")
    lines.append(f"{pad}related: [")
    for r in enrich['related']:
        rid = r['id'].replace("'", "\\'")
        title = r['title'].replace("'", "\\'")
        reason = r['reason'].replace("'", "\\'")
        lines.append(f"{pad}  {{ id: '{rid}', title: '{title}', reason: '{reason}' }},")
    lines.append(f"{pad}],")
    src = enrich['source'].replace("'", "\\'")
    lines.append(f"{pad}source: '{src}',")
    return '\n'.join(lines)


def find_item_span(text, eid):
    """Find { id: 'eid', type: '...', ... } span via balanced braces."""
    anchor = f"id: '{eid}'"
    idx = text.find(anchor)
    if idx < 0:
        return None
    # Scan backwards from anchor to find the opening brace
    i = idx - 1
    while i >= 0 and text[i] != '{':
        i -= 1
    if i < 0:
        return None
    start = i
    depth = 0
    j = start
    while j < len(text):
        ch = text[j]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return (start, j + 1)
        j += 1
    return None


def inject_one(text, eid, enrich):
    """Insert enrichment fields before the closing } of the entry block."""
    span = find_item_span(text, eid)
    if not span:
        return text, False
    item_start, item_end = span
    # Insert before the final '}'
    # The 'imageCredit' line should be the last line before 'geometry:'
    # Find 'geometry:' position
    geo_pos = text.find('geometry:', item_start, item_end)
    if geo_pos < 0:
        return text, False
    # Find newline just before geometry
    insert_pos = text.rfind('\n', item_start, geo_pos) + 1
    block = render_enrich(enrich)
    new_text = text[:insert_pos] + block + '\n' + text[insert_pos:]
    return new_text, True


def main():
    if len(sys.argv) < 2:
        print('Usage: python build_geography.py <enrichments.json>')
        sys.exit(1)
    enrich_path = Path(sys.argv[1])
    enrichments = json.loads(enrich_path.read_text(encoding='utf-8'))
    text = SRC.read_text(encoding='utf-8')

    applied = 0
    for eid, enrich in enrichments.items():
        text, ok = inject_one(text, eid, enrich)
        if ok:
            applied += 1
        else:
            print(f'  ✗ {eid}: not found')
    SRC.write_text(text, encoding='utf-8')
    print(f'✓ Applied {applied}/{len(enrichments)} entries to {SRC}')


if __name__ == '__main__':
    main()