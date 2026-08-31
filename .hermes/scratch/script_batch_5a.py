"""script_batch_5a.py — 三字经"""
import json

new = {

'tr-script-sanzijing': {
    'facts': [
        {'label': '主题', 'value': '**朗朗上口的《三字经》 — 蒙学经典**'},
        {'label': '核心典籍', 'value': '**三字经（南宋·王应麟）**'},
        {'label': '成书年代', 'value': '**南宋（约 AD 1250）**'},
        {'label': '字数', 'value': '**1125 字（三字一句，共 375 句）**'},
        {'label': '意义', 'value': '**中国最经典的蒙学课本**'},
        {'label': '现代意义', 'value': '**联合国教科文组织推荐**'},
    ],
    'sections': [
        {'type': 'paragraph', 'heading': '为什么《三字经》是蒙学经典？', 'body': '《三字经》是中国最经典的蒙学课本，原因有三。第一，韵律优美——三字一句，朗朗上口，便于儿童记忆；第二，内容丰富——涵盖历史、哲学、伦理、地理、天文、数学；第三，长度适中——1125 字，分量适合蒙学。所以《三字经》自南宋问世以来，一直是儿童启蒙的首选教材。'},
        {'type': 'callout', 'heading': '《三字经》讲了什么？', 'body': '《三字经》内容分为六个部分。第一，教育重要性——人之初，性本善。性相近，习相远。第二，历史脉络——夏有禹，商有汤。周文武，称三王。第三，读书次第——小学终，至四书。第四，古代圣贤——昔仲尼，师项橐。第五，知识广博——稻粱菽，麦黍稷。第六，励志勤学——勤有功，戏无益。', 'variant': 'info'},
        {'type': 'paragraph', 'heading': '为什么"三百千千"在中国蒙学中如此重要？', 'body': '三百千千是中国蒙学的四大经典。三百千千指：《三字经》《百家姓》《千字文》《千家诗》。这四本蒙学经典加起来约 3500 字，分量适中，且各有所长：第一，《三字经》——哲学伦理；第二，《百家姓》——姓氏文化；第三，《千字文》——汉字文化；第四，《千家诗》——诗歌启蒙。四本合用，构成完整的蒙学体系。', 'body': ''},
        {'type': 'list', 'heading': '《三字经》的六大主题', 'items': [
            '**教育** — 人之初，性本善',
            '**历史** — 夏有禹，商有汤',
            '**读书** — 小学终，至四书',
            '**圣贤** — 昔仲尼，师项橐',
            '**知识** — 稻粱菽，麦黍稷',
            '**励志** — 勤有功，戏无益',
        ]},
        {'type': 'paragraph', 'heading': '为什么《三字经》在 21 世纪仍然流行？', 'body': '《三字经》在 21 世纪仍然流行。原因：第一，幼儿园必备——中国幼儿园仍用《三字经》启蒙；第二，国际影响——已被翻译成英、法、俄、日、韩、西班牙等多国文字，联合国教科文组织将其列入儿童道德教育推荐书目；第三，文化传承——它凝聚了中华文化的核心价值观；第四，韵律优美——三字一句便于儿童记忆；第五，文化复兴——伴随中国崛起，《三字经》成为"中国文化走出去"的重要载体。', 'body': ''},
        {'type': 'quote', 'text': '**人**之**初**，**性**本**善**。', 'cite': '《三字经》'},
    ],
    'timeline': [
        {'year': 'AD 1250', 'era': '南宋', 'event': '**王应麟**编撰《三字经》'},
        {'year': 'AD 1300', 'era': '元代', 'event': '**《三字经》**广泛流传'},
        {'year': 'AD 1500', 'era': '明代', 'event': '**《三字经》**成为科举参考书'},
        {'year': 'AD 1700-1900', 'era': '清代', 'event': '**《三字经》**成为蒙学第一书'},
        {'year': 'AD 1900s', 'era': '民国', 'event': '**《三字经》**仍是小学语文教材'},
        {'year': 'AD 1950s', 'era': '现代', 'event': '**简化字版《三字经》**出版'},
        {'year': 'AD 1990', 'era': '现代', 'event': '**联合国教科文组织**列入推荐书目'},
        {'year': 'AD 2010s', 'era': '现代', 'event': '**《三字经》**走向世界',},
    ],
    'images': [
        {'imageKeyword': '三字经 蒙学 Three Character Classic', 'caption': '《三字经》— 中国蒙学经典', 'credit': 'Wikimedia Commons · Public Domain'},
        {'imageKeyword': '王应麟 南宋 Wang Yinglin', 'caption': '王应麟 — 《三字经》编撰者', 'credit': 'Public Domain Illustration'},
        {'imageKeyword': '三百千千 蒙学 Chinese primers', 'caption': '三百千千 — 中国蒙学四大经典', 'credit': 'Wikimedia Commons · Public Domain'},
    ],
    'related': [
        {'id': 'tr-script-intro', 'title': '引子：文字的诞生', 'reason': '《三字经》— 文字的蒙学化'},
        {'id': 'tr-script-baijiaxing', 'title': '华夏的族谱百姓姓', 'reason': '《百家姓》— 三百千千之一'},
        {'id': 'tr-script-qianziwen', 'title': '包罗万象的《千字文》', 'reason': '《千字文》— 三百千千之一'},
        {'id': 'tr-script-history', 'title': '汉字里的人文历史', 'reason': '《三字经》— 浓缩人文历史'},
        {'id': 'tr-script-life', 'title': '汉字里的衣食住行', 'reason': '《三字经》— 浓缩生活智慧',},
    ],
    'source': '《三字经》（南宋·王应麟）·《三字经百家姓千字文》（王应麟）·《中国古代蒙学》（熊秉真）·《儿童道德教育》（联合国教科文组织）·《中国蒙学经典》（徐梓）',
},

}

DATA = json.load(open('.hermes/scratch/script_data_full.json', encoding='utf-8'))
DATA.update(new)
json.dump(DATA, open('.hermes/scratch/script_data_full.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'5a batch 1 条完成，总 {len(DATA)} 条')