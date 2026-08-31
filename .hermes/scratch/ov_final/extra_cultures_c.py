# === ce-021 神曲 ===
ENRICH['ce-021'] = {
    'facts': [
        {'label': '作者', 'value': '但丁·阿利吉耶里'},
        {'label': '年代', 'value': 'AD 1308-1321'},
        {'label': '语种', 'value': '意大利语（托斯卡纳方言）'},
        {'label': '结构', 'value': '地狱、炼狱、天堂各 33 歌 + 序曲 1，共 100 歌'},
        {'label': '行数', 'value': '14233 行（三韵律）'},
        {'label': '意义', 'value': '意大利文艺复兴先声 / 世界文学巅峰'},
    ],
    'sections': [
        P('创作背景', '但丁（1265-1321），佛罗伦萨诗人、政治家。1302 年因党争被流放，终身未能归乡。流放期间他**以意大利语（而非拉丁语）创作《神曲》**，开创意大利文学语言——被誉为"意大利现代语言之父"。'),
        P('三界结构', '《神曲》虚构但丁在"人生中段"（35 岁）于黑暗森林迷路：①**地狱**（9 圈 33 歌）——按罪轻重惩罚；②**炼狱**（7 层 + 山顶伊甸园）——净化灵魂；③**天堂**（9 天 + 至高天）——与神合一。**全诗 14233 行三韵律诗**（aba bcb cdc ...）。'),
        C('意大利文学的奠基', '但丁选择**意大利方言**而非拉丁语写作，是文艺复兴最早的宣言。他确立了意大利民族语言，并**将神学、哲学、政治讽刺熔于一炉**——被认为预示文艺复兴的"人本主义"。', 'success'),
        L('三界结构', ['**地狱 9 圈**：淫欲→饕餮→贪婪→懒惰→愤怒→异端→暴力→欺诈→背叛', '**炼狱 7 层**：七大罪过逐层净化', '**天堂 9 天**：月球→水星→金星→太阳→火星→木星→土星→恒星天→水晶天', '**至高天**：神的光辉、贝阿特丽切显现']),
        P('政治寓意', '但丁将**佛罗伦萨政敌**（教皇博尼法八世等）置于地狱第八圈（欺诈），**自己的政治理想**（统一的世俗帝国）置于天堂最高层——**他用诗写出政治批判**。'),
        Q('"走过我，进入永恒之邦的人们，请把希望寄托在星辰之外。"', '但丁《神曲·地狱篇》铭文'),
    ],
    'timeline': [
        {'year': 'AD 1265', 'era': '中世纪', 'event': '但丁出生于佛罗伦萨'},
        {'year': 'AD 1302', 'era': '中世纪', 'event': '**但丁** 被流放'},
        {'year': 'AD 1308', 'era': '中世纪', 'event': '开始创作《**神曲**》'},
        {'year': 'AD 1321', 'era': '中世纪', 'event': '**但丁** 去世，《神曲》完稿'},
        {'year': 'AD 1865', 'era': '近代', 'event': '意大利建国，将但丁立为**国父**'},
    ],
    'images': [
        {'imageKeyword': 'dante alighieri portrait profile', 'caption': '但丁肖像', 'credit': '公共领域'},
        {'imageKeyword': 'dante inferno illustration botticelli', 'caption': '《神曲·地狱篇》插图（波提切利）', 'credit': 'Vatican Library'},
        {'imageKeyword': 'florence duomo renaissance skyline', 'caption': '佛罗伦萨大教堂（但丁之城）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'dante beatrice paradise meeting', 'caption': '但丁与贝阿特丽切（天堂篇）', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-dante', 'title': '但丁', 'reason': '作者'},
        {'id': 'ce-020', 'title': '埃涅阿斯纪', 'reason': '维吉尔在神曲中是向导'},
        {'id': 'era-renaissance', 'title': '文艺复兴', 'reason': '意大利文艺复兴先声'},
        {'id': 'tr-history-art', 'title': '欧洲文学', 'reason': '世界文学巅峰'},
    ],
    'source': '📚 但丁《神曲》（王维克/朱维基译本）、Singleton《Dante\'s Commedia》、Kirkpatrick《Dante》',
}

# === ce-022 莎士比亚全集 ===
ENRICH['ce-022'] = {
    'facts': [
        {'label': '作者', 'value': '威廉·莎士比亚'},
        {'label': '年代', 'value': '约 AD 1589-1613（创作期）'},
        {'label': '剧目数', 'value': '37 部戏剧 + 154 首十四行诗'},
        {'label': '剧种', 'value': '悲剧、喜剧、历史剧、悲喜剧'},
        {'label': '语种', 'value': '早期现代英语'},
        {'label': '影响', 'value': '英语文学最高成就 / 世界戏剧之父'},
    ],
    'sections': [
        P('作者生平', '莎士比亚（1564-1616），英国埃文河畔斯特拉特福人，父亲手套商人。他 18 岁娶大 8 岁女子为妻，育三子女。1580 年代赴伦敦，先做剧场杂役、马夫，后成为演员、剧作家、合伙人。他**39 部戏剧、154 首十四行诗**成为英语文学的基石。'),
        P('剧目概览', '莎翁剧目按四大类分：①**喜剧** 17 部（《仲夏夜之梦》《威尼斯商人》《第十二夜》《皆大欢喜》等）；②**悲剧** 11 部（《哈姆雷特》《奥赛罗》《麦克白》《李尔王》《罗密欧与朱丽叶》等）；③**历史剧** 10 部（《亨利五世》《理查三世》《约翰王》等）；④**悲喜剧/传奇剧**（《暴风雨》《冬天的故事》等）。'),
        C('作品的奇迹', '莎士比亚**一生未上大学**，却写出 4 千词汇（同时代英语仅 2 千词汇）。**全球每年上演他的剧作逾 5 万场**，《哈姆雷特》"生存还是毁灭"是**全球最著名的独白**。', 'success'),
        L('四大悲剧', ['**《哈姆雷特》**——生存还是毁灭', '**《奥赛罗》**——嫉妒的毁灭', '**《麦克白》**——权力的腐败', '**《李尔王》**——人性的崩塌']),
        P('第一对开本', '1623 年，莎翁去世 7 年后，他的剧团同事**赫明奇与康德尔**整理出版**《第一对开本》（First Folio）**，收录 36 部剧作——若非此书，**约 18 部莎剧可能失传**（包括《麦克白》《李尔王》《第十二夜》等）。'),
        Q('"To be or not to be, that is the question."', '莎士比亚《哈姆雷特》第三幕第一场'),
    ],
    'timeline': [
        {'year': 'AD 1564', 'era': '都铎', 'event': '莎士比亚出生'},
        {'year': 'AD 1589', 'era': '都铎', 'event': '开始**戏剧创作**（推测）'},
        {'year': 'AD 1601', 'era': '斯图亚特', 'event': '**《哈姆雷特》** 首演'},
        {'year': 'AD 1616', 'era': '斯图亚特', 'event': '**莎士比亚** 去世'},
        {'year': 'AD 1623', 'era': '斯图亚特', 'event': '**《第一对开本》** 出版'},
    ],
    'images': [
        {'imageKeyword': 'shakespeare portrait chandos', 'caption': '莎士比亚钱多斯肖像', 'credit': '公共领域'},
        {'imageKeyword': 'globe theatre london model', 'caption': '环球剧场（重建）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'shakespeare first folio book', 'caption': '《莎士比亚第一对开本》', 'credit': 'Folger Library'},
        {'imageKeyword': 'hamlet skull scene illustration', 'caption': '《哈姆雷特》"生存还是毁灭"', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-shakespeare', 'title': '莎士比亚', 'reason': '作者'},
        {'id': 'era-renaissance', 'title': '文艺复兴', 'reason': '创作背景'},
        {'id': 'tr-history-art', 'title': '欧洲文学', 'reason': '英语文学最高成就'},
        {'id': 'ce-021', 'title': '神曲', 'reason': '同时代欧洲文学'},
    ],
    'source': '📚 《莎士比亚全集》（朱生豪译本）、Greenblatt《Will in the World》、Schoenbaum《Shakespeare\'s Lives》',
}

# === ce-023 九十五条论纲 ===
ENRICH['ce-023'] = {
    'facts': [
        {'label': '作者', 'value': '马丁·路德'},
        {'label': '年代', 'value': 'AD 1517 年 10 月 31 日'},
        {'label': '发表地', 'value': '德国维滕堡'},
        {'label': '原文', 'value': '拉丁文'},
        {'label': '触发事件', 'value': '教廷发售"赎罪券"'},
        {'label': '意义', 'value': '欧洲宗教改革开端'},
    ],
    'sections': [
        P('背景', '16 世纪初，罗马教廷为修建圣彼得大教堂，**大规模发售"赎罪券"**（捐款可减免罪罚）。美因茨大主教**阿尔布莱希特**为偿债与教廷合谋，在德国发售赎罪券。这一敛财行为引发神学家**马丁·路德**愤怒。'),
        P('论纲内容', '1517 年 10 月 31 日，路德按神学论辩传统，将**《九十五条论纲》**钉在维滕堡教堂大门（后被传为传说，但来源是同时代信函）。论纲核心：①赎罪券无圣经依据；②悔改是内心而非金钱行为；③教宗权力不及上帝恩典。'),
        C('改革之火', '原本只是"学术辩论邀请"，却因**印刷术**（1455 年古登堡发明）使论纲 2 周内传遍德国、**2 个月**内传遍欧洲。教廷反击，路德拒不退让，**1521 年沃尔姆斯会议被宣判"异端"**——**欧洲宗教改革由此爆发**。', 'success'),
        L('五大唯独', ['**唯独圣经**（Sola Scriptura）', '**唯独恩典**（Sola Gratia）', '**唯独信心**（Sola Fide）', '**唯独基督**（Solus Christus）', '**唯独荣耀上帝**（Soli Deo Gloria）']),
        P('深远影响', '宗教改革导致欧洲**天主教、新教（路德宗、加尔文宗、英国国教）分裂**。**三十年战争**（1618-1648）使德国人口损失 1/3，**威斯特伐利亚和约**奠定现代民族国家体系。'),
        Q('"Here I stand, I can do no other."', '路德 1521 年沃尔姆斯会议答辩'),
    ],
    'timeline': [
        {'year': 'AD 1517', 'era': '德意志', 'event': '**路德** 发表《九十五条论纲》'},
        {'year': 'AD 1521', 'era': '神圣罗马', 'event': '**沃尔姆斯会议**判路德为异端'},
        {'year': 'AD 1525', 'era': '德意志', 'event': '**农民战争**（路德宗支持者）'},
        {'year': 'AD 1534', 'era': '英格兰', 'event': '亨利八世**脱离罗马教廷**'},
        {'year': 'AD 1648', 'era': '欧洲', 'event': '**威斯特伐利亚和约**'},
    ],
    'images': [
        {'imageKeyword': 'luther 95 theses door wittenberg', 'caption': '路德钉论纲（19 世纪绘画）', 'credit': '公共领域'},
        {'imageKeyword': 'martin luther portrait cranach', 'caption': '马丁·路德肖像（克拉纳赫画）', 'credit': '公共领域'},
        {'imageKeyword': 'worms diet 1521 luther', 'caption': '沃尔姆斯会议（19 世纪绘画）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'reformation church protestant service', 'caption': '新教礼拜', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-luther', 'title': '马丁·路德', 'reason': '作者'},
        {'id': 'ce-019', 'title': '古登堡圣经', 'reason': '印刷术推动改革传播'},
        {'id': 'tr-religion-christianity', 'title': '基督教史', 'reason': '天主教-新教分裂'},
        {'id': 'ce-026', 'title': '人权宣言', 'reason': '个人权利觉醒'},
    ],
    'source': '📚 路德《九十五条论纲》、MacCulloch《The Reformation》、Dixon《The Reformation in Germany》',
}

# === ce-024 牛顿自然哲学的数学原理 ===
ENRICH['ce-024'] = {
    'facts': [
        {'label': '作者', 'value': '艾萨克·牛顿'},
        {'label': '成书年代', 'value': 'AD 1687 年'},
        {'label': '原文', 'value': '拉丁文'},
        {'label': '原名', 'value': 'Philosophiae Naturalis Principia Mathematica'},
        {'label': '核心', 'value': '三大运动定律 + 万有引力'},
        {'label': '影响', 'value': '现代科学奠基之作'},
    ],
    'sections': [
        P('成书背景', '1665-1666 年伦敦瘟疫期间，剑桥大学关闭，**牛顿返乡**。他在这段"奇迹之年"奠定了微积分、光学、引力三大发现。20 年后的 1684 年，哈雷、雷恩、胡克讨论行星运动问题无法解决，哈雷求助牛顿。**牛顿很快寄去一篇论文，并开始撰写《原理》**——1687 年正式出版。'),
        P('三大运动定律', '①**惯性定律**：物体保持静止或匀速直线运动，除非受外力；②**加速度定律**：F = ma；③**作用反作用定律**：作用力与反作用力大小相等方向相反。'),
        C('万有引力', '《原理》提出**万有引力定律**：F = G·(m₁m₂/r²)。这一公式**统一了苹果落地和月亮绕地**——从地面物体到天体运动由同一公式描述。**这是人类认知宇宙的伟大时刻**。', 'success'),
        L('三大卷', ['卷 1：物体运动（不受阻力）', '卷 2：物体运动（在阻尼介质中）', '卷 3：宇宙体系（万有引力 + 行星运动）']),
        P('历史地位', '《原理》是**现代科学的奠基之作**。它将数学引入物理，建立了**因果可预测的世界观**。爱因斯坦相对论在 1905-1915 年扩展了牛顿力学（高速/强引力），但牛顿仍是日常世界的完美近似。'),
        Q('"Hypotheses non fingo."', '牛顿《原理》第三卷：不杜撰假说'),
    ],
    'timeline': [
        {'year': 'AD 1666', 'era': '科学革命', 'event': '**牛顿** 家乡"奇迹年"'},
        {'year': 'AD 1684', 'era': '科学革命', 'event': '**哈雷** 拜访牛顿'},
        {'year': 'AD 1687', 'era': '科学革命', 'event': '《**自然哲学的数学原理**》出版'},
        {'year': 'AD 1727', 'era': '科学革命', 'event': '**牛顿** 去世（享年 84 岁）'},
        {'year': 'AD 1905', 'era': '近代', 'event': '**爱因斯坦** 狭义相对论'},
    ],
    'images': [
        {'imageKeyword': 'newton principia title page', 'caption': '《原理》第一版扉页', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'newton isaac portrait', 'caption': '牛顿肖像', 'credit': '公共领域'},
        {'imageKeyword': 'apple tree newton', 'caption': '"苹果树"（牛顿花园）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'edmond halley comet portrait', 'caption': '哈雷（推动出版《原理》）', 'credit': '公共领域'},
    ],
    'related': [
        {'id': 'p-newton', 'title': '牛顿', 'reason': '作者'},
        {'id': 'p-halley', 'title': '哈雷', 'reason': '推动出版'},
        {'id': 'p-einstein', 'title': '爱因斯坦', 'reason': '扩展牛顿力学'},
        {'id': 'ce-025', 'title': '瓦特蒸汽机', 'reason': '科学革命应用'},
    ],
    'source': '📚 牛顿《自然哲学的数学原理》（王克迪译本）、Westfall《Never at Rest》、Cohen《Isaac Newton\'s Principia》',
}

# === ce-025 瓦特蒸汽机改良 ===
ENRICH['ce-025'] = {
    'facts': [
        {'label': '改良者', 'value': '詹姆斯·瓦特'},
        {'label': '年代', 'value': 'AD 1769 年（专利）'},
        {'label': '原始发明', 'value': '纽科门蒸汽机（1712）'},
        {'label': '核心创新', 'value': '独立冷凝器 + 双向作用 + 行星齿轮'},
        {'label': '意义', 'value': '工业革命核心动力'},
        {'label': '效率提升', 'value': '约 4 倍于纽科门机'},
    ],
    'sections': [
        P('改良背景', '蒸汽机并非瓦特发明——英国铁匠**托马斯·纽科门** 1712 年已造出实用蒸汽机，但效率极低（约 0.5%），只用于矿井抽水。1763 年，**格拉斯哥大学仪器修理工瓦特**受委托修理纽科门机模型，发现其 80% 蒸汽浪费在反复加热/冷却汽缸上。'),
        P('关键创新', '瓦特用了 10 年（1763-1776）逐步完善：①**独立冷凝器**（1769 专利）——蒸汽在汽缸外的冷凝器冷凝；②**双向作用**（1782）——活塞上下都做功；④**行星齿轮**（1781）——将往复运动转为旋转运动，使蒸汽机**驱动任何旋转机械**。'),
        C('工业革命的引擎', '改良后的蒸汽机效率提升 4 倍，**可用于驱动纺纱机、织布机、机床、轮船、火车**。1784 年瓦特机专利到期后迅速普及，**1800 年英国 1/5 工业动力来自蒸汽**。**这是"工业革命"的核心技术**，人类进入化石能源时代。', 'success'),
        L('应用领域', ['**纺织机械**——蒸汽纺纱机、织布机', '**交通**——汽船（富尔顿 1807）、火车（斯蒂芬森 1825）', '**冶金**——蒸汽鼓风机', '**采矿**——蒸汽抽水机', '**制造**——机床、磨坊']),
        P('瓦特单位', '为纪念瓦特，**国际单位制**以"瓦特"（W）命名功率单位——每秒 1 焦耳的能量转换即 1 瓦特。'),
        Q('"蒸汽机把人类从体力劳动中解放出来。"', '恩格斯《英国工人阶级状况》'),
    ],
    'timeline': [
        {'year': 'AD 1712', 'era': '英国', 'event': '**纽科门** 蒸汽机'},
        {'year': 'AD 1763', 'era': '英国', 'event': '**瓦特** 受命修理纽科门机'},
        {'year': 'AD 1769', 'era': '英国', 'event': '瓦特获得**冷凝器专利**'},
        {'year': 'AD 1782', 'era': '英国', 'event': '瓦特**双向作用**专利'},
        {'year': 'AD 1825', 'era': '英国', 'event': '**斯蒂芬森** 蒸汽机车'),
    ],
    'images': [
        {'imageKeyword': 'watt steam engine industrial', 'caption': '瓦特蒸汽机', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'james watt portrait industrial revolution', 'caption': '詹姆斯·瓦特肖像', 'credit': '公共领域'},
        {'imageKeyword': 'newcomen steam engine beam', 'caption': '纽科门蒸汽机', 'credit': '公共领域'},
        {'imageKeyword': 'industrial revolution factory 19th century', 'caption': '19 世纪蒸汽工厂', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-watt', 'title': '瓦特', 'reason': '改良者'},
        {'id': 'p-stephenson', 'title': '斯蒂芬森', 'reason': '蒸汽机车发明者'},
        {'id': 'ce-024', 'title': '牛顿原理', 'reason': '奠定热力学基础'},
        {'id': 'tr-history-intro', 'title': '工业革命', 'reason': '工业革命核心'},
    ],
    'source': '📚 卡伦布尔《瓦特蒸汽机》、Mokyr《The Enlightened Economy》、坎贝尔《The Coming of the Steam Age》',
}

# === ce-026 人权宣言 ===
ENRICH['ce-026'] = {
    'facts': [
        {'label': '通过年代', 'value': 'AD 1789 年 8 月 26 日'},
        {'label': '发布机构', 'value': '法国国民议会'},
        {'label': '条款数', 'value': '17 条'},
        {'label': '背景', 'value': '法国大革命'},
        {'label': '核心', 'value': '自由、平等、财产权、主权在民'},
        {'label': '影响', 'value': '现代人权思想奠基文件'},
    ],
    'sections': [
        P('背景', '1789 年 5 月，路易十六召开**三级会议**，第三等级（平民）与特权阶级冲突激化，国民议会宣告成立。7 月 14 日**攻陷巴士底狱**。8 月，国民议会通过**《人权与公民权宣言》**，简称为《人权宣言》。'),
        P('核心内容', '①人生而平等（**第 1 条**）；②主权在民（**第 3 条**）；③自由、财产、安全、反抗压迫是**自然权利**（**第 2 条**）；④法律面前人人平等；⑤言论自由、信仰自由；⑥财产权"神圣不可侵犯"。**它系统阐述了现代公民权利概念**。'),
        C('现代人权之母', '《人权宣言》是**人类历史上第一个系统的现代人权文件**。它直接启发了**美国《权利法案》**（1791）和**联合国《世界人权宣言》**（1948）。**"自由、平等、博爱"** 的口号从此传遍世界。', 'success'),
        L('关键条款', ['**第 1 条**：人生而自由、平等', '**第 2 条**：自然权利——自由、财产、安全、反抗压迫', '**第 3 条**：主权在民', '**第 4 条**：自由即有权做不害他人的事', '**第 6 条**：法律面前人人平等', '**第 17 条**：财产权神圣不可侵犯']),
        P('女性主义批评', '宣言第 1 条"人生而平等"，但**妇女**当时无权投票。1791 年**奥兰普·德古热**发表**《妇女权利宣言》**，尖锐批评："妇女生来就有和男人一样的权利。"——这是女权运动的奠基文本。'),
        Q('"Men are born and remain free and equal in rights."', '《人权宣言》第一句'),
    ],
    'timeline': [
        {'year': 'AD 1789.5', 'era': '法国大革命', 'event': '路易十六召开**三级会议**'},
        {'year': 'AD 1789.7.14', 'era': '法国大革命', 'event': '**攻陷巴士底狱**'},
        {'year': 'AD 1789.8.26', 'era': '法国大革命', 'event': '**《人权宣言》** 通过'},
        {'year': 'AD 1791', 'era': '法国', 'event': '奥兰普·德古热《**妇女权利宣言**》'},
        {'year': 'AD 1948', 'era': '联合国', 'event': '**《世界人权宣言》** 通过'},
    ],
    'images': [
        {'imageKeyword': 'declaration of rights of man 1789', 'caption': '《人权宣言》原本', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'storming bastille 1789 painting', 'caption': '攻陷巴士底狱', 'credit': '公共领域'},
        {'imageKeyword': 'olympe de gouges portrait', 'caption': '奥兰普·德古热', 'credit': '公共领域'},
        {'imageKeyword': 'french national assembly meeting', 'caption': '法国国民议会会议', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-lafayette', 'title': '拉法耶特', 'reason': '主要起草人之一'},
        {'id': 'p-jefferson', 'title': '杰斐逊', 'reason': '美国独立宣言也借鉴了它'},
        {'id': 'ce-023', 'title': '九十五条论纲', 'reason': '个人权利觉醒'},
        {'id': 'tr-history-intro', 'title': '启蒙运动', 'reason': '理性主义果实'},
    ],
    'source': '📚 《人权宣言》（法国国民议会）、Hunt《Inventing Human Rights》、肖厚国《〈人权宣言〉译注》',
}

# === ce-027 希腊字母表 ===
ENRICH['ce-027'] = {
    'facts': [
        {'label': '形成年代', 'value': '约 BC 800-700'},
        {'label': '地区', 'value': '希腊'},
        {'label': '字母数', 'value': '24 个'},
        {'label': '源头', 'value': '腓尼基字母'},
        {'label': '贡献', 'value': '首次出现元音字母'},
        {'label': '影响', 'value': '拉丁字母、斯拉夫字母的源头'},
    ],
    'sections': [
        P('字母起源', '腓尼基人（地中海东岸的航海民族）发明了**22 个辅音字母**（无元音），用于商业记账。约 BC 800-700 年，希腊人借用了这套字母，并**首创元音字母**（A、E、I、O、U）——**这是人类文字史的重大突破**。'),
        P('字母特点', '希腊字母**24 个**：包括 7 个元音和 17 个辅音。它按**发音部位**系统排列（唇音、舌音、齿音、喉音），**结构清晰、便于学习**。希腊字母还有**大小写两套**（大写多用于铭文，小写多用于抄本）。'),
        C('字母之母', '希腊字母是**拉丁字母的源头**——罗马借希腊字母创造拉丁字母，再演化出西方所有字母。**斯拉夫字母**（西里尔）也由希腊字母改造。**今天全球 30+ 种字母都源于希腊字母**。', 'success'),
        L('元音创造', ['**Α α**（a）— 来自腓尼基 aleph（牛）', '**Ε ε**（e）— 来自 heh（窗）', '**Ι ι**（i）— 来自 yod（手）', '**Ο ο**（o）— 来自 ayin（眼）', '**Υ υ**（u）— 来自 vav（钩）']),
        P('学术语言', '希腊字母至今仍是**数学、物理、天文等学科的通用符号**：π（圆周率）、Ω（电阻）、Φ（磁通）、Σ（求和）、Δ（变化量）。**这显示了希腊字母在西方知识体系中的核心地位**。'),
        Q('"ABC..."...希腊字母 Άλφα Βήτα Γάμμα...', '希腊字母诵读顺序（西方"ABC"的源头）'),
    ],
    'timeline': [
        {'year': 'BC 1050', 'era': '腓尼基', 'event': '**腓尼基字母** 形成'},
        {'year': 'BC 800', 'era': '希腊', 'event': '希腊借用**辅音字母**'},
        {'year': 'BC 730', 'era': '希腊', 'event': '添加**元音字母**'},
        {'year': 'BC 700', 'era': '希腊', 'event': '**希腊字母表** 成熟'},
        {'year': 'BC 600', 'era': '意大利', 'event': '**拉丁字母** 借自希腊'},
    ],
    'images': [
        {'imageKeyword': 'greek alphabet ancient inscription', 'caption': '希腊字母铭文', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'phoenician alphabet tablet', 'caption': '腓尼基字母表', 'credit': '公共领域'},
        {'imageKeyword': 'greek alphabet letters chart', 'caption': '希腊字母对照表', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'classical greek marble inscription', 'caption': '古典希腊铭文', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'era-ancient-greece', 'title': '古希腊', 'reason': '字母创造者'},
        {'id': 'tr-script-natural', 'title': '字母文字', 'reason': '元音字母创新'},
        {'id': 'ce-001', 'title': '甲骨文', 'reason': '对比东西方文字起源'},
        {'id': 'ce-034', 'title': '汉字统一', 'reason': '对比中文发展路径'},
    ],
    'source': '📚 Powell《Greek Alphabet》、Jeffery《The Local Scripts of Archaic Greece》、赫尔德《希腊字母史》',
}

# === ce-028 汉谟拉比法典石刻 ===
ENRICH['ce-028'] = {
    'facts': [
        {'label': '年代', 'value': '约 BC 1750 年'},
        {'label': '载体', 'value': '黑色玄武岩石柱'},
        {'label': '高度', 'value': '2.25 米'},
        {'label': '发现', 'value': 'AD 1901 年（法国考古队）'},
        {'label': '发现地', 'value': '伊朗苏萨（Susa）'},
        {'label': '现藏', 'value': '巴黎卢浮宫'},
    ],
    'sections': [
        P('石柱描述', '汉谟拉比法典石柱由**整块黑色玄武岩**雕成，高 2.25 米，圆周 1.65 米。柱顶浮雕为**太阳神沙马什**将权杖授予国王汉谟拉比的场景，象征"君权神授"。柱身刻有阿卡德语楔形文字，**约 8000 个字符**——前言、正文 282 条、结语。'),
        P('流散历史', '石柱原本立在**西巴尔（Sippar）**太阳神庙。BC 1595 年赫梯入侵巴比伦，石柱被掠。**BC 1158 年埃兰国王**攻陷巴比伦，将石柱作为战利品运至苏撒。**苏撒被毁后石柱被埋地下**。1901 年法国考古队**雅克·德·摩根**发现并运回巴黎。'),
        C('出土意义', '石柱出土是**20 世纪最重要的考古发现之一**。它使**亚述学**成为现代学科，**楔形文字**被系统破译（19 世纪中叶）。此前美索不达米亚文明主要靠圣经传说认知——**石柱实证了《圣经》之外的真实历史**。', 'success'),
        L('石柱层次', ['顶部浮雕：沙马什授法', '前言：汉谟拉比自我颂扬', '正文 282 条：法律条文', '结语：汉谟拉比告诫后王']),
        P('收藏争议', '石柱自 1901 年起一直在**卢浮宫**，伊拉克政府多次要求归还未果——这是**文物归还运动**的典型案例。'),
        Q('"使正义照耀大地，消灭邪恶之徒。"', '汉谟拉比法典前言'),
    ],
    'timeline': [
        {'year': 'BC 1750', 'era': '古巴比伦', 'event': '石柱刻成立于**西巴尔**'},
        {'year': 'BC 1595', 'era': '赫梯入侵', 'event': '巴比伦陷落'},
        {'year': 'BC 1158', 'era': '埃兰', 'event': '石柱被掠至**苏萨**'},
        {'year': 'AD 1901', 'era': '近代', 'event': '**法国考古队** 发现'},
        {'year': 'AD 1903', 'era': '近代', 'event': '石柱入藏**卢浮宫**'},
    ],
    'images': [
        {'imageKeyword': 'hammurabi stele full height louvre', 'caption': '汉谟拉比法典石柱（卢浮宫）', 'credit': 'Louvre'},
        {'imageKeyword': 'shamash hammurabi relief top', 'caption': '沙马什授法浮雕', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'susa ancient ruins persia', 'caption': '苏萨遗址', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'cuneiform tablet close up', 'caption': '楔形文字细节', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'ce-002', 'title': '汉谟拉比法典', 'reason': '同一法典不同描述'},
        {'id': 'era-old-babylonian', 'title': '古巴比伦', 'reason': '法典所属王朝'},
        {'id': 'era-mesopotamia', 'title': '美索不达米亚', 'reason': '两河文明'},
        {'id': 'ce-005', 'title': '罗马十二铜表法', 'reason': '比较早期成文法'},
    ],
    'source': '📚 Harper《The Code of Hammurabi》、Roth《Law Collections from Mesopotamia》、Lloyd《The Archaeology of Mesopotamia》',
}

# === ce-029 古登堡印刷机 ===
ENRICH['ce-029'] = {
    'facts': [
        {'label': '发明者', 'value': '约翰内斯·古登堡'},
        {'label': '年代', 'value': '约 AD 1440-1450'},
        {'label': '地点', 'value': '德国美因茨'},
        {'label': '核心技术', 'value': '金属活字 + 螺旋压印机 + 油性墨'},
        {'label': '首批产品', 'value': '《古登堡圣经》（AD 1455）'},
        {'label': '意义', 'value': '现代印刷工业的开端'},
    ],
    'sections': [
        P('发明背景', '15 世纪欧洲抄书效率极低（每本《圣经》需 170 张羊皮纸，抄写 1 年）。**1450 年前后**，德国美因茨金匠**约翰内斯·古登堡**（约 1398-1468）结合三项已知技术发明**金属活字印刷机**：①金属合金活字（铸字）；②**螺旋压印机**（借用葡萄酒压榨机原理）；③**油性油墨**（亚麻仁油调和）。'),
        P('技术细节', '古登堡的金属活字由**铅、锡、锑合金**铸造（每字一印），活字固定在木板上，涂油墨，覆纸，转动螺旋压印。每个零件都经过精密切算，使**每小时可印 250 张**——是手抄的 50 倍。'),
        C('传播之快', '古登堡机发明后，**15 世纪末欧洲已有 250 多家印刷所**，出版了 **2000 万册**书籍。**1492 年哥伦布航行所携地图、《九十五条论纲》（1517）、《天体运行论》（1543）** 都通过印刷传播。**这是信息革命的开端**。', 'success'),
        L('三项创新', ['**金属合金活字**（铅+锡+锑+铜）', '**螺旋压印机**（葡萄酒压榨机原理）', '**油性油墨**（亚麻仁油）', '**可调整字模**（matrix）']),
        P('经济后果', '印刷机使**书籍价格暴跌 80%**：手抄本 200 古登堡→印刷本 5 古登堡。**识字率上升**，中世纪大学教材广泛流传，**推动了文艺复兴、宗教改革、启蒙运动**——**从根本上改变了人类社会**。'),
        Q('"印刷术是文艺复兴最重要的工具。"', '伊丽莎白·爱森斯坦《作为变革动因的印刷机》'),
    ],
    'timeline': [
        {'year': 'AD 1440', 'era': '德意志', 'event': '**古登堡** 开始实验'},
        {'year': 'AD 1450', 'era': '德意志', 'event': '印刷机技术成熟'},
        {'year': 'AD 1455', 'era': '德意志', 'event': '《**古登堡圣经**》印成'},
        {'year': 'AD 1500', 'era': '欧洲', 'event': '欧洲印书达 **1000 万册**'},
        {'year': 'AD 1810', 'era': '英国', 'event': '**蒸汽印刷机** 出现'},
    ],
    'images': [
        {'imageKeyword': 'gutenberg press replica mechanical', 'caption': '古登堡印刷机复制品', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'metal movable type blocks letters', 'caption': '金属活字', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'old printing shop medieval', 'caption': '中世纪印刷工坊', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'oil based printing ink historical', 'caption': '古代油性印刷墨', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'ce-019', 'title': '古登堡圣经', 'reason': '印刷机首批产品'},
        {'id': 'ce-012', 'title': '活字印刷', 'reason': '中国活字先驱'},
        {'id': 'p-gutenberg', 'title': '古登堡', 'reason': '发明者'},
        {'id': 'ce-023', 'title': '九十五条论纲', 'reason': '印刷推动改革'},
    ],
    'source': '📚 Eisenstein《The Printing Press as an Agent of Change》、Ingram《The Gutenberg Revolution》、Pettegree《The Book in the Renaissance》',
}

# === ce-030 印度教形成 ===
ENRICH['ce-030'] = {
    'facts': [
        {'label': '形成年代', 'value': '约 BC 1500-500'},
        {'label': '地区', 'value': '印度次大陆'},
        {'label': '核心经典', 'value': '《吠陀》《奥义书》《薄伽梵歌》'},
        {'label': '核心教义', 'value': '梵我一如、轮回解脱'},
        {'label': '主要神祇', 'value': '梵天、毗湿奴、湿婆'},
        {'label': '信徒', 'value': '约 12 亿（全球第三大宗教）'},
    ],
    'sections': [
        P('起源', '印度教（Hinduism）并非某个创始人建立的宗教，而是**印度次大陆原住民宗教传统的延续与演变**。约 BC 1500 年雅利安人进入印度，带来《吠陀》经典；与本土达罗毗荼人信仰融合，逐步演变为印度教。'),
        P('经典体系', '印度教经典分四部分：①**《吠陀本集》**（Vedas）—— 颂神诗集；②**《梵书》**（Brahmanas）——祭祀仪式；③**《森林书》**（Aranyakas）；④**《奥义书》**（Upanishads）——哲学核心；⑤**《薄伽梵歌》**——史诗《摩诃婆罗多》核心。'),
        C('印度文明的核心', '印度教不只是宗教，更是**印度文明的底层操作系统**：种姓制度、瑜伽、苦行、节庆（如排灯节 Diwali）、婚姻习俗都源于此。**它不像其他宗教有明确创始人**，所以有人称之为"**印度教生活方式**"。', 'success'),
        L('三大主神', ['**梵天**（Brahma）——创造之神', '**毗湿奴**（Vishnu）——保护之神', '**湿婆**（Shiva）——毁灭与重生']),
        P('佛教的母体', '佛教、耆那教都源于印度教传统（公元前 6 世纪"沙门思潮"）。**佛教兴起后，印度教吸收佛教元素（如菩萨、舍利塔）继续发展**。'),
        Q('"Tat tvam asi."（你是那。）', '《奥义书》——梵我一如'),
    ],
    'timeline': [
        {'year': 'BC 1500', 'era': '吠陀期', 'event': '**雅利安人**入印，吠陀形成'},
        {'year': 'BC 900', 'era': '梵书期', 'event': '祭祀仪式制度化'},
        {'year': 'BC 600', 'era': '奥义书期', 'event': '《**奥义书**》哲学反思'},
        {'year': 'BC 400', 'era': '史诗期', 'event': '《**薄伽梵歌**》编入《摩诃婆罗多》'},
        {'year': 'AD 800', 'era': '中世纪', 'event': '**商羯罗** 改革印度教'},
    ],
    'images': [
        {'imageKeyword': 'hindu temple ornate sculpture', 'caption': '印度教神庙雕刻', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'shiva nataraja bronze statue', 'caption': '湿婆舞蹈之王（铜像）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'ganges river varanasi ghats', 'caption': '恒河瓦拉纳西', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'om symbol sanskrit hindu', 'caption': '"唵"（Om）——印度教象征', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'ce-031', 'title': '佛教创立', 'reason': '源于印度教'},
        {'id': 'tr-religion-hinduism', 'title': '印度教传统', 'reason': '印度教历史'},
        {'id': 'era-ancient-india', 'title': '古印度', 'reason': '文明所在'},
        {'id': 'tr-myth-shiva', 'title': '湿婆神话', 'reason': '三大主神'},
    ],
    'source': '📚 Flood《An Introduction to Hinduism》、Doniger《The Hindus: An Alternative History》、Radhakrishnan《Indian Philosophy》',
}

