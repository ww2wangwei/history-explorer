# === ce-014 敦煌莫高窟 ===
ENRICH['ce-014'] = {
    'facts': [
        {'label': '始建', 'value': '前秦建元二年（AD 366）'},
        {'label': '延续', 'value': '至元代（AD 14 世纪）约 1000 年'},
        {'label': '洞窟数', 'value': '现存 735 个（其中有壁画 492 个）'},
        {'label': '壁画面积', 'value': '约 4.5 万平方米'},
        {'label': '塑像', 'value': '2415 尊'},
        {'label': '世遗', 'value': '1987 年列入世界文化遗产'},
    ],
    'sections': [
        P('开凿背景', '敦煌莫高窟位于河西走廊西端、丝绸之路要冲。前秦建元二年（366），乐僔和尚路经鸣沙山，忽见金光如佛，遂开凿第一窟。此后历经十六国、北魏、隋、唐、五代、宋、西夏、元，**千年不断开凿**。'),
        P('艺术宝库', '莫高窟集建筑、雕塑、壁画三位一体：**壁画面积 4.5 万平方米**（相当于 6 个足球场），题材包括佛教故事、丝路商旅、社会生活、服饰演变。**是研究中世纪欧亚大陆文明的视觉百科全书**。'),
        C('藏经洞的悲剧', '清光绪二十六年（1900），道士王圆箓发现藏经洞（17 窟），内藏**5 万余件**写本、刻本、织绣、绘画。1907-1914 年间，**英国斯坦因、法国伯希和、日本橘瑞超、俄国人奥登堡**等先后骗购走约 4 万件，写本流散英、法、俄、日。', 'warning'),
        L('洞窟分期', ['十六国·北魏（早期，BC 366-580）', '隋代（统一风格，AD 581-618）', '唐代（黄金期，AD 618-907）', '五代·宋（回落，AD 907-1279）', '西夏·元（晚期，AD 1038-1368）']),
        P('国际敦煌学', '敦煌文献催生了**敦煌学**——以敦煌遗书和敦煌艺术为研究对象的国际显学。"国学大师"**陈寅恪**曰："敦煌者，吾国学术之伤心史也。"'),
        Q('"敦者，大也；煌者，盛也。"', '《尚书·禹贡》释敦煌'),
    ],
    'timeline': [
        {'year': 'AD 366', 'era': '前秦', 'event': '乐僔开凿**第一窟**'},
        {'year': 'AD 618', 'era': '唐', 'event': '莫高窟**黄金时代**'},
        {'year': 'AD 781', 'era': '唐', 'event': '**吐蕃**占领敦煌（藏经洞文献期）'},
        {'year': 'AD 1900', 'era': '清', 'event': '王圆箓发现**藏经洞**'},
        {'year': 'AD 1987', 'era': '当代', 'event': '莫高窟列入**世界遗产**'},
    ],
    'images': [
        {'imageKeyword': 'mogao caves dunhuang mural', 'caption': '莫高窟壁画', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'nine rank goddess flying apsaras', 'caption': '飞天壁画（敦煌标志）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'dunhuang library cave manuscripts', 'caption': '藏经洞文献', 'credit': 'British Library'},
        {'imageKeyword': 'mogaoku buddha statue large', 'caption': '莫高窟大佛', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'tr-art-painting', 'title': '中国壁画', 'reason': '敦煌壁画是巅峰'},
        {'id': 'tr-religion-buddhism', 'title': '佛教传播', 'reason': '敦煌是佛教东传枢纽'},
        {'id': 'era-tang', 'title': '唐朝', 'reason': '敦煌黄金期'},
        {'id': 'tr-region-overview', 'title': '河西走廊', 'reason': '敦煌地理归属'},
    ],
    'source': '📚 敦煌研究院《敦煌石窟全集》、荣新江《敦煌学十八讲》、斯坦因《Serindia》',
}

# === ce-015 科举制度 ===
ENRICH['ce-015'] = {
    'facts': [
        {'label': '正式确立', 'value': '隋大业三年（AD 605）'},
        {'label': '延续', 'value': '至清光绪三十一年（1905）共 1300 年'},
        {'label': '创始皇帝', 'value': '隋炀帝（杨广）'},
        {'label': '考试层次', 'value': '乡试（省）→ 会试（京）→ 殿试（皇帝）'},
        {'label': '影响', 'value': '打破世族垄断 / 中央集权利器'},
        {'label': '废除', 'value': '清末新政，1905 年正式废除'},
    ],
    'sections': [
        P('制度起源', '隋朝建立前，选官主要靠**察举制**（地方推荐）和**九品中正制**（魏晋，按门第评等）。大业三年（605），隋炀帝杨广**设进士科**，标志着科举制度正式建立——以考试选拔人才，取代门第世袭。'),
        P('制度演进', '唐代科举分常科（每年）与制科（皇帝特旨）；宋代王安石变法改革考试内容；明清科举定型为**八股文**（固定格式）。考试分三级：①乡试（省级，三年一次，中举人）；②会试（京城，中贡士）；③殿试（皇帝亲策，赐进士）。'),
        C('历史功过', '科举制打破**世族垄断**，使寒门子弟通过读书改变命运，**促进社会阶层流动**。但明清八股禁锢思想，导致近代中国科技落后。其废除（1905）也是清末新政重要内容。', 'info'),
        L('制度层次', ['**童试**（县、府、院）→秀才', '**乡试**（省）→举人', '**会试**（京）→贡士', '**殿试**（皇帝）→进士（分三甲）']),
        P('历史遗产', '**科举制是中国的"第五大发明"**——西方文官制度（19 世纪英国）明显借鉴科举。法国启蒙思想家伏尔泰、孟德斯鸠都盛赞中国科举。'),
        Q('"上品无寒门，下品无士族。"', '《晋书·刘毅传》论九品中正制流弊'),
    ],
    'timeline': [
        {'year': 'AD 605', 'era': '隋', 'event': '**隋炀帝** 设进士科'},
        {'year': 'AD 742', 'era': '唐', 'event': '**李白**应诏入翰林'},
        {'year': 'AD 1069', 'era': '北宋', 'event': '**王安石** 改革科举'},
        {'year': 'AD 1427', 'era': '明', 'event': '科举定型为**八股文**'},
        {'year': 'AD 1905', 'era': '清末', 'event': '**科举制度** 正式废除'},
    ],
    'images': [
        {'imageKeyword': 'imperial examination china ancient', 'caption': '科举考试图（古代绘画）', 'credit': '公共领域'},
        {'imageKeyword': 'palace examination hall ming', 'caption': '明代贡院', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'eight legged essay examination paper', 'caption': '八股文试卷', 'credit': '公共领域'},
        {'imageKeyword': 'sui yangdi emperor portrait', 'caption': '隋炀帝像', 'credit': '公共领域'},
    ],
    'related': [
        {'id': 'era-sui', 'title': '隋朝', 'reason': '科举创始朝代'},
        {'id': 'era-tang', 'title': '唐朝', 'reason': '科举完善期'},
        {'id': 'tr-history-intro', 'title': '中国制度史', 'reason': '选官制度演进'},
        {'id': 'p-du-fu', 'title': '杜甫', 'reason': '科举未中典型'},
    ],
    'source': '📚 《新唐书·选举志》、刘海峰《科举学导论》、邓嗣禹《中国考试制度史》',
}

# === ce-016 本草纲目 ===
ENRICH['ce-016'] = {
    'facts': [
        {'label': '作者', 'value': '李时珍'},
        {'label': '成书年代', 'value': 'AD 1578 年（嘉靖三十一年）'},
        {'label': '初刊', 'value': 'AD 1596 年（金陵胡承龙刊本）'},
        {'label': '收录药物', 'value': '1892 种（新增 374 种）'},
        {'label': '插图', 'value': '1109 幅'},
        {'label': '字数', 'value': '约 190 万字'},
    ],
    'sections': [
        P('作者背景', '李时珍（1518-1593），湖北蕲春人，三代从医。他发现历代本草谬误甚多，决意重修。**27 年（1552-1578）撰成《本草纲目》**，参考 800 余种文献，亲历山川采药，访求四方。'),
        P('体系创新', '《本草纲目》打破历代《本草》按"上中下三品"分类，**首创"析族区类，振纲分目"**——按水、火、土、金石、草、谷、菜、果、木、服器、虫、鳞、介、禽、兽、人 16 部 60 类，体系严密。'),
        C('东方医药百科', '《本草纲目》是中国古代**最系统、最完整的药物学著作**，集 16 世纪前中国药学之大成。它被译为日、朝、拉丁、英、法、德、俄等多国文字，**影响全球药物学 400 年**。', 'success'),
        L('部类结构', ['水部（天水、地水）', '火部（土火、水火）', '土部（各种土壤）', '金石部（金、玉、石）', '草部（山草、芳草等 11 类）', '木部（乔木、灌木等 6 类）']),
        P('李时珍精神', '为编此书，李时珍**三次考功名不第**（秀才），转而从医；为采药亲自上山，**曾中毒七八次**；为验证"腐草为萤"之说，**夜宿茅亭数月**观察萤火虫——这种实证精神超越时代。'),
        Q('"医者，贵在格物。"', '李时珍引《本草纲目·凡例》'),
    ],
    'timeline': [
        {'year': 'AD 1552', 'era': '明嘉靖', 'event': '李时珍开始编撰'},
        {'year': 'AD 1578', 'era': '明万历', 'event': '《**本草纲目**》完稿'},
        {'year': 'AD 1596', 'era': '明万历', 'event': '**金陵**胡承龙首刻'},
        {'year': 'AD 1656', 'era': '清', 'event': '波兰人**卜弥格**译为拉丁文'},
        {'year': 'AD 1856', 'era': '近代', 'event': '英国人**达利** 译为英文'},
    ],
    'images': [
        {'imageKeyword': 'li shizhen physician portrait ming', 'caption': '李时珍画像', 'credit': '公共领域'},
        {'imageKeyword': 'bencao gangmu compendium book', 'caption': '《本草纲目》书影', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'chinese herbal medicine herbs', 'caption': '传统中草药', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'chinese herbal illustration drawing', 'caption': '本草插图', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-li-shizhen', 'title': '李时珍', 'reason': '作者'},
        {'id': 'era-ming', 'title': '明朝', 'reason': '成书年代'},
        {'id': 'tr-tech-med', 'title': '中医药', 'reason': '中医药集大成'},
        {'id': 'tr-history-intro', 'title': '中国科技史', 'reason': '百科全书式著作'},
    ],
    'source': '📚 李时珍《本草纲目》、钱超尘《本草纲目译注》、E. Bretschneider《Botanicon Sinicum》',
}

# === ce-017 蒙娜丽莎 ===
ENRICH['ce-017'] = {
    'facts': [
        {'label': '作者', 'value': '列奥纳多·达·芬奇'},
        {'label': '年代', 'value': '约 AD 1503-1519'},
        {'label': '尺寸', 'value': '77 × 53 cm（小型油画）'},
        {'label': '现藏', 'value': '巴黎卢浮宫'},
        {'label': '模特', 'value': '丽莎·乔宫多（佛罗伦萨丝绸商之妻）'},
        {'label': '影响', 'value': '西方艺术最著名的画作'},
    ],
    'sections': [
        P('创作背景', '约 1503 年，列奥纳多·达·芬奇（Leonardo da Vinci）应佛罗伦萨丝绸商人**弗朗切斯科·乔宫多**之托，为其妻**丽莎·乔宫多**（Lisa Gherardini del Giocondo）绘制肖像。达·芬奇 1506 年中断创作，1517 年法国国王弗朗索瓦一世邀请他赴法，画家把画带到法国。1519 年达·芬奇去世，此画留法国王室。'),
        P('艺术突破', '《蒙娜丽莎》代表文艺复兴艺术的最高成就：①**晕涂法（sfumato）**——以极薄透明油彩层叠形成烟雾般柔和过渡；②**金字塔构图**——人物姿态稳定庄严；③**背景大气透视**——远景山水如梦似幻；④**神秘微笑**——嘴角阴影处理使表情随观者角度变化。'),
        C('蒙娜丽莎效应', '这幅画的**艺术价值**已被超越为**文化符号**：1911 年被盗、1956 年被泼酸、2006 年被杯砸——但每一次"灾难"都使其知名度倍增。如今《蒙娜丽莎》是**全球最著名的画作**，每天约 30000 人在卢浮宫前排队观看。', 'success'),
        L('艺术特点', ['**晕涂法**（sfumato）柔和过渡', '**金字塔构图** 平衡稳定', '**背景虚化** 空气透视', '**解剖学**精确——达·芬奇兼任解剖学家', '**光学应用**——嘴唇阴影营造微笑']),
        P('未解之谜', '画作留下诸多谜团：①模特究竟是谁？②背景山水是哪里？④画作原本大小？⑤是否藏在达·芬奇自画像？这些问题至今没有定论，**给后世无数再创作以空间**。'),
        Q('"艺术乃大自然的镜像。"', '达·芬奇《笔记》'),
    ],
    'timeline': [
        {'year': 'AD 1503', 'era': '文艺复兴', 'event': '达·芬奇开始创作'},
        {'year': 'AD 1517', 'era': '文艺复兴', 'event': '达·芬奇将画带至**法国**'},
        {'year': 'AD 1519', 'era': '文艺复兴', 'event': '达·芬奇去世，画归**法王**'},
        {'year': 'AD 1911', 'era': '近代', 'event': '**卢浮宫**失窃案（两年后追回）'},
        {'year': 'AD 1962', 'era': '当代', 'event': '法国法律定为**国宝**禁止外借'},
    ],
    'images': [
        {'imageKeyword': 'mona lisa painting louvre', 'caption': '《蒙娜丽莎》原作', 'credit': 'Louvre / Wikimedia'},
        {'imageKeyword': 'leonardo da vinci portrait', 'caption': '达·芬奇自画像', 'credit': '公共领域'},
        {'imageKeyword': 'renaissance florence skyline', 'caption': '文艺复兴佛罗伦萨', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'louvre museum pyramid paris', 'caption': '卢浮宫金字塔', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-leonardo', 'title': '达·芬奇', 'reason': '作者'},
        {'id': 'era-renaissance', 'title': '文艺复兴', 'reason': '创作背景'},
        {'id': 'tr-history-art', 'title': '西方艺术', 'reason': '文艺复兴巅峰'},
        {'id': 'ce-018', 'title': '西斯廷教堂', 'reason': '同时代艺术高峰'},
    ],
    'source': '📚 Zöllner《Leonardo da Vinci: The Complete Paintings》、Kemp《Leonardo》、卢浮宫档案',
}

# === ce-018 西斯廷教堂天顶画 ===
ENRICH['ce-018'] = {
    'facts': [
        {'label': '作者', 'value': '米开朗琪罗'},
        {'label': '年代', 'value': 'AD 1508-1512'},
        {'label': '位置', 'value': '梵蒂冈西斯廷礼拜堂'},
        {'label': '面积', 'value': '约 460 平方米'},
        {'label': '人物数', 'value': '343 人（9 个圣经场景）'},
        {'label': '意义', 'value': '文艺复兴盛期艺术巅峰'},
    ],
    'sections': [
        P('创作背景', '1508 年教皇**尤利乌斯二世**委托 33 岁的米开朗琪罗为西斯廷礼拜堂绘制天顶。原计划由他人完成，但米开朗琪罗自告奋勇。**他以 4 年时间（1508-1512），独自仰头作画**，留下终身颈疾。'),
        P('画面结构', '天顶画分三部分：①中央 9 幅《创世纪》场景（上帝造世界、亚当堕落、诺亚方舟）；②周围 12 位先知与女预言家；③四角的旧约故事。**壁画按建筑结构精确对位**，中央是神创造人，最外圈是人类历史。'),
        C('孤身四年', '米开朗琪罗**独自一人**完成全部工作——拒绝助手，亲自调配颜料（湿壁画需当天完成）。他说："我画得精疲力竭，几乎像只猫——但我没有别的选择。"**这种为艺术献身的精神**成为文艺复兴艺术家的典范。', 'success'),
        L('九幅创世纪', ['**神分光暗**', '**神造日月星辰**', '**神分水陆**', '**神造亚当**（最著名）', '**神造夏娃**', '**原罪逐出乐园**', '**诺亚献祭**', '**大洪水**', '**诺亚醉酒**']),
        P('后续工程', '米开朗琪罗晚年又绘制了西斯廷礼拜堂**祭坛壁画《最后的审判》**（AD 1536-1541），面积 220 平方米，巨型裸体引发争议（后由助手遮掩）。'),
        Q('"我用了所有时间，就像经历了一场缓慢的死亡。"', '米开朗琪罗书信'),
    ],
    'timeline': [
        {'year': 'AD 1508', 'era': '文艺复兴', 'event': '教皇**尤利乌斯二世**委托'},
        {'year': 'AD 1511', 'era': '文艺复兴', 'event': '**天顶画** 主体完成'},
        {'year': 'AD 1512', 'era': '文艺复兴', 'event': '**西斯廷天顶画** 全部完工'},
        {'year': 'AD 1536', 'era': '文艺复兴', 'event': '**《最后的审判》** 开始'},
        {'year': 'AD 1541', 'era': '文艺复兴', 'event': '《最后的审判》完工'},
    ],
    'images': [
        {'imageKeyword': 'sistine chapel ceiling michelangelo', 'caption': '西斯廷教堂天顶画', 'credit': 'Vatican Museums'},
        {'imageKeyword': 'creation of adam michelangelo', 'caption': '《创造亚当》', 'credit': 'Vatican / Wikimedia'},
        {'imageKeyword': 'michelangelo sculptor painter portrait', 'caption': '米开朗琪罗画像', 'credit': '公共领域'},
        {'imageKeyword': 'sistine chapel last judgment', 'caption': '《最后的审判》', 'credit': 'Vatican Museums'},
    ],
    'related': [
        {'id': 'p-michelangelo', 'title': '米开朗琪罗', 'reason': '作者'},
        {'id': 'p-julius-ii', 'title': '尤利乌斯二世', 'reason': '委托人'},
        {'id': 'era-renaissance', 'title': '文艺复兴', 'reason': '创作背景'},
        {'id': 'ce-017', 'title': '蒙娜丽莎', 'reason': '同时代艺术高峰'},
    ],
    'source': '📚 Hall《Michelangelo: The Frescoes of the Sistine Chapel》、Mormando《Michelangelo: A Spiritual Journey》',
}

# === ce-019 古登堡圣经 ===
ENRICH['ce-019'] = {
    'facts': [
        {'label': '印刷者', 'value': '约翰内斯·古登堡'},
        {'label': '年代', 'value': 'AD 1455 年（美因茨）'},
        {'label': '印数', 'value': '约 180 部（其中 49 部存世）'},
        {'label': '页数', 'value': '1282 页'},
        {'label': '文字', 'value': '拉丁文'},
        {'label': '意义', 'value': '西方活字印刷的里程碑'},
    ],
    'sections': [
        P('印刷背景', '1440 年代，德国美因茨金匠**约翰内斯·古登堡**（Johannes Gutenberg）借鉴中国活字技术（经丝绸之路传播），发明**金属活字印刷机**。**1455 年印出《圣经》拉丁文译本**，共 180 部，每部 1282 页，分两卷。'),
        P('技术贡献', '古登堡的关键创新：①**金属合金活字**（铅、锡、锑、铜）；②**油性油墨**（亚麻仁油调和）；③**螺旋压印机**（借用葡萄酒压榨机原理）。三件合在一起使西方印刷进入工业化时代。'),
        C('信息爆炸', '《古登堡圣经》开启**印刷革命**：欧洲书籍年产量从手抄时代的数千册跃升到 1500 年的 1000 万册。这直接催化了**文艺复兴、宗教改革、启蒙运动**——**信息自由流动使现代性成为可能**。', 'success'),
        L('历史影响', ['书籍价格暴跌（手抄本 200 古登堡→印刷本 5 古登堡）', '识字率上升', '**马丁·路德**宗教改革（1517）', '**伽利略**科学著作普及', '**启蒙运动**思想传播']),
        P('成本问题', '古登堡为印《圣经》**耗尽家财**，合伙人约翰内斯·富斯特告他侵吞借款，最终败诉。古登堡晚年贫困，1468 年去世时默默无闻。'),
        Q('"印刷术改变了人类的思维方式。"', '麦克卢汉《理解媒介》'),
    ],
    'timeline': [
        {'year': 'AD 1450', 'era': '德意志', 'event': '**古登堡** 完成活字印刷机'},
        {'year': 'AD 1455', 'era': '德意志', 'event': '《**古登堡圣经**》印成'},
        {'year': 'AD 1500', 'era': '欧洲', 'event': '欧洲印书达 **1000 万册**'},
        {'year': 'AD 1517', 'era': '德意志', 'event': '路德《**九十五条论纲**》'},
        {'year': 'AD 2000', 'era': '当代', 'event': '纽约佳士得 **1100 万美元** 拍卖'},
    ],
    'images': [
        {'imageKeyword': 'gutenberg bible printed page', 'caption': '古登堡圣经书页', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'gutenberg printing press replica', 'caption': '古登堡印刷机（复制品）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'johann gutenberg portrait', 'caption': '古登堡肖像', 'credit': '公共领域'},
        {'imageKeyword': 'mainz cathedral medieval', 'caption': '美因茨大教堂（古登堡城市）', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'ce-012', 'title': '活字印刷', 'reason': '技术源头'},
        {'id': 'ce-029', 'title': '古登堡印刷机', 'reason': '配套发明'},
        {'id': 'p-gutenberg', 'title': '古登堡', 'reason': '发明者'},
        {'id': 'ce-023', 'title': '九十五条论纲', 'reason': '印刷推动宗教改革'},
    ],
    'source': '📚 Eisenstein《The Printing Press as an Agent of Change》、Ingram《The Gutenberg Revolution》',
}

# === ce-020 埃涅阿斯纪 ===
ENRICH['ce-020'] = {
    'facts': [
        {'label': '作者', 'value': '维吉尔（Publius Vergilius Maro）'},
        {'label': '年代', 'value': 'BC 29-19'},
        {'label': '体裁', 'value': '史诗（12 卷）'},
        {'label': '行数', 'value': '9896 行'},
        {'label': '主角', 'value': '埃涅阿斯（特洛伊英雄）'},
        {'label': '影响', 'value': '罗马文学的最高峰 / 西方史诗典范'},
    ],
    'sections': [
        P('创作背景', '维吉尔（BC 70-19），古罗马奥古斯都时期诗人，受**屋大维（奥古斯都）**委托创作《埃涅阿斯纪》，目的是**为屋大维家族追溯神性谱系**——将凯撒家族追溯到特洛伊王子埃涅阿斯。维吉尔至死未能定稿，要求焚毁但屋大维保留。'),
        P('史诗结构', '史诗模仿荷马史诗，分两部分：①前 6 卷模仿《奥德赛》——埃涅阿斯漂泊（特洛伊陷落→地中海漂泊→迦太基女王狄多→意大利）；②后 6 卷模仿《伊利亚特》——意大利战争。**全书 9896 行拉丁六拍诗**。'),
        C('罗马国族史诗', '《埃涅阿斯纪》是**罗马帝国的"国族史诗"**，塑造了罗马人"天命所归"的意识。**关键诗句"罗马人的帝国没有止境"（Tu regere imperio populos）** 成为罗马扩张的精神支柱。', 'success'),
        L('重要主题', ['**Pietas**（虔敬、责任）——主角核心美德', '**Fatum**（命运）——罗马帝国天命', '**Labor**（劳苦）——英雄必历劫', '**Imperium**（帝国）——无止境的统治']),
        P('但丁的导师', '但丁《神曲》中**维吉尔是向导**，带领诗人穿越地狱与炼狱（天堂由贝阿特丽切引导）。**这象征维吉尔是"人智的最高"**——哲学理性所能达到的极限。'),
        Q('"Fuimus fuimus, olim fuimus!"', '《埃涅阿斯纪》拉丁原文片段（拉丁语古典范本）'),
    ],
    'timeline': [
        {'year': 'BC 70', 'era': '罗马共和国', 'event': '维吉尔出生'},
        {'year': 'BC 39', 'era': '罗马共和国', 'event': '发表《**农事诗**》'},
        {'year': 'BC 29', 'era': '罗马帝国前夕', 'event': '开始创作《**埃涅阿斯纪**》'},
        {'year': 'BC 19', 'era': '罗马帝国前夕', 'event': '维吉尔去世，诗未终稿'},
        {'year': 'AD 1308', 'era': '中世纪', 'event': '**但丁**以维吉尔为《神曲》向导'},
    ],
    'images': [
        {'imageKeyword': 'virgil aeneid manuscript medieval', 'caption': '《埃涅阿斯纪》中世纪手抄本', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'aeneas carrying anchises troy', 'caption': '埃涅阿斯背负父亲（名画）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'virgil poet portrait classical', 'caption': '维吉尔古典肖像', 'credit': '公共领域'},
        {'imageKeyword': 'dante virgil inferno illustration', 'caption': '但丁与维吉尔（地狱篇插图）', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-virgil', 'title': '维吉尔', 'reason': '作者'},
        {'id': 'era-rome-empire', 'title': '罗马帝国', 'reason': '国族史诗'},
        {'id': 'ce-021', 'title': '神曲', 'reason': '维吉尔是但丁向导'},
        {'id': 'tr-history-art', 'title': '古典文学', 'reason': '西方史诗典范'},
    ],
    'source': '📚 维吉尔《埃涅阿斯纪》（杨周翰译本）、R. F. Anderson《The Art of the Aeneid》、Hardie《The Last Trojan Hero》',
}

