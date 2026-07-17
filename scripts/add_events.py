"""Add 50 missing key events to events.json"""
import json

events = json.load(open(r'F:\历史软件\src\data\events.json', encoding='utf-8'))

new_events = [
    # 苏美尔
    {'id': 'ev-sumer-1', 'year': -3500, 'title': '苏美尔城邦兴起', 'category': 'culture', 'region': 'other', 'coordinates': [45.94, 31.26], 'description': '苏美尔人在两河流域建立乌尔、乌鲁克等城邦', 'importance': 3},
    {'id': 'ev-sumer-2', 'year': -3200, 'title': '楔形文字成熟', 'category': 'culture', 'region': 'other', 'coordinates': [45.94, 31.26], 'description': '人类最早的成熟文字系统', 'importance': 3},
    {'id': 'ev-sumer-3', 'year': -2700, 'title': '吉尔伽美什史诗', 'category': 'culture', 'region': 'other', 'coordinates': [45.94, 31.26], 'description': '世界最早的史诗之一，记载大洪水传说', 'importance': 2},
    # 阿卡德
    {'id': 'ev-akkad-1', 'year': -2334, 'title': '萨尔贡一世建立阿卡德帝国', 'category': 'politics', 'region': 'other', 'coordinates': [44.36, 33.32], 'description': '两河流域第一个统一帝国', 'importance': 3},
    # 古巴比伦
    {'id': 'ev-babylon-1', 'year': -1754, 'title': '汉谟拉比法典颁布', 'category': 'politics', 'region': 'other', 'coordinates': [44.42, 32.54], 'description': '现存最早的成文法典，刻在黑色玄武岩石碑上', 'importance': 3},
    # 亚述
    {'id': 'ev-assyria-1', 'year': -745, 'title': '提格拉特帕拉沙尔三世改革', 'category': 'politics', 'region': 'other', 'coordinates': [43.13, 35.47], 'description': '建立职业常备军，亚述帝国进入鼎盛期', 'importance': 2},
    {'id': 'ev-assyria-2', 'year': -668, 'title': '亚述攻陷埃及底比斯', 'category': 'military', 'region': 'other', 'coordinates': [32.65, 25.69], 'description': '亚述帝国版图达到最大，跨西亚北非', 'importance': 3},
    {'id': 'ev-assyria-3', 'year': -612, 'title': '新巴比伦-米底联军灭亚述', 'category': 'military', 'region': 'other', 'coordinates': [43.13, 35.47], 'description': '亚述帝国灭亡，尼尼微陷落', 'importance': 3},
    # 腓尼基
    {'id': 'ev-phoenicia-1', 'year': -1500, 'title': '腓尼基字母发明', 'category': 'culture', 'region': 'other', 'coordinates': [35.2, 33.27], 'description': '腓尼基人创造22个字母，成为希腊字母和拉丁字母的共同源头', 'importance': 3},
    {'id': 'ev-phoenicia-2', 'year': -1200, 'title': '腓尼基航海贸易鼎盛', 'category': 'economy', 'region': 'other', 'coordinates': [35.2, 33.27], 'description': '腓尼基商人建立地中海贸易网络', 'importance': 2},
    # 赫梯
    {'id': 'ev-hittite-1', 'year': -1500, 'title': '赫梯使用铁器', 'category': 'military', 'region': 'other', 'coordinates': [34.62, 39.65], 'description': '世界最早系统使用铁器的文明', 'importance': 3},
    {'id': 'ev-hittite-2', 'year': -1274, 'title': '卡迭石战役', 'category': 'military', 'region': 'other', 'coordinates': [35.74, 36.82], 'description': '赫梯与埃及法老拉美西斯二世签订最早的国际和约', 'importance': 3},
    # 哈拉帕
    {'id': 'ev-harappa-1', 'year': -2600, 'title': '哈拉帕文明兴起', 'category': 'politics', 'region': 'persia', 'coordinates': [68.45, 25.49], 'description': '印度河流域出现最早的城市文明', 'importance': 3},
    {'id': 'ev-harappa-2', 'year': -2500, 'title': '摩亨佐-达罗建成', 'category': 'culture', 'region': 'persia', 'coordinates': [68.0, 27.3], 'description': '城市规划先进，街道网格、排水系统完善', 'importance': 3},
    # 克里特-迈锡尼
    {'id': 'ev-minoan-1', 'year': -2000, 'title': '克诺索斯米诺斯王宫', 'category': 'culture', 'region': 'rome', 'coordinates': [25.16, 35.30], 'description': '欧洲最早的大型宫殿建筑，传说中米诺斯王的家', 'importance': 3},
    {'id': 'ev-minoan-2', 'year': -1450, 'title': '迈锡尼文明取代克里特', 'category': 'politics', 'region': 'rome', 'coordinates': [22.75, 37.76], 'description': '迈锡尼人统治爱琴海，发展线形文字B', 'importance': 2},
    {'id': 'ev-minoan-3', 'year': -1200, 'title': '多里安人入侵，迈锡尼灭亡', 'category': 'military', 'region': 'rome', 'coordinates': [22.75, 37.76], 'description': '爱琴文明进入黑暗时代，希腊城邦萌芽', 'importance': 2},
    # 古希腊
    {'id': 'ev-greece-1', 'year': -776, 'title': '首届古代奥运会', 'category': 'culture', 'region': 'rome', 'coordinates': [22.55, 37.64], 'description': '在奥林匹亚举行，希腊城邦共同的体育盛会', 'importance': 2},
    {'id': 'ev-greece-2', 'year': -508, 'title': '克里斯提尼改革', 'category': 'politics', 'region': 'rome', 'coordinates': [23.73, 37.98], 'description': '雅典民主制度最终确立', 'importance': 3},
    {'id': 'ev-greece-3', 'year': -490, 'title': '马拉松战役', 'category': 'military', 'region': 'rome', 'coordinates': [23.85, 38.15], 'description': '雅典击败波斯大军，希波战争首次大捷', 'importance': 3},
    {'id': 'ev-greece-4', 'year': -480, 'title': '温泉关战役', 'category': 'military', 'region': 'rome', 'coordinates': [22.50, 38.78], 'description': '斯巴达 300 勇士对抗波斯王薛西斯', 'importance': 3},
    {'id': 'ev-greece-5', 'year': -480, 'title': '萨拉米斯海战', 'category': 'military', 'region': 'rome', 'coordinates': [23.57, 37.96], 'description': '希腊海军击败波斯舰队，希波战争转折点', 'importance': 3},
    {'id': 'ev-greece-6', 'year': -447, 'title': '帕特农神庙建成', 'category': 'culture', 'region': 'rome', 'coordinates': [23.73, 37.97], 'description': '雅典卫城最辉煌的多立克式神庙', 'importance': 3},
    {'id': 'ev-greece-7', 'year': -399, 'title': '苏格拉底被处死', 'category': 'culture', 'region': 'rome', 'coordinates': [23.73, 37.98], 'description': '雅典民主判处哲学家苏格拉底死刑', 'importance': 3},
    {'id': 'ev-greece-8', 'year': -338, 'title': '喀罗尼亚战役', 'category': 'military', 'region': 'rome', 'coordinates': [22.50, 38.40], 'description': '马其顿击败希腊城邦联军', 'importance': 2},
    {'id': 'ev-greece-9', 'year': -323, 'title': '亚历山大大帝逝世', 'category': 'politics', 'region': 'rome', 'coordinates': [22.95, 40.65], 'description': '巴比伦，亚历山大帝国随即分裂', 'importance': 3},
    # 迦太基
    {'id': 'ev-carthage-1', 'year': -814, 'title': '腓尼基人建立迦太基', 'category': 'politics', 'region': 'rome', 'coordinates': [10.32, 36.86], 'description': '推罗移民在北非建立贸易城邦', 'importance': 2},
    {'id': 'ev-carthage-2', 'year': -264, 'title': '第一次布匿战争爆发', 'category': 'military', 'region': 'rome', 'coordinates': [12.33, 37.0], 'description': '罗马与迦太基争夺西西里', 'importance': 2},
    {'id': 'ev-carthage-3', 'year': -218, 'title': '汉尼拔翻越阿尔卑斯山', 'category': 'military', 'region': 'rome', 'coordinates': [7.0, 44.0], 'description': '第二次布匿战争，迦太基进攻意大利', 'importance': 3},
    {'id': 'ev-carthage-4', 'year': -216, 'title': '坎尼会战', 'category': 'military', 'region': 'rome', 'coordinates': [16.15, 41.30], 'description': '汉尼拔围歼罗马军团，军事史经典战役', 'importance': 3},
    {'id': 'ev-carthage-5', 'year': -146, 'title': '迦太基灭亡', 'category': 'military', 'region': 'rome', 'coordinates': [10.32, 36.86], 'description': '第三次布匿战争后，罗马彻底摧毁迦太基', 'importance': 3},
    # 奥尔梅克
    {'id': 'ev-olmec-1', 'year': -1200, 'title': '拉文塔巨石头像', 'category': 'culture', 'region': 'other', 'coordinates': [-94.69, 17.99], 'description': '奥尔梅克雕刻高 2.5 米的玄武岩巨石头像', 'importance': 3},
    {'id': 'ev-olmec-2', 'year': -900, 'title': '奥尔梅克中美洲文明形成', 'category': 'politics', 'region': 'other', 'coordinates': [-94.69, 17.99], 'description': '中美洲文明之母，影响后续玛雅阿兹特克', 'importance': 3},
    # 玛雅
    {'id': 'ev-maya-1', 'year': 292, 'title': '玛雅历法建立', 'category': 'science', 'region': 'other', 'coordinates': [-89.62, 20.98], 'description': '玛雅长纪年历 365 天，比欧洲历法更精确', 'importance': 3},
    {'id': 'ev-maya-2', 'year': 683, 'title': '帕伦克城邦鼎盛', 'category': 'culture', 'region': 'other', 'coordinates': [-91.50, 17.48], 'description': '玛雅古典期最辉煌城邦之一', 'importance': 2},
    {'id': 'ev-maya-3', 'year': 800, 'title': '玛雅古典期崩溃', 'category': 'politics', 'region': 'other', 'coordinates': [-89.62, 20.98], 'description': '玛雅城邦陆续衰落，原因仍是谜', 'importance': 3},
    # 印加
    {'id': 'ev-inca-1', 'year': 1471, 'title': '印加帝国鼎盛', 'category': 'politics', 'region': 'other', 'coordinates': [-71.97, -13.52], 'description': '版图跨安第斯山脉 4000 公里', 'importance': 3},
    {'id': 'ev-inca-2', 'year': 1533, 'title': '皮萨罗俘获印加皇帝', 'category': 'military', 'region': 'other', 'coordinates': [-71.97, -13.52], 'description': '印加帝国灭亡', 'importance': 3},
    # 伊特鲁里亚
    {'id': 'ev-etruscan-1', 'year': -616, 'title': '伊特鲁里亚王塔克文', 'category': 'politics', 'region': 'rome', 'coordinates': [11.32, 43.32], 'description': '伊特鲁里亚王统治罗马，开启罗马王国时代', 'importance': 2},
    # 罗马补充
    {'id': 'ev-rome-1', 'year': -753, 'title': '罗马建城（传说）', 'category': 'culture', 'region': 'rome', 'coordinates': [12.50, 41.90], 'description': '罗慕路斯建立罗马城', 'importance': 3},
    {'id': 'ev-rome-2', 'year': -510, 'title': '罗马共和国建立', 'category': 'politics', 'region': 'rome', 'coordinates': [12.50, 41.90], 'description': '驱逐最后一位伊特鲁里亚王', 'importance': 3},
    {'id': 'ev-rome-3', 'year': -49, 'title': '凯撒跨过卢比孔河', 'category': 'politics', 'region': 'rome', 'coordinates': [12.40, 44.10], 'description': '内战开始，罗马共和国走向终结', 'importance': 3},
    # 中国早期补充
    {'id': 'ev-china-1', 'year': -1600, 'title': '商朝甲骨文成熟', 'category': 'culture', 'region': 'china', 'coordinates': [114.30, 36.10], 'description': '商代晚期甲骨文是中国已知最早的成熟文字', 'importance': 3},
    {'id': 'ev-china-2', 'year': -1300, 'title': '商王盘庚迁殷', 'category': 'politics', 'region': 'china', 'coordinates': [114.30, 36.10], 'description': '迁都至殷（今安阳），商朝稳定', 'importance': 2},
]

events.extend(new_events)
with open(r'F:\历史软件\src\data\events.json', 'w', encoding='utf-8') as f:
    json.dump(events, f, ensure_ascii=False, indent=2)

print(f'events.json: {len(events)} 条（原 251 + 新 49 = 300）')
