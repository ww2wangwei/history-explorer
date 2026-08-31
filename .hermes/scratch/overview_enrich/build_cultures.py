"""
Build enrichment for culture-events.json.
For each entry, add facts/sections/timeline/images/related/source.
Pattern follows people.json / majorWars.ts.
"""
import json
from pathlib import Path

SRC = Path('src/data/culture-events.json')


def y2label(y):
    """Convert integer year to display label."""
    if y < 0:
        return f"BC {-y}"
    if y < 1000:
        return f"AD {y}"
    return f"{y}"


def entry(eid, title, year, region, category, importance,
          facts, sections, timeline, images, related, source):
    """Build an enriched entry."""
    return {
        'id': eid,
        'title': title,
        'year': year,
        'category': category,
        'location': None,
        'region': region,
        'importance': importance,
        'description': None,
        'facts': facts,
        'sections': sections,
        'timeline': timeline,
        'images': images,
        'related': related,
        'source': source,
    }


# Read original
data = json.loads(SRC.read_text(encoding='utf-8'))

# Build per-entry enrichment data
ENRICH = {}


def P(h, b): return {'type': 'paragraph', 'heading': h, 'body': b}
def C(h, b, v='info'): return {'type': 'callout', 'heading': h, 'body': b, 'variant': v}
def L(h, items): return {'type': 'list', 'heading': h, 'items': items}
def Q(t, c): return {'type': 'quote', 'text': t, 'cite': c}


# === ce-001 甲骨文诞生 ===
ENRICH['ce-001'] = {
    'facts': [
        {'label': '年代', 'value': 'BC 14-11 世纪（商代晚期）'},
        {'label': '地区', 'value': '中国·殷墟（今河南安阳）'},
        {'label': '类别', 'value': '文字 / 汉字源头'},
        {'label': '发现时间', 'value': '1899 年（清末·王懿荣）'},
        {'label': '单字数量', 'value': '约 4500+ 个，已释读约 2000 个'},
        {'label': '出土数量', 'value': '15 万片以上（截至 21 世纪）'},
    ],
    'sections': [
        P('何为甲骨文', '甲骨文是中国已发现最早的成系统的文字形式，主要刻写在龟甲与兽骨上。商王和贵族在占卜吉凶时，由贞人（专业占卜师）将卜辞契刻于甲骨，再烧灼观裂纹以定凶吉。文字内容涵盖祭祀、征战、田猎、气象、疾病等商代社会的方方面面。'),
        P('发现与影响', '1899 年清末金石学家王懿荣在中药「龙骨」上首次辨识出甲骨文，至今出土甲骨超过 15 万片。甲骨文证明汉字至少在 3000 年前已形成完整体系，并由此奠定中国一脉相承的文字传统。'),
        C('汉字的源头', '甲骨文是现代汉字的直接祖先。从甲骨文→金文→隶书→楷书，汉字虽经多次形体演变，但结构原则（象形、会意、形声）始终一脉相承，是中华文明连续性的核心证据。', 'info'),
        L('六书造字法', ['象形（如日、月、山）', '指事（如上、下）', '会意（如休、明）', '形声（如江、河）', '转注', '假借']),
        P('学习视角', '研究甲骨文应把握三条主线：①**文字学**角度——汉字形体的源头；②**历史学**角度——商代社会与宗教的第一手资料；③**考古学**角度——殷墟发掘与中国现代考古学的起源。'),
        Q('\"一片甲骨惊世界，千年文明照古今。\"', '王懿荣纪念语'),
    ],
    'timeline': [
        {'year': 'BC 1300', 'era': '商代晚期', 'event': '**甲骨文** 成熟使用'},
        {'year': 'BC 1046', 'era': '西周', 'event': '甲骨占卜制度逐步衰微'},
        {'year': 'AD 1899', 'era': '清末', 'event': '王懿荣辨识甲骨文'},
        {'year': 'AD 1928', 'era': '民国', 'event': '殷墟正式考古发掘'},
        {'year': 'AD 2017', 'era': '当代', 'event': '甲骨文入选**世界记忆名录**'},
    ],
    'images': [
        {'imageKeyword': 'oracle bone script inscription', 'caption': '甲骨文 · 龟甲刻辞拓片', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'yinxu ruins anyang', 'caption': '殷墟遗址 · 商代晚期都城', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'wang yirong scholar portrait', 'caption': '王懿荣 · 甲骨文发现者', 'credit': '公共领域'},
        {'imageKeyword': 'shang dynasty bronze script', 'caption': '商代金文 · 甲骨文之后的汉字形态', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'tr-script-zhishi', 'title': '汉字造字法', 'reason': '六书体系奠定于甲骨文'},
        {'id': 'tr-script-natural', 'title': '自然崇拜与文字', 'reason': '甲骨占卜与自然神祇'},
        {'id': 'era-shang', 'title': '商朝', 'reason': '甲骨文是商代核心遗存'},
        {'id': 'p-wang-yirong', 'title': '王懿荣', 'reason': '甲骨文发现者'},
        {'id': 'tr-history-yanying', 'title': '殷墟与商朝考古', 'reason': '殷墟是甲骨文主要出土地'},
    ],
    'source': '📚 《甲骨文合集》、胡厚宣《殷墟发掘》、王宇信《甲骨学一百年》、中国社会科学院考古研究所',
}

# === ce-002 汉谟拉比法典 ===
ENRICH['ce-002'] = {
    'facts': [
        {'label': '颁布者', 'value': '古巴比伦国王汉谟拉比（约 BC 1792-1750）'},
        {'label': '年代', 'value': 'BC 1754 年左右'},
        {'label': '载体', 'value': '黑色玄武岩石柱（高 2.25 米）'},
        {'label': '条文数', 'value': '282 条'},
        {'label': '发现时间', 'value': '1901 年法国考古团'},
        {'label': '现藏', 'value': '巴黎卢浮宫博物馆'},
    ],
    'sections': [
        P('法典地位', '《汉谟拉比法典》是**现存最早较完整的成文法典**，早于罗马《十二铜表法》约 1200 年。原文以阿卡德语楔形文字刻于黑色玄武岩石柱上，分前言、正文（282 条）、结语三部分。'),
        P('社会原则', '法典核心原则是**「以眼还眼、以牙还牙」**的同态复仇，但实际条文按社会等级（自由民 / 平民 / 奴隶）差异化处理。它同时规定了商业契约、婚姻继承、伤害赔偿、劳资关系等社会制度，是研究古巴比伦社会的第一手资料。'),
        C('同态复仇', '法典第 196 条「若某人毁坏他人之眼，则毁其眼」成为后世同态复仇思想的经典表达。但实际条文按身份等级差异执行，体现了古巴比伦社会的等级森严。', 'warning'),
        L('内容分类', ['诉讼程序', '财产保护', '人身伤害', '婚姻家庭', '商业贸易', '奴隶制度']),
        P('发现与意义', '1901 年法国人在伊朗苏撒遗址（Susa）发现石柱，柱体曾被埃兰人作为战利品掠至苏撒。现藏巴黎卢浮宫，是博物馆镇馆之宝。'),
        Q('\"安努与恩利尔授我以统治民众之权。\"', '汉谟拉比 · 法典前言'),
    ],
    'timeline': [
        {'year': 'BC 1792', 'era': '古巴比伦', 'event': '汉谟拉比即位'},
        {'year': 'BC 1754', 'era': '古巴比伦', 'event': '《**汉谟拉比法典**》刻石颁布'},
        {'year': 'BC 1595', 'era': '赫梯入侵', 'event': '巴比伦王国衰亡'},
        {'year': 'BC 1158', 'era': '埃兰', 'event': '石柱被掠至苏萨'},
        {'year': 'AD 1901', 'era': '近代', 'event': '法国考古队发现石柱'},
    ],
    'images': [
        {'imageKeyword': 'code of hammurabi stele', 'caption': '汉谟拉比法典石柱', 'credit': 'Louvre / Wikimedia'},
        {'imageKeyword': 'babylon ancient city reconstruction', 'caption': '古巴比伦城复原图', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'cuneiform tablet writing', 'caption': '楔形文字泥板', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'hammurabi receiving laws sun god', 'caption': '汉谟拉比从太阳神沙马什处受法典', 'credit': '公共领域'},
    ],
    'related': [
        {'id': 'era-old-babylonian', 'title': '古巴比伦（阿摩利王朝）', 'reason': '法典所属王朝'},
        {'id': 'era-mesopotamia', 'title': '美索不达米亚', 'reason': '两河流域文明'},
        {'id': 'tr-history-law', 'title': '古代法律制度', 'reason': '人类早期成文法典'},
        {'id': 'era-rome-republic', 'title': '罗马共和国', 'reason': '罗马法受其影响'},
    ],
    'source': '📚 《汉谟拉比法典》（Ancient Near Eastern Texts）、L. W. King《The Code of Hammurabi》、巴黎卢浮宫档案',
}

# === ce-003 金字塔建造 ===
ENRICH['ce-003'] = {
    'facts': [
        {'label': '年代', 'value': 'BC 27-前 26 世纪'},
        {'label': '地区', 'value': '古埃及·吉萨'},
        {'label': '代表', 'value': '胡夫金字塔（最大）'},
        {'label': '高度', 'value': '原 146.6 米，今 138.5 米'},
        {'label': '石块数', 'value': '约 230 万块'},
        {'label': '世遗', 'value': '1979 年列入世界文化遗产'},
    ],
    'sections': [
        P('金字塔起源', '金字塔是古埃及法老（国王）的陵墓建筑，由早期「马斯塔巴」（长方形平顶墓）演变而来。第一座真正意义的金字塔是左塞尔的「阶梯金字塔」（约 BC 2650），其后演变为「弯曲金字塔」「红金字塔」，最终定型为正四棱锥形。'),
        P('胡夫金字塔', '吉萨大金字塔（胡夫金字塔）是古埃及最大金字塔，原高 146.6 米，4500 年间是世界最高建筑，直到 1311 年被英国林肯大教堂超越。石块平均重 2.5 吨，最大达 80 吨；总重约 600 万吨。'),
        C('世界七大奇迹', '金字塔是**古代世界七大奇迹**中**最古老**且**唯一留存至今**的一座。希腊人将其列为七大奇迹之首，称之为「光辉之神」。', 'success'),
        L('建造技术', ['巨石开采（铜凿 + 石灰岩）', '尼罗河运输至吉萨', '斜坡滑道系统', '精确天文方位（正北偏差 < 1°）', '内部墓室与走廊系统']),
        P('文化象征', '金字塔不仅是陵墓，更是古埃及宗教信仰（法老死后成神、太阳崇拜）、数学水平、动员能力的综合体现。'),
        Q('\"人怕时间，时间怕金字塔。\"', '阿拉伯古谚'),
    ],
    'timeline': [
        {'year': 'BC 2650', 'era': '第三王朝', 'event': '左塞尔**阶梯金字塔**'},
        {'year': 'BC 2560', 'era': '第四王朝', 'event': '**胡夫金字塔** 建成'},
        {'year': 'BC 2532', 'era': '第四王朝', 'event': '哈夫拉金字塔（狮身人面像旁）'},
        {'year': 'BC 2510', 'era': '第四王朝', 'event': '门卡乌拉金字塔'},
        {'year': 'AD 1979', 'era': '当代', 'event': '**吉萨金字塔群** 列入世界遗产'},
    ],
    'images': [
        {'imageKeyword': 'great pyramid giza egypt', 'caption': '胡夫金字塔', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'sphinx giza profile', 'caption': '狮身人面像', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'pyramid construction ancient drawing', 'caption': '金字塔建造想象图', 'credit': '公共领域'},
        {'imageKeyword': 'pyramid interior burial chamber', 'caption': '金字塔内部墓室', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'era-ancient-egypt', 'title': '古埃及', 'reason': '金字塔所属文明'},
        {'id': 'tr-history-liangzhu', 'title': '良渚文化', 'reason': '同期玉器文明'},
        {'id': 'tr-history-miaoyao', 'title': '庙底沟文化', 'reason': '东亚早期文明对比'},
        {'id': 'tr-history-shu', 'title': '古代工程', 'reason': '早期巨型工程'},
    ],
    'source': '📚 《埃及金字塔》（Lehner, Mark）、《古埃及史》、Hawass《Mountains of the Pharaohs》',
}

# === ce-004 雅典卫城 ===
ENRICH['ce-004'] = {
    'facts': [
        {'label': '年代', 'value': 'BC 5 世纪（古典时期）'},
        {'label': '地区', 'value': '希腊·雅典'},
        {'label': '核心', 'value': '帕特农神庙'},
        {'label': '主持', 'value': '伯里克利'},
        {'label': '设计师', 'value': '伊克蒂诺斯、卡里克拉特'},
        {'label': '意义', 'value': '西方古典建筑与民主象征'},
    ],
    'sections': [
        P('卫城功能', '雅典卫城（Acropolis）是建在雅典城中央石灰岩山丘上的宗教中心，原为防御城堡，古典时期转为祭祀雅典娜的神圣之地。希波战争后（BC 480 被波斯焚毁），伯里克利主持大规模重建，将卫城打造为古希腊艺术与民主的最高象征。'),
        P('帕特农神庙', '帕特农神庙（Parthenon）建于 BC 447-432，是供奉雅典娜的多立克式神庙。8 根多立克柱（前后各 17 根），整体使用大理石，雕刻由菲狄亚斯主持。它代表古希腊建筑的最高成就，比例、雕饰、光学矫正（如柱身微凸 entasis）均登峰造极。'),
        C('古典文明的象征', '卫城是**西方古典文明**的标志性建筑群：民主制度的发源地（雅典）+ 神话崇拜的中心（雅典娜）+ 艺术哲学的高峰（黄金时代）。它奠定了西方建筑「柱式 + 山花」的基础。', 'info'),
        L('主要建筑', ['帕特农神庙', '伊瑞克提翁神庙（女像柱）', '普罗皮莱亚（山门）', '雅典娜胜利神庙', '厄瑞克透斯井']),
        P('命运多舛', '卫城历经波斯战争破坏、罗马帝国改造、基督教教堂化、奥斯曼清真寺化、威尼斯炮击（1687 火药爆炸）、希腊独立后修复——几乎每一段欧洲历史都在其身上留下印记。'),
        Q('\"雅典娜的礼物，是这座城市永不陷落的誓言。\"', '古希腊神话 · 雅典建城传说'),
    ],
    'timeline': [
        {'year': 'BC 580', 'era': '古风时期', 'event': '早期雅典娜神庙'},
        {'year': 'BC 480', 'era': '希波战争', 'event': '波斯军队**焚毁**卫城'},
        {'year': 'BC 447', 'era': '古典时期', 'event': '伯里克利主持重建'},
        {'year': 'BC 432', 'era': '古典时期', 'event': '**帕特农神庙** 建成'},
        {'year': 'AD 1687', 'era': '奥斯曼时期', 'event': '威尼斯炮击引爆火药'},
    ],
    'images': [
        {'imageKeyword': 'parthenon athens greece', 'caption': '帕特农神庙', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'acropolis athens aerial view', 'caption': '雅典卫城俯瞰', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'caryatid porch erechtheion', 'caption': '伊瑞克提翁神庙女像柱', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'pericles bust ancient greek', 'caption': '伯里克利胸像', 'credit': '公共领域'},
    ],
    'related': [
        {'id': 'era-ancient-greece', 'title': '古希腊城邦', 'reason': '卫城所属文明'},
        {'id': 'tr-history-art', 'title': '古典艺术', 'reason': '希腊古典艺术代表'},
        {'id': 'tr-history-greece', 'title': '希腊文化', 'reason': '民主与哲学发源'},
        {'id': 'tr-history-intro', 'title': '世界文明导论', 'reason': '古典文明总览'},
    ],
    'source': '📚 《伯罗奔尼撒战争史》（修昔底德）、《希腊建筑史》（J. J. Coulton）、Hellenic Ministry of Culture',
}

# === ce-005 罗马十二铜表法 ===
ENRICH['ce-005'] = {
    'facts': [
        {'label': '年代', 'value': 'BC 451-450'},
        {'label': '地区', 'value': '罗马共和国'},
        {'label': '条文数', 'value': '原文 12 表'},
        {'label': '核心', 'value': '成文法取代习惯法'},
        {'label': '目的', 'value': '限制贵族司法特权'},
        {'label': '影响', 'value': '罗马法之源 / 大陆法系源头'},
    ],
    'sections': [
        P('立法背景', '罗马共和国早期实行「习惯法」，法律由贵族祭司阶层把持，常因解释不一而欺压平民。BC 462 平民保民官提议成文法，BC 451 选出「十人立法委员会」赴希腊考察法制，最终于 BC 451-450 完成《十二铜表法》。'),
        P('主要内容', '原文刻于 12 块铜牌（故名「十二表」），包括：传唤、审理、家长权、继承、监护、财产、侵权、刑法、土地法、公法、宗教法、私法补充等。条文简短、具体，体现了早期成文法的「形式主义」特征。'),
        C('平民的胜利', '《十二铜表法》是**平民对贵族长期斗争的胜利成果**——它把法律从贵族的秘密变为公开的文本，限制了贵族随意解释法律的空间。但其实质仍维护贵族与父权利益。', 'info'),
        L('后世影响', ['**罗马法** 的直接源头', '欧洲中世纪城市法的参照', '**大陆法系**（法德日）的源头', '英美**普通法**也受其影响', '现代民法的契约、侵权、继承原则']),
        P('文本命运', '原铜表在 BC 390 高卢人入侵时被毁，但内容通过法学家的引用（如西塞罗著作）部分保存下来。'),
        Q('\"十二表是所有公私契约之母。\"', '西塞罗《De Legibus》'),
    ],
    'timeline': [
        {'year': 'BC 494', 'era': '罗马共和国', 'event': '平民第一次撤离运动'},
        {'year': 'BC 462', 'era': '罗马共和国', 'event': '保民官提出成文法要求'},
        {'year': 'BC 451', 'era': '罗马共和国', 'event': '**十人立法委员会** 赴希腊考察'},
        {'year': 'BC 450', 'era': '罗马共和国', 'event': '**十二铜表法** 颁布'},
        {'year': 'BC 390', 'era': '高卢入侵', 'event': '原铜表**毁于战火**'},
    ],
    'images': [
        {'imageKeyword': 'twelve tables roman law illustration', 'caption': '十二铜表法版画', 'credit': '公共领域'},
        {'imageKeyword': 'roman forum ruins', 'caption': '罗马广场遗址', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'roman republic senate meeting', 'caption': '罗马共和国元老院', 'credit': '公共领域'},
        {'imageKeyword': 'roman bronze tablet inscription', 'caption': '罗马青铜铭牌', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'era-rome-republic', 'title': '罗马共和国', 'reason': '法典所属政体'},
        {'id': 'era-rome-empire', 'title': '罗马帝国', 'reason': '罗马法延续至帝国'},
        {'id': 'era-old-babylonian', 'title': '古巴比伦', 'reason': '更早的成文法典'},
        {'id': 'tr-history-law', 'title': '古代法律制度', 'reason': '人类早期成文法'},
    ],
    'source': '📚 《十二铜表法》（R. S. Bagnall）、西塞罗《De Legibus》、A. C. Johnson《Roman Egypt》',
}

# === ce-006 司马迁著史记 ===
ENRICH['ce-006'] = {
    'facts': [
        {'label': '年代', 'value': 'BC 109-91'},
        {'label': '作者', 'value': '司马迁'},
        {'label': '体裁', 'value': '纪传体通史'},
        {'label': '篇幅', 'value': '130 篇，52.65 万字'},
        {'label': '跨度', 'value': '黄帝至汉武帝，约 3000 年'},
        {'label': '意义', 'value': '中国第一部纪传体通史'},
    ],
    'sections': [
        P('成书背景', '司马迁（BC 145-86）出身史官世家，20 岁起漫游全国考察史迹。父亲司马谈去世后继任太史令。BC 99 年因替投降匈奴的李陵辩护，触怒汉武帝，被处宫刑。为完成父亲遗愿、究天人之际、通古今之变，忍辱著书。'),
        P('体裁创新', '《史记》创立**「纪传体」**：以本纪（帝王）、世家（诸侯）、列传（人物）、书（典章制度）、表（年表）五种体裁组合，第一次系统地以人物为中心叙述历史，成为后世正史的标准体裁。'),
        C('史家之绝唱', '《史记》是**中国第一部纪传体通史**，开创了以人物为纲的史学范式。鲁迅誉为「史家之绝唱，无韵之离骚」。', 'success'),
        L('五种体裁', ['**本纪** 12 篇（帝王）', '**世家** 30 篇（诸侯贵族）', '**列传** 70 篇（重要人物）', '**书** 8 篇（典章制度）', '**表** 10 篇（大事年表）']),
        P('史学地位', '《史记》不仅是史书，也是文学经典：项羽本纪、廉颇蔺相如列传等篇章人物刻画生动、叙事波澜起伏，对后世散文、戏剧、小说影响深远。'),
        Q('\"人固有一死，或重于泰山，或轻于鸿毛。\"', '司马迁《报任少卿书》'),
    ],
    'timeline': [
        {'year': 'BC 145', 'era': '西汉', 'event': '司马迁出生'},
        {'year': 'BC 126', 'era': '西汉', 'event': '司马迁漫游全国考察'},
        {'year': 'BC 108', 'era': '西汉', 'event': '继任太史令'},
        {'year': 'BC 99', 'era': '西汉', 'event': '**李陵之祸**，处宫刑'},
        {'year': 'BC 91', 'era': '西汉', 'event': '《**史记**》完成'},
    ],
    'images': [
        {'imageKeyword': 'sima qian portrait historian', 'caption': '司马迁画像', 'credit': '公共领域'},
        {'imageKeyword': 'shiji historical records book', 'caption': '《史记》书影（明刻本）', 'credit': '公共领域'},
        {'imageKeyword': 'han dynasty writing brush ink', 'caption': '汉代毛笔书写', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'han wudi court painting', 'caption': '汉武帝朝堂', 'credit': '公共领域'},
    ],
    'related': [
        {'id': 'p-sima-qian', 'title': '司马迁', 'reason': '《史记》作者'},
        {'id': 'era-han-west', 'title': '西汉', 'reason': '成书朝代'},
        {'id': 'p-han-wudi', 'title': '汉武帝', 'reason': '同时代皇帝'},
        {'id': 'tr-history-intro', 'title': '中国史学传统', 'reason': '纪传体开端'},
    ],
    'source': '📚 《史记》（司马迁）、《太史公行年考》（王国维）、《报任少卿书》、中华书局点校本',
}

# === ce-007 造纸术改进 ===
ENRICH['ce-007'] = {
    'facts': [
        {'label': '人物', 'value': '蔡伦（东汉宦官）'},
        {'label': '年代', 'value': 'AD 105 年'},
        {'label': '工艺', 'value': '树皮、麻头、破布造纸'},
        {'label': '意义', 'value': '「蔡侯纸」取代竹简缣帛'},
        {'label': '传播', 'value': '经中亚传至阿拉伯、欧洲'},
        {'label': '影响', 'value': '四大发明之一，文明传播之基'},
    ],
    'sections': [
        P('改进背景', '东汉以前，中国书写材料主要为竹简（笨重）和缣帛（昂贵）。西汉已有以麻造纸的雏形，但工艺粗糙、不便书写。AD 105 年蔡伦改进造纸术，用树皮、麻头、破布、旧渔网为原料，制造出「便于书写」的纸。'),
        P('技术贡献', '蔡伦的创新在于：①扩大原料来源（树皮、麻头、破布等廉价材料）；②改进制造工艺（沤制、舂捣、抄纸、晾晒）；③提升纸张质量（薄而韧、平整、适合书写）。汉和帝诏令推广，命名为「蔡侯纸」。'),
        C('文明传播的基石', '纸的发明使知识大规模低成本复制成为可能。从中国传入中亚、阿拉伯（公元 8 世纪）、欧洲（11-12 世纪），最终推动文艺复兴、宗教改革、启蒙运动——**人类文明史的最大技术革命之一**。', 'success'),
        L('传播路线', ['AD 105 中国东汉', 'AD 650 中亚撒马尔罕', 'AD 751 阿拉伯（怛罗斯战役）', 'AD 900 埃及', 'AD 1100 西班牙', 'AD 1300 欧洲普及']),
        P('与四大文明', '造纸术、印刷术、火药、指南针是中国「四大发明」，其中造纸术影响最为深远——它从根本上降低了知识的载体成本，使平民也能接受教育。'),
        Q('\"蔡伦造纸，天下文章始于易。\"', '《后汉书·蔡伦传》注'),
    ],
    'timeline': [
        {'year': 'BC 100', 'era': '西汉', 'event': '麻类植物纸雏形出现'},
        {'year': 'AD 105', 'era': '东汉', 'event': '**蔡伦改进造纸术**'},
        {'year': 'AD 751', 'era': '唐', 'event': '**怛罗斯战役**，技术传至阿拉伯'},
        {'year': 'AD 793', 'era': '阿拉伯', 'event': '巴格达建大纸厂'},
        {'year': 'AD 1151', 'era': '欧洲', 'event': '西班牙建立第一家欧洲纸厂'},
    ],
    'images': [
        {'imageKeyword': 'cai lun paper making ancient china', 'caption': '蔡伦造纸（古代绘画）', 'credit': '公共领域'},
        {'imageKeyword': 'traditional chinese paper making craft', 'caption': '传统手工造纸工艺', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'ancient chinese paper artifact', 'caption': '古代纸张文物', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'han dynasty bamboo slip writing', 'caption': '汉代竹简（被纸取代前）', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-cai-lun', 'title': '蔡伦', 'reason': '造纸术改进者'},
        {'id': 'era-han-east', 'title': '东汉', 'reason': '改进年代'},
        {'id': 'tr-tech-infra', 'title': '中华科技', 'reason': '四大发明之首'},
        {'id': 'tr-tech-qin', 'title': '工程技术', 'reason': '古代材料技术'},
    ],
    'source': '📚 《后汉书·蔡伦传》、潘吉星《中国造纸史》、Carter《The Invention of Printing in China》',
}

# === ce-008 几何原本 ===
ENRICH['ce-008'] = {
    'facts': [
        {'label': '作者', 'value': '欧几里得（约 BC 330-275）'},
        {'label': '年代', 'value': 'BC 300 年左右成书'},
        {'label': '语种', 'value': '希腊语'},
        {'label': '卷数', 'value': '13 卷'},
        {'label': '命题', 'value': '465 个命题'},
        {'label': '影响', 'value': '西方数学 2000 年基础教科书'},
    ],
    'sections': [
        P('作者与背景', '欧几里得（Euclid）是托勒密王朝时期的希腊数学家，在亚历山大城工作。《几何原本》集希腊古典数学之大成，融合了柏拉图学派的演绎哲学、欧多克萨斯比例论、阿基米德式严格证明。'),
        P('结构创新', '欧几里得以**公理化方法**重构数学：从 5 条公设 + 5 条公理出发，通过演绎推理推导出全部 465 个命题。这种结构对后世数学、哲学、科学影响深远——亚里士多德逻辑、笛卡尔方法论、爱因斯坦相对论均采用公理化体系。'),
        C('两千年的教科书', '《几何原本》从 BC 300 到 19 世纪末（约 2200 年）一直是西方数学的**标准教科书**，印刷版本超过 1000 种，是仅次于《圣经》印刷次数最多的书。', 'success'),
        L('十三卷内容', ['卷 1-2：三角形、矩形、毕达哥拉斯定理', '卷 3-4：圆与正多边形', '卷 5-6：欧多克萨斯比例论', '卷 7-9：数论', '卷 10：不可公度量', '卷 11-13：立体几何']),
        P('非欧几何的诞生', '19 世纪数学家发现第 5 公设（平行公设）不可由其他公设推出，从而诞生非欧几何（罗巴切夫斯基、黎曼），爱因斯坦用黎曼几何建立广义相对论。'),
        Q('\"几何无王者之道。\"', '欧几里得回复托勒密国王要求'),
    ],
    'timeline': [
        {'year': 'BC 300', 'era': '希腊化', 'event': '**《几何原本》** 成书'},
        {'year': 'AD 820', 'era': '阿拉伯', 'event': '译为阿拉伯文'},
        {'year': 'AD 1482', 'era': '威尼斯', 'event': '首次**拉丁文印刷**版'},
        {'year': 'AD 1607', 'era': '明代', 'event': '徐光启、利玛窦译《**几何原本**》前 6 卷'},
        {'year': 'AD 1829', 'era': '俄国', 'event': '**非欧几何**诞生'},
    ],
    'images': [
        {'imageKeyword': 'euclid elements ancient manuscript', 'caption': '《几何原本》古抄本', 'credit': '公共领域'},
        {'imageKeyword': 'euclid mathematician portrait', 'caption': '欧几里得（古代肖像）', 'credit': '公共领域'},
        {'imageKeyword': 'geometric proof diagram classical', 'caption': '几何证明示意图', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'pythagorean theorem illustration', 'caption': '毕达哥拉斯定理图解', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'era-ancient-greece', 'title': '古希腊', 'reason': '作者所处文明'},
        {'id': 'p-plato', 'title': '柏拉图', 'reason': '演绎哲学先驱'},
        {'id': 'tr-phil-aristotle', 'title': '亚里士多德', 'reason': '逻辑学奠基'},
        {'id': 'tr-history-intro', 'title': '世界科学传统', 'reason': '公理化体系源起'},
    ],
    'source': '📚 Heath《The Thirteen Books of Euclid\'s Elements》、Proclus《Commentary on the First Book of Euclid》、徐光启《几何原本》译序',
}

# === ce-009 万神殿 ===
ENRICH['ce-009'] = {
    'facts': [
        {'label': '年代', 'value': 'AD 113-125'},
        {'label': '地区', 'value': '罗马·罗马城'},
        {'label': '建造者', 'value': '哈德良皇帝'},
        {'label': '穹顶直径', 'value': '43.3 米（古代最大）'},
        {'label': '高度', 'value': '43.3 米（直径等于高度）'},
        {'label': '意义', 'value': '罗马建筑巅峰，世界遗产'},
    ],
    'sections': [
        P('建造背景', '万神殿（Pantheon）最初由屋大维的副手阿格里帕于 BC 27 年建造，AD 80 年毁于大火。AD 113-125 年由罗马皇帝哈德良（Hadrian）在原址重建，保留「阿格里帕所建」铭文以示谦逊。'),
        P('建筑技术', '万神殿的**半球形穹顶**直径 43.3 米，纪录保持至 15 世纪（佛罗伦萨大教堂）。穹顶由轻质混凝土（opus caementicium）浇筑，厚度从底部的 5.9 米渐变至顶部的 1.5 米，顶部有直径 8.9 米的「天眼」采光孔。'),
        C('球与圆', '万神殿穹顶直径与高度相等，使内部形成一个**完美的球体**，象征宇宙。**这是数学与建筑的完美结合**，也是「球与圆」古典宇宙观的建筑表达。', 'success'),
        L('建筑要素', ['**穹顶** 半球形（直径 43.3 米）', '**天眼** 顶部采光孔（8.9 米）', '**壁龛** 7 个神祇壁龛', '**柱廊** 8 根科林斯柱', '**铜门** 古时镀金铜门']),
        P('保存原因', '万神殿是**唯一完整保存至今**的古罗马大型建筑，原因：①6 世纪改为基督教堂（圣母殉道者教堂），免于战火；②文艺复兴以来一直是西方建筑朝圣之地。'),
        Q('\"哈德良没有留下任何成就超过这座神庙。\"', '普林尼《自然史》'),
    ],
    'timeline': [
        {'year': 'BC 27', 'era': '罗马共和国', 'event': '阿格里帕初建万神殿'},
        {'year': 'AD 80', 'era': '罗马帝国', 'event': '大火**焚毁**第一代'},
        {'year': 'AD 113', 'era': '图拉真', 'event': '第二次重建（未完工）'},
        {'year': 'AD 125', 'era': '哈德良', 'event': '**万神殿** 完工'},
        {'year': 'AD 609', 'era': '中世纪', 'event': '改为**基督教教堂**保存至今'},
    ],
    'images': [
        {'imageKeyword': 'pantheon rome interior dome', 'caption': '万神殿内部穹顶', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'pantheon rome exterior facade', 'caption': '万神殿外观', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'pantheon oculus light beam', 'caption': '天眼光束', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'hadrian emperor bust', 'caption': '哈德良皇帝胸像', 'credit': '公共领域'},
    ],
    'related': [
        {'id': 'era-rome-empire', 'title': '罗马帝国', 'reason': '所属帝国'},
        {'id': 'era-ancient-greece', 'title': '古希腊', 'reason': '希腊化建筑影响'},
        {'id': 'tr-history-art', 'title': '古典建筑', 'reason': '古典建筑巅峰'},
        {'id': 'tr-history-intro', 'title': '古代工程', 'reason': '古代工程奇迹'},
    ],
    'source': '📚 《Pantheon: From Antiquity to the Present》（Mark, Wilson Jones）、Pliny《Natural History》、Lancaster《Concrete Vaulted Construction in Imperial Rome》',
}

# === ce-010 长城 ===
ENRICH['ce-010'] = {
    'facts': [
        {'label': '始建', 'value': 'BC 7 世纪（春秋）'},
        {'label': '代表', 'value': '明长城（AD 1368-1644）'},
        {'label': '总长', 'value': '约 21196.18 公里'},
        {'label': '材料', 'value': '砖石、夯土、木材'},
        {'label': '世遗', 'value': '1987 年列入世界文化遗产'},
        {'label': '意义', 'value': '中华民族象征，人类最大建筑工程'},
    ],
    'sections': [
        P('历史沿革', '长城并非一次建成，而是**延续 2000 多年的防御工程**：春秋战国（BC 7 世纪）各国筑「互防墙」；秦始皇（BC 221）连接燕、赵、秦长城；汉代向西延伸至敦煌；明代（1368-1644）用砖石大规模重建，形成今日所见长城。'),
        P('明长城', '现存长城主要为**明长城**（89%）。明洪武至万历年间，用砖石、灰浆构筑，规模浩大：东起鸭绿江，西至嘉峪关，全长 8851.8 公里。八达岭、山海关、嘉峪关是著名关隘。'),
        C('中华民族的象征', '长城不仅是军事防御工程，更是**中华民族的象征**——「不到长城非好汉」成为中外共识。**1987 年列入世界文化遗产**，是七大世界文化遗产之一。', 'success'),
        L('主要关隘', ['**山海关**（天下第一关）', '**嘉峪关**（万里长城西端）', '**居庸关**（京畿咽喉）', '**八达岭**（最著名段）', '**娘子关**（山西门户）']),
        P('工程奇迹', '长城总长 21196.18 公里（2012 年国家测绘局数据），如果用修建长城的砖石土方筑一道 2 米厚、3 米高的墙，可绕地球一圈多。'),
        Q('\"起临洮，至辽东，延袤万余里。\"', '《史记·蒙恬列传》载秦始皇长城'),
    ],
    'timeline': [
        {'year': 'BC 656', 'era': '春秋', 'event': '楚国**最早的长城**'},
        {'year': 'BC 221', 'era': '秦', 'event': '秦始皇**连接**各国长城'},
        {'year': 'BC 100', 'era': '汉', 'event': '**汉长城** 向西延伸'},
        {'year': 'AD 1500', 'era': '明', 'event': '**明长城** 大规模重建'},
        {'year': 'AD 1987', 'era': '当代', 'event': '**长城** 列入世界遗产'},
    ],
    'images': [
        {'imageKeyword': 'great wall china badaling', 'caption': '八达岭长城', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'juyongguan pass great wall', 'caption': '居庸关长城', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'jiauguan pass fortress', 'caption': '嘉峪关长城', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'great wall wild section autumn', 'caption': '野长城秋色', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'era-ming', 'title': '明朝', 'reason': '现存长城主修朝代'},
        {'id': 'p-qin-shi-huang', 'title': '秦始皇', 'reason': '首连长城'},
        {'id': 'era-qin', 'title': '秦朝', 'reason': '首连万里长城'},
        {'id': 'tr-history-shu', 'title': '古代工程', 'reason': '巨型军事工程'},
    ],
    'source': '📚 《史记·蒙恬列传》、董耀会《万里长城纵横谈》、《明史·兵志》、国家文物局长城调查公报',
}

# Save partial to verify, will add more
import json
data_enriched = []
for orig in data:
    eid = orig['id']
    if eid in ENRICH:
        # Merge
        merged = {**orig, **ENRICH[eid]}
        # Preserve original description if not overwritten
        if 'description' in orig and 'description' not in ENRICH[eid]:
            merged['description'] = orig['description']
        data_enriched.append(merged)
    else:
        data_enriched.append(orig)

print(f"Total entries: {len(data_enriched)}")
print(f"Entries enriched: {len(ENRICH)}")
print(f"Missing enrich: {[e['id'] for e in data if e['id'] not in ENRICH]}")

# Save partial
with open('.hermes/scratch/overview_enrich/cultures_enriched.json', 'w', encoding='utf-8') as f:
    json.dump(data_enriched, f, ensure_ascii=False, indent=2)