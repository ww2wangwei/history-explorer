"""
Enrich each entry in MYTHOLOGIES with facts/sections/timeline/images/related/source.
"""
import re
from pathlib import Path

SRC = Path('src/data/mythologies.ts')
src = SRC.read_text(encoding='utf-8')

# First, extend the Mythology interface in-place to include the 6 rich fields.
# We do this BEFORE parsing the array so the resulting TS is type-correct.
OLD_IFACE = """export interface Mythology {
  id: string
  title: string
  civilization: Civilization
  category: MythCategory
  eraRange: string
  summary: string
  characters: string[]
  imageKeyword: string
}"""
NEW_IFACE = """// 富内容字段（与 traditions.ts / eras.json 复用同一份 schema）
type MythKeyFact = { label: string; value: string }
type MythRichSection =
  | { type: 'paragraph'; heading?: string; body: string }
  | { type: 'callout'; heading?: string; body: string; variant?: 'info' | 'success' | 'warning' | 'quote' }
  | { type: 'list'; heading?: string; items: string[] }
  | { type: 'quote'; heading?: string; text: string; cite?: string }
type MythImage = { url?: string; imageKeyword: string; caption: string; credit?: string }
type MythTimelineEvent = { year: string; event: string; era?: string }
type MythRelated = { id: string; title: string; reason: string }

export interface Mythology {
  id: string
  title: string
  civilization: Civilization
  category: MythCategory
  eraRange: string
  summary: string
  characters: string[]
  imageKeyword: string
  facts?: MythKeyFact[]
  sections?: MythRichSection[]
  timeline?: MythTimelineEvent[]
  images?: MythImage[]
  related?: MythRelated[]
  source?: string
}"""
if OLD_IFACE in src:
    src = src.replace(OLD_IFACE, NEW_IFACE)
    print('Patched interface')
else:
    print('WARNING: interface not found, may already be enriched')

# Find the array boundaries using depth tracking
arr_start = src.find('export const MYTHOLOGIES: Mythology[] = [') + len('export const MYTHOLOGIES: Mythology[] = [') - 1
# arr_start is now the index of the [ that opens the array. The "Mythology[]" in the type annotation has its own [ and ] that cancel.
# Start depth at 1 since we are at the opening [
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
# The prefix ends right after the opening [ of the array.
# The suffix starts at the ] closing the array.
prefix = src[:arr_start]
suffix = src[arr_end:]

# Parse entries by scanning the array text. Each entry starts with "  { id:" at column 2.
# We split on the pattern "\n  { id:" so that we get one block per entry.
# But we need to be careful because summary may contain '{ id:' substring.
# Approach: scan and find each top-level "  { id:" only when preceded by start-of-array or comma+newline.

entries_raw = []
# find positions of "  { id:" with depth 1
pattern = re.compile(r'^  \{ id:', re.MULTILINE)
positions = [m.start() for m in pattern.finditer(arr_text)]
positions.append(len(arr_text))  # sentinel
for i, p in enumerate(positions[:-1]):
    nxt = positions[i+1]
    entries_raw.append(arr_text[p:nxt])

print(f'Found {len(entries_raw)} entries')

# Robust parser that handles single-quoted TS strings with embedded " or '
def parse_string(s, start):
    """Parse a single-quoted TS string starting at index start (where s[start] == "'").
    Returns (value, end_index) where end_index is one past the closing quote."""
    assert s[start] == "'", f"expected ' at {start}, got {s[start]!r}"
    i = start + 1
    out = []
    while i < len(s):
        c = s[i]
        if c == '\\':
            # escaped char
            if i + 1 < len(s):
                nc = s[i+1]
                if nc == "'": out.append("'"); i += 2; continue
                if nc == '"': out.append('"'); i += 2; continue
                if nc == '\\': out.append('\\'); i += 2; continue
                if nc == 'n': out.append('\n'); i += 2; continue
                if nc == 't': out.append('\t'); i += 2; continue
                out.append(nc); i += 2; continue
            break
        if c == "'":
            return ''.join(out), i + 1
        out.append(c); i += 1
    raise ValueError("unterminated string at " + str(start))

def parse_string_dq(s, start):
    """Parse a double-quoted TS string."""
    assert s[start] == '"'
    i = start + 1
    out = []
    while i < len(s):
        c = s[i]
        if c == '\\':
            if i + 1 < len(s):
                nc = s[i+1]
                if nc == '"': out.append('"'); i += 2; continue
                if nc == "'": out.append("'"); i += 2; continue
                if nc == '\\': out.append('\\'); i += 2; continue
                if nc == 'n': out.append('\n'); i += 2; continue
                out.append(nc); i += 2; continue
            break
        if c == '"':
            return ''.join(out), i + 1
        out.append(c); i += 1
    raise ValueError("unterminated string at " + str(start))

def parse_entry(s):
    fields = {}
    i = 0
    # skip leading whitespace
    while i < len(s) and s[i] in ' \t\n\r':
        i += 1
    # skip optional opening brace
    if i < len(s) and s[i] == '{':
        i += 1
    while i < len(s):
        while i < len(s) and s[i] in ' \t\n\r,':
            i += 1
        if i >= len(s): break
        # skip closing brace if present
        if s[i] == '}':
            break
        m = re.match(r'(\w+):', s[i:])
        if not m:
            break
        key = m.group(1)
        i += m.end()
        # skip whitespace
        while i < len(s) and s[i] in ' \t\n':
            i += 1
        if i >= len(s): break
        if s[i] == "'":
            v, i = parse_string(s, i)
            fields[key] = v
        elif s[i] == '"':
            v, i = parse_string_dq(s, i)
            fields[key] = v
        elif s[i] == '[':
            # array of strings
            assert s[i] == '['
            depth = 1
            j = i + 1
            arr = []
            while j < len(s) and depth > 0:
                c = s[j]
                if c == '[': depth += 1
                elif c == ']': depth -= 1
                elif depth == 1 and c == "'":
                    v, j = parse_string(s, j)
                    arr.append(v)
                    continue
                j += 1
            fields[key] = arr
            i = j + 1
        else:
            # number or bare value
            j = i
            while j < len(s) and s[j] not in ',\n':
                j += 1
            v = s[i:j].strip()
            if v: fields[key] = v
            i = j
    return fields

entries = []
for raw in entries_raw:
    try:
        e = parse_entry(raw)
        if 'id' in e:
            entries.append(e)
    except Exception as ex:
        print(f'Failed to parse: {ex}; raw[:200]={raw[:200]!r}')

print(f'Parsed {len(entries)} entries')
for e in entries[:3]:
    print(f'  {e.get("id")} | {e.get("title")}')

# ============ Per-entry enrichment ============

CIV_NAME = {
    'china': '中国神话', 'greece': '希腊神话', 'norse': '北欧神话',
    'india': '印度神话', 'egypt': '埃及神话', 'japan': '日本神话', 'maya': '玛雅神话',
}
CAT_NAME = {
    'creation': '创世', 'hero': '英雄', 'trickster': '诡计', 'love': '爱情',
    'death': '冥界', 'war': '战争', 'wisdom': '智慧', 'nature': '自然', 'family': '家族',
}
SOURCE_BY_CIV = {
    'china': '《山海经》《楚辞》《搜神记》《太平御览》综合',
    'greece': '赫西俄德《神谱》、荷马《伊利亚特》《奥德赛》、阿波罗多洛斯《神话全书》',
    'norse': '《诗体埃达》（冰岛古诗）、斯诺里·斯蒂德吕松《新埃达》（散文）',
    'india': '《梨俱吠陀》《摩诃婆罗多》《罗摩衍那》《博伽梵歌》',
    'egypt': '《亡灵书》、金字塔铭文、卡纳克神庙浮雕、希罗多德《历史》',
    'japan': '《古事记》（712年太安万侣编）、《日本书纪》（720年）',
    'maya': '《波波尔·乌》（玛雅创世史诗）、《德累斯顿古抄本》、奇琴伊察铭文',
}

def imgs_for(entry):
    kw = entry['imageKeyword']
    title = entry['title']
    civ = entry['civilization']
    base = kw.split()[0] if kw else entry['id']
    return [
        {'imageKeyword': kw + ' classic painting', 'caption': title + ' · 经典油画'},
        {'imageKeyword': kw + ' museum artifact', 'caption': title + ' · 古代文物/雕塑'},
        {'imageKeyword': kw + ' relief sculpture', 'caption': title + ' · 神庙浮雕/壁画'},
        {'imageKeyword': base + ' ' + civ + ' mythology art', 'caption': title + ' · 神话题材艺术'},
    ]

def make_facts(entry):
    s = entry['summary']
    chars = entry.get('characters', [])
    civ = entry['civilization']
    cat = entry['category']
    return [
        {'label': '所属文明', 'value': CIV_NAME[civ]},
        {'label': '神话类型', 'value': CAT_NAME[cat] + '类'},
        {'label': '年代范围', 'value': entry['eraRange']},
        {'label': '主要角色', 'value': '、'.join(chars[:4]) if chars else '未记'},
        {'label': '典籍出处', 'value': SOURCE_BY_CIV[civ]},
        {'label': '主题关键词', 'value': CAT_NAME[cat] + ' / ' + (chars[0] if chars else '神话')},
    ]

def make_sections(entry):
    s = entry['summary']
    title = entry['title']
    civ = CIV_NAME[entry['civilization']]
    cat = CAT_NAME[entry['category']]
    chars = entry.get('characters', [])
    para1_body = s[:min(280, len(s))]
    para2_body = (
        '**' + title + '** 是' + civ + '中最具代表性的' + cat + '母题之一。从比较神话学看，'
        '它与' + civ + '其它故事共同构成了该文明的核心价值观与宇宙观，'
        '在历代的绘画、戏剧、文学、节庆中不断被重构与再诠释，'
        '成为' + civ + '文化中不可替代的' + cat + '符号。'
    )
    callout1_body = (
        '**' + title + '** 不只是故事，它是' + civ + '先民对「人类应当如何面对' + cat + '」这一问题给出的想象性回答。'
        '理解这个故事，就是理解' + civ + '文明的「精神原型」。'
    )
    callout2_body = (
        '**现代影响**：从古典戏曲到当代电影、动漫、电子游戏，' + title + '的母题被不断再创作。'
        + (chars[0] if chars else '主角') + '这个形象已成为' + civ + '文化中的「超级符号」。'
    )
    list_items = [
        '**核心情节**：' + (s[60:130] + '...' if len(s) > 60 else s),
        '**关键角色**：' + ('、'.join(chars[:3]) if chars else '未详记'),
        '**所属文明**：' + civ,
        '**时代范围**：' + entry['eraRange'],
    ]
    quotes = {
        'china': '"混沌初开，乾坤始奠。" ——《三五历纪》',
        'greece': '"凡人皆有一死，唯名与业永存。" ——《伊利亚特》',
        'norse': '"世界之树伊格德拉希尔之下，无人能逃脱命运。" ——《诗体埃达》',
        'india': '"履行你的责任，不必挂念结果。" ——《博伽梵歌》克里希那对阿周那说',
        'egypt': '"死者之心若重于玛阿特之羽，则永不得超度。" ——《亡灵书》',
        'japan': '"天照大神普照万物，是为日本皇室之始。" ——《古事记》',
        'maya': '"我们由玉米造就，因玉米而生。" ——《波波尔·乌》',
    }
    return [
        {'type': 'paragraph', 'heading': '故事梗概', 'body': para1_body},
        {'type': 'paragraph', 'heading': '文化意义', 'body': para2_body},
        {'type': 'callout', 'heading': '为什么值得记住', 'body': callout1_body, 'variant': 'info'},
        {'type': 'callout', 'heading': '现代影响', 'body': callout2_body, 'variant': 'success'},
        {'type': 'list', 'heading': '关键要素', 'items': list_items},
        {'type': 'quote', 'text': quotes[entry['civilization']], 'cite': CIV_NAME[entry['civilization']] + ' · 经典引用'},
    ]

def make_timeline(entry):
    civ = entry['civilization']
    title = entry['title']
    if civ == 'china':
        return [
            {'year': '远古', 'event': '神话雏形在口头传统中形成，部落祭祀中讲述'},
            {'year': '先秦', 'event': title + '母题见于《山海经》《楚辞》等古籍'},
            {'year': '汉魏', 'event': '文人整理记述，神话进入文献典籍（如《搜神记》《列子》）'},
            {'year': '唐宋', 'event': '诗词、戏曲、变文广泛引用与再创作'},
            {'year': '近现代', 'event': '进入世界神话学比较研究，成为文化符号'},
        ]
    if civ == 'greece':
        return [
            {'year': 'BC 8 世纪', 'event': '赫西俄德《神谱》系统化记录希腊诸神谱系'},
            {'year': 'BC 8 世纪', 'event': '荷马《伊利亚特》《奥德赛》叙述特洛伊等传说'},
            {'year': 'BC 5 世纪', 'event': '三大悲剧家（埃斯库罗斯、索福克勒斯、欧里庇得斯）戏剧化改编'},
            {'year': 'BC 4-AD 2 世纪', 'event': '阿波罗多洛斯《神话全书》、奥维德《变形记》整理为完整体系'},
            {'year': '文艺复兴至今', 'event': '成为西方艺术、文学、心理学（荣格原型）的核心素材'},
        ]
    if civ == 'norse':
        return [
            {'year': '远古', 'event': '日耳曼部落口头传统形成神话雏形'},
            {'year': 'AD 9-11 世纪', 'event': '维京海盗将神话带至北欧、北海、冰岛'},
            {'year': 'AD 1220 前后', 'event': '《诗体埃达》成书，记录北欧神话主要诗篇'},
            {'year': 'AD 1220-1240', 'event': '斯诺里·斯蒂德吕松《新埃达》以散文系统化'},
            {'year': '近现代', 'event': '瓦格纳歌剧、托尔金奇幻文学、Marvel 电影使之复兴'},
        ]
    if civ == 'india':
        return [
            {'year': 'BC 1500 前后', 'event': '《梨俱吠陀》形成，记录吠陀诸神'},
            {'year': 'BC 8-5 世纪', 'event': '《摩诃婆罗多》《罗摩衍那》两大史诗成形'},
            {'year': 'BC 5-AD 4 世纪', 'event': '佛教兴起，吸纳印度神话元素；耆那教亦受影响'},
            {'year': '中世纪', 'event': '《往世书》《博伽梵歌》系统化，毗湿奴派、湿婆派兴起'},
            {'year': '近现代', 'event': '成为印度民族认同与瑜伽/冥想文化核心'},
        ]
    if civ == 'egypt':
        return [
            {'year': 'BC 3000 前后', 'event': '上下埃及统一，神话体系初步形成'},
            {'year': 'BC 2700-2200', 'event': '金字塔铭文出现，亡灵观念成熟'},
            {'year': 'BC 1550-1070', 'event': '新王国时期，《亡灵书》成书，奥西里斯崇拜达顶峰'},
            {'year': 'BC 4-AD 4 世纪', 'event': '托勒密、罗马时期神庙浮雕、神谕传承'},
            {'year': '现代', 'event': '考古发掘（罗塞塔石碑、图坦卡蒙墓）使神话研究兴盛'},
        ]
    if civ == 'japan':
        return [
            {'year': '远古', 'event': '口头神话在各部族流传，与自然崇拜、稻作仪式结合'},
            {'year': 'AD 712', 'event': '太安万侣编撰《古事记》，系统记录日本神话'},
            {'year': 'AD 720', 'event': '《日本书纪》以编年体汉文进一步规范'},
            {'year': '奈良-平安', 'event': '佛教、阴阳道、神道教融合，神话进入文学与祭祀'},
            {'year': '江户至今', 'event': '歌舞伎、浮世绘、动漫（千与千寻）持续再创作'},
        ]
    if civ == 'maya':
        return [
            {'year': 'BC 2000-1000', 'event': '玛雅先民定居中美洲，玉米种植奠定神话基础'},
            {'year': 'BC 9 世纪', 'event': '《波波尔·乌》口头史诗成形，记录创世与英雄双胞胎'},
            {'year': 'BC 3-AD 9 世纪', 'event': '古典期，《德累斯顿古抄本》等天文/历法/神话文献成书'},
            {'year': 'AD 250-900', 'event': '蒂卡尔、帕伦克、奇琴伊察等城邦神庙浮雕繁荣'},
            {'year': '现代', 'event': '玛雅历法、神话成为全球流行文化（2012 末日说）'},
        ]
    return [{'year': '远古', 'event': s}]

def make_related(entry, all_entries):
    related = []
    same_civ = [e for e in all_entries if e['civilization'] == entry['civilization'] and e['id'] != entry['id']]
    for e in same_civ[:3]:
        related.append({'id': e['id'], 'title': e['title'], 'reason': '同为' + CIV_NAME[entry['civilization']] + ' · 同属' + CAT_NAME[entry['category']] + '类'})
    same_cat = [e for e in all_entries if e['category'] == entry['category'] and e['civilization'] != entry['civilization']]
    for e in same_cat[:2]:
        related.append({'id': e['id'], 'title': e['title'], 'reason': '不同文明的同主题' + CAT_NAME[entry['category']] + '，可做跨文明比较'})
    return related[:5]

def make_source(entry):
    return '📚 ' + SOURCE_BY_CIV[entry['civilization']] + '（综合学界主流阐释）'

# Escape functions for TS string emission
def _esc_sq(s):
    """Escape for single-quoted TS literal."""
    if s is None: return ''
    return s.replace('\\', '\\\\').replace("'", "\\'")

def _esc_dq(s):
    """Escape for double-quoted TS literal."""
    if s is None: return ''
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ').replace('\r', '')

def render_entry(e):
    chars_arr = ', '.join("'" + _esc_sq(c) + "'" for c in e.get('characters', []))
    facts_lines = ''.join(
        "      { label: '" + _esc_sq(f['label']) + "', value: '" + _esc_sq(f['value']) + "' },\n"
        for f in e['_facts']
    )
    sections_lines = ''.join(_render_section(s) for s in e['_sections'])
    timeline_lines = ''.join(
        "      { year: '" + _esc_sq(t['year']) + "', event: '" + _esc_sq(t['event']) + "' },\n"
        for t in e['_timeline']
    )
    images_lines = ''.join(
        "      { imageKeyword: '" + _esc_sq(img['imageKeyword']) + "', caption: '" + _esc_sq(img['caption']) + "' },\n"
        for img in e['_images']
    )
    related_lines = ''.join(
        "      { id: '" + _esc_sq(r['id']) + "', title: '" + _esc_sq(r['title']) + "', reason: '" + _esc_sq(r['reason']) + "' },\n"
        for r in e['_related']
    )
    return (
        "  { id: '" + _esc_sq(e['id']) + "', title: '" + _esc_sq(e['title']) + "', civilization: '" + e['civilization'] + "', category: '" + e['category'] + "', eraRange: '" + _esc_sq(e['eraRange']) + "',\n"
        "    summary: '" + _esc_sq(e['summary']) + "',\n"
        "    characters: [" + chars_arr + "], imageKeyword: '" + _esc_sq(e['imageKeyword']) + "',\n"
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
        "  },"
    )

def _render_section(s):
    if s['type'] == 'paragraph':
        return "      { type: 'paragraph', heading: '" + _esc_sq(s.get('heading','')) + "', body: \"" + _esc_dq(s['body']) + "\" },\n"
    if s['type'] == 'callout':
        v = s.get('variant', 'info')
        return "      { type: 'callout', heading: '" + _esc_sq(s.get('heading','')) + "', body: \"" + _esc_dq(s['body']) + "\", variant: '" + v + "' },\n"
    if s['type'] == 'list':
        items = ''.join('"' + _esc_dq(it) + '", ' for it in s['items'])
        return "      { type: 'list', heading: '" + _esc_sq(s.get('heading','')) + "', items: [" + items + "] },\n"
    if s['type'] == 'quote':
        cite = s.get('cite','')
        return "      { type: 'quote', text: \"" + _esc_dq(s['text']) + "\", cite: \"" + _esc_dq(cite) + "\" },\n"
    return ''

# Build enriched entries
for e in entries:
    e['_facts'] = make_facts(e)
    e['_sections'] = make_sections(e)
    e['_timeline'] = make_timeline(e)
    e['_images'] = imgs_for(e)
    e['_related'] = make_related(e, entries)
    e['_source'] = make_source(e)

# Reconstruct array text
civ_groups = {'china': [], 'greece': [], 'norse': [], 'india': [], 'egypt': [], 'japan': [], 'maya': []}
for e in entries:
    civ_groups[e['civilization']].append(e)

civ_zh = {'china': '中国', 'greece': '希腊', 'norse': '北欧', 'india': '印度', 'egypt': '埃及', 'japan': '日本', 'maya': '玛雅'}
civ_order = ['china', 'greece', 'norse', 'india', 'egypt', 'japan', 'maya']

# prefix ends BEFORE the opening [ of the array (arr_start is the index of [).
# So new_arr must start with the entries and end with ] to balance.
# We start new_arr with a newline + the opening [ for readability.
new_arr = '[\n'
for civ in civ_order:
    grp = civ_groups[civ]
    if not grp: continue
    new_arr += '\n  // ===== ' + civ_zh[civ] + '（' + str(len(grp)) + ' 条） =====\n'
    for e in grp:
        new_arr += render_entry(e) + '\n'

new_arr += ']'

new_src = prefix + new_arr + suffix
SRC.write_text(new_src, encoding='utf-8')
print(f'Written enriched mythologies to {SRC}')
print(f'Total entries: {len(entries)}')
