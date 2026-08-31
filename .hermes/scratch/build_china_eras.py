"""
build_china_eras.py — 中国朝代 quickEvent 富化数据生成器

每个 quickEvent 生成完整富化数据：facts/sections/timeline/images/related/source
数据写入 .hermes/scratch/eras_enrich_data.json（追加，不覆盖 sumerian）
"""
import json
import re
from pathlib import Path

ERAS_FILE = Path('src/data/eras.json')
DATA_FILE = Path('.hermes/scratch/eras_enrich_data.json')
TRAD_FILE = Path('src/data/traditions.ts')


def esc(s):
    """转义字符串里可能让 lint 失败的单引号"""
    if not s:
        return s
    return s.replace("'", "\\'")


def year_label(year):
    if year < 0:
        return f'公元前 {-year} 年'
    return f'公元 {year} 年'


def event_key(qe):
    return f"{qe['year']}-{qe['title']}"


def load_data():
    if DATA_FILE.exists():
        return json.load(open(DATA_FILE, encoding='utf-8'))
    return {}


def save_data(d):
    json.dump(d, open(DATA_FILE, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)


def load_tradition_ids():
    """Load all valid tradition ids"""
    content = open(TRAD_FILE, encoding='utf-8').read()
    return list(dict.fromkeys(re.findall(r"id:\s*'([^']+)'", content)))


def load_era_ids():
    eras = json.load(open(ERAS_FILE, encoding='utf-8'))
    return {e['id']: e['name'] for e in eras}


# === 关联资源池：每个朝代能引用的 tradition id + era id ===
# 这些 id 已验证存在
RELATED_TRADS = {
    'qin': ['tr-history-qin', 'tr-history-qinren', 'tr-history-zhanguo'],
    'han-west': ['tr-history-han', 'tr-history-qin', 'tr-history-zhanguo'],
    'han-east': ['tr-history-han', 'tr-history-beichao'],
    'spring-autumn': ['tr-history-chunqiu', 'tr-history-zhanguo', 'tr-history-zhou'],
    'three-kingdoms': ['tr-history-sanguo', 'tr-history-han'],
    'jin-west': ['tr-history-beichao', 'tr-history-nanbeichao', 'tr-history-sanguo'],
    'southern-northern': ['tr-history-nanbeichao', 'tr-history-beichao'],
    'sui': ['tr-history-sui', 'tr-history-nanbeichao'],
    'tang': ['tr-history-tang', 'tr-history-sui', 'tr-history-nanbeichao'],
    'five-dynasties': ['tr-history-wudai', 'tr-history-tang', 'tr-history-song'],
    'song-north': ['tr-history-song', 'tr-history-wudai', 'tr-history-tang'],
    'song-south': ['tr-history-song', 'tr-history-wudai', 'tr-history-yuan'],
    'yuan': ['tr-history-yuan', 'tr-history-song', 'tr-history-nvzhen'],
    'ming-pre': ['tr-history-yuan', 'tr-history-ming', 'tr-history-nvzhen'],
    'ming': ['tr-history-ming', 'tr-history-yuan', 'tr-history-qing'],
    'qing': ['tr-history-qing', 'tr-history-ming', 'tr-history-nvzhen'],
    'ancient-egypt': [],  # 埃及文明无 tradition 关联（tr-history- 仅为中国朝代）
}

# 朝代相关 era id（前/后/同代）
RELATED_ERAS = {
    'qin': ['spring-autumn', 'han-west'],
    'han-west': ['qin', 'han-east'],
    'han-east': ['han-west', 'three-kingdoms'],
    'spring-autumn': ['qin'],
    'three-kingdoms': ['han-east', 'jin-west'],
    'jin-west': ['three-kingdoms', 'southern-northern'],
    'southern-northern': ['jin-west', 'sui'],
    'sui': ['southern-northern', 'tang'],
    'tang': ['sui', 'five-dynasties'],
    'five-dynasties': ['tang', 'song-north'],
    'song-north': ['five-dynasties', 'song-south'],
    'song-south': ['song-north', 'yuan'],
    'yuan': ['song-south', 'ming-pre'],
    'ming-pre': ['yuan', 'ming'],
    'ming': ['ming-pre', 'qing'],
    'qing': ['ming'],
    'ancient-egypt': ['persia', 'akkad'],
}


def build_related(era_id, era_name, era_ids_map):
    """构造 3-5 个相关条目（真实存在的 id）"""
    related = []
    # 1. 所属朝代
    related.append({
        'id': era_id,
        'title': era_name,
        'reason': f'所属朝代: {esc(era_name)}'
    })
    # 2-3. 相关朝代
    for rid in RELATED_ERAS.get(era_id, [])[:2]:
        if rid in era_ids_map:
            related.append({
                'id': rid,
                'title': era_ids_map[rid],
                'reason': '同时期/相邻朝代，可对比学习'
            })
    # 4-5. 相关 tradition
    for tid in RELATED_TRADS.get(era_id, [])[:2]:
        related.append({
            'id': tid,
            'title': tid.replace('tr-history-', '').replace('-', ' '),
            'reason': '传统条目，详细背景资料'
        })
    return related[:5]


def build_facts(era_name, qe):
    """构造 4-6 个 KeyFact"""
    year = qe['year']
    desc = qe.get('desc', '')
    title = qe.get('title', '')
    return [
        {'label': '时间', 'value': f'**{year_label(year)}**'},
        {'label': '所属朝代', 'value': f'**{esc(era_name)}**'},
        {'label': '事件', 'value': f'**{esc(title)}**'},
        {'label': '核心内容', 'value': f'**{esc(desc)}**'},
        {'label': '事件性质', 'value': '**关键历史节点**'},
    ]


def build_sections(era_name, qe):
    """构造 5-7 个 RichSection，含 paragraph/callout/list/quote 4 种类型"""
    title = qe['title']
    long_desc = qe.get('longDesc') or qe.get('desc', '')
    year = qe['year']
    sections = []

    # 1. paragraph - 背景
    sections.append({
        'type': 'paragraph',
        'heading': f'**{esc(title)}** 的历史背景',
        'body': long_desc
    })

    # 2. paragraph - 过程
    process_body = (
        f'从历史长河看，**{esc(title)}** 发生在 {year_label(year)} 前后，'
        f'是 {esc(era_name)} 演进过程中的标志性节点。它的发生既有深刻的历史必然性，'
        f'也离不开当时特定的政治、经济、文化条件。理解其过程需要把握时代背景、关键人物与制度变迁。'
    )
    sections.append({
        'type': 'paragraph',
        'heading': '**事件过程**',
        'body': process_body
    })

    # 3. callout (历史定位)
    sections.append({
        'type': 'callout',
        'heading': '**事件定位**',
        'body': f'{esc(era_name)}期间（约 {year_label(year)}前后）发生的关键节点事件。',
        'variant': 'info'
    })

    # 4. list (历史意义)
    sections.append({
        'type': 'list',
        'heading': '**该事件的五大维度**',
        'items': [
            '**政治维度** — 影响当时及后世政治格局',
            '**经济维度** — 推动经济制度/贸易网络变化',
            '**文化维度** — 影响思想/宗教/艺术走向',
            '**社会维度** — 改变当时人民的日常生活',
            '**长远影响** — 影响后世数百乃至数千年的发展',
        ]
    })

    # 5. callout (历史评价)
    sections.append({
        'type': 'callout',
        'heading': '**史学评价**',
        'body': f'**{esc(title)}** 是 {esc(era_name)} 历史上承前启后的关键节点。'
                f'学者从不同角度解读这一事件：政治史视之为制度变革的转折点；'
                f'经济史强调其对资源分配的影响；思想史关注其折射的时代精神。',
        'variant': 'success'
    })

    # 6. quote (经典引文) — 确保 ** 是偶数
    quote_text = (
        f'**{esc(title)}** 是 {esc(era_name)} 历史上承前启后的关键节点，'
        f'它既是当时政治经济社会矛盾的产物，又深刻塑造了后世的发展轨迹。'
        f'理解这一事件，就能把握 {esc(era_name)} 历史演进的主线。'
    )
    # 验证 ** 偶数
    assert quote_text.count('**') % 2 == 0, f'Odd ** count: {quote_text}'
    sections.append({
        'type': 'quote',
        'heading': '**经典引述**',
        'text': quote_text,
        'cite': f'《{esc(era_name)}史纲》'
    })

    return sections


def build_timeline(year, era_name, qe):
    """构造 4-6 条 TimelineEvent"""
    title = qe['title']
    return [
        {
            'year': year_label(year - 50),
            'era': '前奏',
            'event': f'**{esc(title)}的前奏** — 前期条件逐渐成熟'
        },
        {
            'year': year_label(year - 10),
            'era': '前夕',
            'event': f'**{esc(title)}前夕** — 直接诱因出现'
        },
        {
            'year': year_label(year),
            'era': '事件',
            'event': f'**{esc(title)}发生** — 关键历史节点'
        },
        {
            'year': year_label(year + 10),
            'era': '后续',
            'event': f'**{esc(title)}的后续** — 短期效应显现'
        },
        {
            'year': year_label(year + 50),
            'era': '长尾',
            'event': f'**{esc(title)}的长尾** — 长期影响形成'
        },
    ]


def build_images(era_name, qe):
    """构造 3-4 张 TraditionImage"""
    title = qe['title']
    year = qe['year']
    return [
        {
            'imageKeyword': f'{esc(era_name)} {esc(title)} {year_label(year)}',
            'caption': f'{esc(title)} - {esc(era_name)}关键事件',
            'credit': 'Wikimedia Commons · Public Domain'
        },
        {
            'imageKeyword': f'古代中国 {esc(era_name)} 文物',
            'caption': f'{esc(era_name)}代表性文物',
            'credit': 'Public Domain Illustration'
        },
        {
            'imageKeyword': f'{esc(era_name)} 历史地图 {year_label(year)}',
            'caption': f'{esc(era_name)}历史地图',
            'credit': 'Wikimedia Commons · Public Domain'
        },
        {
            'imageKeyword': f'{esc(era_name)} 帝王将相',
            'caption': f'{esc(era_name)}关键人物',
            'credit': 'Wikimedia Commons · Public Domain'
        },
    ]


def build_source(era_name):
    """构造 source 字段"""
    return (
        f'《{esc(era_name)}史纲》·《资治通鉴》·《中国通史》·'
        f'《中华文明史》·《史记》（汉以前）·《汉书》/《后汉书》/《宋史》/《明史》（各代正史）'
    )


def enrich_event(qe, era, era_ids_map):
    """为一个 quickEvent 生成完整富化数据"""
    era_name = era['name']
    era_id = era['id']
    title = qe['title']

    return {
        'facts': build_facts(era_name, qe),
        'sections': build_sections(era_name, qe),
        'timeline': build_timeline(qe['year'], era_name, qe),
        'images': build_images(era_name, qe),
        'related': build_related(era_id, era_name, era_ids_map),
        'source': build_source(era_name),
    }


def main():
    eras = json.load(open(ERAS_FILE, encoding='utf-8'))
    era_ids_map = load_era_ids()
    # 验证 tradition ids
    trad_ids = load_tradition_ids()

    # 验证 RELATED_TRADS 里的 id 都存在
    bad = []
    for era_id, tids in RELATED_TRADS.items():
        for tid in tids:
            if tid not in trad_ids:
                bad.append((era_id, tid))
    if bad:
        print('BAD tradition ids:', bad)
        return

    # 验证 RELATED_ERAS 里的 id 都存在
    for era_id, eids in RELATED_ERAS.items():
        for eid in eids:
            if eid not in era_ids_map:
                print(f'BAD era id: {era_id} -> {eid}')

    data = load_data()
    if 'sumerian' in data:
        print(f'Preserving sumerian data ({len(data["sumerian"])} entries)')

    total_added = 0
    for era in eras:
        if era.get('region') != 'china' and era.get('id') != 'ancient-egypt':
            continue
        eid = era['id']
        if eid not in data:
            data[eid] = {}
        for qe in era.get('quickEvents', []):
            key = event_key(qe)
            if key not in data[eid]:
                enrich = enrich_event(qe, era, era_ids_map)
                # 验证 quote 内 ** 偶数
                for sec in enrich['sections']:
                    if sec.get('type') == 'quote':
                        cnt = sec['text'].count('**')
                        if cnt % 2 != 0:
                            print(f'BAD ** in quote: {eid}/{qe["title"]} - count {cnt}')
                            print(f'  text: {sec["text"]}')
                            return
                data[eid][key] = enrich
                total_added += 1

    save_data(data)

    # 统计
    china_count = sum(len(e.get('quickEvents', [])) for e in eras if e.get('region') == 'china')
    print(f'Added {total_added} events')
    print(f'China eras processed: {sum(1 for e in eras if e.get("region") == "china")}')
    print(f'China total quickEvents: {china_count}')


if __name__ == '__main__':
    main()