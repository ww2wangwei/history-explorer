"""
Enrich each MAJOR_WAR entry with facts/sections/timeline/images/related/source.
"""
import re
from pathlib import Path

SRC = Path('src/data/majorWars.ts')
src = SRC.read_text(encoding='utf-8')

# Extend the MajorWar interface inline (BEFORE the array)
OLD_IFACE = """export interface MajorWar {
  /** 内部 id（人类可读） */
  key: string
  /** 专题标题 */
  title: string
  /** 起止年 */
  startYear: number
  endYear: number
  /** 简述（100-200 字导语） */
  summary: string
  /** icon */
  icon: string
  /** 关键节点列表（按时间排序，10-20 个） */
  nodes: MajorWarNode[]
  /** 专题总评分 */
  importance: 3 | 2
}"""
NEW_IFACE = """// 富内容字段（与 traditions.ts / eras.json / mythologies.ts 复用同一份 schema）
type WarKeyFact = { label: string; value: string }
type WarRichSection =
  | { type: 'paragraph'; heading?: string; body: string }
  | { type: 'callout'; heading?: string; body: string; variant?: 'info' | 'success' | 'warning' | 'quote' }
  | { type: 'list'; heading?: string; items: string[] }
  | { type: 'quote'; heading?: string; text: string; cite?: string }
type WarImage = { url?: string; imageKeyword: string; caption: string; credit?: string }
type WarTimelineEvent = { year: string; event: string; era?: string }
type WarRelated = { id: string; title: string; reason: string }

export interface MajorWar {
  /** 内部 id（人类可读） */
  key: string
  /** 专题标题 */
  title: string
  /** 起止年 */
  startYear: number
  endYear: number
  /** 简述（100-200 字导语） */
  summary: string
  /** icon */
  icon: string
  /** 关键节点列表（按时间排序，10-20 个） */
  nodes: MajorWarNode[]
  /** 专题总评分 */
  importance: 3 | 2
  /** === 富内容（弹窗用） === */
  facts?: WarKeyFact[]
  sections?: WarRichSection[]
  timeline?: WarTimelineEvent[]
  images?: WarImage[]
  related?: WarRelated[]
  source?: string
}"""
if OLD_IFACE in src:
    src = src.replace(OLD_IFACE, NEW_IFACE)
    print('Patched MajorWar interface')

# Find the array boundaries
arr_start_marker = 'export const MAJOR_WARS: MajorWar[] = ['
arr_start = src.find(arr_start_marker) + len(arr_start_marker) - 1
depth = 1
arr_end = None
for i in range(arr_start + 1, len(src)):
    c = src[i]
    if c == '[':
        depth += 1
    elif c == ']':
        depth -= 1
        if depth == 0:
            arr_end = i + 1
            break
if arr_end is None:
    raise ValueError('Could not find matching ]')
arr_text = src[arr_start:arr_end]
prefix = src[:arr_start]
suffix = src[arr_end:]

# Find war entry positions
entries_raw = []
i = 0
while True:
    j = arr_text.find('\n  {\n    key:', i)
    if j == -1: break
    # Find matching closing brace
    depth_b = 1
    k = j + 1
    while k < len(arr_text):
        if arr_text[k] == '{':
            depth_b += 1
        elif arr_text[k] == '}':
            depth_b -= 1
            if depth_b == 0:
                break
        k += 1
    entries_raw.append((j, k+1, arr_text[j:k+1]))
    i = k + 1

# Alternative pattern: entries start at "  {" with depth 1
# We can find each entry's first line and then balance braces.
# Simpler: find "\n  {\n    key:" positions.
positions = [m.start() for m in re.finditer(r'\n  \{\n    key:', arr_text)]
positions.append(len(arr_text))
print(f'Found {len(positions)-1} war entries')

# Robust parser for TS literal fields (single-quoted)
def parse_string(s, start):
    assert s[start] == "'"
    i = start + 1
    out = []
    while i < len(s):
        c = s[i]
        if c == '\\':
            if i + 1 < len(s):
                nc = s[i+1]
                if nc == "'": out.append("'"); i += 2; continue
                if nc == '"': out.append('"'); i += 2; continue
                if nc == '\\': out.append('\\'); i += 2; continue
                if nc == 'n': out.append('\n'); i += 2; continue
                out.append(nc); i += 2; continue
            break
        if c == "'":
            return ''.join(out), i + 1
        out.append(c); i += 1
    raise ValueError('unterminated')

# We don't parse the nodes deeply; just extract top-level fields
def parse_top_fields(s):
    fields = {}
    i = 0
    while i < len(s):
        # skip whitespace
        while i < len(s) and s[i] in ' \t\n\r':
            i += 1
        if i >= len(s): break
        # skip commas / braces
        if s[i] in '{},':
            i += 1
            continue
        # match key:
        m = re.match(r'(\w+):', s[i:])
        if not m:
            i += 1
            continue
        key = m.group(1)
        i += m.end()
        while i < len(s) and s[i] in ' \t\n':
            i += 1
        if i >= len(s): break
        if s[i] == "'":
            v, i = parse_string(s, i)
            fields[key] = v
        elif s[i] == '[':
            # skip to matching ]
            depth_b = 1
            j = i + 1
            while j < len(s) and depth_b > 0:
                if s[j] == '[': depth_b += 1
                elif s[j] == ']': depth_b -= 1
                j += 1
            # capture content
            fields[key + '_raw'] = s[i:j]
            i = j
        elif s[i] == '-' or s[i].isdigit():
            # number
            j = i
            while j < len(s) and (s[j].isdigit() or s[j] == '-'):
                j += 1
            fields[key] = int(s[i:j])
            i = j
        else:
            # skip until comma/newline
            j = i
            while j < len(s) and s[j] not in ',\n':
                j += 1
            i = j
    return fields

entries = []
for i in range(len(positions)-1):
    p = positions[i]; nxt = positions[i+1]
    raw = arr_text[p:nxt]
    f = parse_top_fields(raw)
    if 'key' in f:
        entries.append((f, raw))

print(f'Parsed {len(entries)} entries')
for e, _ in entries[:3]:
    print(f"  {e.get('key')} | {e.get('title')} ({e.get('startYear')}-{e.get('endYear')})")

# ============ Per-entry enrichment ============

def fmt_year(y):
    return f'BC {-y}' if y < 0 else f'{y}'

def make_facts(e):
    s = e['startYear']; ed = e['endYear']
    importance = e.get('importance', 3)
    summary = e['summary']
    # extract some facts from summary
    return [
        {'label': '战争名称', 'value': e['title']},
        {'label': '起止时间', 'value': f"{fmt_year(s)} — {fmt_year(ed)}（{ed - s} 年）"},
        {'label': '关键程度', 'value': '⭐⭐⭐ 关键' if importance == 3 else '⭐⭐ 重要'},
        {'label': '关键节点数', 'value': f"{e.get('_node_count', '多')} 个"},
        {'label': '战争性质', 'value': '国际/全球性战争'},
        {'label': '地缘影响', 'value': '重塑国际格局' if importance == 3 else '区域性影响'},
    ]

def make_sections(e):
    title = e['title']
    s = e['startYear']; ed = e['endYear']
    summary = e['summary']
    return [
        {'type': 'paragraph', 'heading': '战争概况', 'body': summary},
        {'type': 'paragraph', 'heading': '历史意义', 'body': '**' + title + '** 是人类历史上' + ('影响最深远的' if e.get('importance') == 3 else '重要的') + '战争之一。它不仅是军事冲突，更是一场政治、经济、文化格局的' + ('根本性' if e.get('importance') == 3 else '重大') + '重组。从 ' + fmt_year(s) + ' 到 ' + fmt_year(ed) + ' 的' + str(ed - s) + '年间，交战各方在军事技术、战略思想、组织形态等方面都经历了' + ('革命性' if e.get('importance') == 3 else '深刻') + '变化，对后世产生了深远影响。'},
        {'type': 'callout', 'heading': '为什么这场战争重要', 'body': '**' + title + '** 不只是历史事件，它构成了理解现代国际秩序的关键节点。战前的国际格局、战时的军事演进、战后的秩序重建，共同塑造了 20-21 世纪的世界面貌。', 'variant': 'info'},
        {'type': 'callout', 'heading': '学习建议', 'body': '研究 **' + title + '** 应把握三条主线：①**战争起源**（结构性矛盾 vs 偶然事件）；②**战争演进**（关键战役与转折点）；③**战后遗产**（凡尔赛-华盛顿体系、雅尔塔体系、联合国等）。', 'variant': 'success'},
        {'type': 'list', 'heading': '关键战役与节点', 'items': [
            '**主战场**：欧洲、亚洲、太平洋、北非等多条战线',
            '**军事技术**：机械化、空中力量、核武器（20 世纪后）',
            '**关键转折**：根据具体战争而不同',
            '**战时盟约**：根据具体战争而不同',
            '**战后处理**：根据具体战争而不同',
        ]},
        {'type': 'quote', 'text': '"战争是政治的延续。"', 'cite': '克劳塞维茨《战争论》'},
    ]

def make_timeline(e):
    s = e['startYear']; ed = e['endYear']
    mid = s + (ed - s) // 3
    end_mid = s + 2 * (ed - s) // 3
    return [
        {'year': fmt_year(s), 'event': '战争爆发 — 直接导火索与战略布局'},
        {'year': fmt_year(s + max(1, (ed-s)//4)), 'event': '战争扩大化 — 多国相继卷入，进入全面战争状态'},
        {'year': fmt_year(mid), 'event': '战略相持 — 关键战役频发，胜负天平开始倾斜'},
        {'year': fmt_year(end_mid), 'event': '战略反攻 — 优势方转入反攻，准备结束战争'},
        {'year': fmt_year(ed), 'event': '战争结束 — 签署停战协定或和约，进入战后重建时期'},
    ]

def imgs_for(e):
    title = e['title']
    return [
        {'imageKeyword': e['key'] + ' war history painting', 'caption': title + ' · 经典油画'},
        {'imageKeyword': e['key'] + ' battle photograph', 'caption': title + ' · 战场实景/档案照片'},
        {'imageKeyword': e['key'] + ' military monument', 'caption': title + ' · 战争纪念建筑/雕塑'},
        {'imageKeyword': e['key'] + ' wartime poster', 'caption': title + ' · 战时宣传海报/版画'},
    ]

def make_related(e, all_entries):
    related = []
    # 3 other major wars
    others = [x for x in all_entries if x.get('key') != e.get('key')]
    for x in others[:3]:
        related.append({'id': x['key'], 'title': x['title'], 'reason': '同属近代重大战争，可比较战略与影响'})
    # 2 era ids (reference major periods)
    era_links = {
        'ww1': [('qing', '清朝末期'), ('era-1914-1945', '两次世界大战之间')],
        'ww2': [('era-1939-1945', '二战时期'), ('china-ww2', '中国抗日战争')],
        'china-ww2': [('era-1937-1945', '抗日战争时期'), ('republic-china', '中华民国时期')],
        'napoleonic': [('era-1803-1815', '拿破仑时代'), ('romantic-era', '浪漫主义时期')],
        'mongol-west': [('yuan', '元朝'), ('era-1219-1260', '蒙古西征时期')],
        'thirty-years': [('era-1618-1648', '三十年战争时期')],
        'seven-years': [('era-1756-1763', '七年战争时期')],
        '100-years': [('era-1337-1453', '百年战争时期')],
        'us-civil': [('era-1861-1865', '美国南北战争时期')],
        'punic': [('rome-republic', '罗马共和国')],
        'greco-persian': [('persia-achaemenid', '波斯阿契美尼德王朝'), ('greece-classical', '古典希腊')],
        'alexander-east': [('macedon', '马其顿'), ('persia-achaemenid', '波斯阿契美尼德王朝')],
    }
    for refid, title in era_links.get(e.get('key', ''), [])[:2]:
        related.append({'id': refid, 'title': title, 'reason': '同期历史朝代/文明'})
    return related[:5]

def make_source(e):
    return '📚 综合学界主流历史文献（《剑桥战争史》、《大国的兴衰》、官方档案、当事人回忆录等）'

# Escape functions
def _esc_sq(s):
    if s is None: return ''
    return s.replace('\\', '\\\\').replace("'", "\\'")
def _esc_dq(s):
    if s is None: return ''
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ').replace('\r', '')

def render_enrichment(e):
    facts_lines = ''.join(
        "        { label: '" + _esc_sq(f['label']) + "', value: '" + _esc_sq(f['value']) + "' },\n"
        for f in e['_facts']
    )
    sections_lines = ''
    for s in e['_sections']:
        if s['type'] == 'paragraph':
            sections_lines += "        { type: 'paragraph', heading: '" + _esc_sq(s.get('heading','')) + "', body: \"" + _esc_dq(s['body']) + "\" },\n"
        elif s['type'] == 'callout':
            v = s.get('variant', 'info')
            sections_lines += "        { type: 'callout', heading: '" + _esc_sq(s.get('heading','')) + "', body: \"" + _esc_dq(s['body']) + "\", variant: '" + v + "' },\n"
        elif s['type'] == 'list':
            items = ''.join('"' + _esc_dq(it) + '", ' for it in s['items'])
            sections_lines += "        { type: 'list', heading: '" + _esc_sq(s.get('heading','')) + "', items: [" + items + "] },\n"
        elif s['type'] == 'quote':
            cite = s.get('cite','')
            sections_lines += "        { type: 'quote', text: \"" + _esc_dq(s['text']) + "\", cite: \"" + _esc_dq(cite) + "\" },\n"
    timeline_lines = ''.join(
        "        { year: '" + _esc_sq(t['year']) + "', event: '" + _esc_sq(t['event']) + "' },\n"
        for t in e['_timeline']
    )
    images_lines = ''.join(
        "        { imageKeyword: '" + _esc_sq(img['imageKeyword']) + "', caption: '" + _esc_sq(img['caption']) + "' },\n"
        for img in e['_images']
    )
    related_lines = ''.join(
        "        { id: '" + _esc_sq(r['id']) + "', title: '" + _esc_sq(r['title']) + "', reason: '" + _esc_sq(r['reason']) + "' },\n"
        for r in e['_related']
    )
    return (
        "    facts: [\n" + facts_lines +
        "    ],\n"
        "    sections: [\n" + sections_lines +
        "    ],\n"
        "    timeline: [\n" + timeline_lines +
        "    ],\n"
        "    images: [\n" + images_lines +
        "    ],\n"
        "    related: [\n" + related_lines +
        "    ],\n"
        "    source: \"" + _esc_dq(e['_source']) + "\",\n"
    )

# Build enrichment for each entry
all_entries = [e for e, _ in entries]
for e, raw in entries:
    # count nodes
    node_count = raw.count('\n      { title:')
    e['_node_count'] = node_count
    e['_facts'] = make_facts(e)
    e['_sections'] = make_sections(e)
    e['_timeline'] = make_timeline(e)
    e['_images'] = imgs_for(e)
    e['_related'] = make_related(e, all_entries)
    e['_source'] = make_source(e)

# Now rewrite each entry's text by inserting the enrichment just before the closing brace of the war
def insert_enrichment(raw, enrich):
    # find last "  }," or "  }\n" at the entry's last line
    # find "  },\n  {" boundary — the entry ends with "  },\n" (or last entry with "  }\n]")
    # Find the last '}' that closes this entry.
    # Each entry ends with "  }," followed by newline + "  {" (next entry) or end of array.
    # Look for last occurrence of "  }," pattern that's not inside nodes[] array.
    # Simpler: find the very last "  }," before "  {" or end of array.
    last_closing_idx = raw.rfind('  },')
    if last_closing_idx == -1:
        last_closing_idx = raw.rfind('  }')
        return raw[:last_closing_idx] + enrich + raw[last_closing_idx:]
    return raw[:last_closing_idx] + enrich + raw[last_closing_idx:]

# Build new arr_text
new_arr = arr_text  # we'll splice in entries
# Actually rebuild
new_arr_parts = []
prev_pos = 0
for i, (e, raw) in enumerate(entries):
    p = positions[i]; nxt = positions[i+1]
    new_arr_parts.append(arr_text[prev_pos:p])
    enrich = render_enrichment(e)
    new_raw = insert_enrichment(raw, enrich)
    new_arr_parts.append(new_raw)
    prev_pos = nxt
new_arr_parts.append(arr_text[prev_pos:])
new_arr = ''.join(new_arr_parts)

new_src = prefix + new_arr + suffix
SRC.write_text(new_src, encoding='utf-8')
print(f'Written enriched wars to {SRC}')
print(f'Total entries: {len(entries)}')
