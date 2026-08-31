"""Build housing data with clean syntax. Imports cleanly."""
import json
from pathlib import Path

HOU = {}

HOU['tr-hou-intro'] = {
    'facts': [
        {'label': '主题', 'value': '**中华建筑 — 天人合一的艺术**'},
        {'label': '起源', 'value': '**原始巢居、穴居**'},
        {'label': '核心典籍', 'value': '**《营造法式》《工程做法则例》**'},
        {'label': '特点', 'value': '**木构为主、院落式布局**'},
        {'label': '体系', 'value': '**六大建筑类型**'},
        {'label': '影响', 'value': '**"建筑是凝固的音乐"**'},
    ],
    'sections': [
        {'type': 'paragraph', 'heading': '中华建筑为何独特？',
         'body': '中华建筑是世界三大建筑体系之一。特点：第一，木构为主；第二，院落式布局；第三，屋顶优美；第四，园林结合；第五，"天人合一"哲学。'},
        {'type': 'callout', 'heading': '为什么中华建筑是"凝固的音乐"？',
         'body': '中华建筑是"凝固的音乐"。原因：第一，节奏 — 建筑有节奏；第二，韵律 — 屋顶、飞檐、斗拱有韵律；第三，和谐 — 建筑与自然和谐；第四，时间 — 建筑经历时间；第五，文化 — 体现中华美学。',
         'variant': 'info'},
        {'type': 'paragraph', 'heading': '为什么"木构"是中华建筑的特点？',
         'body': '"木构"是中华建筑特点。原因：第一，材料丰富；第二，工艺发达（榫卯、斗拱）；第三，抗震性能好；第四，易于改造；第五，体现"天人合一"。'},
        {'type': 'list', 'heading': '中华建筑的六大类型', 'items': [
            '**宫殿** — 帝王（北京故宫）',
            '**陵墓** — 帝王陵寝（秦始皇陵）',
            '**宗教** — 寺庙、塔（佛光寺）',
            '**民居** — 百姓住宅（四合院）',
            '**园林** — 江南私家（拙政园）',
            '**军事** — 长城、城池',
        ]},
        {'type': 'paragraph', 'heading': '为什么中华建筑在 21 世纪仍重要？',
         'body': '中华建筑在 21 世纪仍重要。原因：第一，文化载体；第二，世界文化遗产（故宫、长城等）；第三，影响海外华人建筑；第四，传承传统建筑语言；第五，文化建筑是旅游核心。'},
        {'type': 'quote', 'text': '**建筑是凝固的音乐**。', 'cite': '歌德'},
    ],
    'timeline': [
        {'year': 'BC 5000', 'era': '新石器', 'event': '**穴居**（半坡遗址）'},
        {'year': 'BC 3000', 'era': '传说', 'event': '**"有巢氏"**巢居'},
        {'year': 'BC 1000', 'era': '西周', 'event': '**四合院**雏形'},
        {'year': 'BC 200', 'era': '西汉', 'event': '**木构建筑**成熟'},
        {'year': 'AD 700', 'era': '唐', 'event': '**佛光寺**（东大殿）'},
        {'year': 'AD 1100', 'era': '宋', 'event': '**《营造法式》**（李诫）'},
        {'year': 'AD 1400', 'era': '明', 'event': '**故宫**建造'},
        {'year': 'AD 1700', 'era': '清', 'event': '**《工程做法则例》**'},
    ],
    'images': [
        {'imageKeyword': 'chinese ancient architecture palace', 'caption': '中华建筑', 'credit': 'photo tradition'},
        {'imageKeyword': 'forbidden city beijing', 'caption': '北京故宫', 'credit': 'photo tradition'},
        {'imageKeyword': 'chinese traditional siheyuan courtyard', 'caption': '四合院（民居）', 'credit': 'photo tradition'},
    ],
    'related': [
        {'id': 'tr-hou-citydef', 'title': '城池与防御', 'reason': '城池是建筑类型'},
        {'id': 'tr-hou-pagoda', 'title': '佛塔', 'reason': '宗教建筑'},
        {'id': 'tr-hou-garden', 'title': '园林', 'reason': '园林是建筑类型'},
        {'id': 'tr-hou-courtyard', 'title': '四合院', 'reason': '民居代表'},
        {'id': 'tr-hou-capital', 'title': '都城规划', 'reason': '都城规划'},
        {'id': 'tr-hou-fengshui', 'title': '风水', 'reason': '建筑与风水'},
    ],
    'source': '《营造法式》（宋·李诫）·《工程做法则例》（清·工部）·《中国建筑史》（梁思成）·《华夏意匠》（李允鉌）',
}