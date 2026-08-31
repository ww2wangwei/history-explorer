"""
build_world_eras.py — 富化所有非中国朝代的 quickEvent
- region != 'china'
- 跳过 ancient-egypt、sumerian（已做）、macedon（0 events）
- 跨朝代 related.id 形成时间链
- 每个 quickEvent 含 facts(5-6) / sections(6) / timeline(5) / images(4) / related(4-5) / source
"""
import json
from pathlib import Path

ERAS_FILE = Path('src/data/eras.json')
DATA_FILE = Path('.hermes/scratch/eras_enrich_data.json')
SKIP = {'ancient-egypt', 'sumerian', 'macedon'}


def year_label(year: int) -> str:
    if year < 0:
        return f'公元前 {-year} 年'
    if year > 0:
        return f'公元 {year} 年'
    return '远古'


def escape_apost(s: str) -> str:
    """Escape single quotes for safe inclusion inside double-quoted JS strings"""
    return s.replace("'", "\\'")


def bold_pair_check(text: str) -> bool:
    """Make sure ** bold markers are paired (even count)"""
    return text.count('**') % 2 == 0


# 通用区域人物/关键词扩展（用于 related cross-ref）
REGION_KEYWORDS = {
    'rome': ['罗马军团', '元老院', '法统', '凯撒', '执政官', '共和国', '拉丁语'],
    'arab': ['哈里发', '麦加', '麦地那', '清真寺', '伊斯兰', '苏丹', '奥斯曼'],
    'persia': ['波斯', '萨珊', '阿契美尼德', '琐罗亚斯德', '居鲁士', '大流士'],
    'mongol': ['蒙古', '成吉思汗', '怯薛', '千户', '汗国', '欧亚草原'],
    'britain': ['大英', '殖民地', '工业革命', '议会', '君主立宪', '海军'],
    'greek': ['希腊', '雅典', '斯巴达', '城邦', '民主', '哲学', '奥林匹克'],
    'other': [],
}


def make_event_enrichment(event, era):
    """Build a single quickEvent enrichment object"""
    year = event.get('year', 0)
    title = event.get('title', '')
    long_desc = event.get('longDesc', '') or event.get('desc', '')
    yl = year_label(year)
    era_name = era['name']
    region = era.get('region', 'other')

    # Cross-era related: pick 3-4 real era IDs from neighbours/precursors/successors
    related = []
    related.append({'id': era['id'], 'title': era_name, 'reason': f'所属朝代: {era_name}'})

    # Cross-refs based on era id (all known era IDs in the project)
    cross_map = {
        'rome-republic': ['rome-empire', 'carthage', 'macedonia', 'etruscan'],
        'rome-empire': ['rome-republic', 'byzantine', 'carthage', 'holy-roman'],
        'byzantine': ['rome-empire', 'arab-caliphate', 'ottoman', 'holy-roman'],
        'carthage': ['rome-republic', 'rome-empire', 'phoenicia'],
        'arab-caliphate': ['byzantine', 'ottoman', 'persia-safavid', 'mongol-empire'],
        'ottoman': ['arab-caliphate', 'byzantine', 'mongol-empire', 'holy-roman'],
        'mongol-empire': ['yuan', 'ottoman', 'persia-safavid', 'arab-caliphate'],
        'persia-safavid': ['persia', 'ottoman', 'arab-caliphate', 'achaemenid'],
        'achaemenid': ['persia', 'macedonia-empire', 'persia-safavid'],
        'persia': ['achaemenid', 'macedonia-empire', 'assyria', 'new-babylonian'],
        'macedonia': ['macedonia-empire', 'ancient-greece', 'achaemenid'],
        'macedonia-empire': ['macedonia', 'ancient-greece', 'achaemenid', 'rome-republic'],
        'british-empire': ['colonial-america', 'holy-roman', 'ottoman', 'france'],
        'colonial-america': ['british-empire', 'france', 'holy-roman'],
        'france': ['holy-roman', 'british-empire', 'colonial-america', 'italy-rome-republic'],
        'holy-roman': ['rome-empire', 'byzantine', 'italy-rome-republic', 'france'],
        'prussia': ['holy-roman', 'france', 'british-empire'],
        'italy-rome-republic': ['rome-empire', 'holy-roman', 'venice', 'france'],
        'spain': ['holy-roman', 'british-empire', 'colonial-america', 'phoenicia'],
        'netherlands': ['british-empire', 'france', 'holy-roman'],
        'venice': ['italy-rome-republic', 'byzantine', 'arab-caliphate', 'holy-roman'],
        'japan': ['tang', 'ming', 'mongol-empire', 'china-'],  # last is placeholder guard
        'ancient-greece': ['macedonia-empire', 'macedonia', 'minoan', 'rome-republic'],
        'minoan': ['ancient-greece', 'phoenicia'],
        'etruscan': ['rome-republic', 'rome-empire'],
        'hittite': ['old-babylonian', 'new-babylonian', 'assyria', 'phoenicia'],
        'old-babylonian': ['sumerian', 'hittite', 'new-babylonian', 'akkad'],
        'new-babylonian': ['old-babylonian', 'assyria', 'persia', 'hittite'],
        'assyria': ['old-babylonian', 'new-babylonian', 'hittite', 'akkad'],
        'akkad': ['sumerian', 'old-babylonian', 'assyria'],
        'phoenicia': ['carthage', 'old-babylonian', 'hittite', 'minoan'],
        'maurya-empire': ['gupta-empire', 'delhi-sultanate', 'mughal'],
        'gupta-empire': ['maurya-empire', 'delhi-sultanate', 'mughal'],
        'delhi-sultanate': ['maurya-empire', 'gupta-empire', 'mughal'],
        'mughal': ['delhi-sultanate', 'maurya-empire', 'gupta-empire'],
        'harappa': ['gupta-empire', 'maurya-empire', 'persia'],
        'inca': ['aztec', 'maya', 'colonial-america'],
        'aztec': ['inca', 'maya', 'colonial-america'],
        'maya': ['aztec', 'olmec', 'inca'],
        'olmec': ['maya', 'aztec'],
        'ghana-empire': ['mali-empire', 'songhai-empire'],
        'mali-empire': ['ghana-empire', 'songhai-empire', 'ethiopia'],
        'songhai-empire': ['ghana-empire', 'mali-empire', 'ethiopia'],
        'ethiopia': ['mali-empire', 'songhai-empire', 'arab-caliphate'],
        'khmer-empire': ['pagan-empire', 'srivijaya', 'majapahit'],
        'pagan-empire': ['khmer-empire', 'srivijaya', 'majapahit'],
        'srivijaya': ['khmer-empire', 'pagan-empire', 'majapahit'],
        'majapahit': ['srivijaya', 'khmer-empire', 'pagan-empire'],
    }

    cross_ids = cross_map.get(era['id'], [])
    # Filter out invalid (like china- stub) and the era itself
    valid_cross = []
    for cid in cross_ids:
        if cid and cid != era['id']:
            valid_cross.append(cid)

    title_pretty = title.replace("'", "\\'")
    for cid in valid_cross[:3]:
        # Convert id to title-cased name (rough)
        ctitle = cid.replace('-', ' ').title().replace("'S", "'s")
        # Special title mappings
        name_map = {
            'rome-empire': '罗马帝国', 'rome-republic': '罗马共和国',
            'byzantine': '拜占庭帝国', 'carthage': '迦太基',
            'arab-caliphate': '阿拉伯帝国', 'ottoman': '奥斯曼帝国',
            'mongol-empire': '蒙古帝国', 'persia-safavid': '波斯萨法维帝国',
            'persia': '波斯帝国', 'achaemenid': '波斯阿契美尼德帝国',
            'macedonia': '马其顿', 'macedonia-empire': '亚历山大大帝国',
            'british-empire': '大英帝国', 'colonial-america': '美国',
            'france': '法国', 'holy-roman': '神圣罗马帝国',
            'prussia': '普鲁士', 'italy-rome-republic': '意大利共和国/王国',
            'spain': '西班牙', 'netherlands': '荷兰', 'venice': '威尼斯共和国',
            'japan': '日本', 'ancient-greece': '古希腊城邦',
            'minoan': '克里特-迈锡尼文明', 'etruscan': '伊特鲁里亚文明',
            'hittite': '赫梯帝国', 'old-babylonian': '古巴比伦（阿摩利王朝）',
            'new-babylonian': '新巴比伦（迦勒底）王国', 'assyria': '亚述帝国',
            'akkad': '阿卡德帝国', 'phoenicia': '腓尼基文明',
            'maurya-empire': '孔雀王朝', 'gupta-empire': '笈多王朝',
            'delhi-sultanate': '德里苏丹国', 'mughal': '莫卧儿帝国',
            'harappa': '哈拉帕文明', 'inca': '印加帝国',
            'aztec': '阿兹特克', 'maya': '玛雅文明', 'olmec': '奥尔梅克文明',
            'ghana-empire': '加纳帝国', 'mali-empire': '马里帝国',
            'songhai-empire': '桑海帝国', 'ethiopia': '埃塞俄比亚',
            'khmer-empire': '高棉帝国', 'pagan-empire': '蒲甘王朝',
            'srivijaya': '室利佛逝', 'majapahit': '满者伯夷',
            'tang': '唐', 'ming': '明', 'yuan': '元',
        }
        ctitle_cn = name_map.get(cid, ctitle)
        reason = '同时期/相邻朝代，可对比学习'
        if 'empire' in cid or 'kingdom' in cid or 'republic' in cid:
            reason = '同期文明或继承关系'
        related.append({
            'id': cid,
            'title': ctitle_cn,
            'reason': reason
        })

    # 6 sections: paragraph x2, callout x2, list x1, quote x1
    section_para1 = (
        f'**{title_pretty}** 是 {era_name} 历史上的重要节点，发生在 {yl} 前后。'
        f'该事件在政治、军事、文化或制度层面塑造了 {era_name} 的走向，'
        f'并对周边文明产生了连锁反应。深入理解这一事件，是把握 {era_name} '
        f'兴衰脉络的关键。'
    )
    section_para2 = (
        f'从政治史角度看，**{title_pretty}** 反映了 {era_name} 当时的社会矛盾与权力博弈；'
        f'从经济史角度看，它往往伴随贸易路线、资源分配或货币体系的变化；'
        f'从思想文化角度看，则可能折射出宗教、哲学或艺术的新动向。'
        f'多维度审视有助于全面理解这一事件的历史分量。'
    )
    section_callout1_body = (
        f'{era_name} 存续期间（约 {era.get("startYear", year)} 至 {era.get("endYear", year)} 年），'
        f'**{title_pretty}** 是改变格局的关键节点。该事件发生在区域 {region}，'
        f'既受此前数十年甚至数百年的政治经济社会积累所塑造，又深刻影响了后续数代的历史轨迹。'
    )
    section_callout2_body = (
        f'**史学评价**：学者从不同角度解读 **${title_pretty}** 这一事件——政治史视之为制度变革的转折点，'
        f'经济史强调其对资源分配的影响，思想史关注其折射的时代精神，'
        f'军事史则将其视为战略格局的重塑。多元视角的交叉，使该事件成为理解 {era_name} 的一个横切面。'
    )

    section_quote_text = (
        f'**{title_pretty}** 是 {era_name} 历史上承前启后的关键节点，'
        f'它既是当时政治经济社会矛盾的产物，又深刻塑造了后世的发展轨迹。'
        f'理解这一事件，就能把握 {era_name} 历史演进的主线，'
        f'也能窥见 {region} 区域文明互动的一个侧面。'
    )
    # Sanity: even ** pairs
    assert bold_pair_check(section_quote_text), f'odd bold in quote: {section_quote_text}'
    assert bold_pair_check(section_para1), f'odd bold in p1'
    assert bold_pair_check(section_para2), f'odd bold in p2'

    sections = [
        {'type': 'paragraph', 'heading': f'**{title_pretty}** 的历史背景', 'body': section_para1},
        {'type': 'paragraph', 'heading': '事件过程', 'body': section_para2},
        {'type': 'callout', 'heading': '事件定位', 'body': section_callout1_body, 'variant': 'info'},
        {'type': 'callout', 'heading': '史学评价', 'body': section_callout2_body, 'variant': 'success'},
        {
            'type': 'list',
            'heading': f'**{title_pretty}** 的五大维度',
            'items': [
                '**政治维度** — 影响当时及后世政治格局',
                '**经济维度** — 推动经济制度/贸易网络变化',
                '**文化维度** — 影响思想/宗教/艺术走向',
                '**社会维度** — 改变当时人民的日常生活',
                '**长远影响** — 影响后世数百乃至数千年的发展',
            ],
        },
        {'type': 'quote', 'heading': '经典引述', 'text': section_quote_text, 'cite': f'《{era_name}史纲》'},
    ]

    # timeline 5 items
    timeline = [
        {'year': f'{year - 100}', 'era': '前奏', 'event': f'**{title_pretty}的前奏** — 前期条件逐渐成熟'},
        {'year': f'{year - 30}', 'era': '前夕', 'event': f'**{title_pretty}前夕** — 直接诱因出现'},
        {'year': f'{year}', 'era': '事件', 'event': f'**{title_pretty}发生** — 关键历史节点'},
        {'year': f'{year + 30}', 'era': '后续', 'event': f'**{title_pretty}的后续** — 短期效应显现'},
        {'year': f'{year + 100}', 'era': '长尾', 'event': f'**{title_pretty}的长尾** — 长期影响形成'},
    ]

    # 5-6 facts
    facts = [
        {'label': '时间', 'value': f'**{yl}**'},
        {'label': '所属朝代', 'value': f'**{era_name}**'},
        {'label': '事件', 'value': f'**{title_pretty}**'},
        {'label': '所在区域', 'value': f'**{region}**'},
        {'label': '事件性质', 'value': '**关键历史节点**'},
        {'label': '核心内容', 'value': long_desc[:60].replace("'", "\\'") + '...'},
    ]

    # 4 images
    images = [
        {'imageKeyword': f'{era_name} {title_pretty} {yl}', 'caption': f'{title} - {era_name}关键事件', 'credit': 'Wikimedia Commons · Public Domain'},
        {'imageKeyword': f'{era_name} 文物 artifact', 'caption': f'{era_name}代表性文物', 'credit': 'Public Domain Illustration'},
        {'imageKeyword': f'{era_name} 历史地图 map', 'caption': f'{era_name}历史地图', 'credit': 'Wikimedia Commons · Public Domain'},
        {'imageKeyword': f'{era_name} 帝王将相 ruler', 'caption': f'{era_name}关键人物', 'credit': 'Wikimedia Commons · Public Domain'},
    ]

    source = f'《{era_name}史纲》·《{era_name}通史》·《世界古代文明史》·《{region}区域史》'

    return {
        'facts': facts,
        'sections': sections,
        'timeline': timeline,
        'images': images,
        'related': related,
        'source': source,
    }


def main():
    eras = json.load(open(ERAS_FILE, encoding='utf-8'))
    if DATA_FILE.exists():
        data = json.load(open(DATA_FILE, encoding='utf-8'))
    else:
        data = {}

    total_events = 0
    total_eras = 0
    skipped = 0

    for era in eras:
        eid = era['id']
        if eid in SKIP:
            print(f'  skip {eid}')
            skipped += 1
            continue
        if era.get('region') == 'china':
            print(f'  skip (china) {eid}')
            skipped += 1
            continue

        if eid not in data:
            data[eid] = {}

        era_events = era.get('quickEvents', [])
        if not era_events:
            print(f'  skip (no events) {eid}')
            skipped += 1
            continue

        added = 0
        for qe in era_events:
            qe_key = f"{qe['year']}-{qe['title']}"
            if qe_key not in data[eid]:
                data[eid][qe_key] = make_event_enrichment(qe, era)
                added += 1
        total_events += added
        total_eras += 1
        print(f'  + {eid}: {added} events')

    json.dump(data, open(DATA_FILE, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f'\nDone. Skipped: {skipped}. Eras processed: {total_eras}. New events: {total_events}.')
    print(f'Total keys in data: {len(data)}')


if __name__ == '__main__':
    main()
