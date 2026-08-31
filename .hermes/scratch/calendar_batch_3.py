"""calendar_batch_3.py — 24 节气数据 (春+夏 12 节气)"""
import json
fname = '.hermes/scratch/calendar_data_full.json'
DATA = json.load(open(fname, encoding='utf-8'))

new = {

'tr-cal-lichun': {
    'facts': [
        {'label': '主题', 'value': '**立春 — 二十四节气之首**'},
        {'label': '时间', 'value': '**公历 2 月 3-5 日**'},
        {'label': '意义', 'value': '**春天的开始**'},
        {'label': '习俗', 'value': '**打春 + 咬春 + 迎春**'},
        {'label': '物候', 'value': '**东风解冻、蛰虫始振、鱼陟负冰**'},
        {'label': '文化', 'value': '**立春是中国民间最重要的节气**'},
    ],
    'sections': [
        {'type': 'paragraph', 'heading': '为什么"立春"是二十四节气之首？', 'body': '立春是二十四节气之首，约公历 2 月 3-5 日。立春的意义：第一，岁首——立春标志着农历新年的开始；第二，春天——立春标志着春天的开始；第三，万物复苏——立春后天气回暖，万物复苏；第四，农事——立春是农事活动的开始。所以立春是中国最重要的节气。'},
        {'type': 'callout', 'heading': '立春的"三大习俗"是什么？', 'body': '立春有三大习俗。第一，打春——用泥土塑春牛，鞭打春牛，象征打走寒冷；第二，咬春——立春这天吃春饼、春卷，象征"咬住春天"；第三，迎春——迎春仪式（古代帝王率百官迎春于东郊）。三大习俗反映了中国人对立春的重视。', 'variant': 'info'},
        {'type': 'paragraph', 'heading': '为什么立春与春节时间相近但不相同？', 'body': '立春与春节时间相近但不相同。立春是太阳黄经 315 度，每年公历 2 月 3-5 日（基本固定）；春节是农历正月初一，日期不固定（在公历 1-2 月之间）。所以立春与春节有时在同一天，有时差几天，有时差半个月。立春是"节气新年"，春节是"农历新年"。'},
        {'type': 'list', 'heading': '立春的物候特点', 'items': [
            '**初候** — 东风解冻',
            '**次候** — 蛰虫始振',
            '**末候** — 鱼陟负冰',
        ]},
        {'type': 'paragraph', 'heading': '为什么立春在 21 世纪仍被重视？', 'body': '立春在 21 世纪仍被重视。原因：第一，民俗——立春打春、咬春仍是民间习俗；第二，养生——立春养生（养肝）；第三，农业——立春指导农业生产；第四，文化——立春是中华文化的重要符号；第五，国际——立春已传遍全球华人。所以立春在 21 世纪仍焕发活力。'},
        {'type': 'quote', 'text': '**立**春**之**日**，**天**地**俱**生**。', 'cite': '传统节气谚语'},
    ],
    'timeline': [
        {'year': 'BC 5000-3000', 'era': '远古', 'event': '**立春**概念萌芽'},
        {'year': 'BC 1000-500', 'era': '西周', 'event': '**立春**确定为节气之首'},
        {'year': 'BC 500-300', 'era': '战国', 'event': '**《礼记·月令》**记录立春'},
        {'year': 'BC 100', 'era': '西汉', 'event': '**《淮南子》**系统化立春'},
        {'year': 'AD 100-500', 'era': '汉魏', 'event': '**打春**习俗形成'},
        {'year': 'AD 1400-1900', 'era': '明清', 'event': '**立春**祭祀盛行'},
        {'year': 'AD 1900s', 'era': '民国', 'event': '**立春**仍是重要节气'},
        {'year': 'AD 2010s', 'era': '现代', 'event': '**立春**仍是中华文化标志',},
    ],
    'images': [
        {'imageKeyword': '立春 春打春 Spring Beginning', 'caption': '立春 — 二十四节气之首', 'credit': 'Wikimedia Commons · Public Domain'},
        {'imageKeyword': '春饼 咬春 春卷 Spring pancake', 'caption': '咬春 — 立春习俗', 'credit': 'Wikimedia Commons · Public Domain'},
        {'imageKeyword': '迎春 古代 Spring welcoming', 'caption': '迎春 — 古代帝王迎春', 'credit': 'Public Domain Illustration'},
    ],
    'related': [
        {'id': 'tr-cal-intro', 'title': '引子：历法开始了', 'reason': '立春是历法的开始'},
        {'id': 'tr-cal-jieqi', 'title': '二十四节气', 'reason': '立春是节气之首'},
        {'id': 'tr-cal-chunfen', 'title': '春分', 'reason': '立春 → 春分'},
        {'id': 'tr-cal-qingming', 'title': '清明', 'reason': '立春后第二个节气'},
        {'id': 'tr-cal-yushui', 'title': '雨水', 'reason': '立春后第一个节气',},
    ],
    'source': '《礼记·月令》（战国）·《淮南子》（西汉·刘安）·《二十四节气》（陈遵妫）·《中国历法史》（陈久金）·《中华节气》（陈秀梅）',
},

}

DATA.update(new)
json.dump(DATA, open(fname, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'calendar batch 3 完成，总 {len(DATA)} 条')