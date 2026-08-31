"""
Enrich each person entry in people.json with facts/sections/timeline/images/related/source.
"""
import json
from pathlib import Path

SRC = Path('src/data/people.json')
data = json.loads(SRC.read_text(encoding='utf-8'))

CAT_NAME = {
    'politician': '政治家', 'military': '军事家', 'thinker': '思想家',
    'literati': '文人/艺术家', 'scientist': '科学家', 'reformer': '改革家',
    'explorer': '探险家/航海家', 'religious': '宗教人物',
}

def fmt_year(y):
    if y is None: return '不详'
    return f'BC {-y}' if y < 0 else f'{y}'

# Per-person custom section / quote content for better quality
PERSON_DETAILS = {
    'p-qin-shi-huang': {
        'quote': '"朕为始皇帝，后世以计数，二世三世至于万世，传之无穷。"',
        'callout': '秦始皇是中国第一个使用"皇帝"称号的人，自此"皇帝"成为历代中国最高统治者的称号。',
        'sources': '《史记·秦始皇本纪》、司马迁《资治通鉴》、李斯《泰山刻石》',
    },
    'p-han-wudi': {
        'quote': '"汉家庶事草创，加四夷侵陵中国，朕不变更，后世无法。"',
        'callout': '汉武帝奠定了此后 2000 年中国思想正统，"罢黜百家、独尊儒术"是中华文明史的转折点。',
        'sources': '《汉书·武帝纪》、司马迁《史记·封禅书》',
    },
    'p-tang-taizong': {
        'quote': '"以铜为鉴，可以正衣冠；以人为鉴，可以明得失；以史为鉴，可以知兴替。"',
        'callout': '唐太宗的"贞观之治"被后世视为政治清明、社会安定的典范，是中国古代最辉煌的治世之一。',
        'sources': '《旧唐书·太宗本纪》、吴兢《贞观政要》',
    },
    'p-tang-wuzetian': {
        'quote': '"朕以大帝之尊，临御天下，崇先圣之训。"',
        'callout': '武则天是中国历史上唯一正统女皇帝。她兴科举、破门阀，在男权社会中达到了政治巅峰。',
        'sources': '《旧唐书·则天皇后》、司马光《资治通鉴》',
    },
    'p-confucius': {
        'quote': '"学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？"',
        'callout': '孔子被尊为"至圣先师"，是中国历史上最伟大的思想家之一，儒家学派的创始人。',
        'sources': '《论语》、司马迁《史记·孔子世家》',
    },
    'p-shang-yang': {
        'quote': '"治世不一道，便国不法古。"',
        'callout': '商鞅变法使秦国从一个西陲小国一跃成为战国七雄中最强大的国家，为秦统一六国奠定了基础。',
        'sources': '《史记·商君列传》、《商君书》',
    },
    'p-sima-qian': {
        'quote': '"人固有一死，或重于泰山，或轻于鸿毛。"',
        'callout': '司马迁是中国第一部纪传体通史《史记》的作者，被誉为"史家之绝唱，无韵之离骚"。',
        'sources': '《史记》、班固《汉书·司马迁传》',
    },
    'p-li-bai': {
        'quote': '"床前明月光，疑是地上霜。举头望明月，低头思故乡。"',
        'callout': '李白被誉为"诗仙"，是中国最伟大的浪漫主义诗人，其诗作飘逸豪放，想象瑰丽。',
        'sources': '《李太白集》、李白《将进酒》《蜀道难》',
    },
    'p-du-fu': {
        'quote': '"安得广厦千万间，大庇天下寒士俱欢颜！"',
        'callout': '杜甫被誉为"诗圣"，是中国最伟大的现实主义诗人，其诗作真实反映了唐王朝由盛转衰的历史。',
        'sources': '《杜工部集》、杜甫"三吏""三别"',
    },
    'p-sima-guang': {
        'quote': '"兼听则明，偏信则暗。"',
        'callout': '司马光主编的《资治通鉴》是继《史记》之后中国最重要的编年体史书，记载了从战国到五代 1362 年的历史。',
        'sources': '《资治通鉴》、司马光《温国文正公文集》',
    },
    'p-zhu-xi': {
        'quote': '"问渠那得清如许？为有源头活水来。"',
        'callout': '朱熹是宋代理学的集大成者，他的思想体系成为元明清三朝的官方哲学。',
        'sources': '《朱子语类》、《四书章句集注》',
    },
    'p-julius-caesar': {
        'quote': '"Veni, vidi, vici."（我来，我见，我征服。）',
        'callout': '凯撒是罗马共和国晚期最具影响力的军事家和政治家，他的征服奠定了罗马帝国的版图基础。',
        'sources': '苏埃托尼乌斯《凯撒传》、普鲁塔克《希腊罗马名人传》',
    },
    'p-augustus': {
        'quote': '"我接手了一座砖造的罗马，却留下了一座大理石的罗马。"',
        'callout': '奥古斯都是罗马帝国的开国君主，建立了延续 1500 年的罗马和平（Pax Romana）。',
        'sources': '苏埃托尼乌斯《奥古斯都传》',
    },
    'p-genghis-khan': {
        'quote': '"人生最大的快乐，就是击败敌人，夺其妻女，骑乘其良马。"',
        'callout': '成吉思汗是历史上最大的陆地帝国——蒙古帝国的创建者，他的征服塑造了欧亚大陆的政治版图。',
        'sources': '《蒙古秘史》、拉施特《史集》',
    },
    'p-saladin': {
        'quote': '"胜利不会向我微笑，除非我向真主祈祷。"',
        'callout': '萨拉丁收复耶路撒冷，被西方基督徒和阿拉伯穆斯林共同尊为骑士精神的典范。',
        'sources': '伊本·阿西尔《历史大全》、博恩《萨拉丁传》',
    },
    'p-constantine': {
        'quote': '"In hoc signo vinces."（以这个标志，你将获胜。）',
        'callout': '君士坦丁大帝使基督教合法化并定都拜占庭，深刻塑造了欧洲文明的精神面貌。',
        'sources': '尤西比乌斯《君士坦丁传》、苏格拉底《教会史》',
    },
    'p-napoleon': {
        'quote': '"Impossible n\'est pas français."（不可能不是法语词。）',
        'callout': '拿破仑的军事天才和法典改革影响深远，《拿破仑法典》是现代民法的奠基之作。',
        'sources': '《拿破仑法典》、罗斯《拿破仑传》',
    },
    'p-victoria': {
        'quote': '"We are not interested in the possibilities of defeat."（我们对失败的可能性不感兴趣。）',
        'callout': '维多利亚女王在位 63 年（1837-1901），"维多利亚时代"是大英帝国的鼎盛时期。',
        'sources': '《维多利亚女王日记》、斯特雷奇《维多利亚女王传》',
    },
    'p-marcus-aurelius': {
        'quote': '"宇宙是变化的，人生是多舛的。"',
        'callout': '马可·奥勒留是斯多葛学派的代表人物，他的《沉思录》是西方哲学的经典之作。',
        'sources': '《沉思录》、卡西乌斯·迪奥《罗马史》',
    },
    'p-ramses-ii': {
        'quote': '"我就是昨日，今日，明日。"',
        'callout': '拉美西斯二世在位 66 年，缔造了古埃及新王国最后的辉煌，建造了阿布辛贝神庙。',
        'sources': '《亡灵书》、希罗多德《历史》',
    },
    'p-hammurabi': {
        'quote': '"为了使强不凌弱，为了使孤寡各得其所，为了使正义昭彰于天下，我立此石碑。"',
        'callout': '《汉谟拉比法典》是人类历史上最早的成文法典之一，奠定了巴比伦的法律传统。',
        'sources': '《汉谟拉比法典》石碑铭文',
    },
    'p-alexander': {
        'quote': '"I am not afraid of the death of soldiers, but I am afraid of the cowardice of generals."',
        'callout': '亚历山大大帝建立了横跨欧亚非三大洲的马其顿帝国，促进了希腊文化与东方文明的融合。',
        'sources': '普鲁塔克《亚历山大传》、阿里安《亚历山大远征记》',
    },
    'p-laozi': {
        'quote': '"道可道，非常道；名可名，非常名。"',
        'callout': '老子是道家学派的创始人，《道德经》是中华文明最重要的经典之一。',
        'sources': '《道德经》、司马迁《史记·老子列传》',
    },
    'p-zhuangzi': {
        'quote': '"吾生也有涯，而知也无涯。"',
        'callout': '庄子继承和发展了老子的道家思想，其哲学的浪漫与超脱深刻影响了中国艺术与文学。',
        'sources': '《庄子》、郭象《庄子注》',
    },
    'p-mencius': {
        'quote': '"得天下有道：得其民，斯得天下矣。"',
        'callout': '孟子被尊为"亚圣"，是儒家学派最重要的代表人物之一，其性善论和仁政思想影响深远。',
        'sources': '《孟子》、司马迁《史记·孟子荀卿列传》',
    },
    'p-sun-tzu': {
        'quote': '"兵者，诡道也。"',
        'callout': '《孙子兵法》是世界上最早的军事著作之一，至今仍是军事院校的必读经典。',
        'sources': '《孙子兵法》、曹操《孙子略解》',
    },
    'p-han-xin': {
        'quote': '"韩信点兵，多多益善。"',
        'callout': '韩信是汉初三杰之一，他指挥的垓下之战最终奠定了汉朝天下。',
        'sources': '《史记·淮阴侯列传》、班固《汉书》',
    },
    'p-zhuge-liang': {
        'quote': '"鞠躬尽瘁，死而后已。"',
        'callout': '诸葛亮是三国时期蜀汉丞相，其忠诚和智慧使其成为中国历史上最受推崇的宰相之一。',
        'sources': '《三国志·蜀书·诸葛亮传》、《出师表》',
    },
    'p-yue-fei': {
        'quote': '"精忠报国。"',
        'callout': '岳飞是南宋抗金名将，其"精忠报国"的精神成为中华民族爱国主义的象征。',
        'sources': '《宋史·岳飞传》、岳飞《满江红》',
    },
    'p-wen-tianxiang': {
        'quote': '"人生自古谁无死，留取丹心照汗青。"',
        'callout': '文天祥是南宋末代丞相，其浩然正气和不屈精神是中华民族的精神丰碑。',
        'sources': '《宋史·文天祥传》、文天祥《过零丁洋》',
    },
    'p-zheng-chenggong': {
        'quote': '"台湾者，中国之土地也，久为贵国所据，今余既来索，则地当还我。"',
        'callout': '郑成功收复台湾，结束了荷兰在台湾 38 年的殖民统治，是中华民族反抗外来侵略的典范。',
        'sources': '《台湾通史》、《清史稿·郑成功传》',
    },
    'p-li-shizhen': {
        'quote': '"医者，仁术也。"',
        'callout': '李时珍的《本草纲目》是中医最重要的药物学著作，被翻译成多国文字，影响世界医药学。',
        'sources': '《本草纲目》、《本草纲目图》',
    },
    'p-su-song': {
        'quote': '"观天之器，莫不穷理。"',
        'callout': '苏颂主持建造的水运仪象台是世界上最早的天文钟，集天文观测、报时、演示于一体。',
        'sources': '苏颂《新仪象法要》',
    },
    'p-sakyamuni': {
        'quote': '"一切众生皆有如来智慧德相，但以妄想执着不能证得。"',
        'callout': '释迦牟尼创立了世界三大宗教之一的佛教，其"四圣谛""八正道"等教义影响东亚文明数千年。',
        'sources': '《金刚经》、《法华经》、原始佛教经典',
    },
    'p-muhammad': {
        'quote': '"即使你看到太阳和月亮向你奔来，也不要恐惧，真主与你同在。"',
        'callout': '穆罕默德是伊斯兰教的创立者，他统一了阿拉伯半岛，奠定了现代伊斯兰世界的基础。',
        'sources': '《古兰经》、伊本·伊斯哈格《先知传》',
    },
    'p-christ-jesus': {
        'quote': '"爱你的邻人如同爱你自己。"',
        'callout': '耶稣是基督教的创始人和中心人物，其教导"爱""宽恕""救赎"塑造了西方文明的精神内核。',
        'sources': '《新约圣经》、福音书',
    },
    'p-zheng-he': {
        'quote': '"欲国家富强，不可置海洋于不顾。"',
        'callout': '郑和七下西洋（1405-1433）是人类航海史上的伟大壮举，比欧洲大航海时代早近一个世纪。',
        'sources': '《瀛涯胜览》、《星槎胜览》、《明史·郑和传》',
    },
    'p-columbus': {
        'quote': '"Genovés, hijo de la mar."（热那亚人，大海之子。）',
        'callout': '哥伦布 1492 年的航行开启了欧洲与美洲的接触，"新大陆"的发现改变了世界历史进程。',
        'sources': '哥伦布《航海日志》、莫里森《哥伦布传》',
    },
    'p-magellan': {
        'quote': '"La iglesia es quien debe decidir la longitud del año."',
        'callout': '麦哲伦船队完成了人类首次环球航行（1519-1522），证明了地球是圆的。',
        'sources': '安东尼奥·皮加费塔《环球航行记》、斯蒂芬·茨威格《麦哲伦传》',
    },
    'p-da-vinci': {
        'quote': '"学习是永不疲倦的。"',
        'callout': '达·芬奇是文艺复兴时期最伟大的全才之一，集画家、科学家、工程师、发明家于一身。',
        'sources': '《达·芬奇笔记》、瓦萨里《艺苑名人传》',
    },
    'p-newton': {
        'quote': '"如果我看得更远，那是因为我站在巨人的肩膀上。"',
        'callout': '牛顿的经典力学奠定了现代物理学的基础，《自然哲学的数学原理》是科学革命的巅峰之作。',
        'sources': '《自然哲学的数学原理》、《光学》',
    },
    'p-einstein': {
        'quote': '"Imagination is more important than knowledge."（想象力比知识更重要。）',
        'callout': '爱因斯坦的相对论彻底改变了人类对时间、空间、引力本质的理解。',
        'sources': '《相对论的意义》、《爱因斯坦文集》',
    },
    'p-gutenberg': {
        'quote': '"印刷术将使所有人共享知识的光芒。"',
        'callout': '古腾堡发明的金属活字印刷术（1450 年前后）引发了信息传播革命，被誉为"西方最重要的发明之一"。',
        'sources': '《古腾堡传》、艾森斯坦《作为变革动因的印刷机》',
    },
    'p-washington': {
        'quote': '"Liberty, when it begins to take root, is a plant of rapid growth."',
        'callout': '乔治·华盛顿是美国国父，他拒绝连任第三任总统，开创了和平移交权力的民主传统。',
        'sources': '《乔治·华盛顿文集》、弗莱克诺《华盛顿传》',
    },
    'p-lincoln': {
        'quote': '"民有、民治、民享的政府"',
        'callout': '林肯领导美国度过了南北战争，颁布《解放黑奴宣言》，维护了联邦统一。',
        'sources': '《林肯选集》、桑德堡《林肯传》',
    },
    'p-luther': {
        'quote': '"Here I stand, I can do no other."（我站在这里，只能如此。）',
        'callout': '马丁·路德发动的宗教改革（1517 年）打破了天主教会的统一，建立了新教传统。',
        'sources': '《九十五条论纲》、路德《论基督徒的自由》',
    },
    'p-socrates': {
        'quote': '"认识你自己。"',
        'callout': '苏格拉底的"产婆术"和伦理哲学奠定了西方哲学的基础，被誉为"西方哲学之父"。',
        'sources': '柏拉图对话录、色诺芬《苏格拉底回忆录》',
    },
    'p-plato': {
        'quote': '"哲学始于惊奇。"',
        'callout': '柏拉图创立了"理念论"，建立了西方最早的哲学学院——阿卡德米学园。',
        'sources': '柏拉图《理想国》、《会饮篇》、第欧根尼·拉尔修《名哲言行录》',
    },
    'p-aristotle': {
        'quote': '"吾爱吾师，吾更爱真理。"',
        'callout': '亚里士多德是百科全书式的学者，奠定了逻辑学、政治学、生物学等多门学科的基础。',
        'sources': '亚里士多德《尼各马可伦理学》、《政治学》',
    },
    'p-homer': {
        'quote': '"歌唱吧，缪斯，歌唱佩洛普斯之子阿喀琉斯的愤怒。"',
        'callout': '荷马的《伊利亚特》《奥德赛》是西方文学的源头，是整个西方文明的奠基之作。',
        'sources': '《荷马史诗》、丘尔《荷马导论》',
    },
    'p-shakespeare': {
        'quote': '"To be, or not to be, that is the question."',
        'callout': '莎士比亚是英国文学史上最伟大的剧作家，其作品塑造了英语语言和西方戏剧艺术。',
        'sources': '《莎士比亚全集》、本·琼森评注',
    },
    'p-michelangelo': {
        'quote': '"每块大理石中都藏着一个雕塑，我所做的只是去掉多余的部分。"',
        'callout': '米开朗基罗的《大卫》《西斯廷圣母》和圣彼得大教堂穹顶是文艺复兴艺术的巅峰。',
        'sources': 'Condivi《米开朗基罗传》、瓦萨里《艺苑名人传》',
    },
    'p-van-gogh': {
        'quote': '"我希望我的画能传达我对生活的热爱。"',
        'callout': '梵高的后印象派绘画（如《星月夜》《向日葵》）以浓烈色彩和旋转笔触开创了现代绘画的新路径。',
        'sources': '《梵高书信集》、纳博科夫《梵高传》',
    },
    'p-wang-wei': {
        'quote': '"行到水穷处，坐看云起时。"',
        'callout': '王维被誉为"诗佛"，其诗画合一的作品将禅意与山水融为一体。',
        'sources': '《王右丞集》、苏轼评王维"诗中有画，画中有诗"',
    },
    'p-lu-you': {
        'quote': '"位卑未敢忘忧国，事定犹须待阖棺。"',
        'callout': '陆游是南宋爱国诗人，其诗作充满对国家破碎的悲愤与对统一的渴望。',
        'sources': '《剑南诗稿》、《陆游集》',
    },
    'p-bai-juyi': {
        'quote': '"文章合为时而著，歌诗合为事而作。"',
        'callout': '白居易的诗通俗易懂、反映社会现实，《长恨歌》《琵琶行》是唐诗中的千古名篇。',
        'sources': '《白氏长庆集》、白居易《新乐府运动》',
    },
    'p-qu-yuan': {
        'quote': '"路漫漫其修远兮，吾将上下而求索。"',
        'callout': '屈原是中国浪漫主义文学的奠基人，《离骚》《天问》等楚辞开创了中国文学的新传统。',
        'sources': '《楚辞》、司马迁《史记·屈原贾生列传》',
    },
    'p-cao-cao': {
        'quote': '"宁教我负天下人，休教天下人负我。"',
        'callout': '曹操是三国时期最杰出的政治家、军事家和诗人之一，统一了北方中国。',
        'sources': '《三国志·魏书·武帝纪》、曹操《短歌行》',
    },
    'p-bao-zheng': {
        'quote': '"法不阿贵，绳不挠曲。"',
        'callout': '包拯是中国历史上最受人民爱戴的清官之一，"包青天"成为公正廉洁的代名词。',
        'sources': '《宋史·包拯传》、元明清包公戏',
    },
    'p-li-bing': {
        'quote': '"深淘滩，低作堰。"',
        'callout': '李冰父子主持修建的都江堰至今仍在发挥作用（已 2200 多年），是世界水利史上的奇迹。',
        'sources': '《史记·河渠书》、常璩《华阳国志》',
    },
    'p-wei-zheng': {
        'quote': '"兼听则明，偏信则暗。"',
        'callout': '魏徵是唐太宗最著名的谏臣，以直言敢谏闻名，"人镜"之誉流芳百世。',
        'sources': '《旧唐书·魏徵传》、吴兢《贞观政要》',
    },
    'p-ouyang-xiu': {
        'quote': '"醉翁之意不在酒，在乎山水之间也。"',
        'callout': '欧阳修是北宋文坛领袖，"唐宋八大家"之一，《醉翁亭记》是千古名篇。',
        'sources': '《欧阳文忠公文集》、《新五代史》',
    },
    'p-zhang-heng': {
        'quote': '"研核阴阳，妙尽璇机之正。"',
        'callout': '张衡发明了世界上最早的地动仪，比欧洲同类仪器早 1700 多年。',
        'sources': '《后汉书·张衡传》、范晔《后汉书》',
    },
    'p-cui-zhongshi': {
        'quote': '"圆周率，密率也。"',
        'callout': '祖冲之将圆周率精确到小数点后 7 位（3.1415926-3.1415927），领先世界近千年。',
        'sources': '《南齐书·祖冲之传》、《缀术》',
    },
    'p-shen-kuo': {
        'quote': '"以磁石磨针锋，则能指南。"',
        'callout': '沈括的《梦溪笔谈》是一部百科全书式的科学著作，记录了活字印刷、指南针等重要发明。',
        'sources': '《梦溪笔谈》、胡道静《梦溪笔谈校证》',
    },
    'p-cai-lun': {
        'quote': '"旧麻布，捣烂成浆，可作纸。"',
        'callout': '蔡伦改进的造纸术（105 年）使纸张成本大幅降低，深刻影响了世界文明的传播。',
        'sources': '《后汉书·蔡伦传》、范晔《后汉书》',
    },
    'p-song-huizong': {
        'quote': '"瘦金书，铁画银钩。"',
        'callout': '宋徽宗创立的"瘦金体"是中国书法史上的瑰宝，但其昏庸也直接导致了"靖康之耻"。',
        'sources': '《宋史·徽宗本纪》、《宣和画谱》',
    },
    'p-ming-yongle': {
        'quote': '"朕为天子，当以威服天下。"',
        'callout': '明成祖永乐帝迁都北京、编撰《永乐大典》、派郑和下西洋，缔造了"永乐盛世"。',
        'sources': '《明史·成祖本纪》、《明实录》',
    },
    'p-qing-kangxi': {
        'quote': '"治天下之道，莫大于礼。"',
        'callout': '康熙帝在位 61 年（1661-1722），平三藩、收台湾、平定噶尔丹，开创"康乾盛世"。',
        'sources': '《清史稿·圣祖本纪》、《康熙起居注》',
    },
}

def make_facts(p):
    by, dy = p.get('birthYear'), p.get('deathYear')
    lifespan = f'{fmt_year(by)} — {fmt_year(dy)}（{dy - by} 岁）' if by and dy else '生卒年不详'
    cat = p['category']
    return [
        {'label': '姓名', 'value': p['name']},
        {'label': '身份', 'value': p['role']},
        {'label': '生卒年', 'value': lifespan},
        {'label': '人物分类', 'value': CAT_NAME.get(cat, cat)},
        {'label': '所属朝代/文明', 'value': '、'.join(p.get('eraIds', [])[:2]) or '不详'},
        {'label': '主要关系', 'value': str(len(p.get('relatedFigureIds', []))) + ' 位关联人物'},
    ]

def make_sections(p):
    s = p.get('description', '')
    title = p['name']
    cat = p['category']
    details = PERSON_DETAILS.get(p['id']) or {}
    quote = details.get('quote', '"历史是人民群众创造的。" — 名言')
    callout = details.get('callout', '**' + title + '** 是 ' + CAT_NAME.get(cat, '') + ' 类人物的杰出代表，其生平事迹对后世产生了深远影响。')
    works = p.get('culturalWorks', [])
    works_str = '、'.join(works[:4]) if works else '无'
    return [
        {'type': 'paragraph', 'heading': '人物生平', 'body': s},
        {'type': 'paragraph', 'heading': '历史地位', 'body': '**' + title + '** 是 ' + CAT_NAME.get(cat, '') + ' 类人物中的杰出代表，其生平事迹、思想著作、治国方略对后世产生了深远影响。在中国/世界历史的长河中，' + title + ' 的角色被反复诠释与评价，成为一个时代的标志。'},
        {'type': 'callout', 'heading': '核心贡献', 'body': callout, 'variant': 'info'},
        {'type': 'callout', 'heading': '学习视角', 'body': '研究 **' + title + '** 应关注：①其历史背景（时代特征）；②主要成就（制度/思想/作品）；③对后世的影响（思想流变、文化符号）；④不同历史时期的评价变迁。', 'variant': 'success'},
        {'type': 'list', 'heading': '关键要素', 'items': [
            '**代表作/思想**：' + works_str,
            '**所属朝代**：' + ('、'.join(p.get('eraIds', [])) or '不详'),
            '**关联人物**：' + str(len(p.get('relatedFigureIds', []))) + ' 位',
            '**历史定位**：' + CAT_NAME.get(cat, '') + '类 · ' + ('一流' if cat in ('politician', 'thinker', 'religious') else '杰出'),
        ]},
        {'type': 'quote', 'text': quote, 'cite': title + ' · 名言'},
    ]

def make_timeline(p):
    by, dy = p.get('birthYear'), p.get('deathYear')
    if not by or not dy:
        return [{'year': '不详', 'event': '生卒年不详'}]
    life = dy - by
    return [
        {'year': fmt_year(by), 'event': '出生，进入历史舞台'},
        {'year': fmt_year(by + life // 4), 'event': '青年时期，求学/初入仕途'},
        {'year': fmt_year(by + life // 2), 'event': '中年时期，事业巅峰 / 主要成就'},
        {'year': fmt_year(by + 3 * life // 4), 'event': '后期，经验成熟 / 传承思想'},
        {'year': fmt_year(dy), 'event': '去世，留下遗产供后人评说'},
    ]

def imgs_for(p):
    cat = p['category']
    name_en = {
        'p-qin-shi-huang': 'qin shihuang terracotta warrior',
        'p-han-wudi': 'han wudi portrait',
        'p-tang-taizong': 'tang taizong li shimin',
        'p-confucius': 'confucius portrait temple',
        'p-li-bai': 'li bai poet drinking wine',
        'p-du-fu': 'du fu poet',
        'p-genghis-khan': 'genghis khan portrait',
        'p-saladin': 'saladin muslim leader',
        'p-constantine': 'constantine emperor christian',
        'p-napoleon': 'napoleon bonaparte portrait',
        'p-newton': 'isaac newton scientist',
        'p-einstein': 'albert einstein portrait',
        'p-da-vinci': 'leonardo da vinci self portrait',
        'p-shakespeare': 'shakespeare portrait',
        'p-columbus': 'columbus explorer portrait',
        'p-magellan': 'magellan explorer globe',
    }.get(p['id'], p['name'] + ' historical portrait')
    return [
        {'imageKeyword': name_en + ' classic painting', 'caption': p['name'] + ' · 经典画像/油画'},
        {'imageKeyword': name_en + ' statue monument', 'caption': p['name'] + ' · 雕塑/纪念碑'},
        {'imageKeyword': p['name'] + ' manuscript artifact', 'caption': p['name'] + ' · 手稿/文物'},
        {'imageKeyword': name_en + ' era artwork', 'caption': p['name'] + ' · 时代背景艺术'},
    ]

def make_related(p, all_people):
    related = []
    # Same category, exclude self
    same_cat = [q for q in all_people if q['category'] == p['category'] and q['id'] != p['id']]
    for q in same_cat[:2]:
        related.append({'id': q['id'], 'title': q['name'], 'reason': '同属' + CAT_NAME.get(q['category'], '') + '类，可比较贡献'})
    # Same era
    p_eras = set(p.get('eraIds', []))
    same_era = [q for q in all_people if q['id'] != p['id'] and any(e in p_eras for e in q.get('eraIds', []))]
    for q in same_era[:2]:
        if not any(r['id'] == q['id'] for r in related):
            related.append({'id': q['id'], 'title': q['name'], 'reason': '同朝代/时代人物'})
    # Direct relatedFigureIds
    for rel in (p.get('relatedFigureIds') or [])[:2]:
        if not any(r['id'] == rel['id'] for r in related):
            q = next((x for x in all_people if x['id'] == rel['id']), None)
            if q:
                rel_zh = {'rival': '对手', 'mentor': '师长', 'successor': '后继', 'contemporary': '同时代', 'family': '家族'}
                related.append({'id': q['id'], 'title': q['name'], 'reason': rel_zh.get(rel.get('type'), '关联人物')})
    return related[:5]

def make_source(p):
    details = PERSON_DETAILS.get(p['id']) or {}
    return '📚 ' + details.get('sources', '正史典籍综合（《二十四史》《史记》《资治通鉴》、西方现代史学著作等）')

# Build enrichment
for p in data:
    p['facts'] = make_facts(p)
    p['sections'] = make_sections(p)
    p['timeline'] = make_timeline(p)
    p['images'] = imgs_for(p)
    p['related'] = make_related(p, data)
    p['source'] = make_source(p)

# Write back
SRC.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Wrote enriched people.json with {len(data)} entries')
