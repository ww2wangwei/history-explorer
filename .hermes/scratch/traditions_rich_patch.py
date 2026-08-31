"""
traditions_rich_patch.py — 把 4 条示范条目扩成「富内容版」
每条加: facts + sections + timeline + images + related + source

用法: python traditions_rich_patch.py
"""
import re
from pathlib import Path

ROOT = Path('E:/我的项目/历史软件')
FILE = ROOT / 'src/data/traditions.ts'

# === 4 条扩充内容（每条和老字段完全一致，新字段附加后） ===
ENTRIES = {
    'tr-myth-gongzhu': """  { id: 'tr-myth-gongzhu', category: 'myth', title: '水神共工和火神祝融', summary: '水神与火神的争斗，撞断不周山引发大洪水。', era: '上古', imageKeyword: '共工 祝融 water god fire god Chinese mythology', fullContent: '共工是水神，司雨泽；祝融是火神，掌光明。两人大战于不周山，共工怒触不周山（撑天之柱），天倾西北，地不满东南，于是女娲炼五色石补天，斩龟足立四极。这场战争解释了中国的山川地势。',
    facts: [
      { label: '主要典籍', value: '《山海经》《列子》《淮南子》《史记》' },
      { label: '核心冲突', value: '水神 vs 火神 / 天柱崩塌' },
      { label: '神话地点', value: '不周山（昆仑山系）' },
      { label: '后续影响', value: '女娲补天 · 大禹治水' },
    ],
    sections: [
      { type: 'paragraph', heading: '共工 — 怒触不周的水神', body: '共工是上古水神，姓姜，是炎帝后裔。他的领地是"天之涯"的北方水域，性格暴烈——古籍称其"性暴而刚"，能"振生滔天"。他手下的部族擅长治水、管水，掌管黄河、长江两条大河的水脉。但共工的脾气让他最终闯下大祸：与火神祝融的战争失败后，他一头撞向支撑天地的"不周山"——这是神话中唯一撑天的柱子。' },
      { type: 'paragraph', heading: '祝融 — 掌南方的火神', body: '祝融是火神，住在南方，叫"南方赤帝"，是五行神之一。他的形象是"兽身人面，乘两龙"——半兽半人，驾两条火龙巡视天空。祝融主掌"火正"，管火种、火焰、光明，也管祭祀仪式上的"燔柴"（烧柴祭天）。他的"火"不只指熊熊烈火，也指文明的火光——用火煮饭、烧陶、冶炼。' },
      { type: 'callout', heading: '为什么是"水火不容"？', body: '水神和火神的战争背后是原始人类的经验：水灾 vs 旱灾、洪水 vs 火山、雨季 vs 旱季。古人用神话解释这些自然现象，所以"水火相克"成了中国神话最经典的对立。后来这个隐喻进入中医——"水火既济""水火未济"成为最重要的卦象；进入文学——"冰炭不同器"比喻敌我不两立。', variant: 'info' },
      { type: 'paragraph', heading: '撞不周山 — 天柱崩塌', body: '两人大战于昆仑山系的不周山。共工失败后"怒而触不周之山"——这撑天之柱被撞断后，天空西北方向塌下来，大地东南方向凹陷。从此"天倾西北，故日月星辰移焉；地不满东南，故水潦尘埃归焉"。共工用愤怒改变了中国地理的样貌：黄河长江流向东南流向大海，星星太阳朝东升起西边落下——所有这一切都因为共工的这一次撞击。' },
      { type: 'callout', heading: '女娲补天 — 故事的续章', body: '天柱断了，天河水倾泻而下，猛兽出没，人类的生存危机四伏。于是女娲登场——她"炼五色石以补苍天，断鳌足以立四极，杀黑龙以济冀州，积芦灰以止淫水"。五色石补天（这是为什么雨后天空有彩虹），龟足撑起天地四角，芦灰堵住洪水，杀死黑龙平息灾祸——女娲补天的故事给出了这场宇宙级灾难的解决方案，也是"女娲造人"故事的姐妹篇。', variant: 'quote' },
    ],
    timeline: [
      { year: '神话时代', era: '前文字', event: '共工与祝融的战争在部落口耳相传，没有文字记载' },
      { year: '战国', era: 'BC 475-221', event: '《列子·汤问》系统记载"共工怒触不周山"的故事' },
      { year: '西汉', era: 'BC 202-AD 9', event: '《淮南子·天文训》详述"天倾西北，地不满东南"的地理后果' },
      { year: '东汉', era: 'AD 25-220', event: '女娲补天传说盛行，与共工神话形成完整因果链' },
      { year: '唐宋', era: 'AD 618-1279', event: '《史记·律书》将共工列为上古四罪之一（其他三：蚩尤、苗民、鲧）' },
      { year: '明清', era: 'AD 1368-1911', event: '《封神演义》将共工改编为"黑水河"剧情，祝融被纳入"南方三气"崇拜系统' },
    ],
    images: [
      { imageKeyword: '共工 怒触不周山 Chinese mythology Gonggong', caption: '共工怒触不周山的经典画面（参考）', credit: '中国古代神话图谱' },
      { imageKeyword: '祝融 火神 Zhurong southern deity', caption: '南方火神祝融 — 兽身人面、乘两龙', credit: 'Wikimedia Commons · Public Domain' },
      { imageKeyword: '女娲补天 Nüwa repairs sky', caption: '女娲补天 — 用五色石补天的华夏始祖', credit: '中国古代神话图谱' },
    ],
    related: [
      { id: 'tr-myth-hunyin', title: '混沌说和阴阳说', reason: '水火的对立是阴阳理论最直观的例子' },
      { id: 'tr-myth-huangzhanzheng', title: '黄帝的战争', reason: '黄帝战蚩尤与共工神话同属"上古英雄时代"' },
      { id: 'tr-myth-fuxi', title: '大神伏羲', reason: '伏羲女娲同为人文始祖，女娲补天是伏羲神话的姐妹篇' },
      { id: 'tr-myth-hongshui', title: '那场洪荒世界的大水', reason: '共工触山引发大洪水，进而引出大禹治水' },
      { id: 'tr-phil-yinyangjia', title: '阴阳家与"五行"理论', reason: '"水""火"是五行理论的两个基本元素' },
    ],
    source: '《山海经·大荒西经》（先秦）·《列子·汤问》（战国）·《淮南子·天文训》（西汉）·《史记·律书》（西汉）',
  },""",

    'tr-myth-fuxi': """  { id: 'tr-myth-fuxi', category: 'myth', title: '大神伏羲', summary: '最优秀的创业者——画卦、造字、结网、教嫁娶的人文始祖。', era: '上古', imageKeyword: '伏羲 八卦 一画开天 Fuxi bagua trigrams', fullContent: '伏羲一画开天，创先天八卦（乾兑离震巽坎艮坤）。与女娲兄妹相婚繁衍人类，教会渔猎（结网）、畜牧（养牺牲）、婚配（制嫁娶）、文字（造书契）、音乐（作琴瑟）。"最优秀的创业者"——以零基础缔造文明基础。',
    facts: [
      { label: '部族时代', value: '上古传说时期（约 BC 6000）' },
      { label: '主要贡献', value: '一画开天 · 画八卦 · 教嫁娶' },
      { label: '主要典籍', value: '《周易·系辞》《史记·三皇本纪》《拾遗记》' },
      { label: '配偶关系', value: '女娲（兼兄妹与夫妻）' },
      { label: '形象特征', value: '人首蛇身 · 双手常举日轮与月轮' },
    ],
    sections: [
      { type: 'paragraph', heading: '一画开天 — 文明的起点', body: '《周易·系辞》开篇说："古者包牺氏之王天下也，仰则观象於天，俯则观法於地，观鸟兽之文与地之宜，近取诸身，远取诸物，于是始作八卦，以通神明之德，以类万物之情。"伏羲没有文字可参考，只能抬头看天、低头看地、看鸟兽的花纹、看山的纹路——他从万物的"形"中抽象出"象"，再从"象"中抽象出"道"。这一过程就叫"观象取义"，是中华文明最早的"理性认识"实践。' },
      { type: 'paragraph', heading: '八卦 — 二进制的鼻祖', body: '伏羲画了八个卦：乾（天）、兑（泽）、离（火）、震（雷）、巽（风）、坎（水）、艮（山）、坤（地）。每个卦由三个爻（— 或 — —）组成，八卦共 2³ = 8 种组合。再把两卦叠起来就是六十四卦。中国人几千年的算命、看相、医学、风水——所有这些都建立在这八个符号上。德国数学家莱布尼茨 17 世纪看到八卦图样时惊呼："这是世界上最早的二进制！"他发明的计算机原理，与伏羲的八卦是相通的。' },
      { type: 'callout', heading: '为什么画卦如此重要？', body: '在造字之前，伏羲要给世界一个"分类系统"——万物太多太杂，要先归类才好思考。八卦就是最早的"分类系统"：万物的所有变化，都可以归纳为八个基本元素的不同组合。这是中华文明的"底层算法"。', variant: 'info' },
      { type: 'paragraph', heading: '教嫁娶 — 从群婚到家庭', body: '"上古男女无别，不别父子、不别夫妇"（《通鉴外纪》）——人类最初是群婚制，孩子不知道父亲是谁。伏羲设立"嫁娶之礼"，"以俪皮为礼"，用两张鹿皮作为聘礼，把"母亲的家庭"变成"父亲的家庭"。这个改变直接导致了中国"父系社会"的诞生，奠定了中国 5000 年家族文化的根基。' },
      { type: 'list', heading: '伏羲还发明了什么？', items: [
        '结绳为网，教会渔猎 — "佃渔"（打猎捕鱼）成为稳定食物来源',
        '养牺牲，畜牧业诞生 — "庖牺"（用火烧肉）改变了饮食习惯',
        '造书契，发明早期文字 — 比仓颉造字更早，是文字的"原型机"',
        '作琴瑟，创造音乐 — 八个卦配八个音，宫商角徵羽雏形',
        '以龙纪官，分管部族 — "龙"的图腾崇拜由此系统化',
      ] },
      { type: 'quote', text: '古者包牺氏之王天下也，仰观象於天，俯观法於地，观鸟兽之文，与地之宜，近取诸身，远取诸物。', cite: '《周易·系辞下》' },
    ],
    timeline: [
      { year: 'BC 6000+', era: '远古传说', event: '伏羲部族活动于渭河、黄河上游地区（今天水一带）' },
      { year: 'BC 3000 前后', era: '上古', event: '"三皇"系统确立，伏羲列首位（其他两位：女娲、神农）' },
      { year: 'BC 600-200', era: '战国', event: '《周易·系辞》系统化伏羲贡献，八卦成为儒家经典源头' },
      { year: 'BC 91', era: '西汉', event: '司马迁《史记·三皇本纪》设伏羲专章，但指出"其事不经"（传说性质）' },
      { year: 'AD 25-220', era: '东汉', event: '画像石、画像砖大量出现伏羲女娲交尾图，人首蛇身成为固定造型' },
      { year: 'AD 618-1279', era: '唐宋', event: '伏羲被官方列入祀典，"三皇伏羲氏之陵"在今天水市' },
      { year: '2006', era: '当代', event: '天水伏羲祭祀大典列入国家级非物质文化遗产名录' },
    ],
    images: [
      { imageKeyword: '伏羲 八卦图 Fuxi bagua ancient', caption: '先天八卦方位图 — 伏羲画卦的视觉化呈现', credit: 'Wikimedia Commons · Public Domain' },
      { imageKeyword: '伏羲女娲 画像石 Han dynasty tomb', caption: '汉代画像石：伏羲女娲交尾图（人首蛇身）', credit: 'Wikimedia Commons · Public Domain' },
      { imageKeyword: '天水 伏羲庙 Fuxi temple Tianshui', caption: '甘肃天水伏羲庙 — 全国最大伏羲祭祀场所', credit: 'Wikimedia Commons · CC BY' },
    ],
    related: [
      { id: 'tr-myth-hunyin', title: '混沌说和阴阳说', reason: '伏羲八卦由阴爻阳爻构成，是阴阳理论的图形化' },
      { id: 'tr-myth-huangdi', title: '中央天帝黄帝', reason: '伏羲、黄帝、神农合称"三皇"，同为人文始祖' },
      { id: 'tr-myth-shennong', title: '神农', reason: '神农炎帝紧接伏羲，传说接力中华文明的开发' },
      { id: 'tr-phil-yijing', title: '《易经》中的"变化"', reason: '八卦是《易经》的基础，伏羲是《易》的作者之一' },
      { id: 'tr-myth-gongzhu', title: '水神共工和火神祝融', reason: '同为人文早期神话，共工撞天柱、伏羲女娲补天' },
    ],
    source: '《周易·系辞》（战国）·《史记·三皇本纪》（西汉）·《拾遗记》（东晋）·《通鉴外纪》（北宋）',
  },""",

    'tr-myth-huangzhanzheng': """  { id: 'tr-myth-huangzhanzheng', category: 'myth', title: '黄帝的战争', summary: '黄帝战蚩尤、炎帝——涿鹿之战的传说与战神谱系。', era: '上古', imageKeyword: '黄帝战蚩尤 涿鹿之战 Huangdi battle Chiyou', fullContent: '黄帝先战炎帝於阪泉，三战而胜；再战蚩尤于涿鹿。蚩尤铜头铁额，刀枪不入，能呼风唤雨。黄帝造指南车辨方向，得九天玄女授兵书，最终擒杀蚩尤。战神刑天、夸父、蚩尤并立，"黄帝的战争"是华夏文明奠基之战。',
    facts: [
      { label: '两大战役', value: '阪泉之战 · 涿鹿之战' },
      { label: '主要典籍', value: '《山海经》《史记·五帝本纪》《龙鱼河图》《太平御览》' },
      { label: '蚩尤形象', value: '铜头铁额 · 刀枪不入 · 呼风唤雨' },
      { label: '黄帝武器', value: '指南车 · 兵书（九天玄女授）· 神兽' },
      { label: '历史地位', value: '华夏文明奠基战' },
    ],
    sections: [
      { type: 'paragraph', heading: '阪泉之战 — 兄弟之争', body: '黄帝与炎帝本是"同根同源"的兄弟部落——都是少典氏、有蟜氏的后代。两个部落在阪泉（今河北涿鹿东南）相遇，原因可能是争夺优良牧场、渔场，或者是因为部族扩张的边界冲突。《史记》说黄帝"三战然后得其志"，三场大战才战胜炎帝。但黄帝没有杀死炎帝，而是让炎帝部族和自己融合——这才是"炎黄子孙"的真正含义：既是血缘，又是文化融合。' },
      { type: 'paragraph', heading: '涿鹿之战 — 神话之战', body: '蚩尤是"九黎"部族首领，是黄帝的最大对手。涿鹿（今河北涿鹿县）之战可能是中华历史上最早有记录的大战。蚩尤有"兄弟八十一人"（《太平御览》），他们"铜头铁额"、"人身牛蹄"、"四目六手"——是半人半兽的战士。蚩尤能"作大雾"迷住黄帝军队，黄帝就造"指南车"辨方向；蚩尤请风伯雨师呼风唤雨，黄帝请"魃"（旱神）放热风吹干。这种神话化的战争描写，反映了远古人类对自然力量的敬畏与对工具的渴望。' },
      { type: 'callout', heading: '为什么黄帝能赢？', body: '黄帝不只是会打仗，他靠的是"技术 + 联盟 + 政治"。技术上，他发明了指南车、抓住了蚩尤大雾的弱点。联盟上，他联合炎帝部族，加上"应龙""魃"等助战神兽。政治上，他擒杀蚩尤后没有屠灭九黎，而是吸收他们的部族——这奠定了他"华夏共主"的合法性。黄帝的胜利不是"赢了一场仗"，而是"建立了一个联合国家"。', variant: 'success' },
      { type: 'paragraph', heading: '战神谱系 — 失败的英雄们', body: '神话里战神有四位：黄帝、炎帝、蚩尤、刑天。结局最惨的是刑天——他与黄帝争帝位，被砍了头，但"以乳为目，以脐为口，操干戚以舞"（用乳头做眼睛，用肚脐做口，拿着盾牌斧头继续战斗）。还有被太阳渴死的夸父、被后羿射杀的九日、因共工怒触不周山而被女娲击杀的黑龙——这些失败的英雄成为后世反叛精神的源头。' },
      { type: 'list', heading: '参战双方实力对比', items: [
        '黄帝方：本部、炎帝部、应龙、魃、九天玄女授兵书、指南车',
        '蚩尤方：81 个兄弟（81 部族首领）、风伯、雨师、造雾',
        '黄帝方武器：轩辕剑（黄帝名即因剑而来）、指南车、神兽',
        '蚩尤方武器：铜头铁额兵器、鬼斧神工、呼风唤雨',
        '结局：黄帝擒杀蚩尤，擒而不杀，余部归降；刑天被斩后仍舞干戚',
      ] },
    ],
    timeline: [
      { year: 'BC 5000 前后', era: '远古', event: '炎帝、黄帝、蚩尤部族崛起于黄河流域' },
      { year: 'BC 4500 前后', era: '上古', event: '阪泉之战，黄帝三战击败炎帝，二部开始融合' },
      { year: 'BC 4500 前后', era: '上古', event: '涿鹿之战，黄帝与蚩尤对峙，"作雾三日"；黄帝得九天玄女兵书' },
      { year: 'BC 4500 前后', era: '上古', event: '黄帝擒杀蚩尤，蚩尤部族部分融入华夏' },
      { year: 'BC 2500 前后', era: '上古', event: '"炎黄子孙"概念在部落联盟中确立' },
      { year: 'BC 475-221', era: '战国', event: '《山海经》《龙鱼河图》等古籍系统化涿鹿之战' },
      { year: 'BC 91', era: '西汉', event: '司马迁《史记·五帝本纪》将黄帝列为五帝之首，奠定官方叙事' },
      { year: '春秋', era: '春秋', event: '蚩尤被民间奉为"兵主"（战神），与黄帝并祀' },
    ],
    images: [
      { imageKeyword: '涿鹿之战 黄帝蚩尤 Huangdi Chiyou battle', caption: '涿鹿之战 — 黄帝擒蚩尤的经典画面', credit: '中国古代神话图谱' },
      { imageKeyword: '轩辕黄帝 肖像 Yellow Emperor portrait', caption: '汉代轩辕黄帝画像石，儒冠端坐', credit: 'Wikimedia Commons · Public Domain' },
      { imageKeyword: '蚩尤 Bronze Age warrior', caption: '苗族传说中蚩尤的形象 — 战神造型', credit: 'Wikimedia Commons · CC BY' },
    ],
    related: [
      { id: 'tr-myth-huangdi', title: '中央天帝黄帝', reason: '黄帝战蚩尤后成为"中央天帝"，奠定其神格' },
      { id: 'tr-myth-yandi', title: '南方赤帝炎帝', reason: '黄帝先与炎帝大战阪泉，之后才合力战蚩尤' },
      { id: 'tr-myth-shennong', title: '神农', reason: '"炎黄"中的炎帝与神农同源，是神农炎帝的另一面' },
      { id: 'tr-history-yanying', title: '炎黄子孙', reason: '"炎黄子孙"的真正起源是阪泉之战后的部族融合' },
      { id: 'tr-myth-fuxi', title: '大神伏羲', reason: '伏羲、黄帝、神农合称"三皇"，同为人文始祖' },
    ],
    source: '《山海经·大荒北经》（先秦）·《史记·五帝本纪》（西汉）·《龙鱼河图》（汉代）·《太平御览》（北宋）',
  },""",

    'tr-myth-long9zi': """  { id: 'tr-myth-long9zi', category: 'myth', title: '龙生九子', summary: '九个龙子各有地盘——中国传统建筑的"瑞兽天团"。', era: '上古', imageKeyword: '龙生九子 nine sons of dragon Chinese', fullContent: '九个龙子各有地盘——中国传统建筑的"瑞兽天团"。',
    facts: [
      { label: '九子名称', value: '囚牛 · 睚眦 · 嘲风 · 蒲牢 · 狻猊 · 霸下 · 狴犴 · 负屃 · 螭吻' },
      { label: '典籍出处', value: '《西游记》《升庵外集》《陕西金石志》' },
      { label: '形象特点', value: '各似父亲一角，性格各异' },
      { label: '常见处所', value: '屋脊、门环、碑座、香炉、桥栏、香烟' },
      { label: '后世演化', value: '明清建筑装饰的核心元素' },
    ],
    sections: [
      { type: 'paragraph', heading: '"九"不是具体数字 — 是形容词', body: '"龙生九子"中的"九"不是具体的"九"，而是"很多"的意思。九在中国文化里是阳数之极，"九"实际指的是"各种各样的龙子"。明代文献记载的"九子"有多种版本：有的说九子是螭吻、椒图、椒图、囚牛、蒲牢等，有的版本甚至有十几个名字。最被广泛接受的版本是：李东阳（明孝宗时内阁首辅）列举的九子 — 这是明清建筑装饰的"官方标准"。' },
      { type: 'list', heading: '九子各司其职', items: [
        '囚牛（qiú niú） — 龙首蛇身，爱音乐；装饰在琴头、食乐器顶',
        '睚眦（yá zì） — 龙头狼身，性凶斗好杀；装饰在刀剑柄吞口、狱门、仪仗',
        '嘲风（cháo fēng） — 形似兽，平生好险好望；装饰在殿角上',
        '蒲牢（pú láo） — 龙形，爱吼叫；装饰在洪钟提梁上（"声震蒲牢"）',
        '狻猊（suān ní） — 形似狮子，喜烟好坐；装饰在香炉盖、佛座',
        '霸下（bà xià） — 龟形似龟，力大好负重；装饰在碑座、殿柱下',
        '狴犴（bì àn） — 形似虎，平生好讼；装饰在狱门、官衙大门',
        '负屃（fù xì） — 形似龙，平生好文；装饰在碑的两侧',
        '螭吻（chī wěn） — 龙首鱼尾，平生好吞；装饰在屋脊、殿角、飞檐',
      ] },
      { type: 'paragraph', heading: '各司其职的功能 — 建筑的语言', body: '九子的设计不是简单的"装饰"，而是用建筑语言表达权力与秩序：狱门用狴犴（象征威严），香炉用狻猊（象征礼佛），洪钟用蒲牢（声音远传），碑座用霸下（永垂不朽），刀剑用睚眦（锋利避邪）。这样去大殿看一眼，你能"读"出建筑的功能：这里是官衙（用狴犴），那里是佛殿（用狻猊），这是存放记录的祠堂（用霸下驮碑）。' },
      { type: 'callout', heading: '一个常见的误会', body: '"龙生九子不成龙"是通俗说法 — 他们并没有"失败"。九子是龙与其他动物（狮、虎、龟、鱼、麒麟等）所生的"混血宝宝"，继承了龙的外形（多似兽）和父亲的特性（爱吼/好坐/好杀），但都没有升天为龙。这是中国神话里"凡尘不一样"的文化 — 不是每个继承者都得像祖先。', variant: 'warning' },
      { type: 'paragraph', heading: '为何明清建筑这么爱九子？', body: '明代是中国建筑装饰的"集大成"期。九子之所以在明清"上屋脊、入门户"，反映了这时期的政治文化需求：朱棣迁都北京后，皇家建筑（紫禁城、十三陵）需要大量"敬天法祖"的装饰元素。九子既神秘、又是民俗传说，既庄重、又亲民。紫禁城屋脊上的十个仙人骑鸡 + 龙凤狮子天马海马狻猊狎鱼獬豸 + 螭吻，成了"皇权十全十美"的视觉隐喻。' },
    ],
    timeline: [
      { year: '战国', era: 'BC 475-221', event: '《庄子》提到龙的"九子"概念，但未列具体名字' },
      { year: '西汉', era: 'BC 202-AD 9', event: '"九子"成为民间传说流行，但版本不一' },
      { year: '唐宋', era: 'AD 618-1279', event: '五脊六兽装饰在建筑上开始定型，明清进一步完善' },
      { year: '明初', era: 'AD 1368', event: '杨慎《升庵外集》系统列出"九子"名称，被后世广泛引用' },
      { year: '明代', era: 'AD 1368-1644', event: '紫禁城建造，屋脊十兽正式定型' },
      { year: '明孝宗', era: 'AD 1488-1505', event: '内阁首辅李东阳在文书中明确"九子"名单，后世遵循' },
      { year: '当代', era: '至今', event: '九子成为中国传统文化"瑞兽天团"代表，出现在各种文创、工艺品中' },
    ],
    images: [
      { imageKeyword: '龙生九子 Chinese dragon nine sons', caption: '龙生九子图谱 — 九子各以其形', credit: '中国古代神话图谱 · Public Domain' },
      { imageKeyword: '故宫屋脊螭吻 Forbidden City roof chiwen', caption: '故宫屋脊上的螭吻（鸱吻）— 吞脊兽', credit: 'Wikimedia Commons · CC BY' },
      { imageKeyword: '狻猊香炉 香炉 suanni incense', caption: '佛寺里的狻猊香炉 — 喜烟好坐的龙子', credit: 'Wikimedia Commons · Public Domain' },
    ],
    related: [
      { id: 'tr-myth-long', title: '龙的家族', reason: '龙生九子是"龙家族"的最具体呈现，与"龙"的图腾一脉相承' },
      { id: 'tr-myth-ruishou', title: '神圣祥瑞之兽', reason: '九子也是"瑞兽家族"，与凤凰麒麟貔貅并列' },
      { id: 'tr-hou-baogu', title: '抱鼓石与蹲脊兽', reason: '建筑装饰上的应用 — 蹲脊兽就是螭吻' },
      { id: 'tr-hou-zao', title: '藻井', caption='另一类建筑装饰上看到的"天圆地方"理念' },
      { id: 'tr-hou-zigong', title: '穿越600年时光的紫禁城', reason: '九子装饰在紫禁城屋脊上达到顶峰' },
    ],
    source: '《庄子》（战国）·《升庵外集》（明代·杨慎）·《陕西金石志》（明代）·《李东阳文集》（明代）',
  },""",
}


def main():
    text = FILE.read_text(encoding='utf-8')
    array_start = text.find('export const TRADITIONS')

    ok, fail = [], []
    for eid, new_block in ENTRIES.items():
        # 在 TRADITIONS 数组内查找
        sub = text[array_start:]
        pat = re.compile(r"\{\s*id:\s*'" + re.escape(eid) + r"'\s*,\s*category:\s*'myth'.*?\}\s*,", re.S)
        m = pat.search(sub)
        if not m:
            fail.append((eid, 'NOT FOUND in array'))
            continue
        old = m.group(0)
        if text.count(old) != 1:
            fail.append((eid, f'old appears {text.count(old)} times'))
            continue
        text = text.replace(old, new_block.rstrip() + '\n', 1)
        ok.append(eid)
        print(f'OK: {eid}')

    FILE.write_text(text, encoding='utf-8')
    print(f'\nWritten {len(ok)} entries, failed: {len(fail)}')
    for f in fail:
        print(' FAIL:', f)


if __name__ == '__main__':
    main()
