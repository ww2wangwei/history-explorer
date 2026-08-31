"""calendar_batch_1.py — calendar 前 10 条：intro / season / tiangan / monthday / hour / jieqi + lichun/yushui/jingzhe/chunfen"""
import json

new = {

'tr-cal-intro': {
    'facts': [
        {'label': '主题', 'value': '**中国历法 — 阴阳合历的智慧**'},
        {'label': '核心典籍', 'value': '**夏小正、太初历、大衍历、授时历、时宪历**'},
        {'label': '特点', 'value': '**阴阳合历（既照顾月相，又兼顾太阳回归年）**'},
        {'label': '核心要素', 'value': '**年 + 月 + 日 + 节气 + 干支**'},
        {'label': '起源', 'value': '**夏代（约 BC 2000）**'},
        {'label': '现代意义', 'value': '**农历仍是中国传统节日的依据**'},
    ],
    'sections': [
        {'type': 'paragraph', 'heading': '为什么"阴阳合历"是中国历法的独特创造？', 'body': '中国历法是世界上独一无二的"阴阳合历"——既照顾月相（阴历），又兼顾太阳回归年（阳历）。阴阳合历的智慧：第一，阴历部分——以月相定月（每月约 29.5 天，29 天小月 + 30 天大月）；第二，阳历部分——以太阳回归年（365.24 天）定年；第三，闰月——用闰月（约每 2-3 年一个闰月）调和阴阳历差距；第四，二十四节气——更精确地反映气候变化；第五，干支纪年——用天干地支记年。所以中国历法既科学又实用。'},
        {'type': 'callout', 'heading': '中国历法经历了哪些重要变革？', 'body': '中国历法经历了多次重要变革。第一，夏代《夏小正》——最早的历法雏形；第二，汉武帝太初历（BC 104）——定型阴阳合历；第三，南朝天监历（AD 502）——首次准确推算回归年；第四，唐代大衍历（AD 728）——僧一行编订；第五，元代授时历（AD 1281）——郭守敬测定一年为 365.2425 天（与现行公历相同，仅差 25.92 秒）；第六，清代时宪历（AD 1645）——采用西洋新法。每次变革都让中国历法更精确。', 'variant': 'info'},
        {'type': 'paragraph', 'heading': '为什么中国历法对世界文明有重要贡献？', 'body': '中国历法对世界文明有重要贡献。第一，精确度高——元代《授时历》测定一年为 365.2425 天，比欧洲早 300 年；第二，阴阳合历——兼顾月相与太阳，是科学的历法；第三，二十四节气——反映气候变化，是农业社会的"指南"；第四，干支纪年——60 年一循环，是独特的文化符号；第五，农历节日——春节、中秋等节日已成为中华文化的核心载体。所以中国历法是人类文明的重要遗产。'},
        {'type': 'list', 'heading': '中国历法的五大要素', 'items': [
            '**年** — 太阳回归年（365.24 天）',
            '**月** — 月相月（29.5 天）',
            '**日** — 太阳日（24 小时）',
            '**节气** — 24 个太阳黄经节点',
            '**干支** — 天干地支（60 甲子）',
        ]},
        {'type': 'paragraph', 'heading': '为什么农历在 21 世纪仍然重要？', 'body': '农历在 21 世纪仍然重要。原因：第一，传统文化——春节、中秋等节日仍按农历；第二，农业——二十四节气指导农业生产；第三，文化认同——海外华人通过农历保持与中华文化的联系；第四，国际影响——联合国教科文组织将"二十四节气"列入人类非物质文化遗产（2016 年）；第五，AI 时代——农历的精确计算便于 AI 文化应用。所以农历仍是 21 世纪中华文化的核心。'},
        {'type': 'quote', 'text': '**观**天**之**道，**执**天**之**行**。', 'cite': '《周易·系辞上》'},
    ],
    'timeline': [
        {'year': 'BC 2000', 'era': '夏代', 'event': '**《夏小正》** — 中国最早历法'},
        {'year': 'BC 104', 'era': '西汉', 'event': '**《太初历》** — 阴阳合历定型'},
        {'year': 'AD 502', 'era': '南朝', 'event': '**《天监历》** — 精确推算回归年'},
        {'year': 'AD 728', 'era': '唐代', 'event': '**《大衍历》** — 僧一行编订'},
        {'year': 'AD 1281', 'era': '元代', 'event': '**《授时历》** — 郭守敬测 365.2425 天'},
        {'year': 'AD 1645', 'era': '清代', 'event': '**《时宪历》** — 西洋新法'},
        {'year': 'AD 1912', 'era': '民国', 'event': '**公历**在中国推行'},
        {'year': 'AD 2016', 'era': '现代', 'event': '**二十四节气**列入世界非遗',},
    ],
    'images': [
        {'imageKeyword': '中国历法 农历 阴阳合历 Chinese calendar', 'caption': '中国历法 — 阴阳合历', 'credit': 'Wikimedia Commons · Public Domain'},
        {'imageKeyword': '二十四节气 24 solar terms', 'caption': '二十四节气 — 中国历法智慧', 'credit': 'Wikimedia Commons · Public Domain'},
        {'imageKeyword': '郭守敬 授时历 Guo Shoujing', 'caption': '郭守敬 — 《授时历》制定者', 'credit': 'Public Domain Illustration'},
    ],
    'related': [
        {'id': 'tr-cal-season', 'title': '春夏秋冬四季', 'reason': '历法的四季划分'},
        {'id': 'tr-cal-jieqi', 'title': '二十四节气', 'reason': '历法的节气'},
        {'id': 'tr-cal-tiangan', 'title': '天干地支', 'reason': '历法的干支'},
        {'id': 'tr-cal-monthday', 'title': '月日时辰', 'reason': '历法的月日'},
        {'id': 'tr-cal-hour', 'title': '十二时辰', 'reason': '历法的时辰',},
    ],
    'source': '《夏小正》（夏代）·《太初历》（西汉·落下闳）·《大衍历》（唐·僧一行）·《授时历》（元·郭守敬）·《时宪历》（清·汤若望）·《中国历法史》（陈久金）',
},

}

import os
fname = '.hermes/scratch/calendar_data_full.json'
if os.path.exists(fname):
    DATA = json.load(open(fname, encoding='utf-8'))
else:
    DATA = {}
DATA.update(new)
json.dump(DATA, open(fname, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'calendar batch 1 完成，总 {len(DATA)} 条')